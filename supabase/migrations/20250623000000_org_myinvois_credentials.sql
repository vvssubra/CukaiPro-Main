-- Per-organization MyInvois credentials (encrypted at rest).
-- Only Edge Functions (service_role) can read/write; RLS blocks all client access.
-- Single encrypted payload (JSON { client_id, client_secret }) with one IV per row.
CREATE TABLE IF NOT EXISTS organization_myinvois_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  encrypted_credentials text NOT NULL,
  iv text NOT NULL,
  identity_url text DEFAULT 'https://identity.myinvois.hasil.gov.my',
  api_url text DEFAULT 'https://api.myinvois.hasil.gov.my',
  sandbox boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id)
);

ALTER TABLE organization_myinvois_credentials ENABLE ROW LEVEL SECURITY;

-- Block ALL client access; only service_role (Edge Functions) can read/write
CREATE POLICY "No client access" ON organization_myinvois_credentials
  FOR ALL USING (false);

-- Trigger to keep updated_at in sync
CREATE OR REPLACE FUNCTION update_org_myinvois_credentials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER org_myinvois_credentials_updated_at
  BEFORE UPDATE ON organization_myinvois_credentials
  FOR EACH ROW EXECUTE FUNCTION update_org_myinvois_credentials_updated_at();
