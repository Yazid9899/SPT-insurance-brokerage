# Quickstart: Dashboard and Operational Reports

## Prerequisites

- Node.js 20 LTS
- PostgreSQL configured via `DATABASE_URL`
- Dependencies installed (`npm install`)
- Seeded data containing mixed statuses, currencies (IDR/SGD/MYR/USD), and open-cover-linked cases

## 1. Prepare environment

```bash
npm run db:migrate
npm run db:seed
npm run dev
```

## 2. Dashboard validation flow

1. Open `/dashboard` (or `/`).
2. Verify six stat cards are visible:
   - Total Cases
   - Active Cases
   - Pending Billing Count
   - Total Exposure (USD)
   - Monthly Commission
   - Unsettled Amount
3. Validate exposure conversion uses fixed rates:
   - IDR / 16000
   - SGD / 1.35
   - MYR / 4.7
4. Validate unsupported currency handling:
   - unsupported currency cases are excluded from exposure
   - warning/count of excluded cases is shown.
5. Confirm "Cases by Status" shows all 7 statuses with color mapping.
6. Confirm "Cases by Product" breakdown includes non-cargo and cargo products correctly.
7. Confirm "Monthly Commission" chart shows recent month trend.
8. Confirm "Recent Cases" shows latest 5 cases only and row click opens case detail.

## 3. Reports validation flow

1. Open `/reports`.
2. Set date range (`dateFrom`, `dateTo`) and verify inclusive boundaries (both dates included).
3. Verify period summary values update:
   - Total Cases
   - Total Sum Insured
   - Total Client Premium
   - Total Insurer Premium
   - Total Broker Commission
4. Verify monthly case volume chart updates with same filters.
5. Verify commission breakdown by insurer updates with same filters.
6. Apply table filters/sorting and verify the case table updates correctly.

## 4. CSV parity checks

1. Keep a known filter context active on `/reports`.
2. Trigger `Export CSV`.
3. Verify exported dataset matches all filtered rows (not only current page).
4. Verify exact column order:
   - `caseNumber, clientName, productLine, cargoProduct, coverType, status, currency, sumInsured, clientRate, insurerRate, clientPremium, insurerPremium, brokerCommission, origin, destination, vessel, quantity, etd, eta, openCoverRef, createdAt, closedAt`

## 5. API smoke checks

- `GET /api/reports/summary`
- `GET /api/reports/cases`
- `GET /api/reports/commission`
- `GET /api/reports/export`

## 6. Required tests

```bash
npm run test
npm run test:integration
npm run test:e2e
```

Minimum assertions:
- Unit:
  - Decimal-safe currency conversion and exposure rollups
  - grouped monthly aggregation accuracy
- Integration:
  - summary endpoint returns all dashboard/report aggregates
  - cases endpoint respects inclusive date boundaries and filters
  - commission endpoint aligns with filtered scope
  - export endpoint matches filtered table dataset and required column order
- E2E:
  - dashboard widgets and recent case navigation
  - reports filter workflow and CSV parity

## 7. Definition of done checks

- Dashboard metrics reconcile with independently computed fixture totals.
- Report table, charts, and summary remain consistent for the same filters.
- CSV export is filter-parity safe and column-order compliant.
- Empty datasets and invalid date ranges show safe user feedback without hard errors.

## 8. Timed UAT check

Run this manual stopwatch check in UAT:

1. Open `/reports`.
2. Set date range.
3. Review summary + charts + table.
4. Export CSV.

Expected: complete the workflow in under 2 minutes.
