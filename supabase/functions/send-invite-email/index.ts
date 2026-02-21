/**
 * Supabase Edge Function: send-invite-email
 * Sends an invitation email via Resend with the CukaiPro invite link.
 *
 * Expects POST body:
 * { to: string, inviteLink: string, orgName: string, role: string, invitationId: string }
 *
 * Requires: RESEND_API_KEY in Edge Function secrets
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { to, inviteLink, orgName, role, invitationId } = body;

    if (!to || !inviteLink || !invitationId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, inviteLink, invitationId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify invitation exists and user has permission (owner/admin of org)
    const { data: invitation, error: invError } = await supabaseClient
      .from('invitations')
      .select('id, organization_id')
      .eq('id', invitationId)
      .eq('status', 'pending')
      .single();

    if (invError || !invitation) {
      return new Response(
        JSON.stringify({ error: 'Invitation not found or already used' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check user is owner/admin of the org (RLS handles this via membership)
    const { data: membership } = await supabaseClient
      .from('organization_members')
      .select('role')
      .eq('organization_id', invitation.organization_id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return new Response(
        JSON.stringify({ error: 'Not authorized to send invite email for this organization' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Email service not configured (RESEND_API_KEY missing)' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const roleLabel = role === 'admin' ? 'Admin' : role === 'accountant' ? 'Accountant' : 'Staff';
    const org = orgName || 'the organization';

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:24px">
  <h2 style="color:#0f172a">You're invited to join ${org}</h2>
  <p style="color:#475569;line-height:1.6">You've been invited to join <strong>${org}</strong> on CukaiPro as <strong>${roleLabel}</strong>.</p>
  <p style="color:#475569;line-height:1.6">Click the button below to accept the invitation:</p>
  <p style="margin:24px 0">
    <a href="${inviteLink}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:8px;font-weight:600">Accept invitation</a>
  </p>
  <p style="color:#94a3b8;font-size:14px">Or copy this link: ${inviteLink}</p>
  <p style="color:#94a3b8;font-size:12px;margin-top:32px">This invite expires in 7 days. If you didn't expect this email, you can ignore it.</p>
</body>
</html>
`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: Deno.env.get('RESEND_FROM') ?? 'CukaiPro <onboarding@resend.dev>',
        to: [to],
        subject: `Join ${org} on CukaiPro`,
        html,
      }),
    });

    const resData = await res.json();

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: resData.message || 'Failed to send email', details: resData }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update invitation with email_sent_at using service role (bypass RLS for UPDATE)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    await supabaseAdmin
      .from('invitations')
      .update({ email_sent_at: new Date().toISOString() })
      .eq('id', invitationId);

    return new Response(
      JSON.stringify({ success: true, message: 'Invite email sent' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
