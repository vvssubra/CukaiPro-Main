-- Billing & Subscriptions for CukaiPro
-- Adds subscription columns to organizations and plans reference.
-- Plans: free, pro, enterprise (see docs/BILLING.md)

-- Subscription fields on organizations
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing', 'unpaid', 'incomplete', 'incomplete_expired', NULL)),
  ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_organizations_stripe_customer ON organizations(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_organizations_stripe_subscription ON organizations(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;

-- Plans table (reference for display names, features, Stripe Price IDs)
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  stripe_price_id_pro_monthly TEXT,
  stripe_price_id_pro_yearly TEXT,
  stripe_price_id_enterprise_monthly TEXT,
  stripe_price_id_enterprise_yearly TEXT,
  max_members INTEGER,
  features JSONB DEFAULT '[]',
  sort_order INTEGER DEFAULT 0
);

INSERT INTO plans (id, name, description, max_members, features, sort_order)
VALUES
  ('free', 'Free', 'Basic tax management', 1, '["Deductions", "Invoices", "SST Filing"]'::jsonb, 0),
  ('pro', 'Pro', 'EA forms and team collaboration', 5, '["Everything in Free", "EA Forms", "Up to 5 team members"]'::jsonb, 1),
  ('enterprise', 'Enterprise', 'Unlimited team members', NULL, '["Everything in Pro", "Unlimited team members", "Priority support"]'::jsonb, 2)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view plans" ON plans;
CREATE POLICY "Anyone can view plans" ON plans FOR SELECT USING (true);
