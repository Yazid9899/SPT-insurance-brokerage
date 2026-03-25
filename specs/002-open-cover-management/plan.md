# Implementation Plan: Open Cover Management

**Branch**: `002-open-cover-management` | **Date**: 2026-03-25 | **Spec**: [/specs/002-open-cover-management/spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-open-cover-management/spec.md`

## Summary

Deliver Feature 003 Open Cover Management: list/create/detail/edit open cover agreements,
protect historical declaration insurer rates from retroactive agreement changes, and integrate
active open cover selection into new-case creation with agreement-driven auto-fill behavior.

## Technical Context

**Language/Version**: TypeScript (strict mode), Node.js 20 LTS, Next.js App Router  
**Primary Dependencies**: Next.js, React, Prisma, Zod, react-hook-form, `@hookform/resolvers`, NextAuth.js, Tailwind CSS  
**Storage**: PostgreSQL via Prisma (`OpenCover`, `Case`, `CaseStatusHistory`)  
**Testing**: Vitest (unit/integration), Playwright (e2e)  
**Target Platform**: Internal web app (desktop-first)  
**Project Type**: Full-stack web application (single Next.js monolith)  
**Performance Goals**: Open cover list/detail responses under 1s p95 in internal network; create/edit open cover actions under 2s p95; open-cover prefill in case form under 500ms p95  
**Constraints**: Open cover limited to Cargo line; insurer rate fixed per agreement; insurer-rate edits are non-retroactive for existing cases; open-cover case selection requires active agreements; agreement currency is locked into selected open-cover cases  
**Scale/Scope**: Internal brokerage operations; tens to low-thousands of declarations per agreement lifecycle

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] `spec.md` contains only WHAT/WHY requirements and acceptance criteria (no stack or architecture details).
- [x] `plan.md` documents all HOW decisions (stack, architecture, data model, API design, file layout).
- [x] Financial design uses Decimal math and explicit currency codes; client rate and insurer rate are modeled separately.
- [x] Case number generation is server-side only with `BRK-YYYY-NNNN` format.
- [x] Status transitions are constrained by an explicit state machine and include history logging.
- [x] Multi-table writes and settlement batch transitions are transaction-safe/atomic by design.
- [x] Phase 1 scope excludes RBAC, multi-tenancy, and microservices unless explicitly approved as a deviation.
- [x] Plan includes required testing strategy for API routes, financial calculations, status transitions, and malformed XLS parsing regression coverage.

## Project Structure

### Documentation (this feature)

```text
specs/002-open-cover-management/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- open-cover-api.openapi.yaml
`-- tasks.md
```

### Source Code (repository root)

```text
src/
|-- app/
|   |-- (dashboard)/
|   |   |-- open-covers/
|   |   |   |-- page.tsx
|   |   |   |-- new/page.tsx
|   |   |   `-- [id]/
|   |   |       |-- page.tsx
|   |   |       `-- edit/page.tsx
|   |   `-- cases/new/page.tsx
|   `-- api/
|       |-- open-covers/
|       |   |-- route.ts
|       |   `-- [id]/route.ts
|       `-- cases/
|           |-- route.ts
|           |-- [id]/route.ts
|           `-- [id]/status/route.ts
|-- components/
|   |-- open-covers/
|   |   |-- open-cover-table.tsx
|   |   |-- open-cover-form.tsx
|   |   `-- open-cover-detail.tsx
|   |-- cases/
|   |   `-- case-form.tsx
|   `-- shared/
|       `-- status-badge.tsx
|-- lib/
|   |-- constants.ts
|   |-- validations.ts
|   |-- status-transitions.ts
|   |-- calculations.ts
|   `-- open-cover-status.ts
`-- types/
    `-- index.ts

tests/
|-- integration/
|   |-- open-covers/
|   `-- cases/
|-- unit/
|   |-- lib/
|   `-- components/
`-- e2e/
    |-- open-covers/
    `-- cases/
```

**Structure Decision**: Implement open cover management as a dedicated dashboard vertical with route handlers and shared domain utilities for transitions, premium calculations, and status display consistency.

## Implementation Notes

- Open cover list includes reference, client name, cargo product, insurer name, insurer rate, effective period, active/expired status, and declaration count.
- Open cover create/edit forms validate unique reference and valid effective periods.
- Open cover detail includes filterable declarations list tied to agreement id.
- Agreement insurer-rate updates never mutate existing declaration case financial data.
- Case form behavior for `coverType=OPEN_COVER`:
  - selector includes active agreements only,
  - selecting agreement auto-fills client info + insurer rate,
  - insurer rate and currency lock to agreement values,
  - client rate remains editable.
- Premium integrity uses shared `calculatePremiums()` utility on client (UX feedback) and server (persistence enforcement).
- Status transitions are validated server-side in `POST /api/cases/[id]/status` through `STATUS_TRANSITIONS` map and transition-specific schemas.
- Case list filters are URL search params and are applied server-side.
- Status color mapping is centralized in constants and consumed by shared `StatusBadge`.

## Test Strategy

- API integration:
  - `GET/POST /api/open-covers`
  - `GET/PUT /api/open-covers/[id]`
  - open-cover-aware `POST/PUT /api/cases`
  - `DELETE /api/cases/[id]` draft-only enforcement
  - `POST /api/cases/[id]/status` transition validation
- Financial tests:
  - `calculatePremiums()` correctness and decimal-safety
  - non-retroactive insurer-rate behavior for existing cases
- UI tests:
  - open cover table column completeness
  - open cover detail declaration filtering
  - case form open-cover auto-fill and lock behavior
  - status badge color consistency
- E2E tests:
  - create/list/detail/edit open cover flow
  - create open-cover case with active agreement prefill path
- Regression:
  - retain malformed XLS parser tests from existing suite (no new parser behavior introduced here)

## Post-Design Constitution Re-Check

- [x] Spec/plan separation is preserved.
- [x] Decimal/currency integrity is enforced in calculation strategy.
- [x] Dual-rate model remains explicit and non-mixed.
- [x] Case numbering authority remains server-side.
- [x] Status transitions and history logging remain validated and test-covered.
- [x] Data integrity preserved for non-retroactive insurer-rate updates.
- [x] Scope remains single-role and monolith-aligned.
- [x] Required test categories are included (API, financial, status, malformed XLS regression).

## Complexity Tracking

No constitutional violations identified; complexity exemptions are not required.
