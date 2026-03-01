import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';
import { useOrganization } from '../context/OrganizationContext';

/**
 * Fetch and mutate bank statement entries for an account. Reconcile by setting transaction_line_id and reconciled_at.
 * @param {{ accountId?: string, statementDate?: string }} [filters]
 * @returns {{ entries, loading, error, fetchEntries, addEntry, updateEntry, deleteEntry, reconcileEntry }}
 */
export function useBankStatementEntries(filters = {}) {
  const { currentOrganization } = useOrganization();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEntries = useCallback(async () => {
    if (!currentOrganization || !filters.accountId) {
      setEntries([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let q = supabase
        .from('bank_statement_entries')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .eq('account_id', filters.accountId)
        .order('statement_date', { ascending: true });

      if (filters.statementDate) q = q.eq('statement_date', filters.statementDate);

      const { data, error: fetchError } = await q;

      if (fetchError) {
        logger.error('Failed to fetch bank statement entries', fetchError);
        setError(fetchError.message);
        setEntries([]);
        return;
      }

      setEntries(data ?? []);
    } catch (err) {
      logger.error('Unexpected error fetching bank statement entries', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch entries');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [currentOrganization, filters.accountId, filters.statementDate]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const addEntry = useCallback(
    async (payload) => {
      if (!currentOrganization) {
        setError('No organization selected');
        return { success: false, error: 'No organization selected' };
      }

      setLoading(true);
      setError(null);
      try {
        const { data, error: insertError } = await supabase
          .from('bank_statement_entries')
          .insert({
            organization_id: currentOrganization.id,
            account_id: payload.account_id,
            statement_date: payload.statement_date,
            description: payload.description || null,
            amount: Number(payload.amount) || 0,
          })
          .select()
          .single();

        if (insertError) {
          logger.error('Failed to add bank statement entry', insertError);
          setError(insertError.message);
          return { success: false, error: insertError.message };
        }

        setEntries((prev) => [...prev, data].sort((a, b) => (a.statement_date < b.statement_date ? -1 : 1)));
        return { success: true, data };
      } catch (err) {
        const errMessage = err instanceof Error ? err.message : 'Failed to add entry';
        logger.error('Unexpected error adding bank statement entry', err);
        setError(errMessage);
        return { success: false, error: errMessage };
      } finally {
        setLoading(false);
      }
    },
    [currentOrganization]
  );

  const updateEntry = useCallback(
    async (id, payload) => {
      if (!currentOrganization) {
        setError('No organization selected');
        return { success: false, error: 'No organization selected' };
      }

      setLoading(true);
      setError(null);
      try {
        const updateData = {};
        if (payload.description !== undefined) updateData.description = payload.description;
        if (payload.amount !== undefined) updateData.amount = Number(payload.amount);
        if (payload.reconciled_at !== undefined) updateData.reconciled_at = payload.reconciled_at;
        if (payload.transaction_line_id !== undefined) updateData.transaction_line_id = payload.transaction_line_id;

        const { data, error: updateError } = await supabase
          .from('bank_statement_entries')
          .update(updateData)
          .eq('id', id)
          .eq('organization_id', currentOrganization.id)
          .select()
          .single();

        if (updateError) {
          logger.error('Failed to update bank statement entry', updateError);
          setError(updateError.message);
          return { success: false, error: updateError.message };
        }

        setEntries((prev) => prev.map((e) => (e.id === id ? data : e)));
        return { success: true, data };
      } catch (err) {
        const errMessage = err instanceof Error ? err.message : 'Failed to update entry';
        logger.error('Unexpected error updating bank statement entry', err);
        setError(errMessage);
        return { success: false, error: errMessage };
      } finally {
        setLoading(false);
      }
    },
    [currentOrganization]
  );

  const reconcileEntry = useCallback(
    async (entryId, transactionLineId) => {
      return updateEntry(entryId, {
        transaction_line_id: transactionLineId,
        reconciled_at: new Date().toISOString(),
      });
    },
    [updateEntry]
  );

  const deleteEntry = useCallback(
    async (id) => {
      if (!currentOrganization) {
        setError('No organization selected');
        return { success: false, error: 'No organization selected' };
      }

      setLoading(true);
      setError(null);
      try {
        const { error: deleteError } = await supabase
          .from('bank_statement_entries')
          .delete()
          .eq('id', id)
          .eq('organization_id', currentOrganization.id);

        if (deleteError) {
          logger.error('Failed to delete bank statement entry', deleteError);
          setError(deleteError.message);
          return { success: false, error: deleteError.message };
        }

        setEntries((prev) => prev.filter((e) => e.id !== id));
        return { success: true };
      } catch (err) {
        const errMessage = err instanceof Error ? err.message : 'Failed to delete entry';
        logger.error('Unexpected error deleting bank statement entry', err);
        setError(errMessage);
        return { success: false, error: errMessage };
      } finally {
        setLoading(false);
      }
    },
    [currentOrganization]
  );

  return {
    entries,
    loading,
    error,
    fetchEntries,
    addEntry,
    updateEntry,
    deleteEntry,
    reconcileEntry,
  };
}
