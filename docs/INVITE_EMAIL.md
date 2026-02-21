# Invite Email Integration (CukaiPro)

This document describes how invite emails work and how to set them up.

## Overview

CukaiPro supports sending invite emails when inviting team members to your organization:

1. **Settings → Team**: Add email and role, click "Send invite"
2. The app creates an invitation in the database and attempts to send an invite email via the Supabase Edge Function
3. If email is configured, the invitee receives an email with a link to accept the invitation
4. If email is not configured (e.g. RESEND_API_KEY missing), the app still creates the invitation and shows a link to copy and share manually

## Flow

```
User clicks "Send invite"
  → useInvitations.sendInvitation() creates row in invitations table
  → useInvitations.sendInviteEmail() calls Edge Function "send-invite-email"
    → Edge Function sends email via Resend API
    → Edge Function updates invitation.email_sent_at
  → UI shows "Invite sent via email" or link to copy
```

## Setup

### 1. Run migrations

Ensure the `invitations` table has the `email_sent_at` column:

- **New setup**: `supabase/phase3_invitations.sql` already includes `email_sent_at`
- **Existing setup**: Run `supabase/migrations/20250222_add_email_sent_at_to_invitations.sql` in Supabase SQL Editor

### 2. Resend account

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain (or use `onboarding@resend.dev` for testing)
3. Create an API key

### 3. Edge Function secrets

In Supabase Dashboard → Edge Functions → Secrets:

| Secret | Description |
|--------|-------------|
| `RESEND_API_KEY` | Your Resend API key (required) |
| `RESEND_FROM` | Sender email, e.g. `CukaiPro <invites@yourdomain.com>` (optional, defaults to `onboarding@resend.dev`) |

### 4. Deploy Edge Function

```bash
supabase functions deploy send-invite-email
```

For local development:

```bash
supabase functions serve send-invite-email --no-verify-jwt
```

Set `RESEND_API_KEY` and optionally `RESEND_FROM` in `.env.local` or Supabase secrets.

## UI Behavior

### Settings → Team

- **Send invite form**: Creates invitation and tries to send email. On success: "Invite sent via email". On email failure: "Invitation created — copy the link to share".
- **Pending invitations**:
  - Invitations with `email_sent_at` show a green "Invite sent via email" badge
  - Invitations without email show a "Send invite email" button to send the email later

### Accept Invite Page

- `/invite/:token` — unchanged; invitee signs in or signs up, then accepts the invitation

## Alternative: Supabase Auth Invite

Supabase provides `auth.admin.inviteUserByEmail()`, which creates auth users and sends magic links. CukaiPro uses a **custom invitations table** because:

- Invitations are scoped to organizations and roles (Admin, Accountant, Staff)
- Invitees may already have an account
- Invite flow is `/invite/:token` → accept → join organization

If you prefer Supabase Auth invite for new-user onboarding, you would need a different flow (auth invite → custom post-accept logic to add org membership).

## Troubleshooting

| Issue | Check |
|-------|-------|
| "Email service not configured" | Add `RESEND_API_KEY` to Edge Function secrets |
| 401 Unauthorized | Ensure the client sends `Authorization: Bearer <user_jwt>` when calling the Edge Function |
| Email not received | Check Resend dashboard for delivery status; verify sender domain |
