import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';
import { useOrganization } from '../context/OrganizationContext';

/**
 * Compute total remuneration and net employment income for an EA record.
 * @param {Object} ea - EA form record
 * @returns {{ totalRemuneration: number, netEmploymentIncome: number }}
 */
export function computeEASummary(ea) {
  const grossSalary = Number(ea.gross_salary) || 0;
  const allowances = Number(ea.allowances) || 0;
  const bonuses = Number(ea.bonuses) || 0;
  const bik = Number(ea.benefits_in_kind) || 0;
  const overtime = Number(ea.overtime) || 0;
  const directorFees = Number(ea.director_fees) || 0;
  const commission = Number(ea.commission) || 0;
  const epfEmployee = Number(ea.epf_employee) || 0;
  const socso = Number(ea.socso) || 0;
  const eis = Number(ea.eis) || 0;

  const totalRemuneration = grossSalary + allowances + bonuses + bik + overtime + directorFees + commission;
  const netEmploymentIncome = Math.max(0, totalRemuneration - epfEmployee - socso - eis);

  return { totalRemuneration, netEmploymentIncome };
}

/**
 * Hook: fetch, add, update, delete EA forms (employment income records).
 * All operations are scoped to the current organization.
 */
export function useEAForms() {
  const { currentOrganization } = useOrganization();
  const [eaForms, setEaForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEAForms = useCallback(
    async (taxYear) => {
      if (!currentOrganization) return;

      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('ea_forms')
          .select('*')
          .eq('organization_id', currentOrganization.id)
          .eq('tax_year', taxYear)
          .order('employee_name', { ascending: true });

        if (fetchError) {
          logger.error('Failed to fetch EA forms', fetchError);
          setError(fetchError.message);
          setEaForms([]);
          return;
        }
        setEaForms(data ?? []);
      } catch (err) {
        logger.error('Unexpected error fetching EA forms', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch EA forms');
        setEaForms([]);
      } finally {
        setLoading(false);
      }
    },
    [currentOrganization]
  );

  const addEAForm = useCallback(
    async (formData) => {
      if (!currentOrganization) {
        setError('No organization selected');
        return { success: false, error: 'No organization selected' };
      }

      setLoading(true);
      setError(null);
      try {
        const row = {
          organization_id: currentOrganization.id,
          tax_year: Number(formData.tax_year),
          employee_name: String(formData.employee_name || '').trim(),
          employee_ic: formData.employee_ic?.trim() || null,
          employee_tax_no: formData.employee_tax_no?.trim() || null,
          gross_salary: Number(formData.gross_salary) || 0,
          allowances: Number(formData.allowances) || 0,
          bonuses: Number(formData.bonuses) || 0,
          benefits_in_kind: Number(formData.benefits_in_kind) || 0,
          overtime: Number(formData.overtime) || 0,
          director_fees: Number(formData.director_fees) || 0,
          commission: Number(formData.commission) || 0,
          epf_employee: Number(formData.epf_employee) || 0,
          epf_employer: Number(formData.epf_employer) || 0,
          socso: Number(formData.socso) || 0,
          eis: Number(formData.eis) || 0,
          pcb: Number(formData.pcb) || 0,
          notes: formData.notes?.trim() || null,
        };

        const { data: inserted, error: insertError } = await supabase
          .from('ea_forms')
          .insert(row)
          .select()
          .single();

        if (insertError) {
          setError(insertError.message);
          return { success: false, error: insertError.message };
        }
        setEaForms((prev) => [inserted, ...prev].sort((a, b) => (a.employee_name || '').localeCompare(b.employee_name || '')));
        return { success: true, data: inserted };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to add EA form';
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [currentOrganization]
  );

  const updateEAForm = useCallback(
    async (id, formData) => {
      if (!currentOrganization) {
        setError('No organization selected');
        return { success: false, error: 'No organization selected' };
      }

      setLoading(true);
      setError(null);
      try {
        const updates = {
          employee_name: String(formData.employee_name || '').trim(),
          employee_ic: formData.employee_ic?.trim() || null,
          employee_tax_no: formData.employee_tax_no?.trim() || null,
          gross_salary: Number(formData.gross_salary) || 0,
          allowances: Number(formData.allowances) || 0,
          bonuses: Number(formData.bonuses) || 0,
          benefits_in_kind: Number(formData.benefits_in_kind) || 0,
          overtime: Number(formData.overtime) || 0,
          director_fees: Number(formData.director_fees) || 0,
          commission: Number(formData.commission) || 0,
          epf_employee: Number(formData.epf_employee) || 0,
          epf_employer: Number(formData.epf_employer) || 0,
          socso: Number(formData.socso) || 0,
          eis: Number(formData.eis) || 0,
          pcb: Number(formData.pcb) || 0,
          notes: formData.notes?.trim() || null,
          updated_at: new Date().toISOString(),
        };

        const { data: updated, error: updateError } = await supabase
          .from('ea_forms')
          .update(updates)
          .eq('id', id)
          .eq('organization_id', currentOrganization.id)
          .select()
          .single();

        if (updateError) {
          setError(updateError.message);
          return { success: false, error: updateError.message };
        }
        setEaForms((prev) =>
          prev
            .map((x) => (x.id === id ? updated : x))
            .sort((a, b) => (a.employee_name || '').localeCompare(b.employee_name || ''))
        );
        return { success: true, data: updated };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to update EA form';
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [currentOrganization]
  );

  const deleteEAForm = useCallback(
    async (id) => {
      if (!currentOrganization) {
        setError('No organization selected');
        return { success: false, error: 'No organization selected' };
      }

      setLoading(true);
      setError(null);
      try {
        const { error: deleteError } = await supabase
          .from('ea_forms')
          .delete()
          .eq('id', id)
          .eq('organization_id', currentOrganization.id);

        if (deleteError) {
          setError(deleteError.message);
          return { success: false, error: deleteError.message };
        }
        setEaForms((prev) => prev.filter((x) => x.id !== id));
        return { success: true };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to delete EA form';
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [currentOrganization]
  );

  return {
    eaForms,
    loading,
    error,
    fetchEAForms,
    addEAForm,
    updateEAForm,
    deleteEAForm,
  };
}
