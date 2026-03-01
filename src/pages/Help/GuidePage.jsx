import { Link } from 'react-router-dom';

/**
 * In-app user guide. Content is embedded here so clients only see the guide,
 * not repo files or internal docs. Images load from /guide/guide-*.png.
 */
export default function GuidePage() {
  const img = (src, alt) => (
    <img
      src={src}
      alt={alt}
      className="my-4 rounded-lg border border-slate-200 dark:border-slate-700 max-w-full"
    />
  );

  return (
    <article className="max-w-3xl prose prose-slate dark:prose-invert prose-headings:font-bold prose-a:text-primary">
          <h1 className="text-2xl font-bold text-slate-custom dark:text-white mb-2">
            CukaiPro – Complete user guide
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            This guide is for new users of CukaiPro: business owners, accountants, and staff who need to manage Malaysian tax, invoices, deductions, and filings in one place. You will learn how to sign up, complete onboarding, use the dashboard, manage invoices, work with taxes (including SST and deductions), view reports, manage your team, and get help.
          </p>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            <strong>Need support?</strong>{' '}
            <a href="mailto:support@cukaipro.my" className="text-primary hover:underline">
              Contact support@cukaipro.my
            </a>
          </p>

          <hr className="border-slate-200 dark:border-slate-700 my-8" />

          <h2 className="text-xl font-bold text-slate-custom dark:text-white mt-8 mb-4">Part 1: Getting started</h2>

          <h3 className="text-lg font-semibold text-slate-custom dark:text-white mt-6 mb-2">Create your account</h3>
          <ol className="list-decimal list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
            <li>Open the CukaiPro app (your deployed URL or the link provided by your organisation).</li>
            <li>On the landing page, click <strong>Sign up</strong> (or go to the sign-up page).</li>
          </ol>
          {img('/guide/guide-landing.png', 'Landing page')}
          <ol start={3} className="list-decimal list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
            <li>On the <strong>Create your account</strong> form, enter: <strong>Full name</strong>, <strong>Company name</strong>, <strong>Email address</strong>, and <strong>Password</strong> (at least 8 characters, with uppercase, lowercase, and a number).</li>
            <li>Click <strong>Create account</strong>.</li>
          </ol>
          {img('/guide/guide-signup.png', 'Sign up form')}
          <p className="text-slate-600 dark:text-slate-400 mb-6">After sign-up you are taken to onboarding. If you already have an account, use <strong>Sign in</strong> instead.</p>

          <h3 className="text-lg font-semibold text-slate-custom dark:text-white mt-6 mb-2">Log in</h3>
          <ol className="list-decimal list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
            <li>Open the app and go to the <strong>Login</strong> page.</li>
            <li>Enter your <strong>email</strong> and <strong>password</strong>.</li>
            <li>Click <strong>Sign in</strong>.</li>
          </ol>
          {img('/guide/guide-login.png', 'Login page')}
          <p className="text-slate-600 dark:text-slate-400 mb-6">If you have already completed onboarding, you go straight to the Dashboard. Otherwise you will see the onboarding steps.</p>

          <h3 className="text-lg font-semibold text-slate-custom dark:text-white mt-6 mb-2">Onboarding (first-time setup)</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">After sign-up you go through four short steps. You can skip optional steps and complete them later from the dashboard.</p>
          <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-3 mb-4">
            <li><strong>Step 1 – Welcome:</strong> Click <strong>Get started</strong> to begin.</li>
          </ul>
          {img('/guide/guide-onboarding-welcome.png', 'Onboarding – Welcome')}
          <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-3 mb-4">
            <li><strong>Step 2 – Create your organization:</strong> Enter your business name (or confirm the one shown), then click <strong>Continue</strong>.</li>
          </ul>
          {img('/guide/guide-onboarding-org.png', 'Onboarding – Organization')}
          <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-3 mb-4">
            <li><strong>Step 3 – Add your first deduction (optional):</strong> Choose a category, enter amount (RM) and optionally a description, then click <strong>Add deduction</strong>, or <strong>Skip for now</strong> to do this later from Taxes → Deductions.</li>
          </ul>
          {img('/guide/guide-onboarding-deduction.png', 'Onboarding – First deduction')}
          <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-3 mb-4">
            <li><strong>Step 4 – Invite your team (optional):</strong> Enter a teammate’s email and role (Staff, Admin, or Accountant), then click <strong>Send invite</strong>, or <strong>Skip for now</strong> / <strong>Continue to dashboard</strong>. You can invite more people later from Settings → Team.</li>
          </ul>
          {img('/guide/guide-onboarding-invite.png', 'Onboarding – Invite team')}
          <p className="text-slate-600 dark:text-slate-400 mb-8">When you finish step 4 (or skip it), you are taken to the Dashboard.</p>

          <hr className="border-slate-200 dark:border-slate-700 my-8" />

          <h2 className="text-xl font-bold text-slate-custom dark:text-white mt-8 mb-4">Part 2: Dashboard</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">The dashboard is your home after login. It shows: <strong>SST</strong> (next due date and amount), <strong>Revenue</strong>, <strong>Recent expenses</strong>, <strong>Pay Now</strong>, <strong>Download Report</strong>, and <strong>Support</strong> (in-app chat).</p>
          {img('/guide/guide-dashboard.png', 'Dashboard')}
          <h3 className="text-lg font-semibold text-slate-custom dark:text-white mt-6 mb-2">Navigation (sidebar)</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">Use the sidebar on the left: <strong>Dashboard</strong>, <strong>Taxes</strong> (Overview, SST Filing, Deductions, Filing Summary), <strong>Invoices</strong>, <strong>Reports</strong>, <strong>Help</strong>, <strong>Settings</strong>. At the bottom you see your current organisation and <strong>Sign out</strong>.</p>
          {img('/guide/guide-sidebar.png', 'Sidebar navigation')}

          <hr className="border-slate-200 dark:border-slate-700 my-8" />

          <h2 className="text-xl font-bold text-slate-custom dark:text-white mt-8 mb-4">Part 3: Invoices</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">Click <strong>Invoices</strong> in the sidebar to create, view, and manage invoices: add line items, tax rates, and customer details. Use the list to filter, search, and export or share as needed.</p>
          {img('/guide/guide-invoices.png', 'Invoices list')}

          <hr className="border-slate-200 dark:border-slate-700 my-8" />

          <h2 className="text-xl font-bold text-slate-custom dark:text-white mt-8 mb-4">Part 4: Taxes</h2>
          <h3 className="text-lg font-semibold text-slate-custom dark:text-white mt-6 mb-2">Overview</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">Go to <strong>Taxes → Overview</strong>. Use the year selector to switch tax year (Jan–Dec). Review your tax position and summary.</p>
          {img('/guide/guide-taxes-overview.png', 'Taxes overview')}
          <h3 className="text-lg font-semibold text-slate-custom dark:text-white mt-6 mb-2">SST Filing</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">If your business is SST-registered, go to <strong>Taxes → SST Filing</strong> to see due dates and filing periods (typically every 2 months) and prepare SST returns for RMCD.</p>
          {img('/guide/guide-sst-filing.png', 'SST Filing')}
          <h3 className="text-lg font-semibold text-slate-custom dark:text-white mt-6 mb-2">Deductions</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">Go to <strong>Taxes → Deductions</strong>, click <strong>Add Deduction</strong>, choose a category, enter amount (RM) and date (DD/MM/YYYY), and optionally upload a receipt. The claimable amount is calculated per LHDN rules.</p>
          {img('/guide/guide-deductions.png', 'Deductions')}
          <h3 className="text-lg font-semibold text-slate-custom dark:text-white mt-6 mb-2">Filing Summary</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">Go to <strong>Taxes → Filing Summary</strong> to prepare your annual tax filing and Form B data. Filing is due by 30 June (or as extended).</p>
          {img('/guide/guide-filing-summary.png', 'Filing summary')}

          <hr className="border-slate-200 dark:border-slate-700 my-8" />

          <h2 className="text-xl font-bold text-slate-custom dark:text-white mt-8 mb-4">Part 5: Reports</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">Go to <strong>Reports</strong> in the sidebar to view an overview of tax filings, deductions, SST, and EA forms. Use this with Filing Summary to track progress and prepare for LHDN submissions.</p>
          {img('/guide/guide-reports.png', 'Reports')}

          <hr className="border-slate-200 dark:border-slate-700 my-8" />

          <h2 className="text-xl font-bold text-slate-custom dark:text-white mt-8 mb-4">Part 6: Settings and team</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">Go to <strong>Settings</strong> in the sidebar. Under <strong>Team</strong>, enter the invitee’s email and role (Staff, Admin, Accountant), then click <strong>Send invite</strong>. Only Admins and Owners can send invites.</p>
          {img('/guide/guide-settings-team.png', 'Settings – Team')}

          <hr className="border-slate-200 dark:border-slate-700 my-8" />

          <h2 className="text-xl font-bold text-slate-custom dark:text-white mt-8 mb-4">Part 7: Help and support</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">Go to <strong>Help</strong> in the sidebar to search FAQs, expand answers, and use <strong>Contact support</strong> to email support@cukaipro.my.</p>
          {img('/guide/guide-help.png', 'Help & FAQ')}

          <hr className="border-slate-200 dark:border-slate-700 my-8" />

          <h2 className="text-xl font-bold text-slate-custom dark:text-white mt-8 mb-4">Quick reference</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left py-3 px-4 font-semibold text-slate-custom dark:text-white">Task</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-custom dark:text-white">Where to go</th>
                </tr>
              </thead>
              <tbody className="text-slate-600 dark:text-slate-300 text-sm">
                <tr className="border-t border-slate-200 dark:border-slate-700"><td className="py-2 px-4">Sign up / Log in</td><td className="py-2 px-4">Landing → Sign up or Sign in</td></tr>
                <tr className="border-t border-slate-200 dark:border-slate-700"><td className="py-2 px-4">First-time setup</td><td className="py-2 px-4">Onboarding (4 steps after sign-up)</td></tr>
                <tr className="border-t border-slate-200 dark:border-slate-700"><td className="py-2 px-4">View overview</td><td className="py-2 px-4">Dashboard</td></tr>
                <tr className="border-t border-slate-200 dark:border-slate-700"><td className="py-2 px-4">Manage invoices</td><td className="py-2 px-4">Invoices</td></tr>
                <tr className="border-t border-slate-200 dark:border-slate-700"><td className="py-2 px-4">Tax year & summary</td><td className="py-2 px-4">Taxes → Overview</td></tr>
                <tr className="border-t border-slate-200 dark:border-slate-700"><td className="py-2 px-4">SST returns</td><td className="py-2 px-4">Taxes → SST Filing</td></tr>
                <tr className="border-t border-slate-200 dark:border-slate-700"><td className="py-2 px-4">Add deductions</td><td className="py-2 px-4">Taxes → Deductions</td></tr>
                <tr className="border-t border-slate-200 dark:border-slate-700"><td className="py-2 px-4">Annual / Form B prep</td><td className="py-2 px-4">Taxes → Filing Summary</td></tr>
                <tr className="border-t border-slate-200 dark:border-slate-700"><td className="py-2 px-4">View reports</td><td className="py-2 px-4">Reports</td></tr>
                <tr className="border-t border-slate-200 dark:border-slate-700"><td className="py-2 px-4">Invite team</td><td className="py-2 px-4">Settings → Team</td></tr>
                <tr className="border-t border-slate-200 dark:border-slate-700"><td className="py-2 px-4">FAQs & support</td><td className="py-2 px-4">Help</td></tr>
              </tbody>
            </table>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-700">
            <Link
              to="/dashboard/help"
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
            >
              <span className="material-icons text-lg">arrow_back</span>
              Back to Help & FAQ
            </Link>
          </div>
        </article>
  );
}
