/**
 * Test script: Generate a PDF report locally using real property data.
 * Usage: node --experimental-vm-modules scripts/generate-test-pdf.mjs
 *
 * This bypasses Stripe/Supabase and writes a PDF directly to disk.
 */

import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// ── Inline the ReportPdfDocument component (avoid TS import issues) ──────────

import {
  Document,
  Page as PdfPage,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

function fmtCurrency(value) {
  if (value == null) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function fmtDate(iso) {
  try {
    // Use UTC to avoid timezone-related off-by-one day errors
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

function fmtPercent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

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
  infoGrid: { flexDirection: "row", flexWrap: "wrap" },
  infoItem: { width: "50%", flexDirection: "row", marginBottom: 6 },
  infoItemFull: { width: "100%", flexDirection: "row", marginBottom: 6 },
  infoLabel: {
    fontFamily: "Helvetica-Bold",
    color: "#555",
    width: 110,
    fontSize: 9,
  },
  infoValue: { fontSize: 9 },
  infoValueWrap: { fontSize: 9, flex: 1 },
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
  factorItem: { flexDirection: "row", marginBottom: 3, paddingLeft: 4 },
  factorBullet: {
    color: GREEN,
    fontFamily: "Helvetica-Bold",
    marginRight: 6,
    fontSize: 9,
  },
  factorText: { fontSize: 9 },
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
  recSummary: {
    backgroundColor: "#f0faf4",
    borderLeftWidth: 4,
    borderLeftColor: GREEN,
    padding: 10,
    marginBottom: 10,
    fontSize: 10,
  },
  stepItem: { fontSize: 9, marginBottom: 3, paddingLeft: 8 },
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
  legal: {
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  legalText: { fontSize: 8, color: "#999", marginBottom: 3 },
});

const FACTOR_LABELS = {
  COMPS_FOUND: "Comparable sales found",
  COMPS_LOWER_THAN_ASSESSED: "Sales below assessed value identified",
  LOWER_COMP_RATIO_HIGH: "High ratio of lower-valued comparables",
  OUTLIER_FILTERED: "Outlier sales filtered from analysis",
};

function ReportPdfDocument({ snapshot }) {
  const isEligible = snapshot.analysis.decision === "ELIGIBLE";
  const decisionColor = isEligible ? GREEN : RED;
  const decisionText = isEligible ? "ELIGIBLE" : "NOT ELIGIBLE";

  return React.createElement(
    Document,
    null,
    React.createElement(
      PdfPage,
      { size: "LETTER", style: s.page },

      // Header
      React.createElement(
        View,
        { style: s.header },
        React.createElement(
          View,
          null,
          React.createElement(Text, { style: s.headerTitle }, "TaxGrievancePro"),
          React.createElement(
            Text,
            { style: s.headerSubtitle },
            "Property Tax Eligibility Report"
          )
        ),
        React.createElement(
          View,
          null,
          React.createElement(
            Text,
            { style: s.headerRight },
            `Report ID: ${snapshot.meta.report_id.slice(0, 8)}...`
          ),
          React.createElement(
            Text,
            { style: s.headerRight },
            `Generated: ${fmtDate(snapshot.meta.generated_at)}`
          ),
          React.createElement(
            Text,
            { style: s.headerRight },
            `Engine: ${snapshot.meta.engine_version} | Template: ${snapshot.meta.template_version}`
          )
        )
      ),

      // Decision Banner
      React.createElement(
        View,
        { style: [s.banner, { backgroundColor: decisionColor }] },
        React.createElement(Text, { style: s.bannerText }, decisionText),
        React.createElement(
          Text,
          { style: s.bannerConfidence },
          `Confidence: ${fmtPercent(snapshot.analysis.confidence)}`
        )
      ),

      // Property Details
      React.createElement(
        View,
        { style: s.section },
        React.createElement(Text, { style: s.sectionTitle }, "Property Details"),
        React.createElement(
          View,
          { style: s.infoGrid },
          // Address on its own full-width row
          React.createElement(
            View,
            { key: "addr", style: s.infoItemFull },
            React.createElement(Text, { style: s.infoLabel }, "Address:"),
            React.createElement(Text, { style: s.infoValueWrap }, snapshot.property.formatted_address)
          ),
          // Remaining fields in 50% width pairs
          ...[
            ["County:", snapshot.property.county],
            ["Beds / Baths:", `${snapshot.property.beds} / ${snapshot.property.baths}`],
            ["Sqft:", snapshot.property.sqft > 0 ? snapshot.property.sqft.toLocaleString() : "N/A"],
            ["Year Built:", snapshot.property.year_built ?? "N/A"],
            ["Assessed Value:", fmtCurrency(snapshot.assessment.assessed_value)],
            ["Parcel ID:", snapshot.assessment.parcel_id || "N/A"],
            ["Assessment Year:", snapshot.assessment.assessment_year || "N/A"],
          ].map(([label, value], i) =>
            React.createElement(
              View,
              { key: i, style: s.infoItem },
              React.createElement(Text, { style: s.infoLabel }, label),
              React.createElement(Text, { style: s.infoValue }, String(value))
            )
          )
        )
      ),

      // Analysis Metrics
      React.createElement(
        View,
        { style: s.section },
        React.createElement(Text, { style: s.sectionTitle }, "Analysis Summary"),
        React.createElement(
          View,
          { style: s.metricsRow },
          ...[
            [snapshot.analysis.metrics.comps_used_count, "Comps Used"],
            [snapshot.analysis.metrics.comps_lower_count, "Below Assessed"],
            [fmtPercent(snapshot.analysis.metrics.comps_lower_ratio), "Lower Ratio"],
            [fmtPercent(snapshot.analysis.metrics.best_lower_comp_gap), "Best Gap"],
          ].map(([val, label], i) =>
            React.createElement(
              View,
              { key: i, style: s.metricCard },
              React.createElement(Text, { style: s.metricValue }, String(val)),
              React.createElement(Text, { style: s.metricLabel }, label)
            )
          )
        ),
        // Factors
        React.createElement(
          Text,
          { style: { fontFamily: "Helvetica-Bold", fontSize: 9, marginBottom: 4 } },
          "Key Factors:"
        ),
        ...snapshot.analysis.factors.map((f, i) =>
          React.createElement(
            View,
            { key: i, style: s.factorItem },
            React.createElement(Text, { style: s.factorBullet }, "\u2713"),
            React.createElement(Text, { style: s.factorText }, FACTOR_LABELS[f] ?? f)
          )
        )
      ),

      // Comparable Sales Table
      React.createElement(
        View,
        { style: s.section },
        React.createElement(
          Text,
          { style: s.sectionTitle },
          `Comparable Sales (${snapshot.comps.length})`
        ),
        // Header row
        React.createElement(
          View,
          { style: s.tableHeader },
          React.createElement(Text, { style: [s.thText, s.colNum] }, "#"),
          React.createElement(Text, { style: [s.thText, s.colAddress] }, "Address"),
          React.createElement(Text, { style: [s.thText, s.colPrice] }, "Sale Price"),
          React.createElement(Text, { style: [s.thText, s.colDate] }, "Sold Date"),
          React.createElement(Text, { style: [s.thText, s.colBedBath] }, "Beds/Baths"),
          React.createElement(Text, { style: [s.thText, s.colSqft] }, "Sqft"),
          React.createElement(Text, { style: [s.thText, s.colDist] }, "Distance"),
          React.createElement(Text, { style: [s.thText, s.colSim] }, "Similarity")
        ),
        // Data rows
        ...snapshot.comps.map((c, i) =>
          React.createElement(
            View,
            { key: i, style: [s.tableRow, i % 2 === 1 ? s.tableRowEven : {}] },
            React.createElement(Text, { style: [s.tdText, s.colNum] }, String(i + 1)),
            React.createElement(Text, { style: [s.tdText, s.colAddress] }, c.address),
            React.createElement(Text, { style: [s.tdText, s.colPrice] }, fmtCurrency(c.sale_price)),
            React.createElement(Text, { style: [s.tdText, s.colDate] }, c.sold_date ? fmtDate(c.sold_date) : "N/A"),
            React.createElement(Text, { style: [s.tdText, s.colBedBath] }, `${c.beds ?? "-"} / ${c.baths ?? "-"}`),
            React.createElement(Text, { style: [s.tdText, s.colSqft] }, c.sqft ? c.sqft.toLocaleString() : "-"),
            React.createElement(Text, { style: [s.tdText, s.colDist] }, c.distance_miles != null ? `${c.distance_miles.toFixed(1)} mi` : "-"),
            React.createElement(Text, { style: [s.tdText, s.colSim] }, c.similarity_score != null ? fmtPercent(c.similarity_score) : "-")
          )
        )
      ),

      // Recommendation
      React.createElement(
        View,
        { style: s.section },
        React.createElement(Text, { style: s.sectionTitle }, "Recommendation"),
        React.createElement(
          View,
          { style: s.recSummary },
          React.createElement(Text, null, snapshot.recommendation.summary)
        ),
        React.createElement(
          Text,
          { style: { fontFamily: "Helvetica-Bold", fontSize: 9, marginBottom: 4 } },
          "Next Steps:"
        ),
        ...snapshot.recommendation.next_steps.map((step, i) =>
          React.createElement(Text, { key: i, style: s.stepItem }, `${i + 1}. ${step}`)
        )
      ),

      // Compliance Notices
      React.createElement(
        View,
        { style: s.section },
        React.createElement(Text, { style: s.complianceTitle }, "Important Notices"),
        React.createElement(
          View,
          { style: s.complianceBox },
          React.createElement(Text, { style: s.complianceBold }, snapshot.legal.filing_is_free_notice),
          React.createElement(Text, { style: s.complianceText }, snapshot.legal.no_government_affiliation_notice),
          React.createElement(Text, { style: s.complianceText }, snapshot.legal.user_must_file_themselves_notice),
          React.createElement(Text, { style: s.complianceText }, snapshot.legal.hearing_possible_notice)
        )
      ),

      // Legal Footer
      React.createElement(
        View,
        { style: s.legal },
        ...snapshot.recommendation.notes.map((note, i) =>
          React.createElement(Text, { key: i, style: s.legalText }, note)
        ),
        React.createElement(
          Text,
          { style: [s.legalText, { marginTop: 6 }] },
          `Disclaimer (${snapshot.meta.disclaimer_version}): ${snapshot.legal.disclaimer_text}`
        ),
        React.createElement(
          Text,
          { style: s.legalText },
          `Legal acceptance recorded: ${fmtDate(snapshot.legal.checkbox_accepted_at)}`
        ),
        React.createElement(
          Text,
          { style: s.legalText },
          `Data sources: ${snapshot.meta.data_sources.join(", ")}`
        )
      )
    )
  );
}

// ── Snapshot with REAL data ──────────────────────────────────────────────────

const snapshot = {
  meta: {
    report_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    generated_at: new Date().toISOString(),
    engine_version: "e1",
    template_version: "v1",
    rule_pack_id: "00000000-0000-0000-0000-000000000001",
    disclaimer_version: "d1",
    data_sources: ["user_input"],
    pdf_version: "p1",
  },
  property: {
    formatted_address: "179 Grove St, Pt Jefferson Station, NY 11776",
    place_id: "zillow_2077468196",
    county: "Suffolk",
    beds: 3,
    baths: 2.5,
    sqft: 1800,
    year_built: 1970,
  },
  assessment: {
    assessed_value: 431000,
    assessment_year: 2025,
    parcel_id: "0200-226.00-04.00-007.000",
  },
  analysis: {
    decision: "ELIGIBLE",
    confidence: 0.85,
    factors: [
      "COMPS_FOUND",
      "COMPS_LOWER_THAN_ASSESSED",
      "LOWER_COMP_RATIO_HIGH",
    ],
    metrics: {
      comps_used_count: 4,
      comps_lower_count: 4,
      comps_lower_ratio: 1.0,
      best_lower_comp_gap: 0.035,
    },
  },
  comps: [
    {
      address: "26 Yale St, Port Jefferson Station, NY 11776",
      sale_price: 425000,
      sold_date: "2025-12-09",
      beds: 5,
      baths: 2,
      sqft: 1800,
      distance_miles: 0.5,
      similarity_score: 0.78,
      source: "user_input",
    },
    {
      address: "48 Birchwood Dr, Port Jefferson Station, NY 11776",
      sale_price: 416000,
      sold_date: "2025-11-19",
      beds: 3,
      baths: 2,
      sqft: 1275,
      distance_miles: 0.7,
      similarity_score: 0.72,
      source: "user_input",
    },
    {
      address: "38 Clymer St, Port Jefferson Station, NY 11776",
      sale_price: 455000,
      sold_date: "2025-12-23",
      beds: 5,
      baths: 3,
      sqft: 2675,
      distance_miles: 0.8,
      similarity_score: 0.65,
      source: "user_input",
    },
    {
      address: "106 Montrose Dr, Port Jefferson Station, NY 11776",
      sale_price: 425000,
      sold_date: "2025-10-31",
      beds: 3,
      baths: 2,
      sqft: 1092,
      distance_miles: 0.6,
      similarity_score: 0.74,
      source: "user_input",
    },
  ],
  recommendation: {
    summary:
      "Based on 4 comparable sales in your area, all sold below your assessed value of $431,000. The median comparable sale price is $425,000, suggesting your property may be over-assessed by approximately $6,000. Filing a tax grievance is recommended.",
    next_steps: [
      "Download your RP-524 Complaint on Real Property Assessment form from your local assessor's website.",
      "Gather supporting documentation: this report, recent comparable sales, and any property condition issues.",
      "File your grievance with the Suffolk County Board of Assessment Review (BAR) before the Grievance Day deadline (typically 3rd Tuesday in May).",
      "Attend the hearing if scheduled — you may present this report and comparable sales data.",
      "If denied, you may pursue a Small Claims Assessment Review (SCAR) in Suffolk County.",
    ],
    notes: [
      "This analysis is based on publicly available sales data and does not constitute a formal appraisal.",
      "Actual tax savings depend on your local tax rate and the final assessed value after review.",
      "Past grievance results do not guarantee future outcomes.",
    ],
  },
  legal: {
    checkbox_accepted_at: new Date().toISOString(),
    disclaimer_text:
      "This report is for informational purposes only and does not constitute legal, financial, or appraisal advice. TaxGrievancePro is not a law firm and does not provide legal representation. Results are estimates based on available data and are not guaranteed. You should consult with a qualified professional before making decisions based on this report.",
    filing_is_free_notice:
      "IMPORTANT: Filing a property tax grievance (RP-524) is FREE through your local assessor or Board of Assessment Review (BAR). You do not need to pay anyone to file.",
    no_government_affiliation_notice:
      "TaxGrievancePro is not affiliated with any town, county, or state government agency. This product does not provide legal or tax advice.",
    user_must_file_themselves_notice:
      "You must file the grievance yourself or through a licensed representative. This report is a tool to support your filing — it is not a filing service.",
    hearing_possible_notice:
      "If your grievance proceeds, you may be required to attend a hearing before the Board of Assessment Review. Be prepared to present comparable sales evidence.",
  },
};

// ── Generate PDF ─────────────────────────────────────────────────────────────

async function main() {
  console.log("Generating PDF report for 179 Grove St...");

  const element = React.createElement(ReportPdfDocument, { snapshot });
  const pdfBuffer = await renderToBuffer(element);

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const outPath = join(__dirname, "..", "179-Grove-St-Report-v2.pdf");

  writeFileSync(outPath, pdfBuffer);
  console.log(`\n✅ PDF generated successfully!`);
  console.log(`📄 Output: ${outPath}`);
  console.log(`📏 Size: ${(pdfBuffer.length / 1024).toFixed(1)} KB`);
}

main().catch((err) => {
  console.error("Failed to generate PDF:", err);
  process.exit(1);
});
