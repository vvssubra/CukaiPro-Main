/**
 * Supabase Edge Function: myinvois-document-details
 * Fetches MyInvois Get Document Details for a submitted invoice. Uses per-org credentials from organization_myinvois_credentials.
 * Requires: CREDENTIALS_ENCRYPTION_KEY in Edge Function secrets
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
    const invoiceId = body?.invoiceId ?? body?.invoice_id;
    if (!invoiceId) {
      return new Response(
        JSON.stringify({ success: false, error: 'invoiceId required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: invoice, error: invErr } = await supabaseAdmin
      .from('invoices')
      .select('id, organization_id, myinvois_uuid')
      .eq('id', invoiceId)
      .single();

    if (invErr || !invoice?.myinvois_uuid) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invoice not found or not submitted to MyInvois' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: membership } = await supabaseAdmin
      .from('organization_members')
      .select('id')
      .eq('organization_id', invoice.organization_id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1)
      .single();
    if (!membership) {
      return new Response(
        JSON.stringify({ success: false, error: 'Not authorized for this organization' }),
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

    const creds = await loadOrgCredentials(supabaseAdmin, invoice.organization_id, encryptionKey);
    if (!creds) {
      return new Response(
        JSON.stringify({ success: false, error: NOT_CONFIGURED_MESSAGE }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = await getMyInvoisToken(creds.identityUrl, creds.clientId, creds.clientSecret);
    const base = creds.apiUrl.replace(/\/$/, '');
    const detailsUrl = `${base}/api/v1.0/documents/${encodeURIComponent(invoice.myinvois_uuid)}`;
    const detailsRes = await fetch(detailsUrl, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    const detailsData = await detailsRes.json().catch(() => ({}));

    const validationResult = detailsData?.validationResult ?? detailsData;
    const status = detailsData?.status ?? (detailsRes.ok ? 'validated' : 'rejected');
    const lhdnStatus = status === 'valid' || status === 'validated' ? 'validated' : status === 'invalid' || status === 'rejected' ? 'rejected' : 'submitted';

    await supabaseAdmin
      .from('invoices')
      .update({
        lhdn_status: lhdnStatus,
        myinvois_validation_result: validationResult,
      })
      .eq('id', invoiceId);

    return new Response(
      JSON.stringify({
        success: true,
        lhdn_status: lhdnStatus,
        validation_result: validationResult,
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
