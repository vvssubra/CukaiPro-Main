import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

/**
 * Custom hook for managing invoices with Supabase.
 * Provides CRUD operations for the invoices table with loading and error states.
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
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetches all invoices from Supabase, ordered by created_at descending.
   * @returns {Promise<void>}
   */
  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('invoices')
        .select('*')
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
  };

  /**
   * Creates a new invoice in Supabase.
   * @param {object} invoiceData - Invoice data with clientName, tin, amount, invoiceDate, notes
   * @returns {Promise<{ success: boolean; data?: object; error?: string }>}
   */
  const createInvoice = async (invoiceData) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from('invoices')
        .insert({
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
  };

  /**
   * Deletes an invoice by ID.
   * @param {string} id - The invoice ID to delete
   * @returns {Promise<{ success: boolean; error?: string }>}
   */
  const deleteInvoice = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (deleteError) {
        logger.error('Failed to delete invoice', deleteError);
        setError(deleteError.message);
        return { success: false, error: deleteError.message };
      }

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
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return {
    invoices,
    loading,
    error,
    fetchInvoices,
    createInvoice,
    deleteInvoice,
  };
}
