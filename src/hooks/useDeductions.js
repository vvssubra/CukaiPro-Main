import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';
import { useOrganization } from '../context/OrganizationContext';
import { getCategoryById } from '../data/taxCategories';

const STORAGE_BUCKET = 'deduction-receipts';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/** Convert DD/MM/YYYY to YYYY-MM-DD for Postgres date column */
function toDbDate(val) {
  if (!val) return null;
  const s = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const [, d, mon, y] = m;
    return `${y}-${mon.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return s;
}

/**
 * Upload receipt to Supabase Storage.
 * @param {File} file
 * @param {string} orgId
 * @returns {Promise<{ path?: string, error?: string }>}
 */
export async function uploadReceipt(file, orgId) {
  if (file.size > MAX_FILE_SIZE) {
    return { error: 'File size must be 5MB or less.' };
  }
  const ext = file.name.split('.').pop() || 'bin';
  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const path = `${orgId}/${filename}`;
  try {
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (error) return { error: error.message };
    return { path };
  } catch (err) {
    logger.error('Upload receipt failed', err);
    return { error: err instanceof Error ? err.message : 'Upload failed' };
  }
}

/**
 * Get public or signed URL for a receipt path.
 * @param {string} path
 * @returns {string}
 */
export function getReceiptUrl(path) {
  if (!path) return '';
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data?.publicUrl || '';
}

/**
 * Hook: fetch, add, update, delete tax deductions with receipt upload.
 * All operations are scoped to the current organization.
 */
export function useDeductions() {
  const { currentOrganization } = useOrganization();
  const [deductions, setDeductions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDeductions = useCallback(
    async (taxYear) => {
      if (!currentOrganization) return;

      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('tax_deductions')
          .select('*')
          .eq('organization_id', currentOrganization.id)
          .eq('tax_year', taxYear)
          .order('deduction_date', { ascending: false });

        if (fetchError) {
          logger.error('Failed to fetch deductions', fetchError);
          setError(fetchError.message);
          setDeductions([]);
          return;
        }
        setDeductions(data ?? []);
      } catch (err) {
        logger.error('Unexpected error fetching deductions', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch deductions');
        setDeductions([]);
      } finally {
        setLoading(false);
      }
    },
    [currentOrganization]
  );

  const addDeduction = useCallback(
    async (formData, file = null) => {
      if (!currentOrganization) {
        setError('No organization selected');
        return { success: false, error: 'No organization selected' };
      }

      setLoading(true);
      setError(null);
      try {
        let receiptUrl = '';
        let receiptFilename = '';
        let hasReceipt = false;

        if (file) {
          const up = await uploadReceipt(file, currentOrganization.id);
          if (up.error) {
            setError(up.error);
            setLoading(false);
            return { success: false, error: up.error };
          }
          receiptUrl = getReceiptUrl(up.path);
          receiptFilename = file.name;
          hasReceipt = true;
        }

        const category = getCategoryById(formData.category_id);
        const amount = Number(formData.amount) || 0;
        const claimablePercentage =
          category?.claimable ?? (category?.initial != null ? category.initial + (category?.annual || 0) : 100);

        const row = {
          organization_id: currentOrganization.id,
          category_id: formData.category_id,
          category_name: (category?.name) || formData.category_id,
          category_type: (category?.type) || 'business',
          amount,
          claimable_percentage: claimablePercentage,
          deduction_date: toDbDate(formData.deduction_date),
          description: formData.description || null,
          tax_year: Number(formData.tax_year),
          receipt_url: receiptUrl || null,
          receipt_filename: receiptFilename || null,
          has_receipt: hasReceipt,
          status: formData.status || 'pending',
        };

        const { data: inserted, error: insertError } = await supabase
          .from('tax_deductions')
          .insert(row)
          .select()
          .single();

        if (insertError) {
          setError(insertError.message);
          return { success: false, error: insertError.message };
        }
        setDeductions((prev) => [inserted, ...prev]);
        return { success: true, data: inserted };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to add deduction';
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [currentOrganization]
  );

  const updateDeduction = useCallback(
    async (id, formData, file = null) => {
      if (!currentOrganization) {
        setError('No organization selected');
        return { success: false, error: 'No organization selected' };
      }

      setLoading(true);
      setError(null);
      try {
        const existing = deductions.find((d) => d.id === id);
        let receiptUrl = existing?.receipt_url || '';
        let receiptFilename = existing?.receipt_filename || '';
        let hasReceipt = existing?.has_receipt || false;

        if (file) {
          const up = await uploadReceipt(file, currentOrganization.id);
          if (up.error) {
            setError(up.error);
            setLoading(false);
            return { success: false, error: up.error };
          }
          receiptUrl = getReceiptUrl(up.path);
          receiptFilename = file.name;
          hasReceipt = true;
        }

        const category = getCategoryById(formData.category_id);
        const amount = Number(formData.amount) || 0;
        const claimablePercentage =
          category?.claimable ?? (category?.initial != null ? category.initial + (category?.annual || 0) : 100);

        const updates = {
          category_id: formData.category_id,
          category_name: (category?.name) || formData.category_id,
          category_type: (category?.type) || 'business',
          amount,
          claimable_percentage: claimablePercentage,
          deduction_date: toDbDate(formData.deduction_date),
          description: formData.description || null,
          receipt_url: receiptUrl || null,
          receipt_filename: receiptFilename || null,
          has_receipt: hasReceipt,
          status: formData.status || 'pending',
        };

        const { data: updated, error: updateError } = await supabase
          .from('tax_deductions')
          .update(updates)
          .eq('id', id)
          .eq('organization_id', currentOrganization.id)
          .select()
          .single();

        if (updateError) {
          setError(updateError.message);
          return { success: false, error: updateError.message };
        }
        setDeductions((prev) => prev.map((d) => (d.id === id ? updated : d)));
        return { success: true, data: updated };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to update deduction';
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [currentOrganization, deductions]
  );

  const deleteDeduction = useCallback(
    async (id) => {
      if (!currentOrganization) {
        setError('No organization selected');
        return { success: false, error: 'No organization selected' };
      }

      setLoading(true);
      setError(null);
      try {
        const { error: deleteError } = await supabase
          .from('tax_deductions')
          .delete()
          .eq('id', id)
          .eq('organization_id', currentOrganization.id);

        if (deleteError) {
          setError(deleteError.message);
          return { success: false, error: deleteError.message };
        }
        setDeductions((prev) => prev.filter((x) => x.id !== id));
        return { success: true };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to delete deduction';
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [currentOrganization]
  );

  return {
    deductions,
    loading,
    error,
    fetchDeductions,
    addDeduction,
    updateDeduction,
    deleteDeduction,
  };
}
