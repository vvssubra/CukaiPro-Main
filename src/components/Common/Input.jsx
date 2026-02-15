import { forwardRef } from 'react';
import PropTypes from 'prop-types';

export const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      required = false,
      fullWidth = false,
      className = '',
      type = 'text',
      ...props
    },
    ref
  ) => {
    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={`
            w-full px-4 py-2.5 rounded-lg 
            border ${error ? 'border-red-500' : 'border-slate-200 dark:border-primary/30'}
            bg-white dark:bg-primary/5 
            text-slate-900 dark:text-white 
            placeholder-slate-400 dark:placeholder-slate-500
            focus:ring-2 focus:ring-primary focus:border-primary 
            transition-all outline-none
            disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  required: PropTypes.bool,
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
  type: PropTypes.string,
};

export default Input;
