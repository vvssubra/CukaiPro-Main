/**
 * Supabase Edge Function: myinvois-token
 * Login as Taxpayer System (MyInvois). Fetches access token server-side; never exposes token to client.
 * Used to verify MyInvois connectivity (returns success/error only). Other Edge Functions (e.g. submit,
 * validate-tin) should inline this token fetch or call this function server-side to get the token.
 *
 * Requires Edge Function secrets:
 *   MYINVOIS_IDENTITY_URL, MYINVOIS_CLIENT_ID, MYINVOIS_CLIENT_SECRET
 *
 * Ref: https://sdk.myinvois.hasil.gov.my/api/07-login-as-taxpayer-system/
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header' }),
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
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const identityUrl = Deno.env.get('MYINVOIS_IDENTITY_URL');
    const clientId = Deno.env.get('MYINVOIS_CLIENT_ID');
    const clientSecret = Deno.env.get('MYINVOIS_CLIENT_SECRET');

    if (!identityUrl || !clientId || !clientSecret) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'MyInvois not configured (MYINVOIS_IDENTITY_URL, MYINVOIS_CLIENT_ID, MYINVOIS_CLIENT_SECRET)',
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tokenUrl = `${identityUrl.replace(/\/$/, '')}/connect/token`;
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
      scope: 'InvoicingAPI',
    });

    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      const errMsg = tokenData.error_description || tokenData.error || 'MyInvois login failed';
      return new Response(
        JSON.stringify({ success: false, error: errMsg }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Do not send access_token to client; only confirm connectivity.
    return new Response(
      JSON.stringify({
        success: true,
        expires_in: tokenData.expires_in ?? 3600,
        message: 'MyInvois connection successful. Token is used server-side only.',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : 'Internal server error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
