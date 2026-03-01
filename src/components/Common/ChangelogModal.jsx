import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

const STORAGE_KEY = 'cukaipro_changelog_seen_version';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'features', label: 'New' },
  { key: 'bugFixes', label: 'Bug Fixes' },
  { key: 'improvements', label: 'Improved' },
];

const ITEM_CONFIG = {
  features: { icon: 'auto_awesome', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  bugFixes: { icon: 'bug_report', color: 'text-red-500', bg: 'bg-red-500/10' },
  improvements: { icon: 'trending_up', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
};

function ChangelogModal({ changelog }) {
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const modalRef = useRef(null);

  const latestVersion = changelog?.[0]?.version;
  const latestEntry = changelog?.[0];

  useEffect(() => {
    if (!latestVersion) return;
    const seen = localStorage.getItem(STORAGE_KEY);
    if (seen === latestVersion) return;
    const timer = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(timer);
  }, [latestVersion]);

  const handleClose = useCallback(() => {
    setVisible(false);
    if (latestVersion) {
      localStorage.setItem(STORAGE_KEY, latestVersion);
    }
  }, [latestVersion]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (visible && e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [visible, handleClose]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        handleClose();
      }
    };
    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [visible, handleClose]);

  const items = useMemo(() => {
    if (!latestEntry) return [];
    const categories = activeTab === 'all'
      ? ['features', 'bugFixes', 'improvements']
      : [activeTab];
    return categories.flatMap((cat) =>
      (latestEntry[cat] || []).map((text) => ({ text, type: cat }))
    );
  }, [latestEntry, activeTab]);

  if (!visible || !latestEntry) return null;

  const formattedDate = new Date(latestEntry.date + 'T00:00:00').toLocaleDateString('en-MY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="changelog-modal-title"
    >
      <div
        ref={modalRef}
        className="max-w-md w-full rounded-2xl shadow-2xl bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-primary rounded-t-2xl p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 id="changelog-modal-title" className="text-white font-display font-bold text-lg">
                v{latestEntry.version}
              </h2>
              {latestEntry.label && (
                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
                  {latestEntry.label}
                </span>
              )}
            </div>
            <p className="text-white/70 text-sm mt-1">{formattedDate}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-white/70 hover:text-white transition-colors rounded-lg p-1"
            aria-label="Close changelog"
          >
            <span className="material-icons text-xl">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 px-5">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-2.5 text-xs font-semibold transition-colors ${
                activeTab === tab.key
                  ? 'text-primary dark:text-emerald-400 border-b-2 border-primary dark:border-emerald-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="max-h-[320px] overflow-y-auto p-4 space-y-2">
          {items.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
              No items in this category.
            </p>
          ) : (
            items.map((item, i) => {
              const config = ITEM_CONFIG[item.type];
              return (
                <div
                  key={`${item.type}-${i}`}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/40"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${config.bg}`}>
                    <span className={`material-icons text-base ${config.color}`}>{config.icon}</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-snug pt-1">
                    {item.text}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {changelog.length} release{changelog.length !== 1 ? 's' : ''}
          </span>
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}

ChangelogModal.propTypes = {
  changelog: PropTypes.arrayOf(
    PropTypes.shape({
      version: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      label: PropTypes.string,
      features: PropTypes.arrayOf(PropTypes.string).isRequired,
      bugFixes: PropTypes.arrayOf(PropTypes.string).isRequired,
      improvements: PropTypes.arrayOf(PropTypes.string).isRequired,
    })
  ).isRequired,
};

export default ChangelogModal;
