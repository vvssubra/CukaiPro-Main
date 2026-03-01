import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';
import { useOrganization } from '../context/OrganizationContext';
import { runningBalance } from '../utils/accountingHelpers';

/**
 * Fetch ledger lines for one or more accounts in a date range, with running balance.
 * For General Ledger: pass single accountId. For Sales/Purchase Ledger: filter by account type (receivable/payable) and optional contact.
 * @param {{ accountId?: string, accountIds?: string[], dateFrom?: string, dateTo?: string, contactId?: string }} [filters]
 * @returns {{ lines, openingBalance, closingBalance, loading, error, fetchLedger }}
 */
export function useLedger(filters = {}) {
  const { currentOrganization } = useOrganization();
  const [lines, setLines] = useState([]);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [closingBalance, setClosingBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLedger = useCallback(async () => {
    if (!currentOrganization) return;

    const accountId = filters.accountId;
    const accountIds = filters.accountIds || (accountId ? [accountId] : []);
    if (accountIds.length === 0) {
      setLines([]);
      setOpeningBalance(0);
      setClosingBalance(0);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data: accountsData } = await supabase
        .from('accounts')
        .select('id, opening_balance')
        .eq('organization_id', currentOrganization.id)
        .in('id', accountIds);

      const openingByAccount = {};
      (accountsData || []).forEach((a) => {
        openingByAccount[a.id] = Number(a.opening_balance) || 0;
      });
      const totalOpening = Object.values(openingByAccount).reduce((s, b) => s + b, 0);
      setOpeningBalance(totalOpening);

      let q = supabase
        .from('transaction_lines')
        .select(
          'id, transaction_id, account_id, debit, credit, description, sort_order, transactions(ref_no, transaction_date, description, contact_id, contact:contacts(name))'
        )
        .in('account_id', accountIds)
        .order('transaction_date', { ascending: true })
        .order('transaction_id')
        .order('sort_order', { ascending: true });

      const { data: linesData, error: linesError } = await q;

      if (linesError) {
        logger.error('Failed to fetch ledger lines', linesError);
        setError(linesError.message);
        setLines([]);
        setClosingBalance(0);
        return;
      }

      let list = (linesData || []).map((l) => {
        const t = l.transactions || {};
        return {
          ...l,
          transaction_date: t.transaction_date,
          ref_no: t.ref_no,
          contact_name: t.contact?.name ?? t.contacts?.name,
          transaction_description: t.description,
        };
      });

      if (filters.dateFrom) {
        list = list.filter((row) => row.transaction_date >= filters.dateFrom);
      }
      if (filters.dateTo) {
        list = list.filter((row) => row.transaction_date <= filters.dateTo);
      }
      if (filters.contactId) {
        list = list.filter((row) => row.transaction?.contact_id === filters.contactId);
      }

      const withBalance = runningBalance(totalOpening, list);
      const closing = withBalance.length > 0 ? withBalance[withBalance.length - 1].balance : totalOpening;
      setClosingBalance(closing);
      setLines(withBalance);
    } catch (err) {
      logger.error('Unexpected error fetching ledger', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch ledger');
      setLines([]);
      setOpeningBalance(0);
      setClosingBalance(0);
    } finally {
      setLoading(false);
    }
  }, [
    currentOrganization,
    filters.accountId,
    filters.accountIds,
    filters.dateFrom,
    filters.dateTo,
    filters.contactId,
  ]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  return {
    lines,
    openingBalance,
    closingBalance,
    loading,
    error,
    fetchLedger,
  };
}
