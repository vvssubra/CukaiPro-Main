import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTransactions } from '../../hooks/useTransactions';
import { useAccounts } from '../../hooks/useAccounts';
import { useContacts } from '../../hooks/useContacts';
import { formatCurrency, formatDate } from '../../utils/validators';
import Loading from '../../components/Common/Loading';

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
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function JournalPage() {
  const now = new Date();
  const [dateFrom, setDateFrom] = useState(toDateStr(new Date(now.getFullYear(), now.getMonth(), 1)));
  const [dateTo, setDateTo] = useState(toDateStr(now));
  const [refNo, setRefNo] = useState('');
  const [accountId, setAccountId] = useState('');
  const [contactId, setContactId] = useState('');
  const [pageSize, setPageSize] = useState(25);

  const { transactions, loading, error } = useTransactions({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    refNo: refNo || undefined,
    accountId: accountId || undefined,
    contactId: contactId || undefined,
  });
  const { accounts } = useAccounts();
  const { contacts } = useContacts();

  const flatLines = useMemo(() => {
    const out = [];
    (transactions || []).forEach((tx) => {
      (tx.transaction_lines || []).forEach((line) => {
        out.push({
          ...line,
          journal_no: tx.ref_no || tx.id?.slice(0, 8),
          journal_date: tx.transaction_date,
          transaction_type: tx.type,
          account_name: line.account?.name || line.account_id,
        });
      });
    });
    return out;
  }, [transactions]);

  const paginated = useMemo(() => flatLines.slice(0, pageSize), [flatLines, pageSize]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link to="/dashboard/reports" className="text-sm text-primary hover:underline mb-1 inline-block">Reports</Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Journal of Transaction</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Chronological record of all entries</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Date from</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-custom text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Date to</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-custom text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Reference no.</label>
          <input
            type="text"
            value={refNo}
            onChange={(e) => setRefNo(e.target.value)}
            placeholder="Ref No"
            className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-custom text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Account</label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-custom text-slate-900 dark:text-white min-w-[160px]"
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
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Show entries</label>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-custom text-slate-900 dark:text-white"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        <button type="button" className="px-4 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90">
          Search
        </button>
        <button type="button" className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
          Reset
        </button>
        <button type="button" className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
          Export PDF
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
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase">
                <tr>
                  <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700">No.</th>
                  <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700">Journal No</th>
                  <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700">Account</th>
                  <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700">Ref No</th>
                  <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700">Transaction Date</th>
                  <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700 text-right">DR</th>
                  <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700 text-right">CR</th>
                  <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700">Description</th>
                  <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                      No journal entries for the selected filters.
                    </td>
                  </tr>
                ) : (
                  paginated.map((line, i) => (
                    <tr key={`${line.id}-${i}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="px-6 py-3 text-sm">{i + 1}</td>
                      <td className="px-6 py-3 text-sm font-mono">{line.journal_no}</td>
                      <td className="px-6 py-3 text-sm">{line.account?.name || line.account_name || '—'}</td>
                      <td className="px-6 py-3 text-sm font-mono">—</td>
                      <td className="px-6 py-3 text-sm">{line.journal_date ? formatDate(line.journal_date) : '—'}</td>
                      <td className="px-6 py-3 text-sm text-right font-mono">{formatCurrency(line.debit || 0)}</td>
                      <td className="px-6 py-3 text-sm text-right font-mono">{formatCurrency(line.credit || 0)}</td>
                      <td className="px-6 py-3 text-sm">{line.description || '—'}</td>
                      <td className="px-6 py-3">
                        <button type="button" className="text-primary hover:underline text-sm">View</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {flatLines.length > 0 && (
            <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
              Showing 1 to {Math.min(pageSize, flatLines.length)} of {flatLines.length} entries
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default JournalPage;
