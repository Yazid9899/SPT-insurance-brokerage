# Tasks: Case Management Core

**Input**: Design documents from `/specs/003-case-management-core/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Include tests where required by constitution and feature spec. At minimum, include API happy-path integration tests, financial calculation unit tests (including edge cases), status transition validity/invalidity tests, and malformed XLS upload parsing tests when those capabilities exist in scope.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align schema/contracts and test scaffolding for Case Management core implementation.

- [X] T001 Add case-management task scope notes and commands to specs/003-case-management-core/quickstart.md
- [X] T002 Create dedicated case API test helpers in tests/integration/cases/helpers.ts
- [X] T003 [P] Create case feature fixtures for unit/integration/e2e in tests/fixtures/cases.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core domain and API foundations required before any user story delivery.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 Add Draft soft-delete fields and indexes to prisma/schema.prisma
- [X] T005 Generate and commit migration for soft-delete support in prisma/migrations/*/migration.sql
- [X] T006 Extend shared case validation schemas for create/update payloads in src/lib/validations.ts
- [X] T007 Implement server case number generator with `BRK-YYYY-NNNN` format in src/lib/case-number.ts
- [X] T008 Implement `STATUS_TRANSITIONS` and transition guard helpers in src/lib/status-machine.ts
- [X] T009 Implement per-transition validation rules and note requirements in src/lib/status-transitions.ts
- [X] T010 Ensure shared status color map covers all case statuses in src/lib/constants.ts
- [X] T011 Add case-level authorization helper for case maker/operations actions in src/lib/auth.ts
- [X] T012 Implement settlement-paid integration hook function (accepts settlement ID, transitions all linked SETTLING cases to CLOSED atomically with history entries) in src/lib/settlement-hooks.ts

**Checkpoint**: Foundation ready. User stories can now proceed.

---

## Phase 3: User Story 1 - Create and Prepare a Case (Priority: P1) 🎯 MVP

**Goal**: Case makers can create Draft cases with conditional form behavior, inherited open-cover data, and dual-rate premium calculations.

**Independent Test**: Create cargo and non-cargo cases from `/cases/new`, verify conditional fields and premium previews, save Draft, and confirm generated case number + persisted financials.

### Tests for User Story 1

- [X] T013 [P] [US1] Add unit tests for `calculatePremiums` edge cases in tests/unit/lib/calculations.test.ts
- [X] T014 [P] [US1] Add integration tests for `POST /api/cases` create flows in tests/integration/cases/create-route.test.ts
- [X] T015 [P] [US1] Add integration tests for Open Cover inheritance and locked insurer rate in tests/integration/cases/open-cover-create-locks.test.ts
- [X] T016 [P] [US1] Add e2e test for new case conditional form rendering in tests/e2e/cases/case-create-conditional-fields.spec.ts

### Implementation for User Story 1

- [X] T017 [US1] Implement Decimal-safe shared premium utility and exports in src/lib/calculations.ts
- [X] T018 [P] [US1] Implement case form schemas and transform helpers for create/update in src/lib/validations.ts
- [X] T019 [US1] Implement `POST /api/cases` create handler with server-side premium recompute in src/app/api/cases/route.ts
- [X] T020 [P] [US1] Implement Open Cover lookup and field inheritance logic in src/app/api/open-covers/route.ts
- [X] T021 [US1] Implement conditional field rendering and rate UX in src/components/cases/case-form.tsx
- [X] T022 [US1] Implement new case page submit flow and success routing in src/app/(dashboard)/cases/new/page.tsx
- [X] T023 [US1] Implement currency/premium presentation for case form summary in src/components/shared/currency-input.tsx

**Checkpoint**: User Story 1 is fully functional and independently testable (MVP).

---

## Phase 4: User Story 2 - Find and Review Cases (Priority: P2)

**Goal**: Users can search/filter/sort/paginate cases and open detail view with full financial summary and tabs.

**Independent Test**: Use URL query params on `/cases` to filter/sort/paginate, open a row, and verify detail tabs, open cover link, and financial summary card values.

### Tests for User Story 2

- [X] T024 [P] [US2] Add integration tests for list query params/filter/sort/pagination in tests/integration/cases/list-route.test.ts
- [X] T025 [P] [US2] Add integration tests for case detail payload shape in tests/integration/cases/detail-route.test.ts
- [X] T026 [P] [US2] Add e2e test for list filtering with URL params persistence in tests/e2e/cases/case-list-filters.spec.ts

### Implementation for User Story 2

- [X] T027 [US2] Implement `GET /api/cases` list query parsing and server filtering in src/app/api/cases/route.ts
- [X] T028 [US2] Implement `GET /api/cases/[id]` detail route with related entities in src/app/api/cases/[id]/route.ts
- [X] T029 [P] [US2] Implement cases list table columns and sort/filter wiring in src/components/cases/case-table.tsx
- [X] T030 [US2] Implement list page URL-search-param state synchronization in src/app/(dashboard)/cases/page.tsx
- [X] T031 [P] [US2] Implement case detail tabs and financial summary card in src/components/cases/case-detail.tsx
- [X] T032 [US2] Implement case detail page route loading and row navigation in src/app/(dashboard)/cases/[id]/page.tsx
- [X] T033 [US2] Ensure StatusBadge uses shared status constants for list/detail in src/components/shared/status-badge.tsx

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Progress and Control Case Lifecycle (Priority: P3)

**Goal**: Users can edit eligible cases, soft-delete Draft with confirmation dialog, and move through valid lifecycle transitions with confirmation, debit note prompt, and audit history.

**Independent Test**: Edit Draft/Documentation/Underwriting cases, confirm blocked edits for later states, confirm delete confirmation dialog appears for Draft, execute valid transitions (including Active->Billing debit note prompt), verify invalid transitions are blocked, and verify history entries and backward-note requirement.

### Tests for User Story 3

- [X] T034 [P] [US3] Add unit tests for transition matrix and rule schemas in tests/unit/lib/status-transitions.test.ts
- [X] T035 [P] [US3] Add integration tests for `PUT /api/cases/[id]` editable-status rules in tests/integration/cases/update-route.test.ts
- [X] T036 [P] [US3] Add integration tests for Draft-only soft-delete in tests/integration/cases/delete-route.test.ts
- [X] T037 [P] [US3] Add integration tests for `POST /api/cases/[id]/status` valid/invalid transitions in tests/integration/cases/status-transition-route.test.ts
- [X] T038 [P] [US3] Add e2e test for case transition dialog and history updates in tests/e2e/cases/case-lifecycle-transition.spec.ts
- [X] T039 [P] [US3] Add e2e test for Draft delete confirmation dialog (confirm shows dialog, cancel aborts, confirm executes soft-delete) in tests/e2e/cases/case-draft-delete-confirm.spec.ts
- [X] T040 [P] [US3] Add integration test for Active->Billing transition debit note prompt behavior in tests/integration/cases/billing-transition-debit-note.test.ts
- [X] T041 [P] [US3] Add integration test for settlement-paid hook triggering SETTLING->CLOSED transition atomically in tests/integration/cases/settlement-paid-hook.test.ts

### Implementation for User Story 3

- [X] T042 [US3] Implement `PUT /api/cases/[id]` with editable-status guard and last-save-wins behavior in src/app/api/cases/[id]/route.ts
- [X] T043 [US3] Implement `DELETE /api/cases/[id]` as Draft-only soft-delete in src/app/api/cases/[id]/route.ts
- [X] T044 [US3] Implement `POST /api/cases/[id]/status` with transaction + history insert in src/app/api/cases/[id]/status/route.ts
- [X] T045 [US3] Add required backward-transition note checks in src/lib/status-transitions.ts
- [X] T046 [US3] Implement Active->Billing transition debit note prompt in transition confirmation flow in src/components/cases/case-detail.tsx
- [X] T047 [US3] Implement detail-page transition action UI and confirmation modal in src/components/cases/case-detail.tsx
- [X] T048 [US3] Implement detail-page delete action with confirmation dialog (must show confirmation before executing soft-delete) in src/app/(dashboard)/cases/[id]/page.tsx
- [X] T049 [US3] Implement detail-page edit action enablement by status in src/app/(dashboard)/cases/[id]/page.tsx

**Checkpoint**: All user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, consistency, and regressions across all stories.

- [X] T050 [P] Validate API error shape consistency `{ error, details? }` across all case routes in src/app/api/cases/route.ts and src/app/api/cases/[id]/route.ts and src/app/api/cases/[id]/status/route.ts
- [X] T051 [P] Verify malformed XLS regression coverage still passes in tests/integration/cases/bulk-upload-malformed-xls.test.ts
- [ ] T052 [P] Measure and verify case list page response time <= 1.5s for 20-row filtered page, and status transition response time <= 800ms for single-case operation, document results in specs/003-case-management-core/quickstart.md
- [X] T053 Run full test suite and capture results in specs/003-case-management-core/quickstart.md
- [X] T054 Update feature delivery notes and final checks in specs/003-case-management-core/plan.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies.
- **Phase 2 (Foundational)**: Depends on Phase 1; blocks all user stories.
- **Phase 3 (US1)**: Depends on Phase 2.
- **Phase 4 (US2)**: Depends on Phase 2 and can run in parallel with US3 after foundational completion.
- **Phase 5 (US3)**: Depends on Phase 2 and can run in parallel with US2 after foundational completion.
- **Phase 6 (Polish)**: Depends on completion of selected user stories.

### User Story Dependencies

- **US1 (P1)**: No dependency on other user stories.
- **US2 (P2)**: No hard dependency on US1; integrates shared list/detail primitives.
- **US3 (P3)**: No hard dependency on US2; uses shared case detail surface.

### Within Each User Story

- Write tests first and confirm failure before implementation.
- Implement domain/server logic before UI wiring.
- Complete story checkpoint before cross-story polish.

### Parallel Opportunities

- Phase 1: T003 can run in parallel with T001-T002.
- Phase 2: T006, T007, T010, T011 can run in parallel after T004-T005. T012 can run in parallel with T008-T009.
- US1: T013-T016 parallel; T018 and T020 parallel; UI tasks T021-T023 after API create path.
- US2: T024-T026 parallel; T029 and T031 parallel after API list/detail endpoints.
- US3: T034-T041 parallel; T045 parallel with route work; T046/T047 after T044; T048/T049 parallel after T043.
- Polish: T050-T052 parallel, then T053-T054 sequential.

---

## Parallel Example: User Story 1

```bash
# Run US1 tests in parallel:
Task: "T013 [US1] calculations unit tests in tests/unit/lib/calculations.test.ts"
Task: "T014 [US1] create route integration tests in tests/integration/cases/create-route.test.ts"
Task: "T016 [US1] conditional form e2e in tests/e2e/cases/case-create-conditional-fields.spec.ts"

# Run US1 implementation tasks in parallel where safe:
Task: "T018 [US1] validation schemas in src/lib/validations.ts"
Task: "T020 [US1] Open Cover inheritance in src/app/api/open-covers/route.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Validate US1 independently via T013-T016 and manual quickstart checks.
4. Demo/deploy MVP.

### Incremental Delivery

1. Foundation complete (Phases 1-2).
2. Deliver US1 (MVP), then US2, then US3.
3. Run Phase 6 polish before final release cut.

### Parallel Team Strategy

1. Team aligns on Phase 1-2 together.
2. After foundation:
   - Engineer A: US1 API/form flow.
   - Engineer B: US2 list/detail flow.
   - Engineer C: US3 transition/edit/delete flow.
3. Merge on shared files (`src/app/api/cases/*`, `src/components/cases/*`) with small task-based commits.

---

## Notes

- [P] tasks are file-separated and dependency-safe at the time they are scheduled.
- [USx] labels map directly to spec user stories for traceability.
- Commit each completed task ID separately (e.g., `feat(cases): T019 - implement POST /api/cases`).
- Keep `spec.md` requirement intent authoritative; update plan/tasks only for delivery details.
