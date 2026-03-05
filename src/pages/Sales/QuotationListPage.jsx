import { useState, useMemo } from 'react';
import { useQuotations } from '../../hooks/useQuotations';
import { useContacts } from '../../hooks/useContacts';
import { formatCurrency, formatDate } from '../../utils/validators';
import SummaryCards from '../../components/Sales/SummaryCards';
import Button from '../../components/Common/Button';
import NewQuotationModal from './NewQuotationModal';

const SUMMARY_CARDS = [
  { statusKey: 'pending', label: 'Pending' },
  { statusKey: 'lost', label: 'Lost' },
  { statusKey: 'success', label: 'Success' },
];

function QuotationListPage() {
  const [period, setPeriod] = useState('365');
  const [newModalOpen, setNewModalOpen] = useState(false);

  const {
    quotations,
    loading,
    error,
    summary365,
    summary12Months,
    fetchQuotations,
    createQuotation,
    deleteQuotation,
    getNextRefNo,
  } = useQuotations();

  const { contacts, createContact, fetchContacts } = useContacts({ type: 'customer' });

  const summary = period === '365' ? summary365 : summary12Months;

  const contactById = useMemo(() => {
    const map = {};
    (contacts || []).forEach((c) => {
      map[c.id] = c.company_name || c.name || c.email || '—';
    });
    return map;
  }, [contacts]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this quotation?')) return;
    const result = await deleteQuotation(id);
    if (!result?.success) {
       
      alert(result?.error || 'Failed to delete');
    }
  };

  return (
    <div className="container-fluid flex-grow-1 container-p-y">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Sales / Quotation</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            An estimated price for products or services provided to your customer.
          </p>
        </div>
        <Button type="button" onClick={() => setNewModalOpen(true)}>
          New
        </Button>
      </div>

      <SummaryCards
        period={period}
        onPeriodChange={setPeriod}
        summary={summary}
        cards={SUMMARY_CARDS}
        title="Summary"
      />

      {error && (
        <p className="mb-4 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading quotations…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-left">
                  <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">Ref No</th>
                  <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">Date</th>
                  <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">Customer</th>
                  <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300 text-right">Total</th>
                  <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">Status</th>
                  <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300 w-24 text-right" aria-label="Actions">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {quotations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                      No quotations yet. Click &quot;New&quot; to create one.
                    </td>
                  </tr>
                ) : (
                  quotations.map((q) => (
                    <tr
                      key={q.id}
                      className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-4 py-3 font-mono text-slate-900 dark:text-white">{q.ref_no || '—'}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        {q.quotation_date ? formatDate(q.quotation_date) : '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        {q.contact_id ? contactById[q.contact_id] ?? '—' : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-900 dark:text-white">
                        {formatCurrency(Number(q.total) || 0)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex capitalize rounded-full px-2 py-0.5 text-xs font-medium ${
                            (q.status || '').toLowerCase() === 'success'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : (q.status || '').toLowerCase() === 'lost'
                                ? 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}
                        >
                          {q.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(q.id)}
                          className="text-red-600 dark:text-red-400 hover:underline text-sm"
                          aria-label={`Delete ${q.ref_no}`}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <NewQuotationModal
        isOpen={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        createQuotation={createQuotation}
        getNextRefNo={getNextRefNo}
        contacts={contacts}
        createContact={createContact}
        fetchContacts={fetchContacts}
        onSaved={fetchQuotations}
      />
    </div>
  );
}

export default QuotationListPage;
