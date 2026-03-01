import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLedger } from '../../hooks/useLedger';
import { useAccounts } from '../../hooks/useAccounts';
import { useContacts } from '../../hooks/useContacts';
import { formatCurrency, formatDate } from '../../utils/validators';
import Loading from '../../components/Common/Loading';

const LEDGER_TYPES = [
  { value: 'general', label: 'General Ledger' },
  { value: 'sales', label: 'Sales Ledger' },
  { value: 'purchase', label: 'Purchase Ledger' },
];

function toDateStr(d) {
  if (!d) return '';
  if (typeof d === 'string' && d.length >= 10) return d.slice(0, 10);
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function LedgerPage() {
  const now = new Date();
  const [ledgerType, setLedgerType] = useState('general');
  const [dateFrom, setDateFrom] = useState(toDateStr(new Date(now.getFullYear(), now.getMonth(), 1)));
  const [dateTo, setDateTo] = useState(toDateStr(now));
  const [accountId, setAccountId] = useState('');
  const [contactId, setContactId] = useState('');
  const [showZeroOnly, setShowZeroOnly] = useState(false);

  const { accounts } = useAccounts();
  const { contacts } = useContacts();

  const accountIds = useMemo(() => {
    if (accountId) return [accountId];
    if (ledgerType === 'sales') {
      return (accounts || []).filter((a) => a.type === 'asset' && (a.name || '').toLowerCase().includes('receivable')).map((a) => a.id);
    }
    if (ledgerType === 'purchase') {
      return (accounts || []).filter((a) => a.type === 'liability' && (a.name || '').toLowerCase().includes('payable')).map((a) => a.id);
    }
    return (accounts || []).map((a) => a.id);
  }, [accounts, accountId, ledgerType]);

  const { lines, openingBalance, closingBalance, loading, error, fetchLedger } = useLedger({
    accountIds: accountIds.length ? accountIds : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    contactId: contactId || undefined,
  });

  const filteredLines = useMemo(() => {
    if (!showZeroOnly) return lines;
    return lines.filter((l) => Math.abs(l.balance || 0) < 0.01);
  }, [lines, showZeroOnly]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link to="/dashboard/reports" className="text-sm text-primary hover:underline mb-1 inline-block">Reports</Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Ledger</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">General, Sales and Purchase ledger</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Report type</label>
          <select
            value={ledgerType}
            onChange={(e) => setLedgerType(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-custom text-slate-900 dark:text-white"
          >
            {LEDGER_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-custom text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-custom text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Account</label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-custom text-slate-900 dark:text-white min-w-[180px]"
          >
            <option value="">All</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Contact</label>
          <select
            value={contactId}
            onChange={(e) => setContactId(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-custom text-slate-900 dark:text-white min-w-[160px]"
          >
            <option value="">All</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showZeroOnly}
            onChange={(e) => setShowZeroOnly(e.target.checked)}
            className="rounded border-slate-300 text-primary"
          />
          <span className="text-sm text-slate-700 dark:text-slate-300">Show only zero balance</span>
        </label>
        <button type="button" onClick={() => fetchLedger()} className="px-4 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90">
          Run Report
        </button>
        <button type="button" className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
          Export Excel
        </button>
        <button type="button" className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
          Print
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <Loading size="lg" text="Loading..." />
        </div>
      )}

      {!loading && (
        <div className="bg-white dark:bg-slate-custom rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Opening: {formatCurrency(openingBalance)} | Closing: {formatCurrency(closingBalance)}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase">
                <tr>
                  <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700">Date</th>
                  <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700">Ref No</th>
                  <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700">Description</th>
                  <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700">Contact</th>
                  <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700 text-right">Debit</th>
                  <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700 text-right">Credit</th>
                  <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredLines.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                      No ledger lines for the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredLines.map((line) => (
                    <tr key={line.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="px-6 py-3 text-sm">{line.transaction_date ? formatDate(line.transaction_date) : '—'}</td>
                      <td className="px-6 py-3 text-sm font-mono">{line.ref_no || '—'}</td>
                      <td className="px-6 py-3 text-sm">{line.description || line.transaction_description || '—'}</td>
                      <td className="px-6 py-3 text-sm">{line.contact_name || '—'}</td>
                      <td className="px-6 py-3 text-sm text-right font-mono">{formatCurrency(line.debit || 0)}</td>
                      <td className="px-6 py-3 text-sm text-right font-mono">{formatCurrency(line.credit || 0)}</td>
                      <td className="px-6 py-3 text-sm text-right font-mono">{formatCurrency(line.balance ?? 0)}</td>
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

export default LedgerPage;
