import ContentPageLayout from './ContentPageLayout';
import { Link } from 'react-router-dom';

export default function CommunityPage() {
  return (
    <ContentPageLayout
      title="Community"
      subtitle="Connect with other CukaiPro users and stay updated on product news and Malaysian tax tips."
    >
      <div className="space-y-8 text-slate-custom/80 dark:text-gray-300">
        <p className="text-lg leading-relaxed">
          We are building a space for CukaiPro users to share tips, ask questions, and stay in the loop on product updates and LHDN-related news. Community channels will be announced here and via email once they are live.
        </p>
        <section className="rounded-2xl border border-primary/10 dark:border-white/10 bg-white/50 dark:bg-white/5 p-8">
          <h2 className="text-xl font-display font-bold text-slate-custom dark:text-white mb-4">Coming soon</h2>
          <p className="text-slate-custom/70 dark:text-gray-400">
            For now, get help via the <Link to="/help" className="text-primary dark:text-emerald-400 font-medium hover:underline">Help Center</Link> and email support at{' '}
            <a href="mailto:support@cukaipro.my" className="text-primary dark:text-emerald-400 font-medium hover:underline">support@cukaipro.my</a>. We will add a forum or community channel when ready.
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
