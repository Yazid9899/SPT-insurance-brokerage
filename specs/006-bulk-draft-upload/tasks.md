# Tasks: Bulk Draft Upload

**Input**: Design documents from `/specs/006-bulk-draft-upload/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Include tests where required by constitution and feature spec. This feature requires parser/mapping/validation unit tests, API integration tests for bulk upload transaction behavior, and e2e wizard tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare reusable bulk-upload scaffolding and constants.

- [X] T001 Create bulk upload constants and shared header alias map in src/lib/bulk-upload/header-aliases.ts
- [X] T002 Create bulk upload domain types for mapping, rows, and draft state in src/types/index.ts
- [X] T003 [P] Add bulk upload test fixtures (headers, sample rows, mixed cell values) in tests/fixtures/bulk-upload.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core parsing, mapping, validation, and API schema building blocks required by all user stories.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 Implement SheetJS row parser and coercion helpers for mixed date/currency cells in src/lib/bulk-upload/parser.ts
- [X] T005 [P] Implement auto-mapping and ambiguity fallback logic in src/lib/bulk-upload/mapping.ts
- [X] T006 [P] Implement row and batch validation rules for required fields and row limits in src/lib/bulk-upload/validators.ts
- [X] T007 [P] Add Zod schemas for temp document upload and final bulk-create payloads in src/lib/validations.ts
- [X] T008 Add parser/mapping/validator exports via barrel module in src/lib/bulk-upload/index.ts
- [X] T009 [P] Add foundational unit tests for parser, mapping ambiguity, and validation rules in tests/unit/lib/bulk-upload-parser.test.ts
- [X] T010 [P] Add unit tests for mapping priority and unresolved required mappings in tests/unit/lib/bulk-upload-mapping.test.ts
- [X] T011 [P] Add unit tests for row constraints and financial validation guards in tests/unit/lib/bulk-upload-validation.test.ts

**Checkpoint**: Foundation is ready; user stories can now be implemented independently.

---

## Phase 3: User Story 1 - Setup Bulk Draft Batch (Priority: P1) MVP

**Goal**: Enable case maker to initialize one bulk upload batch with open cover context, client rate, XLS file, and optional shared documents.

**Independent Test**: Start wizard from `/cases`, complete setup with active open cover + XLS + optional docs, and continue to review.

### Tests for User Story 1

- [X] T012 [P] [US1] Add integration tests for temp shared-document upload route in tests/integration/cases/bulk-upload-temp-documents-route.test.ts
- [X] T013 [P] [US1] Add e2e coverage for setup step controls and validations in tests/e2e/cases/bulk-upload-wizard-setup.spec.ts

### Implementation for User Story 1

- [X] T014 [US1] Add `Bulk Upload` entry point button on cases list page in src/app/(dashboard)/cases/page.tsx
- [X] T015 [US1] Create bulk upload page container and route shell in src/app/(dashboard)/cases/bulk-upload/page.tsx
- [X] T016 [P] [US1] Implement wizard container with server-safe draft state handling in src/components/cases/bulk-upload-wizard.tsx
- [X] T017 [US1] Implement setup step UI (open cover select, client rate, XLS input, shared docs uploader) in src/components/cases/bulk-upload-setup-step.tsx
- [X] T018 [US1] Implement temp shared document upload endpoint in src/app/api/cases/bulk-upload/temp-documents/route.ts
- [X] T019 [US1] Enforce setup-step validation and transition guard logic in src/components/cases/bulk-upload-wizard.tsx

**Checkpoint**: Setup step works end-to-end and is independently testable.

---

## Phase 4: User Story 2 - Review, Map, And Correct Parsed Shipments (Priority: P1)

**Goal**: Parse XLS, auto-map headers with manual override, edit row cells inline, and validate/calculate rows before confirmation.

**Independent Test**: Upload mixed-quality XLS, override mappings, fix inline row errors, and verify recalculated row/summary totals.

### Tests for User Story 2

- [X] T020 [P] [US2] Add integration tests for malformed XLS handling and error shape consistency in tests/integration/cases/bulk-upload-malformed-xls.test.ts
- [X] T021 [P] [US2] Add e2e coverage for review step mapping override and inline corrections in tests/e2e/cases/bulk-upload-wizard-review.spec.ts

### Implementation for User Story 2

- [X] T022 [US2] Implement review step orchestration (parse, map, recalc, row error state) in src/components/cases/bulk-upload-review-step.tsx
- [X] T023 [P] [US2] Implement mapping editor UI for required/optional target fields in src/components/cases/column-mapping-editor.tsx
- [X] T024 [P] [US2] Implement DataTable-based preview table wrapper with inline editable cells and row-level errors in src/components/cases/bulk-upload-preview-table.tsx
- [X] T025 [US2] Integrate `calculatePremiums()` into row recomputation flow in src/components/cases/bulk-upload-review-step.tsx
- [X] T026 [US2] Enforce ambiguity behavior (leave unmapped + require manual mapping) in src/components/cases/bulk-upload-review-step.tsx

**Checkpoint**: Review step is fully functional and independently testable.

---

## Phase 5: User Story 3 - Confirm And Create Draft Cases In Batch (Priority: P1)

**Goal**: Confirm batch summary and create all draft cases atomically with shared `bulkUploadId` and document fan-out linking.

**Independent Test**: Confirm valid reviewed batch and verify created cases are all Draft, same `bulkUploadId`, same `openCoverId`, and redirect includes `bulkUploadId` query.

### Tests for User Story 3

- [X] T027 [P] [US3] Add integration tests for `POST /api/cases/bulk-upload` happy path and all-or-nothing rejection in tests/integration/cases/bulk-upload-route.test.ts
- [X] T028 [P] [US3] Add integration tests for shared document fan-out linking in tests/integration/cases/bulk-upload-doc-linking.test.ts
- [X] T029 [P] [US3] Add e2e coverage for confirm/create and redirect filter behavior in tests/e2e/cases/bulk-upload-wizard-confirm.spec.ts

### Implementation for User Story 3

- [X] T030 [US3] Implement confirm step summary and create action UI in src/components/cases/bulk-upload-confirm-step.tsx
- [X] T031 [US3] Implement final transactional bulk-create endpoint in src/app/api/cases/bulk-upload/route.ts
- [X] T032 [US3] Implement transaction logic (generate `bulkUploadId`, create Draft cases, premiums, document fan-out) in src/app/api/cases/bulk-upload/route.ts
- [X] T033 [US3] Enforce server-side re-validation of mappings and rows before transaction in src/app/api/cases/bulk-upload/route.ts
- [X] T034 [US3] Implement post-create redirect to `/cases?bulkUploadId=<newBatchId>` in src/components/cases/bulk-upload-wizard.tsx

**Checkpoint**: End-to-end bulk draft creation flow is complete and independently testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening, regression checks, and documentation updates.

- [X] T035 [P] Update quickstart flow and smoke checks with final UX details in specs/006-bulk-draft-upload/quickstart.md
- [X] T036 Add regression assertions that existing case lifecycle behavior remains unchanged in tests/integration/cases/status-transition-route.test.ts
- [X] T037 [P] Add performance smoke checks for 10-row review parse and final submit envelope in tests/integration/cases/bulk-upload-performance-smoke.test.ts
- [X] T038 Run full test suites and address regressions in tests/integration/cases/bulk-upload-route.test.ts
- [ ] T039 Define and run first-attempt completion usability validation (SC-003) in specs/006-bulk-draft-upload/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies.
- **Phase 2 (Foundational)**: Depends on Phase 1 completion and blocks all user stories.
- **Phase 3 (US1)**: Depends on Phase 2.
- **Phase 4 (US2)**: Depends on Phase 2 and uses US1 setup outputs.
- **Phase 5 (US3)**: Depends on Phase 2 and integrates US1/US2 results.
- **Phase 6 (Polish)**: Depends on completion of target user stories.

### User Story Dependencies

- **US1 (P1)**: First deliverable after foundation (MVP entry flow).
- **US2 (P1)**: Depends on setup artifacts from US1 but is testable on its own once wired.
- **US3 (P1)**: Depends on validated reviewed data from US2 and finalizes business outcome.

### Within Each User Story

- Tests should be written before implementation and fail initially.
- Domain logic before UI wiring where applicable.
- Complete story-specific validation before closing the story.

---

## Parallel Opportunities

- Setup: T003 in parallel with T001-T002.
- Foundational: T005, T006, T007, T009, T010, T011 can run in parallel after T004 starts.
- US1: T012 and T013 in parallel; T016 can run in parallel with T018.
- US2: T020 and T021 in parallel; T023 and T024 in parallel.
- US3: T027, T028, T029 in parallel; T030 can run in parallel with T031 draft implementation.
- Polish: T035 and T037 in parallel while T038 executes.

---

## Parallel Example: User Story 2

```bash
# Run review-story tests together
Task: "T020 [US2] tests/integration/cases/bulk-upload-malformed-xls.test.ts"
Task: "T021 [US2] tests/e2e/cases/bulk-upload-wizard-review.spec.ts"

# Build independent review UI components together
Task: "T023 [US2] src/components/cases/column-mapping-editor.tsx"
Task: "T024 [US2] src/components/cases/bulk-upload-preview-table.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1 and Phase 2.
2. Deliver Phase 3 (US1) for setup entry + draft state + uploads.
3. Validate setup behavior independently before moving to review/confirm.

### Incremental Delivery

1. Foundation (Phases 1-2)
2. US1 setup wizard slice
3. US2 review/map/edit slice
4. US3 confirm/create transactional slice
5. Polish and regressions

### Parallel Team Strategy

1. Team aligns on setup/foundation modules.
2. After foundation:
   - Dev A: US1 setup + temp uploads
   - Dev B: US2 review table + mapping editor
   - Dev C: US3 transaction endpoint + integration tests
3. Merge and run polish/regression sweep.

---

## Notes

- `[P]` tasks are file-isolated and suited for parallel implementation.
- `[US1]`, `[US2]`, `[US3]` labels preserve traceability to spec stories.
- Commit per completed task ID following constitution: `feat(scope): T00X - description`.
