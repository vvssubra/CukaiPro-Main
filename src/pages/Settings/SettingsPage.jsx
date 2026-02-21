import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { useOrganization } from '../../context/OrganizationContext';
import { useToast } from '../../context/ToastContext';
import { useTeamMembers } from '../../hooks/useTeamMembers';
import { useInvitations } from '../../hooks/useInvitations';

const ROLE_LABELS = {
  owner: 'Owner',
  admin: 'Admin',
  accountant: 'Accountant',
  staff: 'Staff',
};

function TeamTab() {
  const { currentOrganization, membershipRole, canInviteMembers } = useOrganization();
  const toast = useToast();
  const { members, loading, error, fetchMembers, removeMember, canRemoveMembers, canChangeRoles } = useTeamMembers();
  const { invitations, loading: invLoading, fetchInvitations, sendInvitation, cancelInvitation, canInviteMembers: canInv } = useInvitations();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('staff');
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

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
      const msg = token ? `Invitation sent to ${inviteEmail}. Share: ${window.location.origin}/invite/${token}` : `Invitation sent to ${inviteEmail}.`;
      setInviteSuccess(msg);
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
    } else {
      const err = result.error || 'Failed to send invitation';
      setInviteError(err);
      toast.error(err);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Remove ${memberName} from the team?`)) return;
    await removeMember(memberId);
  };

  const handleCancelInvite = async (invId) => {
    await cancelInvitation(invId);
  };

  const showInviteForm = canInviteMembers || canInv;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-custom dark:text-white">Team members</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage who has access to {currentOrganization?.business_name || 'your organization'}.
        </p>
      </div>

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
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Status</th>
                {canRemoveMembers && <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Actions</th>}
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
                    <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                      {ROLE_LABELS[m.role] || m.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">Active</td>
                  {canRemoveMembers && (
                    <td className="px-4 py-3 text-right">
                      {m.role !== 'owner' && (
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
                className="flex items-center justify-between py-2 px-4 rounded-lg bg-slate-50 dark:bg-slate-800/50"
              >
                <span className="text-slate-custom dark:text-white">{inv.email}</span>
                <span className="text-sm text-slate-500">{ROLE_LABELS[inv.role] || inv.role}</span>
                {showInviteForm && (
                  <button
                    type="button"
                    onClick={() => handleCancelInvite(inv.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Cancel
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OrganizationTab() {
  const { currentOrganization } = useOrganization();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-custom dark:text-white">Organization</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Basic information about your organization.
        </p>
      </div>
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-6 max-w-md">
        <dl className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Business name</dt>
            <dd className="mt-1 text-slate-custom dark:text-white">{currentOrganization?.business_name || '—'}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('team');

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
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
          </div>
          {activeTab === 'team' && <TeamTab />}
          {activeTab === 'organization' && <OrganizationTab />}
        </div>
      </main>
    </div>
  );
}
