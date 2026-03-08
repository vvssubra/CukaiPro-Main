# CukaiPro Security Assessment Report

**Date:** 2025-03-08  
**Methodology:** Vulnerability Scanner skill (OWASP Top 10:2025, attack surface mapping, code pattern analysis)  
**Scope:** CukaiPro codebase (React frontend, Supabase Edge Functions, RLS, dependencies)

---

## Executive Summary

**Remediation status (as of implementation):** The findings below have been addressed. See Recommended Next Steps and the individual remediation notes for what was done.

| Severity | Count |
|----------|-------|
| Critical | 1 *(Remediated)* |
| High     | 2 *(Remediated)* |
| Medium   | 2 *(Remediated)* |
| Low      | 2 *(Partially remediated / documented)* |

**Critical:** Bug reports admin allowed anyone with the anon key to read/update support data — **fixed** with support_admins RLS and in-app admin at `/dashboard/admin/bug-reports`; hardcoded keys removed.

**High:** support-chat had no authentication or rate limiting — **fixed** with anon-key check and in-function rate limiting (per IP and per session). DOMPurify vulnerability — **fixed** via `npm audit fix` (transitive from jspdf, now 3.3.2).

**Medium:** Missing security headers — **fixed** in vercel.json (see docs/SECURITY_HEADERS.md). MyInvois identity_url/api_url SSRF — **fixed** with allowlist in _shared/myinvoisAllowlist.ts.

**Low:** Rate limiting — support-chat now rate-limited; see docs/RATE_LIMITING.md. dompurify optional dependency — resolved with audit fix.

---

## 1. Attack Surface Summary

| Layer | Entry Points | Auth / Notes |
|-------|--------------|--------------|
| **Frontend** | React SPA, Vite | Supabase Auth (JWT in localStorage) |
| **Supabase PostgREST** | Tables (organizations, invoices, tax_deductions, etc.) | RLS + JWT; per-org policies |
| **Edge Functions** | create-portal-session, create-checkout-session, myinvois-*, send-invite-email, save-myinvois-credentials, support-chat, stripe-webhook | Most: JWT required; stripe-webhook: signature only; support-chat: **none** |
| **Support widget** | support-widget.js → support-chat | Anon key only; no user auth |
| **Bug reports admin** | docs/bug-reports-admin.html | Anon key hardcoded; RLS allows anon SELECT/UPDATE |

---

## 2. Findings

### CRITICAL – A01: Broken Access Control (Bug Reports)

**What:** `bug_reports` and `bug_report_messages` have RLS policies that allow **anon** to SELECT all rows and anon to UPDATE `bug_reports`. The admin page `docs/bug-reports-admin.html` embeds Supabase URL and anon key in the file.

**Where:**
- `supabase/migrations/20250224100000_bug_reports.sql` (policies)
- `docs/bug-reports-admin.html` (lines 109–110: hardcoded `SUPABASE_URL`, `ANON_KEY`)

**Why:** Design was “admin page uses anon” without restricting who can act as anon. The anon key is public in the repo, so anyone can:
- Read all support chat messages and PII (page_url, user_email, screenshots).
- Update status of any bug report (open/resolved/closed).

**Impact:** Full read/write of support data; privacy breach and data integrity risk.

**Remediation:**
1. Remove anon SELECT/UPDATE on `bug_reports` and `bug_report_messages`.
2. Add RLS so only **authenticated** users with a dedicated “support admin” role (e.g. via `organization_members` or a separate `support_admins` table) can SELECT/UPDATE these tables.
3. Serve the admin UI only to authenticated support admins and pass JWT from the app (do not hardcode keys in static HTML).
4. Do not commit project-specific anon keys in `bug-reports-admin.html`; use env/config at build or runtime.

---

### HIGH – support-chat Unauthenticated and Unrate-Limited

**What:** The `support-chat` Edge Function does not verify JWT. It accepts any POST with `message` and uses the service role to insert into `bug_reports` and `bug_report_messages`.

**Where:** `supabase/functions/support-chat/index.ts`

**Why:** Intent is to allow the public widget to submit without user login, but that also allows any client that knows the function URL to send arbitrary requests.

**Impact:** Spam, abuse, storage exhaustion, and potential injection if backend or admin ever render content unsafely (admin currently uses `escHtml()` — good).

**Remediation:**
1. Enforce Supabase anon key (verify `Authorization: Bearer <anon_key>` or equivalent) so only your frontend/origin can call it; optionally restrict by CORS and/or API gateway.
2. Add rate limiting (per IP or per session_id) in the function or at the edge (e.g. Supabase / Vercel rate limits).
3. Optionally require a signed/captcha token for unauthenticated submissions.

---

### HIGH – Vulnerable Dependency: DOMPurify (CWE-79 XSS)

**What:** `npm audit` reports a moderate-severity XSS vulnerability in DOMPurify (GHSA-v2wj-7wpq-c8vv, CVSS 6.1). Range affected: 3.1.3–3.3.1. Current lockfile has 3.3.1.

**Where:** Transitive optional dependency (e.g. from a dependency that lists `dompurify` in optionalDependencies — e.g. a PDF/export or html2canvas-related package).

**Impact:** If DOMPurify is used to sanitize user-controlled HTML, the vulnerability could allow XSS in that context.

**Remediation:**
1. Identify which direct dependency pulls in `dompurify`:  
   `npm ls dompurify`
2. Upgrade the parent and/or add an override/resolution to force a patched DOMPurify when available.
3. If DOMPurify is not used in your own code, consider excluding it or replacing the parent dependency to avoid pulling it in.
4. Re-run `npm audit` after changes.

---

### MEDIUM – Missing Security Headers (A05 / Misconfiguration)

**What:** No security headers found in the app (no CSP, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, Referrer-Policy).

**Where:** `index.html` and any server/CDN config (e.g. Vercel). Frontend is the main delivery point.

**Impact:** Higher risk of clickjacking, MIME sniffing, and XSS impact; no explicit HTTPS enforcement or referrer control.

**Remediation:** *(Implemented)* Security headers are now set in `vercel.json` and documented in `docs/SECURITY_HEADERS.md`: X-Frame-Options (SAMEORIGIN), X-Content-Type-Options (nosniff), Strict-Transport-Security, Referrer-Policy, and Content-Security-Policy tuned for Supabase, Stripe, and Google Fonts.

---

### MEDIUM – MyInvois identity_url / api_url SSRF Surface (A01 / A10)

**What:** `save-myinvois-credentials` accepts optional `identity_url` and `api_url` from the request body and stores them. These are later used in server-side `fetch()` calls (token and API requests). Only org owner/admin can set them, but values are not restricted to LHDN endpoints.

**Where:**
- `supabase/functions/save-myinvois-credentials/index.ts` (body.identity_url, body.api_url)
- `supabase/functions/_shared/loadOrgCredentials.ts` and all MyInvois functions that use `identityUrl`/`apiUrl`

**Impact:** A compromised or malicious org admin could point their org to an attacker-controlled server and leak client_id/client_secret or other data sent to that server. Risk is scoped to that org.

**Remediation:**
1. Allowlist allowed base hosts (e.g. `identity.myinvois.hasil.gov.my`, `api.myinvois.hasil.gov.my`, and sandbox equivalents).
2. Reject or ignore `identity_url`/`api_url` that do not match the allowlist; do not store arbitrary URLs.
3. Optionally validate URL format and scheme (HTTPS only).

---

### LOW – No Rate Limiting on APIs

**What:** No application-level rate limiting was found on Edge Functions or frontend API usage.

**Where:** All Edge Functions and any proxy/gateway in front of them.

**Impact:** Brute force, abuse, and DoS are easier (especially for unauthenticated or cheap-to-call endpoints like support-chat).

**Remediation:** *(Partially implemented)* support-chat now has in-function rate limiting (per IP and per session_id); see `docs/RATE_LIMITING.md`. For other endpoints, add rate limiting at the edge (Supabase, Vercel, or API gateway) and consider per-user or per-org limits for authenticated functions (e.g. myinvois-submit, send-invite-email).

---

### LOW – dompurify Optional Dependency and Audit Fix

**What:** `dompurify` appears as an optional dependency of another package. Fix may be available (`npm audit` reported fixAvailable: true).

**Remediation:**
1. Run `npm audit fix` and re-run tests.
2. If fix is not applied automatically, run `npm ls dompurify` and upgrade or override as in the HIGH finding above.

---

## 3. Positive Observations

| Area | Finding |
|------|---------|
| **Secrets** | No hardcoded API keys or secrets in app code; Edge Functions use `Deno.env.get()` for STRIPE_*, CREDENTIALS_ENCRYPTION_KEY, RESEND_API_KEY, etc. |
| **Auth in Edge Functions** | Sensitive functions (save-myinvois-credentials, myinvois-submit, create-checkout-session, etc.) validate JWT via `supabase.auth.getUser()` and enforce org membership / role where needed. |
| **Stripe webhook** | Signature verification with `STRIPE_WEBHOOK_SIGNING_SECRET` before processing (fail-closed). |
| **Credentials storage** | MyInvois client_id/client_secret encrypted at rest (CREDENTIALS_ENCRYPTION_KEY); only owner/admin can save. |
| **RLS** | Core tables (organizations, organization_members, tax_deductions, audit_log, etc.) use RLS with org membership checks. |
| **XSS in support widget** | Message content is set via `textContent`, not `innerHTML`. |
| **Bug reports admin** | User-controlled content in the admin UI is escaped with `escHtml()` before insertion into the DOM. |
| **SQL** | No raw SQL concatenation with user input; parameterized usage via Supabase client. |
| **401 handling** | API interceptor clears auth and redirects to login on 401. |

---

## 4. Checklist Summary (OWASP-Oriented)

| Category | Status |
|----------|--------|
| A01 Broken Access Control | ✅ Bug reports fixed (support_admins RLS + in-app admin); ✅ Other tables and Edge Functions |
| A02 Cryptographic Failures | ✅ Credentials encrypted; TLS by Supabase/host |
| A03 Injection | ✅ Parameterized queries; textContent for widget; escHtml in admin |
| A05 Security Misconfiguration | ✅ Security headers in vercel.json (see docs/SECURITY_HEADERS.md) |
| A06 Vulnerable Components | ✅ DOMPurify resolved (npm audit fix; 3.3.2 transitive from jspdf) |
| A07 Authentication | ✅ Supabase Auth; ✅ JWT on Edge Functions; ✅ support-chat requires anon key |
| A09 Logging & Alerting | ⚠️ Not assessed in this scan |
| A10 SSRF / Exceptional conditions | ✅ identity_url/api_url allowlisted (see _shared/myinvoisAllowlist.ts); Stripe webhook fails closed |

---

## 5. Recommended Next Steps

1. **Immediate:** Fix bug reports access control (RLS + admin auth) and remove hardcoded keys from the admin page. *(Done: support_admins RLS + in-app admin.)*
2. **Short term:** Add authentication/rate limiting for support-chat *(Done)*; add security headers *(Done)*; resolve DOMPurify *(Done: npm audit fix)*. Allowlist MyInvois URLs *(see follow-up)*.
3. **Follow-up:** Allowlist MyInvois URLs *(Done: see _shared/myinvoisAllowlist.ts)*; add rate limiting for critical and unauthenticated endpoints (support-chat has in-function rate limiting; see docs/RATE_LIMITING.md); consider a dedicated `scripts/security_scan.py` for recurring checks.

---

*Report generated using the Vulnerability Scanner skill (OWASP Top 10:2025, supply chain, exceptional conditions).*
