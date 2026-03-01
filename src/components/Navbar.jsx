import { Link, useLocation } from 'react-router-dom';
import { useLandingScroll } from '../context/LandingScrollContext';

function Navbar() {
  const location = useLocation();
  const activeSection = useLandingScroll();
  const isLanding = location.pathname === '/';

  const navLinkClass = (section) => {
    const base = 'transition-colors duration-200 hover:text-primary';
    const active = isLanding && activeSection === section ? 'text-primary font-bold dark:text-emerald-400' : '';
    return `${base} ${active}`.trim();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-primary/10 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md shadow-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-card">
              <span className="material-icons text-white">account_balance_wallet</span>
            </div>
            <span className="text-2xl font-display font-extrabold tracking-tight text-primary dark:text-white">CukaiPro</span>
          </Link>
          <div className="hidden md:flex items-center space-x-10 text-sm font-medium">
            <Link to="/dashboard" className="hover:text-primary transition-colors duration-200">Dashboard</Link>
            {isLanding ? (
              <>
                <a href="#features" className={navLinkClass('features')}>Solutions</a>
                <a href="#highlight" className={navLinkClass('highlight')}>Resources</a>
                <a href="#pricing" className={navLinkClass('pricing')}>Pricing</a>
              </>
            ) : (
              <>
                <a className="hover:text-primary transition-colors duration-200" href="/#features">Solutions</a>
                <a className="hover:text-primary transition-colors duration-200" href="/#pricing">Pricing</a>
                <a className="hover:text-primary transition-colors duration-200" href="/#highlight">Resources</a>
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors duration-200">Login</Link>
            <Link to="/login" className="btn-lighting-trail bg-primary hover:bg-opacity-90 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-card hover:shadow-card-hover hover:-translate-y-0.5 active:scale-[0.98]">
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
