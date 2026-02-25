import ContentPageLayout from './ContentPageLayout';
import { Link } from 'react-router-dom';

export default function CareersPage() {
  return (
    <ContentPageLayout
      title="Careers"
      subtitle="Join us in building the future of Malaysian tax compliance. We are always looking for talented people who care about clarity, compliance, and great product."
    >
      <div className="space-y-8 text-slate-custom/80 dark:text-gray-300">
        <p className="text-lg leading-relaxed">
          CukaiPro is a small, focused team in Kuala Lumpur. We value ownership, clear communication, and a strong understanding of local tax and business needs. If that sounds like you, we would love to hear from you.
        </p>
        <section className="rounded-2xl border border-primary/10 dark:border-white/10 bg-white/50 dark:bg-white/5 p-8">
          <h2 className="text-xl font-display font-bold text-slate-custom dark:text-white mb-4">Open roles</h2>
          <p className="text-slate-custom/70 dark:text-gray-400">
            We do not have any open positions listed at the moment. If you would like to be considered for future roles in engineering, product, or customer success, send your CV and a short note to{' '}
            <a href="mailto:support@cukaipro.my?subject=Careers%20-%20CukaiPro" className="text-primary dark:text-emerald-400 font-medium hover:underline">support@cukaipro.my</a> with the subject line &quot;Careers – CukaiPro&quot;.
          </p>
        </section>
        <p className="pt-4">
          <Link to="/" className="inline-flex items-center gap-2 font-semibold text-primary dark:text-emerald-400 hover:underline">
            Back to home <span className="material-icons text-lg">arrow_forward</span>
          </Link>
        </p>
      </div>
    </ContentPageLayout>
  );
}
