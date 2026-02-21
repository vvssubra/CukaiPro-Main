import { Component } from 'react';
import PropTypes from 'prop-types';
import * as Sentry from '@sentry/react';
import { logger } from '../../utils/logger';

export function ErrorFallback({ error, onReset }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-custom rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-icons text-red-600 dark:text-red-400 text-3xl">
            error_outline
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Oops! Something went wrong
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          We&apos;re sorry for the inconvenience. Please try refreshing the page or contact
          support if the problem persists.
        </p>
        {import.meta.env.DEV && error && (
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-mono text-red-800 dark:text-red-300 break-all">
              {error.toString()}
            </p>
          </div>
        )}
        <div className="flex gap-4 justify-center">
          <button
            type="button"
            onClick={onReset}
            className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition-all"
          >
            Try Again
          </button>
          <button
            type="button"
            onClick={() => (window.location.href = '/')}
            className="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}

ErrorFallback.propTypes = {
  error: PropTypes.instanceOf(Error),
  onReset: PropTypes.func.isRequired,
};

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
    Sentry.captureException(error, { extra: { componentStack: errorInfo?.componentStack } });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-custom rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-icons text-red-600 dark:text-red-400 text-3xl">
                error_outline
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Oops! Something went wrong
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              We&apos;re sorry for the inconvenience. Please try refreshing the page or contact
              support if the problem persists.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm font-mono text-red-800 dark:text-red-300 break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
            <div className="flex gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition-all"
              >
                Try Again
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
};

export default ErrorBoundary;
