import { useState } from 'react';
import ContentPageLayout from './ContentPageLayout';
import { FAQ_ITEMS } from '../../data/faqData';
import { Link } from 'react-router-dom';

export default function HelpCenterPage() {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <ContentPageLayout
      title="Help Center"
      subtitle="Frequently asked questions about CukaiPro. Log in to your account for the full Help experience and in-app support."
    >
      <div className="space-y-8">
        <div className="space-y-4">
          {FAQ_ITEMS.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-inset rounded-xl"
                aria-expanded={expandedId === item.id}
              >
                <span className="font-medium text-slate-custom dark:text-white">{item.question}</span>
                <span className={`material-icons text-slate-500 dark:text-slate-400 flex-shrink-0 transition-transform ${expandedId === item.id ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>
              {expandedId === item.id && (
                <div className="px-5 pb-4 pt-0 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-slate-custom/80 dark:text-gray-300 text-sm leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-primary/10 dark:border-white/10 bg-primary/5 dark:bg-white/5 p-8">
          <h2 className="text-lg font-display font-bold text-slate-custom dark:text-white mb-2">Need more help?</h2>
          <p className="text-slate-custom/70 dark:text-gray-400 text-sm mb-4">
            Log in to access the full Help section and in-app support chat, or email us anytime.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 font-semibold text-primary dark:text-emerald-400 hover:underline"
            >
              Log in to Help <span className="material-icons text-lg">arrow_forward</span>
            </Link>
            <a
              href="mailto:support@cukaipro.my"
              className="inline-flex items-center gap-2 font-semibold text-primary dark:text-emerald-400 hover:underline"
            >
              support@cukaipro.my
            </a>
          </div>
        </div>
      </div>
    </ContentPageLayout>
  );
}
