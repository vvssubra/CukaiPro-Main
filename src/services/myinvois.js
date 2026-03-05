/**
 * MyInvois / LHDN e-Invoicing service.
 * All MyInvois API calls go through Supabase Edge Functions so credentials stay server-side.
 * @see docs/PRD_EINVOICING.md
 */

import { supabase } from '../lib/supabase';

const FUNCTION_MYINVOIS_TOKEN = 'myinvois-token';

/**
 * Test MyInvois connectivity (Login as Taxpayer). Does not expose token to client.
 * @returns {Promise<{ success: boolean; error?: string; expires_in?: number }>}
 */
export async function testMyInvoisConnection() {
  try {
    const { data, error } = await supabase.functions.invoke(FUNCTION_MYINVOIS_TOKEN, {
      method: 'POST',
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
 * Validate buyer TIN with MyInvois (to be implemented via Edge Function).
 * @param {string} tin - Tax Identification Number
 * @returns {Promise<{ valid: boolean; error?: string }>}
 */
export async function validateTaxpayerTin(tin) {
  // Placeholder: Phase 2 will add myinvois-validate-tin Edge Function
  if (!tin || String(tin).trim().length < 9) {
    return { valid: false, error: 'Invalid TIN format' };
  }
  return { valid: false, error: 'TIN validation not yet implemented (Phase 2)' };
}

/**
 * Submit one or more invoices to MyInvois (to be implemented via Edge Function).
 * @param {string[]} invoiceIds - CukaiPro invoice IDs
 * @returns {Promise<{ success: boolean; submission_uid?: string; accepted?: Array<{ code_number: string; uuid: string }>; rejected?: Array<{ code_number: string; error: string }>; error?: string }>}
 */
export async function submitInvoicesToMyInvois(invoiceIds) {
  if (!Array.isArray(invoiceIds) || invoiceIds.length === 0) {
    return { success: false, error: 'No invoice IDs provided' };
  }
  // Placeholder: Phase 3 will add myinvois-submit Edge Function
  return { success: false, error: 'Submit to MyInvois not yet implemented (Phase 3)' };
}
