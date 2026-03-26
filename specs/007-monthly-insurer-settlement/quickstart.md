# Quickstart: Monthly Insurer Settlement

## Prerequisites

- Node.js 20 LTS
- PostgreSQL configured via `DATABASE_URL`
- Dependencies installed (`npm install`)
- Seeded data with:
  - open covers containing insurer names
  - cases already in `BILLING` status

## 1. Prepare environment

```bash
npm run db:migrate
npm run db:seed
npm run dev
```

## 2. Primary flow validation

1. Open `/settlements`.
2. Click create settlement.
3. Select insurer and period (`YYYY-MM`).
4. Verify settlement is created as `DRAFT` and eligible BILLING cases are preloaded.
5. In matching list, check/uncheck cases and verify running totals update.
6. Confirm settlement.
7. Verify:
  - settlement status is `CONFIRMED`
  - selected cases transitioned from `BILLING` to `SETTLING`
  - membership editing is locked.
8. Mark as paid with payment date and bank transfer reference.
9. Verify:
  - settlement status is `PAID`
  - selected cases transitioned from `SETTLING` to `CLOSED`
  - each closed case has `closedAt` and status history entry.

## 3. Data integrity checks

- Settlement reference follows `STL-YYYY-MM-NNN`.
- Each case appears in at most one open settlement (`DRAFT`/`CONFIRMED`).
- Confirm and pay actions are all-or-nothing (no partial transitions).
- Duplicate bank transfer reference is rejected.

## 4. API smoke checks

- `GET /api/settlements`
- `POST /api/settlements`
- `GET /api/settlements/{id}`
- `PUT /api/settlements/{id}`
- `POST /api/settlements/{id}/confirm`
- `POST /api/settlements/{id}/pay`

## 5. Required tests

```bash
npm run test
npm run test:integration
npm run test:e2e
```

Minimum assertions:
- Unit:
  - Decimal-safe total aggregation
  - settlement reference generation format
- Integration:
  - draft creation and eligibility preload
  - confirm atomic transition with history writes
  - pay atomic transition with `closedAt` + history writes
  - duplicate membership/concurrency conflict handling
  - duplicate payment reference rejection
- E2E:
  - complete create -> match -> confirm -> pay lifecycle
  - lock behavior after confirmation

## 6. Definition of done checks

- Settlement list shows required columns and correct status badges.
- DRAFT matching editable; CONFIRMED and PAID not editable.
- Confirm and pay operations are transaction-safe and auditable.
- All success criteria in spec are verifiable from test outputs and UI behavior.

