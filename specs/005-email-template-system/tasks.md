# Tasks: Email Template System

**Input**: Design documents from `/specs/005-email-template-system/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Include tests where required by constitution and feature spec. This feature requires unit, integration, and e2e coverage for template rendering, API contracts, and compose/log behavior.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare shared scaffolding for email template implementation.

- [X] T001 Create email template catalog scaffold with seven template IDs in src/lib/email/templates.ts
- [X] T002 Create email variable mapping scaffold and exports in src/lib/email/variables.ts
- [X] T003 [P] Add reusable email fixtures for case/context/settlement data in tests/fixtures/email.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core capabilities required before user-story implementation.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 Implement `{{variable}}` renderer with unresolved-token passthrough in src/lib/email/renderer.ts
- [X] T005 [P] Add Zod schemas for email preview and log-only send payloads in src/lib/validations.ts
- [X] T006 [P] Add shared TypeScript types for templates and case-email API DTOs in src/types/index.ts
- [X] T007 Implement email-route error handling helpers and normalized error responses in src/lib/api-error.ts
- [X] T008 [P] Add unit tests for renderer semantics and required field validation in tests/unit/lib/email-renderer.test.ts

**Checkpoint**: Foundation ready; user stories can now be implemented and tested independently.

---

## Phase 3: User Story 1 - Compose And Log Case Emails From Templates (Priority: P1) MVP

**Goal**: Let a case maker compose from templates, edit subject/body, and log emails to case history.

**Independent Test**: From a case detail Emails tab, compose with a template, edit content, send, and verify persisted history row plus dev-mode confirmation.

### Tests for User Story 1

- [X] T009 [P] [US1] Add integration tests for GET/POST case emails API in tests/integration/cases/emails-route.test.ts
- [X] T010 [P] [US1] Add e2e compose-and-log flow coverage in tests/e2e/cases/case-emails-compose-log.spec.ts

### Implementation for User Story 1

- [X] T011 [US1] Implement case email history list and log-only send endpoint in src/app/api/cases/[id]/emails/route.ts
- [X] T012 [P] [US1] Build compose dialog with template selection, To/CC, editable subject/body, and preview in src/components/cases/compose-email-dialog.tsx
- [X] T013 [US1] Build emails tab list with expandable body rows in src/components/cases/case-emails-tab.tsx
- [X] T014 [US1] Integrate Emails tab content and compose action in src/components/cases/case-detail.tsx
- [X] T015 [US1] Wire case detail page data loading for emails tab API usage in src/app/(dashboard)/cases/[id]/page.tsx
- [X] T016 [US1] Enforce send blocking for empty To/subject/body and show dev-mode log confirmation in src/components/cases/compose-email-dialog.tsx

**Checkpoint**: User Story 1 is fully functional and independently testable.

---

## Phase 4: User Story 2 - Manage Visibility Of Predefined Templates (Priority: P2)

**Goal**: Show all predefined templates as cards and provide sample-data preview.

**Independent Test**: Open `/email-templates`, verify seven cards with metadata/variables, and preview rendered sample output for each template.

### Tests for User Story 2

- [X] T017 [P] [US2] Add integration tests for template list and preview APIs in tests/integration/email/templates-routes.test.ts
- [X] T018 [P] [US2] Add e2e coverage for template card rendering and preview interaction in tests/e2e/email/email-templates-preview.spec.ts

### Implementation for User Story 2

- [X] T019 [US2] Implement predefined template list endpoint in src/app/api/email-templates/route.ts
- [X] T020 [US2] Implement template preview endpoint with sample context rendering in src/app/api/email-templates/preview/route.ts
- [X] T021 [P] [US2] Add reusable preview dialog component for rendered subject/body in src/components/cases/template-preview-dialog.tsx
- [X] T022 [US2] Implement template cards page with name/description/subject/variables display in src/app/(dashboard)/email-templates/page.tsx
- [X] T023 [US2] Connect preview action, loading state, and error state on template cards page in src/app/(dashboard)/email-templates/page.tsx

**Checkpoint**: User Stories 1 and 2 work independently.

---

## Phase 5: User Story 3 - Ensure Variable Coverage Across Template Contexts (Priority: P3)

**Goal**: Guarantee deterministic variable resolution for case/context/settlement fields with safe fallback behavior.

**Independent Test**: Render all templates with and without settlement context and confirm known keys resolve while unknown keys remain unchanged.

### Tests for User Story 3

- [X] T024 [P] [US3] Add unit coverage matrix for all template variables across seven templates in tests/unit/lib/email-template-variables.test.ts
- [X] T025 [P] [US3] Add integration coverage for unresolved tokens and missing settlement context in tests/integration/email/template-preview-fallback.test.ts

### Implementation for User Story 3

- [X] T026 [US3] Implement complete case/context/settlement variable mapper in src/lib/email/variables.ts
- [X] T027 [US3] Enforce template metadata-variable consistency checks in src/lib/email/templates.ts
- [X] T028 [US3] Use shared variable mapper in compose render path and send payload construction in src/components/cases/compose-email-dialog.tsx
- [X] T029 [US3] Use shared variable mapper in preview API rendering flow in src/app/api/email-templates/preview/route.ts

**Checkpoint**: All user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening, regression checks, and documentation updates.

- [X] T030 [P] Document final email template flow and API smoke steps in specs/005-email-template-system/quickstart.md
- [X] T031 Run feature test suites and fix regressions in tests/integration/cases/emails-route.test.ts
- [X] T032 [P] Add regression guard assertions for unchanged case lifecycle behavior in tests/integration/cases/status-transition-route.test.ts
- [X] T033 Measure template list and case email history API response times against <=1.0s target in tests/integration/email/performance-smoke.test.ts
- [X] T034 Define and run usability validation checklist for compose-and-log first-attempt success (SC-002) in specs/005-email-template-system/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies.
- **Phase 2 (Foundational)**: Depends on Phase 1 and blocks all user stories.
- **Phase 3 (US1)**: Depends on Phase 2 completion.
- **Phase 4 (US2)**: Depends on Phase 2 completion; can run parallel with US1 after foundation if staffed.
- **Phase 5 (US3)**: Depends on Phase 2 completion; can run parallel with US1/US2 after foundation if staffed.
- **Phase 6 (Polish)**: Depends on completion of desired user stories.

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories after foundation.
- **US2 (P2)**: No dependency on other stories after foundation.
- **US3 (P3)**: Depends on foundational renderer/template scaffolding and integrates with US1/US2 paths.

### Within Each User Story

- Write tests first and confirm they fail before implementation.
- Implement API/domain logic before UI integration.
- Complete story-specific validation before marking the story done.

---

## Parallel Opportunities

- **Setup**: T003 can run in parallel with T001-T002.
- **Foundational**: T005, T006, and T008 can run in parallel after T004 starts.
- **US1**: T009 and T010 can run in parallel; T012 can run in parallel with T011.
- **US2**: T017 and T018 can run in parallel; T021 can run in parallel with T019/T020.
- **US3**: T024 and T025 can run in parallel with early implementation of T026.
- **Polish**: T030 and T032 can run in parallel while T031 executes.

---

## Parallel Example: User Story 1

```bash
# Run US1 test creation tasks in parallel
Task: "T009 [US1] tests/integration/cases/emails-route.test.ts"
Task: "T010 [US1] tests/e2e/cases/case-emails-compose-log.spec.ts"

# Run API and dialog implementation in parallel
Task: "T011 [US1] src/app/api/cases/[id]/emails/route.ts"
Task: "T012 [US1] src/components/cases/compose-email-dialog.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1 and Phase 2.
2. Deliver Phase 3 (US1) end-to-end.
3. Validate US1 independently before expanding scope.

### Incremental Delivery

1. Foundation (Phases 1-2)
2. US1 (compose/log) as MVP
3. US2 (template visibility/preview)
4. US3 (variable coverage hardening)
5. Polish and regression checks

### Parallel Team Strategy

1. Team aligns on Phase 1-2 together.
2. After foundation: one stream on US1, one on US2, one on US3 tests/mapper.
3. Rejoin for Phase 6 regression and documentation.

---

## Notes

- `[P]` tasks are file-isolated and safe for parallel execution.
- Story labels (`[US1]`, `[US2]`, `[US3]`) preserve traceability to acceptance scenarios.
- Every task includes a concrete file path for direct implementation.

## Commit Gate (Constitution VI)

- After completing each task T00X, create a separate commit.
- Commit format MUST be: `feat(scope): T00X - description`
- Do not bundle multiple completed task IDs into a single commit unless explicitly approved.
