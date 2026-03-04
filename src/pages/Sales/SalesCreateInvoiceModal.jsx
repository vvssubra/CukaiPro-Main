import { useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useContacts } from '../../hooks/useContacts';
import { formatCurrency } from '../../utils/validators';
import { DocLineItemsTable, CustomerSelector } from '../../components/Sales';
import AddCompanyModal from './AddCompanyModal';
import Button from '../../components/Common/Button';

const defaultLine = () => ({
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
});

/** Today in DD/MM/YYYY */
function todayStr() {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * New Invoice modal for Sales: line items table, customer selector with Add Company.
 * Save creates invoice with total from lines, clientName from contact or "Walk-in", optional contact_id.
 */
function SalesCreateInvoiceModal({ isOpen, onClose, onCreateInvoice, onSuccess }) {
  const modalRef = useRef(null);
  const { contacts, fetchContacts, createContact } = useContacts({ type: 'customer' });

  const [lines, setLines] = useState(() => [defaultLine()]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [invoiceDate, setInvoiceDate] = useState(todayStr());
  const [addCompanyOpen, setAddCompanyOpen] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);

  const total = lines.reduce((sum, l) => sum + (Number(l.subtotal) || 0), 0);
  const selectedContact = contacts.find((c) => c.id === selectedContactId);
  const clientName = selectedContact
    ? selectedContact.company_name || selectedContact.name || selectedContact.email || '—'
    : 'Walk-in';
  const clientTin = selectedContact?.tin ?? selectedContact?.tax_registration_no ?? '';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isOpen && e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setLines([defaultLine()]);
      setSelectedContactId(null);
      setInvoiceDate(todayStr());
      setSubmitError('');
    }
  }, [isOpen]);

  const handleAddCompany = useCallback(() => setAddCompanyOpen(true), []);
  const handleAddCompanyClose = useCallback(() => setAddCompanyOpen(false), []);
  const handleAddCompanySuccess = useCallback(
    (data) => {
      fetchContacts();
      if (data?.id) setSelectedContactId(data.id);
    },
    [fetchContacts]
  );

  const handleSave = useCallback(async () => {
    const amountRounded = Math.round(total * 100) / 100;
    if (amountRounded <= 0) {
      setSubmitError('Add at least one line item with a positive amount.');
      return;
    }
    setSaving(true);
    setSubmitError('');
    try {
      const result = await onCreateInvoice({
        clientName,
        tin: clientTin || undefined,
        amount: amountRounded,
        invoiceDate,
        notes: undefined,
        contact_id: selectedContactId || undefined,
      });
      if (result.success) {
        if (onSuccess) onSuccess();
      } else {
        setSubmitError(result.error || 'Failed to create invoice.');
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }, [total, clientName, clientTin, invoiceDate, selectedContactId, onCreateInvoice, onSuccess]);

  const handleNewInvoice = useCallback(() => {
    setLines([defaultLine()]);
    setSelectedContactId(null);
    setInvoiceDate(todayStr());
    setSubmitError('');
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sales-new-invoice-title"
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-background-dark border border-slate-custom/10 dark:border-white/10 rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-custom/10 dark:border-white/10">
          <h2 id="sales-new-invoice-title" className="text-xl font-bold text-slate-custom dark:text-white">
            New Invoice [I-NEW] Total {formatCurrency(Number(total) || 0)}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Invoice Date</label>
            <input
              type="text"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              placeholder="DD/MM/YYYY"
              className="w-full max-w-[140px] px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              aria-label="Invoice date"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Customer</label>
            <CustomerSelector
              contacts={contacts}
              value={selectedContactId}
              onChange={setSelectedContactId}
              onAddCompany={handleAddCompany}
              placeholder="Select customer (or Walk-in)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Line items</label>
            <DocLineItemsTable lines={lines} onChange={setLines} total={total} readOnly={false} />
          </div>

          {submitError && (
            <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
          )}
        </div>

        <div className="p-4 border-t border-slate-custom/10 dark:border-white/10 flex flex-wrap items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleSave} loading={saving} disabled={saving}>
            Proceed
          </Button>
          <Button type="button" variant="secondary" onClick={handleNewInvoice}>
            New Invoice
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="primary" onClick={handleSave} loading={saving} disabled={saving}>
            Save
          </Button>
        </div>
      </div>

      <AddCompanyModal
        isOpen={addCompanyOpen}
        onClose={handleAddCompanyClose}
        onSave={createContact}
        onSuccess={handleAddCompanySuccess}
      />
    </div>
  );
}

SalesCreateInvoiceModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreateInvoice: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

export default SalesCreateInvoiceModal;
