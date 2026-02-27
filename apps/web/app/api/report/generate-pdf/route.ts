/**
 * POST /api/report/generate-pdf
 *
 * PRD §16: Internal-only endpoint for PDF generation.
 * - Accepts INTERNAL_API_SECRET bearer token (NOT user auth).
 * - Runtime: Node.js (NOT Edge). Uses @react-pdf/renderer (Vercel Free compatible).
 * - Reads content_snapshot → React PDF → Supabase Storage.
 * - Returns { pdf_url: string }.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ReportSnapshotSchema } from "~/lib/schemas/report.schema";
import { generatePdfAndUpload } from "~/lib/pdf/generator";

// Force Node.js runtime (@react-pdf/renderer needs Node APIs)
export const runtime = "nodejs";

const RequestSchema = z.object({
  report_id: z.string().uuid(),
  snapshot: ReportSnapshotSchema,
});

export async function POST(request: NextRequest) {
  try {
    // 1. Verify internal API secret
    const authHeader = request.headers.get("authorization");
    const expectedSecret = process.env.INTERNAL_API_SECRET;

    if (!expectedSecret) {
      console.error("[generate-pdf] INTERNAL_API_SECRET not configured");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    if (!authHeader?.startsWith("Bearer ") || authHeader.slice(7) !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Validate request body
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { report_id, snapshot } = parsed.data;

    // 3. Generate PDF and upload to Supabase Storage
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[generate-pdf] Missing Supabase env vars");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const result = await generatePdfAndUpload(
      report_id,
      snapshot,
      supabaseUrl,
      supabaseServiceKey
    );

    return NextResponse.json({ pdf_url: result.pdf_url }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[generate-pdf] Error:", message);
    return NextResponse.json({ error: `PDF generation failed: ${message}` }, { status: 500 });
  }
}
