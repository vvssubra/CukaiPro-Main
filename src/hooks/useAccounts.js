import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';
import { useOrganization } from '../context/OrganizationContext';

/**
 * Fetch, create, update, delete accounts (Chart of Accounts).
 * @param {{ type?: string, parentId?: string | null }} [filters] - Optional type or parent_id filter
 * @returns {{ accounts, loading, error, fetchAccounts, createAccount, updateAccount, deleteAccount }}
 */
export function useAccounts(filters = {}) {
  const { currentOrganization } = useOrganization();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAccounts = useCallback(async () => {
    if (!currentOrganization) return;

    setLoading(true);
    setError(null);
    try {
      let q = supabase
        .from('accounts')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('code', { ascending: true });

      if (filters.type) q = q.eq('type', filters.type);
      if (filters.parentId !== undefined) {
        if (filters.parentId === null || filters.parentId === '') {
          q = q.is('parent_id', null);
        } else {
          q = q.eq('parent_id', filters.parentId);
        }
      }

      const { data, error: fetchError } = await q;

      if (fetchError) {
        logger.error('Failed to fetch accounts', fetchError);
        setError(fetchError.message);
        setAccounts([]);
        return;
      }

      setAccounts(data ?? []);
    } catch (err) {
      logger.error('Unexpected error fetching accounts', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch accounts');
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, [currentOrganization, filters.type, filters.parentId]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const createAccount = useCallback(
    async (payload) => {
      if (!currentOrganization) {
        setError('No organization selected');
        return { success: false, error: 'No organization selected' };
      }

      setLoading(true);
      setError(null);
      try {
        const { data, error: insertError } = await supabase
          .from('accounts')
          .insert({
            organization_id: currentOrganization.id,
            name: payload.name,
            code: String(payload.code).trim(),
            type: payload.type,
            parent_id: payload.parent_id || null,
            currency: payload.currency || 'MYR',
            opening_balance: Number(payload.opening_balance) || 0,
            is_system: payload.is_system ?? false,
          })
          .select()
          .single();

        if (insertError) {
          logger.error('Failed to create account', insertError);
          setError(insertError.message);
          return { success: false, error: insertError.message };
        }

        setAccounts((prev) => [...prev, data].sort((a, b) => (a.code < b.code ? -1 : 1)));
        return { success: true, data };
      } catch (err) {
        const errMessage = err instanceof Error ? err.message : 'Failed to create account';
        logger.error('Unexpected error creating account', err);
        setError(errMessage);
        return { success: false, error: errMessage };
      } finally {
        setLoading(false);
      }
    },
    [currentOrganization]
  );

  const updateAccount = useCallback(
    async (id, payload) => {
      if (!currentOrganization) {
        setError('No organization selected');
        return { success: false, error: 'No organization selected' };
      }

      setLoading(true);
      setError(null);
      try {
        const updateData = {};
        if (payload.name !== undefined) updateData.name = payload.name;
        if (payload.code !== undefined) updateData.code = String(payload.code).trim();
        if (payload.type !== undefined) updateData.type = payload.type;
        if (payload.parent_id !== undefined) updateData.parent_id = payload.parent_id || null;
        if (payload.currency !== undefined) updateData.currency = payload.currency;
        if (payload.opening_balance !== undefined) updateData.opening_balance = Number(payload.opening_balance) || 0;

        const { data, error: updateError } = await supabase
          .from('accounts')
          .update(updateData)
          .eq('id', id)
          .eq('organization_id', currentOrganization.id)
          .select()
          .single();

        if (updateError) {
          logger.error('Failed to update account', updateError);
          setError(updateError.message);
          return { success: false, error: updateError.message };
        }

        setAccounts((prev) => prev.map((a) => (a.id === id ? data : a)));
        return { success: true, data };
      } catch (err) {
        const errMessage = err instanceof Error ? err.message : 'Failed to update account';
        logger.error('Unexpected error updating account', err);
        setError(errMessage);
        return { success: false, error: errMessage };
      } finally {
        setLoading(false);
      }
    },
    [currentOrganization]
  );

  const deleteAccount = useCallback(
    async (id) => {
      if (!currentOrganization) {
        setError('No organization selected');
        return { success: false, error: 'No organization selected' };
      }

      setLoading(true);
      setError(null);
      try {
        const { error: deleteError } = await supabase
          .from('accounts')
          .delete()
          .eq('id', id)
          .eq('organization_id', currentOrganization.id);

        if (deleteError) {
          logger.error('Failed to delete account', deleteError);
          setError(deleteError.message);
          return { success: false, error: deleteError.message };
        }

        setAccounts((prev) => prev.filter((a) => a.id !== id));
        return { success: true };
      } catch (err) {
        const errMessage = err instanceof Error ? err.message : 'Failed to delete account';
        logger.error('Unexpected error deleting account', err);
        setError(errMessage);
        return { success: false, error: errMessage };
      } finally {
        setLoading(false);
      }
    },
    [currentOrganization]
  );

  return {
    accounts,
    loading,
    error,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
  };
}
