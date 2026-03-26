# Quickstart: Document Management

## Prerequisites

- Node.js 20 LTS
- PostgreSQL configured via `DATABASE_URL`
- Dependencies installed (`npm install`)

## Scope Notes

- This feature adds case-level document upload, list, download, delete, and advisory expected-documents checklist.
- Shared documents from bulk draft creation are visible across all related cases and display a Shared marker.
- Deleting a shared document from one case removes it across all linked cases.

## 1. Prepare database

```bash
npm run db:migrate
npm run db:seed
```

## 2. Run app

```bash
npm run dev
```

Open `/cases/{id}` and validate:
- `Documents` tab is visible in case detail.
- `Upload Document` accepts drag/drop and picker uploads.
- Allowed file types upload successfully (PDF, DOCX, XLSX, JPG, PNG).
- Files >10 MB are rejected with validation error.
- Uploaded documents show: name, type badge, uploaded date, file size, actions.
- Delete requires confirmation before execution.
- Expected Documents checklist reflects case status and uploaded types.
- Missing checklist items do not block status transitions.

## 3. API smoke checks

- `GET /api/cases/{id}/documents`
- `POST /api/cases/{id}/documents` (`multipart/form-data` with file + `documentType` + optional `note`)
- `DELETE /api/cases/{id}/documents/{docId}`

## 4. Required tests

```bash
npm run test
npm run test:integration
npm run test:e2e
```

Minimum assertions:
- Unit:
  - File validation utility (type/size rejection and acceptance).
  - Expected checklist computation from status + uploaded document types.
- Integration:
  - Upload/list/delete happy path.
  - Oversize/unsupported upload rejection.
  - Shared delete removes linked rows for all cases in same batch.
  - Delete failure handling preserves consistency.
- E2E:
  - Upload via dialog.
  - Checklist marks complete/missing as expected.
  - Shared indicator appears for bulk-linked documents.

## 5. Definition of done checks

- All document APIs return consistent error shape `{ error: string, details?: object }`.
- File operations are mediated by server-side storage abstraction.
- Deletion removes storage artifact and DB metadata safely.
- Checklist remains advisory-only in all transition flows.

## 6. Execution Results (2026-03-26)

- `cmd /c npm run test`: PASS (36 files, 56 tests)
- `cmd /c npm run test:integration`: PASS (25 files, 32 tests)
- `cmd /c npm run test:e2e`: FAIL in environment due missing Playwright browser binaries (`npx playwright install` required)
- `cmd /c npm run build`: FAIL in this environment with OneDrive path `readlink` issue on `.next/types/routes.d.ts`
