import { useState, useMemo, useCallback } from 'react';
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

function SalesProfitLossPage() {
  const now = new Date();
  const defaultFrom = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const defaultTo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(defaultTo);
  const [customerId, setCustomerId] = useState('');
  const [salesAgentFilter, setSalesAgentFilter] = useState('');
  const [includeInvoice, setIncludeInvoice] = useState(true);
  const [includeCreditNote, setIncludeCreditNote] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [inquiryRun, setInquiryRun] = useState(false);

  const { invoices, loading: loadingI } = useInvoices();
  const { creditNotes, loading: loadingCN } = useCreditNotes({});
  const { contacts } = useContacts({ type: 'customer' });

  const runInquiry = useCallback(() => setInquiryRun(true), []);

  const handlePrint = useCallback(() => {
    setInquiryRun(true);
    setTimeout(() => window.print(), 100);
  }, []);

  const contactMap = useMemo(() => {
    const m = {};
    (contacts || []).forEach((c) => { m[c.id] = c; });
    return m;
  }, [contacts]);

  const agents = useMemo(() => {
    const set = new Set();
    (contacts || []).forEach((c) => {
      if (c.agent) set.add(c.agent);
    });
    return Array.from(set).sort();
  }, [contacts]);

  const { revenue, creditNoteTotal, netRevenue } = useMemo(() => {
    if (!inquiryRun) return { revenue: 0, creditNoteTotal: 0, netRevenue: 0 };

    const from = fromDate || '';
    const to = toDate || '';
    const inRange = (dateStr) => {
      if (!dateStr) return false;
      if (from && dateStr < from) return false;
      if (to && dateStr > to) return false;
      return true;
    };

    let rev = 0;
    (invoices || []).forEach((inv) => {
      if (!includeInvoice) return;
      if (statusFilter && (inv.status || '').toLowerCase() !== statusFilter.toLowerCase()) return;
      if (customerId && inv.contact_id !== customerId) return;
      if (salesAgentFilter && (contactMap[inv.contact_id]?.agent || '') !== salesAgentFilter) return;
      const dateStr = toComparableDateStr(inv.invoice_date);
      if (!inRange(dateStr)) return;
      rev += Number(inv.amount) || 0;
    });

    let cnTotal = 0;
    if (includeCreditNote) {
      (creditNotes || []).forEach((cn) => {
        if (statusFilter && (cn.status || '').toLowerCase() !== statusFilter.toLowerCase()) return;
        if (customerId && cn.contact_id !== customerId) return;
        if (salesAgentFilter && (contactMap[cn.contact_id]?.agent || '') !== salesAgentFilter) return;
        const dateStr = toComparableDateStr(cn.credit_note_date);
        if (!inRange(dateStr)) return;
        cnTotal += Number(cn.total) || 0;
      });
    }

    return {
      revenue: rev,
      creditNoteTotal: cnTotal,
      netRevenue: rev - cnTotal,
    };
  }, [inquiryRun, fromDate, toDate, customerId, salesAgentFilter, statusFilter, includeInvoice, includeCreditNote, invoices, creditNotes, contactMap]);

  const loading = loadingI || loadingCN;

  return (
    <div className="container-fluid flex-grow-1 container-p-y">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
          Sales / Reports / Profit & Loss
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">Profit, margin, and markup of invoices.</p>
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
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Customer</label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 min-w-[160px]"
          >
            <option value="">All</option>
            {(contacts || []).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Sales Agent</label>
          <select
            value={salesAgentFilter}
            onChange={(e) => setSalesAgentFilter(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 min-w-[140px]"
          >
            <option value="">All</option>
            {agents.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2"
          >
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
            <option value="unapplied">Unapplied (CN)</option>
            <option value="partially_applied">Partially Applied (CN)</option>
            <option value="fully_applied">Fully Applied (CN)</option>
          </select>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeInvoice}
            onChange={(e) => setIncludeInvoice(e.target.checked)}
            className="rounded border-slate-300 dark:border-slate-600"
          />
          <span className="text-sm text-slate-700 dark:text-slate-300">Include Invoice</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeCreditNote}
            onChange={(e) => setIncludeCreditNote(e.target.checked)}
            className="rounded border-slate-300 dark:border-slate-600"
          />
          <span className="text-sm text-slate-700 dark:text-slate-300">Include Credit Note</span>
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
            Print
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loading size="lg" text="Loading..." />
        </div>
      )}

      {!loading && inquiryRun && (
        <div className="space-y-6 print:break-inside-avoid">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-5">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Revenue (from invoices)</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(revenue)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-5">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Credit notes (reduction)</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(creditNoteTotal)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-5">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Net revenue (after credit notes)</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(netRevenue)}</p>
            </div>
          </div>

          <p className="text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3">
            Figures are estimates for preparation; submit via LHDN/RMCD portals for filing.
          </p>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Margin and markup are not shown where cost data is not available. Revenue is based on invoice dates in the selected period.
          </p>
        </div>
      )}

      {!loading && !inquiryRun && (
        <p className="text-slate-500 dark:text-slate-400 text-sm">Set filters and click Inquiry to view the report.</p>
      )}
    </div>
  );
}

export default SalesProfitLossPage;
