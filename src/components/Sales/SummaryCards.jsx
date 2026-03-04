import PropTypes from 'prop-types';
import { formatCurrency } from '../../utils/validators';
import Card from '../Common/Card';

/**
 * Reusable summary cards for Sales list pages (Quotation, Invoice, Credit Note).
 * Shows period toggle (Last 365 days / Last 12 months) and status cards with count, % and MYR total.
 * All money via formatCurrency (RM); empty list shows RM 0.00.
 */
function SummaryCards({ period, onPeriodChange, summary, cards, title = 'Summary' }) {
  const totalCount = summary?.totalCount ?? 0;
  const byStatus = summary?.byStatus ?? {};

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
        <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <button
            type="button"
            onClick={() => onPeriodChange('365')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              period === '365'
                ? 'bg-primary text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Last 365 days
          </button>
          <button
            type="button"
            onClick={() => onPeriodChange('12months')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              period === '12months'
                ? 'bg-primary text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Last 12 months
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards.map(({ statusKey, label }) => {
          const stat = byStatus[statusKey] ?? { count: 0, total: 0 };
          const count = Number(stat.count) || 0;
          const total = Number(stat.total) || 0;
          const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
          return (
            <Card key={statusKey} className="p-4">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{count}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {pct}% · {formatCurrency(total)}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

SummaryCards.propTypes = {
  period: PropTypes.oneOf(['365', '12months']).isRequired,
  onPeriodChange: PropTypes.func.isRequired,
  summary: PropTypes.shape({
    totalCount: PropTypes.number,
    byStatus: PropTypes.object,
    totalMYR: PropTypes.number,
  }),
  cards: PropTypes.arrayOf(
    PropTypes.shape({
      statusKey: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  title: PropTypes.string,
};

export default SummaryCards;
