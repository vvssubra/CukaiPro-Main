import { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '../../components/Common/Button';

/**
 * Modal for Tax Expert Support with contact options.
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onClose - Callback when modal should close
 */
function SupportChatModal({ isOpen, onClose }) {
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-background-dark border border-slate-custom/10 dark:border-white/10 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2
            id="support-modal-title"
            className="text-xl font-bold text-slate-custom dark:text-white mb-1"
          >
            Tax Expert Support
          </h2>
          <p className="text-sm text-slate-custom/60 dark:text-slate-custom/40 mb-6">
            Our tax experts are here to help!
          </p>

          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-custom/10 dark:border-white/10">
              <span className="material-icons-outlined text-slate-custom/60 dark:text-white/60">email</span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-custom/60 dark:text-white/60">Email</p>
                <a href="mailto:support@cukaipro.com" className="text-sm font-medium text-primary dark:text-emerald-400 hover:underline">
                  support@cukaipro.com
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-custom/10 dark:border-white/10">
              <span className="material-icons-outlined text-slate-custom/60 dark:text-white/60">phone</span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-custom/60 dark:text-white/60">Phone</p>
                <a href="tel:1-800-CUKAI-PRO" className="text-sm font-medium text-primary dark:text-emerald-400 hover:underline">
                  1-800-CUKAI-PRO
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-custom/10 dark:border-white/10">
              <span className="material-icons-outlined text-slate-custom/60 dark:text-white/60">chat</span>
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-custom/60 dark:text-white/60">Live Chat</p>
                  <p className="text-sm text-slate-custom dark:text-white">Coming soon</p>
                </div>
                <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="w-full"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

SupportChatModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SupportChatModal;
