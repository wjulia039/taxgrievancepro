import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerAdminClient } from "@kit/supabase/server-admin-client";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const token = authHeader.slice(7);
    const supabase = getSupabaseServerAdminClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const orderId = request.nextUrl.searchParams.get("order_id");
    if (!orderId) return NextResponse.json({ error: "order_id is required" }, { status: 400 });

    // Cast: database types not yet regenerated for custom tables
    const client = supabase as any;
    const { data: order, error: orderError } = await client.from("orders").select("id, status").eq("id", orderId).eq("user_id", user.id).single() as { data: any; error: any };
    if (orderError || !order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const { data: report } = await client.from("reports").select("id, pdf_url, attempt_count, last_error, generated_at").eq("order_id", orderId).eq("user_id", user.id).single() as { data: any; error: any };

    return NextResponse.json({
      order_id: order.id, order_status: order.status,
      report: report ? { id: report.id, pdf_url: report.pdf_url, attempt_count: report.attempt_count, last_error: report.last_error, generated_at: report.generated_at } : null,
    });
  } catch (error) {
    console.error("[report-status] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
