# CukaiPro API Overview

API documentation for CukaiPro: Supabase (PostgreSQL + PostgREST) tables and Edge Functions.

## OpenAPI Spec

**OpenAPI 3.0 spec:** [docs/api/openapi.yaml](api/openapi.yaml)

Use this file with:
- [Swagger Editor](https://editor.swagger.io/) – paste the YAML or import the file
- [Redoc](https://redocly.github.io/redoc/) – for static HTML docs
- **Built-in Redoc page:** [docs/api/index.html](api/index.html) – serve the docs folder to view:
  ```bash
  npx serve docs
  ```
  Then open http://localhost:3000/api/

---

## Architecture

| Layer | Description |
|-------|-------------|
| **Supabase PostgREST** | Auto-generated REST API for PostgreSQL tables |
| **Supabase Edge Functions** | Custom serverless logic (e.g. send-invite-email) |
| **Supabase Auth** | JWT-based auth; pass `Authorization: Bearer <jwt>` |

### Base URLs

- PostgREST: `https://<project_ref>.supabase.co/rest/v1`
- Edge Functions: `https://<project_ref>.supabase.co/functions/v1`

Replace `<project_ref>` with your Supabase project ID.

### Auth

All requests require:

- Header: `apikey: <VITE_SUPABASE_ANON_KEY>`
- Header: `Authorization: Bearer <user_jwt>` (or anon key for public routes)
- Header: `Content-Type: application/json` (for POST/PATCH)

---

## Supabase Tables

PostgREST exposes REST endpoints for each table. Standard verbs:

- `GET /rest/v1/<table>` – list / filter (query params: `select`, `eq`, `order`, etc.)
- `POST /rest/v1/<table>` – insert
- `PATCH /rest/v1/<table>?id=eq.<uuid>` – update
- `DELETE /rest/v1/<table>?id=eq.<uuid>` – delete

### Tables

| Table | Purpose |
|-------|---------|
| `organizations` | Businesses (tenants) – `business_name`, `created_by` |
| `organization_members` | User ↔ org links – `role` (owner/admin/accountant/staff), `status` |
| `tax_deductions` | Deduction records – `amount`, `category_*`, `tax_year`, `deduction_date`, etc. |
| `invoices` | Invoice records – `client_name`, `tin`, `amount`, `invoice_date`, `status` |
| `invitations` | Team invites – `email`, `role`, `token`, `status`, `email_sent_at` |
| `ea_forms` | EA forms (Borang EA) – employment income fields |
| `sst_filings` | SST periods – `period_start`, `period_end`, `status` (draft/ready/submitted) |

Row Level Security (RLS) restricts access to data belonging to the user's organizations. See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for RLS details.

---

## Edge Function: send-invite-email

**Endpoint:** `POST /functions/v1/send-invite-email`

Sends an invitation email via Resend. Caller must be owner or admin of the organization.

### Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <user_jwt>` |
| `Content-Type` | Yes | `application/json` |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `to` | string | Yes | Recipient email |
| `inviteLink` | string | Yes | Full invite URL (e.g. `https://app.example.com/invite/{token}`) |
| `invitationId` | string (UUID) | Yes | Invitation row ID |
| `orgName` | string | No | Organization display name |
| `role` | string | No | Role label: `admin`, `accountant`, `staff` |

### Response

**200 OK**

```json
{
  "success": true,
  "message": "Invite email sent"
}
```

**Error responses**

| Status | Description |
|--------|-------------|
| 400 | Missing `to`, `inviteLink`, or `invitationId` |
| 401 | Missing or invalid authorization |
| 403 | Not owner/admin of the organization |
| 404 | Invitation not found or already used |
| 500 | Internal error or RESEND_API_KEY not set |
| 502 | Resend API failure |

See [INVITE_EMAIL.md](INVITE_EMAIL.md) for setup (Resend API key, secrets).

---

## Frontend Usage

The React app uses `@supabase/supabase-js`:

```javascript
import { supabase } from './lib/supabase';

// PostgREST
const { data } = await supabase.from('invoices').select('*').eq('organization_id', orgId);

// Edge Function
const { data, error } = await supabase.functions.invoke('send-invite-email', {
  body: { to, inviteLink, orgName, role, invitationId },
});
```

---

## Related Docs

- [SUPABASE_SETUP.md](SUPABASE_SETUP.md) – Database setup, RLS, tables
- [INVITE_EMAIL.md](INVITE_EMAIL.md) – Invite email setup (Resend, Edge Function secrets)
