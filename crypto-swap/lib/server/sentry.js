import * as Sentry from '@sentry/nextjs';

let initialized = false;

export function initServerSentry() {
  if (initialized || !process.env.SENTRY_DSN) return;

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: process.env.SENTRY_TRACES_SAMPLE_RATE ? parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE) : 0.05,
    environment: process.env.NODE_ENV || 'development',
    serverName: 'BoltSwap-Server',
    debug: process.env.NODE_ENV !== 'production',
  });

  initialized = true;
}

export function captureServerException(error, context = {}) {
  if (!initialized) return;
  Sentry.captureException(error, { extra: context });
}
