import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Add or edit EA form (employment income) modal.
 * Supports common LHDN EA form fields for Malaysian tax filing.
 */
function AddEAFormModal({ isOpen, onClose, onSave, editEAForm, taxYear }) {
  const modalRef = useRef(null);
  const [employeeName, setEmployeeName] = useState('');
  const [employeeIc, setEmployeeIc] = useState('');
  const [employeeTaxNo, setEmployeeTaxNo] = useState('');
  const [grossSalary, setGrossSalary] = useState('');
  const [allowances, setAllowances] = useState('');
  const [bonuses, setBonuses] = useState('');
  const [benefitsInKind, setBenefitsInKind] = useState('');
  const [overtime, setOvertime] = useState('');
  const [directorFees, setDirectorFees] = useState('');
  const [commission, setCommission] = useState('');
  const [epfEmployee, setEpfEmployee] = useState('');
  const [epfEmployer, setEpfEmployer] = useState('');
  const [socso, setSocso] = useState('');
  const [eis, setEis] = useState('');
  const [pcb, setPcb] = useState('');
  const [notes, setNotes] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toNum = (val) => parseFloat(String(val).replace(/,/g, '')) || 0;
  const toStr = (n) => (n === 0 ? '' : String(n));

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    if (editEAForm) {
      setEmployeeName(editEAForm.employee_name || '');
      setEmployeeIc(editEAForm.employee_ic || '');
      setEmployeeTaxNo(editEAForm.employee_tax_no || '');
      setGrossSalary(toStr(editEAForm.gross_salary));
      setAllowances(toStr(editEAForm.allowances));
      setBonuses(toStr(editEAForm.bonuses));
      setBenefitsInKind(toStr(editEAForm.benefits_in_kind));
      setOvertime(toStr(editEAForm.overtime));
      setDirectorFees(toStr(editEAForm.director_fees));
      setCommission(toStr(editEAForm.commission));
      setEpfEmployee(toStr(editEAForm.epf_employee));
      setEpfEmployer(toStr(editEAForm.epf_employer));
      setSocso(toStr(editEAForm.socso));
      setEis(toStr(editEAForm.eis));
      setPcb(toStr(editEAForm.pcb));
      setNotes(editEAForm.notes || '');
    } else {
      setEmployeeName('');
      setEmployeeIc('');
      setEmployeeTaxNo('');
      setGrossSalary('');
      setAllowances('');
      setBonuses('');
      setBenefitsInKind('');
      setOvertime('');
      setDirectorFees('');
      setCommission('');
      setEpfEmployee('');
      setEpfEmployer('');
      setSocso('');
      setEis('');
      setPcb('');
      setNotes('');
    }
    setSubmitError('');
  }, [isOpen, editEAForm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!employeeName.trim()) {
      setSubmitError('Employee name is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = {
        tax_year: taxYear,
        employee_name: employeeName.trim(),
        employee_ic: employeeIc.trim() || null,
        employee_tax_no: employeeTaxNo.trim() || null,
        gross_salary: toNum(grossSalary),
        allowances: toNum(allowances),
        bonuses: toNum(bonuses),
        benefits_in_kind: toNum(benefitsInKind),
        overtime: toNum(overtime),
        director_fees: toNum(directorFees),
        commission: toNum(commission),
        epf_employee: toNum(epfEmployee),
        epf_employer: toNum(epfEmployer),
        socso: toNum(socso),
        eis: toNum(eis),
        pcb: toNum(pcb),
        notes: notes.trim() || null,
      };
      const result = await onSave(formData);
      if (result.success) onClose();
      else setSubmitError(result.error || 'Save failed.');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="ea-form-title">
      <div
        ref={modalRef}
        className="bg-white dark:bg-slate-custom border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 id="ea-form-title" className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            {editEAForm ? 'Edit EA Form' : 'Add EA Form'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Employment income details for LHDN Borang EA / e-Filing. Year of Assessment: {taxYear}.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Employee info */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Employee Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ea-employee-name" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Employee Name *</label>
                  <input
                    id="ea-employee-name"
                    type="text"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="ea-employee-ic" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">IC No. (YYMMDD-SS-XXXX)</label>
                  <input
                    id="ea-employee-ic"
                    type="text"
                    value={employeeIc}
                    onChange={(e) => setEmployeeIc(e.target.value)}
                    placeholder="YYMMDD-SS-XXXX"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="ea-employee-tax-no" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Tax File No.</label>
                  <input
                    id="ea-employee-tax-no"
                    type="text"
                    value={employeeTaxNo}
                    onChange={(e) => setEmployeeTaxNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Income */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Gross Remuneration (RM)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="ea-gross-salary" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Gross Salary</label>
                  <input
                    id="ea-gross-salary"
                    type="number"
                    step="0.01"
                    min="0"
                    value={grossSalary}
                    onChange={(e) => setGrossSalary(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="ea-allowances" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Allowances</label>
                  <input
                    id="ea-allowances"
                    type="number"
                    step="0.01"
                    min="0"
                    value={allowances}
                    onChange={(e) => setAllowances(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="ea-bonuses" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Bonuses</label>
                  <input
                    id="ea-bonuses"
                    type="number"
                    step="0.01"
                    min="0"
                    value={bonuses}
                    onChange={(e) => setBonuses(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="ea-bik" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Benefits in Kind</label>
                  <input
                    id="ea-bik"
                    type="number"
                    step="0.01"
                    min="0"
                    value={benefitsInKind}
                    onChange={(e) => setBenefitsInKind(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="ea-overtime" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Overtime</label>
                  <input
                    id="ea-overtime"
                    type="number"
                    step="0.01"
                    min="0"
                    value={overtime}
                    onChange={(e) => setOvertime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="ea-director-fees" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Director Fees</label>
                  <input
                    id="ea-director-fees"
                    type="number"
                    step="0.01"
                    min="0"
                    value={directorFees}
                    onChange={(e) => setDirectorFees(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="ea-commission" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Commission</label>
                  <input
                    id="ea-commission"
                    type="number"
                    step="0.01"
                    min="0"
                    value={commission}
                    onChange={(e) => setCommission(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Statutory deductions */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Statutory Deductions (RM)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="ea-epf-employee" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">EPF (Employee)</label>
                  <input
                    id="ea-epf-employee"
                    type="number"
                    step="0.01"
                    min="0"
                    value={epfEmployee}
                    onChange={(e) => setEpfEmployee(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="ea-epf-employer" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">EPF (Employer)</label>
                  <input
                    id="ea-epf-employer"
                    type="number"
                    step="0.01"
                    min="0"
                    value={epfEmployer}
                    onChange={(e) => setEpfEmployer(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="ea-socso" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">SOCSO</label>
                  <input
                    id="ea-socso"
                    type="number"
                    step="0.01"
                    min="0"
                    value={socso}
                    onChange={(e) => setSocso(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="ea-eis" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">EIS</label>
                  <input
                    id="ea-eis"
                    type="number"
                    step="0.01"
                    min="0"
                    value={eis}
                    onChange={(e) => setEis(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="ea-pcb" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">PCB / MTD</label>
                  <input
                    id="ea-pcb"
                    type="number"
                    step="0.01"
                    min="0"
                    value={pcb}
                    onChange={(e) => setPcb(e.target.value)}
                    placeholder="Monthly Tax Deduction"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="ea-notes" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Notes</label>
              <textarea
                id="ea-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            {submitError && (
              <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving…' : editEAForm ? 'Update' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

AddEAFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  editEAForm: PropTypes.object,
  taxYear: PropTypes.number.isRequired,
};

export default AddEAFormModal;
