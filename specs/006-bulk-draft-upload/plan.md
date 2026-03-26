# Implementation Plan: Bulk Draft Upload

**Branch**: `[006-bulk-draft-upload]` | **Date**: 2026-03-26 | **Spec**: [/specs/006-bulk-draft-upload/spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-bulk-draft-upload/spec.md` and PRD.md Section 7

## Summary

Implement a 3-step bulk draft upload wizard for retroactive cargo declarations under a single open cover.
The flow supports XLS parsing, header auto-mapping with manual override, inline row correction, and all-or-nothing transactional draft case creation with shared batch documents.

## Technical Context

**Language/Version**: TypeScript (strict), Node.js 20 LTS  
**Primary Dependencies**: Next.js App Router, React, Prisma, Zod, react-hook-form, `@hookform/resolvers`, SheetJS (`xlsx`), NextAuth.js  
**Storage**: PostgreSQL via Prisma (`Case`, `OpenCover`, `CaseDocument`) + local file storage in development for shared documents  
**Testing**: Vitest (unit/integration), Playwright (e2e)  
**Target Platform**: Web application (server-rendered Next.js dashboard)  
**Project Type**: Single Next.js web app (App Router + API routes)  
**Performance Goals**: Parse and render review table for up to 10 rows in under 2 seconds; final transaction completes in under 3 seconds for 10-row batch in normal conditions  
**Constraints**: 1 XLS per batch; 1-10 shipment rows; one open cover context per batch; all-or-nothing final creation; URL redirect filter by `bulkUploadId`; dual validation (client review + server pre-create)  
**Scale/Scope**: Internal case-maker workflow, low-concurrency operational usage, low-thousands of total cases

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
specs/006-bulk-draft-upload/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- bulk-upload.openapi.yaml
`-- tasks.md
```

### Source Code (repository root)

```text
src/
|-- app/
|   |-- (dashboard)/cases/page.tsx
|   |-- (dashboard)/cases/bulk-upload/page.tsx
|   `-- api/
|       `-- cases/
|           |-- bulk-upload/route.ts
|           `-- bulk-upload/temp-documents/route.ts
|-- components/
|   `-- cases/
|       |-- bulk-upload-wizard.tsx
|       |-- bulk-upload-setup-step.tsx
|       |-- bulk-upload-review-step.tsx
|       |-- bulk-upload-confirm-step.tsx
|       |-- bulk-upload-preview-table.tsx
|       `-- column-mapping-editor.tsx
|-- lib/
|   |-- bulk-upload/
|   |   |-- header-aliases.ts
|   |   |-- parser.ts
|   |   |-- mapping.ts
|   |   `-- validators.ts
|   |-- calculations.ts
|   |-- validations.ts
|   `-- prisma.ts
`-- types/
    `-- index.ts

tests/
|-- unit/
|   `-- lib/
|       |-- bulk-upload-mapping.test.ts
|       |-- bulk-upload-parser.test.ts
|       `-- bulk-upload-validation.test.ts
|-- integration/
|   `-- cases/
|       |-- bulk-upload-route.test.ts
|       `-- bulk-upload-malformed-xls.test.ts
`-- e2e/
    `-- cases/
        `-- bulk-upload-wizard.spec.ts
```

**Structure Decision**: Keep bulk upload isolated in `src/lib/bulk-upload` for parser/mapping/validation logic, implement wizard UI in `src/components/cases`, and expose creation + temp document endpoints under `src/app/api/cases/bulk-upload`.

## Phase 0: Research Plan

Research output is captured in `research.md` with explicit decisions on:
- SheetJS parsing strategy for mixed date/currency cell types.
- Header alias auto-mapping + ambiguity handling with mandatory manual mapping fallback.
- Server-safe draft state persistence across wizard steps.
- Safe temporary document handling before final all-or-nothing transaction.
- Transaction strategy for creating cases + linking shared documents atomically.

## Phase 1: Design & Contracts

Design outputs:
- `data-model.md`: bulk upload batch lifecycle, row model, mapping model, and temp document lifecycle.
- `contracts/bulk-upload.openapi.yaml`: API contract for final batch creation and temp document upload.
- `quickstart.md`: end-to-end operator flow and validation checklist.

Architecture decisions:
- Use shared `HEADER_ALIASES` map (from PRD Section 7) in one domain module for deterministic mapping behavior.
- Run row validation in review step and enforce full server re-validation before transaction commit.
- Use shared `calculatePremiums()` for per-row financial computations with client-entered rate + open-cover insurer rate.
- Persist wizard draft state server-side (session-scoped draft payload) to avoid client-only drift.
- Implement the review grid as a `DataTable`-based wrapper component to satisfy constitution UX consistency requirements.
- Execute final creation in one Prisma transaction: generate `bulkUploadId`, create N Draft cases, link shared documents to all new cases.

## Phase 2: Task Planning Approach

Task generation (`/speckit.tasks`) will group work by:
1. Setup/foundation: parsing, alias mapping, schemas.
2. Wizard step UI and server-safe state flow.
3. Bulk creation transaction endpoint and redirect behavior.
4. Shared document temp upload and fan-out linking.
5. Tests: parser/mapping units, API integration (including malformed XLS), and e2e wizard flow.

## Testing Strategy (Constitution-aligned)

- Unit tests:
  - Header alias detection and ambiguity fallback behavior.
  - SheetJS parser normalization for date/number/currency-like cells.
  - Row-level validation rules and premium calculations using `calculatePremiums()`.
- Integration tests:
  - `POST /api/cases/bulk-upload` happy path and invalid payload path.
  - All-or-nothing transaction behavior when one row is invalid.
  - Malformed XLS parsing safety and explicit error shape.
  - Shared document linking to all created cases in the same batch.
- E2E tests:
  - Full 3-step wizard flow with manual mapping override and inline corrections.
  - Post-create redirect to `/cases?bulkUploadId=<newBatchId>`.
- Regression obligation:
  - Existing financial, status transition, and malformed XLS suites must remain green.

## Post-Design Constitution Re-Check

- [x] `spec.md` remains WHAT/WHY only; implementation details contained in plan/design artifacts.
- [x] All HOW decisions documented in plan/data-model/contracts/quickstart.
- [x] Existing Decimal + currency + dual-rate model remains intact and enforced for per-row premium calculations.
- [x] Server-side case number generation format remains unchanged.
- [x] Existing status state machine/history logging behavior remains intact (new cases created in `DRAFT`).
- [x] Multi-table writes for batch creation + document links are explicitly transactional.
- [x] Scope remains single-role operational model (no RBAC/multi-tenancy expansion).
- [x] Test strategy includes API routes, financial calculations, and malformed XLS coverage.

## Complexity Tracking

No constitution violations or justified deviations for this feature.
