# Tasks: Document Management

**Input**: Design documents from `/specs/004-document-management/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Include tests where required by constitution and feature scope. This feature includes API integration, checklist/unit validation, shared-delete integrity, and UI e2e coverage.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare baseline files and feature scaffolding for document management.

- [X] T001 Create feature constants for document types, allowed MIME/extension map, and checklist stage mapping in `src/lib/constants.ts`
- [X] T002 [P] Add development upload directory placeholder in `public/uploads/.gitkeep`
- [X] T003 [P] Create feature test fixture helpers for document payloads in `tests/integration/cases/document-fixtures.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core storage, validation, and data foundations required before user-story work.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 Add shared linkage fields and indexes to `CaseDocument` model in `prisma/schema.prisma`
- [X] T005 Generate and adjust migration for document linkage changes in `prisma/migrations/*/migration.sql`
- [X] T006 Implement storage provider types and interface (`save`, `delete`, `resolvePublicUrl`) in `src/lib/document-storage/types.ts`
- [X] T007 [P] Implement local filesystem storage provider with path normalization and traversal protection in `src/lib/document-storage/local-storage.ts`
- [X] T008 Wire environment-based storage resolver in `src/lib/document-storage/index.ts`
- [X] T009 Implement shared upload validation schema/utilities (file type, max 10MB, note/documentType parsing) in `src/lib/validations.ts`
- [X] T010 [P] Implement expected-documents checklist derivation utility in `src/lib/document-checklist.ts`
- [X] T011 Add document response mapper (including `isShared` and `downloadUrl`) in `src/types/index.ts`
- [X] T012 Add foundational unit tests for upload validation and checklist derivation in `tests/unit/lib/document-management.test.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Upload And Manage Case Documents (Priority: P1) MVP

**Goal**: Let case makers upload categorized documents, list them, download files, and delete with confirmation.

**Independent Test**: Upload valid/invalid files from case Documents tab and verify list, download, and confirmed delete flows work without other stories.

### Tests for User Story 1

- [X] T013 [P] [US1] Add integration happy-path tests for `GET/POST/DELETE /api/cases/[id]/documents` in `tests/integration/cases/documents-route.test.ts`
- [X] T014 [P] [US1] Add integration tests for invalid type and oversize upload rejection in `tests/integration/cases/documents-route.test.ts`
- [X] T015 [P] [US1] Add e2e test for upload/list/download/delete-confirm flow in `tests/e2e/cases/document-management.spec.ts`

### Implementation for User Story 1

- [X] T016 [US1] Implement `GET` and `POST` handlers for `/api/cases/[id]/documents` with multipart parsing and server validation in `src/app/api/cases/[id]/documents/route.ts`
- [X] T017 [US1] Implement `DELETE` handler for `/api/cases/[id]/documents/[docId]` for non-shared documents in `src/app/api/cases/[id]/documents/[docId]/route.ts`
- [X] T018 [P] [US1] Implement `DocumentUploadDialog` with drag/drop, type selector, optional note, and client-side guardrails in `src/components/cases/document-upload-dialog.tsx`
- [X] T019 [P] [US1] Implement `DocumentList` rendering name, type badge, upload date, size, download action, and delete action using shared `DataTable` component (constitution VIII) in `src/components/cases/document-list.tsx`
- [X] T020 [US1] Implement `CaseDocumentsTab` composition with upload dialog and list refresh state in `src/components/cases/case-documents-tab.tsx`
- [X] T021 [US1] Integrate Documents tab into case detail tabs in `src/components/cases/case-detail.tsx`
- [X] T022 [US1] Add case detail page data loading for documents tab and API wiring in `src/app/(dashboard)/cases/[id]/page.tsx`

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Track Expected Documents By Case Stage (Priority: P2)

**Goal**: Show advisory expected-documents checklist from case status and uploaded types without blocking transitions.

**Independent Test**: Move case statuses and upload relevant docs; checklist updates complete/missing marks correctly while status transitions remain unaffected.

### Tests for User Story 2

- [X] T023 [P] [US2] Add unit tests for status-to-expected-doc mapping and completion calculation in `tests/unit/lib/document-management.test.ts`
- [X] T024 [P] [US2] Add integration test verifying checklist data computation does not affect transition route outcomes in `tests/integration/cases/documents-route.test.ts`
- [X] T025 [P] [US2] Add e2e checklist display test across Documentation/Underwriting/Billing statuses in `tests/e2e/cases/document-management.spec.ts`

### Implementation for User Story 2

- [X] T026 [US2] Implement `ExpectedDocumentsChecklist` component with complete/missing visual state in `src/components/cases/expected-documents-checklist.tsx`
- [X] T027 [US2] Extend `CaseDocumentsTab` to include checklist using case status + uploaded document types in `src/components/cases/case-documents-tab.tsx`
- [X] T028 [US2] Ensure checklist remains advisory-only (no transition gating logic) in `src/app/api/cases/[id]/status/route.ts`

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Identify Shared Bulk Documents (Priority: P3)

**Goal**: Mark shared bulk-upload documents and enforce cross-case shared delete behavior.

**Independent Test**: Open multiple cases from same `bulkUploadId`, verify Shared badge appears, and confirm deleting one shared doc removes it from all linked cases.

### Tests for User Story 3

- [X] T029 [P] [US3] Add integration tests for shared-document list marker and cross-case delete behavior in `tests/integration/cases/documents-route.test.ts`
- [X] T030 [P] [US3] Add integration test for storage/delete failure rollback consistency in `tests/integration/cases/documents-route.test.ts`
- [X] T031 [P] [US3] Add e2e test for Shared indicator visibility across cases in `tests/e2e/cases/document-management.spec.ts`

### Implementation for User Story 3

- [X] T032 [US3] Extend document query and serialization to emit shared metadata (`bulkUploadId`, `isShared`) in `src/app/api/cases/[id]/documents/route.ts`
- [X] T033 [US3] Implement shared delete transaction across linked rows and single-file removal in `src/app/api/cases/[id]/documents/[docId]/route.ts`
- [X] T034 [US3] Render Shared indicator badge in document list items in `src/components/cases/document-list.tsx`
- [X] T035 [US3] Ensure shared document linkage is populated from bulk upload flows in `src/app/api/cases/bulk-upload/route.ts`

**Checkpoint**: All user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening, regression checks, and feature documentation alignment.

- [X] T036 [P] Update API contract examples and error cases in `specs/004-document-management/contracts/documents.openapi.yaml`
- [X] T037 Add quickstart verification notes after feature implementation in `specs/004-document-management/quickstart.md`
- [X] T038 [P] Add regression assertion for malformed XLS test stability alongside shared linkage behavior in `tests/integration/cases/bulk-upload-malformed-xls.test.ts`
- [X] T039 Run full validation suite (`npm run test`, `npm run test:integration`, `npm run test:e2e`) and record outcomes in `specs/004-document-management/quickstart.md`

---

## Phase 7: Remediation Tasks (Analysis-Driven)

**Purpose**: Address gaps and constitution violations identified by `$speckit-analyze`. These tasks MUST be completed before `$speckit-implement`.

### C1 — Financial Calculation Test Coverage (CRITICAL)

- [X] T040 [P] Run and extend existing financial calculation unit tests to satisfy constitution V implementation gate (premium computation, settlement totals, zero values, currency mismatches, invalid rates) in `tests/unit/lib/financial-calculations.test.ts`

*Resolves*: Constitution V implementation gate requires financial-calculation test coverage; no such task previously existed in this feature plan.

---

### C2 — DocumentList Must Use Shared DataTable (CRITICAL)

- [X] T041 [US1] Verify `DocumentList` (T019) correctly implements shared `DataTable` with sorting, filtering, and pagination per constitution VIII in `src/components/cases/document-list.tsx`

*Resolves*: Constitution VIII states all table UIs MUST use the shared DataTable component. T019 defined a custom `DocumentList` without explicit DataTable adoption. T019 description has been updated above; this task handles the explicit adoption and validation step.

---

### G1 — Server-Side Authorization for Upload/Delete (HIGH)

- [X] T042 [US1] Implement server-side authorization checks in `POST /api/cases/[id]/documents` and `DELETE /api/cases/[id]/documents/[docId]` to verify the requesting user has case access before processing (FR-015) in `src/app/api/cases/[id]/documents/route.ts` and `src/app/api/cases/[id]/documents/[docId]/route.ts`
- [X] T043 [P] [US1] Add integration tests for unauthorized access attempts to upload and delete endpoints, asserting 401/403 responses in `tests/integration/cases/documents-route.test.ts`

*Resolves*: FR-015 (access-based upload/delete authorization) had no implementation or test task for server-side auth checks.

---

### G2 — Empty State Rendering (MEDIUM)

- [X] T044 [P] [US1] Implement empty-state UI in `DocumentList` when no documents exist for a case (spec edge case) in `src/components/cases/document-list.tsx`
- [X] T045 [P] [US1] Add unit/e2e test asserting empty-state renders correctly when a case has zero documents in `tests/unit/lib/document-management.test.ts` and `tests/e2e/cases/document-management.spec.ts`

*Resolves*: Empty state when no documents exist is specified in spec.md edge cases but had no implementation or test task.

---

### G3 — Performance Validation (MEDIUM)

- [X] T046 [P] Add lightweight performance validation assertions for document list response time (<= 1.0s) and upload API response time (<= 2.0s) as timed integration test assertions in `tests/integration/cases/documents-route.test.ts`

*Resolves*: plan.md defines performance goals for list and upload latency but no verification task existed.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies.
- **Phase 2 (Foundational)**: Depends on Phase 1 and blocks all user stories.
- **Phase 3 (US1)**: Depends on Phase 2 completion.
- **Phase 4 (US2)**: Depends on Phase 2 completion; may reuse US1 components but remains independently testable.
- **Phase 5 (US3)**: Depends on Phase 2 completion; integrates with US1 API/UI paths for shared behavior.
- **Phase 6 (Polish)**: Depends on completion of selected user stories.
- **Phase 7 (Remediation)**: T040 can run in parallel from Phase 2 onward; T041/T044/T045 depend on T019 (US1 implementation); T042/T043 depend on T016/T017 (route handlers); T046 depends on T016 (routes established).

### User Story Dependencies

- **US1 (P1)**: Starts after foundational phase; MVP scope.
- **US2 (P2)**: Starts after foundational phase; depends on document list data and case status data.
- **US3 (P3)**: Starts after foundational phase; depends on shared linkage fields and delete route extension.

### Within Each User Story

- Write tests first and confirm they fail.
- Implement API/domain logic before wiring UI.
- Complete each story and validate its independent test before progressing.

### Parallel Opportunities

- Phase 1: T002 and T003 can run in parallel after T001.
- Phase 2: T007, T010, and T011 can run in parallel once schema/migration direction is set.
- US1: T013/T014/T015 can run in parallel; T018 and T019 can run in parallel after route contracts are stable.
- US2: T023/T024/T025 can run in parallel; T026 and T027 can run in parallel.
- US3: T029/T030/T031 can run in parallel; T032 and T034 can run in parallel before T033 finalization.
- Polish: T036 and T038 can run in parallel.
- Remediation: T040 is fully parallel; T042/T043 are parallel after routes exist; T044/T045/T046 are parallel after US1 completion.

---

## Parallel Example: User Story 1

```bash
# Tests in parallel
Task: "T013 [US1] Add integration happy-path tests in tests/integration/cases/documents-route.test.ts"
Task: "T014 [US1] Add integration invalid upload tests in tests/integration/cases/documents-route.test.ts"
Task: "T015 [US1] Add e2e upload/list/delete test in tests/e2e/cases/document-management.spec.ts"

# UI in parallel after API contract is stable
Task: "T018 [US1] Implement DocumentUploadDialog in src/components/cases/document-upload-dialog.tsx"
Task: "T019 [US1] Implement DocumentList (DataTable-based) in src/components/cases/document-list.tsx"
```

---

## Parallel Example: User Story 2

```bash
Task: "T023 [US2] Add checklist unit tests in tests/unit/lib/document-management.test.ts"
Task: "T026 [US2] Implement ExpectedDocumentsChecklist in src/components/cases/expected-documents-checklist.tsx"
```

---

## Parallel Example: User Story 3

```bash
Task: "T029 [US3] Add shared marker/delete integration tests in tests/integration/cases/documents-route.test.ts"
Task: "T034 [US3] Render Shared indicator in src/components/cases/document-list.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Validate US1 independent test (upload, list, download, delete confirmation).
4. Demo/release MVP increment.

### Incremental Delivery

1. Deliver US1 (core document management).
2. Deliver US2 (advisory checklist view).
3. Deliver US3 (shared bulk-document behavior).
4. Finish polish and full regression.

### Parallel Team Strategy

1. One developer finalizes foundational storage/validation (Phase 2).
2. After foundation completion:
   - Developer A: US1 API + page integration
   - Developer B: US1/US2 UI components
   - Developer C: US3 shared-delete behavior + integration tests

---

## Notes

- [P] tasks indicate disjoint-file parallelizable work.
- Story labels map each task to an independently testable user story.
- Commit each completed task using `feat(scope): T00X - description`.
- Preserve advisory-only checklist behavior; never gate status transitions.
- Phase 7 tasks (T040–T046) resolve all CRITICAL and HIGH issues from `$speckit-analyze` and must be completed before `$speckit-implement`.
