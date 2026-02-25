import ContentPageLayout from './ContentPageLayout';

const CALENDAR_ITEMS = [
  { item: 'SST-02 (Sales and Service Tax)', due: '15th of each month', note: 'For the previous month’s taxable period' },
  { item: 'EA Form (Employment Income)', due: '28 February', note: 'Employers issue to employees for the preceding year' },
  { item: 'Form B (Business income)', due: '30 June', note: 'Or as extended by LHDN for sole proprietors/partnerships' },
  { item: 'Form BE (Individual)', due: '30 April', note: 'Or as extended for individuals' },
  { item: 'CP500 / PCB', due: 'Monthly', note: 'Monthly tax instalments as applicable' },
];

export default function TaxCalendarPage() {
  return (
    <ContentPageLayout
      title="Tax Calendar"
      subtitle="Key Malaysian tax and compliance deadlines. Confirm with LHDN or your advisor for your specific situation and any extensions."
    >
      <div className="space-y-8 text-slate-custom/80 dark:text-gray-300">
        <p className="text-lg leading-relaxed">
          Use this as a quick reference for common filing and submission dates. CukaiPro tracks SST-02 and helps you prepare EA and Form B data; always verify deadlines with LHDN or RMCD.
        </p>
        <section>
          <h2 className="text-xl font-display font-bold text-slate-custom dark:text-white mb-4">Key dates</h2>
          <div className="overflow-hidden rounded-2xl border border-primary/10 dark:border-white/10">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-white/5">
                  <th className="py-4 px-5 font-display font-bold text-slate-custom dark:text-white">Item</th>
                  <th className="py-4 px-5 font-display font-bold text-slate-custom dark:text-white">Typical due</th>
                  <th className="py-4 px-5 font-display font-bold text-slate-custom dark:text-white hidden sm:table-cell">Note</th>
                </tr>
              </thead>
              <tbody>
                {CALENDAR_ITEMS.map((row, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                    <td className="py-4 px-5 font-medium text-slate-custom dark:text-white">{row.item}</td>
                    <td className="py-4 px-5 text-slate-custom/80 dark:text-gray-300">{row.due}</td>
                    <td className="py-4 px-5 text-slate-custom/60 dark:text-gray-500 text-sm hidden sm:table-cell">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <p className="text-sm text-slate-custom/60 dark:text-gray-500">
          Extensions may apply. Check LHDN announcements and your tax advisor for the current year.
        </p>
      </div>
    </ContentPageLayout>
  );
}
