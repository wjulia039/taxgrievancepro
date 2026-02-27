/**
 * TaxGrievancePro — Recommendation Templates (PRD §15)
 *
 * Recommendation text is DETERMINISTIC, template-generated. No LLM allowed.
 * Template variables: assessed_value, comps_used_count, comps_lower_count,
 *   comps_lower_ratio, best_lower_comp_gap, county
 */

import { EligibilityDecision } from "~/lib/shared/enums";

interface RecommendationInput {
  decision: EligibilityDecision;
  assessed_value: number;
  comps_used_count: number;
  comps_lower_count: number;
  comps_lower_ratio: number;
  best_lower_comp_gap: number;
  county: string;
}

interface Recommendation {
  summary: string;
  next_steps: string[];
  notes: string[];
}

export function generateRecommendation(input: RecommendationInput): Recommendation {
  const formattedValue = `$${input.assessed_value.toLocaleString()}`;

  // PRD §15: notes (always included, exact text)
  const notes = [
    "This report is an estimate based on available public/third-party data.",
    "Results do not guarantee a tax reduction.",
    "RP-524 filing is free; this product does not file on your behalf.",
  ];

  if (input.decision === EligibilityDecision.ELIGIBLE) {
    // PRD §15: ELIGIBLE summary + next_steps (exact text)
    return {
      summary: `Based on ${input.comps_lower_count} comparable home sales below your assessed value of ${formattedValue}, your property may be over-assessed. This suggests you may have grounds to file a grievance.`,
      next_steps: [
        "Review the comparable sales used in this report.",
        "Confirm your property details (beds/baths/sqft) match public records.",
        "Check your local assessor/BAR for filing dates and required supporting documents.",
      ],
      notes,
    };
  }

  // PRD §15: NOT_ELIGIBLE summary + next_steps (exact text)
  return {
    summary: `We could not identify enough comparable home sales below your assessed value of ${formattedValue}. Based on available data, your case appears weaker at this time.`,
    next_steps: [
      "Double-check your property details for accuracy.",
      "Try again later when more sales data becomes available.",
      "Use 'Notify Me' to get reminders for the next tax year.",
    ],
    notes,
  };
}
