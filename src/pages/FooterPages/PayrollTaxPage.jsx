import ContentPageLayout from './ContentPageLayout';
import { Link } from 'react-router-dom';

export default function PayrollTaxPage() {
  return (
    <ContentPageLayout
      title="Payroll Tax"
      subtitle="EA forms, CP58, and employment income compliance for Malaysian employers. One place to manage payroll-related tax obligations."
    >
      <div className="space-y-8 text-slate-custom/80 dark:text-gray-300">
        <p className="text-lg leading-relaxed">
          Employers in Malaysia must issue EA (Employment Income) forms to employees by 28 February each year and comply with PCB and related payroll tax rules. CukaiPro helps you manage EA forms and prepare for LHDN submissions.
        </p>
        <section>
          <h2 className="text-xl font-display font-bold text-slate-custom dark:text-white mb-4">Key features</h2>
          <ul className="space-y-3 list-none">
            <li className="flex items-start gap-3">
              <span className="material-icons text-primary mt-0.5 text-xl">check_circle</span>
              <span><strong>EA forms</strong> — Annual statement of remuneration; generate and manage per employee</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-icons text-primary mt-0.5 text-xl">check_circle</span>
              <span><strong>Filing Summary</strong> — Prepare data for Form B and annual tax filing</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-icons text-primary mt-0.5 text-xl">check_circle</span>
              <span><strong>CP22, CP39, PCB</strong> — Localized support for common payroll tax concepts</span>
            </li>
          </ul>
        </section>
        <p className="pt-4">
          <Link to="/login" className="inline-flex items-center gap-2 font-semibold text-primary dark:text-emerald-400 hover:underline">
            Go to Taxes & EA forms <span className="material-icons text-lg">arrow_forward</span>
          </Link>
        </p>
      </div>
    </ContentPageLayout>
  );
}
