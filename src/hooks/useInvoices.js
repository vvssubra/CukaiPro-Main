import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';
import { useOrganization } from '../context/OrganizationContext';
import { insertAuditLog } from '../utils/auditLog';

/**
 * Custom hook for managing invoices with Supabase.
 * All operations are scoped to the current organization.
 *
 * @returns {{
 *   invoices: Array<object>,
 *   loading: boolean,
 *   error: string | null,
 *   fetchInvoices: () => Promise<void>,
 *   createInvoice: (invoiceData: object) => Promise<{ success: boolean; data?: object; error?: string }>,
 *   deleteInvoice: (id: string) => Promise<{ success: boolean; error?: string }>
 * }}
 */
export function useInvoices() {
  const { currentOrganization } = useOrganization();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInvoices = useCallback(async () => {
    if (!currentOrganization) return;

    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('invoices')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        logger.error('Failed to fetch invoices', fetchError);
        setError(fetchError.message);
        setInvoices([]);
        return;
      }

      setInvoices(data ?? []);
    } catch (err) {
      logger.error('Unexpected error fetching invoices', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [currentOrganization]);

  const createInvoice = useCallback(
    async (invoiceData) => {
      if (!currentOrganization) {
        setError('No organization selected');
        return { success: false, error: 'No organization selected' };
      }

      setLoading(true);
      setError(null);
      try {
        const { data, error: insertError } = await supabase
          .from('invoices')
          .insert({
            organization_id: currentOrganization.id,
            client_name: invoiceData.clientName,
            tin: invoiceData.tin,
            amount: invoiceData.amount,
            invoice_date: invoiceData.invoiceDate,
            notes: invoiceData.notes ?? null,
            status: 'draft',
          })
          .select()
          .single();

        if (insertError) {
          logger.error('Failed to create invoice', insertError);
          setError(insertError.message);
          return { success: false, error: insertError.message };
        }

        insertAuditLog({
          entityType: 'invoice',
          entityId: data.id,
          action: 'create',
          newData: data,
          organizationId: currentOrganization.id,
        }).catch(() => {});

        setInvoices((prev) => [data, ...prev]);
        return { success: true, data };
      } catch (err) {
        const errMessage = err instanceof Error ? err.message : 'Failed to create invoice';
        logger.error('Unexpected error creating invoice', err);
        setError(errMessage);
        return { success: false, error: errMessage };
      } finally {
        setLoading(false);
      }
    },
    [currentOrganization]
  );

  const deleteInvoice = useCallback(
    async (id) => {
      if (!currentOrganization) {
        setError('No organization selected');
        return { success: false, error: 'No organization selected' };
      }

      setLoading(true);
      setError(null);
      try {
        const existing = invoices.find((inv) => inv.id === id);
        const { error: deleteError } = await supabase
          .from('invoices')
          .delete()
          .eq('id', id)
          .eq('organization_id', currentOrganization.id);

        if (deleteError) {
          logger.error('Failed to delete invoice', deleteError);
          setError(deleteError.message);
          return { success: false, error: deleteError.message };
        }

        insertAuditLog({
          entityType: 'invoice',
          entityId: id,
          action: 'delete',
          oldData: existing ?? null,
          organizationId: currentOrganization.id,
        }).catch(() => {});

        setInvoices((prev) => prev.filter((inv) => inv.id !== id));
        return { success: true };
      } catch (err) {
        const errMessage = err instanceof Error ? err.message : 'Failed to delete invoice';
        logger.error('Unexpected error deleting invoice', err);
        setError(errMessage);
        return { success: false, error: errMessage };
      } finally {
        setLoading(false);
      }
    },
    [currentOrganization, invoices]
  );

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return {
    invoices,
    loading,
    error,
    fetchInvoices,
    createInvoice,
    deleteInvoice,
  };
}
