import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';
import { useOrganization } from '../context/OrganizationContext';
import { balancesAsAt } from '../utils/accountingHelpers';

/**
 * Fetch all accounts and compute balances as at a given date (for Balance Sheet, P&L).
 * @param {string} [asOfDate] - YYYY-MM-DD; if not provided, uses today
 * @returns {{ accounts, balances, loading, error, fetchBalances }}
 */
export function useAccountBalances(asOfDate) {
  const { currentOrganization } = useOrganization();
  const [accounts, setAccounts] = useState([]);
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBalances = useCallback(async () => {
    if (!currentOrganization) return;

    const dateStr = asOfDate || new Date().toISOString().slice(0, 10);
    setLoading(true);
    setError(null);
    try {
      const { data: accountsData, error: accountsError } = await supabase
        .from('accounts')
        .select('id, name, code, type, opening_balance')
        .eq('organization_id', currentOrganization.id);

      if (accountsError) {
        logger.error('Failed to fetch accounts for balances', accountsError);
        setError(accountsError.message);
        setAccounts([]);
        setBalances({});
        return;
      }

      setAccounts(accountsData ?? []);

      const { data: linesData, error: linesError } = await supabase
        .from('transaction_lines')
        .select('account_id, debit, credit, transactions(transaction_date)')
        .in('account_id', (accountsData || []).map((a) => a.id));

      if (linesError) {
        logger.error('Failed to fetch lines for balances', linesError);
        setError(linesError.message);
        setBalances({});
        return;
      }

      const linesWithDate = (linesData || []).map((l) => ({
        account_id: l.account_id,
        debit: l.debit,
        credit: l.credit,
        transaction_date: l.transactions?.transaction_date,
      }));

      const bal = balancesAsAt(accountsData || [], linesWithDate, dateStr);
      setBalances(bal);
    } catch (err) {
      logger.error('Unexpected error fetching account balances', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch balances');
      setAccounts([]);
      setBalances({});
    } finally {
      setLoading(false);
    }
  }, [currentOrganization, asOfDate]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return {
    accounts,
    balances,
    loading,
    error,
    fetchBalances,
  };
}
