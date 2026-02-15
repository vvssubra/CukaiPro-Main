import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-primary/10 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
              <span className="material-icons text-white">account_balance_wallet</span>
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-primary dark:text-white">CukaiPro</span>
          </Link>
          <div className="hidden md:flex items-center space-x-10 text-sm font-medium">
            <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
            <a className="hover:text-primary transition-colors" href="#">Solutions</a>
            <a className="hover:text-primary transition-colors" href="#">Pricing</a>
            <a className="hover:text-primary transition-colors" href="#">Resources</a>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-sm font-medium hover:text-primary">Login</Link>
            <Link to="/login" className="btn-lighting-trail bg-primary hover:bg-opacity-90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm">
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
