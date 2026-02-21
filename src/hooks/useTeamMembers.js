import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';
import { useOrganization } from '../context/OrganizationContext';

/**
 * Hook for managing organization team members.
 * Owners and admins can view members, change roles, remove members.
 */
export function useTeamMembers() {
  const { currentOrganization, canRemoveMembers, hasPermission } = useOrganization();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMembers = useCallback(async () => {
    if (!currentOrganization) return;

    setLoading(true);
    setError(null);
    try {
      const { data: membersData, error: fetchError } = await supabase
        .from('organization_members')
        .select('id, user_id, role, status, joined_at, invitation_accepted_at')
        .eq('organization_id', currentOrganization.id)
        .eq('status', 'active')
        .order('joined_at', { ascending: false });

      if (fetchError) throw fetchError;

      const userIds = (membersData || []).map((m) => m.user_id).filter(Boolean);
      let profilesMap = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('id, full_name, email')
          .in('id', userIds);
        profilesMap = (profiles || []).reduce((acc, p) => {
          acc[p.id] = p;
          return acc;
        }, {});
      }

      const membersList = (membersData || []).map((m) => {
        const p = profilesMap[m.user_id] || {};
        return {
          ...m,
          fullName: p.full_name || 'Unknown',
          email: p.email || m.user_id,
        };
      });
      setMembers(membersList);
    } catch (err) {
      logger.error('Failed to fetch team members', err);
      setError(err?.message || 'Failed to fetch members');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [currentOrganization]);

  const updateMemberRole = useCallback(
    async (memberId, newRole) => {
      if (!currentOrganization) return { success: false, error: 'No organization' };
      if (!hasPermission('change_roles') && !hasPermission('all')) {
        return { success: false, error: 'Permission denied' };
      }

      setLoading(true);
      setError(null);
      try {
        const { error: updateError } = await supabase
          .from('organization_members')
          .update({ role: newRole })
          .eq('id', memberId)
          .eq('organization_id', currentOrganization.id);

        if (updateError) throw updateError;

        setMembers((prev) =>
          prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
        );
        return { success: true };
      } catch (err) {
        const msg = err?.message || 'Failed to update role';
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [currentOrganization, hasPermission]
  );

  const removeMember = useCallback(
    async (memberId) => {
      if (!currentOrganization) return { success: false, error: 'No organization' };
      if (!canRemoveMembers) {
        return { success: false, error: 'Permission denied' };
      }

      setLoading(true);
      setError(null);
      try {
        const { error: updateError } = await supabase
          .from('organization_members')
          .update({ status: 'removed' })
          .eq('id', memberId)
          .eq('organization_id', currentOrganization.id);

        if (updateError) throw updateError;

        setMembers((prev) => prev.filter((m) => m.id !== memberId));
        return { success: true };
      } catch (err) {
        const msg = err?.message || 'Failed to remove member';
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [currentOrganization, canRemoveMembers]
  );

  return {
    members,
    loading,
    error,
    fetchMembers,
    updateMemberRole,
    removeMember,
    canRemoveMembers,
    canChangeRoles: hasPermission('change_roles') || hasPermission('all'),
  };
}
