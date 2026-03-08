# E-Invoicing PRD Gap Analysis

This document is a structured gap analysis of the LHDN-Compliant E-Invoicing Platform PRD against (1) LHDN/MyInvois regulatory and technical reality, and (2) the current CukaiPro codebase and existing PRD (`docs/PRD_EINVOICING.md`).

---

## 1. Scope of This Analysis

- **PRD under review:** The full LHDN-Compliant E-Invoicing Platform PRD (phases, invoice types, consolidated logic, schema, infra, lifecycle, value-add).
- **Benchmarks:** Official IRBM/MyInvois SDK and published LHDN e-Invoice rules (consolidated, self-billed, RM10k, 72-hour, signing), plus current CukaiPro implementation and `docs/PRD_EINVOICING.md`.

---

## 2. PRD vs LHDN/MyInvois Reality

### 2.1 Regulatory context — **Accurate**

- Phase 1–4 revenue brackets and effective dates (Aug 2024, Jan 2025, Jul 2025, Jan 2026) align with published LHDN rollout.
- Voluntary adoption for <RM1M is a recognized option; PRD's "toggle" is consistent.

### 2.2 Invoice types — **Mostly accurate; one nuance**

- **Standard** and **Consolidated** and **Self-Billed** are correct LHDN concepts.
- **Self-Billed triggers:** Import (buyer issues; non-resident supplier TIN EI00000000030), Commissions (payments to agents/dealers/distributors), and Dividends are correct. **Caveat:** Dividend self-billing has exemptions (e.g. Bursa-listed, Section 108); PRD should explicitly call out "where applicable" or "except exempt cases."

### 2.3 Consolidated e-Invoicing logic — **Accurate**

- **General Public profile:** TIN **EI00000000010**, Address/Contact/BRN/SST ID **NA** — matches LHDN guidance and third-party guides.
- **Classification Code 004** for consolidated line items — correct and mandatory with EI00000000010.
- **RM10,000 rule** from 1 Jan 2026 — correct; single transaction > RM10k cannot be consolidated.
- **Prohibited industries:** Automotive, Luxury/Jewelry, Flight Tickets, Construction, Betting/Gaming, Electricity, Telecommunications are in line with published restrictions (sources also mention aviation, wholesale/retail construction materials); minor wording differences only.
- **Submission deadline:** 7 calendar days after month end — correct.
- **6-month relaxation:** Referenced in practice; PRD's "interim relaxation" and "mandatory date" are consistent with phased flexibility.

### 2.4 72-hour window and post-validation lifecycle — **Accurate**

- 72-hour window for supplier cancellation and buyer rejection is correct; after that, only Credit/Debit/Refund notes.
- PDF with QR to LHDN validation portal and 7-year retention align with common practice and record-keeping expectations.

### 2.5 Data schema and mandatory fields — **Needs verification**

- **37 mandatory fields:** LHDN/UBL 2.1 specs are often cited with different counts (e.g. 37 vs 55 "required"); the exact list should be cross-checked against the official [Invoice v1.1](https://sdk.myinvois.hasil.gov.my/documents/invoice-v1-1/) and validation rules. PRD's categories (Business, Contact, Invoice, Transaction, Tax, Currency) are correct; the number "37" should be confirmed against the current SDK.
- **DIN as primary key:** Using LHDN's Document Identification Number (DIN) as the system-of-record key for validated documents is sound once DIN is returned by MyInvois; ensure the schema stores DIN when available and uses it for lifecycle/audit.

### 2.6 Digital certificate and signing — **Critical gap vs current implementation**

- PRD correctly states: MCMC-recognized CA certificate, hash of payload, and **digital signature** (hash signed with certificate private key). IRBM SDK describes:
  - **DocDigest:** RSA-SHA256 sign of the document hash, Base64.
  - **CertDigest** and **Signed Properties (PropsDigest)** as part of the signature element.
- **Current CukaiPro behaviour:** `supabase/functions/myinvois-submit/index.ts` computes SHA-256 **hash** of the JSON and sends `documentHash` + base64 `document` only. There is **no** certificate upload, no private-key signing, and no UBL signature block (DocDigest/CertDigest/PropsDigest). So the PRD's "cryptographic handshake" and "digital signature" are **not implemented**; only hashing is. For production, LHDN may require the full signature; SDK and [signature creation](https://sdk.myinvois.hasil.gov.my/signature-creation/) docs should be treated as authoritative.

### 2.7 Call-backs and API alignment

- PRD's "call-backs to receive near real-time validation responses and DINs" is appropriate; current code uses **polling** (Get Document Details) rather than webhooks. If MyInvois supports call-backs, that's a design choice to align with PRD later.

---

## 3. PRD vs Current CukaiPro Implementation

### 3.1 Already in place (existing PRD + code)

| Area | Status | Location |
|------|--------|----------|
| MyInvois connectivity | Done | Client ID/Secret per org, encrypted (`supabase/migrations/20250623000000_org_myinvois_credentials.sql`), token (client_credentials) |
| TIN validation | Done | `supabase/functions/myinvois-validate-tin/`, `src/services/myinvois.js` |
| Submit to MyInvois | Partial | `supabase/functions/myinvois-submit/index.ts`: UBL build, code_number, SHA-256 hash, 202 handling |
| LHDN status lifecycle | Partial | `lhdn_status` (draft → submitted/rejected), refresh via Get Document Details; **no** validated/cancelled/rejected-by-buyer or 72-hour logic in UI/backend |
| Credit notes | Exists | `src/hooks/useCreditNotes.js`, `src/pages/Sales/NewCreditNoteModal.jsx`; **no** LHDN Credit Note document type or submit |
| Invoice list LHDN filter | UI only | `src/pages/Invoices/InvoiceListPage.jsx`: pending/validated/submitted filters; status derived from existing columns |

### 3.2 Missing or incomplete vs PRD

| PRD requirement | Gap | Priority |
|------------------|-----|----------|
| **Digital certificate + signing** | No cert upload, no RSA-SHA256 signing, no UBL signature element; only document hash sent | **P0** |
| **DIN as primary key / persistence** | DIN not stored; schema uses `myinvois_uuid` and `code_number`. Need to persist DIN when returned and use for lifecycle | **P0** |
| **37 (or SDK-exact) mandatory UBL fields** | Current UBL build is minimal (single line, basic supplier/buyer, SST). Missing many mandatory elements per full Invoice v1.1 | **P0** |
| **Consolidated e-Invoice** | No General Public (EI00000000010), no Code 004, no aggregation, no RM10k/prohibited-industry checks, no 7-day deadline enforcement | **P1** |
| **Self-Billed e-Invoice** | No document type, no buyer-issuer flow, no EI00000000030 (import) or commission/dividend logic | **P1** |
| **72-hour cancel/reject** | No 72-hour countdown, no Cancel/Reject API integration, no post-72-hour lock or Credit/Debit/Refund-only path | **P1** |
| **PDF + QR** | No generation of PDF with LHDN QR; QR Code API referenced in existing PRD but not implemented | **P2** |
| **7-year archive / PDPA** | Retention and encryption-at-rest policy not implemented as described; credentials are encrypted, not full document archive | **P2** |
| **Voluntary adoption toggle** | No org-level "phase" or "voluntary adoption" setting | **P2** |
| **Value-add: Billplz, Curlec, bank feeds** | Not in codebase; PRD only | **P3** |
| **Multi-currency + exchange rate** | Current build is MYR-only; no foreign currency or exchange rate in UBL | **P2** |

### 3.3 Existing PRD vs full PRD

- `docs/PRD_EINVOICING.md` is a 5-phase **technical** roadmap (Foundation → Document build → Submit → Lifecycle → Credit notes). It does **not** include:
  - Regulatory phase table or voluntary adoption
  - Consolidated or Self-Billed types or logic
  - RM10k rule, prohibited industries, 7-day deadline, relaxation period
  - Digital certificate/signing, DIN as key, 72-hour window
  - Value-add (payments, bank feeds, multi-currency)
- The full LHDN-Compliant E-Invoicing PRD is the **strategic and regulatory-complete** vision; the existing PRD is a subset. Recommendation: treat the full PRD as the master; keep a single source of truth that includes regulatory context and the gaps above (see `docs/PRD_EINVOICING.md` after update).

---

## 4. Summary Verdict

- **Is the e-invoicing PRD "the real deal" from a regulatory standpoint?** **Yes.** The regulatory narrative, phase dates, invoice types (Standard/Consolidated/Self-Billed), consolidated rules (EI00000000010, Code 004, RM10k, prohibited industries, 7-day deadline), 72-hour window, and post-validation lifecycle align with LHDN/MyInvois and third-party guidance. Only minor clarifications (dividend exemptions, exact mandatory field count) are needed.
- **Is it deliverable with the current codebase?** **Partially.** The foundation (credentials, token, TIN validation, submit with hash, status refresh) exists, but **certificate-based signing**, **full UBL mandatory fields**, **DIN persistence**, **Consolidated/Self-Billed flows**, and **72-hour cancel/reject** are missing or incomplete. The PRD is a valid target; implementation needs to be brought in line with it.

---

## 5. Recommended Next Steps (prioritized)

1. **Confirm mandatory fields and signature:** With IRBM SDK (Invoice v1.1 + validation rules + signature-creation), confirm the exact mandatory field set (37 vs 55) and whether production submission **requires** the UBL signature block (DocDigest/CertDigest/PropsDigest). If yes, add certificate upload and signing to the roadmap as P0.
2. **Implement signing and DIN:** Design certificate storage (per-org or per-user), key handling (e.g. Edge Function only, no client exposure), and UBL signature generation; persist DIN from MyInvois responses and use it for lifecycle and reporting.
3. **Expand UBL builder:** Extend `supabase/functions/myinvois-submit/index.ts` (or a dedicated module) to cover all mandatory Invoice v1.1 elements and support multiple line items, currency, and exchange rate where required.
4. **Consolidated e-Invoice:** Add data model and flows for "General Public" buyer, Code 004, aggregation within buyer's window, RM10k and prohibited-industry checks, and 7-day submission deadline; optionally relaxation logic based on org mandatory date.
5. **Self-Billed and 72-hour:** Add Self-Billed document type and buyer-issuer flows (import EI00000000030, commission, dividend with exemptions); integrate Cancel/Reject APIs and 72-hour window in UI and backend; enforce "after 72 hours only Credit/Debit/Refund" in business logic.
6. **Single PRD:** Keep `docs/PRD_EINVOICING.md` as the single roadmap that references the full PRD and includes technical phases, regulatory context, and this gap analysis.

---

## 6. Verification and implementation notes

Before production rollout, confirm the following with the IRBM SDK and MyInvois environment:

1. **Mandatory fields and signature**
   - Confirm the exact mandatory field set (37 vs 55) against [Invoice v1.1](https://sdk.myinvois.hasil.gov.my/documents/invoice-v1-1/) and [Document Validation Rules](https://sdk.myinvois.hasil.gov.my/document-validation-rules/).
   - Confirm whether production submission **requires** the UBL signature block (DocDigest, CertDigest, PropsDigest) per [Signature Creation](https://sdk.myinvois.hasil.gov.my/signature-creation/). If yes, implement certificate upload and RSA-SHA256 signing in the submit flow.

2. **72-hour window and Cancel/Reject**
   - **Cancel Document:** [e-Invoice API 03](https://sdk.myinvois.hasil.gov.my/einvoicingapi/03-cancel-document/) — supplier may cancel within 72 hours of validation.
   - **Reject Document:** [e-Invoice API 04](https://sdk.myinvois.hasil.gov.my/einvoicingapi/04-reject-document/) — buyer may reject within 72 hours; if supplier does not approve rejection, document becomes valid after 72 hours.
   - After 72 hours: lock document; only Credit Note, Debit Note, or Refund Note for changes.
   - Implementation: persist `validated_at` (or derive from Get Document Details response) and enforce 72-hour countdown in UI and backend; integrate Cancel and Reject API calls from Edge Functions and `src/services/myinvois.js`.

---

## 7. Decision Log (for this analysis)


| Decision | Alternatives | Reason |
|----------|--------------|--------|
| Treat PRD as regulatorily accurate | Second-guess every rule | External sources and SDK align with PRD on phases, consolidated, self-billed, RM10k, 72h, signing concept |
| Flag 37 vs 55 fields and signing as P0 | Assume PRD numbers are final | SDK and validation rules are authoritative; implementation must not assume without verification |
| Prioritize signing + DIN + full UBL over Consolidated/Self-Billed | Build Consolidated first | Without correct document structure and signature, any new type may be rejected; foundation first |
| Keep value-add (Billplz, bank feeds) as P3 | Drop them from PRD | They differentiate the product but do not affect LHDN compliance |
