# E-Invoicing: Single PRD (Technical Roadmap + Regulatory Context)

This document is the **single source of truth** for CukaiPro e-invoicing. It aligns with the [MyInvois API](https://sdk.myinvois.hasil.gov.my/api/) and [e-Invoice API](https://sdk.myinvois.hasil.gov.my/einvoicingapi/), incorporates **regulatory context** from the full LHDN-Compliant E-Invoicing Platform PRD, and is informed by the [Gap Analysis](GAP_ANALYSIS_EINVOICING_PRD.md).

---

## Regulatory Context (LHDN Phased Rollout)

| Phase | Revenue Bracket | Effective Date |
|-------|-----------------|----------------|
| Phase 1 | Annual Revenue > RM100 Million | August 1, 2024 |
| Phase 2 | RM25 Million – RM100 Million | January 1, 2025 |
| Phase 3 | RM5 Million – RM25 Million | July 1, 2025 |
| Phase 4 | RM1 Million – RM5 Million | January 1, 2026 |

- **Voluntary adoption:** Businesses with annual revenue < RM1 million are currently exempt; the platform supports a Voluntary Adoption configuration for early movers.
- **Invoice types (full PRD):** Standard E-Invoice (B2B/B2G), Consolidated E-Invoice (B2C aggregation; General Public TIN EI00000000010, Classification Code 004), Self-Billed (imports EI00000000030, commissions, dividends where applicable). Consolidated rules: RM10,000 single-transaction rule from 1 Jan 2026, prohibited industries, 7 calendar days after month end, 6-month relaxation logic.
- **72-hour window:** After LHDN validation, suppliers may cancel or buyers may reject within 72 hours; thereafter only Credit/Debit/Refund notes.
- **Gap analysis:** See [GAP_ANALYSIS_EINVOICING_PRD.md](GAP_ANALYSIS_EINVOICING_PRD.md) for PRD vs implementation gaps (signing, DIN, full UBL, Consolidated/Self-Billed, 72-hour Cancel/Reject).

---

## MyInvois API Summary (reference)

| Area | APIs | Notes |
|------|------|--------|
| **Platform** | Login as Taxpayer, Get Document Types, Get Document Type, Get Document Type Version, Get Notifications | OAuth2 client_credentials; token 60 min; 12 RPM login |
| **e-Invoice** | Validate TIN, Submit Documents, Cancel Document, Reject Document, Get Recent Documents, Get Submission, Get Document, Get Document Details, Search Documents, Search TIN, QR Code | Submit: POST documentsubmissions, 202; max 300 KB/doc, 100 docs/batch, 5 MB total; 100 RPM |
| **Document types** | Invoice, Credit Note, Debit Note, Refund (+ Self-Billed variants) | UBL 2.1 JSON/XML; [Invoice v1.1](https://sdk.myinvois.hasil.gov.my/documents/invoice-v1-1/) (signature enabled) |

Existing CukaiPro assets: `useInvoices.js` (create with client_name, tin, amount, invoice_date, sst_rate, contact_id); contacts extended with tax_registration_no, tax_entity, billing_address; InvoiceListPage LHDN status filters; per-org MyInvois credentials (encrypted); DIN stored when returned (see gap analysis).

---

## Phase 1: Foundation and configuration

**Goal:** Secure MyInvois connectivity and data model; no submit yet.

- **Configuration:** MyInvois Identity URL, API URL, sandbox flag; client_id/client_secret server-side only (e.g. Supabase Edge Function secrets).
- **Per-organization credentials (self-service):** Each organization enters their own MyInvois Client ID and Client Secret in **Settings → E-Invoicing**. Credentials are stored encrypted at rest (AES-256-GCM) in `organization_myinvois_credentials`; only Edge Functions (with `CREDENTIALS_ENCRYPTION_KEY` secret) can decrypt. Generate the key with `openssl rand -hex 32` and set it as a Supabase Edge Function secret. Users never "give" the secret to CukaiPro—they type it once in their dashboard and can change or remove it later.
- **Database:** Add to `invoices`: `lhdn_status`, `code_number`, `myinvois_uuid`, `myinvois_submission_uid`, `submitted_at`, `myinvois_validation_result` (jsonb), `din` (Document Identification Number from LHDN when validated).
- **Auth:** Server-side "Login as Taxpayer" (client_credentials); token reuse with refresh before 60 min; 12 RPM for login.

**Deliverables:** Env/config docs, migrations, server-side auth (e.g. Edge Function) that returns token for server use only.

---

## Phase 2: Document build and TIN validation

**Goal:** Build LHDN-compliant Invoice payload (UBL 2.1) and validate buyer TIN.

- Get Document Types / Get Document Type Version for Invoice v1.1 structure.
- Mapper: CukaiPro invoice + org (seller) + contact (buyer) → UBL 2.1 Invoice JSON; minify &lt; 300 KB. Cover mandatory fields per [Invoice v1.1](https://sdk.myinvois.hasil.gov.my/documents/invoice-v1-1/) and [Gap Analysis](GAP_ANALYSIS_EINVOICING_PRD.md) (37 vs 55 to be confirmed with SDK).
- Org-level `code_number` series (e.g. INV-{year}-{seq}); use as `codeNumber` in Submit.
- [Validate Taxpayer TIN](https://sdk.myinvois.hasil.gov.my/einvoicingapi/01-validate-taxpayer-tin/) before submit and optionally in UI.

**Deliverables:** Document builder, code_number assignment, TIN validation integration.

---

## Phase 3: Submit and status

**Goal:** Submit invoices to MyInvois and persist result/status.

- Build UBL JSON → hash (e.g. SHA256) → base64; **digital signature** (DocDigest/CertDigest/PropsDigest per [signature creation](https://sdk.myinvois.hasil.gov.my/signature-creation/)) when required for production—see Gap Analysis.
- [Submit Documents](https://sdk.myinvois.hasil.gov.my/einvoicingapi/02-submit-documents/): POST documentsubmissions; handle 202 accepted/rejected; update invoice by code_number; persist **DIN** when returned.
- [Get Document Details](https://sdk.myinvois.hasil.gov.my/einvoicingapi/08-get-document-details/) for validation result; "Refresh status" in UI; store DIN when present.
- Rate limits: 100 RPM; batch up to 100 docs, 5 MB total.

**Deliverables:** Submit flow (single/batch), DB updates, status refresh, DIN persistence, UI actions "Submit to LHDN" and "Refresh status".

---

## Phase 4: Lifecycle and UX

**Goal:** Cancel/reject flows and 72-hour window; clear e-Invoice UX.

- **72-hour window:** From LHDN validation, suppliers may [Cancel Document](https://sdk.myinvois.hasil.gov.my/einvoicingapi/03-cancel-document/); buyers may [Reject Document](https://sdk.myinvois.hasil.gov.my/einvoicingapi/04-reject-document/). After 72 hours, document is locked; changes require Credit/Debit/Refund notes.
- Invoice list/detail: real `lhdn_status` from DB; filters from DB; E-Invoicing page updated; error/retry (e.g. 422 DuplicateSubmission, Retry-After).

**Deliverables:** Cancel and Reject API integration, 72-hour countdown/lock in UI and backend, UI driven by DB status, E-Invoicing page, error handling.

---

## Phase 5: Credit notes and optional

**Goal:** Credit Note document type and optional features.

- Map CukaiPro credit notes to LHDN [Credit Note v1.1](https://sdk.myinvois.hasil.gov.my/documents/credit-v1-1/); same schema fields and submit/status/cancel.
- Optional: Get Recent Documents, Search Documents, Search Taxpayer TIN, [QR Code](https://sdk.myinvois.hasil.gov.my/einvoicingapi/11-qr-code/) for PDF generation.

---

## Future: Consolidated and Self-Billed (from full PRD)

- **Consolidated e-Invoice:** General Public TIN EI00000000010, Classification Code 004, aggregation within buyer’s window, RM10k rule (from 1 Jan 2026), prohibited industries, 7-day submission deadline, relaxation logic. Constants: `supabase/functions/_shared/einvoiceConstants.ts`. See [Gap Analysis](GAP_ANALYSIS_EINVOICING_PRD.md).
- **Self-Billed:** Document type and buyer-issuer flows for imports (EI00000000030), commissions, dividends (with exemptions). See full LHDN-Compliant E-Invoicing PRD and `einvoiceConstants.ts`.

---

## References

- [Platform API](https://sdk.myinvois.hasil.gov.my/api/)
- [e-Invoice API](https://sdk.myinvois.hasil.gov.my/einvoicingapi/)
- [Document Types / Types](https://sdk.myinvois.hasil.gov.my/types/)
- [Document Validation Rules](https://sdk.myinvois.hasil.gov.my/document-validation-rules/)
- [Signature / Signature Creation](https://sdk.myinvois.hasil.gov.my/signature-creation/)
- [Login as Taxpayer](https://sdk.myinvois.hasil.gov.my/api/07-login-as-taxpayer-system/)
- [Submit Documents](https://sdk.myinvois.hasil.gov.my/einvoicingapi/02-submit-documents/)
- [Gap Analysis (this repo)](GAP_ANALYSIS_EINVOICING_PRD.md)
