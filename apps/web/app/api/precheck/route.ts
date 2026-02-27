import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerAdminClient } from "@kit/supabase/server-admin-client";
import { PrecheckRequestSchema } from "~/lib/schemas/precheck.schema";
import { PrecheckService, PrecheckValidationError, DailyLimitExceededError } from "~/lib/services/precheck.service";
import { checkRateLimits } from "~/lib/services/rate-limit.service";
import { loadSystemConfig } from "~/lib/config/system-config";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.slice(7);
    const supabase = getSupabaseServerAdminClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const config = await loadSystemConfig(supabase);
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown";

    // Rate limits — skip in local dev to simplify testing
    const isDev = process.env.NODE_ENV === "development";
    if (!isDev) {
      const rateResult = await checkRateLimits({ supabase, ip, userId: user.id, ipLimit: config.RATE_LIMIT_IP, userLimit: config.RATE_LIMIT_USER });
      if (!rateResult.allowed) {
        console.warn(`[precheck] Rate limited: layer=${rateResult.layer}, ip=${ip}, user=${user.id}`);
        return NextResponse.json({ error: "Too many requests." }, { status: 429 });
      }
    }

    const body = await request.json();
    const parsed = PrecheckRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    const service = new PrecheckService(supabase);
    const result = await service.execute(user.id, parsed.data, ip, request.headers.get("user-agent") ?? undefined);

    // Extract comps and property_data from metadata for the results page
    const meta = result.precheck.metadata as any;

    return NextResponse.json({
      source: result.source,
      precheck: {
        id: result.precheck.id, user_id: result.precheck.user_id, property_id: result.precheck.property_id,
        decision: result.precheck.decision, confidence: result.precheck.confidence,
        factors: result.precheck.factors, metrics: result.precheck.metrics,
        confirmed_by_user: result.precheck.confirmed_by_user,
        created_at: result.precheck.created_at,
      },
      // Surface comps and property details so the results page can render them
      comps: (meta?.comps ?? []) as Array<{
        address: string; sale_price: number; sold_date: string;
        beds?: number; baths?: number; sqft?: number; distance_miles?: number; source: string;
      }>,
      property: (meta?.property_data ?? {}) as {
        assessed_value?: number; assessment_year?: number; parcel_id?: string;
        beds?: number; baths?: number; sqft?: number; year_built?: number; county?: string;
      },
    }, { status: 200 });
  } catch (error) {
    if (error instanceof PrecheckValidationError) return NextResponse.json({ error: error.message }, { status: 400 });
    if (error instanceof DailyLimitExceededError) return NextResponse.json({ error: error.message, limit: error.limit }, { status: 429 });
    console.error("[precheck] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
