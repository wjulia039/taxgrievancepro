import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerAdminClient } from "@kit/supabase/server-admin-client";
import { ReportRetryRequestSchema } from "~/lib/schemas/order.schema";
import { ReportService } from "~/lib/services/report.service";
import { checkRateLimits } from "~/lib/services/rate-limit.service";
import { loadSystemConfig } from "~/lib/config/system-config";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const token = authHeader.slice(7);
    const supabase = getSupabaseServerAdminClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const config = await loadSystemConfig(supabase);
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rateResult = await checkRateLimits({ supabase, ip, userId: user.id, ipLimit: config.RATE_LIMIT_IP, userLimit: config.RATE_LIMIT_USER });
    if (!rateResult.allowed) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

    const body = await request.json();
    const parsed = ReportRetryRequestSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });

    const reportService = new ReportService(supabase);
    await reportService.manualRetry(parsed.data.report_id, user.id);
    return NextResponse.json({ status: "retrying" }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("not found") || message.includes("Can only retry") || message.includes("Maximum retry")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    console.error("[report-retry] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
