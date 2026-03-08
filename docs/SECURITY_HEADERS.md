# Security Headers

CukaiPro applies the following security headers when deployed on Vercel (see `vercel.json`). They reduce risk of clickjacking, MIME sniffing, and help enforce HTTPS and referrer control.

## Headers

| Header | Value | Purpose |
|--------|--------|---------|
| **X-Frame-Options** | `SAMEORIGIN` | Prevents the app from being embedded in iframes on other origins (clickjacking). |
| **X-Content-Type-Options** | `nosniff` | Stops browsers from MIME-sniffing responses away from the declared type. |
| **Strict-Transport-Security** | `max-age=31536000; includeSubDomains` | Enforces HTTPS for 1 year and applies to subdomains. |
| **Referrer-Policy** | `strict-origin-when-cross-origin` | Limits referrer sent on cross-origin requests. |
| **Content-Security-Policy** | See below | Restricts where resources can be loaded from. |

## Content-Security-Policy (CSP)

The CSP is tuned for the CukaiPro stack (Vite SPA, Supabase, Stripe, Google Fonts, Sentry). Current directives:

- **default-src 'self'** – Only same-origin by default.
- **connect-src** – `'self'`, `https://*.supabase.co`, `https://api.stripe.com`, `wss://*.supabase.co`, `https://*.cukaipro.com` (API / Realtime).
- **script-src** – `'self'`, `'unsafe-inline'`, `'unsafe-eval'`, `https://fonts.googleapis.com`, `https://*.sentry.io`, `https://cdnjs.cloudflare.com` (support widget Capture uses html2canvas from cdnjs).
- **style-src** – `'self'`, `'unsafe-inline'`, `https://fonts.googleapis.com`, `https://fonts.gstatic.com`.
- **img-src** – `'self'`, `data:`, `https:`, `blob:` (e.g. screenshots in bug reports admin, avatars).
- **font-src** – `'self'`, `https://fonts.gstatic.com`.
- **frame-src** – `https://js.stripe.com`, `https://hooks.stripe.com`, `https://*.sentry.io`.
- **base-uri 'self'** – Restricts base tag URLs.
- **form-action 'self'** – Forms may only submit to same origin.

If you add new third-party scripts or endpoints, update `vercel.json` and this doc so CSP stays accurate.

## Relaxing or tightening

- **Stricter CSP:** Remove `'unsafe-inline'` / `'unsafe-eval'` by using nonces or hashes for scripts (requires build/config changes).
- **X-Frame-Options:** Use `DENY` instead of `SAMEORIGIN` if the app must never be framed.
- **HSTS:** Only set in production over HTTPS; Vercel applies it for the deployed domain.
