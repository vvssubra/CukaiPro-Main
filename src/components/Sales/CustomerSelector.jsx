import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import Button from '../Common/Button';

/**
 * Searchable customer selector (from contacts type=customer).
 * "Add new company" button invokes onAddCompany; parent opens Add Company modal.
 */
function CustomerSelector({ contacts, value, onChange, onAddCompany, placeholder = 'Select customer', disabled = false }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const customerList = useMemo(() => {
    const list = (contacts || []).filter((c) => (c.type || '').toLowerCase() === 'customer');
    if (!search.trim()) return list;
    const s = search.toLowerCase();
    return list.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(s)) ||
        (c.company_name && c.company_name.toLowerCase().includes(s)) ||
        (c.email && c.email.toLowerCase().includes(s))
    );
  }, [contacts, search]);

  const selectedContact = useMemo(
    () => (contacts || []).find((c) => c.id === value),
    [contacts, value]
  );

  const displayLabel = selectedContact
    ? selectedContact.company_name || selectedContact.name || selectedContact.email || '—'
    : placeholder;

  return (
    <div className="relative">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => !disabled && setOpen(!open)}
          className="flex-1 text-left rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label="Select customer"
        >
          {displayLabel}
        </button>
        <Button type="button" variant="outline" size="md" onClick={onAddCompany} disabled={disabled}>
          Add new company
        </Button>
      </div>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute z-20 mt-1 w-full min-w-[280px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg max-h-60 overflow-hidden flex flex-col"
            role="listbox"
          >
            <div className="p-2 border-b border-slate-200 dark:border-slate-700">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customer..."
                className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm"
                autoFocus
                aria-label="Search customer"
              />
            </div>
            <ul className="overflow-y-auto p-1">
              <li>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm"
                  onClick={() => {
                    onChange(null);
                    setOpen(false);
                  }}
                >
                  — No customer —
                </button>
              </li>
              {customerList.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                      value === c.id
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                    onClick={() => {
                      onChange(c.id);
                      setOpen(false);
                    }}
                    role="option"
                    aria-selected={value === c.id}
                  >
                    {c.company_name || c.name || c.email || '—'}
                    {c.tin && (
                      <span className="ml-2 text-slate-500 dark:text-slate-400 text-xs">TIN: {c.tin}</span>
                    )}
                  </button>
                </li>
              ))}
              {customerList.length === 0 && (
                <li className="px-3 py-4 text-sm text-slate-500 dark:text-slate-400 text-center">
                  No customers found. Use &quot;Add new company&quot; to create one.
                </li>
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

CustomerSelector.propTypes = {
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
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onAddCompany: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
};

export default CustomerSelector;
