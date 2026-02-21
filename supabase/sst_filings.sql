-- SST Filing periods and status tracking for CukaiPro
-- Run this in Supabase SQL Editor to create sst_filings table and RLS

-- Create sst_filings table
CREATE TABLE IF NOT EXISTS sst_filings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  due_date date NOT NULL,
  total_amount numeric(14, 2) DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'submitted')),
  submitted_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, period_start)
);

-- Index for faster lookups by org and period
CREATE INDEX IF NOT EXISTS idx_sst_filings_org_period ON sst_filings(organization_id, period_start DESC);

-- Enable RLS
ALTER TABLE sst_filings ENABLE ROW LEVEL SECURITY;

-- RLS policies (same pattern as tax_deductions)
DROP POLICY IF EXISTS "Users can view sst filings for their org" ON sst_filings;
DROP POLICY IF EXISTS "Users can insert sst filings for their org" ON sst_filings;
DROP POLICY IF EXISTS "Users can update sst filings for their org" ON sst_filings;
DROP POLICY IF EXISTS "Users can delete sst filings for their org" ON sst_filings;

CREATE POLICY "Users can view sst filings for their org"
ON sst_filings FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_members.organization_id = sst_filings.organization_id
    AND organization_members.user_id = auth.uid()
    AND organization_members.status = 'active'
  )
);

CREATE POLICY "Users can insert sst filings for their org"
ON sst_filings FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_members.organization_id = sst_filings.organization_id
    AND organization_members.user_id = auth.uid()
    AND organization_members.status = 'active'
  )
);

CREATE POLICY "Users can update sst filings for their org"
ON sst_filings FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_members.organization_id = sst_filings.organization_id
    AND organization_members.user_id = auth.uid()
    AND organization_members.status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_members.organization_id = sst_filings.organization_id
    AND organization_members.user_id = auth.uid()
    AND organization_members.status = 'active'
  )
);

CREATE POLICY "Users can delete sst filings for their org"
ON sst_filings FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_members.organization_id = sst_filings.organization_id
    AND organization_members.user_id = auth.uid()
    AND organization_members.status = 'active'
  )
);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_sst_filings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sst_filings_updated_at ON sst_filings;
CREATE TRIGGER sst_filings_updated_at
  BEFORE UPDATE ON sst_filings
  FOR EACH ROW
  EXECUTE FUNCTION update_sst_filings_updated_at();
