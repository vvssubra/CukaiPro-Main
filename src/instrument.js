/**
 * Sentry initialization - must be imported first in main.jsx.
 * Only initializes when VITE_SENTRY_DSN is set (typically in production).
 */
import * as Sentry from '@sentry/react';

const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE,
    enabled: !!sentryDsn,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,
    beforeSend(event, hint) {
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }
      if (event.request?.headers) {
        delete event.request.headers['Authorization'];
        delete event.request.headers['Cookie'];
      }
      const message = event.message || hint?.originalException?.message || '';
      const sensitivePatterns = [
        /password/i,
        /token/i,
        /api[_-]?key/i,
        /secret/i,
        /\d{6}-\d{2}-\d{4}/,
      ];
      if (sensitivePatterns.some((p) => p.test(message))) {
        return null;
      }
      return event;
    },
  });
}
