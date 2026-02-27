/**
 * TaxGrievancePro — Disclaimer & NY Compliance Text Constants
 * Keyed by disclaimer_version. Used in orders and report snapshots.
 *
 * PRD §19 + §22: All NY compliance copy stored here as single source of truth.
 */

// ─── Disclaimer Text (keyed by version) ────────────────────────────────────

export const DISCLAIMERS: Record<string, string> = {
  d1: "I understand this report is an estimate and does not guarantee a tax reduction.",
};

export function getDisclaimerText(version: string): string {
  const text = DISCLAIMERS[version];
  if (!text) {
    throw new Error(`Unknown disclaimer version: ${version}`);
  }
  return text;
}

// ─── NY Compliance Copy (PRD §14, §19, §22) ────────────────────────────────

export const NY_COMPLIANCE = {
  /** PRD §12, §22: Shown on eligible result + checkout + report + footer */
  FILING_IS_FREE:
    "RP-524 filing is free through your local assessor/BAR.",

  /** PRD §12, §22: Shown on eligible result + checkout + report + footer */
  PREP_ONLY:
    "You are purchasing report preparation and analysis only.",

  /** PRD §14, §22: Shown on report + footer */
  NO_GOVERNMENT_AFFILIATION:
    "We are not affiliated with any government agency.",

  /** PRD §14, §22: Shown on report + result + footer */
  USER_MUST_FILE:
    "You must file the RP-524 grievance yourself with your local assessor or Board of Assessment Review (BAR).",

  /** PRD §14, §22: Shown on report + result */
  HEARING_POSSIBLE:
    "You may be required to attend a hearing.",
} as const;

// ─── Snapshot Legal Helpers ─────────────────────────────────────────────────

/**
 * Returns the full legal object for the report snapshot (PRD §14).
 */
export function buildSnapshotLegal(params: {
  checkbox_accepted_at: string;
  disclaimer_version: string;
}) {
  return {
    checkbox_accepted_at: params.checkbox_accepted_at,
    disclaimer_text: getDisclaimerText(params.disclaimer_version),
    filing_is_free_notice: NY_COMPLIANCE.FILING_IS_FREE,
    no_government_affiliation_notice: NY_COMPLIANCE.NO_GOVERNMENT_AFFILIATION,
    user_must_file_themselves_notice: NY_COMPLIANCE.USER_MUST_FILE,
    hearing_possible_notice: NY_COMPLIANCE.HEARING_POSSIBLE,
  };
}
