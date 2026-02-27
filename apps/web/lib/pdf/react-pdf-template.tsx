/**
 * TaxGrievancePro — React PDF Template
 * PRD §14, §16: Renders ReportSnapshot into a PDF using @react-pdf/renderer.
 * No external calls — reads ONLY content_snapshot.
 * Works on Vercel Free tier (no headless browser required).
 */

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { ReportSnapshot } from "~/lib/schemas/report.schema";

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtCurrency(value: number | undefined): string {
  if (value == null) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return iso;
  }
}

function fmtPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

// ── Styles ───────────────────────────────────────────────────────────────────

const GREEN = "#2ECC71";
const RED = "#E74C3C";

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 36,
    color: "#1a1a1a",
    lineHeight: 1.5,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 3,
    borderBottomColor: GREEN,
    paddingBottom: 12,
    marginBottom: 20,
  },
  headerTitle: { fontSize: 18, fontFamily: "Helvetica-Bold", color: GREEN },
  headerSubtitle: { fontSize: 9, color: "#888", marginTop: 2 },
  headerRight: { textAlign: "right", fontSize: 8, color: "#888" },

  // Decision banner
  banner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 6,
    marginBottom: 20,
  },
  bannerText: { fontSize: 16, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  bannerConfidence: { fontSize: 12, color: "#ffffff", opacity: 0.9 },

  // Section
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: GREEN,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingBottom: 4,
    marginBottom: 10,
  },

  // Info grid
  infoGrid: { flexDirection: "row", flexWrap: "wrap" },
  infoItem: { width: "50%", flexDirection: "row", marginBottom: 6 },
  infoItemFull: { width: "100%", flexDirection: "row", marginBottom: 6 },
  infoLabel: {
    fontFamily: "Helvetica-Bold",
    color: "#555",
    width: 100,
    fontSize: 9,
  },
  infoValue: { fontSize: 9 },
  infoValueWrap: { fontSize: 9, flex: 1 },

  // Metrics
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  metricCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 4,
    padding: 10,
    width: "23%",
    alignItems: "center",
  },
  metricValue: { fontSize: 16, fontFamily: "Helvetica-Bold", color: GREEN },
  metricLabel: { fontSize: 7, color: "#888", marginTop: 2 },

  // Factors
  factorItem: { flexDirection: "row", marginBottom: 3, paddingLeft: 4 },
  factorBullet: {
    color: GREEN,
    fontFamily: "Helvetica-Bold",
    marginRight: 6,
    fontSize: 9,
  },
  factorText: { fontSize: 9 },

  // Table
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 2,
    borderBottomColor: "#e0e0e0",
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  tableRowEven: { backgroundColor: "#fafbfc" },
  thText: { fontFamily: "Helvetica-Bold", color: "#555", fontSize: 8 },
  tdText: { fontSize: 8 },
  colNum: { width: "5%" },
  colAddress: { width: "28%" },
  colPrice: { width: "14%" },
  colDate: { width: "14%" },
  colBedBath: { width: "10%" },
  colSqft: { width: "9%" },
  colDist: { width: "10%" },
  colSim: { width: "10%" },

  // Recommendation
  recSummary: {
    backgroundColor: "#f0faf4",
    borderLeftWidth: 4,
    borderLeftColor: GREEN,
    padding: 10,
    marginBottom: 10,
    fontSize: 10,
  },
  stepItem: { fontSize: 9, marginBottom: 3, paddingLeft: 8 },

  // Compliance box
  complianceBox: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
  complianceTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: "#555",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingBottom: 4,
    marginBottom: 8,
  },
  complianceText: { fontSize: 9, color: "#92400e", marginBottom: 3 },
  complianceBold: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: "#92400e",
    marginBottom: 3,
  },

  // Legal footer
  legal: {
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  legalText: { fontSize: 8, color: "#999", marginBottom: 3 },
});

// ── Factor labels ────────────────────────────────────────────────────────────

const FACTOR_LABELS: Record<string, string> = {
  COMPS_FOUND: "Comparable sales found",
  COMPS_LOWER_THAN_ASSESSED: "Sales below assessed value identified",
  LOWER_COMP_RATIO_HIGH: "High ratio of lower-valued comparables",
  ADDRESS_QUALITY_LOW: "Address quality below threshold",
  PROPERTY_DATA_CONFLICT: "Property data conflict detected",
  INSUFFICIENT_COMPS: "Insufficient comparable sales",
  OUTLIER_FILTERED: "Outlier sales filtered from analysis",
};

// ── Document ─────────────────────────────────────────────────────────────────

export function ReportPdfDocument({
  snapshot,
}: {
  snapshot: ReportSnapshot;
}) {
  const isEligible = snapshot.analysis.decision === "ELIGIBLE";
  const decisionColor = isEligible ? GREEN : RED;
  const decisionText = isEligible ? "ELIGIBLE" : "NOT ELIGIBLE";

  return (
    <Document>
      <Page size="LETTER" style={s.page}>
        {/* ── Header ─────────────────────────────────────── */}
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>TaxGrievancePro</Text>
            <Text style={s.headerSubtitle}>
              Property Tax Eligibility Report
            </Text>
          </View>
          <View>
            <Text style={s.headerRight}>
              Report ID: {snapshot.meta.report_id.slice(0, 8)}...
            </Text>
            <Text style={s.headerRight}>
              Generated: {fmtDate(snapshot.meta.generated_at)}
            </Text>
            <Text style={s.headerRight}>
              Engine: {snapshot.meta.engine_version} | Template:{" "}
              {snapshot.meta.template_version}
            </Text>
          </View>
        </View>

        {/* ── Decision Banner ────────────────────────────── */}
        <View style={[s.banner, { backgroundColor: decisionColor }]}>
          <Text style={s.bannerText}>{decisionText}</Text>
          <Text style={s.bannerConfidence}>
            Confidence: {fmtPercent(snapshot.analysis.confidence)}
          </Text>
        </View>

        {/* ── Property Details ───────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Property Details</Text>
          <View style={s.infoGrid}>
            <View style={s.infoItemFull}>
              <Text style={s.infoLabel}>Address:</Text>
              <Text style={s.infoValueWrap}>
                {snapshot.property.formatted_address}
              </Text>
            </View>
            <View style={s.infoItem}>
              <Text style={s.infoLabel}>County:</Text>
              <Text style={s.infoValue}>{snapshot.property.county}</Text>
            </View>
            <View style={s.infoItem}>
              <Text style={s.infoLabel}>Beds / Baths:</Text>
              <Text style={s.infoValue}>
                {snapshot.property.beds} / {snapshot.property.baths}
              </Text>
            </View>
            <View style={s.infoItem}>
              <Text style={s.infoLabel}>Sqft:</Text>
              <Text style={s.infoValue}>
                {snapshot.property.sqft > 0
                  ? snapshot.property.sqft.toLocaleString()
                  : "N/A"}
              </Text>
            </View>
            <View style={s.infoItem}>
              <Text style={s.infoLabel}>Year Built:</Text>
              <Text style={s.infoValue}>
                {snapshot.property.year_built ?? "N/A"}
              </Text>
            </View>
            <View style={s.infoItem}>
              <Text style={s.infoLabel}>Assessed Value:</Text>
              <Text style={s.infoValue}>
                {fmtCurrency(snapshot.assessment.assessed_value)}
              </Text>
            </View>
            {snapshot.assessment.parcel_id ? (
              <View style={s.infoItem}>
                <Text style={s.infoLabel}>Parcel ID:</Text>
                <Text style={s.infoValue}>
                  {snapshot.assessment.parcel_id}
                </Text>
              </View>
            ) : null}
            {snapshot.assessment.assessment_year ? (
              <View style={s.infoItem}>
                <Text style={s.infoLabel}>Assessment Year:</Text>
                <Text style={s.infoValue}>
                  {snapshot.assessment.assessment_year}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* ── Analysis Metrics ───────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Analysis Summary</Text>
          <View style={s.metricsRow}>
            <View style={s.metricCard}>
              <Text style={s.metricValue}>
                {snapshot.analysis.metrics.comps_used_count}
              </Text>
              <Text style={s.metricLabel}>Comps Used</Text>
            </View>
            <View style={s.metricCard}>
              <Text style={s.metricValue}>
                {snapshot.analysis.metrics.comps_lower_count}
              </Text>
              <Text style={s.metricLabel}>Below Assessed</Text>
            </View>
            <View style={s.metricCard}>
              <Text style={s.metricValue}>
                {fmtPercent(snapshot.analysis.metrics.comps_lower_ratio)}
              </Text>
              <Text style={s.metricLabel}>Lower Ratio</Text>
            </View>
            <View style={s.metricCard}>
              <Text style={s.metricValue}>
                {fmtPercent(snapshot.analysis.metrics.best_lower_comp_gap)}
              </Text>
              <Text style={s.metricLabel}>Best Gap</Text>
            </View>
          </View>

          {snapshot.analysis.factors.length > 0 ? (
            <View>
              <Text
                style={{
                  fontFamily: "Helvetica-Bold",
                  fontSize: 9,
                  marginBottom: 4,
                }}
              >
                Key Factors:
              </Text>
              {snapshot.analysis.factors.map((f, i) => (
                <View key={i} style={s.factorItem}>
                  <Text style={s.factorBullet}>{"\u2713"}</Text>
                  <Text style={s.factorText}>
                    {FACTOR_LABELS[f] ?? f}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {/* ── Comparable Sales Table ─────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>
            Comparable Sales ({snapshot.comps.length})
          </Text>
          {snapshot.comps.length === 0 ? (
            <Text style={{ color: "#999", fontStyle: "italic", fontSize: 9 }}>
              No comparable sales data available.
            </Text>
          ) : (
            <View>
              {/* Table Header */}
              <View style={s.tableHeader}>
                <Text style={[s.thText, s.colNum]}>#</Text>
                <Text style={[s.thText, s.colAddress]}>Address</Text>
                <Text style={[s.thText, s.colPrice]}>Sale Price</Text>
                <Text style={[s.thText, s.colDate]}>Sold Date</Text>
                <Text style={[s.thText, s.colBedBath]}>Beds/Baths</Text>
                <Text style={[s.thText, s.colSqft]}>Sqft</Text>
                <Text style={[s.thText, s.colDist]}>Distance</Text>
                <Text style={[s.thText, s.colSim]}>Similarity</Text>
              </View>
              {/* Table Rows */}
              {snapshot.comps.map((c, i) => (
                <View
                  key={i}
                  style={[s.tableRow, i % 2 === 1 ? s.tableRowEven : {}]}
                >
                  <Text style={[s.tdText, s.colNum]}>{i + 1}</Text>
                  <Text style={[s.tdText, s.colAddress]}>{c.address}</Text>
                  <Text style={[s.tdText, s.colPrice]}>
                    {fmtCurrency(c.sale_price)}
                  </Text>
                  <Text style={[s.tdText, s.colDate]}>
                    {c.sold_date ? fmtDate(c.sold_date) : "N/A"}
                  </Text>
                  <Text style={[s.tdText, s.colBedBath]}>
                    {c.beds ?? "-"} / {c.baths ?? "-"}
                  </Text>
                  <Text style={[s.tdText, s.colSqft]}>
                    {c.sqft ? c.sqft.toLocaleString() : "-"}
                  </Text>
                  <Text style={[s.tdText, s.colDist]}>
                    {c.distance_miles != null
                      ? `${c.distance_miles.toFixed(1)} mi`
                      : "-"}
                  </Text>
                  <Text style={[s.tdText, s.colSim]}>
                    {c.similarity_score != null
                      ? fmtPercent(c.similarity_score)
                      : "-"}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── Recommendation ─────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Recommendation</Text>
          <View style={s.recSummary}>
            <Text>{snapshot.recommendation.summary}</Text>
          </View>
          <Text
            style={{
              fontFamily: "Helvetica-Bold",
              fontSize: 9,
              marginBottom: 4,
            }}
          >
            Next Steps:
          </Text>
          {snapshot.recommendation.next_steps.map((step, i) => (
            <Text key={i} style={s.stepItem}>
              {i + 1}. {step}
            </Text>
          ))}
        </View>

        {/* ── NY Compliance Notices ──────────────────────── */}
        <View style={s.section}>
          <Text style={s.complianceTitle}>Important Notices</Text>
          <View style={s.complianceBox}>
            <Text style={s.complianceBold}>
              {snapshot.legal.filing_is_free_notice}
            </Text>
            <Text style={s.complianceText}>
              {snapshot.legal.no_government_affiliation_notice}
            </Text>
            <Text style={s.complianceText}>
              {snapshot.legal.user_must_file_themselves_notice}
            </Text>
            <Text style={s.complianceText}>
              {snapshot.legal.hearing_possible_notice}
            </Text>
          </View>
        </View>

        {/* ── Legal / Disclaimer ─────────────────────────── */}
        <View style={s.legal}>
          {snapshot.recommendation.notes.map((note, i) => (
            <Text key={i} style={s.legalText}>
              {note}
            </Text>
          ))}
          <Text style={[s.legalText, { marginTop: 6 }]}>
            Disclaimer ({snapshot.meta.disclaimer_version}):{" "}
            {snapshot.legal.disclaimer_text}
          </Text>
          <Text style={s.legalText}>
            Legal acceptance recorded:{" "}
            {fmtDate(snapshot.legal.checkbox_accepted_at)}
          </Text>
          <Text style={s.legalText}>
            Data sources: {snapshot.meta.data_sources.join(", ")}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
