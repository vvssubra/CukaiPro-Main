import { useMemo, useState } from 'react';
import { useQuotations } from '../../hooks/useQuotations';
import { useInvoices } from '../../hooks/useInvoices';
import { useCreditNotes } from '../../hooks/useCreditNotes';
import { useContacts } from '../../hooks/useContacts';
import { formatCurrency, formatDate } from '../../utils/validators';
import Loading from '../../components/Common/Loading';

/** Normalize date (DD/MM/YYYY or ISO) for sorting (timestamp). */
function toTimestamp(d) {
  if (!d) return 0;
  if (typeof d === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
    const [day, month, year] = d.split('/').map(Number);
    return new Date(year, month - 1, day).getTime();
  }
  return new Date(d).getTime();
}

/** Normalize to YYYY-MM-DD for range filter. */
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

const DOC_TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'quotation', label: 'Quotation' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'credit_note', label: 'Credit Note' },
];

function SalesDocumentsPage() {
  const now = new Date();
  const defaultFrom = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const defaultTo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const [typeFilter, setTypeFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { quotations, loading: loadingQ } = useQuotations({});
  const { invoices, loading: loadingI } = useInvoices();
  const { creditNotes, loading: loadingCN } = useCreditNotes({});
  const { contacts } = useContacts({});

  const contactMap = useMemo(() => {
    const m = {};
    (contacts || []).forEach((c) => { m[c.id] = c; });
    return m;
  }, [contacts]);

  const combined = useMemo(() => {
    const list = [];

    (quotations || []).forEach((q) => {
      list.push({
        type: 'Quotation',
        ref_no: q.ref_no,
        date: q.quotation_date,
        customer: q.contact_id ? (contactMap[q.contact_id]?.name || '—') : '—',
        amount: Number(q.total) || 0,
        status: (q.status || 'pending').replace('_', ' '),
        id: `q-${q.id}`,
      });
    });

    (invoices || []).forEach((inv) => {
      list.push({
        type: 'Invoice',
        ref_no: inv.ref_no || `INV-${inv.id?.slice(0, 8)}` || '—',
        date: inv.invoice_date,
        customer: inv.contact_id
          ? (contactMap[inv.contact_id]?.name || '—')
          : (inv.client_name || '—'),
        amount: Number(inv.amount) || 0,
        status: (inv.status || 'draft').replace('_', ' '),
        id: `i-${inv.id}`,
      });
    });

    (creditNotes || []).forEach((cn) => {
      list.push({
        type: 'Credit Note',
        ref_no: cn.ref_no,
        date: cn.credit_note_date,
        customer: cn.contact_id ? (contactMap[cn.contact_id]?.name || '—') : '—',
        amount: Number(cn.total) || 0,
        status: (cn.status || 'unapplied').replace('_', ' '),
        id: `cn-${cn.id}`,
      });
    });

    list.sort((a, b) => toTimestamp(b.date) - toTimestamp(a.date));
    return list;
  }, [quotations, invoices, creditNotes, contactMap]);

  const filtered = useMemo(() => {
    let out = combined;

    if (typeFilter === 'quotation') out = out.filter((r) => r.type === 'Quotation');
    else if (typeFilter === 'invoice') out = out.filter((r) => r.type === 'Invoice');
    else if (typeFilter === 'credit_note') out = out.filter((r) => r.type === 'Credit Note');

    if (fromDate) {
      out = out.filter((r) => {
        const str = toComparableDateStr(r.date);
        return str && str >= fromDate;
      });
    }
    if (toDate) {
      out = out.filter((r) => {
        const str = toComparableDateStr(r.date);
        return str && str <= toDate;
      });
    }

    if (statusFilter) {
      const norm = (v) => (v || '').toLowerCase().replace(/_/g, ' ').trim();
      out = out.filter((r) => norm(r.status) === norm(statusFilter));
    }

    return out;
  }, [combined, typeFilter, fromDate, toDate, statusFilter]);

  const loading = loadingQ || loadingI || loadingCN;

  const statusOptions = useMemo(() => {
    const set = new Set();
    combined.forEach((r) => set.add(r.status));
    return Array.from(set).filter(Boolean).sort();
  }, [combined]);

  return (
    <div className="container-fluid flex-grow-1 container-p-y">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
          Sales / Reports / List of Documents
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">Quotations, invoices, and credit notes in one list.</p>
      </div>

      <div className="mb-6 flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2"
          >
            {DOC_TYPE_OPTIONS.map((o) => (
              <option key={o.value || 'all'} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
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
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 min-w-[140px]"
          >
            <option value="">All</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loading size="lg" text="Loading..." />
        </div>
      )}

      {!loading && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <th className="px-4 py-3 font-semibold text-slate-900 dark:text-white">Type</th>
                  <th className="px-4 py-3 font-semibold text-slate-900 dark:text-white">Ref No</th>
                  <th className="px-4 py-3 font-semibold text-slate-900 dark:text-white">Date</th>
                  <th className="px-4 py-3 font-semibold text-slate-900 dark:text-white">Customer</th>
                  <th className="px-4 py-3 font-semibold text-slate-900 dark:text-white text-right">Amount</th>
                  <th className="px-4 py-3 font-semibold text-slate-900 dark:text-white">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                      No documents match the filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => (
                    <tr key={row.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="px-4 py-3 text-slate-900 dark:text-white">{row.type}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.ref_no}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        {row.date ? (typeof row.date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(row.date)
                          ? formatDate(row.date)
                          : formatDate(row.date)) : '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.customer}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-white">
                        {formatCurrency(row.amount)}
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalesDocumentsPage;
