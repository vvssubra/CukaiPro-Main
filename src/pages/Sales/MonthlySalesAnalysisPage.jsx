import { useState, useMemo, useCallback } from 'react';
import { useQuotations } from '../../hooks/useQuotations';
import { useInvoices } from '../../hooks/useInvoices';
import { useCreditNotes } from '../../hooks/useCreditNotes';
import { useContacts } from '../../hooks/useContacts';
import { formatCurrency } from '../../utils/validators';
import Loading from '../../components/Common/Loading';

/** Normalize date (DD/MM/YYYY or ISO) to YYYY-MM-DD for comparison. */
function toComparableDateStr(d) {
  if (!d) return '';
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d)) return d.slice(0, 10);
  if (typeof d === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
    const [day, month, year] = d.split('/').map(Number);
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const GROUP_BY_OPTIONS = [
  { value: 'customer', label: 'Customer' },
  { value: 'sales_agent', label: 'Sales Agent' },
  { value: 'sales_location', label: 'Sales Location' },
];

function MonthlySalesAnalysisPage() {
  const now = new Date();
  const defaultFrom = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}-01`;
  const defaultTo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(defaultTo);
  const [groupBy, setGroupBy] = useState('customer');
  const [includeCN, setIncludeCN] = useState(true);
  const [inquiryRun, setInquiryRun] = useState(false);

  const { quotations, loading: loadingQ } = useQuotations({});
  const { invoices, loading: loadingI } = useInvoices();
  const { creditNotes, loading: loadingCN } = useCreditNotes({});
  const { contacts } = useContacts({});

  const contactMap = useMemo(() => {
    const m = {};
    (contacts || []).forEach((c) => { m[c.id] = c; });
    return m;
  }, [contacts]);

  const runInquiry = useCallback(() => setInquiryRun(true), []);

  const handlePrint = useCallback(() => {
    setInquiryRun(true);
    setTimeout(() => window.print(), 100);
  }, []);

  const tableRows = useMemo(() => {
    if (!inquiryRun) return [];

    const from = fromDate || '';
    const to = toDate || '';

    const inRange = (dateStr) => {
      if (!dateStr) return false;
      if (from && dateStr < from) return false;
      if (to && dateStr > to) return false;
      return true;
    };

    const buckets = {};

    const add = (key, amount) => {
      if (key == null || key === '') key = 'N/A';
      if (!buckets[key]) buckets[key] = 0;
      buckets[key] += Number(amount) || 0;
    };

    (quotations || []).forEach((q) => {
      const dateStr = toComparableDateStr(q.quotation_date);
      if (!inRange(dateStr)) return;
      const total = Number(q.total) || 0;
      if (groupBy === 'customer') {
        const name = q.contact_id ? (contactMap[q.contact_id]?.name || 'Unknown') : 'No customer';
        add(name, total);
      } else if (groupBy === 'sales_agent') {
        const agent = q.contact_id ? (contactMap[q.contact_id]?.agent || 'N/A') : 'N/A';
        add(agent, total);
      } else {
        add('All', total);
      }
    });

    (invoices || []).forEach((inv) => {
      const dateStr = toComparableDateStr(inv.invoice_date);
      if (!inRange(dateStr)) return;
      const amount = Number(inv.amount) || 0;
      if (groupBy === 'customer') {
        const name = inv.contact_id
          ? (contactMap[inv.contact_id]?.name || 'Unknown')
          : (inv.client_name || 'No customer');
        add(name, amount);
      } else if (groupBy === 'sales_agent') {
        const agent = inv.contact_id ? (contactMap[inv.contact_id]?.agent || 'N/A') : 'N/A';
        add(agent, amount);
      } else {
        add('All', amount);
      }
    });

    if (includeCN) {
      (creditNotes || []).forEach((cn) => {
        const dateStr = toComparableDateStr(cn.credit_note_date);
        if (!inRange(dateStr)) return;
        const total = Number(cn.total) || 0;
        if (groupBy === 'customer') {
          const name = cn.contact_id ? (contactMap[cn.contact_id]?.name || 'Unknown') : 'No customer';
          add(name, -total);
        } else if (groupBy === 'sales_agent') {
          const agent = cn.contact_id ? (contactMap[cn.contact_id]?.agent || 'N/A') : 'N/A';
          add(agent, -total);
        } else {
          add('All', -total);
        }
      });
    }

    return Object.entries(buckets)
      .map(([label, total]) => ({ label, total }))
      .sort((a, b) => (b.total - a.total));
  }, [inquiryRun, fromDate, toDate, groupBy, includeCN, quotations, invoices, creditNotes, contactMap]);

  const loading = loadingQ || loadingI || loadingCN;
  const groupLabel = GROUP_BY_OPTIONS.find((o) => o.value === groupBy)?.label || 'Group';

  return (
    <div className="container-fluid flex-grow-1 container-p-y">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
          Sales / Reports / Monthly Sales Analysis
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">Performance analysis of your sales.</p>
      </div>

      <div className="mb-6 flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Group By</label>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2"
          >
            {GROUP_BY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeCN}
            onChange={(e) => setIncludeCN(e.target.checked)}
            className="rounded border-slate-300 dark:border-slate-600"
          />
          <span className="text-sm text-slate-700 dark:text-slate-300">Include Credit Notes</span>
        </label>
        <div className="flex gap-2 ml-auto">
          <button
            type="button"
            onClick={runInquiry}
            className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90"
          >
            Inquiry
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Print Report
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loading size="lg" text="Loading..." />
        </div>
      )}

      {!loading && inquiryRun && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 overflow-hidden print:border-0 print:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <th className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{groupLabel}</th>
                  <th className="px-4 py-3 font-semibold text-slate-900 dark:text-white text-right">Total Sales (RM)</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                      No data for the selected period.
                    </td>
                  </tr>
                ) : (
                  tableRows.map((row) => (
                    <tr key={row.label} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="px-4 py-3 text-slate-900 dark:text-white">{row.label}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-white">
                        {formatCurrency(row.total)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && !inquiryRun && (
        <p className="text-slate-500 dark:text-slate-400 text-sm">Set filters and click Inquiry to view the report.</p>
      )}
    </div>
  );
}

export default MonthlySalesAnalysisPage;
