import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/dashboard/taxes', icon: 'receipt_long', label: 'Taxes' },
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
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive
                  ? 'bg-primary/20 text-white font-medium border border-primary/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
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
          <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden">
            <img
              alt="Profile"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKhiyOPy3mF8FcX42jUEPapss-WGtqSL5GiQJ1IMPVpbTnJ1xMWCwjIgqMl-UoMbZvfBwuZUXIOKX0pvjEtItdal9Y-HxGK4wCoLWl2xcGuSqRuXVpifCT8k58F8BprlKSHLoolYcCdh7Z_rywbVl4xUlKJ4Kju58mx5lR3patTG3jRVO0DJMz9VYiLUGfqAHVfQA10fPlH9DBSBZCW4oh0DEOn69WY0GKwjSpo8sNGn8dNwzTGjZcK_MCJbA-pzAQzWnphazs9MU"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white">Azlan Shah</span>
            <span className="text-xs text-slate-400">SME Founder</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
