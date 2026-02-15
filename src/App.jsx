function App() {
  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-slate-custom dark:text-gray-100 antialiased">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-primary/10 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
                <span className="material-icons text-white">account_balance_wallet</span>
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-primary dark:text-white">CukaiPro</span>
            </div>
            <div className="hidden md:flex items-center space-x-10 text-sm font-medium">
              <a className="hover:text-primary transition-colors" href="#">Solutions</a>
              <a className="hover:text-primary transition-colors" href="#">Pricing</a>
              <a className="hover:text-primary transition-colors" href="#">Resources</a>
            </div>
            <div className="flex items-center space-x-4">
              <a className="text-sm font-medium hover:text-primary" href="#">Login</a>
              <a className="btn-lighting-trail bg-primary hover:bg-opacity-90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm" href="#">
                Start Free Trial
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-16 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
                <span className="flex h-2 w-2 rounded-full bg-primary"></span>
                Now LHDN e-Invoice Compatible
              </div>
              <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-custom dark:text-white leading-[1.1] mb-6">
                LHDN-Ready in <span className="text-primary">Minutes</span>
              </h1>
              <p className="text-lg text-slate-custom/70 dark:text-gray-400 mb-10 max-w-2xl leading-relaxed">
                The modern tax platform built specifically for Malaysian businesses. Automate your SST compliance, EA form generation, and real-time liability tracking with enterprise-grade security.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button className="btn-lighting-trail bg-primary text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-opacity-90 transition-all flex items-center justify-center gap-2">
                  Start Free Trial <span className="material-icons text-base">arrow_forward</span>
                </button>
                <button className="border border-primary/20 bg-white dark:bg-transparent px-8 py-4 rounded-lg font-bold text-lg hover:bg-primary/5 transition-all">
                  Book a Demo
                </button>
              </div>
              <p className="mt-6 text-sm text-slate-custom/50 dark:text-gray-500">
                No credit card required. 14-day free trial.
              </p>
            </div>
            <div className="flex-1 w-full max-w-2xl">
              <div className="relative rounded-xl border border-primary/10 shadow-2xl bg-white dark:bg-slate-900 p-2">
                <img
                  alt="Tax Dashboard Mockup"
                  className="rounded-lg w-full h-auto grayscale-[20%]"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHapVERjO6Noosp6k5comGxhR_agziuWGEt2dd3fh39YhFf53RszsbAiL7waiC7ovaKgPTk6ioOEeUTDMHpNcbJc-qUBY0QIvsVsEudi1pU1fSH91URvuJHeAQ9TySit8Tj2PXFD40q4ty8xDuvVvI_XeGk-srHDyemZuY9hBTv6HvJ6H16YmDTqgs8ivHe46oo3I12uNctg5J6ezyF6WTp18-etAOmDuZ5pCwNhSs8-UqSc-pscIraFkhdGIABFdY30l-BcftFJA"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Trust Bar */}
      <section className="py-12 border-y border-primary/5 bg-white dark:bg-background-dark/50">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-custom/40 mb-10">Trusted by 500+ Malaysian SMEs and Accounting Firms</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale">
            <div className="h-8 w-32 bg-slate-custom/20 rounded"></div>
            <div className="h-8 w-40 bg-slate-custom/20 rounded"></div>
            <div className="h-8 w-28 bg-slate-custom/20 rounded"></div>
            <div className="h-8 w-36 bg-slate-custom/20 rounded"></div>
            <div className="h-8 w-32 bg-slate-custom/20 rounded"></div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white dark:bg-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-custom dark:text-white mb-4">Streamline Your Compliance Workflow</h2>
            <p className="text-slate-custom/60 dark:text-gray-400 max-w-2xl mx-auto">Everything you need to stay compliant with Malaysian tax laws without the manual paperwork.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* SST Tracking */}
            <div className="p-8 border border-primary/10 rounded-xl hover:border-primary/30 transition-all bg-background-light/30 dark:bg-primary/5">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <span className="material-icons text-primary">analytics</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-custom dark:text-white">SST Tracking</h3>
              <p className="text-slate-custom/70 dark:text-gray-400 leading-relaxed">
                Automated digital journals and tax period monitoring. Never miss a submission window with smart reminders and pre-filled returns.
              </p>
            </div>
            {/* EA Form Generation */}
            <div className="p-8 border border-primary/10 rounded-xl hover:border-primary/30 transition-all bg-background-light/30 dark:bg-primary/5">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <span className="material-icons text-primary">description</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-custom dark:text-white">Automated EA Forms</h3>
              <p className="text-slate-custom/70 dark:text-gray-400 leading-relaxed">
                One-click generation for employee payroll compliance. Export thousands of EA forms instantly, ready for employee distribution.
              </p>
            </div>
            {/* Real-time Tax Liability */}
            <div className="p-8 border border-primary/10 rounded-xl hover:border-primary/30 transition-all bg-background-light/30 dark:bg-primary/5">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <span className="material-icons text-primary">speed</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-custom dark:text-white">Real-time Tax Liability</h3>
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
                className="rounded-xl shadow-xl border border-primary/10"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2V4fcBwYg5hqJo5DaSJpMnuWL_C84ZqnjjY9XscGBNs2UdTi9aaK9-2wzBl9L-HL-jjvFeKraq2TSvSzUAavfiyfQrlXKufFbOyIn1C6xTwo2ZT8Am7RJVkJPwUO3Ikt5ob1c2GAFM4RTyGS-xuzMEnBJBBQUxaHesYE3fmyhFg01BjIob_XuqjVNW2rcBVsdjGziXK6NrfW2VTsY9iEXOaP-SxtMEtButfVRiUQZsb9hear8GFbD3pCizxbnov4za5Apm6sU01Y"
              />
            </div>
            <div className="flex-1 order-1 lg:order-2">
              <h2 className="text-4xl font-extrabold text-slate-custom dark:text-white mb-6 leading-tight">Built for the Malaysian regulatory landscape.</h2>
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
              <h2 className="text-3xl lg:text-5xl font-extrabold text-white mb-6">Ready to automate your taxes?</h2>
              <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">Join hundreds of Malaysian businesses saving 20+ hours every tax season with CukaiPro.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="btn-lighting-trail-white bg-white text-primary px-10 py-4 rounded-lg font-bold text-lg hover:bg-opacity-90 transition-all">
                  Start Your Free Trial
                </button>
                <button className="border border-white/30 text-white px-10 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition-all">
                  Contact Sales
                </button>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                  <span className="material-icons text-white text-xs">account_balance_wallet</span>
                </div>
                <span className="text-xl font-extrabold text-primary dark:text-white">CukaiPro</span>
              </div>
              <p className="text-slate-custom/60 dark:text-gray-400 leading-relaxed">
                Simplifying Malaysian corporate taxes since 2021. Built with love in Kuala Lumpur.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6 uppercase tracking-widest text-xs">Product</h4>
              <ul className="space-y-4 text-slate-custom/70 dark:text-gray-400">
                <li><a className="hover:text-primary" href="#">E-Invoicing</a></li>
                <li><a className="hover:text-primary" href="#">Payroll Tax</a></li>
                <li><a className="hover:text-primary" href="#">SST Compliance</a></li>
                <li><a className="hover:text-primary" href="#">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 uppercase tracking-widest text-xs">Company</h4>
              <ul className="space-y-4 text-slate-custom/70 dark:text-gray-400">
                <li><a className="hover:text-primary" href="#">About Us</a></li>
                <li><a className="hover:text-primary" href="#">Contact</a></li>
                <li><a className="hover:text-primary" href="#">Careers</a></li>
                <li><a className="hover:text-primary" href="#">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 uppercase tracking-widest text-xs">Support</h4>
              <ul className="space-y-4 text-slate-custom/70 dark:text-gray-400">
                <li><a className="hover:text-primary" href="#">Help Center</a></li>
                <li><a className="hover:text-primary" href="#">LHDN Guidelines</a></li>
                <li><a className="hover:text-primary" href="#">Tax Calendar</a></li>
                <li><a className="hover:text-primary" href="#">Community</a></li>
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
    </div>
  );
}

export default App;
