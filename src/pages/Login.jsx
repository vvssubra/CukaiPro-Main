import { Link } from 'react-router-dom';

function Login() {
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display transition-colors duration-300">
      {/* Top Navigation / Branding */}
      <nav className="w-full py-6 px-8 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg">
            <span className="material-icons-outlined text-white text-2xl">account_balance</span>
          </div>
          <span className="text-xl font-bold text-primary dark:text-white tracking-tight">CukaiPro</span>
        </Link>
        <div className="hidden md:flex items-center gap-4 text-sm text-slate-500 dark:text-primary/60">
          <span className="flex items-center gap-1">
            <span className="material-icons-outlined text-sm">lock</span>
            Secure Connection
          </span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[450px]">
          {/* Auth Card */}
          <div className="bg-white dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-lg shadow-sm overflow-hidden">
            {/* Progress Indicator */}
            <div className="flex w-full h-1 bg-slate-100 dark:bg-primary/10">
              <div className="w-1/2 bg-primary h-full"></div>
              <div className="w-1/2 bg-transparent h-full"></div>
            </div>
            <div className="p-8 md:p-10">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-custom dark:text-white mb-2">Secure Login</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Step 1 of 2: Enter your credentials</p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-custom dark:text-slate-300 block" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-primary/30 bg-white dark:bg-primary/5 text-slate-custom dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                    id="email"
                    name="email"
                    placeholder="name@company.com"
                    type="email"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-custom dark:text-slate-300 block" htmlFor="password">
                      Password
                    </label>
                    <a className="text-xs font-semibold text-slate-custom dark:text-primary/80 hover:underline" href="#">
                      Forgot Password?
                    </a>
                  </div>
                  <input
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-primary/30 bg-white dark:bg-primary/5 text-slate-custom dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    type="password"
                  />
                </div>
                <button
                  className="w-full bg-primary hover:bg-opacity-90 text-white font-semibold py-3 rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
                  type="submit"
                >
                  <span>Login</span>
                  <span className="material-icons-outlined text-sm">arrow_forward</span>
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-primary/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-background-dark text-slate-400">Or continue with</span>
                </div>
              </div>

              {/* MyDigital ID Login */}
              <button
                className="w-full group border border-slate-200 dark:border-primary/30 bg-slate-50 dark:bg-primary/10 hover:bg-slate-100 dark:hover:bg-primary/20 text-slate-custom dark:text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-3"
                type="button"
              >
                <div className="w-6 h-6 flex items-center justify-center bg-white rounded-full shadow-sm border border-slate-100">
                  <span className="material-icons-outlined text-primary text-base">fingerprint</span>
                </div>
                <span>MyDigital ID</span>
              </button>

              <div className="mt-8 text-center">
                <p className="text-sm text-slate-500">
                  New to CukaiPro?{' '}
                  <a className="text-slate-custom dark:text-primary/80 font-bold hover:underline" href="#">
                    Create an Account
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Footer Trust Info */}
          <div className="mt-8 text-center space-y-4">
            <div className="flex items-center justify-center gap-4 opacity-60">
              <img
                alt="Small flag of Malaysia"
                className="h-4 w-auto grayscale"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsz0YWwCUJHopfctJm_pG35TRFK6NUejFfZQhynfgvZDg50ORhkp8DUeCnIf4WludEoSofRasVLpFnVGeyOpxFwa9NFT3ZoH16Txkpw7-2LF08kpPMMgyzls8Q5oalJnkaayzREzKlb4oUREg0soTtmxU21DoDKy6cGsxD0l2tlKe5WB3vVzh9mdSmEOj-ibesqQdF4wG1ScbWlnUZScs-7Uo-Nw814lsLOxAXn8sSDpQBOoUyENOjXj0BahaB95qte1qjzjQoaFA"
              />
              <div className="h-4 w-px bg-slate-300"></div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Government Grade Security</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
              By logging in, you agree to CukaiPro&apos;s Terms of Service and Privacy Policy. Secured by Bank-grade 256-bit Encryption.
            </p>
          </div>
        </div>
      </main>

      {/* Security Badges Footer */}
      <footer className="py-6 px-8 border-t border-slate-200 dark:border-primary/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-6">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ISO 27001 Certified</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">LHDN Integrated</span>
          </div>
          <p className="text-xs text-slate-400">© 2026 CukaiPro Malaysia. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Login;
