import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';
import { useOrganization } from '../context/OrganizationContext';

const TRANSACTION_TYPES = [
  'journal_entry',
  'invoice',
  'payment',
  'receipt',
  'bill',
  'credit_note',
];

/**
 * Fetch transactions with optional filters. Create transaction with lines (debits must equal credits).
 * @param {{ dateFrom?: string, dateTo?: string, type?: string, refNo?: string, contactId?: string, accountId?: string }} [filters]
 * @returns {{ transactions, loading, error, fetchTransactions, createTransaction, deleteTransaction }}
 */
export function useTransactions(filters = {}) {
  const { currentOrganization } = useOrganization();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async () => {
    if (!currentOrganization) return;

    setLoading(true);
    setError(null);
    try {
      let q = supabase
        .from('transactions')
        .select(
          '*, contact:contacts(id, name, type), transaction_lines(id, account_id, account:accounts(id, name, code, type), debit, credit, description, sort_order)'
        )
        .eq('organization_id', currentOrganization.id)
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (filters.dateFrom) q = q.gte('transaction_date', filters.dateFrom);
      if (filters.dateTo) q = q.lte('transaction_date', filters.dateTo);
      if (filters.type) q = q.eq('type', filters.type);
      if (filters.refNo) q = q.ilike('ref_no', `%${filters.refNo}%`);
      if (filters.contactId) q = q.eq('contact_id', filters.contactId);

      const { data, error: fetchError } = await q;

      if (fetchError) {
        logger.error('Failed to fetch transactions', fetchError);
        setError(fetchError.message);
        setTransactions([]);
        return;
      }

      let list = data ?? [];
      if (filters.accountId) {
        list = list.filter((t) =>
          (t.transaction_lines || []).some((l) => l.account_id === filters.accountId)
        );
      }

      setTransactions(list);
    } catch (err) {
      logger.error('Unexpected error fetching transactions', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [
    currentOrganization,
    filters.dateFrom,
    filters.dateTo,
    filters.type,
    filters.refNo,
    filters.contactId,
    filters.accountId,
  ]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  /**
   * Create a transaction with lines. Lines must balance (sum debit = sum credit).
   * @param {{ type: string, ref_no?: string, transaction_date: string, description?: string, contact_id?: string, invoice_id?: string }} payload
   * @param {Array<{ account_id: string, debit: number, credit: number, description?: string }>} lines
   */
  const createTransaction = useCallback(
    async (payload, lines) => {
      if (!currentOrganization) {
        setError('No organization selected');
        return { success: false, error: 'No organization selected' };
      }

      const totalDebit = (lines || []).reduce((s, l) => s + (Number(l.debit) || 0), 0);
      const totalCredit = (lines || []).reduce((s, l) => s + (Number(l.credit) || 0), 0);
      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        const errMsg = 'Debits must equal credits';
        setError(errMsg);
        return { success: false, error: errMsg };
      }

      if (!lines || lines.length === 0) {
        const errMsg = 'At least one line is required';
        setError(errMsg);
        return { success: false, error: errMsg };
      }

      setLoading(true);
      setError(null);
      try {
        const { data: tx, error: txError } = await supabase
          .from('transactions')
          .insert({
            organization_id: currentOrganization.id,
            type: payload.type,
            ref_no: payload.ref_no || null,
            transaction_date: payload.transaction_date,
            description: payload.description || null,
            contact_id: payload.contact_id || null,
            invoice_id: payload.invoice_id || null,
          })
          .select()
          .single();

        if (txError) {
          logger.error('Failed to create transaction', txError);
          setError(txError.message);
          return { success: false, error: txError.message };
        }

        const lineRows = lines.map((l, i) => ({
          transaction_id: tx.id,
          account_id: l.account_id,
          debit: Number(l.debit) || 0,
          credit: Number(l.credit) || 0,
          description: l.description || null,
          sort_order: i,
        }));

        const { error: linesError } = await supabase.from('transaction_lines').insert(lineRows);

        if (linesError) {
          logger.error('Failed to create transaction lines', linesError);
          await supabase.from('transactions').delete().eq('id', tx.id);
          setError(linesError.message);
          return { success: false, error: linesError.message };
        }

        const { data: fullTx } = await supabase
          .from('transactions')
          .select(
            '*, contact:contacts(id, name, type), transaction_lines(id, account_id, account:accounts(id, name, code, type), debit, credit, description, sort_order)'
          )
          .eq('id', tx.id)
          .single();

        setTransactions((prev) => [fullTx || tx, ...prev]);
        return { success: true, data: fullTx || tx };
      } catch (err) {
        const errMessage = err instanceof Error ? err.message : 'Failed to create transaction';
        logger.error('Unexpected error creating transaction', err);
        setError(errMessage);
        return { success: false, error: errMessage };
      } finally {
        setLoading(false);
      }
    },
    [currentOrganization]
  );

  const deleteTransaction = useCallback(
    async (id) => {
      if (!currentOrganization) {
        setError('No organization selected');
        return { success: false, error: 'No organization selected' };
      }

      setLoading(true);
      setError(null);
      try {
        const { error: deleteLinesError } = await supabase
          .from('transaction_lines')
          .delete()
          .eq('transaction_id', id);

        if (deleteLinesError) {
          logger.error('Failed to delete transaction lines', deleteLinesError);
          setError(deleteLinesError.message);
          return { success: false, error: deleteLinesError.message };
        }

        const { error: deleteTxError } = await supabase
          .from('transactions')
          .delete()
          .eq('id', id)
          .eq('organization_id', currentOrganization.id);

        if (deleteTxError) {
          logger.error('Failed to delete transaction', deleteTxError);
          setError(deleteTxError.message);
          return { success: false, error: deleteTxError.message };
        }

        setTransactions((prev) => prev.filter((t) => t.id !== id));
        return { success: true };
      } catch (err) {
        const errMessage = err instanceof Error ? err.message : 'Failed to delete transaction';
        logger.error('Unexpected error deleting transaction', err);
        setError(errMessage);
        return { success: false, error: errMessage };
      } finally {
        setLoading(false);
      }
    },
    [currentOrganization]
  );

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    createTransaction,
    deleteTransaction,
    TRANSACTION_TYPES,
  };
}
