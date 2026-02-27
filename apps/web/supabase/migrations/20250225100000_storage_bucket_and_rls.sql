-- TaxGrievancePro — Storage Bucket for PDF Reports
-- PRD §16: Bucket = "reports", Path = "reports/{report_id}.pdf", RLS = auth.uid() = reports.user_id

-- Create storage bucket for PDF reports
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reports',
  'reports',
  false,
  10485760,  -- 10MB max per PDF
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Users can only read their own reports
-- The path convention is: reports/{report_id}.pdf
-- We check ownership by joining storage.objects path to reports table
CREATE POLICY "reports_storage_select_own"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'reports'
  AND EXISTS (
    SELECT 1 FROM public.reports r
    WHERE r.id::text = SPLIT_PART(name, '.', 1)  -- name = "{report_id}.pdf"
    AND r.user_id = auth.uid()
  )
);

-- Service role can insert (PDF generation runs server-side)
-- No INSERT policy for anon/authenticated — only service_role can upload
