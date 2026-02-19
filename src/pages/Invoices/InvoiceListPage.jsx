import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useInvoices } from '../../hooks/useInvoices';
import { useDebounce } from '../../hooks/useDebounce';
import { formatCurrency, formatDate } from '../../utils/validators';
import Sidebar from '../../components/Sidebar';
import Loading from '../../components/Common/Loading';
import CreateInvoiceModal from './CreateInvoiceModal';
import ViewInvoiceModal from './ViewInvoiceModal';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'paid', label: 'Paid' },
  { value: 'cancelled', label: 'Cancelled' },
];

const LHDN_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'validated', label: 'Validated' },
  { value: 'submitted', label: 'Submitted' },
];

const DATE_RANGE_OPTIONS = [
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'last_3_months', label: 'Last 3 Months' },
  { value: 'all', label: 'All Time' },
];

const SORT_OPTIONS = [
  { value: 'date', order: 'desc', label: 'Date: Newest First' },
  { value: 'date', order: 'asc', label: 'Date: Oldest First' },
  { value: 'amount', order: 'desc', label: 'Amount: High to Low' },
  { value: 'amount', order: 'asc', label: 'Amount: Low to High' },
  { value: 'client', order: 'asc', label: 'Client Name: A-Z' },
  { value: 'client', order: 'desc', label: 'Client Name: Z-A' },
];

/** Parse invoice_date to timestamp for filtering. */
function parseInvoiceDateForFilter(d) {
  if (!d) return 0;
  if (typeof d === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
    const [day, month, year] = d.split('/').map(Number);
    return new Date(year, month - 1, day).getTime();
  }
  return new Date(d).getTime();
}

/** Filter invoices by date range. */
function applyDateRangeFilter(invoices, range) {
  if (!range || range === 'all') return invoices;
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  let start = 0;
  if (range === 'this_month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  } else if (range === 'last_month') {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).getTime();
    return invoices.filter((inv) => {
      const t = parseInvoiceDateForFilter(inv.invoice_date);
      return t >= start && t <= end;
    });
  } else if (range === 'last_3_months') {
    start = new Date(now.getFullYear(), now.getMonth() - 2, 1).getTime();
  }
  return invoices.filter((inv) => parseInvoiceDateForFilter(inv.invoice_date) >= start);
}

/** Sort invoices by field and order. */
function sortInvoices(invoices, sortBy, sortOrder) {
  const arr = [...invoices];
  const mult = sortOrder === 'asc' ? 1 : -1;
  arr.sort((a, b) => {
    if (sortBy === 'date') {
      return (parseInvoiceDateForFilter(a.invoice_date) - parseInvoiceDateForFilter(b.invoice_date)) * mult;
    }
    if (sortBy === 'amount') {
      return ((Number(a.amount) || 0) - (Number(b.amount) || 0)) * mult;
    }
    if (sortBy === 'client') {
      const na = (a.client_name || '').toLowerCase();
      const nb = (b.client_name || '').toLowerCase();
      return (na < nb ? -1 : na > nb ? 1 : 0) * mult;
    }
    return 0;
  });
  return arr;
}

/** Escape a value for CSV (quotes and commas). */
function escapeCSV(value) {
  if (value == null) return '""';
  const s = String(value);
  if (s.includes('"') || s.includes(',') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return `"${s}"`;
}

/** Get LHDN status from invoice (alias status for compatibility). */
function getLhdnStatus(inv) {
  const s = (inv.lhdn_status || inv.status || '').toLowerCase();
  if (s === 'paid') return 'validated';
  if (s === 'sent') return 'submitted';
  if (s === 'draft') return 'pending';
  return s || 'pending';
}

/**
 * Renders the status badge with color based on status value.
 * @param {string} status - One of draft, sent, paid, cancelled
 * @returns {JSX.Element}
 */
function StatusBadge({ status }) {
  const config = {
    draft: {
      bg: 'bg-slate-custom/10 dark:bg-white/10',
      text: 'text-slate-custom dark:text-white/70',
      dot: 'bg-slate-custom dark:bg-white/60',
    },
    sent: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-800 dark:text-blue-300',
      dot: 'bg-blue-600',
    },
    paid: {
      bg: 'bg-primary/10',
      text: 'text-primary',
      dot: 'bg-primary',
    },
    cancelled: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-800 dark:text-red-300',
      dot: 'bg-red-600',
    },
  };
  const { bg, text, dot } = config[status] || config.draft;
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Draft';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot} mr-1.5`} />
      {label}
    </span>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.string,
};

/**
 * Invoice Manager page (Page 4). Lists invoices from Supabase with create and delete actions.
 */
function InvoiceListPage() {
  const { invoices, loading, error, fetchInvoices, createInvoice, deleteInvoice } = useInvoices();
  const [modalOpen, setModalOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: [],
    lhdnStatus: [],
    dateRange: 'all',
  });
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 500);
  const filterPanelRef = useRef(null);

  const filteredAndSortedInvoices = useMemo(() => {
    let result = [...invoices];

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase();
      result = result.filter(
        (inv) =>
          (inv.client_name || '').toLowerCase().includes(q) ||
          (String(inv.id || '').slice(0, 8) || '').toLowerCase().includes(q) ||
          (inv.notes || '').toLowerCase().includes(q) ||
          (inv.tin || '').toLowerCase().includes(q)
      );
    }

    if (filters.status.length > 0) {
      result = result.filter((inv) => filters.status.includes(inv.status || 'draft'));
    }

    if (filters.lhdnStatus.length > 0) {
      result = result.filter((inv) => filters.lhdnStatus.includes(getLhdnStatus(inv)));
    }

    result = applyDateRangeFilter(result, filters.dateRange);
    result = sortInvoices(result, sortBy, sortOrder);
    return result;
  }, [invoices, debouncedSearch, filters, sortBy, sortOrder]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.status.length > 0) n += filters.status.length;
    if (filters.lhdnStatus.length > 0) n += filters.lhdnStatus.length;
    if (filters.dateRange && filters.dateRange !== 'all') n += 1;
    return n;
  }, [filters]);

  const handleCreateClick = useCallback(() => setModalOpen(true), []);
  const handleModalClose = useCallback(() => setModalOpen(false), []);
  const handleViewClose = useCallback(() => setViewInvoice(null), []);

  /** Close filter panel on Esc and click outside. */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setFilterPanelOpen(false);
    };
    const handleClickOutside = (e) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(e.target)) {
        setFilterPanelOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleApplyFilters = useCallback(() => {
    setFilterPanelOpen(false);
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setSearchQuery('');
    setFilters({ status: [], lhdnStatus: [], dateRange: 'all' });
    setFilterPanelOpen(false);
  }, []);

  const handleRemoveStatusFilter = useCallback((value) => {
    setFilters((prev) => ({ ...prev, status: prev.status.filter((s) => s !== value) }));
  }, []);

  const handleRemoveLhdnFilter = useCallback((value) => {
    setFilters((prev) => ({ ...prev, lhdnStatus: prev.lhdnStatus.filter((s) => s !== value) }));
  }, []);

  const handleRemoveDateRangeFilter = useCallback(() => {
    setFilters((prev) => ({ ...prev, dateRange: 'all' }));
  }, []);

  const handleExportCSV = useCallback(() => {
    if (filteredAndSortedInvoices.length === 0) {
      alert('No invoices to export');
      return;
    }
    setIsExporting(true);
    try {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      const headers = ['Invoice Number', 'Client Name', 'Date', 'Amount', 'Tax Amount', 'Total', 'Status', 'LHDN Status', 'Description'];
      const rows = filteredAndSortedInvoices.map((inv) => {
        const dateStr = inv.invoice_date
          ? typeof inv.invoice_date === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(inv.invoice_date)
            ? inv.invoice_date
            : formatDate(inv.invoice_date)
          : '';
        const amount = Number(inv.amount) || 0;
        const amountStr = formatCurrency(amount);
        return [
          `#${String(inv.id).slice(0, 8)}`,
          inv.client_name || '',
          dateStr,
          amountStr,
          '',
          amountStr,
          inv.status || 'draft',
          getLhdnStatus(inv),
          inv.notes || '',
        ].map(escapeCSV);
      });
      const csvContent = [headers.map(escapeCSV).join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cukaipro-invoices-${timestamp}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      console.log(`Exported ${filteredAndSortedInvoices.length} invoices successfully`);
      alert(`Exported ${filteredAndSortedInvoices.length} invoices successfully`);
    } catch (err) {
      console.error('Export failed', err);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [filteredAndSortedInvoices]);

  /**
   * Handles delete with loading state and error handling.
   * @param {string} id - Invoice id
   */
  const handleDelete = useCallback(
    async (id) => {
      setDeletingId(id);
      try {
        const result = await deleteInvoice(id);
        if (!result.success) {
          // Error already set in hook; optional: toast or inline message
        }
      } finally {
        setDeletingId(null);
      }
    },
    [deleteInvoice]
  );

  const displayDate = (invoice) => {
    const d = invoice.invoice_date;
    if (!d) return '—';
    if (typeof d === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(d)) return d;
    return formatDate(d);
  };

  /**
   * Downloads invoice as a formatted .txt file.
   * @param {object} invoice - Invoice object from list
   */
  const handleDownloadTxt = useCallback((invoice) => {
    const d = invoice.invoice_date;
    let dateStr = '—';
    if (d) {
      dateStr =
        typeof d === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(d)
          ? d
          : formatDate(d);
    }
    const amountStr =
      invoice.amount != null
        ? formatCurrency(Number(invoice.amount))
        : '—';
    const statusLabel = (invoice.status || 'draft').charAt(0).toUpperCase() + (invoice.status || 'draft').slice(1);
    const idShort = String(invoice.id).slice(0, 8);
    const clientName = invoice.client_name || 'Unknown';
    const safeName = clientName.replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-+/g, '-').slice(0, 50);

    const content = `INVOICE
========

Invoice ID: #${idShort}
Date: ${dateStr}

CLIENT DETAILS
--------------
Name: ${clientName}
TIN: ${invoice.tin || '—'}

INVOICE DETAILS
---------------
Amount: ${amountStr}
Status: ${statusLabel}
Notes: ${invoice.notes || '—'}

Generated by CukaiPro
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${idShort}-${safeName}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Page Title Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-custom dark:text-white">Invoices</h1>
          <p className="text-sm text-slate-custom/60 dark:text-slate-custom/40">
            Manage your Malaysian SME tax compliance and billing.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={isExporting || filteredAndSortedInvoices.length === 0}
            className="flex items-center justify-center gap-2 bg-white dark:bg-slate-custom border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <span className="material-icons-outlined text-[20px] animate-spin">hourglass_empty</span>
                Exporting {filteredAndSortedInvoices.length} invoices...
              </>
            ) : (
              <>
                <span className="material-icons-outlined text-[20px]">file_download</span>
                Export CSV
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleCreateClick}
            className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-all font-medium text-sm"
          >
            <span className="material-icons-outlined text-[20px]">add</span>
            Create New Invoice
          </button>
        </div>
      </div>

      {/* Search, Filter, Sort */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-grow">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-custom/40">
            <span className="material-icons-outlined">search</span>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoices by client, number, or description..."
            className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-custom border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-sm text-slate-900 dark:text-white"
            aria-label="Search invoices"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-custom/50 hover:text-slate-custom dark:text-white/50 dark:hover:text-white"
              aria-label="Clear search"
            >
              <span className="material-icons-outlined text-[20px]">close</span>
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative" ref={filterPanelRef}>
            <button
              type="button"
              onClick={() => setFilterPanelOpen((o) => !o)}
              className="flex items-center justify-center gap-2 bg-white dark:bg-slate-custom border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all text-sm font-medium"
            >
              <span className="material-icons-outlined text-[20px] text-primary">filter_list</span>
              Filter
              {activeFilterCount > 0 && (
                <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-emerald-500/20 dark:text-emerald-400 text-xs font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
            {filterPanelOpen && (
              <div className="absolute left-0 top-full mt-1 z-50 min-w-[320px] bg-white dark:bg-slate-custom rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-4 px-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Status</p>
                    <div className="space-y-2">
                      {STATUS_OPTIONS.map((opt) => (
                        <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.status.includes(opt.value)}
                            onChange={(e) => {
                              setFilters((prev) => ({
                                ...prev,
                                status: e.target.checked
                                  ? [...prev.status, opt.value]
                                  : prev.status.filter((s) => s !== opt.value),
                              }));
                            }}
                            className="rounded border-slate-300 text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">LHDN Status</p>
                    <div className="space-y-2">
                      {LHDN_OPTIONS.map((opt) => (
                        <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.lhdnStatus.includes(opt.value)}
                            onChange={(e) => {
                              setFilters((prev) => ({
                                ...prev,
                                lhdnStatus: e.target.checked
                                  ? [...prev.lhdnStatus, opt.value]
                                  : prev.lhdnStatus.filter((s) => s !== opt.value),
                              }));
                            }}
                            className="rounded border-slate-300 text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Date Range</p>
                    <div className="space-y-2">
                      {DATE_RANGE_OPTIONS.map((opt) => (
                        <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="dateRange"
                            checked={filters.dateRange === opt.value}
                            onChange={() => setFilters((prev) => ({ ...prev, dateRange: opt.value }))}
                            className="border-slate-300 text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={handleClearAllFilters}
                    className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-custom text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800/30"
                  >
                    Clear All
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyFilters}
                    className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 bg-white dark:bg-slate-custom border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const v = e.target.value;
                const idx = SORT_OPTIONS.findIndex((o) => `${o.value}-${o.order}` === v);
                if (idx >= 0) {
                  setSortBy(SORT_OPTIONS[idx].value);
                  setSortOrder(SORT_OPTIONS[idx].order);
                }
              }}
              className="bg-transparent border-0 py-2.5 pl-4 pr-8 text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-0 outline-none cursor-pointer"
              aria-label="Sort by"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={`${opt.value}-${opt.order}`} value={`${opt.value}-${opt.order}`}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="material-icons-outlined text-[18px] text-slate-500 dark:text-slate-400 pointer-events-none -ml-6">
              {sortOrder === 'desc' ? 'arrow_downward' : 'arrow_upward'}
            </span>
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {(activeFilterCount > 0 || searchQuery.trim()) && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {searchQuery.trim() && (
            <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 bg-primary/10 text-primary dark:bg-emerald-500/10 dark:text-emerald-400 text-sm">
              Search: &quot;{searchQuery.trim()}&quot;
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-0.5 rounded-full hover:bg-primary/20 dark:hover:bg-emerald-500/20"
                aria-label="Clear search"
              >
                <span className="material-icons-outlined text-[16px]">close</span>
              </button>
            </span>
          )}
          {filters.status.map((s) => (
            <span
              key={`status-${s}`}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 bg-primary/10 text-primary dark:bg-emerald-500/10 dark:text-emerald-400 text-sm"
            >
              Status: {STATUS_OPTIONS.find((o) => o.value === s)?.label || s}
              <button
                type="button"
                onClick={() => handleRemoveStatusFilter(s)}
                className="p-0.5 rounded-full hover:bg-primary/20 dark:hover:bg-emerald-500/20"
                aria-label={`Remove ${s} filter`}
              >
                <span className="material-icons-outlined text-[16px]">close</span>
              </button>
            </span>
          ))}
          {filters.lhdnStatus.map((s) => (
            <span
              key={`lhdn-${s}`}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 bg-primary/10 text-primary dark:bg-emerald-500/10 dark:text-emerald-400 text-sm"
            >
              LHDN: {LHDN_OPTIONS.find((o) => o.value === s)?.label || s}
              <button
                type="button"
                onClick={() => handleRemoveLhdnFilter(s)}
                className="p-0.5 rounded-full hover:bg-primary/20 dark:hover:bg-emerald-500/20"
                aria-label={`Remove ${s} filter`}
              >
                <span className="material-icons-outlined text-[16px]">close</span>
              </button>
            </span>
          ))}
          {filters.dateRange && filters.dateRange !== 'all' && (
            <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 bg-primary/10 text-primary dark:bg-emerald-500/10 dark:text-emerald-400 text-sm">
              Date: {DATE_RANGE_OPTIONS.find((o) => o.value === filters.dateRange)?.label || filters.dateRange}
              <button
                type="button"
                onClick={handleRemoveDateRangeFilter}
                className="p-0.5 rounded-full hover:bg-primary/20 dark:hover:bg-emerald-500/20"
                aria-label="Remove date range filter"
              >
                <span className="material-icons-outlined text-[16px]">close</span>
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={handleClearAllFilters}
            className="text-sm font-medium text-primary dark:text-emerald-400 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Empty state when search/filter returns no results */}
      {!loading && invoices.length > 0 && filteredAndSortedInvoices.length === 0 && (
        <div className="mb-6 p-8 rounded-lg bg-white dark:bg-slate-custom border border-slate-200 dark:border-slate-700 shadow-sm text-center">
          <span className="material-icons-outlined text-4xl text-slate-400 dark:text-slate-500 mb-4">search_off</span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">No results found</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Try adjusting your search or filters.</p>
          <button
            type="button"
            onClick={handleClearAllFilters}
            className="text-sm font-medium text-primary dark:text-emerald-400 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Loading spinner */}
      {loading && !invoices.length && (
        <div className="flex justify-center py-16">
          <Loading size="lg" text="Loading invoices..." />
        </div>
      )}

      {/* Main Table Card */}
      {(!loading || invoices.length > 0) && (
        <div className="bg-white dark:bg-background-dark border border-slate-custom/10 dark:border-white/10 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-custom/5 dark:bg-white/5 text-slate-custom/60 dark:text-white/60 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 border-b border-slate-custom/10 dark:border-white/10">
                    Date
                  </th>
                  <th className="px-6 py-4 border-b border-slate-custom/10 dark:border-white/10">
                    Client
                  </th>
                  <th className="px-6 py-4 border-b border-slate-custom/10 dark:border-white/10">
                    Invoice ID
                  </th>
                  <th className="px-6 py-4 border-b border-slate-custom/10 dark:border-white/10 text-right">
                    Amount (MYR)
                  </th>
                  <th className="px-6 py-4 border-b border-slate-custom/10 dark:border-white/10">
                    LHDN Status
                  </th>
                  <th className="px-6 py-4 border-b border-slate-custom/10 dark:border-white/10 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-custom/10 dark:divide-white/10">
                {filteredAndSortedInvoices.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-sm text-slate-custom/60 dark:text-white/60"
                    >
                      {invoices.length === 0
                        ? 'No invoices yet. Create your first invoice.'
                        : 'No results found. Try adjusting your search or filters.'}
                    </td>
                  </tr>
                )}
                {filteredAndSortedInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-primary/5 transition-colors group"
                  >
                    <td className="px-6 py-4 text-sm font-medium">
                      {displayDate(invoice)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-slate-custom dark:text-white">
                        {invoice.client_name || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-custom/60">
                      #{String(invoice.id).slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold">
                      {invoice.amount != null
                        ? formatCurrency(Number(invoice.amount))
                        : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={invoice.status || 'draft'} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3 text-slate-custom/40 group-hover:text-slate-custom">
                        <button
                          type="button"
                          onClick={() => setViewInvoice(invoice)}
                          className="hover:text-primary transition-colors"
                          aria-label="View invoice"
                        >
                          <span className="material-icons-outlined text-[20px]">
                            visibility
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadTxt(invoice)}
                          className="hover:text-primary transition-colors"
                          aria-label="Download invoice"
                        >
                          <span className="material-icons-outlined text-[20px]">
                            file_download
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(invoice.id)}
                          disabled={deletingId === invoice.id}
                          className="hover:text-red-600 transition-colors disabled:opacity-50"
                          aria-label="Delete invoice"
                        >
                          {deletingId === invoice.id ? (
                            <span className="material-icons-outlined text-[20px] animate-spin">
                              hourglass_empty
                            </span>
                          ) : (
                            <span className="material-icons-outlined text-[20px]">
                              delete
                            </span>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination Section */}
          {filteredAndSortedInvoices.length > 0 && (
            <div className="px-6 py-4 flex items-center justify-between bg-slate-custom/5 dark:bg-white/5 border-t border-slate-custom/10 dark:border-white/10">
              <span className="text-xs text-slate-custom/60">
                Showing 1 to {filteredAndSortedInvoices.length} of {filteredAndSortedInvoices.length} entries
                {filteredAndSortedInvoices.length !== invoices.length && (
                  <span> (filtered from {invoices.length})</span>
                )}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled
                  className="p-1.5 rounded border border-slate-custom/10 dark:border-white/10 text-slate-custom/60 hover:bg-white transition-all disabled:opacity-50"
                >
                  <span className="material-icons-outlined text-sm leading-none">
                    chevron_left
                  </span>
                </button>
                <button
                  type="button"
                  className="px-3 py-1 text-xs font-medium rounded bg-primary text-white"
                >
                  1
                </button>
                <button
                  type="button"
                  className="p-1.5 rounded border border-slate-custom/10 dark:border-white/10 text-slate-custom/60 hover:bg-white transition-all"
                >
                  <span className="material-icons-outlined text-sm leading-none">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* System Status Summary Footer */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
            <span className="material-icons-outlined">verified</span>
          </div>
          <div>
            <div className="text-xs text-slate-custom/60 uppercase font-semibold">
              Tax Validated
            </div>
            <div className="text-xl font-bold text-primary">
              RM 0.00
            </div>
          </div>
        </div>
        <div className="bg-slate-custom/5 border border-slate-custom/10 p-4 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-slate-custom/10 flex items-center justify-center text-slate-custom">
            <span className="material-icons-outlined">pending_actions</span>
          </div>
          <div>
            <div className="text-xs text-slate-custom/60 uppercase font-semibold">
              Processing
            </div>
            <div className="text-xl font-bold text-slate-custom">RM 0.00</div>
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-4 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400">
            <span className="material-icons-outlined">report_problem</span>
          </div>
          <div>
            <div className="text-xs text-slate-custom/60 uppercase font-semibold">
              Action Required
            </div>
            <div className="text-xl font-bold text-red-600 dark:text-red-400">RM 0.00</div>
          </div>
        </div>
      </div>

      <CreateInvoiceModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        onCreateInvoice={createInvoice}
        onSuccess={handleModalClose}
      />
      <ViewInvoiceModal
        isOpen={!!viewInvoice}
        onClose={handleViewClose}
        invoice={viewInvoice}
      />
        </div>
      </main>
    </div>
  );
}

export default InvoiceListPage;
