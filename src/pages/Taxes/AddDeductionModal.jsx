import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { formatCurrency, formatDate } from '../../utils/validators';
import { TAX_CATEGORIES, CATEGORY_TYPES, getCategoryById, getClaimableLabel } from '../../data/taxCategories';
import Button from '../../components/Common/Button';
import AuditTimeline from '../../components/Common/AuditTimeline';
import { useAuditLog } from '../../hooks/useAuditLog';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPT_FILES = '.pdf,.jpg,.jpeg,.png';

/**
 * Add or edit tax deduction modal.
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {function} onSave - (formData, file?) => Promise<{ success, error? }>
 * @param {object|null} editDeduction - If set, modal is in edit mode
 * @param {number} taxYear
 */
function AddDeductionModal({ isOpen, onClose, onSave, editDeduction, taxYear }) {
  const modalRef = useRef(null);
  const fileInputRef = useRef(null);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [deductionDate, setDeductionDate] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const { entries, loading: historyLoading, error: historyError } = useAuditLog(
    editDeduction ? 'deduction' : null,
    editDeduction?.id ?? null
  );

  const category = getCategoryById(categoryId);
  const amountNum = parseFloat(amount) || 0;
  let claimableAmount = amountNum;
  let claimablePct = 100;
  if (category) {
    if (category.claimable != null) {
      claimablePct = category.claimable;
      claimableAmount = (amountNum * claimablePct) / 100;
    } else if (category.initial != null && category.annual != null) {
      claimablePct = (category.initial || 0) + (category.annual || 0);
      claimableAmount = (amountNum * claimablePct) / 100;
    } else if (category.maxClaim != null) {
      claimableAmount = Math.min(amountNum, category.maxClaim);
      claimablePct = amountNum > 0 ? (claimableAmount / amountNum) * 100 : 0;
    }
  }

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
    if (!isOpen) return;
    if (editDeduction) {
      setCategoryId(editDeduction.category_id || '');
      setAmount(String(editDeduction.amount ?? ''));
      const d = editDeduction.deduction_date;
      setDeductionDate(/^\d{2}\/\d{2}\/\d{4}$/.test(d) ? d : (d ? formatDate(d) : ''));
      setDescription(editDeduction.description || '');
      setStatus(editDeduction.status || 'pending');
      setFile(null);
      setFilePreview(null);
    } else {
      const today = new Date();
      setCategoryId('');
      setAmount('');
      setDeductionDate(`${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`);
      setDescription('');
      setStatus('pending');
      setFile(null);
      setFilePreview(null);
    }
    setSubmitError('');
  }, [isOpen, editDeduction]);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) {
      setFile(null);
      setFilePreview(null);
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setSubmitError('File must be 5MB or less.');
      setFile(null);
      setFilePreview(null);
      e.target.value = '';
      return;
    }
    setFile(f);
    setSubmitError('');
    if (f.type.startsWith('image/')) {
      const url = URL.createObjectURL(f);
      setFilePreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setFilePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!categoryId || !amount || amountNum <= 0) {
      setSubmitError('Please select a category and enter a valid amount.');
      return;
    }
    const dateStr = deductionDate.trim();
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      setSubmitError('Date must be DD/MM/YYYY.');
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = {
        category_id: categoryId,
        amount: amountNum,
        deduction_date: dateStr,
        description: description.trim() || null,
        tax_year: taxYear,
        status,
      };
      const result = await onSave(formData, file || undefined);
      if (result.success) {
        onClose();
      } else {
        setSubmitError(result.error || 'Save failed.');
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="add-deduction-title">
      <div
        ref={modalRef}
        className="bg-white dark:bg-slate-custom border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 id="add-deduction-title" className="text-xl font-bold text-slate-900 dark:text-white mb-1">
            {editDeduction ? 'Edit Tax Deduction' : 'Add Tax Deduction'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            {editDeduction ? 'Update deduction details.' : 'Record a tax-deductible expense.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none"
              >
                <option value="">Select category</option>
                {CATEGORY_TYPES.map((type) => (
                  <optgroup key={type.value} label={type.label}>
                    {TAX_CATEGORIES.filter((c) => c.type === type.value).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} - {getClaimableLabel(c)}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Amount (RM) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Date (DD/MM/YYYY) *</label>
              <input
                type="text"
                placeholder="31/12/2024"
                value={deductionDate}
                onChange={(e) => setDeductionDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Upload Receipt</label>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT_FILES}
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {file ? file.name : 'Choose PDF, JPG or PNG (max 5MB)'}
              </button>
              {filePreview && (
                <img src={filePreview} alt="Preview" className="mt-2 h-24 object-contain rounded border border-slate-200 dark:border-slate-700" />
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none"
              >
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="claimed">Claimed</option>
              </select>
            </div>

            {categoryId && amountNum > 0 && (
              <div className="p-3 rounded-lg bg-primary/10 dark:bg-emerald-500/10 border border-primary/20 dark:border-emerald-500/20">
                <p className="text-sm font-semibold text-primary dark:text-emerald-400">
                  Claimable: {claimablePct}% = {formatCurrency(claimableAmount)}
                </p>
              </div>
            )}

            {editDeduction && (
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <button
                  type="button"
                  onClick={() => setShowHistory((prev) => !prev)}
                  className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-emerald-400"
                >
                  <span className="material-icons text-[18px]">history</span>
                  {showHistory ? 'Hide history' : 'View history'}
                </button>
                {showHistory && (
                  <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <AuditTimeline
                      entries={entries}
                      loading={historyLoading}
                      error={historyError}
                      emptyMessage="No changes recorded yet."
                    />
                  </div>
                )}
              </div>
            )}

            {submitError && <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting} disabled={isSubmitting} className="flex-1 bg-primary text-white hover:bg-primary/90">
                {editDeduction ? 'Update Deduction' : 'Save Deduction'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

AddDeductionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  editDeduction: PropTypes.object,
  taxYear: PropTypes.number.isRequired,
};

export default AddDeductionModal;
