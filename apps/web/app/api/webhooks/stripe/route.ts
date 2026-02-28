import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseServerAdminClient } from "@kit/supabase/server-admin-client";
import { OrderService } from "~/lib/services/order.service";
import { ReportService } from "~/lib/services/report.service";
import { logAuditEvent } from "~/lib/services/audit.service";
import { OrderStatus, AuditEventType, AuditEntityType } from "~/lib/shared/enums";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", { apiVersion: "2024-06-20" });

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET ?? "");
  } catch (err) {
    console.error("[stripe-webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = getSupabaseServerAdminClient();
  const orderService = new OrderService(supabase);

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        let existingOrder = await orderService.getByPaymentIntent(paymentIntent.id);

        // Fallback: look up order via payment intent metadata (handles case
        // where payment_intent_id wasn't stored at checkout session creation)
        if (!existingOrder && paymentIntent.metadata?.order_id) {
          existingOrder = await orderService.getById(paymentIntent.metadata.order_id);
          if (existingOrder) {
            // Back-fill the payment_intent_id; setPaymentIntent also
            // transitions CREATED → PAYMENT_PENDING
            if (existingOrder.status === OrderStatus.CREATED) {
              await orderService.setPaymentIntent(existingOrder.id, paymentIntent.id);
              existingOrder = await orderService.getById(existingOrder.id);
            }
          }
        }

        if (!existingOrder) {
          console.warn("[stripe-webhook] No order found for PI", paymentIntent.id);
          return NextResponse.json({ received: true }, { status: 200 });
        }

        // Already processed or in a terminal state
        if (existingOrder.status !== OrderStatus.PAYMENT_PENDING) {
          return NextResponse.json({ received: true }, { status: 200 });
        }

        await orderService.transition(existingOrder.id, OrderStatus.PAYMENT_PENDING, OrderStatus.PAID);
        logAuditEvent(supabase, { user_id: existingOrder.user_id, event_type: AuditEventType.PAYMENT_SUCCEEDED, entity_type: AuditEntityType.ORDER, entity_id: existingOrder.id });
        const reportService = new ReportService(supabase);
        reportService.generate(existingOrder.id).catch((err) => console.error(`[stripe-webhook] Report gen failed:`, err));
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        let order = await orderService.getByPaymentIntent(pi.id);
        // Fallback: look up by metadata
        if (!order && pi.metadata?.order_id) {
          order = await orderService.getById(pi.metadata.order_id);
        }
        if (order) {
          // PRD §7: PAYMENT_PENDING can only go to PAID or CANCELED (not FAILED)
          if (order.status === OrderStatus.PAYMENT_PENDING) {
            await orderService.transition(order.id, OrderStatus.PAYMENT_PENDING, OrderStatus.CANCELED);
          }
          logAuditEvent(supabase, { user_id: order.user_id, event_type: AuditEventType.PAYMENT_FAILED, entity_type: AuditEntityType.ORDER, entity_id: order.id });
        }
        break;
      }
    }
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("[stripe-webhook] Error:", error);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
