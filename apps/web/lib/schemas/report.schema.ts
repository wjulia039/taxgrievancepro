import { z } from "zod";

export const ReportSnapshotSchema = z.object({
  meta: z.object({
    report_id: z.string().uuid(),
    generated_at: z.string(),
    engine_version: z.literal("e1"),
    template_version: z.literal("v1"),
    rule_pack_id: z.string().uuid(),
    disclaimer_version: z.literal("d1"),
    data_sources: z.array(z.enum(["attom", "propapis", "rentcast", "mock", "user_input"])),
    pdf_version: z.literal("p1"),
  }),
  property: z.object({
    formatted_address: z.string(),
    place_id: z.string(),
    county: z.enum(["Suffolk", "Nassau", "Unknown"]),
    beds: z.number(),
    baths: z.number(),
    sqft: z.number(),
    year_built: z.number().optional(),
  }),
  assessment: z.object({
    assessed_value: z.number().optional(),
    assessment_year: z.number().optional(),
    parcel_id: z.string().optional(),
  }),
  analysis: z.object({
    decision: z.enum(["ELIGIBLE", "NOT_ELIGIBLE"]),
    confidence: z.number().min(0).max(1),
    factors: z.array(z.string()),
    metrics: z.object({
      comps_used_count: z.number(),
      comps_lower_count: z.number(),
      comps_lower_ratio: z.number(),
      best_lower_comp_gap: z.number(),
    }),
  }),
  comps: z.array(
    z.object({
      address: z.string(),
      sale_price: z.number(),
      sold_date: z.string(),
      beds: z.number().optional(),
      baths: z.number().optional(),
      sqft: z.number().optional(),
      distance_miles: z.number().optional(),
      similarity_score: z.number().optional(),
      source: z.enum(["attom", "propapis", "rentcast", "mock"]),
    })
  ),
  recommendation: z.object({
    summary: z.string(),
    next_steps: z.array(z.string()),
    notes: z.array(z.string()),
  }),
  legal: z.object({
    checkbox_accepted_at: z.string(),
    disclaimer_text: z.string(),
    // NY compliance fields (PRD §14 — MUST be present in snapshot)
    filing_is_free_notice: z.string(),
    no_government_affiliation_notice: z.string(),
    user_must_file_themselves_notice: z.string(),
    hearing_possible_notice: z.string(),
  }),
});

export type ReportSnapshot = z.infer<typeof ReportSnapshotSchema>;
