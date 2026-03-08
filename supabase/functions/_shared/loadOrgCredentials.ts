/**
 * Load and decrypt per-org MyInvois credentials from the database.
 * Used by myinvois-token, myinvois-submit, myinvois-validate-tin, myinvois-document-details.
 */

import { decrypt } from './crypto.ts';

export interface OrgCredentials {
  clientId: string;
  clientSecret: string;
  identityUrl: string;
  apiUrl: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function loadOrgCredentials(
  supabaseAdmin: any,
  organizationId: string,
  encryptionKey: string
): Promise<OrgCredentials | null> {
  const { data: row, error } = await supabaseAdmin
    .from('organization_myinvois_credentials')
    .select('encrypted_credentials, iv, identity_url, api_url')
    .eq('organization_id', organizationId)
    .single();

  if (error || !row?.encrypted_credentials || !row?.iv) {
    return null;
  }

  const plaintext = await decrypt(row.encrypted_credentials, row.iv, encryptionKey);
  const parsed = JSON.parse(plaintext) as { client_id?: string; client_secret?: string };
  const clientId = typeof parsed.client_id === 'string' ? parsed.client_id.trim() : '';
  const clientSecret = typeof parsed.client_secret === 'string' ? parsed.client_secret.trim() : '';

  if (!clientId || !clientSecret) {
    return null;
  }

  return {
    clientId,
    clientSecret,
    identityUrl: (row.identity_url || 'https://identity.myinvois.hasil.gov.my').toString().replace(/\/$/, ''),
    apiUrl: (row.api_url || 'https://api.myinvois.hasil.gov.my').toString().replace(/\/$/, ''),
  };
}

export const NOT_CONFIGURED_MESSAGE =
  'MyInvois credentials not configured. Go to Settings → E-Invoicing to set up.';
