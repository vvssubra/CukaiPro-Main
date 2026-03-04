import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { DocLineItemsTable, CustomerSelector } from '../../components/Sales';
import Button from '../../components/Common/Button';
import { useInvoices } from '../../hooks/useInvoices';
import { formatCurrency, formatDate } from '../../utils/validators';

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

function NewCreditNoteModal({
  isOpen,
  onClose,
  onCreateSuccess,
  createCreditNote,
  getNextRefNo,
  contacts,
  onAddCompany,
}) {
  const modalRef = useRef(null);
  const [refNo, setRefNo] = useState('');
  const [lines, setLines] = useState([defaultLine()]);
  const [contactId, setContactId] = useState(null);
  const [invoiceId, setInvoiceId] = useState('');
  const [creditNoteDate, setCreditNoteDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const { invoices } = useInvoices();

  const total = lines.reduce((sum, l) => sum + (Number(l.subtotal) || 0), 0);

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
      setSubmitError('');
      setLines([defaultLine()]);
      setContactId(null);
      setInvoiceId('');
      setCreditNoteDate(new Date().toISOString().slice(0, 10));
      if (typeof getNextRefNo === 'function') {
        getNextRefNo().then((next) => setRefNo(next || 'CN-000001')).catch(() => setRefNo('CN-000001'));
      } else {
        setRefNo('CN-000001');
      }
    }
  }, [isOpen, getNextRefNo]);

  const resetForm = useCallback(() => {
    setSubmitError('');
    setLines([defaultLine()]);
    setContactId(null);
    setInvoiceId('');
    setCreditNoteDate(new Date().toISOString().slice(0, 10));
    if (typeof getNextRefNo === 'function') {
      getNextRefNo().then((next) => setRefNo(next || 'CN-000001')).catch(() => setRefNo('CN-000001'));
    }
  }, [getNextRefNo]);

  const buildPayload = useCallback(() => {
    const lineRows = lines.map((line) => ({
      product_code: line.product_code ?? null,
      product_variant: line.product_variant ?? null,
      unit: line.unit ?? null,
      type: line.type ?? null,
      doc_no: line.doc_no ?? null,
      description: line.description ?? null,
      qty: Number(line.qty) || 0,
      unit_price: Number(line.unit_price) || 0,
      discount_pct: Number(line.discount_pct) || 0,
      discount_amount: Number(line.discount_amount) || 0,
      subtotal: Number(line.subtotal) || 0,
    }));
    return {
      credit_note_date: creditNoteDate,
      contact_id: contactId || null,
      invoice_id: invoiceId || null,
      status: 'unapplied',
      total: Math.round(total * 100) / 100,
      lines: lineRows,
    };
  }, [creditNoteDate, contactId, invoiceId, lines, total]);

  const doCreate = useCallback(async () => {
    setSubmitError('');
    const payload = buildPayload();
    const result = await createCreditNote(payload);
    if (result?.success) {
      onCreateSuccess?.();
      return true;
    }
    setSubmitError(result?.error || 'Failed to create credit note.');
    return false;
  }, [createCreditNote, buildPayload, onCreateSuccess]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const ok = await doCreate();
      if (ok) onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleProceed = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const ok = await doCreate();
      if (ok) resetForm();
    } finally {
      setSaving(false);
    }
  };

  const handleNewCreditNote = (e) => {
    e.preventDefault();
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-credit-note-title"
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 id="new-credit-note-title" className="text-xl font-bold text-slate-900 dark:text-white">
            New Credit Note [{refNo}] {formatCurrency(Number(total) || 0)}
          </h2>
        </div>

        <form className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Credit note date
            </label>
            <input
              type="date"
              value={creditNoteDate}
              onChange={(e) => setCreditNoteDate(e.target.value)}
              className="w-full max-w-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              aria-label="Credit note date"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Customer
            </label>
            <CustomerSelector
              contacts={contacts}
              value={contactId}
              onChange={setContactId}
              onAddCompany={onAddCompany}
              placeholder="Select customer"
              disabled={false}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Link to invoice (optional)
            </label>
            <select
              value={invoiceId}
              onChange={(e) => setInvoiceId(e.target.value)}
              className="w-full max-w-md px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              aria-label="Link to invoice"
            >
              <option value="">— No invoice —</option>
              {(invoices || []).map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.client_name || 'Invoice'} – {inv.invoice_date ? formatDate(inv.invoice_date) : inv.id?.slice(0, 8)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Line items
            </label>
            <DocLineItemsTable lines={lines} onChange={setLines} total={total} readOnly={false} />
          </div>

          {submitError && (
            <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
          )}

          <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button type="button" variant="primary" onClick={handleProceed} loading={saving} disabled={saving}>
              Proceed
            </Button>
            <Button type="button" variant="outline" onClick={handleNewCreditNote} disabled={saving}>
              New Credit Note
            </Button>
            <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleSave} loading={saving} disabled={saving}>
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

NewCreditNoteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreateSuccess: PropTypes.func,
  createCreditNote: PropTypes.func.isRequired,
  getNextRefNo: PropTypes.func,
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
  onAddCompany: PropTypes.func.isRequired,
};

export default NewCreditNoteModal;
