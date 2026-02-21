/**
 * Hook for billing operations: create checkout session, manage subscription.
 */

import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useOrganization } from '../context/OrganizationContext';

/**
 * Price IDs - set via env or config. Use Stripe test mode Price IDs.
 * Create in Stripe Dashboard: Products -> Prices
 */
const STRIPE_PRICE_IDS = {
  pro_monthly: import.meta.env.VITE_STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
  pro_yearly: import.meta.env.VITE_STRIPE_PRICE_PRO_YEARLY || 'price_pro_yearly',
  enterprise_monthly: import.meta.env.VITE_STRIPE_PRICE_ENTERPRISE_MONTHLY || 'price_enterprise_monthly',
  enterprise_yearly: import.meta.env.VITE_STRIPE_PRICE_ENTERPRISE_YEARLY || 'price_enterprise_yearly',
};

export function useBilling() {
  const { currentOrganization, reloadOrganizations } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createCheckoutSession = useCallback(
    async (plan, interval = 'monthly') => {
      if (!currentOrganization) return { success: false, error: 'No organization' };

      const priceKey = plan === 'enterprise' ? `enterprise_${interval}` : `pro_${interval}`;
      const priceId = STRIPE_PRICE_IDS[priceKey];

      if (!priceId) {
        return {
          success: false,
          error: `Price not configured for ${plan} ${interval}. Set VITE_STRIPE_PRICE_${plan.toUpperCase()}_${interval.toUpperCase()} in .env`,
        };
      }

      setLoading(true);
      setError(null);

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;

        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              plan,
              priceId,
              successUrl: `${window.location.origin}/dashboard/settings?billing=success`,
              cancelUrl: `${window.location.origin}/dashboard/settings?billing=cancel`,
            }),
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to create checkout session');
        }

        if (data.url) {
          window.location.href = data.url;
          return { success: true };
        }

        throw new Error('No checkout URL returned');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Checkout failed';
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [currentOrganization]
  );

  const createPortalSession = useCallback(async (returnUrl) => {
    if (!currentOrganization?.stripe_customer_id) {
      return { success: false, error: 'No billing customer. Subscribe first.' };
    }

    setLoading(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-portal-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            returnUrl: returnUrl ?? `${window.location.origin}/dashboard/settings`,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create portal session');
      }

      if (data.url) {
        window.location.href = data.url;
        return { success: true };
      }

      throw new Error('No portal URL returned');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Portal failed';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, [currentOrganization]);

  return {
    loading,
    error,
    createCheckoutSession,
    createPortalSession,
    reloadOrganizations,
  };
}
