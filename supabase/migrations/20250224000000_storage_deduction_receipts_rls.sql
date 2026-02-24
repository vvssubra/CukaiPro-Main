-- Fix "new row violates row-level security policy" when uploading receipts on the Deductions page.
-- Storage bucket "deduction-receipts" must allow org members to INSERT (upload) and SELECT (read).
-- Path format used by the app: {organization_id}/{filename}

-- Ensure the bucket exists (idempotent). Skip if you already created it in the dashboard.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'deduction-receipts',
  'deduction-receipts',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Org members can upload deduction receipts" ON storage.objects;
DROP POLICY IF EXISTS "Org members can read deduction receipts" ON storage.objects;
DROP POLICY IF EXISTS "Org members can update deduction receipts" ON storage.objects;
DROP POLICY IF EXISTS "Org members can delete deduction receipts" ON storage.objects;

-- INSERT: allow authenticated org members to upload to their org folder (path = org_id/filename)
CREATE POLICY "Org members can upload deduction receipts"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'deduction-receipts'
  AND EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organization_id::text = (storage.foldername(name))[1]
    AND om.user_id = auth.uid()
    AND om.status = 'active'
  )
);

-- SELECT: allow authenticated org members to read objects in their org folder
CREATE POLICY "Org members can read deduction receipts"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'deduction-receipts'
  AND EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organization_id::text = (storage.foldername(name))[1]
    AND om.user_id = auth.uid()
    AND om.status = 'active'
  )
);

-- UPDATE: allow org members to update (replace) receipts in their org folder
CREATE POLICY "Org members can update deduction receipts"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'deduction-receipts'
  AND EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organization_id::text = (storage.foldername(name))[1]
    AND om.user_id = auth.uid()
    AND om.status = 'active'
  )
)
WITH CHECK (
  bucket_id = 'deduction-receipts'
  AND EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organization_id::text = (storage.foldername(name))[1]
    AND om.user_id = auth.uid()
    AND om.status = 'active'
  )
);

-- DELETE: allow org members to delete receipts in their org folder
CREATE POLICY "Org members can delete deduction receipts"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'deduction-receipts'
  AND EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organization_id::text = (storage.foldername(name))[1]
    AND om.user_id = auth.uid()
    AND om.status = 'active'
  )
);
