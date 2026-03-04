import { useState, useCallback, useMemo } from 'react';
import { useCreditNotes } from '../../hooks/useCreditNotes';
import { useContacts } from '../../hooks/useContacts';
import { SummaryCards } from '../../components/Sales';
import Button from '../../components/Common/Button';
import NewCreditNoteModal from './NewCreditNoteModal';
import AddCompanyModal from './AddCompanyModal';
import { formatCurrency, formatDate } from '../../utils/validators';

const SUMMARY_CARDS = [
  { statusKey: 'unapplied', label: 'Unapplied' },
  { statusKey: 'partially_applied', label: 'Partially Applied' },
  { statusKey: 'fully_applied', label: 'Fully Applied' },
];

function CreditNoteListPage() {
  const [period, setPeriod] = useState('365');
  const [showNewModal, setShowNewModal] = useState(false);
  const [showAddCompany, setShowAddCompany] = useState(false);

  const {
    creditNotes,
    loading,
    error,
    summary365,
    summary12Months,
    fetchCreditNotes,
    createCreditNote,
    deleteCreditNote,
    getNextRefNo,
  } = useCreditNotes();

  const { contacts, fetchContacts, createContact } = useContacts({ type: 'customer' });

  const summary = period === '365' ? summary365 : summary12Months;

  const contactMap = useMemo(() => {
    const m = {};
    (contacts || []).forEach((c) => {
      m[c.id] = c.company_name || c.name || c.email || '—';
    });
    return m;
  }, [contacts]);

  const handleAddCompanySave = useCallback(
    async (payload) => createContact(payload),
    [createContact]
  );

  const handleAddCompanySuccess = useCallback(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleCreateSuccess = useCallback(() => {
    fetchCreditNotes();
    setShowNewModal(false);
  }, [fetchCreditNotes]);

  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm('Delete this credit note? This cannot be undone.')) return;
      const result = await deleteCreditNote(id);
      if (result?.success) fetchCreditNotes();
    },
    [deleteCreditNote, fetchCreditNotes]
  );

  return (
    <div className="container-fluid flex-grow-1 container-p-y">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
            Sales / Credit Note
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Returns or adjustments to the invoice.
          </p>
        </div>
        <Button type="button" onClick={() => setShowNewModal(true)}>
          New Credit Note
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      <SummaryCards
        title="Summary"
        period={period}
        onPeriodChange={setPeriod}
        summary={summary}
        cards={SUMMARY_CARDS}
      />

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800">
        {loading ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading…</div>
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
                  <th className="px-4 py-3 w-24" aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {creditNotes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                      No credit notes. Click &quot;New Credit Note&quot; to create one.
                    </td>
                  </tr>
                ) : (
                  creditNotes.map((cn) => (
                    <tr
                      key={cn.id}
                      className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                        {cn.ref_no}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {cn.credit_note_date ? formatDate(cn.credit_note_date) : '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {contactMap[cn.contact_id] ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-900 dark:text-white">
                        {formatCurrency(Number(cn.total) || 0)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="capitalize text-slate-600 dark:text-slate-300">
                          {(cn.status || 'unapplied').replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleDelete(cn.id)}
                          className="text-red-600 dark:text-red-400 hover:underline text-sm"
                          aria-label="Delete credit note"
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

      <NewCreditNoteModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onCreateSuccess={handleCreateSuccess}
        createCreditNote={createCreditNote}
        getNextRefNo={getNextRefNo}
        contacts={contacts}
        onAddCompany={() => setShowAddCompany(true)}
      />

      <AddCompanyModal
        isOpen={showAddCompany}
        onClose={() => setShowAddCompany(false)}
        onSave={handleAddCompanySave}
        onSuccess={handleAddCompanySuccess}
      />
    </div>
  );
}

export default CreditNoteListPage;
