import { Link } from 'react-router-dom';
import ParticleWave from '../components/ParticleWave';

// Enterprise partner badge logos – fictional wordmark-style SVGs for demonstration purposes
const trustedLogoImages = [
  // NexTel – fictional telecom, bold navy blue
  'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 40"><rect width="110" height="40" rx="6" fill="#1A56B0"/><text x="55" y="26" font-family="Arial Black,sans-serif" font-weight="900" font-size="14" fill="white" text-anchor="middle" letter-spacing="2">NEXTEL</text></svg>'),
  // Goldbank – fictional bank, signature amber-yellow
  'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40"><rect width="120" height="40" rx="6" fill="#FDB912"/><text x="60" y="26" font-family="Georgia,serif" font-weight="700" font-size="15" fill="#1a1a1a" text-anchor="middle">Goldbank</text></svg>'),
  // CORB – fictional banking, bold red
  'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 40"><rect width="90" height="40" rx="6" fill="#C8102E"/><text x="45" y="26" font-family="Arial Black,sans-serif" font-weight="900" font-size="16" fill="white" text-anchor="middle" letter-spacing="3">CORB</text></svg>'),
  // EnerTek – fictional energy, dark green with gold
  'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40"><rect width="120" height="40" rx="6" fill="#0A4D2F"/><text x="60" y="26" font-family="Arial,sans-serif" font-weight="700" font-size="13" fill="#F0B429" text-anchor="middle" letter-spacing="1.5">ENERTEK</text></svg>'),
  // GridCo – fictional utilities, deep navy
  'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 40"><rect width="100" height="40" rx="6" fill="#1E3A8A"/><text x="50" y="18" font-family="Arial,sans-serif" font-weight="700" font-size="9" fill="#93C5FD" text-anchor="middle" letter-spacing="1">GRID</text><text x="50" y="32" font-family="Arial,sans-serif" font-weight="700" font-size="9" fill="white" text-anchor="middle" letter-spacing="1">CORP</text></svg>'),
  // NexWave – fictional telecom, vibrant purple
  'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 40"><rect width="110" height="40" rx="6" fill="#7C3AED"/><text x="55" y="26" font-family="Arial Black,sans-serif" font-weight="900" font-size="13" fill="white" text-anchor="middle" letter-spacing="1">NEXWAVE</text></svg>'),
  // UniBank – fictional banking, teal
  'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 40"><rect width="100" height="40" rx="6" fill="#0F766E"/><text x="50" y="18" font-family="Arial,sans-serif" font-weight="700" font-size="9" fill="#99F6E4" text-anchor="middle" letter-spacing="1">UNI</text><text x="50" y="32" font-family="Arial,sans-serif" font-weight="700" font-size="9" fill="white" text-anchor="middle" letter-spacing="1">BANK</text></svg>'),
  // SimeXa – fictional conglomerate, dark slate
  'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 40"><rect width="110" height="40" rx="6" fill="#1E293B"/><text x="55" y="18" font-family="Arial,sans-serif" font-weight="400" font-size="9" fill="#94A3B8" text-anchor="middle" letter-spacing="3">SIME</text><text x="55" y="32" font-family="Arial Black,sans-serif" font-weight="900" font-size="12" fill="white" text-anchor="middle" letter-spacing="1">XA GROUP</text></svg>'),
  // UMV – fictional automotive, warm amber
  'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 40"><rect width="90" height="40" rx="6" fill="#B45309"/><text x="45" y="26" font-family="Arial Black,sans-serif" font-weight="900" font-size="18" fill="white" text-anchor="middle" letter-spacing="3">UMV</text></svg>'),
  // Zenith – fictional hospitality, deep crimson
  'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 40"><rect width="110" height="40" rx="6" fill="#7F1D1D"/><text x="55" y="26" font-family="Arial,sans-serif" font-weight="700" font-size="13" fill="#FCA5A5" text-anchor="middle" letter-spacing="2">ZENITH</text></svg>'),
];

function LandingPage() {
  return (
    <>
      {/* Hero Section - Forest Green with Particle Wave background */}
      <header className="relative overflow-hidden pt-16 pb-24 bg-primary">
        <ParticleWave className="z-0 pointer-events-none" dotColor="rgba(255, 255, 255, 0.3)" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white/95 text-xs font-bold uppercase tracking-wider mb-6 drop-shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-white/90"></span>
                Now LHDN e-Invoice Compatible
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-white leading-[1.1] mb-6 drop-shadow-md" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                LHDN-Ready in <span className="text-emerald-200">Minutes</span>
              </h1>
              <p className="text-lg text-white/90 mb-10 max-w-2xl leading-relaxed drop-shadow-sm" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.15)' }}>
                The modern tax platform built specifically for Malaysian businesses. Automate your SST compliance, EA form generation, and real-time liability tracking with enterprise-grade security.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/login" className="btn-lighting-trail-white bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/95 transition-all duration-200 flex items-center justify-center gap-2 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 active:scale-[0.98]">
                  Start Free Trial <span className="material-icons text-base">arrow_forward</span>
                </Link>
                <a
                  href="mailto:support@cukaipro.my?subject=Demo%20request%20-%20CukaiPro"
                  className="border-2 border-white/40 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-200 shadow-card inline-flex items-center justify-center gap-2"
                >
                  Book a Demo
                </a>
              </div>
              <p className="mt-6 text-sm text-white/70 drop-shadow-sm" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                No credit card required. 14-day free trial.
              </p>
            </div>
            <div className="flex-1 w-full max-w-2xl">
              <div className="relative rounded-xl border border-white/20 shadow-2xl bg-white/5 backdrop-blur-sm overflow-hidden p-2">
                <img
                  alt="CukaiPro on dual monitors - hero section and dashboard"
                  className="rounded-lg w-full h-auto object-cover"
                  src="/hero-setup.png"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Trust Bar – Premium infinite-scroll ticker */}
      <section className="py-14 bg-white dark:bg-background-dark overflow-hidden animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        {/* Section label with decorative accent lines */}
        <div className="flex items-center justify-center gap-4 px-4 mb-8">
          <div className="h-px flex-1 max-w-20 bg-gradient-to-r from-transparent to-primary/20 dark:to-white/10" aria-hidden="true" />
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.22em] text-slate-custom/40 dark:text-gray-500 whitespace-nowrap">
            Trusted by Industry Leaders
          </p>
          <div className="h-px flex-1 max-w-20 bg-gradient-to-l from-transparent to-primary/20 dark:to-white/10" aria-hidden="true" />
        </div>

        {/* Glassmorphism ticker container */}
        <div className="relative mx-4 sm:mx-8 lg:mx-20 rounded-2xl border border-primary/10 dark:border-white/[0.07] bg-gradient-to-b from-primary/[0.02] to-transparent dark:from-white/[0.03] dark:to-transparent overflow-hidden">
          {/* Gradient fade edges – left then right */}
          {['left', 'right'].map((side) => (
            <div
              key={side}
              className={`absolute inset-y-0 ${side}-0 w-16 sm:w-24 z-10 pointer-events-none bg-gradient-to-${side === 'left' ? 'r' : 'l'} from-white dark:from-background-dark to-transparent`}
              aria-hidden="true"
            />
          ))}

          {/* Scrolling logos */}
          <div className="py-8">
            <div className="ticker-track flex items-center gap-14 shrink-0 w-max">
              {[...trustedLogoImages, ...trustedLogoImages].map((src, i) => (
                <div key={i} className="shrink-0" aria-hidden="true">
                  <img
                    src={src}
                    alt=""
                    className="h-9 w-auto object-contain opacity-50 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(6,78,59,0.4)] dark:hover:drop-shadow-[0_0_10px_rgba(52,211,153,0.35)]"
                    width={110}
                    height={36}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white dark:bg-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-extrabold text-slate-custom dark:text-white mb-4">Streamline Your Compliance Workflow</h2>
            <p className="text-slate-custom/60 dark:text-gray-400 max-w-2xl mx-auto text-base">Everything you need to stay compliant with Malaysian tax laws without the manual paperwork.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card card-hover p-8 rounded-2xl hover:border-primary/30 transition-all duration-200 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <span className="material-icons text-primary">analytics</span>
              </div>
              <h3 className="text-xl font-display font-bold mb-3 text-slate-custom dark:text-white">SST Tracking</h3>
              <p className="text-slate-custom/70 dark:text-gray-400 leading-relaxed">
                Automated digital journals and tax period monitoring. Never miss a submission window with smart reminders and pre-filled returns.
              </p>
            </div>
            <div className="card card-hover p-8 rounded-2xl hover:border-primary/30 transition-all duration-200 animate-fade-in-up" style={{ animationDelay: '75ms' }}>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <span className="material-icons text-primary">description</span>
              </div>
              <h3 className="text-xl font-display font-bold mb-3 text-slate-custom dark:text-white">Automated EA Forms</h3>
              <p className="text-slate-custom/70 dark:text-gray-400 leading-relaxed">
                One-click generation for employee payroll compliance. Export thousands of EA forms instantly, ready for employee distribution.
              </p>
            </div>
            <div className="card card-hover p-8 rounded-2xl hover:border-primary/30 transition-all duration-200 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <span className="material-icons text-primary">speed</span>
              </div>
              <h3 className="text-xl font-display font-bold mb-3 text-slate-custom dark:text-white">Real-time Tax Liability</h3>
              <p className="text-slate-custom/70 dark:text-gray-400 leading-relaxed">
                A live dashboard showing your current tax debt and credits. Predict future cash flow needs with high-accuracy tax forecasting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section / Mockup Display */}
      <section className="py-20 bg-background-light dark:bg-background-dark/80">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 order-2 lg:order-1">
              <img
                alt="Financial Visualization"
                className="rounded-2xl shadow-modal border border-slate-200 dark:border-slate-700"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2V4fcBwYg5hqJo5DaSJpMnuWL_C84ZqnjjY9XscGBNs2UdTi9aaK9-2wzBl9L-HL-jjvFeKraq2TSvSzUAavfiyfQrlXKufFbOyIn1C6xTwo2ZT8Am7RJVkJPwUO3Ikt5ob1c2GAFM4RTyGS-xuzMEnBJBBQUxaHesYE3fmyhFg01BjIob_XuqjVNW2rcBVsdjGziXK6NrfW2VTsY9iEXOaP-SxtMEtButfVRiUQZsb9hear8GFbD3pCizxbnov4za5Apm6sU01Y"
              />
            </div>
            <div className="flex-1 order-1 lg:order-2">
              <h2 className="text-4xl font-display font-extrabold text-slate-custom dark:text-white mb-6 leading-tight">Built for the Malaysian regulatory landscape.</h2>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <span className="material-icons text-primary mt-1">check_circle</span>
                  <div>
                    <p className="font-bold">LHDN &amp; Kastam Validated</p>
                    <p className="text-slate-custom/70 dark:text-gray-400 text-sm">Calculations are updated in real-time following every Budget announcement.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="material-icons text-primary mt-1">check_circle</span>
                  <div>
                    <p className="font-bold">Localized Support</p>
                    <p className="text-slate-custom/70 dark:text-gray-400 text-sm">Our expert team understands local requirements like CP22, CP39, and PCB.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="material-icons text-primary mt-1">check_circle</span>
                  <div>
                    <p className="font-bold">Bank-Grade Security</p>
                    <p className="text-slate-custom/70 dark:text-gray-400 text-sm">AES-256 encryption for all your corporate financial data and employee records.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-primary rounded-3xl p-12 lg:p-20 text-center relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-5xl font-display font-extrabold text-white mb-6">Ready to automate your taxes?</h2>
              <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">Join hundreds of Malaysian businesses saving 20+ hours every tax season with CukaiPro.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/login" className="btn-lighting-trail-white bg-white text-primary px-10 py-4 rounded-xl font-bold text-lg hover:bg-opacity-90 transition-all duration-200 flex items-center justify-center shadow-card hover:shadow-card-hover hover:-translate-y-0.5 active:scale-[0.98]">
                  Start Your Free Trial
                </Link>
                <a href="mailto:support@cukaipro.my?subject=Contact%20Sales%20-%20CukaiPro" className="border border-white/30 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-200 inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white/50">
                  Contact Sales
                </a>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-20 -mb-20"></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-background-dark py-12 border-t border-primary/10 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-card">
                  <span className="material-icons text-white text-xs">account_balance_wallet</span>
                </div>
                <span className="text-xl font-display font-extrabold text-primary dark:text-white">CukaiPro</span>
              </div>
              <p className="text-slate-custom/60 dark:text-gray-400 leading-relaxed">
                Simplifying Malaysian corporate taxes since 2021. Built with love in Kuala Lumpur.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6 uppercase tracking-widest text-xs">Product</h4>
              <ul className="space-y-4 text-slate-custom/70 dark:text-gray-400">
                <li><Link to="/e-invoicing" className="hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 rounded">E-Invoicing</Link></li>
                <li><Link to="/payroll-tax" className="hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 rounded">Payroll Tax</Link></li>
                <li><Link to="/sst-compliance" className="hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 rounded">SST Compliance</Link></li>
                <li><Link to="/integrations" className="hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 rounded">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 uppercase tracking-widest text-xs">Company</h4>
              <ul className="space-y-4 text-slate-custom/70 dark:text-gray-400">
                <li><Link to="/about" className="hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 rounded">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 rounded">Contact</Link></li>
                <li><Link to="/careers" className="hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 rounded">Careers</Link></li>
                <li><Link to="/privacy" className="hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 rounded">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 uppercase tracking-widest text-xs">Support</h4>
              <ul className="space-y-4 text-slate-custom/70 dark:text-gray-400">
                <li><Link to="/help" className="hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 rounded">Help Center</Link></li>
                <li><Link to="/lhdn-guidelines" className="hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 rounded">LHDN Guidelines</Link></li>
                <li><Link to="/tax-calendar" className="hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 rounded">Tax Calendar</Link></li>
                <li><Link to="/community" className="hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 rounded">Community</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-primary/5 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-custom/40">
            <p>© 2026 CukaiPro Sdn Bhd. All rights reserved.</p>
            <div className="flex gap-6">
              <a className="hover:text-primary" href="#"><span className="material-icons text-lg">public</span></a>
              <a className="hover:text-primary" href="#"><span className="material-icons text-lg">alternate_email</span></a>
              <a className="hover:text-primary" href="#"><span className="material-icons text-lg">share</span></a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default LandingPage;
