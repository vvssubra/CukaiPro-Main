/**
 * Supabase Edge Function: stripe-webhook
 * Handles Stripe webhooks and syncs subscription status to Supabase.
 *
 * Configure webhook in Stripe Dashboard:
 *   https://<project-ref>.supabase.co/functions/v1/stripe-webhook
 *
 * Events: customer.subscription.created, updated, deleted
 *
 * Requires: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SIGNING_SECRET
 */

import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cryptoProvider = Stripe.createSubtleCryptoProvider();

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-11-20',
  httpClient: Stripe.createFetchHttpClient(),
});

Deno.serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET');

  if (!signature || !webhookSecret) {
    return new Response(JSON.stringify({ error: 'Missing signature or webhook secret' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response(`Webhook Error: ${err instanceof Error ? err.message : 'Invalid signature'}`, {
      status: 400,
    });
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const subscription = event.data.object as Stripe.Subscription;

  const handleSubscription = async (sub: Stripe.Subscription) => {
    const orgId = sub.metadata?.organization_id;
    const plan = sub.metadata?.plan;

    if (!orgId) {
      console.warn('Subscription missing organization_id metadata:', sub.id);
      return;
    }

    const status = sub.status;
    const planMap: Record<string, string> = { pro: 'pro', enterprise: 'enterprise' };
    const mappedPlan = plan ? planMap[plan] ?? 'pro' : 'pro';

    const updates: Record<string, unknown> = {
      stripe_subscription_id: sub.id,
      plan: mappedPlan,
      subscription_status: status,
      subscription_current_period_end: sub.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString()
        : null,
    };

    if (status === 'canceled' || status === 'unpaid' || status === 'incomplete_expired') {
      updates.plan = 'free';
      updates.subscription_status = null;
      updates.stripe_subscription_id = null;
      updates.subscription_current_period_end = null;
    }

    const { error } = await supabaseAdmin
      .from('organizations')
      .update(updates)
      .eq('id', orgId);

    if (error) {
      console.error('Failed to update organization subscription:', error);
      throw error;
    }

    console.log(`Updated org ${orgId}: plan=${updates.plan}, status=${updates.subscription_status}`);
  };

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscription(subscription);
        break;

      case 'customer.subscription.deleted':
        if (subscription.metadata?.organization_id) {
          await supabaseAdmin
            .from('organizations')
            .update({
              plan: 'free',
              subscription_status: null,
              stripe_subscription_id: null,
              subscription_current_period_end: null,
            })
            .eq('id', subscription.metadata.organization_id);
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
