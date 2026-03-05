import ContentPageLayout from './ContentPageLayout';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { testMyInvoisConnection } from '../../services/myinvois';
import Button from '../../components/Common/Button';

export default function EInvoicingPage() {
  const { user } = useAuth();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await testMyInvoisConnection();
    setTestResult(result);
    setTesting(false);
  };

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
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Implementation follows our phased PRD (see <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">docs/PRD_EINVOICING.md</code> in the repository). MyInvois SDK: <a href="https://sdk.myinvois.hasil.gov.my/api/" className="text-primary dark:text-emerald-400 hover:underline" target="_blank" rel="noreferrer">Platform API</a>, <a href="https://sdk.myinvois.hasil.gov.my/einvoicingapi/" className="text-primary dark:text-emerald-400 hover:underline" target="_blank" rel="noreferrer">e-Invoice API</a>.
        </p>
        {user && (
          <section className="rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 p-6">
            <h2 className="text-xl font-display font-bold text-slate-custom dark:text-white mb-2">MyInvois connection</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
              Verify that CukaiPro can connect to LHDN MyInvois (credentials are configured server-side). Submit to LHDN will be available in a later phase.
            </p>
            <Button
              type="button"
              onClick={handleTestConnection}
              loading={testing}
              disabled={testing}
              className="bg-primary text-white hover:bg-primary/90"
            >
              {testing ? 'Testing…' : 'Test MyInvois connection'}
            </Button>
            {testResult && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${testResult.success ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-red-500/10 text-red-700 dark:text-red-400'}`}>
                {testResult.success ? (testResult.message || 'Connection successful.') : (testResult.error || 'Connection failed.')}
              </div>
            )}
          </section>
        )}
        <p className="pt-4">
          <Link to="/login" className="inline-flex items-center gap-2 font-semibold text-primary dark:text-emerald-400 hover:underline">
            Start free trial <span className="material-icons text-lg">arrow_forward</span>
          </Link>
        </p>
      </div>
    </ContentPageLayout>
  );
}
