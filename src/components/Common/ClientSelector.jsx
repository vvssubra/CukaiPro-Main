import PropTypes from 'prop-types';
import { useContacts } from '../../hooks/useContacts';

const ADD_NEW_VALUE = '__add_new__';

/**
 * Reusable client/company selector: dropdown of existing customers plus "Add new client" with name and TIN fields.
 * Use wherever a client or company name is required (invoices, quotations, credit notes).
 *
 * @param {string} value - Selected contact id, or ADD_NEW_VALUE when in "add new" mode, or '' when none
 * @param {string} clientName - Client name (for display when contact selected, or for "new" mode)
 * @param {string} tin - TIN (for display when contact selected, or for "new" mode)
 * @param {function} onChange - Called with { contactId, clientName, tin, isNewClient }
 * @param {string} [error] - Error message to show
 * @param {boolean} [required] - Show required indicator
 */
function ClientSelector({ value, clientName, tin, onChange, error, required = true }) {
  const { contacts, loading } = useContacts({ type: 'customer' });
  const isNewClient = value === ADD_NEW_VALUE;

  const handleSelectChange = (e) => {
    const v = e.target.value;
    if (v === ADD_NEW_VALUE) {
      onChange({ contactId: null, clientName: '', tin: '', isNewClient: true });
      return;
    }
    if (v === '') {
      onChange({ contactId: null, clientName: '', tin: '', isNewClient: false });
      return;
    }
    const contact = contacts.find((c) => c.id === v);
    if (contact) {
      onChange({
        contactId: contact.id,
        clientName: contact.name || '',
        tin: contact.tin || contact.tax_registration_no || '',
        isNewClient: false,
      });
    }
  };

  const handleNewNameChange = (e) => {
    onChange({ contactId: null, clientName: e.target.value.trim(), tin: tin || '', isNewClient: true });
  };

  const handleNewTinChange = (e) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 14);
    onChange({ contactId: null, clientName: clientName || '', tin: v, isNewClient: true });
  };

  const displayValue = value || '';

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Client / Company {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-custom/40 pointer-events-none">
          <span className="material-icons-outlined text-[20px]">person</span>
        </span>
        <select
          value={displayValue}
          onChange={handleSelectChange}
          disabled={loading}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-background-dark border border-slate-custom/10 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-sm text-slate-custom dark:text-white disabled:opacity-60"
          aria-label="Select client or add new"
        >
          <option value="">— Select client —</option>
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {c.tin ? ` (${c.tin})` : ''}
            </option>
          ))}
          <option value={ADD_NEW_VALUE}>+ Add new client</option>
        </select>
      </div>

      {isNewClient && (
        <div className="grid grid-cols-1 gap-3 pl-0">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-custom/40">
              <span className="material-icons-outlined text-[20px]">badge</span>
            </span>
            <input
              type="text"
              value={clientName || ''}
              onChange={handleNewNameChange}
              placeholder="Company / Client name"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-background-dark border border-slate-custom/10 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-sm text-slate-custom dark:text-white"
              aria-label="Client name"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-custom/40">
              <span className="material-icons-outlined text-[20px]">badge</span>
            </span>
            <input
              type="text"
              value={tin || ''}
              onChange={handleNewTinChange}
              placeholder="TIN (14 digits)"
              maxLength={14}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-background-dark border border-slate-custom/10 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-sm text-slate-custom dark:text-white"
              aria-label="TIN"
            />
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

ClientSelector.propTypes = {
  value: PropTypes.string,
  clientName: PropTypes.string,
  tin: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  required: PropTypes.bool,
};

export default ClientSelector;
export { ADD_NEW_VALUE };
