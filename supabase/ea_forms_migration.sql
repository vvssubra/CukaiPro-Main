-- EA Forms (Employment Information / Borang EA) table for Malaysian LHDN tax filing
-- Employers use this to provide income details to employees for LHDN e-Filing

CREATE TABLE IF NOT EXISTS ea_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  tax_year INTEGER NOT NULL,
  -- Employee identification
  employee_name TEXT NOT NULL,
  employee_ic TEXT,
  employee_tax_no TEXT,
  -- Employment income (RM)
  gross_salary NUMERIC(14, 2) DEFAULT 0,
  allowances NUMERIC(14, 2) DEFAULT 0,
  bonuses NUMERIC(14, 2) DEFAULT 0,
  benefits_in_kind NUMERIC(14, 2) DEFAULT 0,
  overtime NUMERIC(14, 2) DEFAULT 0,
  director_fees NUMERIC(14, 2) DEFAULT 0,
  commission NUMERIC(14, 2) DEFAULT 0,
  -- Statutory deductions
  epf_employee NUMERIC(14, 2) DEFAULT 0,
  epf_employer NUMERIC(14, 2) DEFAULT 0,
  socso NUMERIC(14, 2) DEFAULT 0,
  eis NUMERIC(14, 2) DEFAULT 0,
  pcb NUMERIC(14, 2) DEFAULT 0,
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ea_forms_org_year ON ea_forms(organization_id, tax_year);

-- Enable RLS
ALTER TABLE ea_forms ENABLE ROW LEVEL SECURITY;

-- RLS policies (same pattern as tax_deductions)
DROP POLICY IF EXISTS "Users can view EA forms for their org" ON ea_forms;
DROP POLICY IF EXISTS "Users can insert EA forms for their org" ON ea_forms;
DROP POLICY IF EXISTS "Users can update EA forms for their org" ON ea_forms;
DROP POLICY IF EXISTS "Users can delete EA forms for their org" ON ea_forms;

CREATE POLICY "Users can view EA forms for their org"
ON ea_forms FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_members.organization_id = ea_forms.organization_id
    AND organization_members.user_id = auth.uid()
    AND organization_members.status = 'active'
  )
);

CREATE POLICY "Users can insert EA forms for their org"
ON ea_forms FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_members.organization_id = ea_forms.organization_id
    AND organization_members.user_id = auth.uid()
    AND organization_members.status = 'active'
  )
);

CREATE POLICY "Users can update EA forms for their org"
ON ea_forms FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_members.organization_id = ea_forms.organization_id
    AND organization_members.user_id = auth.uid()
    AND organization_members.status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_members.organization_id = ea_forms.organization_id
    AND organization_members.user_id = auth.uid()
    AND organization_members.status = 'active'
  )
);

CREATE POLICY "Users can delete EA forms for their org"
ON ea_forms FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_members.organization_id = ea_forms.organization_id
    AND organization_members.user_id = auth.uid()
    AND organization_members.status = 'active'
  )
);
