-- Run this in Supabase SQL Editor to fix "new row violates row-level security policy for table 'tax_deductions'"
-- These policies allow authenticated users to CRUD tax_deductions only for organizations they belong to.

-- Enable RLS if not already
ALTER TABLE tax_deductions ENABLE ROW LEVEL SECURITY;

-- Remove old policies so we can recreate (run this block once; safe if policies don't exist)
DROP POLICY IF EXISTS "Users can view deductions for their org" ON tax_deductions;
DROP POLICY IF EXISTS "Users can insert deductions for their org" ON tax_deductions;
DROP POLICY IF EXISTS "Users can update deductions for their org" ON tax_deductions;
DROP POLICY IF EXISTS "Users can delete deductions for their org" ON tax_deductions;

-- SELECT: user can see rows where they are an active member of the organization
CREATE POLICY "Users can view deductions for their org"
ON tax_deductions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_members.organization_id = tax_deductions.organization_id
    AND organization_members.user_id = auth.uid()
    AND organization_members.status = 'active'
  )
);

-- INSERT: user can insert only when organization_id is an org they belong to
CREATE POLICY "Users can insert deductions for their org"
ON tax_deductions FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_members.organization_id = tax_deductions.organization_id
    AND organization_members.user_id = auth.uid()
    AND organization_members.status = 'active'
  )
);

-- UPDATE: user can update only deductions in their org
CREATE POLICY "Users can update deductions for their org"
ON tax_deductions FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_members.organization_id = tax_deductions.organization_id
    AND organization_members.user_id = auth.uid()
    AND organization_members.status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_members.organization_id = tax_deductions.organization_id
    AND organization_members.user_id = auth.uid()
    AND organization_members.status = 'active'
  )
);

-- DELETE: user can delete only deductions in their org
CREATE POLICY "Users can delete deductions for their org"
ON tax_deductions FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_members.organization_id = tax_deductions.organization_id
    AND organization_members.user_id = auth.uid()
    AND organization_members.status = 'active'
  )
);
