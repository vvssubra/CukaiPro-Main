-- Run this in Supabase SQL Editor to set up Phase 6 & 7
-- 1. EA forms (ea_forms table)
-- 2. SST filings (sst_filings table)
-- 3. email_sent_at for invitations (if not already present)

-- ========== EA FORMS ==========
CREATE TABLE IF NOT EXISTS ea_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  tax_year INTEGER NOT NULL,
  employee_name TEXT NOT NULL,
  employee_ic TEXT,
  employee_tax_no TEXT,
  gross_salary NUMERIC(14, 2) DEFAULT 0,
  allowances NUMERIC(14, 2) DEFAULT 0,
  bonuses NUMERIC(14, 2) DEFAULT 0,
  benefits_in_kind NUMERIC(14, 2) DEFAULT 0,
  overtime NUMERIC(14, 2) DEFAULT 0,
  director_fees NUMERIC(14, 2) DEFAULT 0,
  commission NUMERIC(14, 2) DEFAULT 0,
  epf_employee NUMERIC(14, 2) DEFAULT 0,
  epf_employer NUMERIC(14, 2) DEFAULT 0,
  socso NUMERIC(14, 2) DEFAULT 0,
  eis NUMERIC(14, 2) DEFAULT 0,
  pcb NUMERIC(14, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ea_forms_org_year ON ea_forms(organization_id, tax_year);
ALTER TABLE ea_forms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view EA forms for their org" ON ea_forms;
DROP POLICY IF EXISTS "Users can insert EA forms for their org" ON ea_forms;
DROP POLICY IF EXISTS "Users can update EA forms for their org" ON ea_forms;
DROP POLICY IF EXISTS "Users can delete EA forms for their org" ON ea_forms;

CREATE POLICY "Users can view EA forms for their org" ON ea_forms FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = ea_forms.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'));

CREATE POLICY "Users can insert EA forms for their org" ON ea_forms FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = ea_forms.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'));

CREATE POLICY "Users can update EA forms for their org" ON ea_forms FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = ea_forms.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'))
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = ea_forms.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'));

CREATE POLICY "Users can delete EA forms for their org" ON ea_forms FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = ea_forms.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'));

-- ========== SST FILINGS ==========
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
CREATE INDEX IF NOT EXISTS idx_sst_filings_org_period ON sst_filings(organization_id, period_start DESC);
ALTER TABLE sst_filings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view sst filings for their org" ON sst_filings;
DROP POLICY IF EXISTS "Users can insert sst filings for their org" ON sst_filings;
DROP POLICY IF EXISTS "Users can update sst filings for their org" ON sst_filings;
DROP POLICY IF EXISTS "Users can delete sst filings for their org" ON sst_filings;

CREATE POLICY "Users can view sst filings for their org" ON sst_filings FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = sst_filings.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'));

CREATE POLICY "Users can insert sst filings for their org" ON sst_filings FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = sst_filings.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'));

CREATE POLICY "Users can update sst filings for their org" ON sst_filings FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = sst_filings.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'))
WITH CHECK (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = sst_filings.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'));

CREATE POLICY "Users can delete sst filings for their org" ON sst_filings FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = sst_filings.organization_id AND organization_members.user_id = auth.uid() AND organization_members.status = 'active'));

CREATE OR REPLACE FUNCTION update_sst_filings_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sst_filings_updated_at ON sst_filings;
CREATE TRIGGER sst_filings_updated_at BEFORE UPDATE ON sst_filings FOR EACH ROW EXECUTE FUNCTION update_sst_filings_updated_at();

-- ========== INVITATIONS email_sent_at ==========
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ;
