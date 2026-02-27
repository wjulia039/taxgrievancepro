import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerAdminClient } from "@kit/supabase/server-admin-client";
import { LeadSubmitRequestSchema } from "~/lib/schemas/lead.schema";
import { logAuditEvent } from "~/lib/services/audit.service";
import { checkRateLimits } from "~/lib/services/rate-limit.service";
import { loadSystemConfig } from "~/lib/config/system-config";
import { sendLeadOptInEmail } from "~/lib/services/email.service";
import { AuditEventType, AuditEntityType, County } from "~/lib/shared/enums";

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
    const parsed = LeadSubmitRequestSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });

    let recontactMonth = config.DEFAULT_RECONTACT_MONTH_SUFFOLK;
    if (parsed.data.county === County.NASSAU) recontactMonth = config.DEFAULT_RECONTACT_MONTH_NASSAU;

    // Cast: database types not yet regenerated for custom tables
    const { data: lead, error } = await (supabase as any).from("leads").insert({ user_id: user.id, email: parsed.data.email, tag: parsed.data.tag, recontact_month: recontactMonth }).select("id").single() as { data: any; error: any };
    if (error) throw new Error(`Failed to create lead: ${error.message}`);

    logAuditEvent(supabase, { user_id: user.id, event_type: AuditEventType.LEAD_SUBMITTED, entity_type: AuditEntityType.LEAD, entity_id: lead.id, ip });

    // PRD §18: Fire-and-forget lead opt-in confirmation email
    sendLeadOptInEmail(parsed.data.email, lead.id).catch((err) =>
      console.error("[leads] Failed to send opt-in email:", err)
    );

    return NextResponse.json({ id: lead.id, status: "pending_confirmation" }, { status: 200 });
  } catch (error) {
    console.error("[leads] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
