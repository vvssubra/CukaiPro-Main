import ContentPageLayout from './ContentPageLayout';

export default function ContactPage() {
  return (
    <ContentPageLayout
      title="Contact"
      subtitle="Reach our team for sales, support, or general enquiries. We typically respond within one business day."
    >
      <div className="space-y-8 text-slate-custom/80 dark:text-gray-300">
        <section className="grid sm:grid-cols-1 gap-6">
          <a
            href="mailto:support@cukaipro.my"
            className="flex items-start gap-4 p-6 rounded-2xl border border-primary/10 dark:border-white/10 bg-white dark:bg-white/5 hover:border-primary/30 dark:hover:border-emerald-500/30 transition-colors group"
          >
            <span className="material-icons text-primary text-2xl">email</span>
            <div>
              <h3 className="font-display font-bold text-slate-custom dark:text-white group-hover:text-primary dark:group-hover:text-emerald-400 transition-colors">Email</h3>
              <p className="text-slate-custom/70 dark:text-gray-400 mt-1">support@cukaipro.my</p>
              <p className="text-sm mt-2">For product support, billing, and general questions.</p>
            </div>
          </a>
          <a
            href="mailto:support@cukaipro.my?subject=Contact%20Sales%20-%20CukaiPro"
            className="flex items-start gap-4 p-6 rounded-2xl border border-primary/10 dark:border-white/10 bg-white dark:bg-white/5 hover:border-primary/30 dark:hover:border-emerald-500/30 transition-colors group"
          >
            <span className="material-icons text-primary text-2xl">handshake</span>
            <div>
              <h3 className="font-display font-bold text-slate-custom dark:text-white group-hover:text-primary dark:group-hover:text-emerald-400 transition-colors">Sales</h3>
              <p className="text-slate-custom/70 dark:text-gray-400 mt-1">Contact Sales</p>
              <p className="text-sm mt-2">Demo requests, enterprise plans, and partnerships.</p>
            </div>
          </a>
        </section>
        <p className="text-sm text-slate-custom/60 dark:text-gray-500">
          CukaiPro Sdn Bhd · Kuala Lumpur, Malaysia
        </p>
      </div>
    </ContentPageLayout>
  );
}
