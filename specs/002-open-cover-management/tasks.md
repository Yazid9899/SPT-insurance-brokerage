---

description: "Task list for Feature 003 open cover management"
---

# Tasks: Open Cover Management

**Input**: Design documents from `/specs/002-open-cover-management/`  
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Include constitution-required tests: API happy-path integration, financial calculation unit tests (edge cases), status transition valid/invalid tests, and malformed XLS parsing regression tests.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable (different files, no unresolved dependency)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`)
- Every task includes an exact target file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare feature scaffolding and shared module structure.

- [X] T001 Create open cover dashboard route directories in `src/app/(dashboard)/open-covers/`
- [X] T002 Create open cover API route directories in `src/app/api/open-covers/`
- [X] T003 Create open cover component module directories in `src/components/open-covers/`
- [X] T004 [P] Add open cover type contracts in `src/types/index.ts`
- [X] T005 [P] Add open cover status helper baseline in `src/lib/open-cover-status.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build cross-story domain primitives and shared guarantees.

**CRITICAL**: No user story implementation starts before this phase is complete.

- [X] T006 Implement shared premium calculator with decimal-safe operations in `src/lib/calculations.ts`
- [X] T007 Implement `STATUS_TRANSITIONS` map and transition helpers in `src/lib/status-transitions.ts`
- [X] T008 Extend validation schemas for open cover create/update and case open-cover locking in `src/lib/validations.ts`
- [X] T009 Implement centralized open cover and case status color/constants map in `src/lib/constants.ts`
- [X] T010 Implement server-side case list URL-param filtering parser in `src/app/api/cases/route.ts`
- [X] T011 Implement server-side status transition validation pipeline in `src/app/api/cases/[id]/status/route.ts`
- [X] T012 Add unit tests for `calculatePremiums()` including edge cases in `tests/unit/lib/calculations.test.ts`
- [X] T013 Add unit tests for valid/invalid status transitions in `tests/unit/lib/status-transitions.test.ts`
- [X] T014 Add integration test for `POST /api/cases/[id]/status` valid and invalid transitions in `tests/integration/cases/status-transition-route.test.ts`
- [X] T015 Add malformed XLS parser regression integration test coverage in `tests/integration/cases/bulk-upload-malformed-xls.test.ts`

**Checkpoint**: Shared domain and constitution-critical guards are in place.

---

## Phase 3: User Story 1 - Manage Open Cover Agreements (Priority: P1)

**Goal**: Case Maker can list/create/edit open cover agreements with fixed insurer-rate behavior and agreement integrity rules.

**Independent Test**: Create an open cover, see it in list with required columns/counts, edit it, verify duplicate reference rejection and non-retroactive rate behavior.

### Tests for User Story 1

- [X] T016 [P] [US1] Add integration test for `GET /api/open-covers` list payload columns in `tests/integration/open-covers/list-route.test.ts`
- [X] T017 [P] [US1] Add integration test for `POST /api/open-covers` create + duplicate reference rejection in `tests/integration/open-covers/create-route.test.ts`
- [X] T018 [P] [US1] Add integration test for `PUT /api/open-covers/[id]` date-range and rate-update rules in `tests/integration/open-covers/update-route.test.ts`
- [X] T019 [P] [US1] Add component test for open cover table required columns in `tests/unit/components/open-cover-table.test.tsx`
- [X] T020 [P] [US1] Add e2e flow for create/list/edit agreement in `tests/e2e/open-covers/open-cover-crud.spec.ts`

### Implementation for User Story 1

- [X] T021 [US1] Implement `GET`/`POST` open cover handlers in `src/app/api/open-covers/route.ts`
- [X] T022 [US1] Implement `GET`/`PUT` open cover handlers with declaration-safe period checks in `src/app/api/open-covers/[id]/route.ts`
- [X] T023 [US1] Implement open cover list page container in `src/app/(dashboard)/open-covers/page.tsx`
- [X] T024 [US1] Implement reusable open cover table component with required columns in `src/components/open-covers/open-cover-table.tsx`
- [X] T025 [US1] Implement reusable open cover create/edit form component in `src/components/open-covers/open-cover-form.tsx`
- [X] T026 [US1] Implement new open cover page with create flow in `src/app/(dashboard)/open-covers/new/page.tsx`
- [X] T027 [US1] Implement edit open cover page with save flow in `src/app/(dashboard)/open-covers/[id]/edit/page.tsx`

**Checkpoint**: Open cover list/create/edit workflows are independently functional.

---

## Phase 4: User Story 2 - Review Open Cover Details and Declarations (Priority: P1)

**Goal**: Case Maker can open an agreement detail and filter declarations linked to it.

**Independent Test**: Open an agreement, verify full details and declaration list, apply filters and verify filtered results.

### Tests for User Story 2

- [X] T028 [P] [US2] Add integration test for open cover detail with declarations payload in `tests/integration/open-covers/detail-route.test.ts`
- [X] T029 [P] [US2] Add integration test for declaration filters on open cover detail in `tests/integration/open-covers/detail-filters-route.test.ts`
- [X] T030 [P] [US2] Add component test for open cover detail declarations filter behavior in `tests/unit/components/open-cover-detail.test.tsx`
- [X] T031 [P] [US2] Add e2e scenario for detail filter interactions in `tests/e2e/open-covers/open-cover-detail-filters.spec.ts`

### Implementation for User Story 2

- [X] T032 [US2] Extend open cover detail API response with declarations and filter support in `src/app/api/open-covers/[id]/route.ts`
- [X] T033 [US2] Implement open cover detail component including declaration filters in `src/components/open-covers/open-cover-detail.tsx`
- [X] T034 [US2] Implement open cover detail page in `src/app/(dashboard)/open-covers/[id]/page.tsx`

**Checkpoint**: Open cover detail and declaration filtering are independently functional.

---

## Phase 5: User Story 3 - Use Open Cover in Case Creation (Priority: P2)

**Goal**: Case Maker can select active open cover during case creation with auto-filled client data and locked insurer-rate/currency.

**Independent Test**: In new case form choose `coverType=OPEN_COVER`, select active agreement, verify auto-fill and locked fields, and save with editable client rate.

### Tests for User Story 3

- [X] T035 [P] [US3] Add integration test for active open-cover options in case create flow in `tests/integration/cases/open-cover-options.test.ts`
- [X] T036 [P] [US3] Add integration test for case create lock and server-side premium recompute in `tests/integration/cases/open-cover-create-locks.test.ts`
- [X] T037 [P] [US3] Add integration test for case update preserving historical insurer-rate behavior in `tests/integration/cases/open-cover-nonretroactive-rate.test.ts`
- [X] T038 [P] [US3] Add component test for case form conditional rendering and lock behavior in `tests/unit/components/case-form-open-cover.test.tsx`
- [X] T039 [P] [US3] Add e2e scenario for new open-cover case creation in `tests/e2e/cases/open-cover-case-create.spec.ts`

### Implementation for User Story 3

- [X] T040 [US3] Implement active open-cover selector query surface in `src/app/api/open-covers/route.ts`
- [X] T041 [US3] Implement case create/update open-cover lock enforcement and server-side premium recompute in `src/app/api/cases/route.ts`
- [X] T042 [US3] Implement case update safeguards for locked insurer-rate/currency under open cover in `src/app/api/cases/[id]/route.ts`
- [X] T043 [US3] Update case form with `react-hook-form` + Zod resolver open-cover conditional behavior in `src/components/cases/case-form.tsx`
- [X] T044 [US3] Wire new-case page to active open-cover dropdown and prefill behavior in `src/app/(dashboard)/cases/new/page.tsx`

**Checkpoint**: Open-cover-aware case creation is independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency, docs, and validation across all stories.

- [X] T045 [P] Align `StatusBadge` to centralized status color map in `src/components/shared/status-badge.tsx`
- [X] T046 [P] Add API error-shape consistency assertions for new routes in `tests/integration/open-covers/error-shape.test.ts`
- [X] T047 Update Feature 002 quickstart validation steps with final commands in `specs/002-open-cover-management/quickstart.md`
- [X] T048 [P] Add feature smoke checklist for manual verification in `specs/002-open-cover-management/checklists/open-cover-smoke.md`
- [X] T049 Run and document full test command matrix for feature in `specs/002-open-cover-management/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: starts immediately.
- **Phase 2 (Foundational)**: depends on setup and blocks all user stories.
- **Phase 3 (US1)**: starts after foundational completion.
- **Phase 4 (US2)**: depends on US1 open-cover API/list baseline.
- **Phase 5 (US3)**: depends on foundational + US1 open-cover endpoints; can proceed in parallel with late US2 UI tasks when API contracts are stable.
- **Phase 6 (Polish)**: depends on all user story phases.

### User Story Dependencies

- **US1 (P1)**: no dependency on other user stories; produces open-cover CRUD baseline.
- **US2 (P1)**: depends on US1 agreement endpoints and data structures.
- **US3 (P2)**: depends on US1 agreement availability and foundational premium/transition utilities.

### Within Each User Story

- Write failing tests first.
- Implement API/domain behavior before page wiring.
- Complete and validate each story independently before advancing scope.

### Parallel Opportunities

- Setup: T004-T005 can run in parallel.
- Foundational: T012-T015 can run in parallel after T006-T011.
- US1 tests T016-T020 can run in parallel.
- US2 tests T028-T031 can run in parallel.
- US3 tests T035-T039 can run in parallel.
- Polish tasks T045, T046, T048 can run in parallel.

---

## Parallel Example: User Story 1

```bash
# Run US1 tests in parallel
Task: T016 tests/integration/open-covers/list-route.test.ts
Task: T017 tests/integration/open-covers/create-route.test.ts
Task: T018 tests/integration/open-covers/update-route.test.ts
Task: T019 tests/unit/components/open-cover-table.test.tsx
Task: T020 tests/e2e/open-covers/open-cover-crud.spec.ts
```

## Parallel Example: User Story 2

```bash
# Run US2 tests in parallel
Task: T028 tests/integration/open-covers/detail-route.test.ts
Task: T029 tests/integration/open-covers/detail-filters-route.test.ts
Task: T030 tests/unit/components/open-cover-detail.test.tsx
Task: T031 tests/e2e/open-covers/open-cover-detail-filters.spec.ts
```

## Parallel Example: User Story 3

```bash
# Run US3 tests in parallel
Task: T035 tests/integration/cases/open-cover-options.test.ts
Task: T036 tests/integration/cases/open-cover-create-locks.test.ts
Task: T037 tests/integration/cases/open-cover-nonretroactive-rate.test.ts
Task: T038 tests/unit/components/case-form-open-cover.test.tsx
Task: T039 tests/e2e/cases/open-cover-case-create.spec.ts
```

---

## Implementation Strategy

### MVP First (US1)

1. Complete Phase 1 + Phase 2.
2. Deliver Phase 3 (US1) open-cover CRUD baseline.
3. Validate independent US1 tests and demo agreement management.

### Incremental Delivery

1. Ship US1 (list/create/edit agreements).
2. Add US2 (detail + declaration filtering).
3. Add US3 (case-creation open-cover integration).
4. Apply polish and run full validation matrix.

### Parallel Team Strategy

1. Team completes Setup + Foundational together.
2. After foundation:
   - Engineer A: US1 CRUD and related tests.
   - Engineer B: US2 detail/filter experience.
   - Engineer C: US3 case-form and case API integration.

---

## Notes

- Every task follows strict checklist format with ID and file path.
- `[P]` markers only appear where file-level conflicts are avoidable.
- Commit per task ID using constitution rule: `feat(scope): T00X - description`.

