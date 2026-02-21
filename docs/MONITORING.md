# Error Monitoring with Sentry

CukaiPro uses [Sentry](https://sentry.io) for error monitoring in production. This document explains how to set it up and what is captured.

## Setup

### 1. Create a Sentry Project

1. Sign up or log in at [sentry.io](https://sentry.io)
2. Create a new project and select **React** as the platform
3. Copy the **DSN** (Data Source Name) from your project settings

### 2. Add the DSN to Environment

Create or update your `.env` file in the project root:

```env
VITE_SENTRY_DSN=https://your-key@your-org.ingest.sentry.io/project-id
```

- Use `.env.local` for local overrides (never commit secrets)
- Add `.env.local` to `.gitignore` if it contains your production DSN
- Sentry **only initializes** when `VITE_SENTRY_DSN` is set, so development and preview builds stay clean by default

### 3. Production Deployment

Set `VITE_SENTRY_DSN` in your production environment (e.g. Vercel, Netlify) so the app can report errors there.

## What Is Captured

- **React rendering errors** – via `Sentry.ErrorBoundary` and React 19 error handlers
- **Unhandled promise rejections** – captured automatically
- **Uncaught exceptions** – captured automatically
- **Component stack traces** – when available for better debugging

## Data Filtering

A `beforeSend` hook filters sensitive data before events are sent:

- Removes `user.email` and `user.ip_address`
- Removes `Authorization` and `Cookie` headers
- Drops events whose messages match: `password`, `token`, `api_key`, `secret`, or Malaysian NRIC-like patterns

Extend the patterns in `src/instrument.js` to match your privacy needs.

## Source Maps

For readable stack traces in production, upload source maps during build. Example with Vite:

```bash
npx @sentry/wizard@latest -i sourcemaps
```

Follow the wizard prompts to configure source map uploads for your setup.

## Verify Setup

1. Set `VITE_SENTRY_DSN` in `.env`
2. Run the app and trigger a test error (e.g. a button that throws)
3. Check your Sentry project's Issues page for the new event
