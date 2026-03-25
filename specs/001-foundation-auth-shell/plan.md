# Implementation Plan: Foundation Application Shell

**Branch**: `001-foundation-auth-shell` | **Date**: 2026-03-25 | **Spec**: [/specs/001-foundation-auth-shell/spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-foundation-auth-shell/spec.md`

## Summary

Deliver CargoShield Feature 001 foundation: authenticated access for a single Case Maker,
a protected App Router shell with persistent sidebar navigation, placeholder module pages,
foundational domain reference data (product lines + cargo sub-products + 7-step lifecycle),
and shared UI primitives (`DataTable`, `StatusBadge`, `CurrencyInput`, `PageHeader`).
Implementation includes full Prisma schema baseline from PRD, seeded development data,
and credentials-based session auth with secure password verification.

## Technical Context

**Language/Version**: TypeScript (strict mode), Node.js 20 LTS, Next.js 14+ App Router  
**Primary Dependencies**: Next.js, React, NextAuth.js (credentials), Prisma, `@prisma/client`, bcrypt, Zod, react-hook-form, shadcn/ui, Tailwind CSS, SheetJS (`xlsx`), recharts, date-fns, Resend  
**Storage**: PostgreSQL 15+ (Supabase or Neon), local filesystem uploads in dev (`/public/uploads`)  
**Testing**: Vitest + Testing Library for unit/component tests, Playwright for auth/shell integration flows, API integration tests for route handlers  
**Target Platform**: Web (desktop-first internal app), modern Chromium/Firefox/Safari  
**Project Type**: Full-stack web application (Next.js App Router monolith)  
**Performance Goals**: Login completion under 2s p95 on local network; authenticated route guard/redirect under 500ms p95; sidebar navigation render under 1s p95. In Feature 001 these remain guidance targets and are validated only through manual QA observations (no benchmark gate).  
**Constraints**: Decimal-only financial math, explicit currency codes, single-role scope (Case Maker), no RBAC/multi-tenancy/microservices in Phase 1  
**Scale/Scope**: Initial internal rollout (single primary user + seed data), foundation for subsequent feature increments

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] `spec.md` contains only WHAT/WHY requirements and acceptance criteria (no stack or architecture details).
- [x] `plan.md` documents all HOW decisions (stack, architecture, data model, API design, file layout).
- [x] Financial design uses Decimal math and explicit currency codes; client rate and insurer rate are modeled separately.
- [x] Case number generation is server-side only with `BRK-YYYY-NNNN` format.
- [x] Status transitions are constrained by an explicit state machine and include history logging; transition enforcement and test execution are explicitly deferred to Feature 002 by approved scope deviation.
- [x] Multi-table writes and settlement batch transitions are transaction-safe/atomic by design.
- [x] Phase 1 scope excludes RBAC, multi-tenancy, and microservices unless explicitly approved as a deviation.
- [x] Plan includes required testing strategy for API routes and foundation behavior; malformed XLS parsing tests are explicitly deferred to Feature 004 by approved scope deviation.

## Project Structure

### Documentation (this feature)

```text
specs/001-foundation-auth-shell/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- foundation-api.openapi.yaml
`-- tasks.md
```

### Source Code (repository root)

```text
prisma/
|-- schema.prisma
|-- migrations/
`-- seed.ts

src/
|-- app/
|   |-- (auth)/
|   |   |-- login/page.tsx
|   |   `-- layout.tsx
|   |-- (dashboard)/
|   |   |-- layout.tsx
|   |   |-- page.tsx
|   |   |-- cases/page.tsx
|   |   |-- open-covers/page.tsx
|   |   |-- settlements/page.tsx
|   |   |-- reports/page.tsx
|   |   `-- email-templates/page.tsx
|   |-- api/
|   |   |-- auth/[...nextauth]/route.ts
|   |   `-- foundation/
|   |       |-- bootstrap/route.ts
|   |       `-- references/route.ts
|   `-- layout.tsx
|-- components/
|   |-- layout/
|   |   `-- app-sidebar.tsx
|   `-- shared/
|       |-- data-table.tsx
|       |-- status-badge.tsx
|       |-- currency-input.tsx
|       `-- page-header.tsx
|-- lib/
|   |-- prisma.ts
|   |-- auth.ts
|   |-- constants.ts
|   |-- validations.ts
|   |-- currency.ts
|   `-- status-machine.ts
`-- types/
    `-- index.ts

tests/
|-- integration/
|-- unit/
`-- e2e/
```

**Structure Decision**: Single Next.js App Router project with route groups `(auth)` and `(dashboard)`, Prisma for persistence, and shared component/domain libraries under `src/lib` and `src/components/shared`.

## Implementation Notes

- Credentials auth uses a predefined seeded user and bcrypt password hash.
- Session strategy is JWT for simplicity in foundation scope.
- App shell pages are protected by server-side session checks.
- Placeholder content is delivered for Dashboard and module pages while preserving final navigation IA.
- Full domain schema is introduced now (including future-module entities) to avoid migration churn and enable upcoming features.
- Decimal values are serialized safely for API responses as strings to avoid precision loss.
- `xlsx`, `recharts`, and `Resend` are installed as shared baseline dependencies in Feature 001 and are intentionally first used in later scope: Feature 004 (`xlsx`), Feature 008 (`recharts`), and Feature 006 (`Resend`).

## Test Strategy

- API integration: happy-path tests for auth route behavior and foundation reference/bootstrap endpoints.
- Auth and route guard integration: unauthenticated redirect behavior and authenticated login routing behavior.
- Unit tests: decimal conversion helpers, status metadata helpers, currency display formatting.
- UI tests: sidebar persistence, module navigation, user identity display in shell footer, placeholder rendering.
- Future-facing guard tests (foundation-level stubs): lifecycle list order and product-line availability.
- Feature-scope deviation: status transition valid/invalid behavior tests are implemented in Feature 002 when transition rules become executable logic.
- Feature-scope deviation: malformed XLS parsing tests are implemented in Feature 004 when parser logic is introduced.

## Post-Design Constitution Re-Check

- [x] Spec/plan separation remains intact (no implementation details in `spec.md`).
- [x] Decimal + explicit currency strategy is preserved in data model and contracts.
- [x] Dual-rate (`clientRate`, `insurerRate`) is modeled distinctly at case level.
- [x] Server-generated case numbering strategy (`BRK-YYYY-NNNN`) is explicitly retained.
- [x] Status lifecycle and history logging constraints are reflected in data model; transition-rule tests are deferred to Feature 002 as approved scope.
- [x] Transaction requirements for multi-table writes and settlement batches are specified.
- [x] Phase 1 scope remains single-role and excludes RBAC/multi-tenancy/microservices.
- [x] Testing plan covers API happy path and foundation validation scaffolding; malformed XLS tests are deferred to Feature 004 as approved scope.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Constitution V: status transition valid/invalid tests deferred | Feature 001 defines schema/constants/scaffolding only; no executable transition enforcement logic yet | Adding artificial transition logic only to satisfy tests would violate scope boundaries and create throwaway behavior |
| Constitution V: malformed XLS parsing tests deferred | Feature 001 does not include XLS parser implementation; parser enters scope in Feature 004 | Introducing parser stubs in Feature 001 would add non-foundation complexity and duplicate planned Feature 004 work |

