import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '../../utils/validators';
import DocLineItemsTable from '../../components/Sales/DocLineItemsTable';
import CustomerSelector from '../../components/Sales/CustomerSelector';
import AddCompanyModal from './AddCompanyModal';
import Button from '../../components/Common/Button';

function defaultLine() {
  return {
    id: crypto.randomUUID?.() ?? `line-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    product_code: '',
    product_variant: '',
    unit: '',
    type: '',
    doc_no: '',
    description: '',
    qty: 1,
    unit_price: 0,
    discount_pct: 0,
    discount_amount: 0,
    subtotal: 0,
  };
}

/**
 * New Quotation modal: line items, customer selector, Add Company flow.
 * Header shows dynamic ref_no (from getNextRefNo) and total from line items.
 * Save creates quotation and closes; onSaved() refreshes list.
 */
function NewQuotationModal({
  isOpen,
  onClose,
  createQuotation,
  getNextRefNo,
  contacts,
  createContact,
  fetchContacts,
  onSaved,
}) {
  const [refNo, setRefNo] = useState(null);
  const [lines, setLines] = useState([defaultLine()]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [quotationDate, setQuotationDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [addCompanyOpen, setAddCompanyOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const totalAmount = Math.round(lines.reduce((sum, l) => sum + (Number(l.subtotal) || 0), 0) * 100) / 100;

  const loadNextRef = useCallback(async () => {
    if (!getNextRefNo) return;
    setRefNo(null);
    try {
      const next = await getNextRefNo();
      setRefNo(next || '—');
    } catch {
      setRefNo('—');
    }
  }, [getNextRefNo]);

  useEffect(() => {
    if (isOpen) {
      loadNextRef();
      setLines([defaultLine()]);
      setSelectedContactId(null);
      setQuotationDate(new Date().toISOString().slice(0, 10));
      setAddCompanyOpen(false);
      setError('');
    }
  }, [isOpen, loadNextRef]);

  const handleNewQuotation = () => {
    setLines([defaultLine()]);
    setSelectedContactId(null);
    setQuotationDate(new Date().toISOString().slice(0, 10));
    setError('');
    loadNextRef();
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const result = await createQuotation({
        quotation_date: quotationDate,
        contact_id: selectedContactId || null,
        status: 'pending',
        total: totalAmount,
        lines,
      });
      if (result?.success) {
        if (onSaved) onSaved();
        onClose();
      } else {
        setError(result?.error || 'Failed to save quotation.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCompanySuccess = (data) => {
    if (data?.id) setSelectedContactId(data.id);
    setAddCompanyOpen(false);
    if (fetchContacts) fetchContacts();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-quotation-title"
    >
      <div
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col my-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <h2 id="new-quotation-title" className="text-xl font-bold text-slate-900 dark:text-white">
            New Quotation [{refNo ?? '...'}] Total {formatCurrency(totalAmount)}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Add line items and select a customer. Save to create the quotation.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Quotation Date</label>
            <input
              type="date"
              value={quotationDate}
              onChange={(e) => setQuotationDate(e.target.value)}
              className="w-full max-w-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              aria-label="Quotation date"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Customer</label>
            <CustomerSelector
              contacts={contacts}
              value={selectedContactId}
              onChange={setSelectedContactId}
              onAddCompany={() => setAddCompanyOpen(true)}
              placeholder="Select customer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Line items</label>
            <DocLineItemsTable lines={lines} onChange={setLines} total={totalAmount} readOnly={false} />
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-3 shrink-0">
          <Button type="button" variant="outline" onClick={handleNewQuotation} disabled={saving}>
            New Quotation
          </Button>
          <Button type="button" variant="ghost" disabled={saving} aria-label="Proceed (optional)">
            Proceed
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} loading={saving} disabled={saving}>
            Save
          </Button>
        </div>
      </div>

      <AddCompanyModal
        isOpen={addCompanyOpen}
        onClose={() => setAddCompanyOpen(false)}
        onSave={createContact}
        onSuccess={handleAddCompanySuccess}
      />
    </div>
  );
}

NewQuotationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  createQuotation: PropTypes.func.isRequired,
  getNextRefNo: PropTypes.func.isRequired,
  contacts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string,
      company_name: PropTypes.string,
      email: PropTypes.string,
      type: PropTypes.string,
      tin: PropTypes.string,
    })
  ),
  createContact: PropTypes.func.isRequired,
  fetchContacts: PropTypes.func.isRequired,
  onSaved: PropTypes.func,
};

export default NewQuotationModal;
