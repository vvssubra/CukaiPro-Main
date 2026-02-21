import PropTypes from 'prop-types';

/**
 * Inline "vs last year" indicator for YoY percentage change.
 * @param {object} props
 * @param {number} props.percent - YoY change in percent (e.g. 12.5 for +12.5%)
 * @param {boolean} [props.inverse] - If true, positive is bad (e.g. for tax) – green when percent is negative
 */
function VsLastYearIndicator({ percent, inverse = false }) {
  if (percent == null || Number.isNaN(percent)) return null;

  const p = Number(percent);
  const isPositive = p > 0;
  const isNeutral = p === 0;
  const good = inverse ? !isPositive : isPositive;

  const colorClass = isNeutral
    ? 'text-slate-500 dark:text-slate-400'
    : good
    ? 'text-emerald-600 dark:text-emerald-400'
    : 'text-amber-600 dark:text-amber-400';

  const sign = p > 0 ? '+' : '';
  const label = `${sign}${p.toFixed(1)}% vs last year`;

  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider ${colorClass}`} title={label}>
      {label}
    </span>
  );
}

VsLastYearIndicator.propTypes = {
  percent: PropTypes.number,
  inverse: PropTypes.bool,
};

export default VsLastYearIndicator;
