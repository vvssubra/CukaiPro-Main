import { useState, useEffect } from 'react';
import { useOrganization } from '../../context/OrganizationContext';
import { useToast } from '../../context/ToastContext';
import {
  getMyInvoisCredentialsStatus,
  saveMyInvoisCredentials,
  deleteMyInvoisCredentials,
  testMyInvoisConnection,
} from '../../services/myinvois';
import ConfirmModal from '../../components/Common/ConfirmModal';

function EInvoicingTab() {
  const { currentOrganization, membershipRole } = useOrganization();
  const toast = useToast();
  const [status, setStatus] = useState({ configured: false, loading: true });
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [sandbox, setSandbox] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState('');

  const isOwnerOrAdmin = membershipRole === 'owner' || membershipRole === 'admin';
  const orgId = currentOrganization?.id;

  const loadStatus = async () => {
    if (!orgId) return;
    setStatus((s) => ({ ...s, loading: true }));
    const result = await getMyInvoisCredentialsStatus(orgId);
    setStatus({
      configured: result.configured,
      sandbox: result.sandbox,
      loading: false,
    });
    if (result.configured && !result.error) {
      setSandbox(Boolean(result.sandbox));
    }
  };

  useEffect(() => {
    loadStatus();
  }, [orgId]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    if (!orgId || !clientId.trim() || !clientSecret.trim()) {
      setError('Client ID and Client Secret are required.');
      return;
    }
    setSaving(true);
    const result = await saveMyInvoisCredentials(orgId, clientId.trim(), clientSecret.trim(), { sandbox });
    setSaving(false);
    if (result.success) {
      toast.success('MyInvois credentials saved. They are stored encrypted and used only to submit e-Invoices to LHDN.');
      setClientId('');
      setClientSecret('');
      setShowForm(false);
      await loadStatus();
    } else {
      setError(result.error || 'Save failed');
      toast.error(result.error);
    }
  };

  const handleTestConnection = async () => {
    if (!orgId) return;
    setError('');
    setTesting(true);
    const result = await testMyInvoisConnection(orgId);
    setTesting(false);
    if (result.success) {
      toast.success(result.message || 'MyInvois connection successful.');
    } else {
      setError(result.error || 'Connection test failed');
      toast.error(result.error);
    }
  };

  const handleRemoveCredentials = async () => {
    if (!orgId) return;
    setRemoving(true);
    const result = await deleteMyInvoisCredentials(orgId);
    setRemoving(false);
    setConfirmRemove(false);
    if (result.success) {
      toast.success('MyInvois credentials removed.');
      await loadStatus();
      setClientId('');
      setClientSecret('');
      setShowForm(false);
    } else {
      toast.error(result.error || 'Failed to remove credentials');
    }
  };

  if (!isOwnerOrAdmin) {
    return (
      <div className="space-y-8">
        <p className="text-slate-500 dark:text-slate-400">
          Only organization owners and admins can manage E-Invoicing credentials.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-custom dark:text-white">E-Invoicing (MyInvois)</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Connect your organization to LHDN MyInvois to submit e-Invoices. Your credentials are stored encrypted and
          used only to submit e-Invoices to LHDN on your behalf.
        </p>
      </div>

      {status.loading ? (
        <p className="text-slate-500 dark:text-slate-400">Loading…</p>
      ) : (
        <>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {status.configured ? (
                  <>
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                      <span className="material-icons-outlined text-green-600 dark:text-green-400 text-lg">check_circle</span>
                    </span>
                    <div>
                      <p className="font-medium text-slate-custom dark:text-white">Connected</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        MyInvois credentials are configured for this organization.
                        {status.sandbox && ' (Sandbox mode)'}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                      <span className="material-icons-outlined text-amber-600 dark:text-amber-400 text-lg">info</span>
                    </span>
                    <div>
                      <p className="font-medium text-slate-custom dark:text-white">Not configured</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Add your MyInvois Client ID and Client Secret to submit e-Invoices.
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {status.configured && (
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testing}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                  >
                    {testing ? 'Testing…' : 'Test connection'}
                  </button>
                )}
                {!showForm ? (
                  <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 text-sm"
                  >
                    {status.configured ? 'Update credentials' : 'Add credentials'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setError(''); }}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                )}
                {status.configured && !showForm && (
                  <button
                    type="button"
                    onClick={() => setConfirmRemove(true)}
                    className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:underline"
                  >
                    Remove credentials
                  </button>
                )}
              </div>
            </div>
          </div>

          {showForm && (
            <form onSubmit={handleSave} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-6 space-y-4 max-w-lg">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Your MyInvois credentials are stored encrypted and used only to submit e-Invoices to LHDN on your behalf.
                Get them from the LHDN MyInvois portal.
              </p>
              <div>
                <label htmlFor="einvoicing-client-id" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Client ID
                </label>
                <input
                  id="einvoicing-client-id"
                  type="password"
                  autoComplete="off"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="Enter Client ID"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-custom dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="einvoicing-client-secret" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Client Secret
                </label>
                <input
                  id="einvoicing-client-secret"
                  type="password"
                  autoComplete="off"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  placeholder="Enter Client Secret"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-custom dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="einvoicing-sandbox"
                  type="checkbox"
                  checked={sandbox}
                  onChange={(e) => setSandbox(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary"
                />
                <label htmlFor="einvoicing-sandbox" className="text-sm text-slate-700 dark:text-slate-300">
                  Use sandbox environment
                </label>
              </div>
              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={saving || !clientId.trim() || !clientSecret.trim()}
                className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save credentials'}
              </button>
            </form>
          )}
        </>
      )}

      <ConfirmModal
        isOpen={confirmRemove}
        onClose={() => setConfirmRemove(false)}
        onConfirm={handleRemoveCredentials}
        title="Remove MyInvois credentials?"
        message="You will need to add them again to submit e-Invoices. Invoices already submitted to LHDN are not affected."
        confirmLabel="Remove"
        cancelLabel="Cancel"
        variant="danger"
        loading={removing}
      />
    </div>
  );
}

export default EInvoicingTab;
