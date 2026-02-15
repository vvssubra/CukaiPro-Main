import PropTypes from 'prop-types';

export function Card({ children, className = '', padding = 'md', hoverable = false, ...props }) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`
        bg-white dark:bg-slate-custom 
        border border-slate-200 dark:border-slate-700 
        rounded-xl shadow-sm
        ${paddings[padding]}
        ${hoverable ? 'hover:shadow-md transition-shadow' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  padding: PropTypes.oneOf(['none', 'sm', 'md', 'lg']),
  hoverable: PropTypes.bool,
};

export default Card;
