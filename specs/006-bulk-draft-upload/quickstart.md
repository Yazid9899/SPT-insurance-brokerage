# Quickstart: Bulk Draft Upload

## Prerequisites

- Node.js 20 LTS
- PostgreSQL configured via `DATABASE_URL`
- Dependencies installed (`npm install`)
- Existing active Open Cover agreement in test data

## Scope Notes

- This feature handles retroactive batch declarations of 1-10 shipments under one open cover.
- Final creation is all-or-nothing: if any row is invalid, no cases are created.

## 1. Prepare environment

```bash
npm run db:migrate
npm run db:seed
npm run dev
```

## 2. Primary flow validation

1. Open `/cases` and click `Bulk Upload`.
2. Step 1 (Setup):
- Select one open cover.
- Verify client, cargo product, and insurer rate auto-fill.
- Enter client rate.
- Upload one XLS shipment file.
- Optionally upload shared shipping documents.
- Click `Continue to Review`.
3. Step 2 (Review & Map):
- Verify header auto-mapping from alias list.
- If ambiguous field mapping appears, confirm field remains unmapped until manual selection.
- Override mappings as needed.
- Fix invalid cells inline.
- Confirm per-row premiums and totals recalculate.
- Click `Continue to Confirm` only after all row errors are resolved.
4. Step 3 (Confirm & Create):
- Verify summary text includes open cover reference and case count.
- Click `Confirm & Create Draft Cases`.
- Verify redirect to `/cases?bulkUploadId=<newBatchId>`.

## 3. Data integrity checks

- Created case count equals reviewed row count.
- All created cases have:
  - `status = DRAFT`
  - same `bulkUploadId`
  - same selected `openCoverId`
- Shared uploaded documents are linked to every created case in batch.

## 4. API smoke checks

- `POST /api/cases/bulk-upload/temp-documents`
- `POST /api/cases/bulk-upload`

Recommended checks:
- temp-doc upload rejects unsupported type and >10MB files.
- final create rejects unresolved required mappings and any invalid row.
- success response includes `bulkUploadId`, `caseIds[]`, `totals`, and `redirectTo`.

## 5. Required tests

```bash
npm run test
npm run test:integration
npm run test:e2e
```

Minimum assertions:
- Unit:
  - Header alias mapping including ambiguity behavior.
  - Parser normalization for mixed date/currency-like cells.
  - Row validation and premium math consistency.
- Integration:
  - Happy-path bulk creation transaction.
  - All-or-nothing rejection when one row is invalid.
  - Malformed XLS handling with consistent error shape.
  - Shared document fan-out linking to all created cases.
- E2E:
  - Setup -> Review -> Confirm wizard completion.
  - Redirect includes `bulkUploadId` query.

## 6. Definition of done checks

- Wizard supports setup/review/confirm with persisted draft state.
- Review step enforces required columns and inline correction.
- Final create is atomic and all-or-nothing.
- Redirect filter query `bulkUploadId` is present and resolves batch results.
- Cases list supports `bulkUploadId` filter and displays only created batch.

## 7. Usability validation (SC-003)

Protocol:

- Total attempts: at least 20 independent operator attempts.
- Task: complete Setup -> Review -> Confirm for a valid 1-10 row XLS batch.
- First-attempt success means no external help and no restart required.

Pass target:
- First-attempt completion rate is `>= 95%`.

Execution log (2026-03-26):
- `Defined`: Yes
- `Execution assets created`: 
  - `specs/006-bulk-draft-upload/evidence/first-attempt-log.csv`
  - `specs/006-bulk-draft-upload/evidence/usability-summary.md`
  - `scripts/usability/calc-first-attempt-rate.mjs`
- `Executed`: Pending manual operator study data entry (requires 20 independent real-user attempts)
- `Owner`: Product/Operations QA
