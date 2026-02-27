import { SupabaseClient } from "@supabase/supabase-js";
import {
  PrecheckStatus,
  PrecheckResponseSource,
  EligibilityDecision,
  AuditEventType,
  AuditEntityType,
} from "~/lib/shared/enums";
import { computeEligibility } from "~/lib/engine/eligibility";
import { fetchPropertyData } from "~/lib/data-sources";
import { loadSystemConfig, type SystemConfig } from "~/lib/config/system-config";
import { logAuditEvent } from "./audit.service";
import type { PrecheckRequest } from "~/lib/schemas/precheck.schema";

export interface PrecheckRow {
  id: string;
  user_id: string;
  property_id: string;
  decision: string;
  confidence: number;
  factors: string[];
  metrics: Record<string, unknown>;
  metadata: Record<string, unknown> | null;
  confirmed_by_user: boolean;
  created_at: string;
}

interface PrecheckResult {
  source: PrecheckResponseSource;
  precheck: PrecheckRow;
}

export class PrecheckService {
  constructor(private supabase: SupabaseClient) {}

  async execute(
    userId: string,
    request: PrecheckRequest,
    ip?: string,
    userAgent?: string
  ): Promise<PrecheckResult> {
    const config = await loadSystemConfig(this.supabase);

    // Step 1: Validate address score gate
    if (
      request.address_quality_score < config.ADDRESS_SCORE_MODAL_THRESHOLD &&
      !request.confirmed_by_user
    ) {
      throw new PrecheckValidationError(
        "Address quality score below threshold. User confirmation required."
      );
    }

    // Step 2: Check cache (same user + place_id + same day ET)
    const cached = await this.checkCache(userId, request.place_id);
    if (cached) {
      return { source: PrecheckResponseSource.CACHE, precheck: cached };
    }

    // Step 3: Check daily limit (skip in local dev for testing)
    if (process.env.NODE_ENV !== "development") {
      await this.checkDailyLimit(userId, config.FREE_DAILY_LIMIT);
    }

    // Step 4: Upsert property
    const propertyId = await this.upsertProperty(request);

    // Step 5: Fetch data from sources
    const dataResult = await this.fetchWithBudget(request, config);

    // Step 6: Get active rule pack
    const rulePack = await this.getActiveRulePack();

    // Step 7: Compute eligibility
    const assessedValue = dataResult.property.assessed_value ?? 0;
    const analysis = computeEligibility({
      assessed_value: assessedValue,
      comps: dataResult.comps,
      address_quality_score: request.address_quality_score,
      has_property_data_conflict: false,
      rule_config: rulePack.rules_json,
    });

    // Step 8: Map decision
    const decision =
      analysis.decision === EligibilityDecision.ELIGIBLE
        ? PrecheckStatus.ELIGIBLE
        : PrecheckStatus.NOT_ELIGIBLE;

    // Step 9: snapshot_config
    const snapshotConfig = {
      rule_pack_id: rulePack.id,
      rule_pack_version: rulePack.version,
      min_comps: rulePack.rules_json.min_comps,
      min_lower_comps: rulePack.rules_json.min_lower_comps,
      outlier_low_factor: rulePack.rules_json.outlier_low_factor,
      outlier_high_factor: rulePack.rules_json.outlier_high_factor,
      max_comp_age_months: rulePack.rules_json.max_comp_age_months,
    };

    // Step 10: Insert precheck
    const { data: precheck, error } = await this.supabase
      .from("prechecks")
      .insert({
        user_id: userId,
        property_id: propertyId,
        decision,
        confidence: analysis.confidence,
        factors: analysis.factors,
        metrics: analysis.metrics,
        snapshot_config: snapshotConfig,
        rule_pack_id: rulePack.id,
        metadata: {
          data_source: dataResult.source,
          comps_raw_count: dataResult.comps.length,
          comps: dataResult.comps,
          property_data: dataResult.property,
        },
        confirmed_by_user: request.confirmed_by_user,
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to create precheck: ${error.message}`);
    }

    // Step 11: Audit log
    logAuditEvent(this.supabase, {
      user_id: userId,
      event_type: AuditEventType.PRECHECK_CREATED,
      entity_type: AuditEntityType.PRECHECK,
      entity_id: precheck.id,
      ip,
      user_agent: userAgent,
    });

    return { source: PrecheckResponseSource.LIVE, precheck };
  }

  private async checkCache(userId: string, placeId: string): Promise<PrecheckRow | null> {
    const etDate = getEasternDate();
    const dayStart = `${etDate}T00:00:00`;
    const dayEnd = `${etDate}T23:59:59`;

    const { data, error } = await this.supabase
      .from("prechecks")
      .select("*, properties!inner(place_id)")
      .eq("user_id", userId)
      .eq("properties.place_id", placeId)
      .gte("created_at", dayStart)
      .lte("created_at", dayEnd)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) return null;
    const { properties, ...precheck } = data[0] as any;
    return precheck;
  }

  private async checkDailyLimit(userId: string, limit: number): Promise<void> {
    const etDate = getEasternDate();
    const { count, error } = await this.supabase
      .from("prechecks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", `${etDate}T00:00:00`)
      .lte("created_at", `${etDate}T23:59:59`);

    if (error) throw new Error(`Failed to check daily limit: ${error.message}`);
    if ((count ?? 0) >= limit) throw new DailyLimitExceededError(limit);
  }

  private async upsertProperty(request: PrecheckRequest): Promise<string> {
    const { data: existing } = await this.supabase
      .from("properties")
      .select("id")
      .eq("place_id", request.place_id)
      .limit(1)
      .single();

    if (existing) return existing.id;

    const { data: created, error } = await this.supabase
      .from("properties")
      .insert({
        formatted_address: request.formatted_address,
        street_number: request.street_number ?? null,
        route: request.route ?? null,
        locality: request.locality ?? null,
        postal_code: request.postal_code ?? null,
        country: request.country ?? null,
        unit_number: request.unit_number ?? null,
        place_id: request.place_id,
        lat: request.lat,
        lng: request.lng,
        address_quality_score: request.address_quality_score,
      })
      .select("id")
      .single();

    if (error) throw new Error(`Failed to create property: ${error.message}`);
    return created.id;
  }

  private async fetchWithBudget(request: PrecheckRequest, config: SystemConfig) {
    return Promise.race([
      fetchPropertyData({
        lat: request.lat,
        lng: request.lng,
        formatted_address: request.formatted_address,
        timeoutMs: config.RENTCAST_TIMEOUT_MS ?? config.ATTOM_TIMEOUT_MS,
        attomTimeoutMs: config.ATTOM_TIMEOUT_MS,
        propapisTimeoutMs: config.PROPAPIS_TIMEOUT_MS,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Precheck total budget exceeded")), config.PRECHECK_TOTAL_BUDGET_MS)
      ),
    ]);
  }

  private async getActiveRulePack() {
    const { data, error } = await this.supabase
      .from("rule_packs")
      .select("id, version, rules_json")
      .eq("published", true)
      .order("version", { ascending: false })
      .limit(1)
      .single();
    if (error || !data) throw new Error("No published rule pack found");
    return data;
  }
}

function getEasternDate(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}

export class PrecheckValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PrecheckValidationError";
  }
}

export class DailyLimitExceededError extends Error {
  constructor(public limit: number) {
    super(`Daily precheck limit of ${limit} exceeded`);
    this.name = "DailyLimitExceededError";
  }
}
