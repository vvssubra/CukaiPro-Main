import ContentPageLayout from './ContentPageLayout';
import { Link } from 'react-router-dom';

export default function IntegrationsPage() {
  return (
    <ContentPageLayout
      title="Integrations"
      subtitle="Connect CukaiPro with your accounting software, banks, and productivity tools. More integrations are on the way."
    >
      <div className="space-y-8 text-slate-custom/80 dark:text-gray-300">
        <p className="text-lg leading-relaxed">
          We are building a connected ecosystem so your tax and compliance data flows seamlessly between CukaiPro and the tools you already use. Integrations with leading accounting platforms, banks, and LHDN e-Filing are on our roadmap.
        </p>
        <section className="rounded-2xl border border-primary/10 dark:border-white/10 bg-white/50 dark:bg-white/5 p-8">
          <h2 className="text-xl font-display font-bold text-slate-custom dark:text-white mb-4">Coming soon</h2>
          <ul className="space-y-3 list-none">
            <li className="flex items-start gap-3">
              <span className="material-icons text-slate-custom/50 dark:text-gray-500 mt-0.5 text-xl">schedule</span>
              <span>Accounting software sync (export/import)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-icons text-slate-custom/50 dark:text-gray-500 mt-0.5 text-xl">schedule</span>
              <span>Bank feeds for reconciliation</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-icons text-slate-custom/50 dark:text-gray-500 mt-0.5 text-xl">schedule</span>
              <span>LHDN e-Filing direct submission</span>
            </li>
          </ul>
          <p className="mt-6 text-sm text-slate-custom/60 dark:text-gray-500">
            Want early access or have a specific integration in mind? <a href="mailto:support@cukaipro.my?subject=Integrations" className="text-primary dark:text-emerald-400 font-medium hover:underline">Contact us</a>.
          </p>
        </section>
        <p className="pt-4">
          <Link to="/login" className="inline-flex items-center gap-2 font-semibold text-primary dark:text-emerald-400 hover:underline">
            Start free trial <span className="material-icons text-lg">arrow_forward</span>
          </Link>
        </p>
      </div>
    </ContentPageLayout>
  );
}
