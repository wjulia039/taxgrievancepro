import { createHash } from "crypto";
import { SupabaseClient } from "@supabase/supabase-js";
import { OrderStatus, ORDER_TRANSITIONS, ENGINE_VERSION } from "~/lib/shared/enums";

export class OrderService {
  constructor(private supabase: SupabaseClient) {}

  async transition(orderId: string, fromStatus: OrderStatus, toStatus: OrderStatus): Promise<void> {
    const allowed = ORDER_TRANSITIONS[fromStatus];
    if (!allowed.includes(toStatus)) {
      throw new OrderTransitionError(orderId, fromStatus, toStatus);
    }
    const { data, error } = await this.supabase
      .from("orders")
      .update({ status: toStatus })
      .eq("id", orderId)
      .eq("status", fromStatus)
      .select("id")
      .single();
    if (error || !data) {
      throw new OrderTransitionError(orderId, fromStatus, toStatus, "Concurrent modification or order not found");
    }
  }

  async create(params: { user_id: string; precheck_id: string; legal_accepted_at: string; disclaimer_version: string }): Promise<{ id: string }> {
    // PRD §13: Deterministic idempotency key prevents duplicate Stripe charges
    const idempotencyKey = createHash("sha256")
      .update(`${params.precheck_id}:${ENGINE_VERSION}`)
      .digest("hex");

    const { data, error } = await this.supabase
      .from("orders")
      .insert({
        user_id: params.user_id,
        precheck_id: params.precheck_id,
        status: OrderStatus.CREATED,
        legal_accepted_at: params.legal_accepted_at,
        disclaimer_version: params.disclaimer_version,
        idempotency_key: idempotencyKey,
      })
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505") throw new Error("An active order already exists for this precheck");
      throw new Error(`Failed to create order: ${error.message}`);
    }
    return { id: data.id };
  }

  async setPaymentIntent(orderId: string, paymentIntentId: string): Promise<void> {
    const { error: updateError } = await this.supabase
      .from("orders")
      .update({ payment_intent_id: paymentIntentId })
      .eq("id", orderId)
      .eq("status", OrderStatus.CREATED);
    if (updateError) throw new Error(`Failed to set payment intent: ${updateError.message}`);
    await this.transition(orderId, OrderStatus.CREATED, OrderStatus.PAYMENT_PENDING);
  }

  async getById(orderId: string): Promise<OrderRow | null> {
    const { data, error } = await this.supabase.from("orders").select("*").eq("id", orderId).single();
    if (error) return null;
    return data as OrderRow;
  }

  async getByPaymentIntent(paymentIntentId: string): Promise<OrderRow | null> {
    const { data, error } = await this.supabase.from("orders").select("*").eq("payment_intent_id", paymentIntentId).single();
    if (error) return null;
    return data as OrderRow;
  }
}

export class OrderTransitionError extends Error {
  constructor(public orderId: string, public fromStatus: OrderStatus, public toStatus: OrderStatus, detail?: string) {
    super(`Invalid order transition: ${fromStatus} → ${toStatus} for order ${orderId}${detail ? ` (${detail})` : ""}`);
    this.name = "OrderTransitionError";
  }
}

export interface OrderRow {
  id: string;
  user_id: string;
  precheck_id: string;
  payment_intent_id: string | null;
  idempotency_key: string | null;
  status: OrderStatus;
  legal_accepted_at: string;
  disclaimer_version: string;
  created_at: string;
  updated_at: string;
}
