# Validation checklist: Organization roles, Settings, LHDN submit

Use this checklist to manually verify owner vs staff flows, Settings access, and organization save.

## 1. Owner flow

- [ ] Log in as **owner** of an organization.
- [ ] **Sidebar**: "Settings" link is visible.
- [ ] **Dashboard → Settings**: Page loads; tabs Team, Organization, E-Invoicing, Billing are visible.
- [ ] **Organization tab**: Business name, LHDN TIN no., Company email, LHDN status are shown; "Edit organization" button is visible.
- [ ] **Edit organization**: Change business name or company email, Save → success toast and data refreshes; Cancel reverts.
- [ ] **Team tab**: Invite form visible; each member (except owner) has Role dropdown (Admin / Accountant / Staff) and "Remove" button.
- [ ] **Change role**: Set another member to Admin or Staff → success toast and table updates.
- [ ] **Sales → Invoice**: Table has checkboxes; select invoices → "Submit to LHDN" bar appears; submit works (or shows configured error).

## 2. Staff redirect (no Settings access)

- [ ] Log in as **staff** (or accountant) in an organization.
- [ ] **Sidebar**: "Settings" link is **not** visible.
- [ ] **Direct URL** `/dashboard/settings`: Redirects to `/dashboard` (replace, no flash of Settings content).
- [ ] **Sales → Invoice**: No checkboxes and no "Submit to LHDN" bar (staff cannot submit e-invoices).

## 3. Admin flow

- [ ] Log in as **admin** (non-owner).
- [ ] **Sidebar**: "Settings" is visible.
- [ ] **Settings → Organization**: Can view and edit organization (same as owner).
- [ ] **Settings → Team**: Can invite, change roles, remove members (same as owner).
- [ ] **Sales → Invoice**: Can select invoices and "Submit to LHDN" (owner/admin only).

## 4. Organization save (RLS)

- [ ] As owner or admin, **Settings → Organization** → Edit → change **LHDN TIN no.** or **Company email** → Save.
- [ ] No RLS/permission errors; success toast; after refresh or re-open Settings, new values persist.
- [ ] (Optional) As staff, if given a way to call org update API, request is rejected (403 / RLS).

## 5. Backend (optional / one-off)

- [ ] **myinvois-submit**: Call with a user that is **staff** or **accountant** → response 403 "Only organization owner or admin can submit e-invoices to LHDN".
- [ ] **Organizations RLS**: Migration applied; `organizations` has SELECT for members, UPDATE for owner/admin; `organization_members` UPDATE for owner/admin.

---

**Summary**

| Role     | Settings in sidebar | Access /dashboard/settings | Submit to LHDN | Edit org | Team invite/role/remove |
|----------|---------------------|----------------------------|----------------|----------|--------------------------|
| Owner    | Yes                 | Yes                        | Yes            | Yes      | Yes                      |
| Admin    | Yes                 | Yes                        | Yes            | Yes      | Yes                      |
| Accountant | No                | Redirect to dashboard      | No             | No       | No                       |
| Staff    | No                  | Redirect to dashboard      | No             | No       | No                       |
