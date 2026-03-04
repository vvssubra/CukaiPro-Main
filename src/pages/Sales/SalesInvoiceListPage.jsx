import { useState, useCallback, useMemo } from 'react';
import { useInvoices } from '../../hooks/useInvoices';
import { formatCurrency, formatDate } from '../../utils/validators';
import Loading from '../../components/Common/Loading';
import EmptyState from '../../components/Common/EmptyState';
import { SummaryCards } from '../../components/Sales';
import SalesCreateInvoiceModal from './SalesCreateInvoiceModal';
import ViewInvoiceModal from '../Invoices/ViewInvoiceModal';

const SUMMARY_CARDS = [
  { statusKey: 'unpaid', label: 'Unpaid' },
  { statusKey: 'partial', label: 'Partial Payment' },
  { statusKey: 'paid', label: 'Paid' },
];

/** Parse invoice_date to timestamp for filtering. */
function parseInvoiceDate(inv) {
  const d = inv?.invoice_date;
  if (!d) return 0;
  if (typeof d === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
    const [day, month, year] = d.split('/').map(Number);
    return new Date(year, month - 1, day).getTime();
  }
  return new Date(d).getTime();
}

/** Filter invoices by period: 365 = last 365 days, 12months = last 12 calendar months. */
function filterByPeriod(invoices, period) {
  const now = new Date();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).getTime();
  let startTs;
  if (period === '365') {
    startTs = todayEnd - 365 * 24 * 60 * 60 * 1000;
  } else {
    startTs = new Date(now.getFullYear(), now.getMonth() - 11, 1).getTime();
  }
  return invoices.filter((inv) => {
    const t = parseInvoiceDate(inv);
    return t >= startTs && t <= todayEnd;
  });
}

/** Build summary { totalCount, byStatus } from period-filtered invoices. */
function buildSummary(invoicesInPeriod) {
  const byStatus = { unpaid: { count: 0, total: 0 }, partial: { count: 0, total: 0 }, paid: { count: 0, total: 0 } };
  for (const inv of invoicesInPeriod) {
    const status = (inv.status || 'draft').toLowerCase();
    const amount = Number(inv.amount) || 0;
    if (status === 'paid') {
      byStatus.paid.count += 1;
      byStatus.paid.total += amount;
    } else if (status === 'partial') {
      byStatus.partial.count += 1;
      byStatus.partial.total += amount;
    } else {
      byStatus.unpaid.count += 1;
      byStatus.unpaid.total += amount;
    }
  }
  return { totalCount: invoicesInPeriod.length, byStatus };
}

function displayDate(invoice) {
  const d = invoice?.invoice_date;
  if (!d) return '—';
  if (typeof d === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(d)) return d;
  return formatDate(d);
}

function StatusBadge({ status }) {
  const s = (status || 'draft').toLowerCase();
  const config = {
    draft: { bg: 'bg-slate-100 dark:bg-white/10', text: 'text-slate-700 dark:text-white/70', label: 'Draft' },
    sent: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300', label: 'Sent' },
    paid: { bg: 'bg-primary/10', text: 'text-primary', label: 'Paid' },
    partial: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-800 dark:text-amber-300', label: 'Partial' },
    cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300', label: 'Cancelled' },
  };
  const { bg, text, label } = config[s] || config.draft;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
      {label}
    </span>
  );
}

/**
 * Sales Invoice list: title "Sales / Invoice", summary cards (Unpaid, Partial Payment, Paid),
 * period toggle (Last 365 days / Last 12 months), and table. New Invoice opens modal with line items.
 */
function SalesInvoiceListPage() {
  const { invoices, loading, error, createInvoice, deleteInvoice, fetchInvoices } = useInvoices();
  const [period, setPeriod] = useState('365');
  const [modalOpen, setModalOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const invoicesInPeriod = useMemo(() => filterByPeriod(invoices, period), [invoices, period]);
  const summary = useMemo(() => buildSummary(invoicesInPeriod), [invoicesInPeriod]);
  const sortedInvoices = useMemo(
    () => [...invoicesInPeriod].sort((a, b) => parseInvoiceDate(b) - parseInvoiceDate(a)),
    [invoicesInPeriod]
  );

  const handleCreateClick = useCallback(() => setModalOpen(true), []);
  const handleModalClose = useCallback(() => setModalOpen(false), []);
  const handleViewClose = useCallback(() => setViewInvoice(null), []);
  const handleModalSuccess = useCallback(() => {
    setModalOpen(false);
    fetchInvoices();
  }, [fetchInvoices]);

  const handleDelete = useCallback(
    async (id) => {
      setDeletingId(id);
      try {
        await deleteInvoice(id);
      } finally {
        setDeletingId(null);
      }
    },
    [deleteInvoice]
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-custom dark:text-white">Sales / Invoice</h1>
          <p className="text-sm text-slate-custom/60 dark:text-slate-custom/40 mt-1">
            Prices and credit terms for products or services issued to your customer.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreateClick}
          className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-all font-medium text-sm"
        >
          <span className="material-icons-outlined text-[20px]">add</span>
          New Invoice
        </button>
      </div>

      <SummaryCards
        period={period}
        onPeriodChange={setPeriod}
        summary={summary}
        cards={SUMMARY_CARDS}
        title="Summary"
      />

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {loading && !invoices.length && (
        <div className="flex justify-center py-16">
          <Loading size="lg" text="Loading invoices..." />
        </div>
      )}

      {!loading && invoices.length === 0 && (
        <EmptyState
          icon="description"
          title="No invoices yet"
          description="Create your first invoice to track sales and LHDN status."
          primaryAction={{ label: 'New Invoice', onClick: handleCreateClick, icon: 'add' }}
        />
      )}

      {(loading || invoices.length > 0) && (
        <div className="bg-white dark:bg-background-dark border border-slate-custom/10 dark:border-white/10 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-custom/5 dark:bg-white/5 text-slate-custom/60 dark:text-white/60 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 border-b border-slate-custom/10 dark:border-white/10">Date</th>
                  <th className="px-6 py-4 border-b border-slate-custom/10 dark:border-white/10">Client</th>
                  <th className="px-6 py-4 border-b border-slate-custom/10 dark:border-white/10">Invoice ID</th>
                  <th className="px-6 py-4 border-b border-slate-custom/10 dark:border-white/10 text-right">Amount (MYR)</th>
                  <th className="px-6 py-4 border-b border-slate-custom/10 dark:border-white/10">Status</th>
                  <th className="px-6 py-4 border-b border-slate-custom/10 dark:border-white/10 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-custom/10 dark:divide-white/10">
                {sortedInvoices.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-custom/60 dark:text-white/60">
                      No invoices in the selected period.
                    </td>
                  </tr>
                )}
                {sortedInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-primary/5 transition-colors group">
                    <td className="px-6 py-4 text-sm font-medium">{displayDate(inv)}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-slate-custom dark:text-white">{inv.client_name || '—'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-custom/60">#{String(inv.id).slice(0, 8)}</td>
                    <td className="px-6 py-4 text-sm text-right font-semibold">
                      {inv.amount != null ? formatCurrency(Number(inv.amount)) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3 text-slate-custom/40 group-hover:text-slate-custom">
                        <button
                          type="button"
                          onClick={() => setViewInvoice(inv)}
                          className="hover:text-primary transition-colors"
                          aria-label="View invoice"
                        >
                          <span className="material-icons-outlined text-[20px]">visibility</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(inv.id)}
                          disabled={deletingId === inv.id}
                          className="hover:text-red-600 transition-colors disabled:opacity-50"
                          aria-label="Delete invoice"
                        >
                          {deletingId === inv.id ? (
                            <span className="material-icons-outlined text-[20px] animate-spin">hourglass_empty</span>
                          ) : (
                            <span className="material-icons-outlined text-[20px]">delete</span>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <SalesCreateInvoiceModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        onCreateInvoice={createInvoice}
        onSuccess={handleModalSuccess}
      />
      <ViewInvoiceModal isOpen={!!viewInvoice} onClose={handleViewClose} invoice={viewInvoice} />
    </div>
  );
}

export default SalesInvoiceListPage;
