import {
  EligibilityDecision,
  EligibilityFactor,
} from "~/lib/shared/enums";
import type { AnalysisResult, ComparableSale } from "~/lib/schemas/analysis.schema";

interface EligibilityInput {
  assessed_value: number;
  comps: ComparableSale[];
  address_quality_score: number;
  has_property_data_conflict: boolean;
  rule_config: RuleConfig;
}

interface RuleConfig {
  min_comps: number;
  min_lower_comps: number;
  outlier_low_factor: number;
  outlier_high_factor: number;
  max_comp_age_months: number;
  confidence_base: number;
  confidence_comps_5_bonus: number;
  confidence_ratio_40_bonus: number;
  confidence_gap_10_bonus: number;
  confidence_low_quality_penalty: number;
  confidence_conflict_penalty: number;
  low_quality_threshold: number;
}

export function computeEligibility(input: EligibilityInput): AnalysisResult {
  const { assessed_value, comps: rawComps, address_quality_score, has_property_data_conflict, rule_config } = input;
  const factors: EligibilityFactor[] = [];

  // Step 1: Filter by age
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - rule_config.max_comp_age_months);
  const cutoffStr = cutoffDate.toISOString().slice(0, 10);
  let comps = rawComps.filter((c) => c.sold_date >= cutoffStr);

  // Step 2: Remove outliers
  if (comps.length > 0) {
    const prices = comps.map((c) => c.sale_price).sort((a, b) => a - b);
    const median = prices[Math.floor(prices.length / 2)]!;
    const lowerBound = median * rule_config.outlier_low_factor;
    const upperBound = median * rule_config.outlier_high_factor;
    const beforeCount = comps.length;
    comps = comps.filter((c) => c.sale_price >= lowerBound && c.sale_price <= upperBound);
    if (comps.length < beforeCount) {
      factors.push(EligibilityFactor.OUTLIER_FILTERED);
    }
  }

  // Step 3: Sort comps
  comps = sortComps(comps);

  // Step 4: Calculate metrics
  const comps_used_count = comps.length;
  const comps_lower = comps.filter((c) => c.sale_price < assessed_value);
  const comps_lower_count = comps_lower.length;
  const comps_lower_ratio = comps_used_count > 0 ? comps_lower_count / comps_used_count : 0;

  let best_lower_comp_gap = 0;
  if (comps_lower.length > 0 && assessed_value > 0) {
    best_lower_comp_gap = Math.max(...comps_lower.map((c) => (assessed_value - c.sale_price) / assessed_value));
  }

  // Step 5: Build factors
  if (comps_used_count >= rule_config.min_comps) factors.push(EligibilityFactor.COMPS_FOUND);
  if (comps_lower_count >= rule_config.min_lower_comps) factors.push(EligibilityFactor.COMPS_LOWER_THAN_ASSESSED);
  if (comps_lower_ratio >= 0.4) factors.push(EligibilityFactor.LOWER_COMP_RATIO_HIGH);
  if (address_quality_score < rule_config.low_quality_threshold) factors.push(EligibilityFactor.ADDRESS_QUALITY_LOW);
  if (has_property_data_conflict) factors.push(EligibilityFactor.PROPERTY_DATA_CONFLICT);
  if (comps_used_count < rule_config.min_comps) factors.push(EligibilityFactor.INSUFFICIENT_COMPS);

  // Step 6: MVP Decision Rule
  const decision: EligibilityDecision =
    comps_used_count >= rule_config.min_comps && comps_lower_count >= rule_config.min_lower_comps
      ? EligibilityDecision.ELIGIBLE
      : EligibilityDecision.NOT_ELIGIBLE;

  // Step 7: Confidence
  let confidence = rule_config.confidence_base;
  if (comps_used_count >= 5) confidence += rule_config.confidence_comps_5_bonus;
  if (comps_lower_ratio >= 0.4) confidence += rule_config.confidence_ratio_40_bonus;
  if (best_lower_comp_gap >= 0.1) confidence += rule_config.confidence_gap_10_bonus;
  if (address_quality_score < rule_config.low_quality_threshold) confidence += rule_config.confidence_low_quality_penalty;
  if (has_property_data_conflict) confidence += rule_config.confidence_conflict_penalty;
  confidence = Math.max(0, Math.min(1, confidence));

  // Step 8: Explanation
  const explanation = decision === EligibilityDecision.ELIGIBLE
    ? `Found ${comps_used_count} comparable sales, ${comps_lower_count} of which sold below the assessed value of $${assessed_value.toLocaleString()}. This property may be over-assessed.`
    : `Found ${comps_used_count} comparable sales. Insufficient evidence of over-assessment relative to the assessed value of $${assessed_value.toLocaleString()}.`;

  return { decision, confidence, factors, metrics: { assessed_value, comps_used_count, comps_lower_count, comps_lower_ratio, best_lower_comp_gap }, explanation };
}

export function sortComps(comps: ComparableSale[]): ComparableSale[] {
  return [...comps].sort((a, b) => {
    const simA = a.similarity_score ?? 0;
    const simB = b.similarity_score ?? 0;
    if (simB !== simA) return simB - simA;
    const distA = a.distance_miles ?? Infinity;
    const distB = b.distance_miles ?? Infinity;
    if (distA !== distB) return distA - distB;
    return b.sold_date.localeCompare(a.sold_date);
  });
}
