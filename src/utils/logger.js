const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const isDevelopment = import.meta.env.DEV;
const currentLogLevel = isDevelopment ? LOG_LEVELS.DEBUG : LOG_LEVELS.WARN;

class Logger {
  constructor(context = 'App') {
    this.context = context;
  }

  log(level, message, ...args) {
    if (LOG_LEVELS[level] < currentLogLevel) {
      return;
    }

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${this.context}] [${level}]`;

    switch (level) {
      case 'DEBUG':
        console.debug(prefix, message, ...args);
        break;
      case 'INFO':
        console.info(prefix, message, ...args);
        break;
      case 'WARN':
        console.warn(prefix, message, ...args);
        break;
      case 'ERROR':
        console.error(prefix, message, ...args);
        break;
      default:
        console.log(prefix, message, ...args);
    }

    // In production, send errors to error reporting service
    if (!isDevelopment && level === 'ERROR') {
      this.reportError(message, args);
    }
  }

  debug(message, ...args) {
    this.log('DEBUG', message, ...args);
  }

  info(message, ...args) {
    this.log('INFO', message, ...args);
  }

  warn(message, ...args) {
    this.log('WARN', message, ...args);
  }

  error(message, ...args) {
    this.log('ERROR', message, ...args);
  }

  reportError(message, args) {
    // Integrate with error reporting service (e.g., Sentry)
    // For now, just log to console
    if (import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true') {
      console.error('Error reporting:', { message, args });
    }
  }
}

// Create default logger instance
export const logger = new Logger();

// Export Logger class for creating context-specific loggers
export default Logger;
