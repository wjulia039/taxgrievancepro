-- ============================================================
-- TaxGrievancePro — Complete Database Setup
-- Run this ONCE in Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- ==================== PART 1: Schema ====================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- system_configs
CREATE TABLE IF NOT EXISTS system_configs (
  key   TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO system_configs (key, value) VALUES
  ('FREE_DAILY_LIMIT', '1'), ('PRECHECK_DELAY_MS', '2500'),
  ('ADDRESS_SCORE_MODAL_THRESHOLD', '70'), ('ADDRESS_SCORE_OK', '90'),
  ('RATE_LIMIT_IP', '20'), ('RATE_LIMIT_USER', '10'),
  ('DEFAULT_RECONTACT_MONTH_SUFFOLK', '1'), ('DEFAULT_RECONTACT_MONTH_NASSAU', '1'),
  ('REPORT_PRICE_USD', '9.99'), ('REPORT_MAX_AUTO_RETRIES', '3'),
  ('REPORT_MAX_MANUAL_RETRIES', '5'), ('ATTOM_TIMEOUT_MS', '5000'),
  ('PROPAPIS_TIMEOUT_MS', '5000'), ('PRECHECK_TOTAL_BUDGET_MS', '12000')
ON CONFLICT (key) DO NOTHING;

-- rule_packs
CREATE TABLE IF NOT EXISTS rule_packs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  rules_json JSONB NOT NULL,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- properties
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  formatted_address TEXT NOT NULL,
  street_number TEXT, route TEXT, locality TEXT, postal_code TEXT, country TEXT, unit_number TEXT,
  place_id TEXT NOT NULL,
  lat NUMERIC NOT NULL, lng NUMERIC NOT NULL,
  address_quality_score INTEGER,
  geocode_status TEXT NOT NULL DEFAULT 'UNVERIFIED' CHECK (geocode_status IN ('UNVERIFIED','PARTIAL','VERIFIED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_properties_place_id ON properties (place_id);

-- prechecks
CREATE TABLE IF NOT EXISTS prechecks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  property_id UUID NOT NULL REFERENCES properties(id),
  decision TEXT NOT NULL CHECK (decision IN ('PENDING','ELIGIBLE','NOT_ELIGIBLE')),
  confidence NUMERIC CHECK (confidence >= 0 AND confidence <= 1),
  factors TEXT[] DEFAULT '{}',
  metrics JSONB,
  snapshot_config JSONB,
  rule_pack_id UUID REFERENCES rule_packs(id),
  metadata JSONB,
  confirmed_by_user BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_prechecks_user_id ON prechecks (user_id);

-- orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  precheck_id UUID NOT NULL REFERENCES prechecks(id),
  payment_intent_id TEXT UNIQUE,
  idempotency_key TEXT,
  status TEXT NOT NULL DEFAULT 'CREATED' CHECK (status IN ('CREATED','PAYMENT_PENDING','PAID','PROCESSING','COMPLETED','FAILED','CANCELED')),
  legal_accepted_at TIMESTAMPTZ,
  disclaimer_version TEXT NOT NULL DEFAULT 'd1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_active_unique ON orders (user_id, precheck_id) WHERE status IN ('CREATED','PAYMENT_PENDING','PAID','PROCESSING','COMPLETED');

-- reports
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL UNIQUE REFERENCES orders(id),
  user_id UUID NOT NULL,
  template_version TEXT NOT NULL DEFAULT 'v1',
  engine_version TEXT NOT NULL DEFAULT 'e1',
  content_snapshot JSONB,
  pdf_url TEXT,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports (user_id);

-- audit_events
CREATE TABLE IF NOT EXISTS audit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  event_type TEXT NOT NULL CHECK (event_type IN ('PRECHECK_CREATED','ORDER_CREATED','PAYMENT_SUCCEEDED','PAYMENT_FAILED','REPORT_GENERATION_STARTED','REPORT_GENERATION_FAILED','REPORT_GENERATED','REPORT_VIEWED','REPORT_DOWNLOAD_REQUESTED','LEAD_SUBMITTED')),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  ip TEXT, user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_events_user_id ON audit_events (user_id);

-- leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  email TEXT NOT NULL,
  tag TEXT NOT NULL,
  recontact_month INTEGER,
  opt_in_confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads (user_id);

-- ==================== PART 2: RLS Policies ====================

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "properties_select" ON properties FOR SELECT USING (true);
CREATE POLICY "properties_insert" ON properties FOR INSERT WITH CHECK (true);

ALTER TABLE prechecks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prechecks_select_own" ON prechecks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "prechecks_insert_own" ON prechecks FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_select_own" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders_insert_own" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports_select_own" ON reports FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_events_select_own" ON audit_events FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leads_select_own" ON leads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "leads_insert_own" ON leads FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE system_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "system_configs_select" ON system_configs FOR SELECT USING (true);

ALTER TABLE rule_packs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rule_packs_select_published" ON rule_packs FOR SELECT USING (published = true);

-- ==================== PART 3: Functions & Triggers ====================

CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row-level lock for report generation (prevents duplicate processing)
CREATE OR REPLACE FUNCTION lock_order_for_processing(p_order_id UUID)
RETURNS SETOF orders LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN RETURN QUERY SELECT * FROM orders WHERE id = p_order_id FOR UPDATE; END; $$;

-- ==================== PART 4: Seed Data ====================

INSERT INTO rule_packs (id, name, version, rules_json, published) VALUES (
  'a0000000-0000-0000-0000-000000000001', 'MVP Rules v1', 1,
  '{"min_comps":3,"min_lower_comps":1,"outlier_low_factor":0.5,"outlier_high_factor":2.0,"max_comp_age_months":12,"confidence_base":0.35,"confidence_comps_5_bonus":0.25,"confidence_ratio_40_bonus":0.20,"confidence_gap_10_bonus":0.10,"confidence_low_quality_penalty":-0.15,"confidence_conflict_penalty":-0.10,"low_quality_threshold":70}',
  true
) ON CONFLICT DO NOTHING;

-- ==================== PART 5: Storage Bucket ====================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reports',
  'reports',
  false,
  10485760,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Users can only read their own reports
CREATE POLICY "reports_storage_select_own"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'reports'
  AND EXISTS (
    SELECT 1 FROM public.reports r
    WHERE r.id::text = SPLIT_PART(name, '.', 1)
    AND r.user_id = auth.uid()
  )
);

-- ============================================================
-- DONE! All tables, indexes, RLS, functions, and seed data created.
-- ============================================================
