# Tasks: Dashboard and Operational Reports

**Input**: Design documents from `/specs/008-dashboard-operational-reports/`  
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Include tests as required by constitution and feature scope (API happy paths, Decimal-safe financial aggregation, filter parity, export correctness, and dashboard/report UX flows).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this belongs to (`[US1]`, `[US2]`, `[US3]`)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create reporting module scaffolding and shared entry points.

- [X] T001 Create reports API route directory scaffolding in `src/app/api/reports/`
- [X] T002 Create reports component directory scaffolding in `src/components/reports/`
- [X] T003 [P] Add reporting types placeholders in `src/types/index.ts`
- [X] T004 [P] Add report validation schema placeholders in `src/lib/validations.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared reporting foundations required by all user stories.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T005 Implement canonical report filter parser (URL params -> normalized query object) in `src/lib/reports-service.ts`
- [X] T006 [P] Implement Decimal-safe USD exposure conversion utility with fixed rates in `src/lib/calculations.ts`
- [X] T007 [P] Implement shared report aggregation service skeleton in `src/lib/reports-service.ts`
- [X] T008 [P] Implement CSV row mapping/escaping utility in `src/lib/reports-csv.ts`
- [X] T009 [P] Add unit tests for currency conversion and unsupported-currency exclusion in `tests/unit/lib/reports-conversion.test.ts`
- [X] T010 [P] Add unit tests for Decimal-safe summary aggregation and monthly grouping in `tests/unit/lib/reports-aggregation.test.ts`
- [X] T011 [P] Add route-level query validation tests for invalid date ranges in `tests/integration/reports/summary-route.test.ts`
- [X] T049 [P] Add error-shape consistency integration tests for `/api/reports/summary`, `/api/reports/cases`, `/api/reports/commission`, and `/api/reports/export` in `tests/integration/reports/error-shape.test.ts`
- [X] T050 Enforce shared `apiError` response usage across reports routes in `src/app/api/reports/**/route.ts`

**Checkpoint**: Foundation complete; user stories can be implemented independently.

---

## Phase 3: User Story 1 - Monitor Operations on Dashboard (Priority: P1)

**Goal**: Deliver dashboard stats cards, status/product breakdown charts, monthly commission trend, and recent cases table from server-side aggregates.

**Independent Test**: Open dashboard with fixture data and verify six stat cards, status/product charts, monthly commission trend, and latest five recent cases with row navigation.

### Tests for User Story 1

- [X] T012 [P] [US1] Add integration test for `GET /api/reports/summary` dashboard payload shape in `tests/integration/reports/summary-route.test.ts`
- [X] T013 [P] [US1] Add integration test for unsettled amount and excluded currency count behavior in `tests/integration/reports/summary-route.test.ts`
- [X] T014 [P] [US1] Add e2e test for dashboard widgets and recent-case navigation in `tests/e2e/reports/dashboard-operational-widgets.spec.ts`

### Implementation for User Story 1

- [X] T015 [US1] Implement dashboard aggregate queries (stats, status, product, monthly commission, recent cases) in `src/lib/reports-service.ts`
- [X] T016 [US1] Implement `GET /api/reports/summary` endpoint in `src/app/api/reports/summary/route.ts`
- [X] T017 [P] [US1] Implement `DashboardStatsCards` component in `src/components/reports/dashboard-stats-cards.tsx`
- [X] T018 [P] [US1] Implement `CasesByStatusChart` component in `src/components/reports/cases-by-status-chart.tsx`
- [X] T019 [P] [US1] Implement `CasesByProductChart` component in `src/components/reports/cases-by-product-chart.tsx`
- [X] T020 [P] [US1] Implement `MonthlyCommissionChart` component in `src/components/reports/monthly-commission-chart.tsx`
- [X] T021 [P] [US1] Implement `RecentCasesTable` component in `src/components/reports/recent-cases-table.tsx`
- [X] T022 [US1] Wire dashboard page to summary endpoint in `src/app/(dashboard)/page.tsx`
- [X] T048 [US1] Ensure `RecentCasesTable` uses shared DataTable patterns (or documented exception) in `src/components/reports/recent-cases-table.tsx`

**Checkpoint**: US1 dashboard is independently functional and testable.

---

## Phase 4: User Story 2 - Analyze Period Performance on Reports Page (Priority: P1)

**Goal**: Deliver reports page with URL-driven date/filter context, summary metrics, monthly case volume, commission breakdown by insurer, and sortable/filterable case table.

**Independent Test**: Apply date range and table filters in reports page; verify summary, charts, insurer breakdown, and case table update consistently from the same filtered dataset.

### Tests for User Story 2

- [X] T023 [P] [US2] Add integration test for `GET /api/reports/cases` inclusive date filtering and pagination in `tests/integration/reports/cases-route.test.ts`
- [X] T024 [P] [US2] Add integration test for `GET /api/reports/cases` search/sort/filter behavior in `tests/integration/reports/cases-route.test.ts`
- [X] T025 [P] [US2] Add integration test for `GET /api/reports/commission` insurer breakdown and monthly trend in `tests/integration/reports/commission-route.test.ts`
- [X] T026 [P] [US2] Add e2e test for reports filter workflow and table updates in `tests/e2e/reports/reports-filter-export-parity.spec.ts`
- [X] T054 [P] [US2] Add e2e test for empty dataset and non-blocking report UI states in `tests/e2e/reports/reports-empty-state.spec.ts`

### Implementation for User Story 2

- [X] T027 [US2] Implement filtered report-case query service (table rows + pagination) in `src/lib/reports-service.ts`
- [X] T028 [US2] Implement commission-by-insurer and monthly volume aggregations in `src/lib/reports-service.ts`
- [X] T029 [US2] Implement `GET /api/reports/cases` endpoint in `src/app/api/reports/cases/route.ts`
- [X] T030 [US2] Implement `GET /api/reports/commission` endpoint in `src/app/api/reports/commission/route.ts`
- [X] T031 [P] [US2] Implement `ReportsFilterBar` component with URL params synchronization in `src/components/reports/reports-filter-bar.tsx`
- [X] T032 [P] [US2] Implement `ReportsCasesTable` component with sorting/filter hooks in `src/components/reports/reports-cases-table.tsx`
- [X] T033 [US2] Implement reports page server/client wiring in `src/app/(dashboard)/reports/page.tsx`
- [X] T034 [US2] Add reports response types and DTOs in `src/types/index.ts`
- [X] T046 [US2] Refactor `ReportsCasesTable` to use shared DataTable behavior contract in `src/components/reports/reports-cases-table.tsx`
- [X] T047 [US2] Add integration assertions for DataTable sorting/filter/pagination parity in `tests/integration/reports/cases-route.test.ts`
- [X] T051 [P] [US2] Implement `MonthlyCaseVolumeChart` component in `src/components/reports/monthly-case-volume-chart.tsx`
- [X] T052 [P] [US2] Implement `CommissionByInsurerChart` component in `src/components/reports/commission-by-insurer-chart.tsx`
- [X] T053 [US2] Wire monthly volume and insurer commission visualizations into `src/app/(dashboard)/reports/page.tsx`

**Checkpoint**: US2 reports analysis is independently functional and testable.

---

## Phase 5: User Story 3 - Export Filtered Operational Data (Priority: P2)

**Goal**: Deliver CSV export for all filtered rows with exact column order and parity with reports table filter context.

**Independent Test**: Apply report filters, export CSV, and verify row parity with filtered dataset and exact required column order.

### Tests for User Story 3

- [X] T035 [P] [US3] Add integration test for `GET /api/reports/export` CSV header order and required columns in `tests/integration/reports/export-route.test.ts`
- [X] T036 [P] [US3] Add integration test for export parity with `GET /api/reports/cases` filter context in `tests/integration/reports/export-route.test.ts`
- [X] T037 [P] [US3] Add e2e assertion for export parity in reports workflow in `tests/e2e/reports/reports-filter-export-parity.spec.ts`

### Implementation for User Story 3

- [X] T038 [US3] Implement CSV dataset builder from canonical filter context in `src/lib/reports-service.ts`
- [X] T039 [US3] Implement CSV serializer and stream response builder in `src/lib/reports-csv.ts`
- [X] T040 [US3] Implement `GET /api/reports/export` endpoint in `src/app/api/reports/export/route.ts`
- [X] T041 [US3] Integrate export action and query propagation in `src/components/reports/reports-filter-bar.tsx`

**Checkpoint**: US3 export flow is independently functional and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening, consistency checks, and full validation.

- [X] T042 [P] Add performance smoke test for summary/cases/export under 10k-case fixtures in `tests/integration/reports/performance-smoke.test.ts`
- [X] T043 Add financial formatter usage consistency checks for dashboard/reports totals in `src/lib/utils.ts`
- [X] T044 Update quickstart execution notes and validation checkpoints in `specs/008-dashboard-operational-reports/quickstart.md`
- [X] T045 Run full verification suite and fix regressions in `tests/integration/reports/`
- [X] T055 Add timed UAT check for reports workflow completion under 2 minutes in `specs/008-dashboard-operational-reports/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: no dependencies.
- **Phase 2 (Foundational)**: depends on Phase 1 and blocks all user stories.
- **Phase 3 (US1)**: depends on Phase 2.
- **Phase 4 (US2)**: depends on Phase 2; can proceed independently of US1 after foundations.
- **Phase 5 (US3)**: depends on Phase 2 and US2 filter model for parity.
- **Phase 6 (Polish)**: depends on desired user stories being complete.

### User Story Dependencies

- **US1**: first MVP slice for dashboard operations.
- **US2**: core reports analysis slice; independent after foundation.
- **US3**: depends on US2 filter/query semantics to guarantee export parity.

### Within Each User Story

- Tests before implementation for that story.
- Service/query logic before route wiring.
- API behavior before UI page integration.
- Story acceptance checks before moving to next priority.

### Parallel Opportunities

- Setup: T003, T004 parallel after T001/T002.
- Foundation: T006-T011 and T049 parallel after T005/T007 skeleton alignment.
- US1: T012-T014 parallel; T017-T021 parallel after T016 contract is stable.
- US2: T023-T026 and T054 parallel; T031-T032 and T051-T052 parallel with T027-T030.
- US3: T035-T037 parallel; T039 parallel with T038/T040.
- Polish: T042, T044, and T055 parallel while T045 runs.

---

## Parallel Example: User Story 2

```bash
# Run US2 tests in parallel
Task: "T023 [US2] tests/integration/reports/cases-route.test.ts"
Task: "T024 [US2] tests/integration/reports/cases-route.test.ts"
Task: "T025 [US2] tests/integration/reports/commission-route.test.ts"

# Build independent US2 UI pieces in parallel
Task: "T031 [US2] src/components/reports/reports-filter-bar.tsx"
Task: "T032 [US2] src/components/reports/reports-cases-table.tsx"
```

---

## Implementation Strategy

### MVP First (US1 only)

1. Complete Phase 1 and Phase 2.
2. Deliver US1 dashboard stats/charts/recent cases.
3. Validate US1 independently before proceeding.

### Incremental Delivery

1. Foundation (Phases 1-2)
2. US1 dashboard monitoring
3. US2 reports analysis
4. US3 CSV export parity
5. Polish and performance hardening

### Parallel Team Strategy

1. Team aligns on shared report filter/aggregation foundation.
2. After Phase 2:
   - Dev A: US1 dashboard widgets + summary endpoint
   - Dev B: US2 reports table/filter + cases/commission endpoints
   - Dev C: US3 export endpoint + CSV serializer/parity tests
3. Merge and run full verification/performance checks.

---

## Notes

- `[P]` tasks are file-isolated and can run in parallel.
- Story labels map each task to independently testable value slices.
- Commit per completed task ID using `feat(scope): T00X - description`.
