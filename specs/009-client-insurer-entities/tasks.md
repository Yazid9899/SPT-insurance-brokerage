# Tasks: Client And Insurer Entities

**Input**: Design documents from `/specs/009-client-insurer-entities/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Required by constitution and feature scope (unit, integration, e2e, and regression checks).

**Organization**: Tasks are grouped by user story for independent delivery and testing.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare project scripts and shared modules.

- [X] T001 Add backfill command wiring in `package.json` for `backfill:parties`.
- [X] T002 [P] Add shared party/open-cover constants in `src/lib/constants.ts`.
- [X] T003 [P] Scaffold party utility modules in `src/lib/party-normalization.ts` and `src/lib/party-projection.ts`.
- [X] T004 [P] Scaffold backfill script files in `scripts/backfill/parties.ts` and `scripts/backfill/party-report-writer.ts`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core schema, validators, and shared services required before story work.

**CRITICAL**: Complete this phase before any user-story implementation.

- [X] T005 Extend data schema for `Client`, `Insurer`, `OpenCoverClientLink`, and `PartyMergeAudit` in `prisma/schema.prisma`.
- [X] T006 Create migration set for new entities/FKs/indexes in `prisma/migrations/*`.
- [X] T007 [P] Implement normalization key utilities in `src/lib/party-normalization.ts`.
- [X] T008 [P] Implement normalized-first fallback projection helpers in `src/lib/party-projection.ts`.
- [X] T009 Implement party resolution/link service in `src/lib/party-service.ts`.
- [X] T010 Implement backfill matching/classification service in `src/lib/party-backfill-service.ts`.
- [X] T011 Implement merge/split governance service with audit writes in `src/lib/party-governance-service.ts`.
- [X] T012 Extend request validation schemas for party/open-cover rules in `src/lib/validations.ts`.
- [X] T013 [P] Add normalization/uniqueness unit tests in `tests/unit/lib/party-normalization.test.ts`.
- [X] T014 [P] Add projection fallback unit tests in `tests/unit/lib/party-projection.test.ts`.
- [X] T015 [P] Add backfill matcher unit tests in `tests/unit/lib/party-backfill-matcher.test.ts`.
- [X] T016 Add schema integrity integration test in `tests/integration/cases/party-schema-integrity.test.ts`.

**Checkpoint**: Schema/services/validation foundation is ready.

---

## Phase 3: User Story 1 - Create and Manage Cases with Multi-Client Open Covers (Priority: P1) MVP

**Goal**: Support normalized client/insurer linkage in case/open-cover flows, including open-cover-many-clients behavior.

**Independent Test**: Create/edit single-shipment and open-cover cases; verify open-cover derives insurer, client selection is limited to linked active clients, and existing lifecycle/premium behavior is unchanged.

### Tests for User Story 1

- [X] T017 [P] [US1] Add integration coverage for case create party fields in `tests/integration/cases/create-route.test.ts`.
- [X] T018 [P] [US1] Add integration coverage for case update party fields in `tests/integration/cases/update-route.test.ts`.
- [X] T019 [P] [US1] Add integration coverage for case detail projection in `tests/integration/cases/detail-route.test.ts`.
- [X] T020 [P] [US1] Add integration tests for open-cover client link persistence in `tests/integration/open-covers/create-route.test.ts` and `tests/integration/open-covers/update-route.test.ts`.
- [X] T021 [P] [US1] Add integration test for rejecting active open cover with zero linked clients in `tests/integration/open-covers/open-cover-active-min-client.test.ts`.
- [X] T022 [P] [US1] Add integration test for open-cover membership validation in `tests/integration/cases/open-cover-client-membership.test.ts`.
- [X] T023 [P] [US1] Add integration test for inactive linked-client rejection in `tests/integration/cases/open-cover-inactive-client.test.ts`.
- [X] T024 [P] [US1] Add integration test to assert `{ error, details? }` response shape for party validation failures in `tests/integration/cases/party-error-shape.test.ts`.
- [X] T025 [P] [US1] Add e2e flow for open-cover linked-client selection in `tests/e2e/cases/open-cover-case-create.spec.ts`.
- [X] T026 [P] [US1] Add e2e flow for single-shipment explicit party selection in `tests/e2e/cases/case-create-party-linkage.spec.ts`.

### Implementation for User Story 1

- [X] T027 [US1] Implement additive party linkage in case create/list API in `src/app/api/cases/route.ts`.
- [X] T028 [US1] Implement additive party linkage in case detail/update API in `src/app/api/cases/[id]/route.ts`.
- [X] T029 [US1] Implement open-cover insurer + clientIds write/read logic in `src/app/api/open-covers/route.ts`.
- [X] T030 [US1] Implement open-cover insurer + clientIds update/detail logic in `src/app/api/open-covers/[id]/route.ts`.
- [X] T031 [US1] Add party option loading on case pages in `src/app/(dashboard)/cases/new/page.tsx` and `src/app/(dashboard)/cases/[id]/edit/page.tsx`.
- [X] T032 [US1] Update case form for single-shipment party selection and open-cover linked-client restriction in `src/components/cases/case-form.tsx`.
- [X] T033 [US1] Update open-cover form for multi-client linkage and active-state guard in `src/components/open-covers/open-cover-form.tsx`.
- [X] T034 [US1] Update detail components for normalized identity display in `src/components/cases/case-detail.tsx` and `src/components/open-covers/open-cover-detail.tsx`.
- [X] T035 [US1] Add/adjust party DTO types in `src/types/index.ts`.

**Checkpoint**: US1 is independently complete and shippable as MVP.

---

## Phase 4: User Story 2 - Filter and Analyze by Client/Insurer (Priority: P1)

**Goal**: Cases/reporting support normalized party filters and consistent insurer grouping while preserving export compatibility.

**Independent Test**: Apply client/insurer filters in cases and reports; verify row/aggregate parity and unchanged required export columns.

### Tests for User Story 2

- [X] T036 [P] [US2] Add case list party-filter integration tests in `tests/integration/cases/list-route.test.ts`.
- [X] T037 [P] [US2] Add report cases party-filter integration tests in `tests/integration/reports/cases-route.test.ts`.
- [X] T038 [P] [US2] Add insurer-grouping fallback integration tests in `tests/integration/reports/commission-route.test.ts`.
- [X] T039 [P] [US2] Add CSV parity integration tests under party filters in `tests/integration/reports/export-route.test.ts`.
- [X] T040 [P] [US2] Add e2e reports party-filter journey in `tests/e2e/reports/reports-party-filters.spec.ts`.
- [X] T041 [P] [US2] Add e2e cases list party-filter journey in `tests/e2e/cases/case-list-party-filters.spec.ts`.

### Implementation for User Story 2

- [X] T042 [US2] Extend filter validation for `clientId`/`insurerId` in `src/lib/validations.ts`.
- [X] T043 [US2] Implement case list filtering by party in `src/app/api/cases/route.ts` and `src/app/(dashboard)/cases/page.tsx`.
- [X] T044 [US2] Extend report filter parsing and where clauses in `src/lib/reports-service.ts`.
- [X] T045 [US2] Implement reports API party-filter support in `src/app/api/reports/cases/route.ts`, `src/app/api/reports/commission/route.ts`, and `src/app/api/reports/export/route.ts`.
- [X] T046 [US2] Add client/insurer controls in `src/components/reports/reports-filter-bar.tsx`.
- [X] T047 [US2] Add party columns in reports/cases tables in `src/components/reports/reports-cases-table.tsx` and `src/components/cases/case-table.tsx`.
- [X] T048 [US2] Preserve required export-column compatibility in `src/lib/reports-csv.ts`.

**Checkpoint**: US2 parity and reporting behavior are independently validated.

---

## Phase 5: User Story 3 - Preserve Legacy Behavior During Migration (Priority: P2)

**Goal**: Deliver safe backfill and governance so unmigrated data remains operational and risky merges are controlled.

**Independent Test**: Backfill dry-run/apply is idempotent; unique-match auto-link only; ambiguous/unmatched output is generated; historical behavior remains readable; settlements unchanged.

### Tests for User Story 3

- [X] T049 [P] [US3] Add backfill idempotency integration test in `tests/integration/cases/party-backfill-idempotency.test.ts`.
- [X] T050 [P] [US3] Add unique-match-only integration test for open-cover backfill in `tests/integration/cases/open-cover-backfill-unique-match.test.ts`.
- [X] T051 [P] [US3] Add unresolved fallback integration test in `tests/integration/cases/party-fallback-compatibility.test.ts`.
- [X] T052 [P] [US3] Add merge/split approval-audit integration test in `tests/integration/cases/party-merge-governance.test.ts`.
- [X] T053 [P] [US3] Add settlement regression-boundary test in `tests/integration/settlements/settlement-party-boundary.test.ts`.

### Implementation for User Story 3

- [X] T054 [US3] Implement backfill dry-run/apply orchestration in `scripts/backfill/parties.ts`.
- [X] T055 [US3] Implement ambiguous/unmatched report output in `scripts/backfill/party-report-writer.ts`.
- [X] T056 [US3] Implement unique-match-only open-cover/case linkage in `src/lib/party-backfill-service.ts`.
- [X] T057 [US3] Implement governance approval enforcement and audit persistence in `src/lib/party-governance-service.ts`.
- [X] T058 [US3] Ensure compatibility fallbacks for unmigrated rows in `src/app/api/cases/route.ts`, `src/app/api/cases/[id]/route.ts`, and `src/app/api/reports/cases/route.ts`.
- [X] T059 [US3] Preserve settlement name-based boundary in `src/lib/settlement-service.ts`.
- [X] T060 [US3] Add backfill readiness metrics/checkpoint output in `scripts/backfill/parties.ts`.

**Checkpoint**: US3 migration safety and governance are independently validated.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency, docs, and full validation.

- [X] T061 [P] Sync quickstart runbook with implemented commands/flows in `specs/009-client-insurer-entities/quickstart.md`.
- [X] T062 [P] Sync API contract docs to final payloads in `specs/009-client-insurer-entities/contracts/parties-and-case-linkage.openapi.yaml`.
- [X] T063 [P] Verify skeleton/loading states for updated case/open-cover/report screens in `src/components/cases/*`, `src/components/open-covers/*`, and `src/components/reports/*` with tests in `tests/e2e/cases/case-loading-states.spec.ts` and `tests/e2e/reports/reports-loading-states.spec.ts`.
- [X] T064 [P] Create and link formal follow-up work item for settlement insurer FK migration scope in `specs/009-client-insurer-entities/quickstart.md` (owner, boundary, migration dependency, backward-compat constraints).
- [X] T065 Run full suite and record results in `specs/009-client-insurer-entities/quickstart.md` (`npm test`, `npm run test:integration`, `npm run test:e2e`, `npm run build`).
- [X] T066 Validate non-regression against existing critical tests in `tests/integration/cases/status-transition-route.test.ts`, `tests/integration/settlements/settlements-pay-route.test.ts`, and `tests/integration/reports/export-route.test.ts`.

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 -> Phase 2 -> User Story phases -> Phase 6.
- Phase 2 is blocking for all stories.
- US1 is MVP and can ship independently.
- US2 depends on foundational linkage and should follow US1 API/field stabilization.
- US3 depends on foundational services and validates migration/governance boundaries.

### User Story Dependencies

- **US1 (P1)**: independent after foundation; no dependency on other stories.
- **US2 (P1)**: depends on party fields/flows from foundation and stabilized US1 contracts.
- **US3 (P2)**: independent functional slice after foundation; should run after core models/services exist.

### Within-Story Order

- Tests first (failing baseline) where applicable.
- Service/model changes before route/UI integration.
- Story-specific regression checks before marking complete.

---

## Parallel Execution Examples

### User Story 1

```bash
# Parallel US1 test tasks
T017, T018, T019, T020, T022, T023, T025, T026

# Parallel US1 implementation slices after shared API contracts
T031, T032, T033, T034
```

### User Story 2

```bash
# Parallel US2 test tasks
T036, T037, T038, T039, T040, T041

# Parallel US2 UI/data presentation tasks
T046, T047, T048
```

### User Story 3

```bash
# Parallel US3 tests
T049, T050, T051, T052, T053

# Parallel US3 script/governance slices
T055, T057, T060
```

---

## Implementation Strategy

### MVP First (US1)

1. Complete Phase 1 and Phase 2.
2. Deliver US1 (Phase 3).
3. Validate independent acceptance tests for US1.
4. Ship/demo MVP.

### Incremental Delivery

1. US1 (core create/edit/open-cover linkage)
2. US2 (filters/reports/export parity)
3. US3 (backfill/governance/safety)
4. Final polish and full regression checks

### Parallel Team Strategy

1. Pair on foundational schema/services.
2. Split after foundation:
   - Engineer A: US1 APIs/forms
   - Engineer B: US2 reports/filters/export
   - Engineer C: US3 backfill/governance

---

## Notes

- All API changes remain additive; preserve `apiError` shape.
- Keep settlement schema and behavior unchanged in this feature.
- Use strict task-by-task commits (`feat(scope): T0XX - description`).



