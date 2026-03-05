# E-Invoicing Ready: Phased PRD

This PRD aligns CukaiPro with the [MyInvois API](https://sdk.myinvois.hasil.gov.my/api/) and [e-Invoice API](https://sdk.myinvois.hasil.gov.my/einvoicingapi/) so invoices can be submitted to LHDN and lifecycle (cancel/reject) and credit notes can be supported.

---

## MyInvois API Summary (reference)

| Area | APIs | Notes |
|------|------|--------|
| **Platform** | Login as Taxpayer, Get Document Types, Get Document Type, Get Document Type Version, Get Notifications | OAuth2 client_credentials; token 60 min; 12 RPM login |
| **e-Invoice** | Validate TIN, Submit Documents, Cancel Document, Reject Document, Get Recent Documents, Get Submission, Get Document, Get Document Details, Search Documents, Search TIN, QR Code | Submit: POST documentsubmissions, 202; max 300 KB/doc, 100 docs/batch, 5 MB total; 100 RPM |
| **Document types** | Invoice, Credit Note, Debit Note, Refund (+ Self-Billed variants) | UBL 2.1 JSON/XML; [Invoice v1.1](https://sdk.myinvois.hasil.gov.my/documents/invoice-v1-1/) (signature enabled) |

Existing CukaiPro assets: `useInvoices.js` (create with client_name, tin, amount, invoice_date, sst_rate, contact_id); contacts extended with tax_registration_no, tax_entity, billing_address; InvoiceListPage LHDN status filters (today UI-only).

---

## Phase 1: Foundation and configuration

**Goal:** Secure MyInvois connectivity and data model; no submit yet.

- **Configuration:** MyInvois Identity URL, API URL, sandbox flag; client_id/client_secret server-side only (e.g. Supabase Edge Function secrets).
- **Database:** Add to `invoices`: `lhdn_status`, `code_number`, `myinvois_uuid`, `myinvois_submission_uid`, `submitted_at`, `myinvois_validation_result` (jsonb).
- **Auth:** Server-side "Login as Taxpayer" (client_credentials); token reuse with refresh before 60 min; 12 RPM for login.

**Deliverables:** Env/config docs, migrations, server-side auth (e.g. Edge Function) that returns token for server use only.

---

## Phase 2: Document build and TIN validation

**Goal:** Build LHDN-compliant Invoice payload (UBL 2.1) and validate buyer TIN.

- Get Document Types / Get Document Type Version for Invoice v1.1 structure.
- Mapper: CukaiPro invoice + org (seller) + contact (buyer) → UBL 2.1 Invoice JSON; minify &lt; 300 KB.
- Org-level `code_number` series (e.g. INV-{year}-{seq}); use as `codeNumber` in Submit.
- [Validate Taxpayer TIN](https://sdk.myinvois.hasil.gov.my/einvoicingapi/01-validate-taxpayer-tin/) before submit and optionally in UI.

**Deliverables:** Document builder, code_number assignment, TIN validation integration.

---

## Phase 3: Submit and status

**Goal:** Submit invoices to MyInvois and persist result/status.

- Build UBL JSON → hash (e.g. SHA256) → base64; signing if required for v1.1.
- [Submit Documents](https://sdk.myinvois.hasil.gov.my/einvoicingapi/02-submit-documents/): POST documentsubmissions; handle 202 accepted/rejected; update invoice by code_number.
- [Get Document Details](https://sdk.myinvois.hasil.gov.my/einvoicingapi/08-get-document-details/) for validation result; "Refresh status" in UI.
- Rate limits: 100 RPM; batch up to 100 docs, 5 MB total.

**Deliverables:** Submit flow (single/batch), DB updates, status refresh, UI actions "Submit to LHDN" and "Refresh status".

---

## Phase 4: Lifecycle and UX

**Goal:** Cancel/reject flows and clear e-Invoice UX.

- [Cancel Document](https://sdk.myinvois.hasil.gov.my/einvoicingapi/03-cancel-document/); [Reject Document](https://sdk.myinvois.hasil.gov.my/einvoicingapi/04-reject-document/) if buyer portal exists.
- Invoice list/detail: real `lhdn_status` from DB; filters from DB; E-Invoicing page updated; error/retry (e.g. 422 DuplicateSubmission, Retry-After).

**Deliverables:** Cancel (and optionally Reject), UI driven by DB status, E-Invoicing page, error handling.

---

## Phase 5: Credit notes and optional

**Goal:** Credit Note document type and optional features.

- Map CukaiPro credit notes to LHDN [Credit Note v1.1](https://sdk.myinvois.hasil.gov.my/documents/credit-v1-1/); same schema fields and submit/status/cancel.
- Optional: Get Recent Documents, Search Documents, Search Taxpayer TIN, [QR Code](https://sdk.myinvois.hasil.gov.my/einvoicingapi/11-qr-code/).

---

## References

- [Platform API](https://sdk.myinvois.hasil.gov.my/api/)
- [e-Invoice API](https://sdk.myinvois.hasil.gov.my/einvoicingapi/)
- [Document Types / Types](https://sdk.myinvois.hasil.gov.my/types/)
- [Document Validation Rules](https://sdk.myinvois.hasil.gov.my/document-validation-rules/)
- [Login as Taxpayer](https://sdk.myinvois.hasil.gov.my/api/07-login-as-taxpayer-system/)
- [Submit Documents](https://sdk.myinvois.hasil.gov.my/einvoicingapi/02-submit-documents/)
