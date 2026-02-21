import { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { formatCurrency, formatDate } from '../../utils/validators';
import Button from '../../components/Common/Button';

/**
 * Modal to view receipt and deduction details.
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {object|null} deduction - Deduction with receipt_url, category_name, amount, deduction_date, description
 */
function ViewReceiptModal({ isOpen, onClose, deduction }) {
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

  if (!isOpen || !deduction) return null;

  const receiptUrl = deduction.receipt_url || '';
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(deduction.receipt_filename || '') || (receiptUrl && !receiptUrl.toLowerCase().includes('.pdf'));
  const dateStr = deduction.deduction_date
    ? (/^\d{2}\/\d{2}\/\d{4}$/.test(deduction.deduction_date) ? deduction.deduction_date : formatDate(deduction.deduction_date))
    : '—';

  const handleDownload = () => {
    if (receiptUrl) {
      const a = document.createElement('a');
      a.href = receiptUrl;
      a.download = deduction.receipt_filename || 'receipt';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.click();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="view-receipt-title">
      <div
        ref={modalRef}
        className="bg-white dark:bg-slate-custom border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 id="view-receipt-title" className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Receipt & Deduction Details
          </h2>

          {receiptUrl ? (
            <div className="mb-6 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800/50">
              {isImage ? (
                <img src={receiptUrl} alt="Receipt" className="w-full max-h-80 object-contain" />
              ) : (
                <div className="p-8 text-center">
                  <span className="material-icons text-6xl text-slate-400">picture_as_pdf</span>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">PDF receipt</p>
                  <a href={receiptUrl} target="_blank" rel="noopener noreferrer" className="text-primary dark:text-emerald-400 text-sm font-medium hover:underline mt-2 inline-block">
                    Open in new tab
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="mb-6 p-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-center text-slate-500 dark:text-slate-400">
              No receipt uploaded
            </div>
          )}

          <dl className="space-y-2 text-sm">
            <div>
              <dt className="font-semibold text-slate-500 dark:text-slate-400">Category</dt>
              <dd className="text-slate-900 dark:text-white">{deduction.category_name || '—'}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500 dark:text-slate-400">Amount</dt>
              <dd className="text-slate-900 dark:text-white">{formatCurrency(Number(deduction.amount) || 0)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500 dark:text-slate-400">Date</dt>
              <dd className="text-slate-900 dark:text-white">{dateStr}</dd>
            </div>
            {deduction.description && (
              <div>
                <dt className="font-semibold text-slate-500 dark:text-slate-400">Description</dt>
                <dd className="text-slate-900 dark:text-white">{deduction.description}</dd>
              </div>
            )}
          </dl>

          <div className="flex gap-3 mt-6">
            {receiptUrl && (
              <Button type="button" onClick={handleDownload} className="flex-1 bg-primary text-white hover:bg-primary/90">
                Download
              </Button>
            )}
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

ViewReceiptModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  deduction: PropTypes.shape({
    receipt_url: PropTypes.string,
    receipt_filename: PropTypes.string,
    category_name: PropTypes.string,
    amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    deduction_date: PropTypes.string,
    description: PropTypes.string,
  }),
};

export default ViewReceiptModal;
