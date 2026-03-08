/**
 * Supabase Edge Function: myinvois-submit
 * Submits one or more invoices to LHDN MyInvois. Uses per-org credentials from organization_myinvois_credentials.
 * Builds UBL 2.1 Invoice JSON, assigns code_number if missing, hashes and base64-encodes, POSTs to documentsubmissions.
 * MyInvois: max 300 KB per document; 100 docs/batch, 5 MB total; 100 RPM.
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

/** Normalize invoice_date to YYYY-MM-DD for UBL. */
function toISODate(d) {
  if (!d) return new Date().toISOString().slice(0, 10);
  if (typeof d === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
    const [day, month, year] = d.split('/').map(Number);
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  const date = new Date(d);
  return date.toISOString().slice(0, 10);
}

/**
 * Build minimal UBL 2.1-like Invoice JSON for MyInvois. LHDN e-Invoice: SST from invoice sst_rate; 6% default per CukaiPro.
 * All amounts RM; 2 decimal places.
 */
function buildInvoicePayload(invoice, org, contact, codeNumber) {
  const amount = Math.round((Number(invoice.amount) || 0) * 100) / 100;
  const sstRate = Number(invoice.sst_rate) ?? 6;
  const sstAmount = Math.round(amount * (sstRate / 100) * 100) / 100;
  const buyerName = contact?.company_name || contact?.name || invoice.client_name || 'Buyer';
  const buyerTin = (contact?.tin || contact?.tax_registration_no || invoice.tin || '').toString().trim();
  const sellerName = org?.business_name || 'Supplier';
  const sellerTin = (org?.tin || org?.tax_registration_no || '').toString().trim();

  if (!buyerTin || buyerTin.length !== 14) {
    throw new Error('Buyer TIN is required for e-Invoice and must be 14 digits');
  }

  const issueDate = toISODate(invoice.invoice_date);
  const issueTime = new Date().toISOString().replace('Z', 'Z');

  // Minimal UBL 2.1 Invoice JSON structure for MyInvois (element order may need to match schema)
  const payload = {
    Invoice: {
      'cbc:ID': codeNumber,
      'cbc:IssueDate': issueDate,
      'cbc:IssueTime': issueTime,
      'cbc:DocumentCurrencyCode': 'MYR',
      'cac:AccountingSupplierParty': {
        'cac:Party': {
          'cac:PartyIdentification': { 'cbc:ID': sellerTin || 'N/A' },
          'cac:PartyName': { 'cbc:Name': sellerName },
          'cac:PostalAddress': {
            'cbc:StreetName': (org?.address || '').toString() || 'N/A',
            'cbc:CityName': (org?.city || '').toString() || 'N/A',
            'cbc:PostalZone': (org?.postal_code || '').toString() || '',
            'cac:Country': { 'cbc:IdentificationCode': 'MY' },
          },
        },
      },
      'cac:AccountingCustomerParty': {
        'cac:Party': {
          'cac:PartyIdentification': { 'cbc:ID': buyerTin },
          'cac:PartyName': { 'cbc:Name': buyerName },
          'cac:PostalAddress': {
            'cbc:StreetName': (contact?.billing_address || '').toString() || 'N/A',
            'cbc:CityName': (contact?.area || '').toString() || 'N/A',
            'cbc:PostalZone': (contact?.billing_postcode || '').toString() || '',
            'cac:Country': { 'cbc:IdentificationCode': 'MY' },
          },
        },
      },
      'cac:InvoiceLine': [
        {
          'cbc:ID': '1',
          'cbc:InvoicedQuantity': 1,
          'cbc:LineExtensionAmount': amount.toFixed(2),
          'cac:Item': { 'cbc:Description': (invoice.notes || 'Invoice line').toString().slice(0, 256) },
          'cac:Price': { 'cbc:PriceAmount': amount.toFixed(2) },
        },
      ],
      'cac:TaxTotal': [
        {
          'cbc:TaxAmount': sstAmount.toFixed(2),
          'cac:TaxSubtotal': [
            {
              'cbc:TaxableAmount': amount.toFixed(2),
              'cbc:TaxAmount': sstAmount.toFixed(2),
              'cac:TaxCategory': { 'cbc:ID': 'S', 'cbc:Percent': sstRate },
            },
          ],
        },
      ],
      'cac:LegalMonetaryTotal': {
        'cbc:LineExtensionAmount': amount.toFixed(2),
        'cbc:TaxExclusiveAmount': amount.toFixed(2),
        'cbc:TaxInclusiveAmount': (amount + sstAmount).toFixed(2),
        'cbc:PayableAmount': (amount + sstAmount).toFixed(2),
      },
    },
  };

  return payload;
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
    const invoiceIds = Array.isArray(body?.invoiceIds) ? body.invoiceIds : [];
    if (invoiceIds.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No invoice IDs provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const encryptionKey = Deno.env.get('CREDENTIALS_ENCRYPTION_KEY');
    if (!encryptionKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error: CREDENTIALS_ENCRYPTION_KEY not set' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: firstInvoice, error: firstInvErr } = await supabaseAdmin
      .from('invoices')
      .select('organization_id')
      .eq('id', invoiceIds[0])
      .single();

    if (firstInvErr || !firstInvoice) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invoice not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const creds = await loadOrgCredentials(supabaseAdmin, firstInvoice.organization_id, encryptionKey);
    if (!creds) {
      return new Response(
        JSON.stringify({ success: false, error: NOT_CONFIGURED_MESSAGE }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = await getMyInvoisToken(creds.identityUrl, creds.clientId, creds.clientSecret);
    const apiUrl = creds.apiUrl;
    const accepted = [];
    const rejected = [];
    let submissionUid = null;

    for (const invId of invoiceIds) {
      const { data: invoice, error: invErr } = await supabaseAdmin
        .from('invoices')
        .select('*')
        .eq('id', invId)
        .single();

      if (invErr || !invoice) {
        rejected.push({ code_number: null, error: 'Invoice not found' });
        continue;
      }

      const orgId = invoice.organization_id;
      if (orgId !== firstInvoice.organization_id) {
        rejected.push({ code_number: invoice.code_number || null, error: 'All invoices must belong to the same organization' });
        continue;
      }
      const { data: membership } = await supabaseAdmin
        .from('organization_members')
        .select('id')
        .eq('organization_id', orgId)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1)
        .single();
      if (!membership) {
        rejected.push({ code_number: invoice.code_number || null, error: 'Not authorized for this organization' });
        continue;
      }
      const { data: org } = await supabaseAdmin.from('organizations').select('*').eq('id', orgId).single();
      let contact = null;
      if (invoice.contact_id) {
        const { data: c } = await supabaseAdmin.from('contacts').select('*').eq('id', invoice.contact_id).single();
        contact = c;
      }

      let codeNumber = invoice.code_number;
      if (!codeNumber) {
        const year = new Date().getFullYear();
        const { data: nextCode, error: rpcErr } = await supabaseAdmin.rpc('get_next_invoice_code_number', {
          p_organization_id: orgId,
          p_year: year,
        });
        if (rpcErr || !nextCode) {
          rejected.push({ code_number: null, error: 'Failed to assign code number' });
          continue;
        }
        codeNumber = nextCode;
        await supabaseAdmin.from('invoices').update({ code_number: codeNumber }).eq('id', invId);
      }

      let payloadJson;
      try {
        const payload = buildInvoicePayload(invoice, org || {}, contact, codeNumber);
        payloadJson = JSON.stringify(payload);
      } catch (e) {
        rejected.push({ code_number: codeNumber, error: e instanceof Error ? e.message : 'Build failed' });
        continue;
      }

      if (new TextEncoder().encode(payloadJson).length > 300 * 1024) {
        rejected.push({ code_number: codeNumber, error: 'Document exceeds 300 KB' });
        continue;
      }

      const encoder = new TextEncoder();
      const payloadBytes = encoder.encode(payloadJson);
      const hashBuffer = await crypto.subtle.digest('SHA-256', payloadBytes);
      const hashHex = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      const base64Doc = btoa(String.fromCharCode(...payloadBytes));

      const submitUrl = `${apiUrl.replace(/\/$/, '')}/api/v1.0/documentsubmissions/`;
      const submitBody = {
        documents: [
          {
            format: 'JSON',
            document: base64Doc,
            documentHash: hashHex,
            codeNumber: codeNumber,
          },
        ],
      };

      const submitRes = await fetch(submitUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitBody),
      });

      const submitData = await submitRes.json().catch(() => ({}));

      if (submitRes.status === 202 && submitData?.acceptedDocuments?.length > 0) {
        const doc = submitData.acceptedDocuments[0];
        const uuid = doc.uuid || doc.documentUID;
        if (submitData.submissionUID) submissionUid = submitData.submissionUID;
        await supabaseAdmin
          .from('invoices')
          .update({
            myinvois_uuid: uuid,
            myinvois_submission_uid: submitData.submissionUID || null,
            submitted_at: new Date().toISOString(),
            lhdn_status: 'submitted',
          })
          .eq('id', invId);
        accepted.push({ code_number: codeNumber, uuid: uuid });
      } else {
        const errMsg = submitData?.rejectedDocuments?.[0]?.error?.message
          || submitData?.error?.message
          || submitRes.statusText
          || 'Submission rejected';
        await supabaseAdmin
          .from('invoices')
          .update({
            lhdn_status: 'rejected',
            myinvois_validation_result: { error: errMsg },
          })
          .eq('id', invId);
        rejected.push({ code_number: codeNumber, error: errMsg });
      }
    }

    return new Response(
      JSON.stringify({
        success: rejected.length === 0,
        submission_uid: submissionUid,
        accepted,
        rejected,
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
