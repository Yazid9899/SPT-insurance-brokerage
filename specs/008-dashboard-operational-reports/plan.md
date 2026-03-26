# Implementation Plan: Dashboard and Operational Reports

**Branch**: `[008-dashboard-operational-reports]` | **Date**: 2026-03-26 | **Spec**: [/specs/008-dashboard-operational-reports/spec.md](./spec.md)  
**Input**: Feature specification from `/specs/008-dashboard-operational-reports/spec.md`

## Summary

Implement dashboard and reports with server-side aggregated metrics, chart-ready grouped datasets, date-range and table-filter driven reporting, and CSV export parity with filtered report results. Financial rollups remain Decimal-safe, USD exposure conversion uses fixed rates (IDR/16000, SGD/1.35, MYR/4.7), and recent cases are optimized to return only lightweight fields for the latest five rows.

## Technical Context

**Language/Version**: TypeScript (strict mode), Node.js 20 LTS  
**Primary Dependencies**: Next.js App Router, React, Prisma, Zod, NextAuth.js, decimal.js, recharts  
**Storage**: PostgreSQL via Prisma (`Case`, `OpenCover`, `Settlement`)  
**Testing**: Vitest (unit + integration), Playwright (e2e)  
**Target Platform**: Web application (internal operations dashboard)  
**Project Type**: Single Next.js web app (App Router + API routes)  
**Performance Goals**: dashboard data fetch under 1.5 seconds for 10k cases; report query and CSV export start under 2 seconds for 10k filtered rows  
**Constraints**: server-side aggregation only; Decimal-safe financial math; inclusive date-range boundaries; CSV uses exact filtered dataset; unsupported currencies excluded from USD totals with warning count  
**Scale/Scope**: single-role internal users, low-concurrency, monthly operational reporting across low-to-mid five-digit case volumes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] `spec.md` contains only WHAT/WHY requirements and acceptance criteria (no stack or architecture details).
- [x] `plan.md` documents all HOW decisions (stack, architecture, data model, API design, file layout).
- [x] Financial design uses Decimal math and explicit currency codes; client rate and insurer rate are modeled separately.
- [x] Case number generation is server-side only with `BRK-YYYY-NNNN` format.
- [x] Status transitions are constrained by an explicit state machine and include history logging.
- [x] Multi-table writes and settlement batch transitions are transaction-safe/atomic by design.
- [x] Phase 1 scope excludes RBAC, multi-tenancy, and microservices unless explicitly approved as a deviation.
- [x] Plan includes required testing strategy for API routes, financial calculations, status transitions, and malformed XLS parsing.

## Project Structure

### Documentation (this feature)

```text
specs/008-dashboard-operational-reports/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- reports.openapi.yaml
`-- tasks.md
```

### Source Code (repository root)

```text
src/
|-- app/
|   |-- (dashboard)/
|   |   |-- page.tsx
|   |   `-- reports/page.tsx
|   `-- api/reports/
|       |-- summary/route.ts
|       |-- cases/route.ts
|       |-- commission/route.ts
|       `-- export/route.ts
|-- components/reports/
|   |-- dashboard-stats-cards.tsx
|   |-- cases-by-status-chart.tsx
|   |-- cases-by-product-chart.tsx
|   |-- monthly-commission-chart.tsx
|   |-- recent-cases-table.tsx
|   |-- reports-filter-bar.tsx
|   `-- reports-cases-table.tsx
|-- lib/
|   |-- reports-service.ts
|   |-- reports-csv.ts
|   |-- calculations.ts
|   |-- constants.ts
|   `-- validations.ts
`-- types/
    `-- index.ts

tests/
|-- integration/reports/
|   |-- summary-route.test.ts
|   |-- cases-route.test.ts
|   |-- commission-route.test.ts
|   `-- export-route.test.ts
|-- unit/lib/
|   |-- reports-conversion.test.ts
|   `-- reports-aggregation.test.ts
`-- e2e/reports/
    |-- dashboard-operational-widgets.spec.ts
    `-- reports-filter-export-parity.spec.ts
```

**Structure Decision**: Keep all reporting domain logic in `src/lib/reports-service.ts` and isolate CSV generation in `src/lib/reports-csv.ts`; API routes remain thin orchestration layers; report/dashboard UI uses dedicated components under `src/components/reports` with server-fetched aggregated payloads.

## Phase 0: Research Plan

Research outputs in `research.md` resolve:
- CSV streaming/export strategy in Next.js App Router for large filtered datasets.
- Efficient Prisma grouping/aggregation patterns for status, product, insurer commission, monthly series, and summary totals.
- Decimal-safe and currency-aware rollup sequence before USD exposure totals.
- URL search-param filtering canonicalization so reports table and export share identical filter semantics.

## Phase 1: Design & Contracts

Artifacts to produce:
- `data-model.md` defining report-domain read models, derived aggregates, and validation invariants.
- `contracts/reports.openapi.yaml` for summary/cases/commission/export endpoints and filter/query contract.
- `quickstart.md` with dashboard/report validation flow including export parity and currency exclusion checks.

Design decisions:
- Dashboard widgets consume pre-aggregated API responses and avoid client-side heavy computation.
- Report filter context is source-of-truth via URL search params and reused for table + export.
- USD exposure conversion runs on Decimal values using fixed conversion rates; unsupported currencies are excluded and counted.
- Unsettled amount derives from insurer premium totals for non-`CLOSED` cases.
- Recent cases endpoint returns the latest five rows with lightweight fields only.

## Phase 2: Task Planning Approach

`/speckit.tasks` should decompose work into:
1. Shared report filter schemas, conversion helpers, and aggregation service.
2. API endpoints for summary, filtered case rows, commission breakdown, and CSV export.
3. Dashboard UI cards/charts/recent table wired to server responses.
4. Reports page filter bar, full table behavior, and export action parity.
5. Integration/unit/e2e tests for aggregation accuracy, filter parity, and edge states.

## Testing Strategy (Constitution-aligned)

- Unit tests:
  - Decimal-safe currency conversion and USD exposure aggregation rules.
  - Monthly grouping and commission rollup correctness.
- Integration tests:
  - `GET /api/reports/summary` includes six dashboard stats and warning counts for excluded currencies.
  - `GET /api/reports/cases` respects inclusive date boundaries and table filters.
  - `GET /api/reports/commission` returns insurer breakdown aligned with filtered scope.
  - `GET /api/reports/export` outputs exact CSV columns and dataset parity with `GET /api/reports/cases` filter context.
- E2E tests:
  - Dashboard loads all widgets and recent-case navigation works.
  - Reports date/filter workflow updates charts/table and export produces matching row set.
  - Empty dataset and invalid date-range handling provide safe, non-blocking UX.

## Post-Design Constitution Re-Check

- [x] `spec.md` remains WHAT/WHY only; implementation details are in plan/design artifacts.
- [x] All HOW decisions are documented in plan/research/data-model/contracts/quickstart.
- [x] Financial computations use Decimal-safe aggregation with explicit currency handling.
- [x] Existing case numbering constraints remain server-managed and unchanged.
- [x] Existing status/state-machine rules are preserved; this feature is read-heavy and does not mutate case lifecycle.
- [x] Multi-table write atomicity constraints are unaffected by this feature.
- [x] Scope remains single-role and avoids out-of-scope RBAC/multi-tenancy expansion.
- [x] Test strategy explicitly covers API routes, financial calculations, and reporting parity guarantees.

## Complexity Tracking

No constitution violations or justified deviations required for this feature.
