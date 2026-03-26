# Implementation Plan: Case Management Core

**Branch**: `[003-case-management-core]` | **Date**: 2026-03-26 | **Spec**: [/specs/003-case-management-core/spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-case-management-core/spec.md` and PRD.md Section 5/10

## Summary

Implement end-to-end case management for create, list, detail, update, draft delete, and controlled status transitions.
The design uses Next.js App Router API routes, Prisma-backed persistence, shared financial calculation utilities, and strict server-side transition validation with audit logging.

## Technical Context

**Language/Version**: TypeScript (strict), Node.js 20 LTS  
**Primary Dependencies**: Next.js App Router, React, Prisma, Zod, react-hook-form, @hookform/resolvers, NextAuth.js, decimal.js  
**Storage**: PostgreSQL via Prisma models (`Case`, `CaseStatusHistory`, related `OpenCover`, `CaseDocument`)  
**Testing**: Vitest (unit/integration), Playwright (e2e)  
**Target Platform**: Web application on server-rendered Next.js  
**Project Type**: Web application (single Next.js project with App Router + API routes)  
**Performance Goals**: Case list/search/filter page responses <= 1.5s for typical filtered pages (20 rows); status transition response <= 800ms for single-case operations  
**Constraints**: Decimal-safe premium math; server-side state machine enforcement; soft-delete for Draft only; URL search-param filters; consistent shared status color mapping  
**Scale/Scope**: Internal operations users, expected low-thousands active cases, paginated list at 20 rows/page, single-role operational model (no RBAC expansion)

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
specs/003-case-management-core/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- cases.openapi.yaml
`-- tasks.md
```

### Source Code (repository root)

```text
src/
|-- app/
|   |-- (dashboard)/cases/
|   |   |-- page.tsx
|   |   |-- new/page.tsx
|   |   `-- [id]/page.tsx
|   `-- api/cases/
|       |-- route.ts
|       `-- [id]/
|           |-- route.ts
|           `-- status/route.ts
|-- components/
|   |-- cases/
|   |   |-- case-form.tsx
|   |   |-- case-table.tsx
|   |   `-- case-detail.tsx
|   `-- shared/
|       |-- data-table.tsx
|       `-- status-badge.tsx
|-- lib/
|   |-- calculations.ts
|   |-- constants.ts
|   |-- status-machine.ts
|   |-- status-transitions.ts
|   |-- validations.ts
|   `-- prisma.ts
`-- types/

tests/
|-- unit/
|   |-- lib/
|   |   |-- calculations.test.ts
|   |   `-- status-transitions.test.ts
|   `-- components/
|       `-- case-form*.test.tsx
|-- integration/
|   `-- cases/
|       |-- list-route.test.ts
|       |-- create-route.test.ts
|       |-- update-route.test.ts
|       |-- delete-route.test.ts
|       `-- status-transition-route.test.ts
`-- e2e/
    `-- cases/
```

**Structure Decision**: Keep a single Next.js App Router codebase; implement feature logic in existing `src/app/(dashboard)/cases`, `src/app/api/cases`, and shared domain logic in `src/lib`.

## Phase 0: Research Plan

Research output is captured in `research.md` with explicit decisions on:
- Shared premium calculation utility behavior (client+server use)
- Server transition validation strategy (`STATUS_TRANSITIONS` + per-transition schemas)
- Draft soft-delete semantics with list/search exclusion
- URL search-param filtering contract for case list
- Status badge color source-of-truth in shared constants

## Phase 1: Design & Contracts

Design outputs:
- `data-model.md`: entity definitions, validation constraints, and transition invariants
- `contracts/cases.openapi.yaml`: REST contract for list/create/update/delete/status transition
- `quickstart.md`: implementation sequence, run commands, and test checklist

Architecture decisions:
- Use `POST /api/cases/[id]/status` for transition requests with optional note and server authorization checks.
- Reuse shared `calculatePremiums()` utility from `src/lib/calculations.ts` for both UI preview and persistence-time verification.
- Keep state machine definition centralized in `src/lib/status-machine.ts` and transition rule schemas in `src/lib/status-transitions.ts`.
- Persist every transition to `CaseStatusHistory` in same transaction as case status update.
- Use soft-delete flag/timestamp for Draft deletion behavior and exclude soft-deleted records in list/search queries by default.

## Phase 2: Task Planning Approach

Task generation (`/speckit.tasks`) will group work by:
1. Data and validation updates (schema, Zod, state machine/rules)
2. API route implementation (`GET/POST/PUT/DELETE` and transition route)
3. UI flows (form conditional rendering, list filters, detail tabs/actions)
4. Shared visual consistency (status colors + badge usage)
5. Tests (unit, integration, e2e)

## Testing Strategy (Constitution-aligned)

- API integration tests: happy-path coverage for list, create, update, delete (Draft only), status transition.
- Unit tests: `calculatePremiums()` edge cases (zero, invalid rates, rounding) and transition-rule validator matrix.
- Integration tests: invalid transitions, missing prerequisite documents, cargo-specific required fields, soft-delete behavior.
- E2E tests: case creation variants (Open Cover vs Single Shipment), list filtering via URL params, detail transition dialog behavior.
- Regression coverage for malformed XLS remains in existing bulk-upload tests to satisfy constitutional requirement.

## Post-Design Constitution Re-Check

- [x] `spec.md` remains WHAT/WHY only; implementation details contained in plan/design artifacts.
- [x] All HOW decisions documented in plan/data-model/contracts/quickstart.
- [x] Decimal + currency + dual-rate model enforced in design.
- [x] Server-side case number generation format retained.
- [x] Explicit state-machine and mandatory history logging retained.
- [x] Transaction boundaries defined for multi-table writes.
- [x] Scope stays single-role operational model (no RBAC/multi-tenancy expansion).
- [x] Test strategy covers APIs, financial calculations, transitions, and malformed XLS handling.

## Complexity Tracking

No constitution violations or justified deviations for this feature.

## Implementation Notes (2026-03-26)

- Implemented soft-delete support for Draft cases (`Case.deletedAt` + migration).
- Added server-side case number utility (`src/lib/case-number.ts`) and settlement-paid close hook (`src/lib/settlement-hooks.ts`).
- Implemented list/create/detail/update/delete/status routes for cases with shared validation and transition guard logic.
- Added case list and case detail UI components with status badges, confirmation flows, and debit-note prompt on Active -> Billing.
- Added/updated unit and integration tests for calculations, transition rules, list/detail/create/update/delete/status behavior, debit-note prompt, and settlement-paid hook.
- Validation run: `npm run test` passed; `npm run lint` requires interactive configuration migration in current repository setup.
