import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useOrganization } from '../../context/OrganizationContext';

/**
 * Renders children only if the user is organization owner or admin.
 * Otherwise redirects to /dashboard. Use for Settings and other admin-only pages.
 */
export function AdminOnlyRoute({ children }) {
  const { canAccessSettings, loading } = useOrganization();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!canAccessSettings) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

AdminOnlyRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AdminOnlyRoute;
