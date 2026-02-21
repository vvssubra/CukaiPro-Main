import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useInvitations } from '../../hooks/useInvitations';
import { useOrganization } from '../../context/OrganizationContext';
import { useToast } from '../../context/ToastContext';

export default function AcceptInvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { acceptInvitation, getInvitationByToken, loading } = useInvitations();
  const { reloadOrganizations } = useOrganization();
  const toast = useToast();
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState('');
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!token || !user) return;
    getInvitationByToken(token).then(({ data, error: err }) => {
      if (err) setError(err);
      else setInvitation(data);
    });
  }, [token, user, getInvitationByToken]);

  const handleAccept = async () => {
    if (!token) return;
    setError('');
    setAccepting(true);
    const result = await acceptInvitation(token);
    setAccepting(false);
    if (result.success) {
      toast.success('Invitation accepted!');
      await reloadOrganizations(null, result.organizationId);
      navigate('/dashboard', { replace: true });
    } else {
      const err = result.error || 'Failed to accept invitation';
      setError(err);
      toast.error(err);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400">Invalid invitation link.</p>
          <Link to="/login" className="mt-4 inline-block text-primary font-medium hover:underline">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold text-slate-custom dark:text-white mb-2">Sign in to accept</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            You need to sign in to accept this invitation.
          </p>
          <Link
            to={`/login?redirect=/invite/${token}`}
            className="inline-block px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90"
          >
            Sign in
          </Link>
          <p className="mt-4 text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link to={`/signup?redirect=/invite/${token}`} className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    );
  }

  if (user && loading && !invitation && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center max-w-md">
          <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
          <Link to="/dashboard" className="text-primary font-medium hover:underline">
            Go to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const orgName = invitation?.organization?.business_name || 'the organization';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
      <div className="max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-slate-custom dark:text-white mb-2">
          Join {orgName}
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          You&apos;ve been invited to join as <strong>{invitation?.role || 'member'}</strong>.
        </p>
        {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
        <button
          type="button"
          onClick={handleAccept}
          disabled={accepting}
          className="w-full py-3 px-6 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {accepting ? 'Accepting…' : 'Accept invitation'}
        </button>
        <Link to="/dashboard" className="mt-4 inline-block text-sm text-slate-500 hover:text-slate-700">
          Decline and go to dashboard
        </Link>
      </div>
    </div>
  );
}
