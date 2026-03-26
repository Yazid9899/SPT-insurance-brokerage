# Implementation Plan: Monthly Insurer Settlement

**Branch**: `[007-monthly-insurer-settlement]` | **Date**: 2026-03-26 | **Spec**: [/specs/007-monthly-insurer-settlement/spec.md](./spec.md)  
**Input**: Feature specification from `/specs/007-monthly-insurer-settlement/spec.md`

## Summary

Implement monthly settlement management for insurer payable batches: create DRAFT settlements from eligible BILLING cases, manage matching selection with running totals, confirm settlements with atomic BILLING->SETTLING transitions, and mark settlements as PAID with atomic SETTLING->CLOSED transitions including audit history and `closedAt` stamping.

## Technical Context

**Language/Version**: TypeScript (strict mode), Node.js 20 LTS  
**Primary Dependencies**: Next.js App Router, React, Prisma, Zod, NextAuth.js, decimal.js  
**Storage**: PostgreSQL via Prisma (`Settlement`, `SettlementItem`, `Case`, `CaseStatusHistory`)  
**Testing**: Vitest (unit + integration), Playwright (e2e)  
**Target Platform**: Web application (internal dashboard)  
**Project Type**: Single Next.js web app (App Router + API routes)  
**Performance Goals**: settlement draft creation and case preload under 2 seconds for up to 500 eligible cases; confirm/pay completion under 3 seconds for up to 500 matched cases  
**Constraints**: atomic multi-case transitions; unique bank transfer reference globally; membership lock after CONFIRMED; single-role Phase 1 scope  
**Scale/Scope**: monthly operations per insurer; low-concurrency internal users; low-thousands case volume

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
specs/007-monthly-insurer-settlement/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- settlements.openapi.yaml
`-- tasks.md
```

### Source Code (repository root)

```text
src/
|-- app/
|   |-- (dashboard)/settlements/
|   |   |-- page.tsx
|   |   `-- [id]/page.tsx
|   `-- api/settlements/
|       |-- route.ts
|       `-- [id]/
|           |-- route.ts
|           |-- confirm/route.ts
|           `-- pay/route.ts
|-- components/settlements/
|   |-- settlements-table.tsx
|   |-- settlement-create-dialog.tsx
|   |-- settlement-detail-header.tsx
|   |-- settlement-matching-table.tsx
|   `-- settlement-totals-card.tsx
|-- lib/
|   |-- settlement-number.ts
|   |-- settlement-service.ts
|   |-- settlement-hooks.ts
|   |-- status-transitions.ts
|   `-- validations.ts
`-- types/
    `-- index.ts

tests/
|-- integration/settlements/
|   |-- settlements-create-route.test.ts
|   |-- settlements-confirm-route.test.ts
|   |-- settlements-pay-route.test.ts
|   `-- settlements-concurrency.test.ts
|-- unit/lib/
|   `-- settlement-totals.test.ts
`-- e2e/settlements/
    `-- settlement-lifecycle.spec.ts
```

**Structure Decision**: Keep settlement business logic centralized in `src/lib/settlement-service.ts` and route handlers thin; build dedicated settlement UI components under `src/components/settlements` for list/create/detail/matching/totals.

## Phase 0: Research Plan

Research outputs in `research.md` will resolve:
- Best Prisma transaction pattern for confirm/pay multi-case state changes.
- Concurrency/locking strategy preventing duplicate case settling and stale transitions.
- Safe settlement number generation pattern (`STL-YYYY-MM-NNN`) under concurrent create requests.
- Decimal-safe aggregation approach for totals at draft and detail stages.

## Phase 1: Design & Contracts

Artifacts to produce:
- `data-model.md` with settlement entities, invariants, and lifecycle transitions.
- `contracts/settlements.openapi.yaml` covering list/create/detail/update/confirm/pay endpoints and error shapes.
- `quickstart.md` with operator validation flow and atomicity checks.

Design decisions:
- Settlement creation preloads only eligible BILLING cases with explicit insurer identity from open cover linkage.
- Confirm and pay transitions execute in Prisma transactions with explicit row-state guards.
- Case selection edits are allowed only in DRAFT and blocked after CONFIRMED.
- Bank transfer reference uniqueness enforced at pay operation level across settlements.
- Status history entries are written for each case transition performed by settlement actions.
- Settlement totals computed with Decimal-safe aggregation from selected `SettlementItem` records.

## Phase 2: Task Planning Approach

`/speckit.tasks` should decompose work into:
1. Foundational settlement service + number generator + validation schemas.
2. Settlement API routes (`GET/POST/GET by id/PUT/confirm/pay`) with transactional guards.
3. Dashboard pages and settlement UI components.
4. Integration/unit/e2e tests for lifecycle, concurrency, and totals.
5. Polish checks for status history, `closedAt`, and list/detail consistency.

## Testing Strategy (Constitution-aligned)

- Unit tests:
  - Decimal-safe settlement total aggregation.
  - Settlement reference formatting and sequence behavior.
- Integration tests:
  - `POST /api/settlements` draft creation and eligibility preload.
  - `POST /api/settlements/[id]/confirm` atomic BILLING->SETTLING transitions with history writes.
  - `POST /api/settlements/[id]/pay` atomic SETTLING->CLOSED transitions with `closedAt`, history, and payment metadata.
  - Concurrency guard tests for duplicate settlement membership and stale transition protection.
- E2E tests:
  - Full settlement lifecycle (create draft, match, confirm, pay).
  - Locked matching behavior after confirmation.
  - Settlement list/detail totals and status visibility.

## Post-Design Constitution Re-Check

- [x] `spec.md` remains WHAT/WHY only; implementation details are in plan/design artifacts.
- [x] All HOW decisions are documented in plan/research/data-model/contracts/quickstart.
- [x] Financial computations use Decimal-safe aggregation with explicit currency usage.
- [x] Case numbering constraints remain server-managed; settlement numbering is also server-managed.
- [x] Status transitions and history logging remain explicit and auditable.
- [x] Multi-table settlement transitions are transaction-based and atomic.
- [x] Scope remains single-role and avoids out-of-scope RBAC/multi-tenancy expansion.
- [x] Test strategy explicitly covers API routes, financial totals, transitions, and concurrency conflicts.

## Complexity Tracking

No constitution violations or justified deviations required for this feature.

