/**
 * Supabase Edge Function: save-myinvois-credentials
 * Saves per-organization MyInvois Client ID and Client Secret, encrypted at rest.
 * Caller must be owner or admin of the organization.
 *
 * Expects POST body:
 * { organization_id: string, client_id: string, client_secret: string, identity_url?: string, api_url?: sandbox?: boolean }
 *
 * Requires: CREDENTIALS_ENCRYPTION_KEY (hex-encoded 256-bit key) in Edge Function secrets
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { encrypt } from '../_shared/crypto.ts';

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

    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const organizationId = body?.organization_id;
    const clientId = typeof body?.client_id === 'string' ? body.client_id.trim() : '';
    const clientSecret = typeof body?.client_secret === 'string' ? body.client_secret.trim() : '';

    if (!organizationId || !clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ success: false, error: 'organization_id, client_id, and client_secret are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: membership, error: memberError } = await supabaseAuth
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (memberError || !membership) {
      return new Response(
        JSON.stringify({ success: false, error: 'Not a member of this organization' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const role = membership.role;
    if (role !== 'owner' && role !== 'admin') {
      return new Response(
        JSON.stringify({ success: false, error: 'Only owner or admin can save MyInvois credentials' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const encryptionKey = Deno.env.get('CREDENTIALS_ENCRYPTION_KEY');
    if (!encryptionKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error: CREDENTIALS_ENCRYPTION_KEY not set' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload = JSON.stringify({ client_id: clientId, client_secret: clientSecret });
    const { ciphertextBase64, ivBase64 } = await encrypt(payload, encryptionKey);

    const identityUrl = typeof body?.identity_url === 'string' ? body.identity_url.trim() : 'https://identity.myinvois.hasil.gov.my';
    const apiUrl = typeof body?.api_url === 'string' ? body.api_url.trim() : 'https://api.myinvois.hasil.gov.my';
    const sandbox = Boolean(body?.sandbox);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: upsertError } = await supabaseAdmin
      .from('organization_myinvois_credentials')
      .upsert(
        {
          organization_id: organizationId,
          encrypted_credentials: ciphertextBase64,
          iv: ivBase64,
          identity_url: identityUrl || null,
          api_url: apiUrl || null,
          sandbox,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'organization_id' }
      );

    if (upsertError) {
      return new Response(
        JSON.stringify({ success: false, error: upsertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
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
