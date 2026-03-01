import { useState, useCallback, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAccounts } from '../../hooks/useAccounts';
import { formatCurrency } from '../../utils/validators';
import Loading from '../../components/Common/Loading';
import EmptyState from '../../components/Common/EmptyState';

const ACCOUNT_TYPES = [
  { value: 'asset', label: 'Asset' },
  { value: 'liability', label: 'Liability' },
  { value: 'equity', label: 'Equity' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'expense', label: 'Expense' },
];

function ChartOfAccountsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { accounts, loading, error, fetchAccounts, createAccount, updateAccount, deleteAccount } = useAccounts();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', type: 'asset', opening_balance: 0, parent_id: '' });
  const [formError, setFormError] = useState('');
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [bankAccountHint, setBankAccountHint] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (searchParams.get('focus') === 'bank') {
      setSearchParams({}, { replace: true });
      setFormData({ name: '', code: '', type: 'asset', opening_balance: 0, parent_id: '' });
      setFormError('');
      setEditingAccount(null);
      setBankAccountHint(true);
      setModalOpen(true);
    }
  }, [searchParams, setSearchParams]);

  const resetForm = useCallback(() => {
    setFormData({ name: '', code: '', type: 'asset', opening_balance: 0, parent_id: '' });
    setFormError('');
    setEditingAccount(null);
  }, []);

  const handleOpenNew = useCallback(() => {
    resetForm();
    setBankAccountHint(false);
    setModalOpen(true);
  }, [resetForm]);

  const handleOpenEdit = useCallback((account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name || '',
      code: account.code || '',
      type: account.type || 'asset',
      opening_balance: Number(account.opening_balance) || 0,
      parent_id: account.parent_id || '',
    });
    setFormError('');
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setBankAccountHint(false);
    resetForm();
  }, [resetForm]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setFormError('');
      if (!formData.name.trim()) {
        setFormError('Account name is required');
        return;
      }
      if (!formData.code.trim()) {
        setFormError('Account code is required');
        return;
      }
      const codeExists = accounts.some(
        (a) => a.code === formData.code.trim() && a.id !== editingAccount?.id
      );
      if (codeExists) {
        setFormError('Account code must be unique');
        return;
      }

      if (editingAccount) {
        const result = await updateAccount(editingAccount.id, {
          name: formData.name.trim(),
          code: formData.code.trim(),
          type: formData.type,
          opening_balance: formData.opening_balance,
          parent_id: formData.parent_id || null,
        });
        if (result.success) handleCloseModal();
        else setFormError(result.error || 'Update failed');
      } else {
        const result = await createAccount({
          name: formData.name.trim(),
          code: formData.code.trim(),
          type: formData.type,
          opening_balance: formData.opening_balance,
          parent_id: formData.parent_id || null,
        });
        if (result.success) handleCloseModal();
        else setFormError(result.error || 'Create failed');
      }
    },
    [formData, editingAccount, accounts, createAccount, updateAccount, handleCloseModal]
  );

  const handleImportFile = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImportText(reader.result || '');
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  const handleImportSubmit = useCallback(async () => {
    setImportError('');
    const lines = importText.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length === 0) {
      setImportError('Paste or upload a CSV with columns: name, code, type');
      return;
    }
    const header = (lines[0] || '').toLowerCase();
    const hasHeader = header.includes('name') && (header.includes('code') || header.includes('type'));
    const dataLines = hasHeader ? lines.slice(1) : lines;
    let created = 0;
    for (const line of dataLines) {
      const parts = line.split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
      const name = parts[0];
      const code = parts[1] || String(created + 1);
      const type = (parts[2] || 'asset').toLowerCase();
      const validType = ACCOUNT_TYPES.some((t) => t.value === type) ? type : 'asset';
      if (!name) continue;
      const result = await createAccount({ name, code, type: validType });
      if (result.success) created += 1;
    }
    setImportOpen(false);
    setImportText('');
    fetchAccounts();
  }, [importText, createAccount, fetchAccounts]);

  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm('Delete this account? This may fail if it has transactions.')) return;
      await deleteAccount(id);
    },
    [deleteAccount]
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Chart of Accounts</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage your accounts for double-entry bookkeeping.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => { setImportOpen(true); setImportError(''); setImportText(''); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-custom text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800/30"
          >
            <span className="material-icons-outlined text-lg">upload_file</span>
            Import Accounts
          </button>
          <button
            type="button"
            onClick={handleOpenNew}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90"
          >
            <span className="material-icons-outlined text-lg">add</span>
            New Account
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {loading && !accounts.length && (
        <div className="flex justify-center py-16">
          <Loading size="lg" text="Loading accounts..." />
        </div>
      )}

      {!loading && accounts.length === 0 && (
        <EmptyState
          icon="account_balance"
          title="No accounts yet"
          description="Create your first account or import from CSV (name, code, type)."
          primaryAction={{ label: 'New Account', onClick: handleOpenNew, icon: 'add' }}
        />
      )}

      {accounts.length > 0 && (
        <div className="bg-white dark:bg-slate-custom rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">Code</th>
                  <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">Account Name</th>
                  <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">Type</th>
                  <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 text-right">Opening Balance</th>
                  <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {accounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-mono text-sm">{acc.code}</td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{acc.name}</td>
                    <td className="px-6 py-4 text-sm capitalize text-slate-600 dark:text-slate-300">{acc.type}</td>
                    <td className="px-6 py-4 text-sm text-right">{formatCurrency(Number(acc.opening_balance) || 0)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(acc)}
                        className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                        aria-label="Edit"
                      >
                        <span className="material-icons-outlined text-lg">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(acc.id)}
                        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600"
                        aria-label="Delete"
                      >
                        <span className="material-icons-outlined text-lg">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New/Edit Account Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" aria-modal="true">
          <div className="bg-white dark:bg-slate-custom rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-md">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingAccount ? 'Edit Account' : 'New Account'}
              </h2>
              {bankAccountHint && !editingAccount && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Include &quot;bank&quot; in the name so it appears in Bank Reconciliation.</p>
              )}
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Account Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((d) => ({ ...d, name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder={bankAccountHint ? 'e.g. Maybank Current Account' : 'e.g. Cash'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Account Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData((d) => ({ ...d, code: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="e.g. 1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData((d) => ({ ...d, type: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {ACCOUNT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Opening Balance (RM)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.opening_balance}
                  onChange={(e) => setFormData((d) => ({ ...d, opening_balance: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90"
                >
                  {editingAccount ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" aria-modal="true">
          <div className="bg-white dark:bg-slate-custom rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-lg">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Import Accounts</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">CSV with columns: name, code, type (asset, liability, equity, revenue, expense)</p>
            </div>
            <div className="p-6 space-y-4">
              {importError && <p className="text-sm text-red-600 dark:text-red-400">{importError}</p>}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={handleImportFile}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Choose CSV file
              </button>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Or paste CSV here (name, code, type)"
                rows={6}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm"
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setImportOpen(false); setImportText(''); setImportError(''); }}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImportSubmit}
                  className="px-4 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90"
                >
                  Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChartOfAccountsPage;
