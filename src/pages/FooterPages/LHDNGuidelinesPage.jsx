import ContentPageLayout from './ContentPageLayout';

const LHDN_LINKS = [
  { label: 'LHDN Official Portal', href: 'https://www.hasil.gov.my', desc: 'Income tax, e-Filing, and taxpayer services' },
  { label: 'e-Filing', href: 'https://efiling.hasil.gov.my', desc: 'File income tax returns online' },
  { label: 'SST e-Filing (Kastam)', href: 'https://www.mycustom.gov.my', desc: 'Sales and Service Tax filing with RMCD' },
];

export default function LHDNGuidelinesPage() {
  return (
    <ContentPageLayout
      title="LHDN Guidelines"
      subtitle="Official links and a short overview of LHDN e-Filing and Malaysian tax compliance. Always confirm with LHDN or your tax advisor for current rules."
    >
      <div className="space-y-8 text-slate-custom/80 dark:text-gray-300">
        <p className="text-lg leading-relaxed">
          The Inland Revenue Board of Malaysia (LHDN / Hasil) provides e-Filing and guidelines for income tax, while the Royal Malaysian Customs Department (RMCD / Kastam) handles SST. CukaiPro helps you prepare data and track deadlines; final submission is done via the official portals.
        </p>
        <section>
          <h2 className="text-xl font-display font-bold text-slate-custom dark:text-white mb-4">Official resources</h2>
          <ul className="space-y-4 list-none">
            {LHDN_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 p-4 rounded-xl border border-primary/10 dark:border-white/10 bg-white dark:bg-white/5 hover:border-primary/30 dark:hover:border-emerald-500/30 transition-colors group"
                >
                  <span className="font-semibold text-slate-custom dark:text-white group-hover:text-primary dark:group-hover:text-emerald-400 transition-colors">
                    {link.label}
                  </span>
                  <span className="text-sm text-slate-custom/60 dark:text-gray-500">{link.desc}</span>
                  <span className="material-icons text-primary text-lg sm:ml-auto">open_in_new</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
        <p className="text-sm text-slate-custom/60 dark:text-gray-500">
          Dates and procedures may change. Always refer to LHDN and RMCD for the latest guidelines and deadlines.
        </p>
      </div>
    </ContentPageLayout>
  );
}
