import { z } from "zod";

export const CreateOrderRequestSchema = z.object({
  precheck_id: z.string().uuid(),
  legal_accepted_at: z.string().datetime(),
  disclaimer_version: z.string().default("d1"),
});

export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>;

export const OrderResponseSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  precheck_id: z.string().uuid(),
  payment_intent_id: z.string().nullable(),
  status: z.enum(["CREATED", "PAYMENT_PENDING", "PAID", "PROCESSING", "COMPLETED", "FAILED", "CANCELED"]),
  legal_accepted_at: z.string(),
  disclaimer_version: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type OrderResponse = z.infer<typeof OrderResponseSchema>;

export const ReportRetryRequestSchema = z.object({
  report_id: z.string().uuid(),
});

export type ReportRetryRequest = z.infer<typeof ReportRetryRequestSchema>;
