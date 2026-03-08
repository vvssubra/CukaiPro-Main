/**
 * Supabase Edge Function: support-chat
 * Backend for the CukaiPro support widget. Saves each message to bug_reports + bug_report_messages
 * so they appear in the Bug Reports Admin page.
 *
 * Expects POST body: { message, session_id?, page_url?, screenshot_base64?, user_email? }
 * Requires: Authorization: Bearer <SUPABASE_ANON_KEY> (same as frontend anon key).
 * Returns: { success: true, session_id, reply }
 *
 * Requires: SUPABASE_SERVICE_ROLE_KEY (for inserting into bug_reports), SUPABASE_ANON_KEY (for request validation).
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const REPLY = "Thanks for your message. Our team will get back to you soon. If it's urgent, email support@cukaipro.com.";

// Rate limit: 10 requests per minute per IP, 20 per session_id. In-memory per instance.
const RATE_LIMIT_IP_PER_MIN = 10;
const RATE_LIMIT_SESSION_PER_MIN = 20;
const WINDOW_MS = 60_000;

type Bucket = { count: number; resetAt: number };
const ipBuckets = new Map<string, Bucket>();
const sessionBuckets = new Map<string, Bucket>();

function getBucket(map: Map<string, Bucket>, key: string, limit: number): Bucket | null {
  const now = Date.now();
  let b = map.get(key);
  if (b) {
    if (now >= b.resetAt) {
      b = { count: 0, resetAt: now + WINDOW_MS };
      map.set(key, b);
    }
  } else {
    b = { count: 0, resetAt: now + WINDOW_MS };
    map.set(key, b);
  }
  b.count += 1;
  if (b.count > limit) return b;
  return null;
}

function pruneOld(map: Map<string, Bucket>) {
  const now = Date.now();
  for (const [k, v] of map.entries()) {
    if (now >= v.resetAt) map.delete(k);
  }
}

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

  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!anonKey || token !== anonKey) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
  pruneOld(ipBuckets);
  const ipOver = getBucket(ipBuckets, ip, RATE_LIMIT_IP_PER_MIN);
  if (ipOver) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil((ipOver.resetAt - Date.now()) / 1000)),
        },
      }
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

  let sessionId = '';
  try {
    const body = await req.json();
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    sessionId = typeof body.session_id === 'string' ? body.session_id : `session_${Date.now()}`;
    const pageUrl = typeof body.page_url === 'string' ? body.page_url : null;
    const screenshotBase64 = typeof body.screenshot_base64 === 'string' ? body.screenshot_base64 : null;
    const userEmail = typeof body.user_email === 'string' ? body.user_email : null;

    pruneOld(sessionBuckets);
    const sessionOver = getBucket(sessionBuckets, sessionId, RATE_LIMIT_SESSION_PER_MIN);
    if (sessionOver) {
      return new Response(
        JSON.stringify({ error: 'Too many messages in this session. Please wait a moment.' }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil((sessionOver.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);
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
