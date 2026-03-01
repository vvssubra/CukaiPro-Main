import { Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Sidebar from './Sidebar';

/**
 * Shared layout for all dashboard routes: Sidebar (drawer on mobile) + mobile header + main with Outlet.
 */
function DashboardLayout() {
  const { sidebarOpen, toggleSidebar } = useApp();

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark">
      {/* Backdrop: visible only when sidebar open on mobile (md:hidden) */}
      <button
        type="button"
        aria-label="Close menu"
        onClick={() => toggleSidebar()}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 md:hidden ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header: hamburger + branding, only on small screens */}
        <header className="md:hidden sticky top-0 z-30 flex items-center gap-3 h-14 px-4 border-b border-primary/10 bg-white/95 dark:bg-background-dark/95 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => toggleSidebar()}
            className="p-2 -ml-2 rounded-lg text-slate-custom dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Open menu"
          >
            <span className="material-icons text-2xl">menu</span>
          </button>
          <span className="text-lg font-display font-bold text-primary dark:text-white truncate">CukaiPro</span>
        </header>

        <main className="flex-1 pt-0 md:pt-0 ml-0 md:ml-64 p-4 sm:p-6 md:p-8 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
