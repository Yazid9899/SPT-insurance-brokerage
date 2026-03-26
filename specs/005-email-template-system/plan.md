# Implementation Plan: Email Template System

**Branch**: `[005-email-template-system]` | **Date**: 2026-03-26 | **Spec**: [/specs/005-email-template-system/spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-email-template-system/spec.md` and PRD.md Section 11

## Summary

Implement a predefined email template catalog with template preview, case-level email composer, variable auto-population, and auditable case email history.
Phase 1 provides log-only send behavior: composed emails are persisted to case history with confirmation that delivery is disabled.

## Technical Context

**Language/Version**: TypeScript (strict), Node.js 20 LTS  
**Primary Dependencies**: Next.js App Router, React, Prisma, Zod, react-hook-form, NextAuth.js  
**Storage**: PostgreSQL via Prisma (`CaseEmail`, `Case`, `Settlement`, `User`) + system-defined template catalog in application domain layer  
**Testing**: Vitest (unit/integration), Playwright (e2e)  
**Target Platform**: Web application on server-rendered Next.js  
**Project Type**: Web application (single Next.js project with App Router + API routes)  
**Performance Goals**: Template list and case email history responses <= 1.0s for typical page loads; compose preview update perceived as immediate for standard templates  
**Constraints**: Exactly seven predefined templates; unresolved variables remain unchanged; send blocked unless `to`, `subject`, `body` are non-empty; Phase 1 never calls external email provider  
**Scale/Scope**: Internal case-maker users, low-thousands of cases, low-hundreds of emails per case in history, single-role operational model

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
specs/005-email-template-system/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- emails.openapi.yaml
`-- tasks.md
```

### Source Code (repository root)

```text
src/
|-- app/
|   |-- (dashboard)/email-templates/page.tsx
|   |-- (dashboard)/cases/[id]/page.tsx
|   `-- api/
|       |-- email-templates/
|       |   |-- route.ts
|       |   `-- preview/route.ts
|       `-- cases/[id]/emails/route.ts
|-- components/
|   `-- cases/
|       |-- case-detail.tsx
|       |-- case-emails-tab.tsx
|       `-- compose-email-dialog.tsx
|-- lib/
|   |-- email/
|   |   |-- templates.ts
|   |   |-- renderer.ts
|   |   `-- variables.ts
|   |-- validations.ts
|   `-- prisma.ts
`-- types/

tests/
|-- unit/
|   `-- lib/
|       |-- email-renderer.test.ts
|       `-- email-template-variables.test.ts
|-- integration/
|   |-- cases/
|   |   `-- emails-route.test.ts
|   `-- email/
|       |-- templates-routes.test.ts
|       `-- template-preview-fallback.test.ts
`-- e2e/
    |-- cases/
    |   `-- case-emails-compose-log.spec.ts
    `-- email/
        `-- email-templates-preview.spec.ts
```

**Structure Decision**: Keep a single Next.js App Router codebase; add template catalog + renderer in `src/lib/email`, route handlers under `src/app/api`, and case/template UI pages in existing dashboard/component directories.

## Phase 0: Research Plan

Research output is captured in `research.md` with explicit decisions on:
- Predefined template catalog strategy
- Variable rendering semantics and unresolved-key fallback
- Log-only send behavior and audit persistence
- Template preview behavior (sample vs case-context rendering)
- Settlement-variable behavior when settlement context is absent

## Phase 1: Design & Contracts

Design outputs:
- `data-model.md`: catalog, variable context, and case email log entity behavior
- `contracts/emails.openapi.yaml`: contracts for template list/preview and case email list/create
- `quickstart.md`: flow validation and test checklist

Architecture decisions:
- Maintain fixed template catalog in domain layer with stable `templateId` values.
- Use renderer utility implementing PRD token semantics (`vars[key] ?? token`).
- Expose template listing and preview APIs separately from case email history APIs.
- Persist final edited subject/body with template identity in `CaseEmail` on send.
- Return explicit log-only confirmation message for Phase 1 sends.

## Phase 2: Task Planning Approach

Task generation (`/speckit.tasks`) will group work by:
1. Template catalog + renderer foundation
2. Template page/list/preview functionality
3. Case Emails tab + compose dialog + log persistence
4. Variable context handling (case/context/settlement)
5. Tests (unit/integration/e2e + constitution-required suites kept green)

## Testing Strategy (Constitution-aligned)

- API integration tests: happy-path coverage for template list/preview and case email list/create routes.
- Unit tests: token rendering behavior for known and unresolved variables; required-field validation for send flow.
- Integration tests: unauthorized behavior, error-shape consistency, and log-only confirmation response.
- E2E tests: template preview flow and case compose/log history behavior.
- Existing financial calculation, status-transition, and malformed XLS test suites remain passing to satisfy constitutional implementation gate.

## Post-Design Constitution Re-Check

- [x] `spec.md` remains WHAT/WHY only; implementation details contained in plan/design artifacts.
- [x] All HOW decisions documented in plan/data-model/contracts/quickstart.
- [x] Existing Decimal + currency + dual-rate model remains intact and unaffected.
- [x] Server-side case number generation format remains unchanged.
- [x] Existing status state machine/history logging behavior remains intact.
- [x] Multi-table write requirements are honored for case email persistence operations.
- [x] Scope remains single-role operational model (no RBAC/multi-tenancy expansion).
- [x] Test strategy includes API route coverage and preserves required existing high-risk test suites.

## Complexity Tracking

No constitution violations or justified deviations for this feature.
