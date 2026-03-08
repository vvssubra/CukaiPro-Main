import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useOrganization } from '../../context/OrganizationContext';
import { useToast } from '../../context/ToastContext';
import { useTeamMembers } from '../../hooks/useTeamMembers';
import { useInvitations } from '../../hooks/useInvitations';
import { useSubscription } from '../../hooks/useSubscription';
import { supabase } from '../../lib/supabase';
import BillingTab from './BillingTab';
import EInvoicingTab from './EInvoicingTab';
import ConfirmModal from '../../components/Common/ConfirmModal';

const ROLE_LABELS = {
  owner: 'Owner',
  admin: 'Admin',
  accountant: 'Accountant',
  staff: 'Staff',
};

function TeamTab() {
  const { currentOrganization, canInviteMembers } = useOrganization();
  const { canAddMember: canAddMemberByPlan, memberLimitReached } = useSubscription();
  const toast = useToast();
  const { members, loading, error, fetchMembers, removeMember, canRemoveMembers, canChangeRoles, updateMemberRole } = useTeamMembers();
  const { invitations, fetchInvitations, sendInvitation, sendInviteEmail, cancelInvitation, canInviteMembers: canInv } = useInvitations();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('staff');
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [sendingEmailFor, setSendingEmailFor] = useState(null);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    fetchMembers();
    fetchInvitations();
  }, [fetchMembers, fetchInvitations]);

  const handleSendInvite = async (e) => {
    e.preventDefault();
    setInviteError('');
    setInviteSuccess('');
    if (!inviteEmail.trim()) return;

    setInviteSending(true);
    const result = await sendInvitation(inviteEmail.trim(), inviteRole);
    setInviteSending(false);

    if (result.success) {
      const token = result.data?.token ?? result.token ?? '';
      const invId = result.data?.id;
      const emailAddr = inviteEmail.trim();

      // Try to send invite email via Edge Function
      const emailResult = await sendInviteEmail({
        invitationId: invId,
        email: emailAddr,
        token,
        orgName: currentOrganization?.business_name,
        role: inviteRole,
      });

      if (emailResult.success) {
        setInviteSuccess(`Invite sent via email to ${emailAddr}.`);
        toast.success(`Invitation email sent to ${emailAddr}`);
      } else {
        setInviteSuccess(`Invitation created. Share link: ${window.location.origin}/invite/${token}`);
        toast.success(`Invitation created — copy the link to share with ${emailAddr}`);
      }
      setInviteEmail('');
    } else {
      const err = result.error || 'Failed to send invitation';
      setInviteError(err);
      toast.error(err);
    }
  };

  const handleSendInviteEmail = async (inv) => {
    if (!inv.token || !inv.email) return;
    setSendingEmailFor(inv.id);
    const result = await sendInviteEmail({
      invitationId: inv.id,
      email: inv.email,
      token: inv.token,
      orgName: currentOrganization?.business_name,
      role: inv.role,
    });
    setSendingEmailFor(null);
    if (result.success) {
      toast.success(`Invite email sent to ${inv.email}`);
      fetchInvitations();
    } else {
      toast.error(result.error || 'Failed to send email');
    }
  };

  const handleRemoveMember = (memberId, memberName) => {
    setMemberToRemove({ id: memberId, fullName: memberName });
  };

  const handleConfirmRemoveMember = async () => {
    if (!memberToRemove) return;
    setRemoving(true);
    await removeMember(memberToRemove.id);
    setRemoving(false);
    setMemberToRemove(null);
    toast.success(`${memberToRemove.fullName} has been removed from the team.`);
  };

  const handleCancelInvite = async (invId) => {
    await cancelInvitation(invId);
  };

  const canAddByPlan = canAddMemberByPlan(members.length);
  const atMemberLimit = memberLimitReached(members.length);
  const showInviteForm = (canInviteMembers || canInv) && canAddByPlan;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-custom dark:text-white">Team members</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage who has access to {currentOrganization?.business_name || 'your organization'}.
        </p>
      </div>

      {atMemberLimit && (
        <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            You&apos;ve reached the member limit for your plan. Upgrade in Billing to add more team members.
          </p>
        </div>
      )}
      {showInviteForm && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-6">
          <h3 className="text-lg font-semibold text-slate-custom dark:text-white mb-4">Invite team member</h3>
          <form onSubmit={handleSendInvite} className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="invite-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email address
              </label>
              <input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder=" colleague@company.com"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-custom dark:text-white"
                required
              />
            </div>
            <div className="w-40">
              <label htmlFor="invite-role" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Role
              </label>
              <select
                id="invite-role"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-custom dark:text-white"
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
                <option value="accountant">Accountant</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={inviteSending}
              className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {inviteSending ? 'Sending…' : 'Send invite'}
            </button>
          </form>
          {inviteError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{inviteError}</p>}
          {inviteSuccess && <p className="mt-2 text-sm text-green-600 dark:text-green-400 break-all">{inviteSuccess}</p>}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-slate-500 dark:text-slate-400">Loading members…</div>
      ) : (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Status</th>
                {(canRemoveMembers || canChangeRoles) && <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {members.map((m) => (
                <tr key={m.id} className="bg-white dark:bg-slate-800/30">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-custom dark:text-white">{m.fullName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{m.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    {canChangeRoles && m.role !== 'owner' ? (
                      <select
                        value={m.role}
                        onChange={(e) => {
                          const newRole = e.target.value;
                          updateMemberRole(m.id, newRole).then((res) => {
                            if (res.success) toast.success(`Role updated to ${ROLE_LABELS[newRole] || newRole}`);
                            else toast.error(res.error);
                          });
                        }}
                        className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-custom dark:text-white px-2 py-1"
                      >
                        <option value="admin">Admin</option>
                        <option value="accountant">Accountant</option>
                        <option value="staff">Staff</option>
                      </select>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                        {ROLE_LABELS[m.role] || m.role}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">Active</td>
                  {(canRemoveMembers || canChangeRoles) && (
                    <td className="px-4 py-3 text-right">
                      {m.role !== 'owner' && canRemoveMembers && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(m.id, m.fullName)}
                          className="text-sm text-red-600 dark:text-red-400 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {invitations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-custom dark:text-white mb-3">Pending invitations</h3>
          <div className="space-y-2">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2 px-4 rounded-lg bg-slate-50 dark:bg-slate-800/50"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <span className="text-slate-custom dark:text-white">{inv.email}</span>
                  <span className="text-sm text-slate-500">{ROLE_LABELS[inv.role] || inv.role}</span>
                  {inv.email_sent_at ? (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                      <span className="material-icons-outlined text-sm">mail</span>
                      Invite sent via email
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  {showInviteForm && !inv.email_sent_at && (
                    <button
                      type="button"
                      onClick={() => handleSendInviteEmail(inv)}
                      disabled={sendingEmailFor === inv.id}
                      className="text-sm text-primary hover:underline disabled:opacity-50"
                    >
                      {sendingEmailFor === inv.id ? 'Sending…' : 'Send invite email'}
                    </button>
                  )}
                  {showInviteForm && (
                    <button
                      type="button"
                      onClick={() => handleCancelInvite(inv.id)}
                      className="text-sm text-red-600 dark:text-red-400 hover:underline"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleConfirmRemoveMember}
        title="Remove team member?"
        message={memberToRemove ? `Remove ${memberToRemove.fullName} from the team? They will lose access to this organization.` : ''}
        confirmLabel="Remove"
        cancelLabel="Cancel"
        variant="danger"
        loading={removing}
      />
    </div>
  );
}

function OrganizationTab() {
  const { currentOrganization, canAccessSettings, reloadOrganizations } = useOrganization();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    business_name: '',
    lhdn_status: '',
    lhdn_tin_no: '',
    company_email: '',
  });

  useEffect(() => {
    if (currentOrganization) {
      setForm({
        business_name: currentOrganization.business_name || '',
        lhdn_status: currentOrganization.lhdn_status || '',
        lhdn_tin_no: currentOrganization.lhdn_tin_no || '',
        company_email: currentOrganization.company_email || '',
      });
    }
  }, [currentOrganization]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentOrganization?.id || !canAccessSettings) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          business_name: form.business_name.trim() || null,
          lhdn_status: form.lhdn_status.trim() || null,
          lhdn_tin_no: form.lhdn_tin_no.trim() || null,
          company_email: form.company_email.trim() || null,
        })
        .eq('id', currentOrganization.id);

      if (error) throw error;
      await reloadOrganizations();
      setEditing(false);
      toast.success('Organization updated.');
    } catch (err) {
      toast.error(err?.message || 'Failed to update organization.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-custom dark:text-white">Organization</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Basic information and company details for LHDN e-Invoicing.
        </p>
      </div>
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-6 max-w-md">
        {editing && canAccessSettings ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="org-business_name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Business name</label>
              <input
                id="org-business_name"
                type="text"
                value={form.business_name}
                onChange={(e) => setForm((f) => ({ ...f, business_name: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-custom dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="org-lhdn_tin_no" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">LHDN TIN no.</label>
              <input
                id="org-lhdn_tin_no"
                type="text"
                value={form.lhdn_tin_no}
                onChange={(e) => setForm((f) => ({ ...f, lhdn_tin_no: e.target.value }))}
                placeholder="e.g. C12345678901234"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-custom dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="org-company_email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company email</label>
              <input
                id="org-company_email"
                type="email"
                value={form.company_email}
                onChange={(e) => setForm((f) => ({ ...f, company_email: e.target.value }))}
                placeholder="billing@company.com"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-custom dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="org-lhdn_status" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">LHDN status</label>
              <input
                id="org-lhdn_status"
                type="text"
                value={form.lhdn_status}
                onChange={(e) => setForm((f) => ({ ...f, lhdn_status: e.target.value }))}
                placeholder="e.g. registered"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-custom dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                disabled={saving}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Business name</dt>
                <dd className="mt-1 text-slate-custom dark:text-white">{currentOrganization?.business_name || '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">LHDN TIN no.</dt>
                <dd className="mt-1 text-slate-custom dark:text-white">{currentOrganization?.lhdn_tin_no || '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Company email</dt>
                <dd className="mt-1 text-slate-custom dark:text-white">{currentOrganization?.company_email || '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">LHDN status</dt>
                <dd className="mt-1 text-slate-custom dark:text-white">{currentOrganization?.lhdn_status || '—'}</dd>
              </div>
            </dl>
            {canAccessSettings && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="mt-4 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium"
              >
                Edit organization
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { canAccessSettings } = useOrganization();
  const tabFromUrl = searchParams.get('tab');
  const tabParam = tabFromUrl === 'billing' || searchParams.get('billing')
    ? 'billing'
    : tabFromUrl === 'einvoicing'
      ? 'einvoicing'
      : tabFromUrl;
  const [activeTab, setActiveTab] = useState(tabParam || 'team');

  useEffect(() => {
    if (!canAccessSettings) {
      navigate('/dashboard', { replace: true });
      return;
    }
  }, [canAccessSettings, navigate]);

  useEffect(() => {
    if (tabParam === 'billing') queueMicrotask(() => setActiveTab('billing'));
    if (tabParam === 'einvoicing') queueMicrotask(() => setActiveTab('einvoicing'));
  }, [tabParam]);

  if (!canAccessSettings) {
    return null;
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-custom dark:text-white mb-8">Settings</h1>
          <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700 mb-8">
            <button
              type="button"
              onClick={() => setActiveTab('team')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'team'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-custom dark:hover:text-white'
              }`}
            >
              Team
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('organization')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'organization'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-custom dark:hover:text-white'
              }`}
            >
              Organization
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('einvoicing')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'einvoicing'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-custom dark:hover:text-white'
              }`}
            >
              E-Invoicing
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('billing')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'billing'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-custom dark:hover:text-white'
              }`}
            >
              Billing
            </button>
          </div>
          {activeTab === 'billing' && <BillingTab />}
          {activeTab === 'einvoicing' && <EInvoicingTab />}
          {activeTab === 'team' && <TeamTab />}
          {activeTab === 'organization' && <OrganizationTab />}
    </div>
  );
}
