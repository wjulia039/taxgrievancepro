import { SupabaseClient } from "@supabase/supabase-js";

export interface SystemConfig {
  FREE_DAILY_LIMIT: number;
  PRECHECK_DELAY_MS: number;
  ADDRESS_SCORE_MODAL_THRESHOLD: number;
  ADDRESS_SCORE_OK: number;
  RATE_LIMIT_IP: number;
  RATE_LIMIT_USER: number;
  DEFAULT_RECONTACT_MONTH_SUFFOLK: number;
  DEFAULT_RECONTACT_MONTH_NASSAU: number;
  REPORT_PRICE_USD: number;
  REPORT_MAX_AUTO_RETRIES: number;
  REPORT_MAX_MANUAL_RETRIES: number;
  ATTOM_TIMEOUT_MS: number;
  PROPAPIS_TIMEOUT_MS: number;
  RENTCAST_TIMEOUT_MS: number;
  PRECHECK_TOTAL_BUDGET_MS: number;
}

const DEFAULTS: SystemConfig = {
  FREE_DAILY_LIMIT: 10,
  PRECHECK_DELAY_MS: 2500,
  ADDRESS_SCORE_MODAL_THRESHOLD: 70,
  ADDRESS_SCORE_OK: 90,
  RATE_LIMIT_IP: 20,
  RATE_LIMIT_USER: 10,
  DEFAULT_RECONTACT_MONTH_SUFFOLK: 1,
  DEFAULT_RECONTACT_MONTH_NASSAU: 1,
  REPORT_PRICE_USD: 9.99,
  REPORT_MAX_AUTO_RETRIES: 3,
  REPORT_MAX_MANUAL_RETRIES: 5,
  ATTOM_TIMEOUT_MS: 5000,
  PROPAPIS_TIMEOUT_MS: 5000,
  RENTCAST_TIMEOUT_MS: 8000,
  PRECHECK_TOTAL_BUDGET_MS: 12000,
};

export async function loadSystemConfig(supabase: SupabaseClient): Promise<SystemConfig> {
  const { data, error } = await supabase.from("system_configs").select("key, value");
  if (error) {
    console.error("[config] Failed to load system configs, using defaults:", error.message);
    return { ...DEFAULTS };
  }
  const config = { ...DEFAULTS };
  for (const row of data ?? []) {
    const key = row.key as keyof SystemConfig;
    if (key in config) {
      const parsed = typeof row.value === "string" ? JSON.parse(row.value) : row.value;
      (config as Record<string, unknown>)[key] = Number(parsed);
    }
  }
  return config;
}

export async function loadConfigValue<K extends keyof SystemConfig>(
  supabase: SupabaseClient,
  key: K
): Promise<SystemConfig[K]> {
  const { data, error } = await supabase.from("system_configs").select("value").eq("key", key).single();
  if (error || !data) return DEFAULTS[key];
  const parsed = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
  return Number(parsed) as SystemConfig[K];
}
