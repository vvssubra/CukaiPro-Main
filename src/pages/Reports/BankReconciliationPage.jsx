import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLedger } from '../../../hooks/useLedger';
import { useBankStatementEntries } from '../../../hooks/useBankStatementEntries';
import { useAccounts } from '../../../hooks/useAccounts';
import { formatCurrency, formatDate } from '../../../utils/validators';
import Loading from '../../../components/Common/Loading';

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

  const { accounts } = useAccounts();
  const bankAccounts = useMemo(
    () => (accounts || []).filter((a) => a.type === 'asset' && (a.name || '').toLowerCase().includes('bank')),
    [accounts]
  );

  const { lines: companyLines, loading: ledgerLoading } = useLedger({
    accountId: accountId || undefined,
    dateTo: statementDate || undefined,
  });

  const { entries: statementEntries, loading: entriesLoading, addEntry, reconcileEntry } = useBankStatementEntries({
    accountId: accountId || undefined,
    statementDate: statementDate || undefined,
  });

  const loading = ledgerLoading || entriesLoading;

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
                <option value="" disabled>No bank-type accounts (add an account with type Asset and name containing &quot;bank&quot;)</option>
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
          <button type="button" className="px-4 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90">
            Start reconciliation
          </button>
        </div>
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
                    </tr>
                  </thead>
                  <tbody>
                    {statementEntries.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">
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
                              readOnly
                              className="rounded border-slate-300"
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
              <button type="button" className="text-sm text-primary hover:underline font-medium">
                + Add statement entry
              </button>
            </div>
          </div>
        </div>
      )}

      {accountId && (
        <div className="mt-6 flex justify-end">
          <button type="button" className="px-6 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90">
            Reconcile
          </button>
        </div>
      )}
    </div>
  );
}

export default BankReconciliationPage;
