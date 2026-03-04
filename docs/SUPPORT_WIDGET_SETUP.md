# Support Widget Setup Guide

The CukaiPro support widget is the chat bubble on the site. It sends user messages to a backend (Supabase Edge Function or n8n webhook) and shows the reply. This guide shows how to set the backend URL and get it working.

---

## 1. Where to set the URL

The widget reads the backend URL from `window.CUKAIPRO_SUPPORT_FUNCTION_URL`, which is set in **`index.html`** before the widget script loads. The project derives this URL from `VITE_SUPABASE_URL` so it always matches your anon key and avoids "Invalid JWT" errors.

**File:** `index.html` (in the project root)

```html
<script>
  window.CUKAIPRO_SUPPORT_FUNCTION_URL = 'YOUR_BACKEND_URL_HERE';
</script>
<script src="/support-widget.js"></script>
```

Replace `YOUR_BACKEND_URL_HERE` with either:

- **Option A:** Your Supabase Edge Function URL (recommended if you use Supabase), or  
- **Option B:** Your n8n webhook URL.

If this variable is empty or missing, the widget does not load (no chat bubble).

---

## 2. Option A: Use the Supabase Edge Function (included in repo)

The repo includes a small Edge Function `support-chat` that works with the widget out of the box.

### Step 1: Deploy the function

From the project root:

```bash
npx supabase functions deploy support-chat
```

If prompted, log in and select your project. Your function URL will be:

```
https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/support-chat
```

You can see `<YOUR_PROJECT_REF>` in the Supabase dashboard URL or in the deploy output.

### Step 2: Set the URL and anon key

The widget needs the Supabase **anon key** in the request (Supabase requires it for Edge Function calls). The project injects both the function URL and the key from your `.env` at build/dev time:

- Ensure `.env` has **`VITE_SUPABASE_URL`** and **`VITE_SUPABASE_ANON_KEY`** (same as the rest of the app).
- The function URL is **derived** as `VITE_SUPABASE_URL + '/functions/v1/support-chat'`, so the support widget always calls the same Supabase project as your app. Do not hardcode a different function URL in `index.html`.

If you use a different Supabase project only for the support function, you would need to set that project’s URL and anon key in the build (not recommended; use one project for both app and support-chat).

### Step 3: Bug reports → Admin page

Each message from the widget is saved to Supabase so you can view and manage reports in the **Bug Reports Admin** page:

1. **Tables**  
   If `bug_reports` and `bug_report_messages` already exist in your project (Table Editor), skip to step 2. Otherwise run the migration: `npx supabase db push` or apply `supabase/migrations/20250224100000_bug_reports.sql` in the SQL Editor.

2. **Set the Edge Function secret** so the function can write to the database:
   - Supabase Dashboard → Edge Functions → `support-chat` → Secrets
   - Add `SUPABASE_SERVICE_ROLE_KEY` (from Project Settings → API → service_role key).

3. **Deploy the function** (if you changed it or haven’t yet): `npx supabase functions deploy support-chat`

4. **Open the admin page** to see reports: open **`docs/bug-reports-admin.html`** in your browser (or host it). It reads from the same Supabase project and shows message, page URL, screenshot, status, and chat thread. You can change status (open → in progress → resolved) from the table.

### Step 5: Test

Reload the app, open the support widget, and send a message. You should see a reply like: *"Thanks for your message. Our team will get back to you soon..."* and the report will appear in the admin page after refresh.

The included function does not use AI; you can later add Gemini or another API via env and change the reply logic in `supabase/functions/support-chat/index.ts`.

---

## 3. Option B: Use an n8n webhook

If you use n8n (or any HTTP endpoint) for support chat, point the widget to that URL.

### Step 1: Create the webhook in n8n

1. In n8n, add a **Webhook** node.
2. Set **HTTP Method** to `POST`.
3. Set **Path** (e.g. `cukai-support`).
4. Save and activate the workflow.
5. Copy the **Production URL** (e.g. `https://your-n8n.com/webhook/cukai-support`).

### Step 2: Request/response format

The widget sends:

- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Body:** `{ "message": "user text", "session_id": "session_xxx" }`

Your webhook must respond with JSON that includes a reply the widget can show. Any of these shapes work:

- `{ "success": true, "reply": "Your reply text" }`
- `{ "reply": "Your reply text" }`
- `{ "response": "Your reply text" }` or `{ "message": "Your reply text" }`

Optional: include `session_id` in the response to keep the same session.

### Step 3: CORS

Browsers block cross-origin requests unless the server allows your site. Your n8n (or reverse proxy) must send:

- `Access-Control-Allow-Origin: *` or your app origin (e.g. `https://yourapp.vercel.app`)
- `Access-Control-Allow-Headers: content-type`

If CORS is missing, the widget will show: *"Could not reach the server. Check your connection and that the webhook URL is correct."*

### Step 4: Set the URL in `index.html`

```html
<script>
  window.CUKAIPRO_SUPPORT_FUNCTION_URL = 'https://your-n8n.com/webhook/cukai-support';
</script>
```

Use the exact Production URL from the n8n Webhook node.

---

## 4. Checklist

| Step | Action |
|------|--------|
| 1 | Choose backend: Supabase `support-chat` **or** n8n webhook |
| 2 | If Supabase: run `npx supabase functions deploy support-chat` |
| 3 | If n8n: create Webhook node, get Production URL, ensure response has `reply` (or `response`/`message`) and CORS is set |
| 4 | In `index.html`, set `window.CUKAIPRO_SUPPORT_FUNCTION_URL` to that URL |
| 5 | Reload the app and send a test message in the widget |

---

## 5. Troubleshooting

- **Widget not visible**  
  - Check that `CUKAIPRO_SUPPORT_FUNCTION_URL` is set in `index.html` and the script runs after it.

- **"Failed to send message, please try again."**  
  - Backend returned an error or non-JSON. Check backend logs. The widget also shows `data.error` or `data.message` when the server sends them.

- **"Could not reach the server. Check your connection and that the webhook URL is correct."**  
  - Network/CORS issue: wrong URL, backend down, or missing CORS headers. Verify URL in `index.html` and CORS on the backend.

- **"Invalid JWT"**  
  - Supabase Edge Functions require a valid **anon (public)** key — not the service_role key. In Supabase Dashboard → Project Settings → API, use **anon public**. The app derives the support function URL from `VITE_SUPABASE_URL`, so the URL and key always match. Ensure **both** `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in `.env` (and in Vercel for production), that they are for the **same** Supabase project where `support-chat` is deployed, and that the key has no extra spaces/newlines. **Local:** restart the dev server after changing `.env`. **Production:** set both in Vercel → Environment Variables, then **redeploy** so the new build injects them.

- **Supabase function 404**  
  - Deploy with `npx supabase functions deploy support-chat` and use the URL for **your** project ref in `index.html`.
