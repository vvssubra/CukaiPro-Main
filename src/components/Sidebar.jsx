import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrganization } from '../context/OrganizationContext';

function Sidebar() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { currentOrganization, membershipRole } = useOrganization();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Sign out failed', err);
    }
  };
  const location = useLocation();
  const isTaxesSection = location.pathname.startsWith('/dashboard/taxes') || location.pathname.startsWith('/dashboard/deductions') || location.pathname.startsWith('/dashboard/tax-filing');
  const [taxesExpanded, setTaxesExpanded] = useState(isTaxesSection);

  const navItems = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    {
      key: 'taxes',
      icon: 'receipt_long',
      label: 'Taxes',
      children: [
        { path: '/dashboard/taxes', label: 'Overview' },
        { path: '/dashboard/deductions', label: 'Deductions' },
        { path: '/dashboard/tax-filing', label: 'Filing Summary' },
      ],
    },
    { path: '/dashboard/invoices', icon: 'description', label: 'Invoices' },
    { path: '/dashboard/reports', icon: 'analytics', label: 'Reports' },
    { path: '/dashboard/settings', icon: 'settings', label: 'Settings' },
  ];

  return (
    <aside className="w-64 fixed inset-y-0 left-0 bg-slate-custom flex flex-col border-r border-slate-700/50 z-50">
      <div className="p-6 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <span className="material-icons text-white text-lg">account_balance</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">CukaiPro</span>
        </Link>
      </div>
      <nav className="flex-1 px-4 mt-4 space-y-1">
        {navItems.map((item) => {
          if (item.children) {
            const expanded = taxesExpanded || isTaxesSection;
            return (
              <div key={item.key}>
                <button
                  type="button"
                  onClick={() => setTaxesExpanded(!taxesExpanded)}
                  className={`flex items-center justify-between w-full gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    isTaxesSection ? 'bg-primary/20 text-white font-medium border border-primary/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="material-icons text-xl">{item.icon}</span>
                    {item.label}
                  </span>
                  <span className={`material-icons text-lg transition-transform ${expanded ? 'rotate-180' : ''}`}>expand_more</span>
                </button>
                {expanded && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l border-slate-700 pl-3">
                    {item.children.map((child) => {
                      const isChildActive = location.pathname === child.path;
                      return (
                        <Link
                          key={child.path}
                          to={child.path}
                          className={`block py-2 px-2 rounded-md text-sm ${
                            isChildActive ? 'text-primary font-medium' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive ? 'bg-primary/20 text-white font-medium border border-primary/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="material-icons text-xl">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 mt-auto border-t border-slate-700/50">
        <div className="flex items-center gap-3 p-2">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">
            {currentOrganization?.business_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {currentOrganization?.business_name || 'Loading...'}
            </p>
            <p className="text-xs text-slate-400 capitalize truncate">
              {membershipRole || '—'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-3 w-full text-left px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors flex items-center gap-2"
        >
          <span className="material-icons-outlined text-base">logout</span>
          Sign out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
