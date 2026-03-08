/**
 * Supabase Edge Function: myinvois-validate-tin
 * Validates a buyer TIN with LHDN MyInvois. Uses per-org credentials from organization_myinvois_credentials.
 *
 * Expects POST body: { tin: string, organization_id: string }
 * Requires: CREDENTIALS_ENCRYPTION_KEY in Edge Function secrets
 * Ref: https://sdk.myinvois.hasil.gov.my/einvoicingapi/01-validate-taxpayer-tin/
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { loadOrgCredentials, NOT_CONFIGURED_MESSAGE } from '../_shared/loadOrgCredentials.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getMyInvoisToken(identityUrl: string, clientId: string, clientSecret: string): Promise<string> {
  const tokenUrl = `${identityUrl.replace(/\/$/, '')}/connect/token`;
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'client_credentials',
    scope: 'InvoicingAPI',
  });
  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.error || 'MyInvois login failed');
  return data.access_token;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const tin = typeof body?.tin === 'string' ? body.tin.trim() : '';
    const organizationId = body?.organization_id;

    if (!/^\d{14}$/.test(tin)) {
      return new Response(
        JSON.stringify({ valid: false, error: 'TIN must be exactly 14 digits' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!organizationId) {
      return new Response(
        JSON.stringify({ valid: false, error: 'organization_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: membership } = await supabaseAuth
      .from('organization_members')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!membership) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Not a member of this organization' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const encryptionKey = Deno.env.get('CREDENTIALS_ENCRYPTION_KEY');
    if (!encryptionKey) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Server configuration error: CREDENTIALS_ENCRYPTION_KEY not set' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const creds = await loadOrgCredentials(supabaseAdmin, organizationId, encryptionKey);
    if (!creds) {
      return new Response(
        JSON.stringify({ valid: false, error: NOT_CONFIGURED_MESSAGE }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = await getMyInvoisToken(creds.identityUrl, creds.clientId, creds.clientSecret);
    const base = creds.apiUrl.replace(/\/$/, '');
    const validateUrl = `${base}/api/v1.0/taxpayers/validation?tin=${encodeURIComponent(tin)}`;
    const validateRes = await fetch(validateUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const validateData = await validateRes.json().catch(() => ({}));

    if (validateRes.ok && validateData?.valid === true) {
      return new Response(
        JSON.stringify({ valid: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const errMsg = validateData?.message || validateData?.error || (validateRes.status === 404 ? 'TIN not found' : 'TIN validation failed');
    return new Response(
      JSON.stringify({ valid: false, error: errMsg }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        valid: false,
        error: err instanceof Error ? err.message : 'Internal server error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
