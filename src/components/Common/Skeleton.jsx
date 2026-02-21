import PropTypes from 'prop-types';

/**
 * Skeleton loader for loading states.
 * @param {string} className - Additional Tailwind classes
 * @param {string} variant - 'text' | 'circular' | 'rectangular' | 'rounded'
 */
function Skeleton({ className = '', variant = 'rounded' }) {
  const base = 'animate-pulse bg-slate-200 dark:bg-slate-700';
  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg',
  };
  return (
    <div
      className={`${base} ${variants[variant] || variants.rounded} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

Skeleton.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['text', 'circular', 'rectangular', 'rounded']),
};

export default Skeleton;
