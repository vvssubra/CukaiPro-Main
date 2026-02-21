-- Phase 3: Invitations table for team management
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'accountant', 'staff')),
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invitations_org ON invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_invitations_org_email_pending ON invitations(organization_id, email) WHERE status = 'pending';

ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Owners/admins can view invitations for their org
DROP POLICY IF EXISTS "Owners and admins can view org invitations" ON invitations;
CREATE POLICY "Owners and admins can view org invitations"
  ON invitations FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
    )
  );

-- Owners/admins can create invitations
DROP POLICY IF EXISTS "Owners and admins can create invitations" ON invitations;
CREATE POLICY "Owners and admins can create invitations"
  ON invitations FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
    )
  );

-- Owners/admins can update (cancel) invitations
DROP POLICY IF EXISTS "Owners and admins can update invitations" ON invitations;
CREATE POLICY "Owners and admins can update invitations"
  ON invitations FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
    )
  );

-- Invitees can view invitations sent to their email (for accept flow)
DROP POLICY IF EXISTS "Invitees can view invitations to their email" ON invitations;
CREATE POLICY "Invitees can view invitations to their email"
  ON invitations FOR SELECT
  USING ((auth.jwt()->>'email')::text = LOWER(email));

-- Invitees can update (accept) invitations sent to their email
DROP POLICY IF EXISTS "Invitee can accept invitation" ON invitations;
CREATE POLICY "Invitee can accept invitation"
  ON invitations FOR UPDATE
  USING (status = 'pending' AND expires_at > NOW() AND (auth.jwt()->>'email')::text = LOWER(email));

-- Team members: users can view profiles of members in their org
DROP POLICY IF EXISTS "Users can view profiles of org members" ON user_profiles;
CREATE POLICY "Users can view profiles of org members"
  ON user_profiles FOR SELECT
  USING (
    id IN (
      SELECT om.user_id FROM organization_members om
      WHERE om.organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

-- Organization members: users can view members of their org
DROP POLICY IF EXISTS "Users can view org members" ON organization_members;
CREATE POLICY "Users can view org members"
  ON organization_members FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND status = 'active'
    )
  );

SELECT 'Phase 3 invitations table and team policies created successfully!' AS status;
