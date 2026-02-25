import ContentPageLayout from './ContentPageLayout';
import { Link } from 'react-router-dom';

export default function EInvoicingPage() {
  return (
    <ContentPageLayout
      title="E-Invoicing"
      subtitle="LHDN e-Invoice compliance made simple. CukaiPro helps Malaysian businesses meet e-invoicing requirements with structured data and seamless workflows."
    >
      <div className="space-y-8 text-slate-custom/80 dark:text-gray-300">
        <p className="text-lg leading-relaxed">
          Malaysia&apos;s e-Invoicing mandate requires businesses to issue invoices in a format compatible with LHDN systems. CukaiPro is built with LHDN e-Invoice compatibility in mind so you can create, manage, and submit invoices that meet regulatory standards.
        </p>
        <section>
          <h2 className="text-xl font-display font-bold text-slate-custom dark:text-white mb-4">What we offer</h2>
          <ul className="space-y-3 list-none">
            <li className="flex items-start gap-3">
              <span className="material-icons text-primary mt-0.5 text-xl">check_circle</span>
              <span>Structured invoice data aligned with LHDN e-Invoice specifications</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-icons text-primary mt-0.5 text-xl">check_circle</span>
              <span>Create and manage invoices from your dashboard with line items and tax handling</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-icons text-primary mt-0.5 text-xl">check_circle</span>
              <span>Export and track sales for SST and income reporting</span>
            </li>
          </ul>
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
