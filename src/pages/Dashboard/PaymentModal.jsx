import { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '../../utils/validators';
import Button from '../../components/Common/Button';

/**
 * Modal for SST payment. Displays total amount and payment method options.
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onClose - Callback when modal should close
 * @param {number} totalAmount - Total SST amount to pay
 */
function PaymentModal({ isOpen, onClose, totalAmount }) {
  const modalRef = useRef(null);

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

  const handleProceed = () => {
    console.log('Proceed to payment clicked', { totalAmount });
    alert('Payment integration coming soon. Total: ' + formatCurrency(totalAmount || 0));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-background-dark border border-slate-custom/10 dark:border-white/10 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2
            id="payment-modal-title"
            className="text-xl font-bold text-slate-custom dark:text-white mb-1"
          >
            Pay SST
          </h2>
          <p className="text-sm text-slate-custom/60 dark:text-slate-custom/40 mb-6">
            Complete your SST payment.
          </p>

          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-custom/60 dark:text-white/60 mb-2">
              Total amount due
            </label>
            <p className="text-2xl font-bold text-primary dark:text-emerald-400">
              {formatCurrency(totalAmount || 0)}
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-custom/60 dark:text-white/60 mb-3">
              Payment method
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-custom/10 dark:border-white/10 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <input type="radio" name="paymentMethod" value="card" defaultChecked className="text-primary" />
                <span className="text-sm text-slate-custom dark:text-white">Credit Card</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-custom/10 dark:border-white/10 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <input type="radio" name="paymentMethod" value="banking" className="text-primary" />
                <span className="text-sm text-slate-custom dark:text-white">Online Banking</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-custom/10 dark:border-white/10 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <input type="radio" name="paymentMethod" value="fpx" className="text-primary" />
                <span className="text-sm text-slate-custom dark:text-white">FPX</span>
              </label>
            </div>
          </div>

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
              type="button"
              onClick={handleProceed}
              className="flex-1 bg-primary text-white hover:bg-primary/90"
            >
              Proceed to Payment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

PaymentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  totalAmount: PropTypes.number,
};

export default PaymentModal;
