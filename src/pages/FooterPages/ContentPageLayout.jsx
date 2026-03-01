import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * Premium layout for public footer/content pages: consistent max-width, back link, and prose.
 */
function ContentPageLayout({ title, subtitle, children, backToHome = true }) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-background-light dark:from-background-dark dark:to-background-dark/95">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {backToHome && (
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-custom/60 dark:text-gray-400 hover:text-primary dark:hover:text-emerald-400 transition-colors mb-12 group"
          >
            <span className="material-icons text-base transition-transform group-hover:-translate-x-0.5">arrow_back</span>
            Back to home
          </Link>
        )}
        <header className="mb-14 sm:mb-20">
          <div className="w-14 h-0.5 bg-primary rounded-full mb-8" aria-hidden="true" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-slate-custom dark:text-white leading-[1.1]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-5 text-lg sm:text-xl text-slate-custom/70 dark:text-gray-400 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </header>
        <div className="prose prose-slate dark:prose-invert prose-headings:font-display prose-headings:font-bold prose-a:text-primary dark:prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline prose-lg max-w-none break-words rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/5 shadow-sm shadow-slate-200/50 dark:shadow-none p-8 sm:p-10">
          {children}
        </div>
      </div>
    </main>
  );
}

ContentPageLayout.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: PropTypes.node.isRequired,
  backToHome: PropTypes.bool,
};

export default ContentPageLayout;
