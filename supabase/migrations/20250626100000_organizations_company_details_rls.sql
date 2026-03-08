-- Organization company details (LHDN status, TIN, company email) and RLS for admin-only updates.
-- Only owner/admin can UPDATE organizations and organization_members (role/status).
-- Members can SELECT their organizations; authenticated can INSERT (create org).

-- Add company detail columns to organizations (if not present)
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS lhdn_status TEXT,
  ADD COLUMN IF NOT EXISTS lhdn_tin_no TEXT,
  ADD COLUMN IF NOT EXISTS company_email TEXT;

-- Ensure RLS is enabled
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Organizations: members can read their orgs (required for organization_members join)
DROP POLICY IF EXISTS "Members can view their organization" ON organizations;
CREATE POLICY "Members can view their organization"
  ON organizations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organizations.id
        AND om.user_id = auth.uid()
        AND om.status = 'active'
    )
  );

-- Organizations: authenticated users can insert (create org); app then adds creator as owner
DROP POLICY IF EXISTS "Authenticated can create organization" ON organizations;
CREATE POLICY "Authenticated can create organization"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Organizations: allow UPDATE only for owner/admin of that org
DROP POLICY IF EXISTS "Owners and admins can update their organization" ON organizations;
CREATE POLICY "Owners and admins can update their organization"
  ON organizations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organizations.id
        AND om.user_id = auth.uid()
        AND om.status = 'active'
        AND om.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organizations.id
        AND om.user_id = auth.uid()
        AND om.status = 'active'
        AND om.role IN ('owner', 'admin')
    )
  );

-- Organization members: allow UPDATE (role, status) only by owner/admin of that org
-- (so admins can change roles and revoke access)
DROP POLICY IF EXISTS "Owners and admins can update org members" ON organization_members;
CREATE POLICY "Owners and admins can update org members"
  ON organization_members FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid()
        AND om.status = 'active'
        AND om.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid()
        AND om.status = 'active'
        AND om.role IN ('owner', 'admin')
    )
  );
