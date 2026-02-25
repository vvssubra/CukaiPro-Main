import ContentPageLayout from './ContentPageLayout';
import { Link } from 'react-router-dom';

export default function SSTCompliancePage() {
  return (
    <ContentPageLayout
      title="SST Compliance"
      subtitle="Sales and Service Tax (SST) filing and RMCD compliance. Track periods, due dates, and prepare SST-02 returns with CukaiPro."
    >
      <div className="space-y-8 text-slate-custom/80 dark:text-gray-300">
        <p className="text-lg leading-relaxed">
          If your business is SST-registered, you must file SST returns with the Royal Malaysian Customs Department (RMCD). SST-02 is typically due by the 15th of the month following the taxable period. CukaiPro helps you track liabilities and prepare filing data so you never miss a deadline.
        </p>
        <section>
          <h2 className="text-xl font-display font-bold text-slate-custom dark:text-white mb-4">What we offer</h2>
          <ul className="space-y-3 list-none">
            <li className="flex items-start gap-3">
              <span className="material-icons text-primary mt-0.5 text-xl">check_circle</span>
              <span>Taxable period tracking and SST-02 due date visibility</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-icons text-primary mt-0.5 text-xl">check_circle</span>
              <span>SST amount calculation from your invoices (e.g. 6% on taxable value)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-icons text-primary mt-0.5 text-xl">check_circle</span>
              <span>Export reports for manual entry into LHDN SST e-Filing</span>
            </li>
          </ul>
        </section>
        <p className="pt-4">
          <Link to="/login" className="inline-flex items-center gap-2 font-semibold text-primary dark:text-emerald-400 hover:underline">
            Open SST Filing <span className="material-icons text-lg">arrow_forward</span>
          </Link>
        </p>
      </div>
    </ContentPageLayout>
  );
}
