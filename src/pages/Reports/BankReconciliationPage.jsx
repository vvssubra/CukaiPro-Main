import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useLedger } from '../../hooks/useLedger';
import { useBankStatementEntries } from '../../hooks/useBankStatementEntries';
import { useAccounts } from '../../hooks/useAccounts';
import { formatCurrency, formatDate } from '../../utils/validators';

function toDateStr(d) {
  if (!d) return '';
  if (typeof d === 'string' && d.length >= 10) return d.slice(0, 10);
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function BankReconciliationPage() {
  const [accountId, setAccountId] = useState('');
  const [statementDate, setStatementDate] = useState(toDateStr(new Date()));
  const [statementEndingBalance, setStatementEndingBalance] = useState('');

  const { accounts, createAccount, fetchAccounts } = useAccounts();
  const bankAccounts = useMemo(
    () => (accounts || []).filter((a) => a.type === 'asset' && (a.name || '').toLowerCase().includes('bank')),
    [accounts]
  );

  const { lines: companyLines, loading: ledgerLoading } = useLedger({
    accountId: accountId || undefined,
    dateTo: statementDate || undefined,
  });

  const {
    entries: statementEntries,
    loading: entriesLoading,
    addEntry,
    reconcileEntry,
    updateEntry,
    fetchEntries,
  } = useBankStatementEntries({
    accountId: accountId || undefined,
    statementDate: statementDate || undefined,
  });

  const loading = ledgerLoading || entriesLoading;

  // Quick-add bank account modal
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddName, setQuickAddName] = useState('');
  const [quickAddCode, setQuickAddCode] = useState('');
  const [quickAddError, setQuickAddError] = useState('');
  const [quickAddSubmitting, setQuickAddSubmitting] = useState(false);

  const handleQuickAddSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setQuickAddError('');
      const name = quickAddName.trim();
      const code = quickAddCode.trim();
      if (!name) {
        setQuickAddError('Account name is required');
        return;
      }
      if (!code) {
        setQuickAddError('Account code is required');
        return;
      }
      if (!name.toLowerCase().includes('bank')) {
        setQuickAddError('Name should contain "bank" so it appears in Bank Reconciliation (e.g. Maybank Current Account).');
        return;
      }
      const codeExists = (accounts || []).some((a) => a.code === code);
      if (codeExists) {
        setQuickAddError('Account code already exists');
        return;
      }
      setQuickAddSubmitting(true);
      const result = await createAccount({
        name,
        code,
        type: 'asset',
        opening_balance: 0,
      });
      setQuickAddSubmitting(false);
      if (result.success) {
        await fetchAccounts();
        setQuickAddOpen(false);
        setQuickAddName('');
        setQuickAddCode('');
        setQuickAddError('');
      } else {
        setQuickAddError(result.error || 'Failed to create account');
      }
    },
    [quickAddName, quickAddCode, accounts, createAccount, fetchAccounts]
  );

  // Add statement entry modal
  const [addEntryOpen, setAddEntryOpen] = useState(false);
  const [addEntryDate, setAddEntryDate] = useState(statementDate || toDateStr(new Date()));
  const [addEntryDesc, setAddEntryDesc] = useState('');
  const [addEntryAmount, setAddEntryAmount] = useState('');
  const [addEntryError, setAddEntryError] = useState('');
  const [addEntrySubmitting, setAddEntrySubmitting] = useState(false);

  const handleAddEntrySubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setAddEntryError('');
      const amount = parseFloat(addEntryAmount);
      if (!addEntryDate) {
        setAddEntryError('Date is required');
        return;
      }
      if (Number.isNaN(amount)) {
        setAddEntryError('Amount is required');
        return;
      }
      setAddEntrySubmitting(true);
      const result = await addEntry({
        account_id: accountId,
        statement_date: addEntryDate,
        description: addEntryDesc.trim() || null,
        amount,
      });
      setAddEntrySubmitting(false);
      if (result.success) {
        setAddEntryOpen(false);
        setAddEntryDesc('');
        setAddEntryAmount('');
        setAddEntryDate(statementDate || toDateStr(new Date()));
      } else {
        setAddEntryError(result.error || 'Failed to add entry');
      }
    },
    [accountId, addEntryDate, addEntryDesc, addEntryAmount, statementDate, addEntry]
  );

  // Match modal: link a statement entry to a company line
  const [matchEntry, setMatchEntry] = useState(null);
  const [matchLineId, setMatchLineId] = useState('');
  const [matchSubmitting, setMatchSubmitting] = useState(false);

  const handleMatchSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!matchEntry || !matchLineId) return;
      setMatchSubmitting(true);
      await reconcileEntry(matchEntry.id, matchLineId);
      setMatchSubmitting(false);
      setMatchEntry(null);
      setMatchLineId('');
    },
    [matchEntry, matchLineId, reconcileEntry]
  );

  const handleToggleReconciled = useCallback(
    async (entry) => {
      await updateEntry(entry.id, {
        reconciled_at: entry.reconciled_at ? null : new Date().toISOString(),
        transaction_line_id: entry.reconciled_at ? null : entry.transaction_line_id,
      });
      fetchEntries();
    },
    [updateEntry, fetchEntries]
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link to="/dashboard/reports" className="text-sm text-primary hover:underline mb-1 inline-block">Reports</Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bank Reconciliation</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Match bank statements with company records</p>
        </div>
      </div>

      <div className="mb-6 p-6 bg-white dark:bg-slate-custom rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Reconciliation setup</h3>
        {bankAccounts.length === 0 && (
          <div className="mb-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
              No bank accounts yet. Add an account with type <strong>Asset</strong> and a name containing &quot;bank&quot; (e.g. Maybank Current Account).
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/dashboard/accounts?focus=bank"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90"
              >
                <span className="material-icons-outlined text-lg">add</span>
                Add bank account (Chart of Accounts)
              </Link>
              <button
                type="button"
                onClick={() => { setQuickAddOpen(true); setQuickAddError(''); setQuickAddName(''); setQuickAddCode(''); }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Or add one here
              </button>
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Bank account</label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white min-w-[220px]"
            >
              <option value="">Select account</option>
              {bankAccounts.map((a) => (
                <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
              ))}
              {bankAccounts.length === 0 && (
                <option value="" disabled>No bank-type accounts</option>
              )}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Statement date</label>
            <input
              type="date"
              value={statementDate}
              onChange={(e) => setStatementDate(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Statement ending balance (RM)</label>
            <input
              type="number"
              step="0.01"
              value={statementEndingBalance}
              onChange={(e) => setStatementEndingBalance(e.target.value)}
              placeholder="0.00"
              className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white w-40"
            />
          </div>
          {bankAccounts.length > 0 && (
            <button type="button" className="px-4 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90">
              Start reconciliation
            </button>
          )}
        </div>
        {bankAccounts.length > 0 && (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            <Link to="/dashboard/accounts?focus=bank" className="text-primary hover:underline">Add another bank account</Link>
          </p>
        )}
      </div>

      {!accountId && (
        <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center text-slate-500 dark:text-slate-400">
          Select a bank account and statement date to view company records and bank statement entries.
        </div>
      )}

      {accountId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-custom rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white">
              Company records
            </div>
            {loading && (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading...</div>
            )}
            {!loading && (
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">Date</th>
                      <th className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">Ref No</th>
                      <th className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">Description</th>
                      <th className="px-4 py-2 border-b border-slate-200 dark:border-slate-700 text-right">Amount (RM)</th>
                      <th className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">Reconciled</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companyLines.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">
                          No transactions in period.
                        </td>
                      </tr>
                    ) : (
                      companyLines.map((line) => (
                        <tr key={line.id} className="border-b border-slate-100 dark:border-slate-700/50">
                          <td className="px-4 py-2">{line.transaction_date ? formatDate(line.transaction_date) : '—'}</td>
                          <td className="px-4 py-2 font-mono">{line.ref_no || '—'}</td>
                          <td className="px-4 py-2">{line.description || line.transaction_description || '—'}</td>
                          <td className="px-4 py-2 text-right font-mono">
                            {(line.debit || 0) - (line.credit || 0) >= 0
                              ? formatCurrency((line.debit || 0) - (line.credit || 0))
                              : `(${formatCurrency((line.credit || 0) - (line.debit || 0))})`}
                          </td>
                          <td className="px-4 py-2">
                            <input type="checkbox" readOnly className="rounded border-slate-300" />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-custom rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white">
              Bank statement entries
            </div>
            {!loading && (
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">Date</th>
                      <th className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">Description</th>
                      <th className="px-4 py-2 border-b border-slate-200 dark:border-slate-700 text-right">Amount (RM)</th>
                      <th className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">Reconciled</th>
                      <th className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">Match</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statementEntries.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">
                          No statement entries. Add bank statement lines to match with company records.
                        </td>
                      </tr>
                    ) : (
                      statementEntries.map((entry) => (
                        <tr key={entry.id} className="border-b border-slate-100 dark:border-slate-700/50">
                          <td className="px-4 py-2">{formatDate(entry.statement_date)}</td>
                          <td className="px-4 py-2">{entry.description || '—'}</td>
                          <td className="px-4 py-2 text-right font-mono">{formatCurrency(entry.amount || 0)}</td>
                          <td className="px-4 py-2">
                            <input
                              type="checkbox"
                              checked={!!entry.reconciled_at}
                              onChange={() => handleToggleReconciled(entry)}
                              className="rounded border-slate-300"
                              aria-label="Mark reconciled"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <button
                              type="button"
                              onClick={() => { setMatchEntry(entry); setMatchLineId(''); }}
                              className="text-xs text-primary hover:underline font-medium"
                            >
                              Link
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setAddEntryOpen(true);
                  setAddEntryDate(statementDate || toDateStr(new Date()));
                  setAddEntryError('');
                  setAddEntryDesc('');
                  setAddEntryAmount('');
                }}
                className="text-sm text-primary hover:underline font-medium"
              >
                + Add statement entry
              </button>
            </div>
          </div>
        </div>
      )}

      {accountId && (
        <div className="mt-6 flex justify-end">
          <button type="button" className="px-6 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90">
            Done
          </button>
        </div>
      )}

      {/* Quick-add bank account modal */}
      {quickAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" aria-modal="true">
          <div className="bg-white dark:bg-slate-custom rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-md">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add bank account</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Create an asset account whose name contains &quot;bank&quot;.</p>
            </div>
            <form onSubmit={handleQuickAddSubmit} className="p-6 space-y-4">
              {quickAddError && <p className="text-sm text-red-600 dark:text-red-400">{quickAddError}</p>}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Account name</label>
                <input
                  type="text"
                  value={quickAddName}
                  onChange={(e) => setQuickAddName(e.target.value)}
                  placeholder="e.g. Maybank Current Account"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Account code</label>
                <input
                  type="text"
                  value={quickAddCode}
                  onChange={(e) => setQuickAddCode(e.target.value)}
                  placeholder="e.g. 1200"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setQuickAddOpen(false); setQuickAddError(''); }} className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" disabled={quickAddSubmitting} className="px-4 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50">{quickAddSubmitting ? 'Creating...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add statement entry modal */}
      {addEntryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" aria-modal="true">
          <div className="bg-white dark:bg-slate-custom rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-md">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add statement entry</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">One line from your bank statement.</p>
            </div>
            <form onSubmit={handleAddEntrySubmit} className="p-6 space-y-4">
              {addEntryError && <p className="text-sm text-red-600 dark:text-red-400">{addEntryError}</p>}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  value={addEntryDate}
                  onChange={(e) => setAddEntryDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  value={addEntryDesc}
                  onChange={(e) => setAddEntryDesc(e.target.value)}
                  placeholder="e.g. Transfer from customer"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount (RM)</label>
                <input
                  type="number"
                  step="0.01"
                  value={addEntryAmount}
                  onChange={(e) => setAddEntryAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setAddEntryOpen(false)} className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" disabled={addEntrySubmitting} className="px-4 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50">{addEntrySubmitting ? 'Adding...' : 'Add entry'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Match statement entry to company line modal */}
      {matchEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" aria-modal="true">
          <div className="bg-white dark:bg-slate-custom rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-lg">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Link to company record</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Statement: {formatDate(matchEntry.statement_date)} — {matchEntry.description || '—'} — {formatCurrency(matchEntry.amount || 0)}
              </p>
            </div>
            <form onSubmit={handleMatchSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company record</label>
                <select
                  value={matchLineId}
                  onChange={(e) => setMatchLineId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select a transaction line</option>
                  {companyLines.map((line) => (
                    <option key={line.id} value={line.id}>
                      {line.transaction_date ? formatDate(line.transaction_date) : '—'} | {line.ref_no || '—'} | {(line.debit || 0) - (line.credit || 0) >= 0 ? formatCurrency((line.debit || 0) - (line.credit || 0)) : `(${formatCurrency((line.credit || 0) - (line.debit || 0))})`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setMatchEntry(null); setMatchLineId(''); }} className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" disabled={matchSubmitting || !matchLineId} className="px-4 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50">{matchSubmitting ? 'Linking...' : 'Link'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BankReconciliationPage;
