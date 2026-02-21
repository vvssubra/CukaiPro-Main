import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOrganization } from '../../context/OrganizationContext';

export default function OrganizationSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createOrganization, organizations, loading: orgLoading } = useOrganization();
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await createOrganization(businessName.trim());
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err?.message || 'Failed to create organization. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400">You must be logged in to continue.</p>
          <Link
            to="/login"
            className="mt-4 inline-block text-primary font-medium hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  if (orgLoading || organizations.length > 0) {
    if (organizations.length > 0) {
      navigate('/dashboard', { replace: true });
      return null;
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display transition-colors duration-300">
      <nav className="w-full py-6 px-8 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg">
            <span className="material-icons-outlined text-white text-2xl">account_balance</span>
          </div>
          <span className="text-xl font-bold text-primary dark:text-white tracking-tight">
            CukaiPro
          </span>
        </Link>
      </nav>

      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[450px]">
          <div className="bg-white dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-lg shadow-sm overflow-hidden">
            <div className="p-8 md:p-10">
              <h1 className="text-2xl font-bold text-slate-custom dark:text-white mb-2">
                Set up your organization
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                Create your business profile to start managing taxes and invoices.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Business name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="businessName"
                    type="text"
                    required
                    minLength={2}
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="My Sdn Bhd"
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-custom dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !businessName.trim()}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create organization'}
                  <span className="material-icons-outlined text-sm">arrow_forward</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 px-8 border-t border-slate-200 dark:border-primary/10">
        <p className="text-xs text-slate-400 text-center">© 2026 CukaiPro Malaysia. All rights reserved.</p>
      </footer>
    </div>
  );
}
