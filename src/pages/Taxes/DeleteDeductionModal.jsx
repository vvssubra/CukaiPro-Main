import { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '../../utils/validators';
import Button from '../../components/Common/Button';

/**
 * Confirmation modal for deleting a deduction.
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {function} onConfirm - () => Promise<void>
 * @param {object|null} deduction - { category_name, amount, deduction_date }
 * @param {boolean} isDeleting
 */
function DeleteDeductionModal({ isOpen, onClose, onConfirm, deduction, isDeleting }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const dateStr = deduction?.deduction_date
    ? (/^\d{2}\/\d{2}\/\d{4}$/.test(deduction.deduction_date) ? deduction.deduction_date : deduction.deduction_date)
    : '—';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="delete-deduction-title">
      <div
        ref={modalRef}
        className="bg-white dark:bg-slate-custom border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-w-sm w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="delete-deduction-title" className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Delete this deduction?
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          This will remove the deduction and any uploaded receipt. This action cannot be undone.
        </p>
        {deduction && (
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-sm mb-6">
            <p><span className="font-semibold text-slate-500 dark:text-slate-400">Category:</span> {deduction.category_name || '—'}</p>
            <p><span className="font-semibold text-slate-500 dark:text-slate-400">Amount:</span> {formatCurrency(Number(deduction.amount) || 0)}</p>
            <p><span className="font-semibold text-slate-500 dark:text-slate-400">Date:</span> {dateStr}</p>
          </div>
        )}
        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1" disabled={isDeleting}>
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm} loading={isDeleting} disabled={isDeleting} className="flex-1">
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

DeleteDeductionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  deduction: PropTypes.object,
  isDeleting: PropTypes.bool,
};

export default DeleteDeductionModal;
