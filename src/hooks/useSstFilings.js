import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';
import { useOrganization } from '../context/OrganizationContext';
import { getNextFilingPeriod, getPeriodDates, getDueDate } from '../utils/sstPeriods';

/**
 * Hook for SST filing period tracking and status.
 * Manages sst_filings table: period (start/end), due_date, status (draft/ready/submitted).
 *
 * @returns {{
 *   filings: Array<object>,
 *   loading: boolean,
 *   error: string | null,
 *   nextFilingPeriod: object,
 *   nextDueDate: Date | null,
 *   daysUntilNextDue: number | null,
 *   fetchFilings: () => Promise<void>,
 *   createOrGetFiling: (year: number, month: number, totalAmount?: number) => Promise<{ success: boolean; data?: object; error?: string }>,
 *   updateFilingStatus: (id: string, status: 'draft'|'ready'|'submitted') => Promise<{ success: boolean; error?: string }>,
 *   updateFilingAmount: (id: string, totalAmount: number) => Promise<{ success: boolean; error?: string }>,
 * }}
 */
export function useSstFilings() {
  const { currentOrganization } = useOrganization();
  const [filings, setFilings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const nextFilingPeriod = getNextFilingPeriod();

  const fetchFilings = useCallback(async () => {
    if (!currentOrganization) return;

    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('sst_filings')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('period_start', { ascending: false });

      if (fetchError) {
        logger.error('Failed to fetch SST filings', fetchError);
        setError(fetchError.message);
        setFilings([]);
        return;
      }
      setFilings(data ?? []);
    } catch (err) {
      logger.error('Unexpected error fetching SST filings', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch filings');
      setFilings([]);
    } finally {
      setLoading(false);
    }
  }, [currentOrganization]);

  useEffect(() => {
    fetchFilings();
  }, [fetchFilings]);

  const createOrGetFiling = useCallback(
    async (year, month, totalAmount = 0) => {
      if (!currentOrganization) {
        return { success: false, error: 'No organization selected' };
      }

      setLoading(true);
      setError(null);
      try {
        const { startStr, endStr } = getPeriodDates(year, month);
        const dueDate = getDueDate(year, month);
        const dueStr = dueDate.toISOString().slice(0, 10);

        // Check if filing exists
        const existing = filings.find(
          (f) => f.period_start === startStr
        );
        if (existing) {
          setLoading(false);
          return { success: true, data: existing };
        }

        const { data, error: insertError } = await supabase
          .from('sst_filings')
          .insert({
            organization_id: currentOrganization.id,
            period_start: startStr,
            period_end: endStr,
            due_date: dueStr,
            total_amount: Number(totalAmount) || 0,
            status: 'draft',
          })
          .select()
          .single();

        if (insertError) {
          logger.error('Failed to create SST filing', insertError);
          setError(insertError.message);
          setLoading(false);
          return { success: false, error: insertError.message };
        }

        setFilings((prev) => [data, ...prev]);
        setLoading(false);
        return { success: true, data };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to create filing';
        logger.error('Error creating SST filing', err);
        setError(msg);
        setLoading(false);
        return { success: false, error: msg };
      }
    },
    [currentOrganization, filings]
  );

  const updateFilingStatus = useCallback(
    async (id, status) => {
      if (!currentOrganization) {
        return { success: false, error: 'No organization selected' };
      }

      setLoading(true);
      setError(null);
      try {
        const updates = { status };
        if (status === 'submitted') {
          updates.submitted_at = new Date().toISOString();
        }

        const { data, error: updateError } = await supabase
          .from('sst_filings')
          .update(updates)
          .eq('id', id)
          .eq('organization_id', currentOrganization.id)
          .select()
          .single();

        if (updateError) {
          logger.error('Failed to update SST filing status', updateError);
          setError(updateError.message);
          setLoading(false);
          return { success: false, error: updateError.message };
        }

        setFilings((prev) => prev.map((f) => (f.id === id ? data : f)));
        setLoading(false);
        return { success: true };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to update status';
        logger.error('Error updating SST filing', err);
        setError(msg);
        setLoading(false);
        return { success: false, error: msg };
      }
    },
    [currentOrganization]
  );

  const updateFilingAmount = useCallback(
    async (id, totalAmount) => {
      if (!currentOrganization) {
        return { success: false, error: 'No organization selected' };
      }

      setLoading(true);
      setError(null);
      try {
        const { data, error: updateError } = await supabase
          .from('sst_filings')
          .update({ total_amount: Number(totalAmount) || 0 })
          .eq('id', id)
          .eq('organization_id', currentOrganization.id)
          .select()
          .single();

        if (updateError) {
          logger.error('Failed to update SST filing amount', updateError);
          setError(updateError.message);
          setLoading(false);
          return { success: false, error: updateError.message };
        }

        setFilings((prev) => prev.map((f) => (f.id === id ? data : f)));
        setLoading(false);
        return { success: true };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to update amount';
        logger.error('Error updating SST filing', err);
        setError(msg);
        setLoading(false);
        return { success: false, error: msg };
      }
    },
    [currentOrganization]
  );

  // Next filing due: earliest upcoming period not yet submitted, else next period
  const pendingFilings = filings.filter((f) => f.status !== 'submitted');
  const nextPending = pendingFilings.sort(
    (a, b) => new Date(a.due_date) - new Date(b.due_date)
  )[0];
  const nextDueDate = nextPending
    ? new Date(nextPending.due_date)
    : nextFilingPeriod.dueDate;

  const daysUntilNextDue = nextDueDate
    ? Math.ceil((nextDueDate - new Date()) / (24 * 60 * 60 * 1000))
    : null;

  return {
    filings,
    loading,
    error,
    nextFilingPeriod,
    nextDueDate,
    daysUntilNextDue,
    fetchFilings,
    createOrGetFiling,
    updateFilingStatus,
    updateFilingAmount,
  };
}
