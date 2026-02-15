import PropTypes from 'prop-types';

export function Loading({ size = 'md', text = 'Loading...', fullScreen = false }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`${sizeClasses[size]} relative`}>
        <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      {text && (
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background-light dark:bg-background-dark z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}

Loading.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  text: PropTypes.string,
  fullScreen: PropTypes.bool,
};

export default Loading;
