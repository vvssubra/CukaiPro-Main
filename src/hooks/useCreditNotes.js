import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';
import { useOrganization } from '../context/OrganizationContext';

const REF_PREFIX = 'CN-';
const PAD_LENGTH = 6;

/**
 * Parse ref_no (e.g. CN-000001) to number. Returns 0 if invalid.
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
    .from('credit_notes')
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
 * Credit notes hook: list, create, update, delete with lines.
 * Summary: Last 365 days / Last 12 months with Unapplied, Partially Applied, Fully Applied counts and MYR totals.
 * LHDN: credit notes reduce revenue in year of credit_note_date (simplified).
 *
 * @param {{ status?: string, dateFrom?: string, dateTo?: string }} [filters]
 * @returns {{ creditNotes, creditNoteLinesMap, loading, error, summary365, summary12Months, fetchCreditNotes, createCreditNote, updateCreditNote, deleteCreditNote, getNextRefNo }}
 */
export function useCreditNotes(filters = {}) {
  const { currentOrganization } = useOrganization();
  const [creditNotes, setCreditNotes] = useState([]);
  const [creditNoteLinesMap, setCreditNoteLinesMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCreditNotes = useCallback(async () => {
    if (!currentOrganization) return;

    setLoading(true);
    setError(null);
    try {
      let q = supabase
        .from('credit_notes')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('credit_note_date', { ascending: false });

      if (filters.status) q = q.eq('status', filters.status);
      if (filters.dateFrom) q = q.gte('credit_note_date', filters.dateFrom);
      if (filters.dateTo) q = q.lte('credit_note_date', filters.dateTo);

      const { data: notes, error: fetchError } = await q;

      if (fetchError) {
        logger.error('Failed to fetch credit notes', fetchError);
        setError(fetchError.message);
        setCreditNotes([]);
        setCreditNoteLinesMap({});
        return;
      }

      setCreditNotes(notes ?? []);

      if (!notes?.length) {
        setCreditNoteLinesMap({});
        return;
      }

      const ids = notes.map((r) => r.id);
      const { data: lines, error: linesError } = await supabase
        .from('credit_note_lines')
        .select('*')
        .in('credit_note_id', ids)
        .order('sort_order', { ascending: true });

      if (linesError) {
        logger.error('Failed to fetch credit note lines', linesError);
        setCreditNoteLinesMap({});
        return;
      }

      const map = {};
      (lines || []).forEach((line) => {
        if (!map[line.credit_note_id]) map[line.credit_note_id] = [];
        map[line.credit_note_id].push(line);
      });
      setCreditNoteLinesMap(map);
    } catch (err) {
      logger.error('Unexpected error fetching credit notes', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch credit notes');
      setCreditNotes([]);
      setCreditNoteLinesMap({});
    } finally {
      setLoading(false);
    }
  }, [currentOrganization, filters.status, filters.dateFrom, filters.dateTo]);

  useEffect(() => {
    fetchCreditNotes();
  }, [fetchCreditNotes]);

  const createCreditNote = useCallback(
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
          setError('Could not generate credit note number');
          return { success: false, error: 'Could not generate credit note number' };
        }

        const { data: note, error: insertError } = await supabase
          .from('credit_notes')
          .insert({
            organization_id: currentOrganization.id,
            contact_id: payload.contact_id ?? null,
            invoice_id: payload.invoice_id ?? null,
            ref_no: refNo,
            credit_note_date: payload.credit_note_date,
            status: payload.status ?? 'unapplied',
            total: Number(payload.total) || 0,
            currency: payload.currency ?? 'MYR',
            notes: payload.notes ?? null,
          })
          .select()
          .single();

        if (insertError) {
          logger.error('Failed to create credit note', insertError);
          setError(insertError.message);
          return { success: false, error: insertError.message };
        }

        const lines = payload.lines || [];
        if (lines.length > 0) {
          const lineRows = lines.map((line, idx) => ({
            credit_note_id: note.id,
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
          const { error: linesError } = await supabase.from('credit_note_lines').insert(lineRows);
          if (linesError) {
            logger.error('Failed to create credit note lines', linesError);
            setCreditNotes((prev) => [note, ...prev]);
            return { success: true, data: note };
          }
          setCreditNoteLinesMap((prev) => ({ ...prev, [note.id]: lineRows }));
        }

        setCreditNotes((prev) => [note, ...prev]);
        return { success: true, data: note };
      } catch (err) {
        const errMessage = err instanceof Error ? err.message : 'Failed to create credit note';
        logger.error('Unexpected error creating credit note', err);
        setError(errMessage);
        return { success: false, error: errMessage };
      } finally {
        setLoading(false);
      }
    },
    [currentOrganization]
  );

  const updateCreditNote = useCallback(
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
        if (payload.invoice_id !== undefined) updateData.invoice_id = payload.invoice_id ?? null;
        if (payload.credit_note_date !== undefined) updateData.credit_note_date = payload.credit_note_date;
        if (payload.status !== undefined) updateData.status = payload.status;
        if (payload.total !== undefined) updateData.total = Number(payload.total) || 0;
        if (payload.currency !== undefined) updateData.currency = payload.currency;
        if (payload.notes !== undefined) updateData.notes = payload.notes ?? null;

        if (Object.keys(updateData).length > 0) {
          const { data: note, error: updateError } = await supabase
            .from('credit_notes')
            .update(updateData)
            .eq('id', id)
            .eq('organization_id', currentOrganization.id)
            .select()
            .single();

          if (updateError) {
            logger.error('Failed to update credit note', updateError);
            setError(updateError.message);
            return { success: false, error: updateError.message };
          }
          setCreditNotes((prev) => prev.map((n) => (n.id === id ? note : n)));
        }

        if (payload.lines !== undefined) {
          await supabase.from('credit_note_lines').delete().eq('credit_note_id', id);
          const lines = payload.lines || [];
          if (lines.length > 0) {
            const lineRows = lines.map((line, idx) => ({
              credit_note_id: id,
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
            await supabase.from('credit_note_lines').insert(lineRows);
          }
          setCreditNoteLinesMap((prev) => ({ ...prev, [id]: lines }));
        }

        return { success: true };
      } catch (err) {
        const errMessage = err instanceof Error ? err.message : 'Failed to update credit note';
        logger.error('Unexpected error updating credit note', err);
        setError(errMessage);
        return { success: false, error: errMessage };
      } finally {
        setLoading(false);
      }
    },
    [currentOrganization]
  );

  const deleteCreditNote = useCallback(
    async (id) => {
      if (!currentOrganization) {
        setError('No organization selected');
        return { success: false, error: 'No organization selected' };
      }

      setLoading(true);
      setError(null);
      try {
        const { error: deleteError } = await supabase
          .from('credit_notes')
          .delete()
          .eq('id', id)
          .eq('organization_id', currentOrganization.id);

        if (deleteError) {
          logger.error('Failed to delete credit note', deleteError);
          setError(deleteError.message);
          return { success: false, error: deleteError.message };
        }

        setCreditNotes((prev) => prev.filter((n) => n.id !== id));
        setCreditNoteLinesMap((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        return { success: true };
      } catch (err) {
        const errMessage = err instanceof Error ? err.message : 'Failed to delete credit note';
        logger.error('Unexpected error deleting credit note', err);
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
    return computeSummary(creditNotes, fromStr, toStr);
  }, [creditNotes]);

  const summary12Months = useMemo(() => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const fromStr = from.toISOString().slice(0, 10);
    const toStr = now.toISOString().slice(0, 10);
    return computeSummary(creditNotes, fromStr, toStr);
  }, [creditNotes]);

  return {
    creditNotes,
    creditNoteLinesMap,
    loading,
    error,
    summary365,
    summary12Months,
    fetchCreditNotes,
    createCreditNote,
    updateCreditNote,
    deleteCreditNote,
    getNextRefNo: () => getNextRefNo(supabase, currentOrganization?.id),
  };
}

/**
 * Compute summary: count and total MYR per status (unapplied, partially_applied, fully_applied).
 */
function computeSummary(creditNotes, dateFrom, dateTo) {
  const filtered = (creditNotes || []).filter((n) => {
    const d = n.credit_note_date;
    if (!d) return false;
    const dateStr = typeof d === 'string' ? d.slice(0, 10) : d;
    return (!dateFrom || dateStr >= dateFrom) && (!dateTo || dateStr <= dateTo);
  });
  const totalCount = filtered.length;
  const byStatus = {
    unapplied: { count: 0, total: 0 },
    partially_applied: { count: 0, total: 0 },
    fully_applied: { count: 0, total: 0 },
  };
  filtered.forEach((n) => {
    const status = (n.status || 'unapplied').toLowerCase();
    if (byStatus[status] == null) byStatus[status] = { count: 0, total: 0 };
    byStatus[status].count += 1;
    byStatus[status].total += Number(n.total) || 0;
  });
  return {
    totalCount,
    byStatus,
    totalMYR: filtered.reduce((sum, n) => sum + (Number(n.total) || 0), 0),
  };
}
