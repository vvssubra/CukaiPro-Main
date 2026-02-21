# CukaiPro Billing & Subscriptions

CukaiPro uses **Stripe** for subscription billing. This guide covers setup for **test mode**.

## Overview

- **Plans**: Free, Pro, Enterprise
- **Free**: Deductions, Invoices, SST Filing, 1 team member
- **Pro**: Everything in Free + EA Forms, up to 5 team members
- **Enterprise**: Everything in Pro + unlimited team members, priority support

Subscription status is stored on the `organizations` table and synced via Stripe webhooks.

## Prerequisites

- Stripe account (test mode)
- Supabase project with Edge Functions enabled

## 1. Stripe Setup

### 1.1 Create Products & Prices

In [Stripe Dashboard → Products](https://dashboard.stripe.com/test/products):

1. **Pro plan**
   - Name: CukaiPro Pro
   - Create Price: Recurring, Monthly (or Yearly)
   - Copy the Price ID (e.g. `price_xxx`)

2. **Enterprise plan**
   - Name: CukaiPro Enterprise
   - Create Price: Recurring, Monthly (or Yearly)
   - Copy the Price ID

### 1.2 Customer Portal

In [Stripe Dashboard → Settings → Billing → Customer Portal](https://dashboard.stripe.com/test/settings/billing/portal):

- Enable Customer Portal (for manage subscription, cancel, change plan)
- Configure allowed actions (update payment, cancel subscription, etc.)

### 1.3 Webhook

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Add endpoint: `https://<your-supabase-project-ref>.supabase.co/functions/v1/stripe-webhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the **Signing secret** (starts with `whsec_`)

### 1.4 API Keys

From [Stripe Dashboard → Developers → API Keys](https://dashboard.stripe.com/test/apikeys):

- **Publishable key** (pk_test_xxx) – used in frontend (optional for Checkout)
- **Secret key** (sk_test_xxx) – used in Edge Functions

## 2. Supabase Setup

### 2.1 Run Migration

Run the billing migration in Supabase SQL Editor:

```bash
# Or apply via Supabase CLI
supabase db push
```

Or paste the contents of `supabase/migrations/20250222_billing_subscriptions.sql` into the SQL Editor and run it.

### 2.2 Edge Function Secrets

Set secrets for your Supabase project:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx
supabase secrets set STRIPE_WEBHOOK_SIGNING_SECRET=whsec_xxx
```

Or in Supabase Dashboard: Project Settings → Edge Functions → Secrets.

### 2.3 Deploy Edge Functions

```bash
supabase functions deploy create-checkout-session
supabase functions deploy create-portal-session
supabase functions deploy stripe-webhook
```

### 2.4 Webhook URL

Use your deployed webhook URL in Stripe:

```
https://<project-ref>.supabase.co/functions/v1/stripe-webhook
```

## 3. Frontend Environment Variables

Add to `.env`:

```env
# Stripe Price IDs (from Stripe Dashboard → Products → Prices)
VITE_STRIPE_PRICE_PRO_MONTHLY=price_xxx
VITE_STRIPE_PRICE_PRO_YEARLY=price_xxx
VITE_STRIPE_PRICE_ENTERPRISE_MONTHLY=price_xxx
VITE_STRIPE_PRICE_ENTERPRISE_YEARLY=price_xxx
```

If not set, the Billing page will show an upgrade section but Checkout will fail until Price IDs are configured.

## 4. Flow Summary

1. User visits **Settings → Billing**
2. Clicks **Upgrade to Pro** or **Upgrade to Enterprise**
3. `create-checkout-session` Edge Function creates a Stripe Checkout Session
4. User is redirected to Stripe Checkout
5. After payment, user returns to `/dashboard/settings?billing=success`
6. Stripe sends webhook to `stripe-webhook` → updates `organizations.plan`, `subscription_status`, etc.
7. Organization plan is refreshed; EA Forms and member limits apply immediately

## 5. Feature Gating

- **EA Forms** (`/dashboard/taxes/ea-form`): Requires Pro or Enterprise. Free plan users see an upgrade prompt.
- **Member limit**: Free = 1, Pro = 5, Enterprise = unlimited. Invite form is hidden when limit is reached.

## 6. Test Cards (Stripe Test Mode)

Use [Stripe test cards](https://docs.stripe.com/testing#cards):

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

## 7. Edge Functions Reference

| Function                | Purpose                          |
|-------------------------|----------------------------------|
| `create-checkout-session` | Creates Stripe Checkout for subscription |
| `create-portal-session`   | Opens Stripe Customer Portal for managing subscription |
| `stripe-webhook`          | Handles subscription events, syncs to `organizations` |

## 8. Database Schema

### `organizations` (new columns)

- `plan` – `free`, `pro`, or `enterprise`
- `stripe_customer_id` – Stripe Customer ID
- `stripe_subscription_id` – Stripe Subscription ID
- `subscription_status` – `active`, `canceled`, `past_due`, etc.
- `subscription_current_period_end` – End of current billing period

### `plans` (reference table)

- `id`, `name`, `description`, `max_members`, `features`, Stripe Price ID columns
