import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAccountBalances } from '../../hooks/useAccountBalances';
import { formatCurrency } from '../../utils/validators';
import { PNL_ORDER, PNL_GROUP_LABELS } from '../../utils/accountingHelpers';
import Loading from '../../components/Common/Loading';

function toDateStr(d) {
  if (!d) return '';
  if (typeof d === 'string' && d.length >= 10) return d.slice(0, 10);
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function ProfitLossPage() {
  const [dateType, setDateType] = useState('monthly');
  const now = new Date();
  const [fromDate, setFromDate] = useState(toDateStr(new Date(now.getFullYear(), now.getMonth(), 1)));
  const [toDate, setToDate] = useState(toDateStr(now));
  const asOfDate = toDate;
  const { accounts, balances, loading, error } = useAccountBalances(asOfDate);

  const grouped = useMemo(() => {
    const byType = {};
    PNL_ORDER.forEach((type) => {
      byType[type] = (accounts || [])
        .filter((a) => a.type === type)
        .map((a) => ({ ...a, balance: balances[a.id] ?? 0 }))
        .filter((a) => Math.abs(a.balance) > 0.001);
    });
    return byType;
  }, [accounts, balances]);

  const totalRevenue = useMemo(
    () => (accounts || []).filter((a) => a.type === 'revenue').reduce((s, a) => s + (balances[a.id] ?? 0), 0),
    [accounts, balances]
  );
  const totalExpenses = useMemo(
    () => (accounts || []).filter((a) => a.type === 'expense').reduce((s, a) => s + (balances[a.id] ?? 0), 0),
    [accounts, balances]
  );
  const netProfit = totalRevenue - totalExpenses;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link to="/dashboard/reports" className="text-sm text-primary hover:underline mb-1 inline-block">Reports</Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profit and Loss Statement</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Income and expenses for the period</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Date type</label>
          <select
            value={dateType}
            onChange={(e) => setDateType(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-custom text-slate-900 dark:text-white"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-custom text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-custom text-slate-900 dark:text-white"
          />
        </div>
        <div className="flex items-end gap-2">
          <button type="button" className="px-4 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90">
            Generate Report
          </button>
          <button type="button" className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            Download PDF
          </button>
          <button type="button" className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            Print Report
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <Loading size="lg" text="Loading..." />
        </div>
      )}

      {!loading && (
        <div className="bg-white dark:bg-slate-custom rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Profit and Loss</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{fromDate} to {toDate}</p>
          </div>
          <div className="p-6 space-y-6">
            {PNL_ORDER.map((type) => {
              const rows = grouped[type] || [];
              const label = PNL_GROUP_LABELS[type] || type;
              const typeTotal = rows.reduce((s, r) => s + r.balance, 0);
              return (
                <div key={type}>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">{label}</h3>
                  <table className="w-full">
                    <tbody>
                      {rows.map((acc) => (
                        <tr key={acc.id} className="border-b border-slate-100 dark:border-slate-700/50">
                          <td className="py-2 pl-4 text-slate-900 dark:text-white">{acc.name}</td>
                          <td className="py-2 text-right font-mono text-sm">{formatCurrency(acc.balance)}</td>
                        </tr>
                      ))}
                      {rows.length > 0 && (
                        <tr className="font-semibold bg-slate-50 dark:bg-slate-800/50">
                          <td className="py-2 pl-4">Total {label}</td>
                          <td className="py-2 text-right font-mono">{formatCurrency(typeTotal)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              );
            })}
            <div className="pt-4 border-t-2 border-slate-200 dark:border-slate-700">
              <p className={`text-lg font-bold ${netProfit >= 0 ? 'text-slate-900 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>
                Net Profit / Loss: {formatCurrency(netProfit)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfitLossPage;
