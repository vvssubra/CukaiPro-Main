import ContentPageLayout from './ContentPageLayout';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <ContentPageLayout
      title="About Us"
      subtitle="Simplifying Malaysian corporate taxes since 2021. Built with love in Kuala Lumpur."
    >
      <div className="space-y-8 text-slate-custom/80 dark:text-gray-300">
        <p className="text-lg leading-relaxed">
          CukaiPro is a modern tax platform built specifically for Malaysian businesses and accounting firms. We combine local regulatory expertise with clean, reliable software so you can focus on running your business instead of wrestling with spreadsheets and deadlines.
        </p>
        <section>
          <h2 className="text-xl font-display font-bold text-slate-custom dark:text-white mb-4">Our mission</h2>
          <p className="leading-relaxed">
            To make LHDN-ready compliance accessible: SST tracking, EA forms, deductions, and filing summaries in one place, with calculations that follow the latest Budget and LHDN guidelines.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-display font-bold text-slate-custom dark:text-white mb-4">Where we are</h2>
          <p className="leading-relaxed">
            We are based in Kuala Lumpur and serve SMEs and accounting firms across Malaysia. Our team understands local requirements—from CP22 and CP39 to SST-02 and Form B—so you get a product that fits the way you work.
          </p>
        </section>
        <p className="pt-4">
          <Link to="/contact" className="inline-flex items-center gap-2 font-semibold text-primary dark:text-emerald-400 hover:underline">
            Get in touch <span className="material-icons text-lg">arrow_forward</span>
          </Link>
        </p>
      </div>
    </ContentPageLayout>
  );
}
