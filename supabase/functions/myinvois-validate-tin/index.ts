/**
 * Supabase Edge Function: myinvois-validate-tin
 * Validates a buyer TIN with LHDN MyInvois. Token stays server-side.
 * Requires: MYINVOIS_IDENTITY_URL, MYINVOIS_API_URL, MYINVOIS_CLIENT_ID, MYINVOIS_CLIENT_SECRET
 * Ref: https://sdk.myinvois.hasil.gov.my/einvoicingapi/01-validate-taxpayer-tin/
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getMyInvoisToken(identityUrl, clientId, clientSecret) {
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

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const tin = typeof body?.tin === 'string' ? body.tin.trim() : '';
    // LHDN TIN: 14 digits
    if (!/^\d{14}$/.test(tin)) {
      return new Response(
        JSON.stringify({ valid: false, error: 'TIN must be exactly 14 digits' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const identityUrl = Deno.env.get('MYINVOIS_IDENTITY_URL');
    const apiUrl = Deno.env.get('MYINVOIS_API_URL');
    const clientId = Deno.env.get('MYINVOIS_CLIENT_ID');
    const clientSecret = Deno.env.get('MYINVOIS_CLIENT_SECRET');

    if (!identityUrl || !apiUrl || !clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ valid: false, error: 'MyInvois not configured' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = await getMyInvoisToken(identityUrl, clientId, clientSecret);
    const base = apiUrl.replace(/\/$/, '');
    // MyInvois Validate TIN API (path per SDK; adjust if different)
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
