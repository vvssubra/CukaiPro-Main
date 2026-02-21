import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Sidebar from '../../components/Sidebar';
import { FAQ_ITEMS } from '../../data/faqData';

function FaqAccordionItem({ item, isOpen, onToggle }) {
  return (
    <div
      className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 overflow-hidden"
      role="region"
      aria-labelledby={`faq-q-${item.id}`}
    >
      <button
        type="button"
        id={`faq-q-${item.id}`}
        onClick={() => onToggle(item.id)}
        className="w-full px-4 py-4 text-left flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-inset"
        aria-expanded={isOpen}
        aria-controls={`faq-a-${item.id}`}
      >
        <span className="font-medium text-slate-custom dark:text-white">{item.question}</span>
        <span
          className={`material-icons text-slate-500 dark:text-slate-400 flex-shrink-0 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          expand_more
        </span>
      </button>
      <div
        id={`faq-a-${item.id}`}
        role="region"
        aria-hidden={!isOpen}
        className={`border-t border-slate-200 dark:border-slate-700 transition-all ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <p className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {item.answer}
        </p>
      </div>
    </div>
  );
}

FaqAccordionItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    question: PropTypes.string.isRequired,
    answer: PropTypes.string.isRequired,
  }).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const filteredFaqs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return FAQ_ITEMS;
    return FAQ_ITEMS.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const handleToggle = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-3xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-custom dark:text-white mb-2">Help & FAQ</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Find answers to common questions about CukaiPro and Malaysian tax filing.
            </p>
          </div>

          <div className="mb-6">
            <label htmlFor="faq-search" className="sr-only">
              Search FAQs
            </label>
            <div className="relative">
              <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xl">
                search
              </span>
              <input
                id="faq-search"
                type="search"
                placeholder="Search FAQs (e.g. deductions, SST, EA form…)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-custom dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                aria-label="Search FAQs"
              />
            </div>
          </div>

          <section className="space-y-3 mb-10" aria-label="Frequently asked questions">
            {filteredFaqs.length === 0 ? (
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-8 text-center">
                <span className="material-icons text-4xl text-slate-400 dark:text-slate-500 mb-3 block">
                  search_off
                </span>
                <p className="text-slate-600 dark:text-slate-400">No FAQs match your search.</p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-3 text-sm text-primary font-medium hover:underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              filteredFaqs.map((item) => (
                <FaqAccordionItem
                  key={item.id}
                  item={item}
                  isOpen={expandedId === item.id}
                  onToggle={handleToggle}
                />
              ))
            )}
          </section>

          <div className="rounded-xl border border-primary/30 dark:border-emerald-500/30 bg-primary/5 dark:bg-emerald-500/5 p-6">
            <h2 className="text-lg font-semibold text-slate-custom dark:text-white mb-2">
              Still need help?
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Our support team is here for you. Reach out for assistance with CukaiPro or
              Malaysian tax questions.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="mailto:support@cukaipro.my"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                <span className="material-icons text-lg">mail</span>
                Contact support
              </a>
              <Link
                to="/dashboard/settings"
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="material-icons text-lg">settings</span>
                Settings
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
