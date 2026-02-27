import { z } from "zod";

export const PrecheckRequestSchema = z.object({
  place_id: z.string().min(1, "place_id is required"),
  formatted_address: z.string().min(1, "formatted_address is required"),
  street_number: z.string().optional(),
  route: z.string().optional(),
  locality: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  unit_number: z.string().nullable().optional(),
  lat: z.number(),
  lng: z.number(),
  address_quality_score: z.number().int().min(0).max(100),
  confirmed_by_user: z.boolean().default(false),
});

export type PrecheckRequest = z.infer<typeof PrecheckRequestSchema>;

export const PrecheckResponseSchema = z.object({
  source: z.enum(["LIVE", "CACHE"]),
  precheck: z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    property_id: z.string().uuid(),
    decision: z.enum(["ELIGIBLE", "NOT_ELIGIBLE"]),
    confidence: z.number().min(0).max(1),
    factors: z.array(z.string()),
    metrics: z.object({
      assessed_value: z.number(),
      comps_used_count: z.number(),
      comps_lower_count: z.number(),
      comps_lower_ratio: z.number(),
      best_lower_comp_gap: z.number(),
    }),
    metadata: z.record(z.unknown()).nullable().optional(),
    confirmed_by_user: z.boolean(),
    created_at: z.string(),
  }),
});

export type PrecheckResponse = z.infer<typeof PrecheckResponseSchema>;
