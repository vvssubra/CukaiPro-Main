/**
 * Supabase Edge Function: support-chat
 * Backend for the CukaiPro support widget. Saves each message to bug_reports + bug_report_messages
 * so they appear in the Bug Reports Admin page.
 *
 * Expects POST body: { message, session_id?, page_url?, screenshot_base64?, user_email? }
 * Returns: { success: true, session_id, reply }
 *
 * Requires: SUPABASE_SERVICE_ROLE_KEY (for inserting into bug_reports)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const REPLY = "Thanks for your message. Our team will get back to you soon. If it's urgent, email support@cukaipro.com.";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!supabaseUrl || !serviceKey) {
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const body = await req.json();
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const sessionId = typeof body.session_id === 'string' ? body.session_id : `session_${Date.now()}`;
    const pageUrl = typeof body.page_url === 'string' ? body.page_url : null;
    const screenshotBase64 = typeof body.screenshot_base64 === 'string' ? body.screenshot_base64 : null;
    const userEmail = typeof body.user_email === 'string' ? body.user_email : null;

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let reportId: string;

    const { data: existing } = await supabase
      .from('bug_reports')
      .select('id')
      .eq('session_id', sessionId)
      .limit(1)
      .single();

    if (existing?.id) {
      reportId = existing.id;
      if (screenshotBase64) {
        await supabase.from('bug_reports').update({ screenshot_base64: screenshotBase64 }).eq('id', reportId);
      }
    } else {
      const { data: inserted, error: insertErr } = await supabase
        .from('bug_reports')
        .insert({
          session_id: sessionId,
          message,
          status: 'open',
          priority: 'medium',
          page_url: pageUrl,
          screenshot_base64: screenshotBase64,
          user_email: userEmail,
        })
        .select('id')
        .single();
      if (insertErr) {
        console.error('bug_reports insert', insertErr);
        return new Response(
          JSON.stringify({ error: 'Failed to save report' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      reportId = inserted!.id;
    }

    const { error: msgUserErr } = await supabase.from('bug_report_messages').insert({
      bug_report_id: reportId,
      role: 'user',
      content: message,
    });
    if (msgUserErr) console.error('bug_report_messages user insert', msgUserErr);

    const { error: msgAssistantErr } = await supabase.from('bug_report_messages').insert({
      bug_report_id: reportId,
      role: 'assistant',
      content: REPLY,
    });
    if (msgAssistantErr) console.error('bug_report_messages assistant insert', msgAssistantErr);

    return new Response(
      JSON.stringify({ success: true, session_id: sessionId, reply: REPLY }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error('support-chat', e);
    return new Response(
      JSON.stringify({ error: 'Invalid request body' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
