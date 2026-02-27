import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerAdminClient } from "@kit/supabase/server-admin-client";

/**
 * GET /api/leads/confirm?id=<lead_uuid>
 *
 * Called when a user clicks the confirmation link in their opt-in email.
 * Sets opt_in_confirmed_at on the lead and redirects to the home page.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const supabase = getSupabaseServerAdminClient();

  const { error } = await supabase
    .from("leads")
    .update({ opt_in_confirmed_at: new Date().toISOString() })
    .eq("id", id)
    .is("opt_in_confirmed_at", null); // only confirm once

  if (error) {
    console.error("[leads/confirm] Failed to confirm lead:", error.message);
    // Still redirect — don't expose internal errors to the user
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://taxgrievancepro.com";
  return NextResponse.redirect(
    `${siteUrl}/home?confirmed=1`,
    { status: 302 },
  );
}
