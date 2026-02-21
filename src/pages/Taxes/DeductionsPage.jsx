import { useState, useCallback, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Sidebar from '../../components/Sidebar';
import { useOrganization } from '../../context/OrganizationContext';
import { useToast } from '../../context/ToastContext';
import { useDeductions } from '../../hooks/useDeductions';
import { useDebounce } from '../../hooks/useDebounce';
import { calculateTotalDeductions, estimateTaxSavings } from '../../hooks/useTaxCalculation';
import { formatCurrency } from '../../utils/validators';
import { TAX_CATEGORIES, getCategoryById } from '../../data/taxCategories';
import Loading from '../../components/Common/Loading';
import AddDeductionModal from './AddDeductionModal';
import ViewReceiptModal from './ViewReceiptModal';
import DeleteDeductionModal from './DeleteDeductionModal';

const currentYearForList = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYearForList - i);
const CATEGORY_TABS = [
  { value: 'business', label: 'Business Expenses' },
  { value: 'capital', label: 'Capital Allowance' },
  { value: 'personal', label: 'Personal Relief' },
];
const PAGE_SIZE = 20;

function StatusBadge({ status }) {
  const s = (status || 'pending').toLowerCase();
  const config = {
    pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    verified: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    claimed: 'bg-primary/10 text-primary dark:text-emerald-500/10 dark:text-emerald-400',
  };
  const label = s.charAt(0).toUpperCase() + s.slice(1);
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config[s] || config.pending}`}>
      {label}
    </span>
  );
}

StatusBadge.propTypes = { status: PropTypes.string };

function DeductionsPage() {
  const currentYear = new Date().getFullYear();
  const [taxYear, setTaxYear] = useState(currentYear);
  const [categoryTab, setCategoryTab] = useState('business');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewReceiptDeduction, setViewReceiptDeduction] = useState(null);
  const [editDeduction, setEditDeduction] = useState(null);
  const [deductionToDelete, setDeductionToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const debouncedSearch = useDebounce(searchQuery, 500);
  const { hasPermission } = useOrganization();
  const toast = useToast();
  const { deductions, loading, error, fetchDeductions, addDeduction, updateDeduction, deleteDeduction } = useDeductions();

  const canAddDeduction = hasPermission('add_deductions') || hasPermission('manage_deductions') || hasPermission('all');
  const canEditDeduction = hasPermission('add_deductions') || hasPermission('manage_deductions') || hasPermission('view_deductions') || hasPermission('all');
  const canDeleteDeduction = hasPermission('manage_deductions') || hasPermission('all');

  useEffect(() => {
    fetchDeductions(taxYear);
  }, [taxYear, fetchDeductions]);

  const deductionsForYear = useMemo(() => deductions.filter((d) => Number(d.tax_year) === taxYear), [deductions, taxYear]);

  const summary = useMemo(() => {
    const { total, byType } = calculateTotalDeductions(deductionsForYear);
    const savings = estimateTaxSavings(deductionsForYear);
    const withReceipt = deductionsForYear.filter((d) => d.has_receipt).length;
    const categoriesUsed = new Set(deductionsForYear.map((d) => d.category_id)).size;
    return {
      totalDeductions: total,
      taxSavings: savings,
      receiptsUploaded: withReceipt,
      totalCount: deductionsForYear.length,
      missingReceipts: deductionsForYear.length - withReceipt,
      categoriesUsed,
    };
  }, [deductionsForYear]);

  const filteredAndSorted = useMemo(() => {
    let list = [...deductionsForYear];
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase();
      list = list.filter(
        (d) =>
          (d.category_name || '').toLowerCase().includes(q) ||
          (d.description || '').toLowerCase().includes(q)
      );
    }
    if (categoryFilter) list = list.filter((d) => d.category_id === categoryFilter);
    const mult = sortOrder === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      if (sortBy === 'date') {
        const da = a.deduction_date ? new Date(a.deduction_date.split('/').reverse().join('-')).getTime() : 0;
        const db = b.deduction_date ? new Date(b.deduction_date.split('/').reverse().join('-')).getTime() : 0;
        return (da - db) * mult;
      }
      if (sortBy === 'amount') return ((Number(a.amount) || 0) - (Number(b.amount) || 0)) * mult;
      const ca = (a.category_name || '').toLowerCase();
      const cb = (b.category_name || '').toLowerCase();
      return (ca < cb ? -1 : ca > cb ? 1 : 0) * mult;
    });
    return list;
  }, [deductionsForYear, debouncedSearch, categoryFilter, sortBy, sortOrder]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredAndSorted.slice(start, start + PAGE_SIZE);
  }, [filteredAndSorted, page]);

  const totalPages = Math.ceil(filteredAndSorted.length / PAGE_SIZE) || 1;

  const deductionsByCategory = useMemo(() => {
    const byCat = {};
    deductionsForYear
      .filter((d) => (d.category_type || 'business') === categoryTab)
      .forEach((d) => {
        const id = d.category_id || 'other';
        if (!byCat[id]) byCat[id] = { category_id: id, category_name: d.category_name, items: [], total: 0, claimable: 0 };
        byCat[id].items.push(d);
        byCat[id].total += Number(d.amount) || 0;
        byCat[id].claimable += Number(d.claimable_amount) || 0;
      });
    return Object.values(byCat);
  }, [deductionsForYear, categoryTab]);

  const handleSaveAdd = useCallback(
    async (formData, file) => {
      const result = editDeduction
        ? await updateDeduction(editDeduction.id, formData, file)
        : await addDeduction(formData, file);
      if (result.success) {
        setAddModalOpen(false);
        setEditDeduction(null);
        toast.success(editDeduction ? 'Deduction updated.' : 'Deduction added.');
      } else {
        toast.error(result.error || 'Save failed.');
      }
      return result;
    },
    [editDeduction, addDeduction, updateDeduction, toast]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deductionToDelete) return;
    setDeletingId(deductionToDelete.id);
    const result = await deleteDeduction(deductionToDelete.id);
    setDeletingId(null);
    setDeductionToDelete(null);
    if (result.success) toast.success('Deduction deleted.');
    else toast.error(result.error || 'Delete failed.');
    return result;
  }, [deductionToDelete, deleteDeduction, toast]);

  const toggleCategory = (id) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const displayDate = (d) => {
    const x = d.deduction_date;
    if (!x) return '—';
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(x)) return x;
    if (/^\d{4}-\d{2}-\d{2}$/.test(x)) {
      const [y, m, day] = x.split('-');
      return `${day}/${m}/${y}`;
    }
    return x;
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tax Deductions Tracker</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Track all your tax-deductible expenses for {taxYear}</p>
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
              {canAddDeduction && (
                <button
                  type="button"
                  onClick={() => { setEditDeduction(null); setAddModalOpen(true); }}
                  className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary/90 font-medium text-sm"
                >
                  <span className="material-icons text-[20px]">add</span>
                  Add Deduction
                </button>
              )}
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
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <span className="material-icons">savings</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Total Deductions Claimed</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(summary.totalDeductions)}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Across all categories</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-custom rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <span className="material-icons">account_balance_wallet</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Estimated Tax Savings</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(summary.taxSavings)}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Based on 24% tax rate</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-custom rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <span className="material-icons">receipt_long</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Receipts Uploaded</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{summary.receiptsUploaded} / {summary.totalCount}</p>
                  <p className={summary.missingReceipts > 0 ? 'text-xs text-amber-600 dark:text-amber-400' : 'text-xs text-slate-500 dark:text-slate-400'}>
                    {summary.missingReceipts > 0 ? `${summary.missingReceipts} missing receipts` : 'All receipts uploaded'}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-custom rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <span className="material-icons">category</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Categories Used</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{summary.categoriesUsed}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Out of {TAX_CATEGORIES.length} available</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs: Deductions by category */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Deductions by Category</h2>
            <div className="flex gap-2 mb-4">
              {CATEGORY_TABS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setCategoryTab(t.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${categoryTab === t.value ? 'bg-primary text-white' : 'bg-white dark:bg-slate-custom border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {loading ? (
              <Loading size="md" text="Loading..." />
            ) : deductionsByCategory.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 p-6 bg-white dark:bg-slate-custom rounded-xl border border-slate-200 dark:border-slate-700">No deductions in this category for {taxYear}.</p>
            ) : (
              <div className="space-y-2">
                {deductionsByCategory.map((cat) => {
                  const catInfo = getCategoryById(cat.category_id);
                  const icon = catInfo?.icon || 'receipt';
                  const isExpanded = expandedCategories.has(cat.category_id);
                  return (
                    <div key={cat.category_id} className="bg-white dark:bg-slate-custom rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleCategory(cat.category_id)}
                        className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            <span className="material-icons">{icon}</span>
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{cat.category_name}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Total: {formatCurrency(cat.total)} • Claimable: {formatCurrency(cat.claimable)} • {cat.items.length} receipt(s)
                            </p>
                          </div>
                        </div>
                        <span className="material-icons text-slate-400">{isExpanded ? 'expand_less' : 'expand_more'}</span>
                      </button>
                      {isExpanded && (
                        <div className="border-t border-slate-200 dark:border-slate-700 divide-y divide-slate-200 dark:divide-slate-700">
                          {cat.items.map((d) => (
                            <div key={d.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                              <div>
                                <p className="font-medium text-slate-900 dark:text-white">{displayDate(d)} — {d.description || 'No description'}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  Amount: {formatCurrency(Number(d.amount) || 0)} • Claimable: {formatCurrency(Number(d.claimable_amount) || 0)}
                                  {d.has_receipt ? ' ✓' : ' (no receipt)'}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <StatusBadge status={d.status} />
                                {d.has_receipt && (
                                  <button type="button" onClick={() => setViewReceiptDeduction(d)} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700" aria-label="View receipt">
                                    <span className="material-icons text-[20px]">visibility</span>
                                  </button>
                                )}
                                {canEditDeduction && (
                                  <button type="button" onClick={() => { setEditDeduction(d); setAddModalOpen(true); }} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700" aria-label="Edit">
                                    <span className="material-icons text-[20px]">edit</span>
                                  </button>
                                )}
                                {canDeleteDeduction && (
                                  <button type="button" onClick={() => setDeductionToDelete(d)} className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600" aria-label="Delete">
                                    <span className="material-icons text-[20px]">delete</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* All deductions table */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">All Deductions</h2>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="relative flex-grow">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-icons">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by category or description..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-custom text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-custom text-slate-900 dark:text-white"
              >
                <option value="">All categories</option>
                {TAX_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [by, order] = e.target.value.split('-');
                  setSortBy(by);
                  setSortOrder(order);
                }}
                className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-custom text-slate-900 dark:text-white"
              >
                <option value="date-desc">Date: Newest</option>
                <option value="date-asc">Date: Oldest</option>
                <option value="amount-desc">Amount: High to Low</option>
                <option value="amount-asc">Amount: Low to High</option>
                <option value="category-asc">Category: A-Z</option>
                <option value="category-desc">Category: Z-A</option>
              </select>
            </div>

            <div className="bg-white dark:bg-slate-custom rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase">
                  <tr>
                    <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">Date</th>
                    <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">Category</th>
                    <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">Description</th>
                    <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 text-right">Amount</th>
                    <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 text-right">Claimable</th>
                    <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">Receipt</th>
                    <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">Status</th>
                    <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredAndSorted.length === 0 && !loading && (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                        No deductions yet for {taxYear}.
                      </td>
                    </tr>
                  )}
                  {paginated.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="px-6 py-4 text-sm">{displayDate(d)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{d.category_name || '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{d.description || '—'}</td>
                      <td className="px-6 py-4 text-sm text-right font-medium">{formatCurrency(Number(d.amount) || 0)}</td>
                      <td className="px-6 py-4 text-sm text-right">{formatCurrency(Number(d.claimable_amount) || 0)}</td>
                      <td className="px-6 py-4">{d.has_receipt ? <span className="text-emerald-500 material-icons">check_circle</span> : <span className="text-slate-400 material-icons">cancel</span>}</td>
                      <td className="px-6 py-4"><StatusBadge status={d.status} /></td>
                      <td className="px-6 py-4 text-right">
                        {d.has_receipt && <button type="button" onClick={() => setViewReceiptDeduction(d)} className="p-1 hover:text-primary" aria-label="View receipt"><span className="material-icons text-[20px]">visibility</span></button>}
                        {canEditDeduction && <button type="button" onClick={() => { setEditDeduction(d); setAddModalOpen(true); }} className="p-1 hover:text-primary" aria-label="Edit"><span className="material-icons text-[20px]">edit</span></button>}
                        {canDeleteDeduction && <button type="button" onClick={() => setDeductionToDelete(d)} className="p-1 hover:text-red-600" aria-label="Delete"><span className="material-icons text-[20px]">delete</span></button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="px-6 py-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filteredAndSorted.length)} of {filteredAndSorted.length}
                  </p>
                  <div className="flex gap-2">
                    <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-50">Prev</button>
                    <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-50">Next</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <AddDeductionModal
          isOpen={addModalOpen}
          onClose={() => { setAddModalOpen(false); setEditDeduction(null); }}
          onSave={handleSaveAdd}
          editDeduction={editDeduction}
          taxYear={taxYear}
        />
        <ViewReceiptModal isOpen={!!viewReceiptDeduction} onClose={() => setViewReceiptDeduction(null)} deduction={viewReceiptDeduction} />
        <DeleteDeductionModal
          isOpen={!!deductionToDelete}
          onClose={() => setDeductionToDelete(null)}
          onConfirm={handleDeleteConfirm}
          deduction={deductionToDelete}
          isDeleting={deletingId === deductionToDelete?.id}
        />
      </main>
    </div>
  );
}

export default DeductionsPage;
