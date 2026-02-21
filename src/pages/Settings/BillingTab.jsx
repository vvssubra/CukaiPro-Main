import { useState, useEffect } from 'react';
import { useOrganization } from '../../context/OrganizationContext';
import { useSubscription } from '../../hooks/useSubscription';
import { useBilling } from '../../hooks/useBilling';
import { useToast } from '../../context/ToastContext';

const PLAN_FEATURES = {
  free: ['Deductions', 'Invoices', 'SST Filing', '1 team member'],
  pro: ['Everything in Free', 'EA Forms', 'Up to 5 team members'],
  enterprise: ['Everything in Pro', 'Unlimited team members', 'Priority support'],
};

function BillingTab() {
  const { currentOrganization, membershipRole } = useOrganization();
  const { plan, canUseEAForms, isProOrHigher } = useSubscription();
  const { loading, error, createCheckoutSession, createPortalSession, reloadOrganizations } = useBilling();
  const toast = useToast();
  const [upgrading, setUpgrading] = useState(null);

  const isOwnerOrAdmin = membershipRole === 'owner' || membershipRole === 'admin';

  // Handle success/cancel from Checkout redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const billing = params.get('billing');
    if (billing === 'success') {
      toast.success('Subscription updated successfully!');
      reloadOrganizations();
      window.history.replaceState({}, '', '/dashboard/settings');
    } else if (billing === 'cancel') {
      toast.info('Checkout was cancelled.');
      window.history.replaceState({}, '', '/dashboard/settings');
    }
  }, [toast, reloadOrganizations]);

  const handleUpgrade = async (targetPlan, interval = 'monthly') => {
    setUpgrading(targetPlan);
    const result = await createCheckoutSession(targetPlan, interval);
    setUpgrading(null);
    if (result.success) return;
    toast.error(result.error || 'Upgrade failed');
  };

  const handleManage = async () => {
    const result = await createPortalSession();
    if (!result.success) {
      toast.error(result.error || 'Could not open billing portal');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-custom dark:text-white">Billing & Subscription</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your plan for {currentOrganization?.business_name || 'your organization'}.
        </p>
      </div>

      {/* Current plan */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-6">
        <h3 className="text-lg font-semibold text-slate-custom dark:text-white mb-2">Current plan</h3>
        <div className="flex items-center gap-3">
          <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-primary/20 text-primary capitalize">
            {plan}
          </span>
          {isProOrHigher && (
            <span className="text-sm text-slate-500 dark:text-slate-400">
              EA Forms: {canUseEAForms ? '✓ Enabled' : '—'}
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {isOwnerOrAdmin && (
        <>
          {/* Manage subscription - only if they have a Stripe customer */}
          {currentOrganization?.stripe_customer_id && (
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-6">
              <h3 className="text-lg font-semibold text-slate-custom dark:text-white mb-3">Manage subscription</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Update payment method, cancel, or change plan.
              </p>
              <button
                type="button"
                onClick={handleManage}
                disabled={loading}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
              >
                {loading ? 'Opening…' : 'Open billing portal'}
              </button>
            </div>
          )}

          {/* Upgrade options */}
          {plan === 'free' && (
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-6">
              <h3 className="text-lg font-semibold text-slate-custom dark:text-white mb-4">Upgrade plan</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-primary/50 bg-primary/5 p-4">
                  <h4 className="font-semibold text-slate-custom dark:text-white">Pro</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    EA forms, up to 5 team members
                  </p>
                  <ul className="mt-2 text-sm text-slate-600 dark:text-slate-300 space-y-1">
                    {PLAN_FEATURES.pro.map((f) => (
                      <li key={f}>• {f}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => handleUpgrade('pro', 'monthly')}
                    disabled={loading || upgrading === 'pro'}
                    className="mt-4 w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    {loading && upgrading === 'pro' ? 'Redirecting…' : 'Upgrade to Pro'}
                  </button>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-600 p-4">
                  <h4 className="font-semibold text-slate-custom dark:text-white">Enterprise</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Unlimited team members
                  </p>
                  <ul className="mt-2 text-sm text-slate-600 dark:text-slate-300 space-y-1">
                    {PLAN_FEATURES.enterprise.map((f) => (
                      <li key={f}>• {f}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => handleUpgrade('enterprise', 'monthly')}
                    disabled={loading || upgrading === 'enterprise'}
                    className="mt-4 w-full px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 disabled:opacity-50"
                  >
                    {loading && upgrading === 'enterprise' ? 'Redirecting…' : 'Upgrade to Enterprise'}
                  </button>
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                Configure Stripe Price IDs in .env (see docs/BILLING.md). Test mode recommended.
              </p>
            </div>
          )}
        </>
      )}

      {!isOwnerOrAdmin && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Only owners and admins can manage billing. Contact your organization admin to upgrade.
        </p>
      )}
    </div>
  );
}

export default BillingTab;
