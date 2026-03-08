/**
 * Allowed MyInvois base hosts for identity_url and api_url (SSRF mitigation).
 * Only these LHDN hosts may be used when saving or using MyInvois credentials.
 */
export const ALLOWED_MYINVOIS_IDENTITY_HOSTS = new Set([
  'identity.myinvois.hasil.gov.my',
  'api.myinvois.hasil.gov.my', // production API
  'preprod-api.myinvois.hasil.gov.my', // sandbox / preprod (identity and API often same host)
]);

export const ALLOWED_MYINVOIS_API_HOSTS = new Set([
  'api.myinvois.hasil.gov.my',
  'preprod-api.myinvois.hasil.gov.my',
]);

const DEFAULT_IDENTITY_URL = 'https://identity.myinvois.hasil.gov.my';
const DEFAULT_API_URL = 'https://api.myinvois.hasil.gov.my';

export function validateIdentityUrl(url: string | null | undefined): { ok: true; url: string } | { ok: false; error: string } {
  if (!url || typeof url !== 'string') {
    return { ok: true, url: DEFAULT_IDENTITY_URL };
  }
  const u = url.trim();
  if (!u) return { ok: true, url: DEFAULT_IDENTITY_URL };
  try {
    const parsed = new URL(u);
    if (parsed.protocol !== 'https:') {
      return { ok: false, error: 'identity_url must use HTTPS' };
    }
    const host = parsed.hostname.toLowerCase();
    if (!ALLOWED_MYINVOIS_IDENTITY_HOSTS.has(host)) {
      return { ok: false, error: `identity_url host not allowlisted. Allowed: ${[...ALLOWED_MYINVOIS_IDENTITY_HOSTS].join(', ')}` };
    }
    return { ok: true, url: u.replace(/\/$/, '') };
  } catch {
    return { ok: false, error: 'identity_url is not a valid URL' };
  }
}

export function validateApiUrl(url: string | null | undefined): { ok: true; url: string } | { ok: false; error: string } {
  if (!url || typeof url !== 'string') {
    return { ok: true, url: DEFAULT_API_URL };
  }
  const u = url.trim();
  if (!u) return { ok: true, url: DEFAULT_API_URL };
  try {
    const parsed = new URL(u);
    if (parsed.protocol !== 'https:') {
      return { ok: false, error: 'api_url must use HTTPS' };
    }
    const host = parsed.hostname.toLowerCase();
    if (!ALLOWED_MYINVOIS_API_HOSTS.has(host)) {
      return { ok: false, error: `api_url host not allowlisted. Allowed: ${[...ALLOWED_MYINVOIS_API_HOSTS].join(', ')}` };
    }
    return { ok: true, url: u.replace(/\/$/, '') };
  } catch {
    return { ok: false, error: 'api_url is not a valid URL' };
  }
}
