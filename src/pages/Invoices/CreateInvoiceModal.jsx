import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PropTypes from 'prop-types';
import { invoiceSchema } from '../../utils/validators';
import Button from '../../components/Common/Button';
import ClientSelector, { ADD_NEW_VALUE } from '../../components/Common/ClientSelector';
import { useContacts } from '../../hooks/useContacts';

/**
 * Modal for creating a new invoice. Uses react-hook-form with zod validation.
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onClose - Callback when modal should close (e.g. backdrop click)
 * @param {function} onCreateInvoice - Async function (data) => Promise<{ success, data?, error? }>
 * @param {function} onSuccess - Callback after successful creation (e.g. close modal)
 */
function CreateInvoiceModal({ isOpen, onClose, onCreateInvoice, onSuccess }) {
  const [submitError, setSubmitError] = useState('');
  const [clientValue, setClientValue] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientTin, setClientTin] = useState('');
  const modalRef = useRef(null);
  const { createContact } = useContacts();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      amount: '',
      invoiceDate: '',
      notes: '',
    },
  });

  /** Close when clicking backdrop (outside modal content). */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  /** Close on Escape. */
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

  /** Reset form when modal opens. */
  useEffect(() => {
    if (isOpen) {
      reset();
      queueMicrotask(() => {
        setClientValue('');
        setClientName('');
        setClientTin('');
        setSubmitError('');
      });
    }
  }, [isOpen, reset]);

  const onSubmit = async (data) => {
    setSubmitError('');

    const name = (clientName || '').trim();
    const tinVal = (clientTin || '').trim();

    if (!clientValue || clientValue === '') {
      setSubmitError('Please select a client or add a new one.');
      return;
    }
    if (clientValue === ADD_NEW_VALUE) {
      if (name.length < 2) {
        setSubmitError('Company/Client name must be at least 2 characters.');
        return;
      }
      if (tinVal.length !== 14 || !/^\d{14}$/.test(tinVal)) {
        setSubmitError('TIN must be exactly 14 digits.');
        return;
      }
    }

    try {
      let contactId = clientValue === ADD_NEW_VALUE ? null : clientValue;
      let finalName = name;
      let finalTin = tinVal;

      if (clientValue === ADD_NEW_VALUE) {
        const contactResult = await createContact({
          name,
          tin: tinVal,
          type: 'customer',
        });
        if (!contactResult.success) {
          setSubmitError(contactResult.error || 'Failed to add client.');
          return;
        }
        contactId = contactResult.data.id;
        finalName = name;
        finalTin = tinVal;
      }

      const payload = {
        contact_id: contactId || undefined,
        clientName: finalName,
        tin: finalTin,
        amount: Number(data.amount),
        invoiceDate: data.invoiceDate,
        notes: data.notes || undefined,
      };
      const result = await onCreateInvoice(payload);
      if (result.success) {
        if (onSuccess) onSuccess();
      } else {
        setSubmitError(result.error || 'Failed to create invoice.');
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-invoice-title"
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-background-dark border border-slate-custom/10 dark:border-white/10 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2
            id="create-invoice-title"
            className="text-xl font-bold text-slate-custom dark:text-white mb-1"
          >
            Create New Invoice
          </h2>
          <p className="text-sm text-slate-custom/60 dark:text-slate-custom/40 mb-6">
            Add a new invoice for Malaysian tax compliance.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <ClientSelector
              value={clientValue}
              clientName={clientName}
              tin={clientTin}
              onChange={({ contactId, clientName: n, tin: t, isNewClient }) => {
                setClientValue(isNewClient ? ADD_NEW_VALUE : (contactId || ''));
                setClientName(n || '');
                setClientTin(t || '');
              }}
              error={submitError && (submitError.includes('client') || submitError.includes('TIN')) ? submitError : undefined}
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Amount (MYR) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-custom/40">
                  <span className="material-icons-outlined text-[20px]">payments</span>
                </span>
                <input
                  {...register('amount', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-background-dark border border-slate-custom/10 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-sm text-slate-custom dark:text-white"
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-500">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Invoice Date (DD/MM/YYYY) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-custom/40">
                  <span className="material-icons-outlined text-[20px]">calendar_today</span>
                </span>
                <input
                  {...register('invoiceDate')}
                  type="text"
                  placeholder="31/12/2024"
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-background-dark border border-slate-custom/10 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-sm text-slate-custom dark:text-white"
                />
              </div>
              {errors.invoiceDate && (
                <p className="mt-1 text-sm text-red-500">{errors.invoiceDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Notes
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-custom/40">
                  <span className="material-icons-outlined text-[20px]">notes</span>
                </span>
                <textarea
                  {...register('notes')}
                  placeholder="Optional notes..."
                  rows={3}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-background-dark border border-slate-custom/10 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-sm text-slate-custom dark:text-white resize-none"
                />
              </div>
              {errors.notes && (
                <p className="mt-1 text-sm text-red-500">{errors.notes.message}</p>
              )}
            </div>

            {submitError && !submitError.toLowerCase().includes('client') && !submitError.includes('TIN') && (
              <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={isSubmitting}
                className="flex-1 bg-primary text-white hover:bg-primary/90"
              >
                Create Invoice
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

CreateInvoiceModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreateInvoice: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

export default CreateInvoiceModal;
