import PropTypes from 'prop-types';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  type = 'button',
  onClick,
  className = '',
  ...props
}) {
  const baseStyles = 'font-semibold rounded-lg transition-all inline-flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary: 'bg-primary text-white hover:bg-opacity-90 focus:ring-primary disabled:bg-primary/50',
    secondary: 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600 focus:ring-slate-400',
    outline: 'border-2 border-primary text-primary hover:bg-primary/5 focus:ring-primary disabled:border-primary/50 disabled:text-primary/50',
    ghost: 'text-primary hover:bg-primary/5 focus:ring-primary',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  fullWidth: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default Button;
