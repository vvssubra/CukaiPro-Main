import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { useEAForms, computeEASummary } from '../../hooks/useEAForms';
import { useOrganization } from '../../context/OrganizationContext';
import { useSubscription } from '../../hooks/useSubscription';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/validators';
import { generateEAFormPDF } from '../../utils/eaFormPdf';
import Loading from '../../components/Common/Loading';
import AddEAFormModal from './AddEAFormModal';

const currentYearForList = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYearForList - i);

function EAFormPage() {
  const [taxYear, setTaxYear] = useState(currentYearForList);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editEAForm, setEditEAForm] = useState(null);

  const { currentOrganization } = useOrganization();
  const { canUseEAForms } = useSubscription();
  const toast = useToast();
  const { eaForms, loading, error, fetchEAForms, addEAForm, updateEAForm, deleteEAForm } = useEAForms();

  useEffect(() => {
    fetchEAForms(taxYear);
  }, [taxYear, fetchEAForms]);

  const summary = useMemo(() => {
    let totalRemuneration = 0;
    let totalNetEmploymentIncome = 0;
    let totalPcb = 0;
    eaForms.forEach((ea) => {
      const { totalRemuneration: tr, netEmploymentIncome } = computeEASummary(ea);
      totalRemuneration += tr;
      totalNetEmploymentIncome += netEmploymentIncome;
      totalPcb += Number(ea.pcb) || 0;
    });
    return {
      employeeCount: eaForms.length,
      totalRemuneration,
      totalNetEmploymentIncome,
      totalPcb,
    };
  }, [eaForms]);

  const handleSave = useCallback(
    async (formData) => {
      const result = editEAForm
        ? await updateEAForm(editEAForm.id, formData)
        : await addEAForm(formData);
      if (result.success) {
        setAddModalOpen(false);
        setEditEAForm(null);
        toast.success(editEAForm ? 'EA form updated.' : 'EA form added.');
      } else {
        toast.error(result.error || 'Save failed.');
      }
      return result;
    },
    [editEAForm, addEAForm, updateEAForm, toast]
  );

  const handleDelete = useCallback(
    async (ea) => {
      if (!window.confirm(`Remove EA form for ${ea.employee_name}?`)) return;
      const result = await deleteEAForm(ea.id);
      if (result.success) toast.success('EA form removed.');
      else toast.error(result.error || 'Delete failed.');
    },
    [deleteEAForm, toast]
  );

  if (!canUseEAForms) {
    return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen flex">
        <Sidebar />
        <main className="ml-64 flex-1 p-8">
          <div className="max-w-2xl mx-auto py-16 text-center">
            <span className="material-icons text-6xl text-primary/60 mb-4 block">workspace_premium</span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">EA Forms require Pro or Enterprise</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Upgrade your plan to manage employee remuneration and generate EA forms for LHDN e-Filing.
            </p>
            <Link
              to="/dashboard/settings?tab=billing"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90"
            >
              Upgrade plan
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">EA Forms (Employment Information)</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Manage employee remuneration data for LHDN Borang EA. Export for e-Filing.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={taxYear}
                onChange={(e) => setTaxYear(Number(e.target.value))}
                className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-custom text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => { setEditEAForm(null); setAddModalOpen(true); }}
                className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary/90 font-medium text-sm"
              >
                <span className="material-icons text-[20px]">add</span>
                Add EA Form
              </button>
              <button
                type="button"
                onClick={() => generateEAFormPDF(eaForms, taxYear)}
                disabled={eaForms.length === 0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-custom text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-icons text-[20px]">download</span>
                Download PDF
              </button>
              <Link
                to="/dashboard/reports"
                className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-custom text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800/30"
              >
                Export from Reports
              </Link>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-custom rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-icons">people</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Employees</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{summary.employeeCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-custom rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <span className="material-icons">payments</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Total Remuneration</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(summary.totalRemuneration)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-custom rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <span className="material-icons">account_balance</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Net Employment Income</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(summary.totalNetEmploymentIncome)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-custom rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <span className="material-icons">receipt_long</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">PCB Remitted</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(summary.totalPcb)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* EA forms table */}
          <div className="bg-white dark:bg-slate-custom rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto">
            {loading ? (
              <div className="p-12"><Loading size="md" text="Loading EA forms..." /></div>
            ) : eaForms.length === 0 ? (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                <span className="material-icons text-5xl mb-4 block opacity-50">description</span>
                <p className="mb-2">No EA forms for {taxYear}.</p>
                <p className="text-sm">Add employee remuneration data to generate EA forms for LHDN e-Filing.</p>
                <button
                  type="button"
                  onClick={() => setAddModalOpen(true)}
                  className="mt-4 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90"
                >
                  Add EA Form
                </button>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase">
                  <tr>
                    <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">Employee</th>
                    <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">IC / Tax No</th>
                    <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 text-right">Gross Salary</th>
                    <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 text-right">Allowances</th>
                    <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 text-right">Bonuses</th>
                    <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 text-right">EPF</th>
                    <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 text-right">PCB</th>
                    <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 text-right">Net Income</th>
                    <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {eaForms.map((ea) => {
                    const { totalRemuneration, netEmploymentIncome } = computeEASummary(ea);
                    const epfEmp = Number(ea.epf_employee) || 0;
                    const pcbVal = Number(ea.pcb) || 0;
                    return (
                      <tr key={ea.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{ea.employee_name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{ea.employee_ic || ea.employee_tax_no || '—'}</td>
                        <td className="px-6 py-4 text-sm text-right">{formatCurrency(Number(ea.gross_salary) || 0)}</td>
                        <td className="px-6 py-4 text-sm text-right">{formatCurrency(Number(ea.allowances) || 0)}</td>
                        <td className="px-6 py-4 text-sm text-right">{formatCurrency(Number(ea.bonuses) || 0)}</td>
                        <td className="px-6 py-4 text-sm text-right">{formatCurrency(epfEmp)}</td>
                        <td className="px-6 py-4 text-sm text-right">{formatCurrency(pcbVal)}</td>
                        <td className="px-6 py-4 text-sm text-right font-medium">{formatCurrency(netEmploymentIncome)}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => { setEditEAForm(ea); setAddModalOpen(true); }}
                            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                            aria-label="Edit"
                          >
                            <span className="material-icons text-[20px]">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(ea)}
                            className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600"
                            aria-label="Delete"
                          >
                            <span className="material-icons text-[20px]">delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <AddEAFormModal
          isOpen={addModalOpen}
          onClose={() => { setAddModalOpen(false); setEditEAForm(null); }}
          onSave={handleSave}
          editEAForm={editEAForm}
          taxYear={taxYear}
        />
      </main>
    </div>
  );
}

export default EAFormPage;
