import { SupabaseClient } from "@supabase/supabase-js";
import {
  OrderStatus,
  AuditEventType,
  AuditEntityType,
  ENGINE_VERSION,
  TEMPLATE_VERSION,
  PDF_VERSION,
  DEFAULT_DISCLAIMER_VERSION,
  EligibilityDecision,
} from "~/lib/shared/enums";
import { buildSnapshotLegal } from "~/lib/shared/disclaimers";
import { generateRecommendation } from "~/lib/engine/recommendation";
import { sortComps } from "~/lib/engine/eligibility";
import { OrderService } from "./order.service";
import { logAuditEvent } from "./audit.service";
import { loadConfigValue } from "~/lib/config/system-config";
import type { ReportSnapshot } from "~/lib/schemas/report.schema";

export class ReportService {
  private orderService: OrderService;

  constructor(private supabase: SupabaseClient) {
    this.orderService = new OrderService(supabase);
  }

  async generate(orderId: string): Promise<{ reportId: string }> {
    // PRD §13 Rule 9: Acquire row-level lock before processing
    const { data: lockedOrder, error: lockError } = await this.supabase
      .rpc("lock_order_for_processing", { p_order_id: orderId })
      .single();

    if (lockError || !lockedOrder) {
      throw new Error(`Failed to acquire lock for order ${orderId}: ${lockError?.message ?? "not found"}`);
    }

    const order = lockedOrder as import("./order.service").OrderRow;

    if (order.status !== OrderStatus.PAID && order.status !== OrderStatus.FAILED) {
      throw new Error(`Cannot generate report for order in ${order.status} status`);
    }

    // Transition to PROCESSING (only lock owner proceeds)
    if (order.status === OrderStatus.PAID) {
      await this.orderService.transition(orderId, OrderStatus.PAID, OrderStatus.PROCESSING);
    } else {
      await this.orderService.transition(orderId, OrderStatus.FAILED, OrderStatus.PROCESSING);
    }

    let report = await this.getOrCreateReport(order);

    logAuditEvent(this.supabase, {
      user_id: order.user_id,
      event_type: AuditEventType.REPORT_GENERATION_STARTED,
      entity_type: AuditEntityType.REPORT,
      entity_id: report.id,
    });

    try {
      const maxManual = await loadConfigValue(this.supabase, "REPORT_MAX_MANUAL_RETRIES");
      if (report.attempt_count >= maxManual) {
        throw new Error(`Max retry attempts (${maxManual}) reached for report ${report.id}`);
      }

      await this.supabase
        .from("reports")
        .update({ attempt_count: report.attempt_count + 1 })
        .eq("id", report.id);

      const snapshot = await this.buildSnapshot(order, report.id);

      await this.supabase
        .from("reports")
        .update({ content_snapshot: snapshot })
        .eq("id", report.id);

      const pdfUrl = await this.generatePdf(report.id, snapshot);

      await this.supabase
        .from("reports")
        .update({ pdf_url: pdfUrl, generated_at: new Date().toISOString() })
        .eq("id", report.id);

      await this.orderService.transition(orderId, OrderStatus.PROCESSING, OrderStatus.COMPLETED);

      logAuditEvent(this.supabase, {
        user_id: order.user_id,
        event_type: AuditEventType.REPORT_GENERATED,
        entity_type: AuditEntityType.REPORT,
        entity_id: report.id,
      });

      return { reportId: report.id };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      await this.supabase.from("reports").update({ last_error: message }).eq("id", report.id);
      await this.orderService.transition(orderId, OrderStatus.PROCESSING, OrderStatus.FAILED);

      logAuditEvent(this.supabase, {
        user_id: order.user_id,
        event_type: AuditEventType.REPORT_GENERATION_FAILED,
        entity_type: AuditEntityType.REPORT,
        entity_id: report.id,
      });

      throw error;
    }
  }

  private async getOrCreateReport(order: { id: string; user_id: string }) {
    const { data: existing } = await this.supabase
      .from("reports")
      .select("*")
      .eq("order_id", order.id)
      .single();

    if (existing) return existing as ReportRow;

    const { data: created, error } = await this.supabase
      .from("reports")
      .insert({
        order_id: order.id,
        user_id: order.user_id,
        template_version: TEMPLATE_VERSION,
        engine_version: ENGINE_VERSION,
      })
      .select("*")
      .single();

    if (error) throw new Error(`Failed to create report: ${error.message}`);
    return created as ReportRow;
  }

  private async buildSnapshot(
    order: { id: string; user_id: string; precheck_id: string; legal_accepted_at: string; disclaimer_version: string },
    reportId: string
  ): Promise<ReportSnapshot> {
    const { data: precheck, error: pErr } = await this.supabase
      .from("prechecks")
      .select("*, properties(*)")
      .eq("id", order.precheck_id)
      .single();

    if (pErr || !precheck) throw new Error(`Precheck not found: ${order.precheck_id}`);

    const property = (precheck as any).properties;
    const metadata = (precheck.metadata as Record<string, unknown>) ?? {};
    const propertyData = (metadata.property_data ?? {}) as Record<string, unknown>;
    const rawComps = (metadata.comps ?? []) as any[];
    const dataSource = (metadata.data_source ?? "attom") as string;
    const metrics = precheck.metrics as Record<string, unknown>;

    const sortedComps = sortComps(rawComps);
    const county = (propertyData.county as string) ?? "Unknown";

    const recommendation = generateRecommendation({
      decision: precheck.decision === "ELIGIBLE" ? EligibilityDecision.ELIGIBLE : EligibilityDecision.NOT_ELIGIBLE,
      assessed_value: (metrics.assessed_value as number) ?? 0,
      comps_used_count: (metrics.comps_used_count as number) ?? 0,
      comps_lower_count: (metrics.comps_lower_count as number) ?? 0,
      comps_lower_ratio: (metrics.comps_lower_ratio as number) ?? 0,
      best_lower_comp_gap: (metrics.best_lower_comp_gap as number) ?? 0,
      county,
    });

    return {
      meta: {
        report_id: reportId,
        generated_at: new Date().toISOString(),
        engine_version: ENGINE_VERSION,
        template_version: TEMPLATE_VERSION,
        rule_pack_id: precheck.rule_pack_id,
        disclaimer_version: DEFAULT_DISCLAIMER_VERSION,
        data_sources: [dataSource as "attom" | "propapis"],
        pdf_version: PDF_VERSION,
      },
      property: {
        formatted_address: property.formatted_address,
        place_id: property.place_id,
        county: county as "Suffolk" | "Nassau" | "Unknown",
        beds: (propertyData.beds as number) ?? 0,
        baths: (propertyData.baths as number) ?? 0,
        sqft: (propertyData.sqft as number) ?? 0,
        year_built: (propertyData.year_built as number) ?? undefined,
      },
      assessment: {
        assessed_value: (propertyData.assessed_value as number) ?? undefined,
        assessment_year: (propertyData.assessment_year as number) ?? undefined,
        parcel_id: (propertyData.parcel_id as string) ?? undefined,
      },
      analysis: {
        decision: precheck.decision as "ELIGIBLE" | "NOT_ELIGIBLE",
        confidence: precheck.confidence,
        factors: precheck.factors,
        metrics: {
          comps_used_count: (metrics.comps_used_count as number) ?? 0,
          comps_lower_count: (metrics.comps_lower_count as number) ?? 0,
          comps_lower_ratio: (metrics.comps_lower_ratio as number) ?? 0,
          best_lower_comp_gap: (metrics.best_lower_comp_gap as number) ?? 0,
        },
      },
      comps: sortedComps.map((c: any) => ({
        address: c.address,
        sale_price: c.sale_price,
        sold_date: c.sold_date,
        beds: c.beds,
        baths: c.baths,
        sqft: c.sqft,
        distance_miles: c.distance_miles,
        similarity_score: c.similarity_score,
        source: c.source,
      })),
      recommendation,
      legal: buildSnapshotLegal({
        checkbox_accepted_at: order.legal_accepted_at,
        disclaimer_version: order.disclaimer_version,
      }),
    };
  }

  private async generatePdf(reportId: string, snapshot: ReportSnapshot): Promise<string> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/report/generate-pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.INTERNAL_API_SECRET}` },
      body: JSON.stringify({ report_id: reportId, snapshot }),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`PDF generation failed: ${response.status} ${text}`);
    }
    const result = await response.json();
    return result.pdf_url;
  }

  async manualRetry(reportId: string, userId: string): Promise<void> {
    const { data: report, error } = await this.supabase
      .from("reports")
      .select("*, orders(*)")
      .eq("id", reportId)
      .eq("user_id", userId)
      .single();

    if (error || !report) throw new Error("Report not found");
    const order = (report as any).orders;
    if (order.status !== OrderStatus.FAILED) throw new Error("Can only retry failed orders");
    const maxRetries = await loadConfigValue(this.supabase, "REPORT_MAX_MANUAL_RETRIES");
    if (report.attempt_count >= maxRetries) throw new Error(`Maximum retry attempts (${maxRetries}) reached`);
    await this.generate(order.id);
  }
}

interface ReportRow {
  id: string;
  order_id: string;
  user_id: string;
  template_version: string;
  engine_version: string;
  content_snapshot: Record<string, unknown> | null;
  pdf_url: string | null;
  attempt_count: number;
  last_error: string | null;
  generated_at: string | null;
  created_at: string;
}
