-- Audit trail for CukaiPro
-- Run in Supabase SQL Editor: supabase/audit_trail.sql

-- ========== AUDIT_LOG TABLE ==========
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('deduction', 'invoice')),
  entity_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  old_data JSONB,
  new_data JSONB,
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_organization ON audit_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);

-- ========== RLS FOR AUDIT_LOG ==========
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Users can view audit logs only for organizations they belong to
DROP POLICY IF EXISTS "Users can view audit logs for their org" ON audit_log;
CREATE POLICY "Users can view audit logs for their org"
ON audit_log FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_members.organization_id = audit_log.organization_id
    AND organization_members.user_id = auth.uid()
    AND organization_members.status = 'active'
  )
);

-- Users can insert audit logs only for organizations they belong to
DROP POLICY IF EXISTS "Users can insert audit logs for their org" ON audit_log;
CREATE POLICY "Users can insert audit logs for their org"
ON audit_log FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_members.organization_id = audit_log.organization_id
    AND organization_members.user_id = auth.uid()
    AND organization_members.status = 'active'
  )
);

-- No UPDATE or DELETE on audit_log - append-only for integrity
