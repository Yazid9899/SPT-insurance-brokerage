---

description: "Task list for Feature 001 foundation implementation"
---

# Tasks: Foundation Application Shell

**Input**: Design documents from `/specs/001-foundation-auth-shell/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Include tests required by constitution and plan (API happy-path integration, auth/route guards, lifecycle/reference correctness, and core shared component behavior).

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable task (different files, no unresolved dependency)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`)
- Each task includes an exact target file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize project tooling and baseline workspace structure.

- [X] T001 Initialize Next.js App Router project baseline and scripts in `package.json`
- [X] T002 Enable strict TypeScript compiler settings in `tsconfig.json`
- [X] T003 Configure Tailwind CSS foundation in `tailwind.config.ts`
- [X] T004 Configure global styles and design tokens in `src/app/globals.css`
- [X] T005 Initialize shadcn/ui (new-york style, slate base) in `components.json`
- [X] T006 [P] Configure Vitest + Testing Library script entries in `package.json`
- [X] T007 [P] Configure Playwright script entries in `package.json`
- [X] T008 [P] Add base test harness setup in `tests/setup.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Complete core platform and domain prerequisites before any user story work.

**CRITICAL**: No user story implementation starts before this phase is complete.

- [X] T009 Implement full core schema (all enums/models/indexes) in `prisma/schema.prisma`
- [X] T010 Create initial Prisma migration SQL in `prisma/migrations/202603250001_foundation_init/migration.sql`
- [X] T011 Implement Prisma client singleton and runtime guard in `src/lib/prisma.ts`
- [X] T012 Implement credentials auth config and JWT session callbacks in `src/lib/auth.ts`
- [X] T013 Implement NextAuth route handler in `src/app/api/auth/[...nextauth]/route.ts`
- [X] T014 Implement global route protection middleware in `src/middleware.ts`
- [X] T015 Implement domain constants (product lines, cargo sub-products, lifecycle, status colors) in `src/lib/constants.ts`
- [X] T016 Implement lifecycle transition map helper scaffold in `src/lib/status-machine.ts`
- [X] T017 Implement Decimal/currency serialization + formatting helpers in `src/lib/currency.ts`
- [X] T018 Implement shared input/response zod schemas in `src/lib/validations.ts`
- [X] T019 Implement DB seed data (predefined user + baseline entities) in `prisma/seed.ts`
- [X] T020 Implement root app layout and provider composition in `src/app/layout.tsx`
- [X] T021 [P] Configure Vitest runtime in `vitest.config.ts`
- [X] T022 [P] Configure Playwright runtime in `playwright.config.ts`

**Checkpoint**: Foundation complete; user stories can proceed.

---

## Phase 3: User Story 1 - Secure Access to Workspace (Priority: P1)

**Goal**: Case Maker can authenticate with predefined credentials and access only protected app routes.

**Independent Test**: Valid login lands on Dashboard, invalid login stays on login with generic error, unauthenticated protected route access redirects to login, and authenticated `/login` visits redirect to Dashboard.

### Tests for User Story 1

- [X] T023 [P] [US1] Add integration test for successful credentials login in `tests/integration/auth/login-success.test.ts`
- [X] T024 [P] [US1] Add integration test for generic invalid-credentials response in `tests/integration/auth/login-failure.test.ts`
- [X] T025 [P] [US1] Add integration test for unauthenticated protected-route redirect in `tests/integration/auth/protected-redirect.test.ts`
- [X] T026 [P] [US1] Add e2e test for authenticated `/login` redirect to dashboard in `tests/e2e/auth/login-route-redirect.spec.ts`
- [X] T057 [P] [US1] Add integration verification test for `/api/auth/session` contract behavior in `tests/integration/auth/session-route.test.ts`

### Implementation for User Story 1

- [X] T027 [US1] Implement login page form with zod + react-hook-form validation in `src/app/(auth)/login/page.tsx`
- [X] T028 [US1] Implement auth route-group layout for guest pages in `src/app/(auth)/layout.tsx`
- [X] T029 [US1] Implement bcrypt credential verification and safe error messaging in `src/lib/auth.ts`
- [X] T030 [US1] Implement dashboard route-group session guard in `src/app/(dashboard)/layout.tsx`
- [X] T031 [US1] Implement Dashboard placeholder page and default post-login landing in `src/app/(dashboard)/page.tsx`

**Checkpoint**: Authentication flow and route protection are independently functional.

---

## Phase 4: User Story 2 - Navigate Core Modules from a Persistent Shell (Priority: P1)

**Goal**: Signed-in user can navigate all top-level modules via a persistent sidebar shell with identity footer.

**Independent Test**: Sidebar persists across module pages, includes required links, and shows CargoShield + logged-in user identity.

### Tests for User Story 2

- [X] T032 [P] [US2] Add component test for sidebar links and user footer in `tests/unit/components/app-sidebar.test.tsx`
- [X] T033 [P] [US2] Add e2e test for persistent shell navigation across module pages in `tests/e2e/shell/sidebar-persistence.spec.ts`

### Implementation for User Story 2

- [X] T034 [US2] Implement persistent sidebar component with app branding and user identity in `src/components/layout/app-sidebar.tsx`
- [X] T035 [US2] Implement shared page header component in `src/components/shared/page-header.tsx`
- [X] T036 [US2] Wire persistent sidebar shell into dashboard layout in `src/app/(dashboard)/layout.tsx`
- [X] T037 [US2] Create Cases placeholder page in `src/app/(dashboard)/cases/page.tsx`
- [X] T038 [US2] Create Open Covers placeholder page in `src/app/(dashboard)/open-covers/page.tsx`
- [X] T039 [US2] Create Settlements placeholder page in `src/app/(dashboard)/settlements/page.tsx`
- [X] T040 [US2] Create Reports placeholder page in `src/app/(dashboard)/reports/page.tsx`
- [X] T041 [US2] Create Email Templates placeholder page in `src/app/(dashboard)/email-templates/page.tsx`
- [X] T042 [US2] Implement shared DataTable component baseline (sort/filter/paginate hooks) in `src/components/shared/data-table.tsx`
- [X] T043 [US2] Implement shared StatusBadge component with canonical color mapping in `src/components/shared/status-badge.tsx`
- [X] T044 [US2] Implement shared CurrencyInput component with symbol + thousands formatting in `src/components/shared/currency-input.tsx`

**Checkpoint**: App shell navigation and shared UI primitives are independently functional.

---

## Phase 5: User Story 3 - Establish Product and Lifecycle Baselines (Priority: P2)

**Goal**: App exposes product-line taxonomy and 7-step lifecycle references for future workflows.

**Independent Test**: Authenticated reference payload includes required product lines, cargo sub-products, and ordered lifecycle statuses; dashboard placeholders surface the same canonical references.

### Tests for User Story 3

- [X] T045 [P] [US3] Add integration test for references API happy path in `tests/integration/foundation/references-route.test.ts`
- [X] T046 [P] [US3] Add integration test for bootstrap API happy path in `tests/integration/foundation/bootstrap-route.test.ts`
- [X] T047 [P] [US3] Add unit test for lifecycle order and product taxonomy constants in `tests/unit/lib/constants.test.ts`

### Implementation for User Story 3

- [X] T048 [US3] Implement foundation bootstrap endpoint contract response in `src/app/api/foundation/bootstrap/route.ts`
- [X] T049 [US3] Implement foundation references endpoint contract response in `src/app/api/foundation/references/route.ts`
- [X] T050 [US3] Implement shared foundation reference panel component in `src/components/shared/foundation-reference-panel.tsx`
- [X] T051 [US3] Render reference panel on Dashboard placeholder in `src/app/(dashboard)/page.tsx`
- [X] T052 [US3] Add typed API response contracts for foundation endpoints in `src/types/index.ts`

**Checkpoint**: Product/lifecycle baseline references are independently available and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency, docs, and quality checks across stories.

- [X] T053 Update implementation quickstart steps to match actual commands in `specs/001-foundation-auth-shell/quickstart.md`
- [X] T054 [P] Add foundation smoke checklist for manual verification in `specs/001-foundation-auth-shell/checklists/foundation-smoke.md`
- [X] T055 [P] Add API error helper to enforce `{ error: string, details?: object }` shape in `src/lib/api-error.ts`
- [X] T056 Enforce shared helper usage for all placeholder financial displays in `src/app/(dashboard)/page.tsx`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Starts immediately.
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories.
- **User Story Phases (Phase 3-5)**: Depend on Foundational completion.
- **Polish (Phase 6)**: Depends on all targeted user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Starts immediately after Foundational.
- **US2 (P1)**: Depends on US1 auth/session guard behavior.
- **US3 (P2)**: Depends on US1 authentication and can proceed in parallel with later US2 non-overlapping tasks once shared constants are stable.

### Within Each User Story

- Test tasks first, and confirm failure before implementation.
- Implement route/data behavior before wiring UI presentation.
- Complete story acceptance checks before moving to lower-priority scope.

### Parallel Opportunities

- Setup config tasks T006-T008 can run in parallel.
- Foundational test config tasks T021-T022 can run in parallel.
- US1 tests T023-T026 can run in parallel.
- US2 tests T032-T033 can run in parallel.
- US3 tests T045-T047 can run in parallel.
- Polish tasks T054-T055 can run in parallel.

---

## Parallel Example: User Story 1

```bash
# Run auth tests in parallel first
Task: T023 tests/integration/auth/login-success.test.ts
Task: T024 tests/integration/auth/login-failure.test.ts
Task: T025 tests/integration/auth/protected-redirect.test.ts
Task: T026 tests/e2e/auth/login-route-redirect.spec.ts
```

## Parallel Example: User Story 2

```bash
# Run shell behavior tests in parallel
Task: T032 tests/unit/components/app-sidebar.test.tsx
Task: T033 tests/e2e/shell/sidebar-persistence.spec.ts
```

## Parallel Example: User Story 3

```bash
# Run foundation contract/reference tests in parallel
Task: T045 tests/integration/foundation/references-route.test.ts
Task: T046 tests/integration/foundation/bootstrap-route.test.ts
Task: T047 tests/unit/lib/constants.test.ts
```

---

## Implementation Strategy

### MVP First (US1 only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Validate login + redirects end-to-end.
4. Demo secure access baseline.

### Incremental Delivery

1. Ship US1 secure access baseline.
2. Add US2 persistent shell and shared UI primitives.
3. Add US3 product/lifecycle references and contracts.
4. Finish with Phase 6 polish.

### Parallel Team Strategy

1. Team completes Setup + Foundational together.
2. After Foundational:
   - Engineer A: US1 auth flow + tests.
   - Engineer B: US2 shell components + placeholder pages.
   - Engineer C: US3 foundation endpoints + constants tests.

---

## Notes

- Task format compliance: all tasks use `- [ ] T### [P?] [US?] Description with file path`.
- Story tasks include `[US1]`, `[US2]`, or `[US3]`; setup/foundational/polish tasks do not.
- Commit policy from constitution applies: one commit per completed task ID.
