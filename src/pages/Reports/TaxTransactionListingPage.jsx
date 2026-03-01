import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useInvoices } from '../../hooks/useInvoices';
import { formatCurrency, formatDate } from '../../utils/validators';
import Loading from '../../components/Common/Loading';

const TAX_TYPES = [
  { value: '', label: 'All' },
  { value: 'SST', label: 'SST' },
];

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
  if (typeof d === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
    const [day, month, year] = d.split('/').map(Number);
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  const date = new Date(d);
  return toDateStr(date);
}

function TaxTransactionListingPage() {
  const now = new Date();
  const [dateFrom, setDateFrom] = useState(toDateStr(new Date(now.getFullYear(), now.getMonth(), 1)));
  const [dateTo, setDateTo] = useState(toDateStr(now));
  const [taxType, setTaxType] = useState('');

  const { invoices, loading, error } = useInvoices();

  const rows = useMemo(() => {
    return (invoices || [])
      .filter((inv) => {
        const dateStr = parseInvoiceDate(inv);
        if (!dateStr) return false;
        if (dateFrom && dateStr < dateFrom) return false;
        if (dateTo && dateStr > dateTo) return false;
        if (taxType === 'SST' && !(Number(inv.sst_rate) > 0)) return false;
        return true;
      })
      .map((inv) => {
        const amount = Number(inv.amount) || 0;
        const rate = Number(inv.sst_rate) || 0;
        const taxAmt = amount * rate;
        const total = amount + taxAmt;
        return {
          id: inv.id,
          date: parseInvoiceDate(inv),
          transaction_type: 'Sales Invoice',
          ref_no: `INV-${String(inv.id).slice(0, 8)}`,
          contact: inv.client_name || '—',
          tax_type: rate > 0 ? `SST ${(rate * 100).toFixed(0)}%` : '—',
          tax_rate: rate,
          taxable_amount: amount,
          tax_amount: taxAmt,
          total,
        };
      })
      .sort((a, b) => (a.date || '').localeCompare(b.date || '', undefined, { numeric: true }));
  }, [invoices, dateFrom, dateTo, taxType]);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => ({
        taxable: acc.taxable + (r.taxable_amount || 0),
        tax: acc.tax + (r.tax_amount || 0),
        total: acc.total + (r.total || 0),
      }),
      { taxable: 0, tax: 0, total: 0 }
    );
  }, [rows]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link to="/dashboard/reports" className="text-sm text-primary hover:underline mb-1 inline-block">Reports</Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tax Transaction Listing</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Filter tax transactions by period and type</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Date from</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-custom text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Date to</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-custom text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Tax type</label>
          <select
            value={taxType}
            onChange={(e) => setTaxType(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-custom text-slate-900 dark:text-white"
          >
            {TAX_TYPES.map((t) => (
              <option key={t.value || 'all'} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <button type="button" className="px-4 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90">
          Search
        </button>
        <button type="button" className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
          Print Preview
        </button>
        <button type="button" className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
          Excel
        </button>
        <button type="button" className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
          PDF
        </button>
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
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase">
                <tr>
                  <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700">Date</th>
                  <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700">Transaction Type</th>
                  <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700">Ref No</th>
                  <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700">Contact</th>
                  <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700">Tax Type</th>
                  <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700 text-right">Taxable Amount (RM)</th>
                  <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700 text-right">Tax Amount (RM)</th>
                  <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700 text-right">Total (RM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                      No tax transactions for the selected filters.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="px-6 py-3 text-sm">{r.date ? formatDate(r.date) : '—'}</td>
                      <td className="px-6 py-3 text-sm">{r.transaction_type}</td>
                      <td className="px-6 py-3 text-sm font-mono">{r.ref_no}</td>
                      <td className="px-6 py-3 text-sm">{r.contact}</td>
                      <td className="px-6 py-3 text-sm">{r.tax_type}</td>
                      <td className="px-6 py-3 text-sm text-right font-mono">{formatCurrency(r.taxable_amount)}</td>
                      <td className="px-6 py-3 text-sm text-right font-mono">{formatCurrency(r.tax_amount)}</td>
                      <td className="px-6 py-3 text-sm text-right font-mono">{formatCurrency(r.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {rows.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 font-semibold flex justify-end gap-8">
              <span>Total Taxable: {formatCurrency(totals.taxable)}</span>
              <span>Total Tax: {formatCurrency(totals.tax)}</span>
              <span>Total: {formatCurrency(totals.total)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TaxTransactionListingPage;
