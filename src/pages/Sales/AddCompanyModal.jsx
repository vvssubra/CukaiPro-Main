import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '../../components/Common/Button';

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none';

/**
 * Add Company modal: General + Others tabs. Saves to contacts (type=customer).
 * TIN/tax fields for LHDN/RMCD; Tax Code for SST classification.
 * Used from Quotation and Invoice flows via CustomerSelector "Add new company".
 */
function AddCompanyModal({ isOpen, onClose, onSave, onSuccess }) {
  const modalRef = useRef(null);
  const [activeTab, setActiveTab] = useState('general');
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    company_name: '',
    alternate_name: '',
    registration_no: '',
    tax_registration_no: '',
    tax_entity: '',
    tax_exemption_no: '',
    tax_exemption_expiry: '',
    billing_address: '',
    billing_postcode: '',
    delivery_address: '',
    delivery_postcode: '',
    area: '',
    phone: '',
    phone_2: '',
    fax: '',
    fax_2: '',
    email: '',
    website: '',
    attention: '',
    business_nature: '',
    agent: '',
    currency: 'MYR',
    credit_term: '',
    tax_code: '',
  });

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
      setForm({
        name: '',
        company_name: '',
        alternate_name: '',
        registration_no: '',
        tax_registration_no: '',
        tax_entity: '',
        tax_exemption_no: '',
        tax_exemption_expiry: '',
        billing_address: '',
        billing_postcode: '',
        delivery_address: '',
        delivery_postcode: '',
        area: '',
        phone: '',
        phone_2: '',
        fax: '',
        fax_2: '',
        email: '',
        website: '',
        attention: '',
        business_nature: '',
        agent: '',
        currency: 'MYR',
        credit_term: '',
        tax_code: '',
      });
      setSubmitError('');
      setActiveTab('general');
    }
  }, [isOpen]);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const copyBillingToDelivery = () => {
    setForm((prev) => ({
      ...prev,
      delivery_address: prev.billing_address || prev.delivery_address,
      delivery_postcode: prev.billing_postcode || prev.delivery_postcode,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const displayName = (form.company_name || form.name || '').trim() || (form.email || 'Company').trim();
    if (!displayName) {
      setSubmitError('Company name or name is required.');
      return;
    }
    setSaving(true);
    setSubmitError('');
    try {
      const result = await onSave({
        name: displayName,
        type: 'customer',
        tin: form.tax_registration_no || null,
        company_name: form.company_name || null,
        alternate_name: form.alternate_name || null,
        registration_no: form.registration_no || null,
        tax_registration_no: form.tax_registration_no || null,
        tax_entity: form.tax_entity || null,
        tax_exemption_no: form.tax_exemption_no || null,
        tax_exemption_expiry: form.tax_exemption_expiry || null,
        billing_address: form.billing_address || null,
        billing_postcode: form.billing_postcode || null,
        delivery_address: form.delivery_address || null,
        delivery_postcode: form.delivery_postcode || null,
        area: form.area || null,
        phone: form.phone || null,
        phone_2: form.phone_2 || null,
        fax: form.fax || null,
        fax_2: form.fax_2 || null,
        email: form.email || null,
        website: form.website || null,
        attention: form.attention || null,
        business_nature: form.business_nature || null,
        agent: form.agent || null,
        currency: form.currency || null,
        credit_term: form.credit_term || null,
        tax_code: form.tax_code || null,
      });
      if (result && result.success) {
        if (onSuccess) onSuccess(result.data);
        onClose();
      } else {
        setSubmitError(result?.error || 'Failed to save company.');
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-company-title"
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 id="add-company-title" className="text-xl font-bold text-slate-900 dark:text-white">
            Add new company
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            TIN and tax fields for LHDN/RMCD compliance.
          </p>
        </div>

        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-4 py-3 text-sm font-medium ${activeTab === 'general' ? 'border-b-2 border-primary text-primary' : 'text-slate-600 dark:text-slate-400'}`}
          >
            General
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('others')}
            className={`px-4 py-3 text-sm font-medium ${activeTab === 'others' ? 'border-b-2 border-primary text-primary' : 'text-slate-600 dark:text-slate-400'}`}
          >
            Others
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4">
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company Name *</label>
                <input
                  type="text"
                  value={form.company_name}
                  onChange={(e) => update('company_name', e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Acme Sdn Bhd"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Alternate Company Name</label>
                <input
                  type="text"
                  value={form.alternate_name}
                  onChange={(e) => update('alternate_name', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Registration No.</label>
                <input
                  type="text"
                  value={form.registration_no}
                  onChange={(e) => update('registration_no', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tax Registration No. / TIN</label>
                <input
                  type="text"
                  value={form.tax_registration_no}
                  onChange={(e) => update('tax_registration_no', e.target.value)}
                  className={inputClass}
                  placeholder="14 digits for LHDN"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tax Entity</label>
                <input
                  type="text"
                  value={form.tax_entity}
                  onChange={(e) => update('tax_entity', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tax Exemption No.</label>
                <input
                  type="text"
                  value={form.tax_exemption_no}
                  onChange={(e) => update('tax_exemption_no', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tax Exemption Expiry Date</label>
                <input
                  type="text"
                  value={form.tax_exemption_expiry}
                  onChange={(e) => update('tax_exemption_expiry', e.target.value)}
                  className={inputClass}
                  placeholder="DD/MM/YYYY"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Billing Address</label>
                <textarea
                  value={form.billing_address}
                  onChange={(e) => update('billing_address', e.target.value)}
                  className={`${inputClass} resize-none`}
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Billing Postcode</label>
                <input
                  type="text"
                  value={form.billing_postcode}
                  onChange={(e) => update('billing_postcode', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="flex items-end">
                <Button type="button" variant="outline" size="sm" onClick={copyBillingToDelivery}>
                  Copy from Billing
                </Button>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Delivery Address</label>
                <textarea
                  value={form.delivery_address}
                  onChange={(e) => update('delivery_address', e.target.value)}
                  className={`${inputClass} resize-none`}
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Delivery Postcode</label>
                <input
                  type="text"
                  value={form.delivery_postcode}
                  onChange={(e) => update('delivery_postcode', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Area</label>
                <input
                  type="text"
                  value={form.area}
                  onChange={(e) => update('area', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone 2</label>
                <input
                  type="text"
                  value={form.phone_2}
                  onChange={(e) => update('phone_2', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fax</label>
                <input
                  type="text"
                  value={form.fax}
                  onChange={(e) => update('fax', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fax 2</label>
                <input
                  type="text"
                  value={form.fax_2}
                  onChange={(e) => update('fax_2', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Website</label>
                <input
                  type="text"
                  value={form.website}
                  onChange={(e) => update('website', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Attention</label>
                <input
                  type="text"
                  value={form.attention}
                  onChange={(e) => update('attention', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Business Nature</label>
                <input
                  type="text"
                  value={form.business_nature}
                  onChange={(e) => update('business_nature', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {activeTab === 'others' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Agent</label>
                <input
                  type="text"
                  value={form.agent}
                  onChange={(e) => update('agent', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Currency</label>
                <select
                  value={form.currency}
                  onChange={(e) => update('currency', e.target.value)}
                  className={inputClass}
                >
                  <option value="MYR">MYR</option>
                  <option value="USD">USD</option>
                  <option value="SGD">SGD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Credit Term</label>
                <input
                  type="text"
                  value={form.credit_term}
                  onChange={(e) => update('credit_term', e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Net 30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tax Code (SST)</label>
                <input
                  type="text"
                  value={form.tax_code}
                  onChange={(e) => update('tax_code', e.target.value)}
                  className={inputClass}
                  placeholder="Taxable / Exempt"
                />
              </div>
            </div>
          )}

          {submitError && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">{submitError}</p>
          )}

          <div className="flex gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={saving} disabled={saving} className="flex-1">
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

AddCompanyModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

export default AddCompanyModal;
