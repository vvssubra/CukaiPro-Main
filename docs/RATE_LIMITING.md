# Rate Limiting

This document describes where rate limiting is applied in CukaiPro and recommendations for additional limits.

## Implemented

### support-chat Edge Function

The **support-chat** Edge Function (used by the support widget) enforces in-function rate limiting:

- **Per IP:** 10 requests per minute. Identified via `x-forwarded-for` or `x-real-ip`. Exceeding returns **429** with `Retry-After`.
- **Per session_id:** 20 requests per minute per widget session. Exceeding returns **429** with `Retry-After`.

This reduces spam, abuse, and storage exhaustion from unauthenticated callers. The function also requires the Supabase anon key in the `Authorization` header (see [SUPPORT_WIDGET_SETUP.md](SUPPORT_WIDGET_SETUP.md)).

## Recommended (future)

- **Edge / gateway:** Add rate limiting at Supabase Edge or Vercel for sensitive and unauthenticated endpoints so limits apply across all function instances.
- **Per-user / per-org:** Consider per-user or per-org limits for authenticated Edge Functions (e.g. **myinvois-submit**, **send-invite-email**) to prevent abuse by a single account or organization.

See [SECURITY_ASSESSMENT_REPORT.md](SECURITY_ASSESSMENT_REPORT.md) for the full security context.
