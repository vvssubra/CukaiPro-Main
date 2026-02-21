import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';
import { useOrganization } from '../context/OrganizationContext';

/**
 * Hook for managing organization invitations.
 * Owners and admins can send, list, and cancel invitations.
 */
export function useInvitations() {
  const { currentOrganization, canInviteMembers } = useOrganization();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInvitations = useCallback(async () => {
    if (!currentOrganization) return;

    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('invitations')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .in('status', ['pending'])
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setInvitations(data ?? []);
    } catch (err) {
      logger.error('Failed to fetch invitations', err);
      setError(err?.message || 'Failed to fetch invitations');
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  }, [currentOrganization]);

  const sendInvitation = useCallback(
    async (email, role) => {
      if (!currentOrganization || !canInviteMembers) {
        setError('You do not have permission to invite members');
        return { success: false, error: 'Permission denied' };
      }

      setLoading(true);
      setError(null);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error: insertError } = await supabase
          .from('invitations')
          .insert({
            organization_id: currentOrganization.id,
            invited_by: user.id,
            email: email.toLowerCase().trim(),
            role: role || 'staff',
            status: 'pending',
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .select()
          .single();

        if (insertError) throw insertError;

        setInvitations((prev) => [data, ...prev]);
        return { success: true, data, token: data.token };
      } catch (err) {
        const msg = err?.message || 'Failed to send invitation';
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [currentOrganization, canInviteMembers]
  );

  const cancelInvitation = useCallback(
    async (invitationId) => {
      if (!currentOrganization) return { success: false, error: 'No organization' };

      setLoading(true);
      setError(null);
      try {
        const { error: updateError } = await supabase
          .from('invitations')
          .update({ status: 'cancelled' })
          .eq('id', invitationId)
          .eq('organization_id', currentOrganization.id);

        if (updateError) throw updateError;

        setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
        return { success: true };
      } catch (err) {
        const msg = err?.message || 'Failed to cancel invitation';
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [currentOrganization]
  );

  const acceptInvitation = useCallback(async (token) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to accept an invitation');

      const { data: invitation, error: fetchError } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', token)
        .eq('status', 'pending')
        .single();

      if (fetchError || !invitation) {
        throw new Error('Invitation not found or expired');
      }
      if (new Date(invitation.expires_at) < new Date()) {
        throw new Error('Invitation has expired');
      }
      const userEmail = (user.email || '').toLowerCase();
      if (userEmail !== (invitation.email || '').toLowerCase()) {
        throw new Error('This invitation was sent to a different email address');
      }

      const { error: memberError } = await supabase.from('organization_members').insert({
        organization_id: invitation.organization_id,
        user_id: user.id,
        role: invitation.role,
        status: 'active',
        invitation_accepted_at: new Date().toISOString(),
      });

      if (memberError) {
        if (memberError.code === '23505') throw new Error('You have already joined this organization');
        throw memberError;
      }

      await supabase
        .from('invitations')
        .update({ status: 'accepted', accepted_at: new Date().toISOString(), accepted_by: user.id })
        .eq('id', invitation.id);

      return { success: true, organizationId: invitation.organization_id };
    } catch (err) {
      const msg = err?.message || 'Failed to accept invitation';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sends invite email via Supabase Edge Function (Resend).
   * Call after sendInvitation succeeds.
   * @param {Object} params - { invitationId, email, token, orgName, role }
   * @returns {Promise<{ success: boolean; error?: string }>}
   */
  const sendInviteEmail = useCallback(
    async ({ invitationId, email, token, orgName, role }) => {
      if (!invitationId || !email || !token) {
        return { success: false, error: 'Missing invitationId, email, or token' };
      }

      try {
        const { data, error } = await supabase.functions.invoke('send-invite-email', {
          body: {
            to: email,
            inviteLink: `${window.location.origin}/invite/${token}`,
            orgName: orgName || currentOrganization?.business_name || 'the organization',
            role: role || 'staff',
            invitationId,
          },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        if (currentOrganization) {
          const { data: updated } = await supabase
            .from('invitations')
            .select('*')
            .eq('id', invitationId)
            .single();
          if (updated) {
            setInvitations((prev) =>
              prev.map((i) => (i.id === invitationId ? { ...i, email_sent_at: updated.email_sent_at } : i))
            );
          }
        }

        return { success: true };
      } catch (err) {
        const msg = err?.message || 'Failed to send invite email';
        logger.error('sendInviteEmail failed', err);
        return { success: false, error: msg };
      }
    },
    [currentOrganization]
  );

  const getInvitationByToken = useCallback(async (token) => {
    try {
      const { data: invitation, error } = await supabase
        .from('invitations')
        .select('id, email, role, organization_id, status, expires_at, organization:organizations(business_name)')
        .eq('token', token)
        .single();

      if (error || !invitation) return { data: null, error: 'Invitation not found' };
      if (invitation.status !== 'pending') return { data: null, error: 'Invitation already used' };
      if (new Date(invitation.expires_at) < new Date()) return { data: null, error: 'Invitation expired' };

      return { data: invitation, error: null };
    } catch (err) {
      return { data: null, error: err?.message || 'Failed to load invitation' };
    }
  }, []);

  return {
    invitations,
    loading,
    error,
    fetchInvitations,
    sendInvitation,
    sendInviteEmail,
    cancelInvitation,
    acceptInvitation,
    getInvitationByToken,
    canInviteMembers,
  };
}
