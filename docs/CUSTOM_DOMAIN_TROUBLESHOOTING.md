# Custom Domain Not Opening – Troubleshooting

Use this checklist when your Vercel deployment is **Ready** but the custom domain (e.g. `cukalpro.vvsdigitalsolutions.com`) does not open or auth fails.

---

## 1. Isolate the problem: domain vs app

**Try these in order:**

- Open **https://cukai-pro-main-ae4n.vercel.app** (or the exact `*.vercel.app` URL from your deployment).
  - If it **loads fine**: the app build is OK; the issue is specific to the custom domain (DNS, SSL, or Vercel domain status).
  - If it **also hangs or errors**: the issue is app/runtime (e.g. Supabase auth, env, or a crash). Fix that first, then retest the custom domain.

- When opening your custom domain (e.g. **https://cukalpro.vvsdigitalsolutions.com**), note exactly what you see:
  - Browser error (e.g. “Can’t connect”, “SSL error”, “Site not found”, “Too many redirects”).
  - Blank page / endless loading.
  - Any error message in the page or in DevTools (F12 → Console and Network).

That distinction drives the next steps.

---

## 2. Confirm the domain name (possible typo)

If the dashboard shows **cukalpro** (with an “l”) but you intended **cukaipro** (with an “i”):

- Either add the correct domain in Vercel (Domains → Add) and set DNS for that hostname,
- Or keep using **cukalpro** and ensure you open exactly `https://cukalpro.vvsdigitalsolutions.com` (and that DNS is set for this hostname).

Use one consistent hostname in both DNS and Vercel.

---

## 3. DNS configuration

For a custom subdomain on Vercel (e.g. `cukalpro.vvsdigitalsolutions.com`):

1. In **Vercel** → Project → **Domains**. Click your custom domain.
2. Note the **required DNS record** (e.g. CNAME `cukalpro` → `cname.vercel-dns.com`).
3. In your **DNS provider** (where `vvsdigitalsolutions.com` is managed), add or fix that CNAME record.
4. Wait for propagation (often 5–60 minutes; can be up to 48 hours).
5. In Vercel, check that the domain shows as **Valid** and that SSL is issued.

For a **root domain** (e.g. `vvsdigitalsolutions.com`), use Vercel’s A records (e.g. 76.76.21.21) as shown in Vercel Domains.

---

## 4. Vercel domain and SSL

- In **Vercel → Project → Domains**, confirm your custom domain status is **Valid** (not “Invalid Configuration” or “Pending”).
- If it’s pending, follow Vercel’s instructions (usually the CNAME step above).
- SSL is issued by Vercel once DNS is valid; no code changes are required.

---

## 5. Supabase URL configuration (for auth and redirects)

If the custom domain **loads** but login/signup fails, redirects break, or the app hangs after load:

1. **Supabase Dashboard** → your project → **Authentication** → **URL Configuration**.
2. Set **Site URL** to your app’s origin, e.g. `https://cukalpro.vvsdigitalsolutions.com` (use the exact URL you open in the browser).
3. Under **Redirect URLs**, add:
   - `https://cukalpro.vvsdigitalsolutions.com/**`
   - (or `https://cukaipro.vvsdigitalsolutions.com/**` if that’s your hostname).
4. Optionally add the Vercel deployment URL for previews: `https://cukai-pro-main-ae4n.vercel.app/**`.

**Tip:** Open the app’s **Debug: Build Config** page (`/debug/config`) on your custom domain; it shows the current origin so you can copy it into Supabase.

---

## 6. Runtime errors when opening via custom domain

If the **vercel.app** URL works but the custom domain shows a blank page or endless loading:

- Open your custom domain, then **F12 → Console** and **Network**.
- Look for errors (e.g. CORS, failed fetch to Supabase or API).
- Check **Network** for requests that fail (4xx/5xx or blocked).

If Supabase **Site URL** / **Redirect URLs** are wrong, auth redirects can fail or hang.

---

## 7. Cache and browser

- Try an **incognito/private** window or another browser.
- If you recently changed DNS or Supabase URLs, do a hard refresh (Ctrl+Shift+R / Cmd+Shift+R) or clear cache for the site.

---

## Summary checklist

| Step | Action |
|------|--------|
| 1 | Open **cukai-pro-main-ae4n.vercel.app**; if it works, the issue is domain-specific. |
| 2 | Confirm you use **cukalpro** or **cukaipro** consistently (DNS + Vercel + browser). |
| 3 | In DNS, add CNAME for the chosen subdomain → `cname.vercel-dns.com` (or value from Vercel). |
| 4 | In Vercel → Domains, ensure the custom domain is **Valid** and SSL is active. |
| 5 | In Supabase → Auth → URL Configuration, set **Site URL** and **Redirect URLs** to your custom domain (e.g. `https://cukalpro.vvsdigitalsolutions.com`). |
| 6 | If the domain loads but app hangs, check F12 Console/Network and fix any Supabase/auth or CORS errors. |

No code changes are required for “domain not opening”; the fix is DNS, Vercel domain status, and Supabase URL configuration.
