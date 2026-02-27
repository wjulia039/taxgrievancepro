import { SupabaseClient } from "@supabase/supabase-js";

/** Returns the start/end ISO strings for the current Eastern-Time calendar day. */
function getEasternDayBounds(): { start: string; end: string } {
  const etDate = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/New_York",
  });
  return { start: `${etDate}T00:00:00`, end: `${etDate}T23:59:59` };
}

/**
 * IP rate limit — database-backed so it survives serverless cold starts.
 * Counts audit_events rows whose `ip` column matches and were created today (ET).
 */
export async function checkIpRateLimit(
  supabase: SupabaseClient,
  ip: string,
  limit: number,
): Promise<{ allowed: boolean; remaining: number }> {
  if (ip === "unknown") return { allowed: true, remaining: limit };

  const { start, end } = getEasternDayBounds();
  const { count, error } = await supabase
    .from("audit_events")
    .select("*", { count: "exact", head: true })
    .eq("ip", ip)
    .gte("created_at", start)
    .lte("created_at", end);

  if (error) {
    console.error("[rate-limit] Failed to check IP rate:", error.message);
    return { allowed: true, remaining: limit }; // fail open
  }

  const used = count ?? 0;
  if (used >= limit) return { allowed: false, remaining: 0 };
  return { allowed: true, remaining: limit - used };
}

/**
 * User rate limit — counts prechecks rows for this user created today (ET).
 * Acts as a coarse anti-abuse guard before the finer FREE_DAILY_LIMIT check
 * inside PrecheckService.
 */
export async function checkUserRateLimit(
  supabase: SupabaseClient,
  userId: string,
  limit: number,
): Promise<{ allowed: boolean; remaining: number }> {
  const { start, end } = getEasternDayBounds();
  const { count, error } = await supabase
    .from("prechecks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", start)
    .lte("created_at", end);

  if (error) {
    console.error("[rate-limit] Failed to check user rate:", error.message);
    return { allowed: true, remaining: limit }; // fail open
  }

  const used = count ?? 0;
  if (used >= limit) return { allowed: false, remaining: 0 };
  return { allowed: true, remaining: limit - used };
}

export async function checkRateLimits(params: {
  supabase: SupabaseClient;
  ip: string;
  userId: string;
  ipLimit: number;
  userLimit: number;
}): Promise<{ allowed: boolean; layer?: "ip" | "user" }> {
  const [ipResult, userResult] = await Promise.all([
    checkIpRateLimit(params.supabase, params.ip, params.ipLimit),
    checkUserRateLimit(params.supabase, params.userId, params.userLimit),
  ]);

  if (!ipResult.allowed) return { allowed: false, layer: "ip" };
  if (!userResult.allowed) return { allowed: false, layer: "user" };
  return { allowed: true };
}
