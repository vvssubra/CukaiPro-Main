import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useContacts } from '../../hooks/useContacts';
import Button from '../../components/Common/Button';
import Input from '../../components/Common/Input';

/**
 * Page to add a new company/client (contact type customer).
 * Created clients appear in ClientSelector across Invoices, Quotations, Credit Notes.
 */
export default function AddClientPage() {
  const { createContact, loading, error } = useContacts();
  const [name, setName] = useState('');
  const [tin, setTin] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setSubmitError('Company/Client name must be at least 2 characters.');
      return;
    }
    const trimmedTin = (tin || '').trim();
    if (trimmedTin && trimmedTin.length !== 14) {
      setSubmitError('TIN must be 14 digits if provided.');
      return;
    }

    const result = await createContact({
      name: trimmedName,
      type: 'customer',
      tin: trimmedTin || null,
      email: (email || '').trim() || null,
      phone: (phone || '').trim() || null,
    });

    if (result.success) {
      setSuccess(true);
      setName('');
      setTin('');
      setEmail('');
      setPhone('');
    } else {
      setSubmitError(result.error || 'Failed to add client.');
    }
  };

  if (success) {
    return (
      <div className="container-fluid flex-grow-1 container-p-y">
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Add company/client</h1>
        <div className="mt-6 p-6 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl max-w-md">
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            Client added successfully. You can select them when creating invoices, quotations, or credit notes.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setSuccess(false)}
            >
              Add another
            </Button>
            <Link to="/dashboard/sales/invoices">
              <Button type="button" className="bg-primary text-white hover:bg-primary/90">
                Go to Invoices
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid flex-grow-1 container-p-y">
      <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Add company/client</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-400 mb-6">
        Add a client or company so you can select them when creating invoices, quotations, or credit notes.
      </p>

      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        {(error || submitError) && (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-300">{submitError || error}</p>
          </div>
        )}

        <Input
          label="Company / Client name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. TechMaju Sdn Bhd"
          required
          fullWidth
        />
        <Input
          label="TIN (14 digits)"
          value={tin}
          onChange={(e) => setTin(e.target.value.replace(/\D/g, '').slice(0, 14))}
          placeholder="12345678901234"
          maxLength={14}
          fullWidth
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="billing@company.com"
          fullWidth
        />
        <Input
          label="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Optional"
          fullWidth
        />

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={loading} disabled={loading}>
            Add client
          </Button>
          <Link to="/dashboard/sales/quotation">
            <Button type="button" variant="secondary">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
