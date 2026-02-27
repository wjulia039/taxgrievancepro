/**
 * TaxGrievancePro — PDF HTML Template
 * Renders ReportSnapshot into a self-contained HTML string for puppeteer.pdf().
 * PRD §14, §16: Reads ONLY content_snapshot. No external calls.
 */

import type { ReportSnapshot } from "~/lib/schemas/report.schema";

function formatCurrency(value: number | undefined): string {
  if (value == null) return "N/A";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return iso;
  }
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function renderCompsTable(snapshot: ReportSnapshot): string {
  if (snapshot.comps.length === 0) {
    return `<p class="no-data">No comparable sales data available.</p>`;
  }

  const rows = snapshot.comps
    .map(
      (c, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${c.address}</td>
      <td>${formatCurrency(c.sale_price)}</td>
      <td>${c.sold_date ? formatDate(c.sold_date) : "N/A"}</td>
      <td>${c.beds ?? "-"} / ${c.baths ?? "-"}</td>
      <td>${c.sqft ? c.sqft.toLocaleString() : "-"}</td>
      <td>${c.distance_miles != null ? `${c.distance_miles.toFixed(1)} mi` : "-"}</td>
      <td>${c.similarity_score != null ? formatPercent(c.similarity_score) : "-"}</td>
    </tr>`
    )
    .join("\n");

  return `
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Address</th>
          <th>Sale Price</th>
          <th>Sold Date</th>
          <th>Beds/Baths</th>
          <th>Sqft</th>
          <th>Distance</th>
          <th>Similarity</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function renderFactors(factors: string[]): string {
  const labels: Record<string, string> = {
    COMPS_FOUND: "Comparable sales found",
    COMPS_LOWER_THAN_ASSESSED: "Sales below assessed value identified",
    LOWER_COMP_RATIO_HIGH: "High ratio of lower-valued comparables",
    ADDRESS_QUALITY_LOW: "Address quality below threshold",
    PROPERTY_DATA_CONFLICT: "Property data conflict detected",
    INSUFFICIENT_COMPS: "Insufficient comparable sales",
    OUTLIER_FILTERED: "Outlier sales filtered from analysis",
  };

  return factors
    .map((f) => `<li>${labels[f] ?? f}</li>`)
    .join("\n");
}

export function renderReportHtml(snapshot: ReportSnapshot): string {
  const isEligible = snapshot.analysis.decision === "ELIGIBLE";
  const decisionColor = isEligible ? "#2ECC71" : "#E74C3C";
  const decisionText = isEligible ? "ELIGIBLE" : "NOT ELIGIBLE";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tax Grievance Report — ${snapshot.property.formatted_address}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #1a1a1a;
      font-size: 11px;
      line-height: 1.5;
      padding: 40px;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #2ECC71;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .header-left h1 { font-size: 20px; color: #2ECC71; font-weight: 700; }
    .header-left p { font-size: 10px; color: #888; margin-top: 2px; }
    .header-right { text-align: right; font-size: 9px; color: #888; }

    /* Decision Banner */
    .decision-banner {
      background: ${decisionColor};
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .decision-banner h2 { font-size: 18px; font-weight: 700; }
    .decision-banner .confidence { font-size: 14px; opacity: 0.9; }

    /* Sections */
    .section { margin-bottom: 20px; }
    .section-title {
      font-size: 13px;
      font-weight: 700;
      color: #2ECC71;
      border-bottom: 1px solid #e0e0e0;
      padding-bottom: 6px;
      margin-bottom: 12px;
    }

    /* Info Grid */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 24px;
    }
    .info-item { display: flex; gap: 8px; }
    .info-label { font-weight: 600; color: #555; min-width: 120px; }
    .info-value { color: #1a1a1a; }

    /* Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 8px;
    }
    .metric-card {
      background: #f8f9fa;
      border-radius: 6px;
      padding: 12px;
      text-align: center;
    }
    .metric-value { font-size: 18px; font-weight: 700; color: #2ECC71; }
    .metric-label { font-size: 9px; color: #888; margin-top: 2px; }

    /* Factors */
    .factors-list { list-style: none; padding: 0; }
    .factors-list li {
      padding: 4px 0 4px 16px;
      position: relative;
      font-size: 10px;
    }
    .factors-list li::before {
      content: "\\2713";
      position: absolute;
      left: 0;
      color: #2ECC71;
      font-weight: 700;
    }

    /* Table */
    table { width: 100%; border-collapse: collapse; font-size: 10px; }
    th {
      background: #f8f9fa;
      padding: 8px 6px;
      text-align: left;
      font-weight: 600;
      color: #555;
      border-bottom: 2px solid #e0e0e0;
    }
    td {
      padding: 6px;
      border-bottom: 1px solid #eee;
    }
    tr:nth-child(even) { background: #fafbfc; }

    /* Recommendation */
    .recommendation-summary {
      background: #f0faf4;
      border-left: 4px solid #2ECC71;
      padding: 12px 16px;
      margin-bottom: 12px;
      font-size: 11px;
    }
    .next-steps { padding-left: 20px; }
    .next-steps li { margin-bottom: 4px; font-size: 10px; }

    /* Legal / Footer */
    .legal {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
      font-size: 9px;
      color: #999;
    }
    .legal p { margin-bottom: 4px; }
    .no-data { color: #999; font-style: italic; }

    /* Print optimization */
    @media print {
      body { padding: 20px; }
      .decision-banner { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .metric-card { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <div class="header-left">
      <h1>TaxGrievancePro</h1>
      <p>Property Tax Eligibility Report</p>
    </div>
    <div class="header-right">
      <p>Report ID: ${snapshot.meta.report_id.slice(0, 8)}...</p>
      <p>Generated: ${formatDate(snapshot.meta.generated_at)}</p>
      <p>Engine: ${snapshot.meta.engine_version} | Template: ${snapshot.meta.template_version}</p>
    </div>
  </div>

  <!-- Decision Banner -->
  <div class="decision-banner">
    <h2>${decisionText}</h2>
    <span class="confidence">Confidence: ${formatPercent(snapshot.analysis.confidence)}</span>
  </div>

  <!-- Property Details -->
  <div class="section">
    <div class="section-title">Property Details</div>
    <div class="info-grid">
      <div class="info-item"><span class="info-label">Address:</span><span class="info-value">${snapshot.property.formatted_address}</span></div>
      <div class="info-item"><span class="info-label">County:</span><span class="info-value">${snapshot.property.county}</span></div>
      <div class="info-item"><span class="info-label">Beds / Baths:</span><span class="info-value">${snapshot.property.beds} / ${snapshot.property.baths}</span></div>
      <div class="info-item"><span class="info-label">Sqft:</span><span class="info-value">${snapshot.property.sqft > 0 ? snapshot.property.sqft.toLocaleString() : "N/A"}</span></div>
      <div class="info-item"><span class="info-label">Year Built:</span><span class="info-value">${snapshot.property.year_built ?? "N/A"}</span></div>
      <div class="info-item"><span class="info-label">Assessed Value:</span><span class="info-value">${formatCurrency(snapshot.assessment.assessed_value)}</span></div>
      ${snapshot.assessment.parcel_id ? `<div class="info-item"><span class="info-label">Parcel ID:</span><span class="info-value">${snapshot.assessment.parcel_id}</span></div>` : ""}
      ${snapshot.assessment.assessment_year ? `<div class="info-item"><span class="info-label">Assessment Year:</span><span class="info-value">${snapshot.assessment.assessment_year}</span></div>` : ""}
    </div>
  </div>

  <!-- Analysis Metrics -->
  <div class="section">
    <div class="section-title">Analysis Summary</div>
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-value">${snapshot.analysis.metrics.comps_used_count}</div>
        <div class="metric-label">Comps Used</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${snapshot.analysis.metrics.comps_lower_count}</div>
        <div class="metric-label">Below Assessed</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${formatPercent(snapshot.analysis.metrics.comps_lower_ratio)}</div>
        <div class="metric-label">Lower Ratio</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${formatPercent(snapshot.analysis.metrics.best_lower_comp_gap)}</div>
        <div class="metric-label">Best Gap</div>
      </div>
    </div>

    ${snapshot.analysis.factors.length > 0 ? `
    <p style="font-weight: 600; font-size: 10px; margin: 8px 0 4px;">Key Factors:</p>
    <ul class="factors-list">${renderFactors(snapshot.analysis.factors)}</ul>
    ` : ""}
  </div>

  <!-- Comparable Sales -->
  <div class="section">
    <div class="section-title">Comparable Sales (${snapshot.comps.length})</div>
    ${renderCompsTable(snapshot)}
  </div>

  <!-- Recommendation -->
  <div class="section">
    <div class="section-title">Recommendation</div>
    <div class="recommendation-summary">${snapshot.recommendation.summary}</div>
    <p style="font-weight: 600; font-size: 10px; margin-bottom: 4px;">Next Steps:</p>
    <ol class="next-steps">
      ${snapshot.recommendation.next_steps.map((s) => `<li>${s}</li>`).join("\n")}
    </ol>
  </div>

  <!-- NY Compliance Notices — PRD §14, §16, §19 -->
  <div class="section" style="margin-top: 16px;">
    <div class="section-title" style="color: #555;">Important Notices</div>
    <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 12px 16px; font-size: 10px; color: #92400e; margin-bottom: 12px;">
      <p style="margin-bottom: 4px; font-weight: 600;">${snapshot.legal.filing_is_free_notice}</p>
      <p style="margin-bottom: 4px;">${snapshot.legal.no_government_affiliation_notice}</p>
      <p style="margin-bottom: 4px;">${snapshot.legal.user_must_file_themselves_notice}</p>
      <p>${snapshot.legal.hearing_possible_notice}</p>
    </div>
  </div>

  <!-- Legal / Disclaimer -->
  <div class="legal">
    ${snapshot.recommendation.notes.map((n) => `<p>${n}</p>`).join("\n")}
    <p style="margin-top: 8px;">Disclaimer (${snapshot.meta.disclaimer_version}): ${snapshot.legal.disclaimer_text}</p>
    <p>Legal acceptance recorded: ${formatDate(snapshot.legal.checkbox_accepted_at)}</p>
    <p>Data sources: ${snapshot.meta.data_sources.join(", ")}</p>
  </div>

</body>
</html>`;
}
