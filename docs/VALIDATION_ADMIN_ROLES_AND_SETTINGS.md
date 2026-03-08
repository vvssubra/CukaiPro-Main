# Admin roles and Settings – validation checklist

Use this checklist to verify the plan implementation.

## 1. First user = owner (admin)

- [ ] New user signs up (email/password, company name).
- [ ] User completes onboarding and creates organization (business name).
- [ ] Same user has role **Owner** in the org (see sidebar or Team tab).
- [ ] User can open **Settings** (link visible, no redirect).
- [ ] User can edit organization (business name, LHDN status, LHDN TIN, company email) and save.
- [ ] User can see **Submit to LHDN** on Sales → Invoice when invoices are selected.

## 2. Staff / accountant cannot access Settings or submit to LHDN

- [ ] Invite a second user as **Staff** (or **Accountant**).
- [ ] Second user accepts invite and joins the org.
- [ ] As the second user: **Settings** link is **not** visible in the sidebar.
- [ ] As the second user: navigating directly to `/dashboard/settings` redirects to `/dashboard`.
- [ ] As the second user: on Sales → Invoice, **Submit to LHDN** button and checkbox column are **not** shown (or button disabled with no selection).

## 3. Admin (invited as Admin) can do everything owner can (except transfer owner)

- [ ] Invite a third user as **Admin**.
- [ ] As that admin: **Settings** is visible and accessible.
- [ ] As that admin: Organization tab – can edit and save company details.
- [ ] As that admin: Team tab – can invite, change roles, remove members (except owner).
- [ ] As that admin: **Submit to LHDN** is available on Sales → Invoice.

## 4. Organization tab and LHDN submit enforcement

- [ ] Settings → Organization shows: Business name, LHDN TIN no., Company email, LHDN status.
- [ ] Edit organization → change fields → Save → values persist and show after refresh.
- [ ] As staff/accountant: calling submit to LHDN (e.g. via API) returns **403** with message that only owner/admin can submit.

## 5. Backend

- [ ] Run migration `20250626100000_organizations_company_details_rls.sql` (or `supabase db push`).
- [ ] Deploy Edge Function `myinvois-submit` so the 403 role check is active in your environment.
