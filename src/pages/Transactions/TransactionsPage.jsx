import { useState, useCallback, useMemo } from 'react';
import { useTransactions } from '../../hooks/useTransactions';
import { useAccounts } from '../../hooks/useAccounts';
import { useContacts } from '../../hooks/useContacts';
import { formatCurrency, formatDate } from '../../utils/validators';
import Loading from '../../components/Common/Loading';
import EmptyState from '../../components/Common/EmptyState';

const TYPE_LABELS = {
  journal_entry: 'Journal Entry',
  invoice: 'Invoice',
  payment: 'Payment',
  receipt: 'Receipt',
  bill: 'Bill',
  credit_note: 'Credit Note',
};

function toDateStr(d) {
  if (!d) return '';
  if (typeof d === 'string' && d.length >= 10) return d.slice(0, 10);
  const date = new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function TransactionsPage() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [refFilter, setRefFilter] = useState('');
  const [contactFilter, setContactFilter] = useState('');
  const [accountFilter, setAccountFilter] = useState('');

  const filters = useMemo(
    () => ({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      type: typeFilter || undefined,
      refNo: refFilter || undefined,
      contactId: contactFilter || undefined,
      accountId: accountFilter || undefined,
    }),
    [dateFrom, dateTo, typeFilter, refFilter, contactFilter, accountFilter]
  );

  const { transactions, loading, error, fetchTransactions: _fetchTransactions, createTransaction, deleteTransaction, TRANSACTION_TYPES } = useTransactions(filters);
  const { accounts } = useAccounts();
  const { contacts } = useContacts();

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'journal_entry',
    ref_no: '',
    transaction_date: toDateStr(new Date()),
    description: '',
    contact_id: '',
  });
  const [lines, setLines] = useState([{ account_id: '', debit: 0, credit: 0, description: '' }]);
  const [formError, setFormError] = useState('');

  const totalDebit = useMemo(() => lines.reduce((s, l) => s + (Number(l.debit) || 0), 0), [lines]);
  const totalCredit = useMemo(() => lines.reduce((s, l) => s + (Number(l.credit) || 0), 0), [lines]);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const resetForm = useCallback(() => {
    setFormData({
      type: 'journal_entry',
      ref_no: '',
      transaction_date: toDateStr(new Date()),
      description: '',
      contact_id: '',
    });
    setLines([{ account_id: '', debit: 0, credit: 0, description: '' }]);
    setFormError('');
  }, []);

  const handleOpenNew = useCallback(() => {
    resetForm();
    setModalOpen(true);
  }, [resetForm]);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    resetForm();
  }, [resetForm]);

  const addLine = useCallback(() => {
    setLines((prev) => [...prev, { account_id: '', debit: 0, credit: 0, description: '' }]);
  }, []);

  const updateLine = useCallback((index, field, value) => {
    setLines((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }, []);

  const removeLine = useCallback((index) => {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setFormError('');
      if (!isBalanced) {
        setFormError('Total debits must equal total credits.');
        return;
      }
      const validLines = lines
        .map((l) => ({ ...l, account_id: l.account_id, debit: Number(l.debit) || 0, credit: Number(l.credit) || 0 }))
        .filter((l) => l.account_id && (l.debit > 0 || l.credit > 0));
      if (validLines.length === 0) {
        setFormError('Add at least one line with an account and debit or credit amount.');
        return;
      }

      const result = await createTransaction(
        {
          type: formData.type,
          ref_no: formData.ref_no.trim() || null,
          transaction_date: formData.transaction_date,
          description: formData.description.trim() || null,
          contact_id: formData.contact_id || null,
        },
        validLines
      );
      if (result.success) handleCloseModal();
      else setFormError(result.error || 'Failed to create transaction');
    },
    [formData, lines, isBalanced, createTransaction, handleCloseModal]
  );

  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm('Delete this transaction and all its lines?')) return;
      await deleteTransaction(id);
    },
    [deleteTransaction]
  );

  const getTxTotals = (tx) => {
    const lns = tx.transaction_lines || [];
    const debit = lns.reduce((s, l) => s + (Number(l.debit) || 0), 0);
    const credit = lns.reduce((s, l) => s + (Number(l.credit) || 0), 0);
    return { debit, credit };
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Transactions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Record and view journal entries, invoices, payments, and more.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenNew}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90"
        >
          <span className="material-icons-outlined text-lg">add</span>
          New Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-custom text-slate-900 dark:text-white text-sm"
          placeholder="From"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-custom text-slate-900 dark:text-white text-sm"
          placeholder="To"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-custom text-slate-900 dark:text-white text-sm"
        >
          <option value="">All types</option>
          {TRANSACTION_TYPES.map((t) => (
            <option key={t} value={t}>{TYPE_LABELS[t] || t}</option>
          ))}
        </select>
        <input
          type="text"
          value={refFilter}
          onChange={(e) => setRefFilter(e.target.value)}
          placeholder="Ref No"
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-custom text-slate-900 dark:text-white text-sm"
        />
        <select
          value={contactFilter}
          onChange={(e) => setContactFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-custom text-slate-900 dark:text-white text-sm"
        >
          <option value="">All contacts</option>
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={accountFilter}
          onChange={(e) => setAccountFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-custom text-slate-900 dark:text-white text-sm"
        >
          <option value="">All accounts</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {loading && !transactions.length && (
        <div className="flex justify-center py-16">
          <Loading size="lg" text="Loading transactions..." />
        </div>
      )}

      {!loading && transactions.length === 0 && (
        <EmptyState
          icon="list_alt"
          title="No transactions yet"
          description="Create a journal entry or link transactions from invoices and payments."
          primaryAction={{ label: 'New Transaction', onClick: handleOpenNew, icon: 'add' }}
        />
      )}

      {transactions.length > 0 && (
        <div className="bg-white dark:bg-slate-custom rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">Date</th>
                  <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">Type</th>
                  <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">Ref No</th>
                  <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">Description</th>
                  <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">Contact</th>
                  <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 text-right">Debit</th>
                  <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 text-right">Credit</th>
                  <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {transactions.map((tx) => {
                  const { debit, credit } = getTxTotals(tx);
                  const contactName = tx.contact?.name || (Array.isArray(tx.contact) ? tx.contact[0]?.name : null);
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="px-6 py-4 text-sm">{tx.transaction_date ? formatDate(tx.transaction_date) : '—'}</td>
                      <td className="px-6 py-4 text-sm">{TYPE_LABELS[tx.type] || tx.type}</td>
                      <td className="px-6 py-4 text-sm font-mono">{tx.ref_no || '—'}</td>
                      <td className="px-6 py-4 text-sm max-w-xs truncate">{tx.description || '—'}</td>
                      <td className="px-6 py-4 text-sm">{contactName || '—'}</td>
                      <td className="px-6 py-4 text-sm text-right">{formatCurrency(debit)}</td>
                      <td className="px-6 py-4 text-sm text-right">{formatCurrency(credit)}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(tx.id)}
                          className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600"
                          aria-label="Delete"
                        >
                          <span className="material-icons-outlined text-lg">delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Transaction Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto" aria-modal="true">
          <div className="bg-white dark:bg-slate-custom rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl my-8">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">New Transaction</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData((d) => ({ ...d, type: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {TRANSACTION_TYPES.map((t) => (
                      <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.transaction_date}
                    onChange={(e) => setFormData((d) => ({ ...d, transaction_date: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ref No</label>
                  <input
                    type="text"
                    value={formData.ref_no}
                    onChange={(e) => setFormData((d) => ({ ...d, ref_no: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contact</label>
                  <select
                    value={formData.contact_id}
                    onChange={(e) => setFormData((d) => ({ ...d, contact_id: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="">—</option>
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData((d) => ({ ...d, description: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="Optional"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Lines</label>
                  <button type="button" onClick={addLine} className="text-sm text-primary hover:underline">+ Add line</button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {lines.map((line, i) => (
                    <div key={i} className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <select
                        value={line.account_id}
                        onChange={(e) => updateLine(i, 'account_id', e.target.value)}
                        className="flex-1 min-w-[120px] px-3 py-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                      >
                        <option value="">Account</option>
                        {accounts.map((a) => (
                          <option key={a.id} value={a.id}>{a.code} {a.name}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={line.debit || ''}
                        onChange={(e) => updateLine(i, 'debit', e.target.value)}
                        placeholder="Debit"
                        className="w-24 px-3 py-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                      />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={line.credit || ''}
                        onChange={(e) => updateLine(i, 'credit', e.target.value)}
                        placeholder="Credit"
                        className="w-24 px-3 py-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                      />
                      <button type="button" onClick={() => removeLine(i)} className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded" aria-label="Remove line">
                        <span className="material-icons-outlined text-lg">close</span>
                      </button>
                    </div>
                  ))}
                </div>
                <p className={`text-sm mt-2 ${isBalanced ? 'text-slate-500' : 'text-amber-600'}`}>
                  Total Debit: {formatCurrency(totalDebit)} | Total Credit: {formatCurrency(totalCredit)}
                  {!isBalanced && ' — Must be equal'}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  Cancel
                </button>
                <button type="submit" disabled={!isBalanced} className="px-4 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionsPage;
