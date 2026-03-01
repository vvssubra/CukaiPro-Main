import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useInvoices } from '../../hooks/useInvoices';
import { useSstFilings } from '../../hooks/useSstFilings';
import { formatCurrency, formatDate } from '../../utils/validators';
import Loading from '../../components/Common/Loading';

function toDateStr(d) {
  if (!d) return '';
  if (typeof d === 'string' && d.length >= 10) return d.slice(0, 10);
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function parseInvoiceDate(inv) {
  const d = inv.invoice_date;
  if (!d) return null;
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const date = new Date(d);
  return toDateStr(date);
}

function SSTProcessorPage() {
  const now = new Date();
  const [dateFrom, setDateFrom] = useState(toDateStr(new Date(now.getFullYear(), now.getMonth(), 1)));
  const [dateTo, setDateTo] = useState(toDateStr(now));
  const [activeTab, setActiveTab] = useState('sales');

  const { invoices, loading } = useInvoices();
  const { filings: _filings } = useSstFilings();

  const salesRows = useMemo(() => {
    return (invoices || [])
      .filter((inv) => {
        const dateStr = parseInvoiceDate(inv);
        if (!dateStr) return false;
        return dateStr >= dateFrom && dateStr <= dateTo && (Number(inv.sst_rate) || 0) > 0;
      })
      .map((inv) => {
        const amount = Number(inv.amount) || 0;
        const rate = Number(inv.sst_rate) || 0;
        const taxAmt = amount * rate;
        return {
          id: inv.id,
          date: parseInvoiceDate(inv),
          ref_no: `INV-${String(inv.id).slice(0, 8)}`,
          customer: inv.client_name || '—',
          tax_type: `SST ${(rate * 100).toFixed(0)}%`,
          sales_amount: amount,
          tax_amount: taxAmt,
        };
      })
      .sort((a, b) => (a.date || '').localeCompare(b.date || '', undefined, { numeric: true }));
  }, [invoices, dateFrom, dateTo]);

  const salesTotals = useMemo(() => {
    return salesRows.reduce(
      (acc, r) => ({ sales: acc.sales + (r.sales_amount || 0), tax: acc.tax + (r.tax_amount || 0) }),
      { sales: 0, tax: 0 }
    );
  }, [salesRows]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link to="/dashboard/reports" className="text-sm text-primary hover:underline mb-1 inline-block">Reports</Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">SST Processor</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">SST Sales, Purchase and Return</p>
        </div>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
        {['sales', 'purchase', 'return'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium text-sm capitalize border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            SST {tab}
          </button>
        ))}
      </div>

      {activeTab === 'sales' && (
        <>
          <div className="mb-6 flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">From date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-custom text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">To date</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-custom text-slate-900 dark:text-white"
              />
            </div>
            <button type="button" className="px-4 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90">
              Generate SST Return
            </button>
          </div>

          {loading && (
            <div className="flex justify-center py-12">
              <Loading size="lg" text="Loading..." />
            </div>
          )}

          {!loading && (
            <div className="bg-white dark:bg-slate-custom rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase">
                    <tr>
                      <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700">Date</th>
                      <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700">Ref No</th>
                      <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700">Customer</th>
                      <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700">Tax Type</th>
                      <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700 text-right">Sales Amount (RM)</th>
                      <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700 text-right">Tax Amount (RM)</th>
                      <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {salesRows.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                          No SST sales in the selected period.
                        </td>
                      </tr>
                    ) : (
                      salesRows.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                          <td className="px-6 py-3 text-sm">{r.date ? formatDate(r.date) : '—'}</td>
                          <td className="px-6 py-3 text-sm font-mono">{r.ref_no}</td>
                          <td className="px-6 py-3 text-sm">{r.customer}</td>
                          <td className="px-6 py-3 text-sm">{r.tax_type}</td>
                          <td className="px-6 py-3 text-sm text-right font-mono">{formatCurrency(r.sales_amount)}</td>
                          <td className="px-6 py-3 text-sm text-right font-mono">{formatCurrency(r.tax_amount)}</td>
                          <td className="px-6 py-3">
                            <button type="button" className="text-primary hover:underline text-sm">View</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {salesRows.length > 0 && (
                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                  <span className="font-semibold">
                    Total Sales Amount (RM): {formatCurrency(salesTotals.sales)} | Total Tax Amount (RM): {formatCurrency(salesTotals.tax)}
                  </span>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeTab === 'purchase' && (
        <div className="bg-white dark:bg-slate-custom rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center text-slate-500 dark:text-slate-400">
          SST Purchase: add purchase/bill transactions with SST to see them here.
        </div>
      )}

      {activeTab === 'return' && (
        <div className="bg-white dark:bg-slate-custom rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">SST Return periods</p>
          <Link to="/dashboard/sst-filing" className="text-primary hover:underline font-medium">
            Go to SST Filing
          </Link>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Manage and submit SST returns from the SST Filing page.</p>
        </div>
      )}
    </div>
  );
}

export default SSTProcessorPage;
