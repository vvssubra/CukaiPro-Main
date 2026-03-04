import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';
import { useOrganization } from '../context/OrganizationContext';

const REF_PREFIX = 'QT-';
const PAD_LENGTH = 6;

/**
 * Parse ref_no (e.g. QT-000001) to number. Returns 0 if invalid.
 */
function parseRefNumber(refNo) {
  if (!refNo || typeof refNo !== 'string') return 0;
  const match = refNo.replace(REF_PREFIX, '').trim().match(/^\d+$/);
  return match ? parseInt(match[0], 10) : 0;
}

/**
 * Generate next ref_no for organization. Sequential for audit trail.
 */
async function getNextRefNo(supabaseClient, organizationId) {
  const { data, error } = await supabaseClient
    .from('quotations')
    .select('ref_no')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) return null;
  let maxNum = 0;
  (data || []).forEach((row) => {
    const n = parseRefNumber(row.ref_no);
    if (n > maxNum) maxNum = n;
  });
  const next = maxNum + 1;
  return `${REF_PREFIX}${String(next).padStart(PAD_LENGTH, '0')}`;
}

/**
 * Quotations hook: list, create, update, delete with lines.
 * Summary: Last 365 days / Last 12 months with Pending, Lost, Success counts and MYR totals.
 * Quotations are not revenue; for estimation until converted to invoice.
 *
 * @param {{ status?: string, dateFrom?: string, dateTo?: string }} [filters]
 * @returns {{ quotations, quotationLinesMap, loading, error, summary365, summary12Months, fetchQuotations, createQuotation, updateQuotation, deleteQuotation, getNextRefNo }}
 */
export function useQuotations(filters = {}) {
  const { currentOrganization } = useOrganization();
  const [quotations, setQuotations] = useState([]);
  const [quotationLinesMap, setQuotationLinesMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchQuotations = useCallback(async () => {
    if (!currentOrganization) return;

    setLoading(true);
    setError(null);
    try {
      let q = supabase
        .from('quotations')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('quotation_date', { ascending: false });

      if (filters.status) q = q.eq('status', filters.status);
      if (filters.dateFrom) q = q.gte('quotation_date', filters.dateFrom);
      if (filters.dateTo) q = q.lte('quotation_date', filters.dateTo);

      const { data: quotes, error: fetchError } = await q;

      if (fetchError) {
        logger.error('Failed to fetch quotations', fetchError);
        setError(fetchError.message);
        setQuotations([]);
        setQuotationLinesMap({});
        return;
      }

      setQuotations(quotes ?? []);

      if (!quotes?.length) {
        setQuotationLinesMap({});
        return;
      }

      const ids = quotes.map((r) => r.id);
      const { data: lines, error: linesError } = await supabase
        .from('quotation_lines')
        .select('*')
        .in('quotation_id', ids)
        .order('sort_order', { ascending: true });

      if (linesError) {
        logger.error('Failed to fetch quotation lines', linesError);
        setQuotationLinesMap({});
        return;
      }

      const map = {};
      (lines || []).forEach((line) => {
        if (!map[line.quotation_id]) map[line.quotation_id] = [];
        map[line.quotation_id].push(line);
      });
      setQuotationLinesMap(map);
    } catch (err) {
      logger.error('Unexpected error fetching quotations', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch quotations');
      setQuotations([]);
      setQuotationLinesMap({});
    } finally {
      setLoading(false);
    }
  }, [currentOrganization, filters.status, filters.dateFrom, filters.dateTo]);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  const createQuotation = useCallback(
    async (payload) => {
      if (!currentOrganization) {
        setError('No organization selected');
        return { success: false, error: 'No organization selected' };
      }

      setLoading(true);
      setError(null);
      try {
        const refNo = await getNextRefNo(supabase, currentOrganization.id);
        if (!refNo) {
          setError('Could not generate quotation number');
          return { success: false, error: 'Could not generate quotation number' };
        }

        const { data: quote, error: insertError } = await supabase
          .from('quotations')
          .insert({
            organization_id: currentOrganization.id,
            contact_id: payload.contact_id ?? null,
            ref_no: refNo,
            quotation_date: payload.quotation_date,
            status: payload.status ?? 'pending',
            total: Number(payload.total) || 0,
            currency: payload.currency ?? 'MYR',
            valid_until: payload.valid_until ?? null,
            notes: payload.notes ?? null,
          })
          .select()
          .single();

        if (insertError) {
          logger.error('Failed to create quotation', insertError);
          setError(insertError.message);
          return { success: false, error: insertError.message };
        }

        const lines = payload.lines || [];
        if (lines.length > 0) {
          const lineRows = lines.map((line, idx) => ({
            quotation_id: quote.id,
            product_code: line.product_code ?? null,
            product_variant: line.product_variant ?? null,
            unit: line.unit ?? null,
            type: line.type ?? null,
            doc_no: line.doc_no ?? null,
            description: line.description ?? null,
            qty: Number(line.qty) || 0,
            unit_price: Number(line.unit_price) || 0,
            discount_pct: Number(line.discount_pct) || 0,
            discount_amount: Number(line.discount_amount) || 0,
            subtotal: Number(line.subtotal) || 0,
            sort_order: idx,
          }));
          const { error: linesError } = await supabase.from('quotation_lines').insert(lineRows);
          if (linesError) {
            logger.error('Failed to create quotation lines', linesError);
            setQuotations((prev) => [quote, ...prev]);
            return { success: true, data: quote };
          }
          setQuotationLinesMap((prev) => ({ ...prev, [quote.id]: lineRows }));
        }

        setQuotations((prev) => [quote, ...prev]);
        return { success: true, data: quote };
      } catch (err) {
        const errMessage = err instanceof Error ? err.message : 'Failed to create quotation';
        logger.error('Unexpected error creating quotation', err);
        setError(errMessage);
        return { success: false, error: errMessage };
      } finally {
        setLoading(false);
      }
    },
    [currentOrganization]
  );

  const updateQuotation = useCallback(
    async (id, payload) => {
      if (!currentOrganization) {
        setError('No organization selected');
        return { success: false, error: 'No organization selected' };
      }

      setLoading(true);
      setError(null);
      try {
        const updateData = {};
        if (payload.contact_id !== undefined) updateData.contact_id = payload.contact_id ?? null;
        if (payload.quotation_date !== undefined) updateData.quotation_date = payload.quotation_date;
        if (payload.status !== undefined) updateData.status = payload.status;
        if (payload.total !== undefined) updateData.total = Number(payload.total) || 0;
        if (payload.currency !== undefined) updateData.currency = payload.currency;
        if (payload.valid_until !== undefined) updateData.valid_until = payload.valid_until ?? null;
        if (payload.notes !== undefined) updateData.notes = payload.notes ?? null;

        if (Object.keys(updateData).length > 0) {
          const { data: quote, error: updateError } = await supabase
            .from('quotations')
            .update(updateData)
            .eq('id', id)
            .eq('organization_id', currentOrganization.id)
            .select()
            .single();

          if (updateError) {
            logger.error('Failed to update quotation', updateError);
            setError(updateError.message);
            return { success: false, error: updateError.message };
          }
          setQuotations((prev) => prev.map((q) => (q.id === id ? quote : q)));
        }

        if (payload.lines !== undefined) {
          await supabase.from('quotation_lines').delete().eq('quotation_id', id);
          const lines = payload.lines || [];
          if (lines.length > 0) {
            const lineRows = lines.map((line, idx) => ({
              quotation_id: id,
              product_code: line.product_code ?? null,
              product_variant: line.product_variant ?? null,
              unit: line.unit ?? null,
              type: line.type ?? null,
              doc_no: line.doc_no ?? null,
              description: line.description ?? null,
              qty: Number(line.qty) || 0,
              unit_price: Number(line.unit_price) || 0,
              discount_pct: Number(line.discount_pct) || 0,
              discount_amount: Number(line.discount_amount) || 0,
              subtotal: Number(line.subtotal) || 0,
              sort_order: idx,
            }));
            await supabase.from('quotation_lines').insert(lineRows);
          }
          setQuotationLinesMap((prev) => ({ ...prev, [id]: lines }));
        }

        return { success: true };
      } catch (err) {
        const errMessage = err instanceof Error ? err.message : 'Failed to update quotation';
        logger.error('Unexpected error updating quotation', err);
        setError(errMessage);
        return { success: false, error: errMessage };
      } finally {
        setLoading(false);
      }
    },
    [currentOrganization]
  );

  const deleteQuotation = useCallback(
    async (id) => {
      if (!currentOrganization) {
        setError('No organization selected');
        return { success: false, error: 'No organization selected' };
      }

      setLoading(true);
      setError(null);
      try {
        const { error: deleteError } = await supabase
          .from('quotations')
          .delete()
          .eq('id', id)
          .eq('organization_id', currentOrganization.id);

        if (deleteError) {
          logger.error('Failed to delete quotation', deleteError);
          setError(deleteError.message);
          return { success: false, error: deleteError.message };
        }

        setQuotations((prev) => prev.filter((q) => q.id !== id));
        setQuotationLinesMap((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        return { success: true };
      } catch (err) {
        const errMessage = err instanceof Error ? err.message : 'Failed to delete quotation';
        logger.error('Unexpected error deleting quotation', err);
        setError(errMessage);
        return { success: false, error: errMessage };
      } finally {
        setLoading(false);
      }
    },
    [currentOrganization]
  );

  const summary365 = useMemo(() => {
    const now = new Date();
    const from = new Date(now);
    from.setDate(from.getDate() - 365);
    const fromStr = from.toISOString().slice(0, 10);
    const toStr = now.toISOString().slice(0, 10);
    return computeSummary(quotations, fromStr, toStr);
  }, [quotations]);

  const summary12Months = useMemo(() => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const fromStr = from.toISOString().slice(0, 10);
    const toStr = now.toISOString().slice(0, 10);
    return computeSummary(quotations, fromStr, toStr);
  }, [quotations]);

  return {
    quotations,
    quotationLinesMap,
    loading,
    error,
    summary365,
    summary12Months,
    fetchQuotations,
    createQuotation,
    updateQuotation,
    deleteQuotation,
    getNextRefNo: () => getNextRefNo(supabase, currentOrganization?.id),
  };
}

/**
 * Compute summary: count and total MYR per status (pending, lost, success).
 * All amounts in RM; use formatCurrency in UI.
 */
function computeSummary(quotations, dateFrom, dateTo) {
  const filtered = (quotations || []).filter((q) => {
    const d = q.quotation_date;
    if (!d) return false;
    const dateStr = typeof d === 'string' ? d.slice(0, 10) : d;
    return (!dateFrom || dateStr >= dateFrom) && (!dateTo || dateStr <= dateTo);
  });
  const totalCount = filtered.length;
  const byStatus = { pending: { count: 0, total: 0 }, lost: { count: 0, total: 0 }, success: { count: 0, total: 0 } };
  filtered.forEach((q) => {
    const status = (q.status || 'pending').toLowerCase();
    if (byStatus[status] == null) byStatus[status] = { count: 0, total: 0 };
    byStatus[status].count += 1;
    byStatus[status].total += Number(q.total) || 0;
  });
  return {
    totalCount,
    byStatus,
    totalMYR: filtered.reduce((sum, q) => sum + (Number(q.total) || 0), 0),
  };
}
