# Quickstart: Case Management Core

## Prerequisites

- Node.js 20 LTS
- PostgreSQL available via `DATABASE_URL`
- Dependencies installed (`npm install`)

## Scope Notes

- This feature delivers core case creation, list, detail, edit, Draft soft-delete, and status transition controls.
- Settlement-paid auto-close is exposed via `src/lib/settlement-hooks.ts` integration hook and validated in integration tests.
- Delete and status transitions include confirmation UX in case detail flows.

## 1. Prepare database

```bash
npm run db:migrate
npm run db:seed
```

## 2. Run app

```bash
npm run dev
```

Open `/cases` and validate:
- Case list renders with search/filter/sort/pagination (20/page)
- New case form renders conditional sections based on `productLine` and `coverType`
- Open Cover selection pre-fills expected fields
- Premium values auto-update while typing
- Case detail provides Details/Documents/Emails/History tabs and transition actions

## 3. API smoke checks

- `GET /api/cases?q=BRK&status=DRAFT&page=1&pageSize=20`
- `POST /api/cases` with cargo open-cover payload
- `GET /api/cases/{id}` detail with status history
- `PUT /api/cases/{id}` for editable statuses only
- `DELETE /api/cases/{id}` succeeds only in Draft and performs soft-delete
- `POST /api/cases/{id}/status` validates transition rules and writes history

## 4. Required tests

```bash
npm run test
npm run test:integration
npm run test:e2e
```

Minimum assertions to include:
- Unit: `calculatePremiums()` and transition validation matrix
- Integration: list filters, create/update/delete routes, status route valid+invalid transitions, debit-note prompt and settlement-paid hook checks
- E2E: case creation flows, status progression UI, URL-based filter persistence
- Existing malformed XLS tests remain passing

## 5. Execution Results (2026-03-26)

- `npm run test`: PASS (33 files, 38 tests)
- `npm run lint`: blocked by interactive Next.js ESLint initialization prompt in this repo (no non-interactive ESLint config yet)
- Malformed XLS regression test remains passing in suite (`tests/integration/cases/bulk-upload-malformed-xls.test.ts`)

## 6. Definition of done checks

- Server-generated case number format is `BRK-YYYY-NNNN`
- All transitions are enforced by state machine + validation schemas
- Every status change creates one `CaseStatusHistory` record
- Status colors are sourced from shared constants through `StatusBadge`
- Error payloads follow `{ error: string, details?: object }`
