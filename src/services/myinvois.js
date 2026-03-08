/**
 * MyInvois / LHDN e-Invoicing service.
 * All MyInvois API calls go through Supabase Edge Functions so credentials stay server-side.
 * CA: Use formatCurrency for any displayed amounts; TIN 14 digits per validators.
 * @see docs/PRD_EINVOICING.md
 */

import { supabase } from '../lib/supabase';
import { tinSchema } from '../utils/validators';

const FUNCTION_MYINVOIS_TOKEN = 'myinvois-token';
const FUNCTION_MYINVOIS_VALIDATE_TIN = 'myinvois-validate-tin';
const FUNCTION_MYINVOIS_SUBMIT = 'myinvois-submit';
const FUNCTION_MYINVOIS_DOCUMENT_DETAILS = 'myinvois-document-details';
const FUNCTION_SAVE_MYINVOIS_CREDENTIALS = 'save-myinvois-credentials';
const FUNCTION_GET_MYINVOIS_CREDENTIALS_STATUS = 'get-myinvois-credentials-status';
const FUNCTION_DELETE_MYINVOIS_CREDENTIALS = 'delete-myinvois-credentials';

/**
 * Test MyInvois connectivity (Login as Taxpayer). Does not expose token to client.
 * @param {string} organizationId - Current organization ID (required for per-org credentials)
 * @returns {Promise<{ success: boolean; error?: string; expires_in?: number; message?: string }>}
 */
export async function testMyInvoisConnection(organizationId) {
  if (!organizationId) {
    return { success: false, error: 'Organization is required to test MyInvois connection.' };
  }
  try {
    const { data, error } = await supabase.functions.invoke(FUNCTION_MYINVOIS_TOKEN, {
      method: 'POST',
      body: { organization_id: organizationId },
    });

    if (error) {
      return { success: false, error: error.message || 'Edge function error' };
    }

    const body = data ?? {};
    if (body.success === true) {
      return {
        success: true,
        expires_in: body.expires_in,
        message: body.message,
      };
    }

    return {
      success: false,
      error: body.error || 'MyInvois connection failed',
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to test MyInvois connection',
    };
  }
}

/**
 * Validate buyer TIN with MyInvois (LHDN Tax Identification Number, 14 digits).
 * Client-side format check via tinSchema; authority check via Edge Function.
 * @param {string} tin - Tax Identification Number (14 digits)
 * @param {string} organizationId - Current organization ID (required for per-org credentials)
 * @returns {Promise<{ valid: boolean; error?: string }>}
 */
export async function validateTaxpayerTin(tin, organizationId) {
  const trimmed = (tin || '').trim();
  const parsed = tinSchema.safeParse(trimmed);
  if (!parsed.success) {
    return { valid: false, error: 'TIN must be exactly 14 digits' };
  }
  if (!organizationId) {
    return { valid: false, error: 'Organization is required for TIN validation.' };
  }
  try {
    const { data, error } = await supabase.functions.invoke(FUNCTION_MYINVOIS_VALIDATE_TIN, {
      method: 'POST',
      body: { tin: trimmed, organization_id: organizationId },
    });

    if (error) {
      return { valid: false, error: error.message || 'Validation request failed' };
    }

    const body = data ?? {};
    if (body.valid === true) {
      return { valid: true };
    }
    return { valid: false, error: body.error || 'TIN invalid' };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : 'TIN validation failed',
    };
  }
}

/**
 * Submit one or more invoices to MyInvois. Restricted to admin/accountant by UI.
 * @param {string[]} invoiceIds - CukaiPro invoice IDs
 * @returns {Promise<{ success: boolean; submission_uid?: string; accepted?: Array<{ code_number: string; uuid: string }>; rejected?: Array<{ code_number: string; error: string }>; error?: string }>}
 */
export async function submitInvoicesToMyInvois(invoiceIds) {
  if (!Array.isArray(invoiceIds) || invoiceIds.length === 0) {
    return { success: false, error: 'Select at least one invoice.' };
  }
  try {
    const { data, error } = await supabase.functions.invoke(FUNCTION_MYINVOIS_SUBMIT, {
      method: 'POST',
      body: { invoiceIds },
    });

    if (error) {
      return { success: false, error: error.message || 'Submit failed' };
    }

    const body = data ?? {};
    return {
      success: body.success === true,
      submission_uid: body.submission_uid,
      accepted: body.accepted ?? [],
      rejected: body.rejected ?? [],
      error: body.error,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Submit to MyInvois failed',
    };
  }
}

/**
 * Refresh LHDN status for one submitted invoice (Get Document Details).
 * @param {string} invoiceId - CukaiPro invoice ID (must have myinvois_uuid)
 * @returns {Promise<{ success: boolean; lhdn_status?: string; validation_result?: object; error?: string }>}
 */
export async function refreshDocumentStatus(invoiceId) {
  if (!invoiceId) {
    return { success: false, error: 'Invoice ID required' };
  }
  try {
    const { data, error } = await supabase.functions.invoke(FUNCTION_MYINVOIS_DOCUMENT_DETAILS, {
      method: 'POST',
      body: { invoiceId },
    });

    if (error) {
      return { success: false, error: error.message || 'Refresh failed' };
    }

    const body = data ?? {};
    if (body.success === true) {
      return {
        success: true,
        lhdn_status: body.lhdn_status,
        validation_result: body.validation_result,
      };
    }
    return { success: false, error: body.error || 'Refresh failed' };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Refresh status failed',
    };
  }
}

/**
 * Get MyInvois credentials status for the organization (configured or not). Never returns actual secrets.
 * @param {string} organizationId - Current organization ID
 * @returns {Promise<{ configured: boolean; sandbox?: boolean; identity_url?: string; api_url?: string; error?: string }>}
 */
export async function getMyInvoisCredentialsStatus(organizationId) {
  if (!organizationId) {
    return { configured: false, error: 'Organization is required.' };
  }
  try {
    const { data, error } = await supabase.functions.invoke(FUNCTION_GET_MYINVOIS_CREDENTIALS_STATUS, {
      method: 'POST',
      body: { organization_id: organizationId },
    });

    if (error) {
      return { configured: false, error: error.message };
    }

    const body = data ?? {};
    return {
      configured: Boolean(body.configured),
      sandbox: body.sandbox,
      identity_url: body.identity_url,
      api_url: body.api_url,
    };
  } catch (err) {
    return {
      configured: false,
      error: err instanceof Error ? err.message : 'Failed to get credentials status',
    };
  }
}

/**
 * Save MyInvois Client ID and Client Secret for the organization (encrypted at rest).
 * @param {string} organizationId - Current organization ID
 * @param {string} clientId - MyInvois Client ID
 * @param {string} clientSecret - MyInvois Client Secret
 * @param {{ sandbox?: boolean; identity_url?: string; api_url?: string }} [options] - Optional settings
 * @returns {Promise<{ success: boolean; error?: string }>}
 */
export async function saveMyInvoisCredentials(organizationId, clientId, clientSecret, options = {}) {
  if (!organizationId || !clientId || !clientSecret) {
    return { success: false, error: 'Organization, Client ID, and Client Secret are required.' };
  }
  try {
    const { data, error } = await supabase.functions.invoke(FUNCTION_SAVE_MYINVOIS_CREDENTIALS, {
      method: 'POST',
      body: {
        organization_id: organizationId,
        client_id: clientId.trim(),
        client_secret: clientSecret.trim(),
        sandbox: Boolean(options.sandbox),
        identity_url: options.identity_url,
        api_url: options.api_url,
      },
    });

    if (error) {
      return { success: false, error: error.message || 'Save failed' };
    }

    const body = data ?? {};
    return { success: body.success === true, error: body.error };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to save credentials',
    };
  }
}

/**
 * Remove stored MyInvois credentials for the organization.
 * @param {string} organizationId - Current organization ID
 * @returns {Promise<{ success: boolean; error?: string }>}
 */
export async function deleteMyInvoisCredentials(organizationId) {
  if (!organizationId) {
    return { success: false, error: 'Organization is required.' };
  }
  try {
    const { data, error } = await supabase.functions.invoke(FUNCTION_DELETE_MYINVOIS_CREDENTIALS, {
      method: 'POST',
      body: { organization_id: organizationId },
    });

    if (error) {
      return { success: false, error: error.message || 'Delete failed' };
    }

    const body = data ?? {};
    return { success: body.success === true, error: body.error };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to remove credentials',
    };
  }
}
