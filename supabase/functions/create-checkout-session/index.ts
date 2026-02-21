/**
 * Supabase Edge Function: create-checkout-session
 * Creates a Stripe Checkout Session for subscription upgrades.
 *
 * POST body: { plan: 'pro' | 'enterprise', priceId: string, successUrl?: string, cancelUrl?: string }
 *
 * Requires: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SIGNING_SECRET (optional for this function)
 */

import Stripe from 'https://esm.sh/stripe@14?target=deno';
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
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { plan, priceId, successUrl, cancelUrl } = body;

    if (!plan || !priceId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: plan, priceId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!['pro', 'enterprise'].includes(plan)) {
      return new Response(JSON.stringify({ error: 'Invalid plan' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
    if (!STRIPE_SECRET_KEY) {
      return new Response(JSON.stringify({ error: 'Stripe not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Get org where user is owner/admin
    const { data: memberships } = await supabaseClient
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .in('role', ['owner', 'admin']);

    const orgId = memberships?.[0]?.organization_id;
    if (!orgId) {
      return new Response(JSON.stringify({ error: 'No organization found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: org } = await supabaseClient
      .from('organizations')
      .select('id, business_name, stripe_customer_id')
      .eq('id', orgId)
      .single();

    if (!org) {
      return new Response(JSON.stringify({ error: 'Organization not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let customerId = org.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { organization_id: orgId },
      });
      customerId = customer.id;

      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      await supabaseAdmin
        .from('organizations')
        .update({ stripe_customer_id: customerId })
        .eq('id', orgId);
    }

    const origin = new URL(req.url).origin;
    const baseSuccess = successUrl ?? `${origin}/dashboard/settings?billing=success`;
    const baseCancel = cancelUrl ?? `${origin}/dashboard/settings?billing=cancel`;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: baseSuccess,
      cancel_url: baseCancel,
      client_reference_id: orgId,
      metadata: { organization_id: orgId, plan },
      subscription_data: {
        metadata: { organization_id: orgId, plan },
        trial_period_days: 0,
      },
    });

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('create-checkout-session error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
