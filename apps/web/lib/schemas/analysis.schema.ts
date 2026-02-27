import { z } from "zod";
import { EligibilityDecision, EligibilityFactor } from "~/lib/shared/enums";

export const EligibilityMetricsSchema = z.object({
  assessed_value: z.number(),
  comps_used_count: z.number().int().min(0),
  comps_lower_count: z.number().int().min(0),
  comps_lower_ratio: z.number().min(0).max(1),
  best_lower_comp_gap: z.number(),
});

export type EligibilityMetrics = z.infer<typeof EligibilityMetricsSchema>;

export const AnalysisResultSchema = z.object({
  decision: z.nativeEnum(EligibilityDecision),
  confidence: z.number().min(0).max(1),
  factors: z.array(z.nativeEnum(EligibilityFactor)),
  metrics: EligibilityMetricsSchema,
  explanation: z.string(),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

export const ComparableSaleSchema = z.object({
  address: z.string(),
  sale_price: z.number().positive(),
  sold_date: z.string(),
  beds: z.number().int().optional(),
  baths: z.number().optional(),
  sqft: z.number().optional(),
  distance_miles: z.number().optional(),
  similarity_score: z.number().optional(),
  source: z.enum(["attom", "propapis", "rentcast", "mock"]),
});

export type ComparableSale = z.infer<typeof ComparableSaleSchema>;

export const PropertyDataSchema = z.object({
  assessed_value: z.number().optional(),
  assessment_year: z.number().int().optional(),
  parcel_id: z.string().optional(),
  beds: z.number().int().optional(),
  baths: z.number().optional(),
  sqft: z.number().optional(),
  year_built: z.number().int().optional(),
  county: z.enum(["Suffolk", "Nassau", "Unknown"]).optional(),
});

export type PropertyData = z.infer<typeof PropertyDataSchema>;

export const DataSourceResponseSchema = z.object({
  property: PropertyDataSchema,
  comps: z.array(ComparableSaleSchema),
  source: z.enum(["attom", "propapis", "rentcast", "mock"]),
});

export type DataSourceResponse = z.infer<typeof DataSourceResponseSchema>;
