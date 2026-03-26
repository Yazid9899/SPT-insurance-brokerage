# Data Model: Dashboard and Operational Reports

## Existing Source Entities

### Entity: Case (existing)
- Used fields:
  - `id`, `caseNumber`, `clientName`
  - `productLine`, `cargoProduct`, `coverType`, `status`
  - `currency`, `sumInsured`
  - `clientRate`, `insurerRate`
  - `clientPremium`, `insurerPremium`, `brokerCommission`
  - `origin`, `destination`, `vessel`, `quantity`, `etd`, `eta`
  - `openCoverId`, `createdAt`, `closedAt`
- Reporting role:
  - Primary source for dashboard counts, exposure, monthly commission, report table rows, and CSV export.

### Entity: OpenCover (existing)
- Used fields:
  - `id`, `reference`, `insurerName`
- Reporting role:
  - Resolves insurer grouping for commission breakdown and export `openCoverRef` projection.

### Entity: Settlement (existing, relevant for business context)
- Used fields (indirectly):
  - `status`, `paidAt`
- Reporting role:
  - Provides domain context for unsettled interpretation; unsettled amount itself is defined from case state and insurer premium for non-`CLOSED` cases.

## Derived Read Models

### Model: DashboardSummary
- Attributes:
  - `totalCases` (count)
  - `activeCases` (count where status=`ACTIVE`)
  - `pendingBillingCount` (count where status=`BILLING`)
  - `totalExposureUsd` (Decimal, converted)
  - `monthlyCommission` (Decimal, broker commission in current month)
  - `unsettledAmount` (Decimal, insurer premium for status != `CLOSED`)
  - `excludedCurrencyCount` (count of cases excluded from USD conversion)
- Invariants:
  - Exposure conversion uses fixed rates: `IDR/16000`, `SGD/1.35`, `MYR/4.7`, `USD/1`.
  - Unsupported currencies are excluded and counted.

### Model: StatusDistributionEntry
- Attributes:
  - `status` (one of seven lifecycle statuses)
  - `count`
  - `colorToken`
- Invariants:
  - Includes all statuses even when count is zero.

### Model: ProductDistributionEntry
- Attributes:
  - `productLine`
  - `cargoProduct` (nullable)
  - `count`
- Invariants:
  - Non-cargo lines keep `cargoProduct` empty.

### Model: MonthlyCommissionPoint
- Attributes:
  - `month` (`YYYY-MM`)
  - `brokerCommissionTotal` (Decimal)
- Invariants:
  - Calendar-month grouping from case creation date.

### Model: RecentCaseRow
- Attributes:
  - `id`, `caseNumber`, `clientName`, `productLine`, `status`, `createdAt`
- Invariants:
  - Exactly latest 5 by `createdAt` descending.
  - Field projection is intentionally lightweight.

### Model: ReportsFilterContext
- Attributes:
  - `dateFrom` (inclusive)
  - `dateTo` (inclusive)
  - `status[]`, `productLine[]`, `cargoProduct[]`, `coverType[]`
  - `search` (case number/client name)
  - `sortBy`, `sortDirection`
  - `page`, `pageSize`
- Invariants:
  - Used consistently by cases table, charts, summary, and export.
  - Date boundaries are inclusive-inclusive.

### Model: ReportsSummary
- Attributes:
  - `totalCases`
  - `totalSumInsured`
  - `totalClientPremium`
  - `totalInsurerPremium`
  - `totalBrokerCommission`
- Invariants:
  - Computed from the exact filtered case set.

### Model: InsurerCommissionEntry
- Attributes:
  - `insurerName`
  - `totalBrokerCommission`
  - `caseCount`
- Invariants:
  - Grouped from filtered cases linked to open cover insurer.

### Model: ReportCaseRow / CSVRow
- Attributes and export order:
  - `caseNumber`, `clientName`, `productLine`, `cargoProduct`, `coverType`, `status`, `currency`, `sumInsured`, `clientRate`, `insurerRate`, `clientPremium`, `insurerPremium`, `brokerCommission`, `origin`, `destination`, `vessel`, `quantity`, `etd`, `eta`, `openCoverRef`, `createdAt`, `closedAt`
- Invariants:
  - CSV uses all filtered rows regardless of current table page.
  - Column order is fixed and mandatory.

## Validation Rules

- Date range input must contain valid dates and `dateFrom <= dateTo`.
- Monetary aggregations use Decimal-safe calculations.
- Unsupported currency codes never contribute to USD exposure totals.
- Report/export filters must be canonicalized once and reused across endpoints.

## Relationships and Query Dependencies

- `Case` optionally links to `OpenCover` to resolve `insurerName` and `openCoverRef`.
- Commission-by-insurer and export `openCoverRef` require left-join behavior for cases without open cover.

## State and Mutability Notes

- This feature is read-only for business entities (`Case`, `OpenCover`, `Settlement`).
- No lifecycle transitions are created by reporting endpoints.
- Consistency requirement focuses on deterministic read models and parity across dashboard, reports, and CSV.
