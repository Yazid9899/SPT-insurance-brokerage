# Tasks: Monthly Insurer Settlement

**Input**: Design documents from `/specs/007-monthly-insurer-settlement/`  
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Include tests as required by constitution and feature scope (API lifecycle, Decimal-safe totals, status transitions, concurrency guards).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this belongs to (`[US1]`, `[US2]`, `[US3]`)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare settlement module scaffolding and shared primitives.

- [X] T001 Create settlements API route directory scaffolding in `src/app/api/settlements/`
- [X] T002 Create settlements UI component directory in `src/components/settlements/`
- [X] T003 [P] Add settlement-specific shared types in `src/types/index.ts`
- [X] T004 [P] Add settlement validation schema placeholders in `src/lib/validations.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core logic required by all user stories.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T005 Implement settlement reference generator (`STL-YYYY-MM-NNN`) in `src/lib/settlement-number.ts`
- [X] T006 [P] Implement Decimal-safe settlement totals utility in `src/lib/settlement-service.ts`
- [X] T007 [P] Implement eligibility query + reservation guard helpers in `src/lib/settlement-service.ts`
- [X] T008 [P] Extend settlement create/update/pay schemas in `src/lib/validations.ts`
- [X] T009 [P] Add unit tests for settlement number format/sequence in `tests/unit/lib/settlement-number.test.ts`
- [X] T010 [P] Add unit tests for Decimal-safe totals aggregation in `tests/unit/lib/settlement-totals.test.ts`
- [X] T011 [P] Add integration guard tests for duplicate open-settlement membership in `tests/integration/settlements/settlements-concurrency.test.ts`

**Checkpoint**: Foundation complete; user stories can be implemented independently.

---

## Phase 3: User Story 1 - Create Monthly Settlement Draft (Priority: P1)

**Goal**: Create DRAFT settlement, preload eligible BILLING cases, and support checklist matching with running totals.

**Independent Test**: Create a settlement from `/settlements`, verify DRAFT status, eligible checklist, include/exclude behavior, and totals update without changing case statuses.

### Tests for User Story 1

- [X] T012 [P] [US1] Add integration test for `POST /api/settlements` draft creation and preload in `tests/integration/settlements/settlements-create-route.test.ts`
- [X] T013 [P] [US1] Add integration test for `PUT /api/settlements/[id]` matching updates in `tests/integration/settlements/settlements-update-route.test.ts`
- [X] T014 [P] [US1] Add e2e test for draft create + matching totals in `tests/e2e/settlements/settlement-create-and-match.spec.ts`

### Implementation for User Story 1

- [X] T015 [US1] Implement `GET /api/settlements` and `POST /api/settlements` in `src/app/api/settlements/route.ts`
- [X] T016 [US1] Implement `GET /api/settlements/[id]` and `PUT /api/settlements/[id]` in `src/app/api/settlements/[id]/route.ts`
- [X] T017 [P] [US1] Implement settlements table component in `src/components/settlements/settlements-table.tsx`
- [X] T018 [P] [US1] Implement settlement create dialog in `src/components/settlements/settlement-create-dialog.tsx`
- [X] T019 [P] [US1] Implement settlement matching table (checkbox + running totals callback) in `src/components/settlements/settlement-matching-table.tsx`
- [X] T020 [P] [US1] Implement settlement totals card in `src/components/settlements/settlement-totals-card.tsx`
- [X] T021 [US1] Implement settlements list page wiring in `src/app/(dashboard)/settlements/page.tsx`

**Checkpoint**: US1 is independently functional and testable.

---

## Phase 4: User Story 2 - Confirm Settlement And Lock Case Selection (Priority: P1)

**Goal**: Confirm DRAFT settlement atomically, move selected cases BILLING->SETTLING, log history, and lock membership editing.

**Independent Test**: Confirm a settlement with selected cases and verify transaction-safe status transitions plus edit lock in CONFIRMED state.

### Tests for User Story 2

- [X] T022 [P] [US2] Add integration test for `POST /api/settlements/[id]/confirm` happy-path transaction in `tests/integration/settlements/settlements-confirm-route.test.ts`
- [X] T023 [P] [US2] Add integration test for confirm rollback on stale non-BILLING case in `tests/integration/settlements/settlements-confirm-route.test.ts`
- [X] T024 [P] [US2] Add e2e test for confirm + lock behavior in `tests/e2e/settlements/settlement-confirm-lock.spec.ts`

### Implementation for User Story 2

- [X] T025 [US2] Implement settlement confirm service transaction (state guards + history writes) in `src/lib/settlement-service.ts`
- [X] T026 [US2] Implement `POST /api/settlements/[id]/confirm` in `src/app/api/settlements/[id]/confirm/route.ts`
- [X] T027 [P] [US2] Implement settlement detail header status/actions in `src/components/settlements/settlement-detail-header.tsx`
- [X] T028 [US2] Enforce membership lock after CONFIRMED in `src/app/api/settlements/[id]/route.ts`
- [X] T029 [US2] Add settlement detail page wiring for CONFIRMED flow in `src/app/(dashboard)/settlements/[id]/page.tsx`

**Checkpoint**: US2 is independently functional and testable.

---

## Phase 5: User Story 3 - Mark Settlement As Paid And Close Cases (Priority: P1)

**Goal**: Mark CONFIRMED settlement as PAID atomically and transition matched cases SETTLING->CLOSED with `closedAt` + status history.

**Independent Test**: Mark settlement paid with payment metadata and verify all matched cases close atomically; duplicates/stale states are rejected.

### Tests for User Story 3

- [X] T030 [P] [US3] Add integration test for `POST /api/settlements/[id]/pay` happy-path atomic close in `tests/integration/settlements/settlements-pay-route.test.ts`
- [X] T031 [P] [US3] Add integration test for duplicate bank transfer reference rejection in `tests/integration/settlements/settlements-pay-route.test.ts`
- [X] T032 [P] [US3] Add integration test for pay rollback on stale non-SETTLING case in `tests/integration/settlements/settlements-pay-route.test.ts`
- [X] T033 [P] [US3] Add e2e test for paid flow and closed case verification in `tests/e2e/settlements/settlement-pay-close.spec.ts`

### Implementation for User Story 3

- [X] T034 [US3] Implement settlement pay service transaction (`paidAt`, `paymentRef`, case closing, history writes) in `src/lib/settlement-service.ts`
- [X] T035 [US3] Implement `POST /api/settlements/[id]/pay` in `src/app/api/settlements/[id]/pay/route.ts`
- [X] T036 [US3] Add unique payment reference enforcement in `src/lib/settlement-service.ts`
- [X] T037 [US3] Integrate pay action UI + metadata capture in `src/components/settlements/settlement-detail-header.tsx`
- [X] T038 [US3] Ensure case closure hook compatibility/update in `src/lib/settlement-hooks.ts`

**Checkpoint**: US3 is independently functional and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Hardening, regressions, and final verification.

- [X] T039 [P] Add settlement API error-shape consistency tests in `tests/integration/settlements/settlements-error-shape.test.ts`
- [X] T040 Add regression tests ensuring status transition rules still enforce settlement-only paths in `tests/integration/cases/status-transition-route.test.ts`
- [X] T041 [P] Add performance smoke test for 500-case confirm/pay envelopes in `tests/integration/settlements/settlements-performance-smoke.test.ts`
- [X] T042 Update quickstart with final implemented screen actions in `specs/007-monthly-insurer-settlement/quickstart.md`
- [X] T043 Run full verification suite and fix regressions in `tests/integration/settlements/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: no dependencies.
- **Phase 2 (Foundational)**: depends on Phase 1 and blocks all user stories.
- **Phase 3 (US1)**: depends on Phase 2.
- **Phase 4 (US2)**: depends on Phase 2 and uses US1 settlement draft outputs.
- **Phase 5 (US3)**: depends on Phase 2 and integrates US2 confirmed state.
- **Phase 6 (Polish)**: depends on target user stories being complete.

### User Story Dependencies

- **US1**: first deliverable (MVP slice).
- **US2**: requires settlement draft/matching records from US1.
- **US3**: requires CONFIRMED settlements from US2.

### Within Each User Story

- Tests before implementation for that story.
- Service transaction logic before route wiring.
- API/state behavior before final UI integration.

### Parallel Opportunities

- Setup: T003, T004 parallel after T001/T002.
- Foundational: T006, T007, T008, T009, T010, T011 parallel after T005.
- US1: T012, T013, T014 parallel; T017-T020 parallel.
- US2: T022, T023, T024 parallel; T027 parallel with T025/T026.
- US3: T030, T031, T032, T033 parallel; T037 parallel with T034/T035/T036.
- Polish: T039 and T041 parallel while T043 runs.

---

## Parallel Example: User Story 2

```bash
# Run US2 tests in parallel
Task: "T022 [US2] tests/integration/settlements/settlements-confirm-route.test.ts"
Task: "T023 [US2] tests/integration/settlements/settlements-confirm-route.test.ts"
Task: "T024 [US2] tests/e2e/settlements/settlement-confirm-lock.spec.ts"

# Build independent UI/API pieces in parallel
Task: "T026 [US2] src/app/api/settlements/[id]/confirm/route.ts"
Task: "T027 [US2] src/components/settlements/settlement-detail-header.tsx"
```

---

## Implementation Strategy

### MVP First (US1 only)

1. Complete Phase 1 and Phase 2.
2. Deliver US1 draft creation + matching + totals.
3. Validate US1 independently before moving to confirm/pay lifecycle.

### Incremental Delivery

1. Foundation (Phases 1-2)
2. US1 draft settlement
3. US2 confirm + lock
4. US3 pay + close
5. Polish and regression hardening

### Parallel Team Strategy

1. Team aligns on foundational settlement service and validations.
2. After Phase 2:
   - Dev A: US1 list/create/matching UI + routes
   - Dev B: US2 confirm transaction + lock behavior
   - Dev C: US3 pay transaction + closure history
3. Merge and run full regression/performance checks.

---

## Notes

- `[P]` tasks are file-isolated and can execute in parallel.
- Story labels ensure traceability to independent user value slices.
- Commit per completed task ID using `feat(scope): T00X - description`.
