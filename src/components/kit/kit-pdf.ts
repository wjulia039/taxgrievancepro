import { jsPDF } from "jspdf";

import type { KitState } from "@/lib/kit-schema";

export function buildAppealPdf(s: KitState) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });

  const margin = 48;
  const pageWidth = doc.internal.pageSize.getWidth();
  const usable = pageWidth - margin * 2;

  doc.setFont("times", "normal");

  doc.setFontSize(18);
  doc.text("Property Tax Appeal Kit", margin, 72);

  doc.setFontSize(12);
  doc.text("TaxGrievancePro (Suffolk County, NY)", margin, 92);

  doc.setLineWidth(1);
  doc.line(margin, 108, pageWidth - margin, 108);

  let y = 132;

  doc.setFontSize(14);
  doc.text("Subject Property", margin, y);
  y += 18;

  doc.setFontSize(11);
  const addr = [s.address1, s.address2, `${s.city}, ${s.state} ${s.zip}`]
    .filter(Boolean)
    .join("\n");

  y = writeBlock(doc, `Owner: ${s.ownerName || "(not provided)"}`, margin, y, usable);
  y = writeBlock(doc, `Address:\n${addr || "(not provided)"}`, margin, y, usable);

  y = writeBlock(
    doc,
    `Beds/Baths: ${fmtNum(s.beds)}/${fmtNum(s.baths)}    Sqft: ${fmtNum(s.sqft)}    Year Built: ${fmtNum(s.yearBuilt)}`,
    margin,
    y,
    usable,
  );

  y = writeBlock(
    doc,
    `Assessed Value: ${fmtCurrency(s.assessedValue)}    Tax Year: ${s.taxYear || ""}    Notice Date: ${s.noticeDate || ""}`,
    margin,
    y,
    usable,
  );

  y += 8;
  doc.setFontSize(14);
  doc.text("Comparable Sales (User Provided)", margin, y);
  y += 16;

  doc.setFontSize(10);
  if (!s.comps.length) {
    y = writeBlock(doc, "No comparable sales were entered.", margin, y, usable);
  } else {
    for (const [i, c] of s.comps.entries()) {
      const line = `${i + 1}. ${c.address} | ${c.saleDate} | $${c.salePrice} | ${c.sqft} sqft`;
      y = writeBlock(doc, line, margin, y, usable);
    }
  }

  y += 10;
  doc.setFontSize(12);
  y = writeBlock(
    doc,
    "Disclaimer: This kit is for informational purposes only and does not constitute legal or tax advice. Review all information before submission.",
    margin,
    y,
    usable,
  );

  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toISOString()}`, margin, doc.internal.pageSize.getHeight() - 28);

  return doc;
}

function writeBlock(doc: jsPDF, text: string, x: number, y: number, maxWidth: number) {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * 14;
}

function fmtNum(v: number | "") {
  if (typeof v !== "number") return "-";
  return String(v);
}

function fmtCurrency(v: number | "") {
  if (typeof v !== "number") return "-";
  return `$${Math.round(v).toLocaleString("en-US")}`;
}
