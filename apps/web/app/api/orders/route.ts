import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseServerAdminClient } from "@kit/supabase/server-admin-client";
import { CreateOrderRequestSchema } from "~/lib/schemas/order.schema";
import { OrderService } from "~/lib/services/order.service";
import { logAuditEvent } from "~/lib/services/audit.service";
import { checkRateLimits } from "~/lib/services/rate-limit.service";
import { loadSystemConfig } from "~/lib/config/system-config";
import { AuditEventType, AuditEntityType, PrecheckStatus } from "~/lib/shared/enums";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", { apiVersion: "2024-06-20" });

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

    // Rate limits — skip in local dev to simplify testing
    const isDev = process.env.NODE_ENV === "development";
    if (!isDev) {
      const rateResult = await checkRateLimits({ supabase, ip, userId: user.id, ipLimit: config.RATE_LIMIT_IP, userLimit: config.RATE_LIMIT_USER });
      if (!rateResult.allowed) return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const body = await request.json();
    const parsed = CreateOrderRequestSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });

    // Cast: database types not yet regenerated for custom tables
    const { data: precheck } = await (supabase as any).from("prechecks").select("id, decision, user_id").eq("id", parsed.data.precheck_id).eq("user_id", user.id).single() as { data: any };
    if (!precheck) return NextResponse.json({ error: "Precheck not found" }, { status: 404 });
    if (precheck.decision !== PrecheckStatus.ELIGIBLE) return NextResponse.json({ error: "Only eligible prechecks can be purchased" }, { status: 400 });

    const orderService = new OrderService(supabase);
    const { id: orderId } = await orderService.create({ user_id: user.id, precheck_id: parsed.data.precheck_id, legal_accepted_at: parsed.data.legal_accepted_at, disclaimer_version: parsed.data.disclaimer_version });

    const session = await stripe.checkout.sessions.create({
      mode: "payment", payment_method_types: ["card"],
      line_items: [{ price_data: { currency: "usd", product_data: { name: "TaxGrievancePro Report", description: "Tax grievance eligibility report with comparable sales" }, unit_amount: Math.round(config.REPORT_PRICE_USD * 100) }, quantity: 1 }],
      metadata: { order_id: orderId, user_id: user.id },
      payment_intent_data: { metadata: { order_id: orderId, user_id: user.id } },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/home/reports?highlight=${orderId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/home`,
    });

    if (session.payment_intent) await orderService.setPaymentIntent(orderId, session.payment_intent as string);

    logAuditEvent(supabase, { user_id: user.id, event_type: AuditEventType.ORDER_CREATED, entity_type: AuditEntityType.ORDER, entity_id: orderId, ip });
    return NextResponse.json({ order_id: orderId, checkout_url: session.url }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("active order already exists")) return NextResponse.json({ error: message }, { status: 409 });
    console.error("[orders] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
