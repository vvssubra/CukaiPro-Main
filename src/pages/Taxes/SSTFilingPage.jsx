import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { useInvoices } from '../../hooks/useInvoices';
import { useSstFilings } from '../../hooks/useSstFilings';
import { useOrganization } from '../../context/OrganizationContext';
import { formatCurrency, formatDate } from '../../utils/validators';
import { calculateSSTPayable } from '../../hooks/useTaxCalculation';
import { getPeriodsBack, daysUntilDue } from '../../utils/sstPeriods';
import Loading from '../../components/Common/Loading';

/** SST at 6% on taxable value. Filter invoices by period (YYYY-MM-DD strings). */
function calculateSstForPeriod(invoices, periodStart, periodEnd) {
  const start = new Date(periodStart);
  const end = new Date(periodEnd);
  const inPeriod = (invoices || []).filter((inv) => {
    const d = inv.invoice_date;
    if (!d) return false;
    let date;
    if (typeof d === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
      const [day, month, year] = d.split('/').map(Number);
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(d);
    }
    return date >= start && date <= end;
  });
  return calculateSSTPayable(inPeriod);
}

function getStatusBadge(status) {
  const s = (status || 'draft').toLowerCase();
  if (s === 'draft') return { class: 'bg-slate-500/10 text-slate-500 dark:text-slate-400', label: 'Draft' };
  if (s === 'ready') return { class: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', label: 'Ready' };
  if (s === 'submitted') return { class: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', label: 'Submitted' };
  return { class: 'bg-slate-500/10 text-slate-500', label: status || 'Draft' };
}

function SSTFilingPage() {
  const { currentOrganization } = useOrganization();
  const { invoices } = useInvoices();
  const {
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
  } = useSstFilings();

  const [actionLoading, setActionLoading] = useState(null);

  const now = new Date();
  const refYear = now.getFullYear();
  const refMonth = now.getMonth() + 1;
  const periodsList = useMemo(
    () => getPeriodsBack(6, refYear, refMonth),
    [refYear, refMonth]
  );

  const filingByPeriod = useMemo(() => {
    const map = {};
    (filings || []).forEach((f) => {
      map[f.period_start] = f;
    });
    return map;
  }, [filings]);

  const handleCreatePeriod = useCallback(
    async (year, month) => {
      setActionLoading(`create-${year}-${month}`);
      const sstAmt = calculateSstForPeriod(
        invoices,
        `${year}-${String(month).padStart(2, '0')}-01`,
        new Date(year, month, 0).toISOString().slice(0, 10)
      );
      const result = await createOrGetFiling(year, month, sstAmt);
      setActionLoading(null);
      if (!result.success && result.error) {
        alert(result.error);
      }
    },
    [createOrGetFiling, invoices]
  );

  const handleMarkReady = useCallback(
    async (filing) => {
      setActionLoading(filing.id);
      const result = await updateFilingStatus(filing.id, 'ready');
      setActionLoading(null);
      if (!result.success && result.error) alert(result.error);
    },
    [updateFilingStatus]
  );

  const handleSubmit = useCallback(
    async (filing) => {
      if (!confirm('Mark this period as submitted? This indicates you have filed SST-02 with LHDN.')) return;
      setActionLoading(filing.id);
      const result = await updateFilingStatus(filing.id, 'submitted');
      setActionLoading(null);
      if (!result.success && result.error) alert(result.error);
    },
    [updateFilingStatus]
  );

  const handleRefreshAmount = useCallback(
    async (filing) => {
      const [y, m] = filing.period_start.split('-').map(Number);
      const end = new Date(y, m, 0).toISOString().slice(0, 10);
      const amt = calculateSstForPeriod(invoices, filing.period_start, end);
      setActionLoading(`amt-${filing.id}`);
      const result = await updateFilingAmount(filing.id, amt);
      setActionLoading(null);
      if (!result.success && result.error) alert(result.error);
    },
    [updateFilingAmount, invoices]
  );

  const handleExportSST02 = useCallback(
    (filing) => {
      const [y, m] = filing.period_start.split('-').map(Number);
      const end = new Date(y, m, 0).toISOString().slice(0, 10);
      const sstAmt = calculateSstForPeriod(invoices, filing.period_start, end);
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ];
      const periodLabel = `${monthNames[m - 1]} ${y}`;
      const dueStr = filing.due_date
        ? formatDate(new Date(filing.due_date))
        : '—';

      const periodInvoices = invoices.filter((inv) => {
        const d = inv.invoice_date;
        if (!d) return false;
        let date;
        if (typeof d === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
          const [day, mon, yr] = d.split('/').map(Number);
          date = new Date(yr, mon - 1, day);
        } else {
          date = new Date(d);
        }
        const start = new Date(filing.period_start);
        const endDate = new Date(end);
        return date >= start && date <= endDate;
      });

      const lines = periodInvoices.map((inv) => {
        const dateStr = inv.invoice_date
          ? (typeof inv.invoice_date === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(inv.invoice_date)
            ? inv.invoice_date
            : formatDate(inv.invoice_date))
          : '—';
        const amt = Number(inv.amount) || 0;
        return `  ${inv.client_name || '—'} | ${dateStr} | RM ${amt.toFixed(2)}`;
      }).join('\n');

      const content = `SST-02 SUMMARY - TAXABLE PERIOD
==============================

Organization: ${currentOrganization?.business_name || '—'}
Period: ${periodLabel}
Period Start: ${formatDate(new Date(filing.period_start))}
Period End: ${formatDate(new Date(end))}
Due Date: ${dueStr}
Status: ${filing.status || 'draft'}

SUMMARY
-------
Total SST Payable: ${formatCurrency(sstAmt)}
Total Invoices: ${periodInvoices.length}

INVOICE DETAILS (Period)
------------------------
${lines || '(No invoices)'}

---
Generated by CukaiPro. For manual entry into LHDN SST-02 e-Filing.
`;

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sst-02-${y}-${String(m).padStart(2, '0')}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [invoices, currentOrganization]
  );

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">SST Filing</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Manage SST-02 taxable period filings and deadlines
              </p>
            </div>
            <Link
              to="/dashboard/reports"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-custom text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800/30"
            >
              <span className="material-icons text-lg">analytics</span>
              View Reports
            </Link>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Next filing deadline card */}
          <div className="mb-8 p-6 rounded-xl bg-primary text-white border border-white/10 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white/90">Next Filing Due</h2>
                <p className="text-3xl font-bold mt-1">
                  {nextDueDate ? formatDate(nextDueDate) : nextFilingPeriod.dueDateStr}
                </p>
                <p className="text-white/70 text-sm mt-2">
                  SST-02 due by 15th of the following month for taxable period
                </p>
                {daysUntilNextDue != null && (
                  <p
                    className={`text-sm mt-2 font-medium ${
                      daysUntilNextDue < 0
                        ? 'text-red-200'
                        : daysUntilNextDue <= 7
                        ? 'text-amber-200'
                        : 'text-white/80'
                    }`}
                  >
                    {daysUntilNextDue < 0
                      ? `${Math.abs(daysUntilNextDue)} days overdue`
                      : daysUntilNextDue === 0
                      ? 'Due today'
                      : `${daysUntilNextDue} days left`}
                  </p>
                )}
              </div>
              <Link
                to="/dashboard/reports"
                className="inline-flex items-center gap-2 px-5 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-slate-100 transition-colors"
              >
                <span className="material-icons">download</span>
                Download SST Report
              </Link>
            </div>
          </div>

          {/* Filing periods */}
          <div className="bg-white dark:bg-slate-custom rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Filing Periods</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Track filing status for each taxable period (SST-02)
              </p>
            </div>

            {loading ? (
              <div className="p-12 flex justify-center">
                <Loading size="lg" text="Loading filings..." />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                      <th className="py-3 px-4 font-semibold">Period</th>
                      <th className="py-3 px-4 font-semibold">Start</th>
                      <th className="py-3 px-4 font-semibold">End</th>
                      <th className="py-3 px-4 font-semibold">Due Date</th>
                      <th className="py-3 px-4 font-semibold text-right">SST Amount</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {periodsList.map((p) => {
                      const filing = filingByPeriod[p.periodStart];
                      const sstAmt = filing
                        ? Number(filing.total_amount) || 0
                        : calculateSstForPeriod(invoices, p.periodStart, p.periodEnd);
                      const days = daysUntilDue(p.dueDate);
                      const badge = filing ? getStatusBadge(filing.status) : getStatusBadge('draft');

                      return (
                        <tr
                          key={p.periodStart}
                          className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                        >
                          <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                            {p.label}
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                            {formatDate(new Date(p.periodStart))}
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                            {formatDate(new Date(p.periodEnd))}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={
                                days < 0
                                  ? 'text-red-600 dark:text-red-400 font-medium'
                                  : days <= 7
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-slate-600 dark:text-slate-400'
                              }
                            >
                              {p.dueDateStr}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-slate-900 dark:text-white">
                            {formatCurrency(sstAmt)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.class}`}
                            >
                              {badge.label}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-2">
                              {!filing ? (
                                <button
                                  type="button"
                                  onClick={() => handleCreatePeriod(p.year, p.month)}
                                  disabled={actionLoading === `create-${p.year}-${p.month}`}
                                  className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 disabled:opacity-50"
                                >
                                  {actionLoading === `create-${p.year}-${p.month}` ? 'Creating...' : 'Create'}
                                </button>
                              ) : (
                                <>
                                  {filing.status === 'draft' && (
                                    <button
                                      type="button"
                                      onClick={() => handleMarkReady(filing)}
                                      disabled={actionLoading === filing.id}
                                      className="px-3 py-1.5 rounded-lg border border-amber-500/50 text-amber-600 dark:text-amber-400 text-xs font-medium hover:bg-amber-500/10 disabled:opacity-50"
                                    >
                                      Mark Ready
                                    </button>
                                  )}
                                  {['draft', 'ready'].includes(filing.status) && (
                                    <button
                                      type="button"
                                      onClick={() => handleSubmit(filing)}
                                      disabled={actionLoading === filing.id}
                                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-500 disabled:opacity-50"
                                    >
                                      Submit
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleRefreshAmount(filing)}
                                    disabled={actionLoading === `amt-${filing.id}`}
                                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
                                  >
                                    Refresh
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleExportSST02(filing)}
                                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                                  >
                                    Export SST-02
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Tax calendar */}
          <div className="mt-8 p-6 rounded-xl bg-white dark:bg-slate-custom border border-slate-200 dark:border-slate-700 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">SST Calendar</h2>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                SST-02 due: 15th of each month (for previous month)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Taxable period: 1st to last day of month
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                File via LHDN SST e-Filing portal
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SSTFilingPage;
