/**
 * TaxGrievancePro — PDF Generator
 * PRD §16: @react-pdf/renderer → Supabase Storage
 * Runtime: Node.js serverless. Works on Vercel Free tier (no headless browser).
 * Reads ONLY content_snapshot. No external API calls.
 */

import React from "react";
import type { ReportSnapshot } from "~/lib/schemas/report.schema";

interface GeneratePdfResult {
  pdf_url: string;
}

export async function generatePdfAndUpload(
  reportId: string,
  snapshot: ReportSnapshot,
  supabaseUrl: string,
  supabaseServiceKey: string
): Promise<GeneratePdfResult> {
  // 1. Lazy-import react-pdf to keep cold start minimal
  const { renderToBuffer } = await import("@react-pdf/renderer");
  const { ReportPdfDocument } = await import("./react-pdf-template");

  // 2. Render PDF buffer from snapshot (no external calls)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(ReportPdfDocument, { snapshot }) as any;
  const pdfBuffer = await renderToBuffer(element);

  // 3. Upload to Supabase Storage (service role — bypasses RLS)
  const storagePath = `${reportId}.pdf`;
  const uploadUrl = `${supabaseUrl}/storage/v1/object/reports/${storagePath}`;

  // Convert Buffer to Uint8Array for fetch body compatibility
  const body = new Uint8Array(pdfBuffer);

  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${supabaseServiceKey}`,
      "Content-Type": "application/pdf",
      "x-upsert": "true",
    },
    body,
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    throw new Error(
      `Storage upload failed (${uploadResponse.status}): ${errorText}`
    );
  }

  // 4. Return the storage path (not a signed URL — signing happens on download)
  const pdf_url = `reports/${storagePath}`;

  return { pdf_url };
}
