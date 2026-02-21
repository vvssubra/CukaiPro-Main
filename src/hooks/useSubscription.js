/**
 * Hook for subscription status and feature gating.
 * Reads plan from currentOrganization (synced from Supabase).
 *
 * Plans: free, pro, enterprise
 * - Free: 1 member, no EA forms, basic SST
 * - Pro: 5 members, EA forms
 * - Enterprise: unlimited members, all features
 */

import { useOrganization } from '../context/OrganizationContext';

export const PLAN_LIMITS = {
  free: { maxMembers: 1, hasEAForms: false },
  pro: { maxMembers: 5, hasEAForms: true },
  enterprise: { maxMembers: null, hasEAForms: true },
};

export function useSubscription() {
  const { currentOrganization } = useOrganization();

  const plan = currentOrganization?.plan ?? 'free';
  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;

  const canUseEAForms = limits.hasEAForms;
  const maxMembers = limits.maxMembers;
  const hasUnlimitedMembers = maxMembers === null;

  /**
   * Check if org can add another member given current count.
   * @param {number} currentMemberCount - from useTeamMembers().members.length
   */
  const canAddMember = (currentMemberCount) => {
    if (hasUnlimitedMembers) return true;
    return currentMemberCount < maxMembers;
  };

  const memberLimitReached = (currentMemberCount) =>
    !hasUnlimitedMembers && currentMemberCount >= maxMembers;

  const isProOrHigher = plan === 'pro' || plan === 'enterprise';
  const isEnterprise = plan === 'enterprise';
  const isFree = plan === 'free';

  return {
    plan,
    canUseEAForms,
    maxMembers,
    hasUnlimitedMembers,
    canAddMember,
    memberLimitReached,
    isProOrHigher,
    isEnterprise,
    isFree,
  };
}
