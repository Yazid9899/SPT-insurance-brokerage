# Implementation Plan: Document Management

**Branch**: `[004-document-management]` | **Date**: 2026-03-26 | **Spec**: [/specs/004-document-management/spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-document-management/spec.md` and PRD.md Section 8.3/9

## Summary

Implement case-level document management with multipart uploads, categorized metadata, advisory expected-document checklist behavior, and safe delete/download operations.
The design uses Next.js App Router route handlers, Prisma-backed metadata persistence, local filesystem storage in development through a pluggable storage abstraction, and shared-batch linkage for bulk-origin documents.

## Technical Context

**Language/Version**: TypeScript (strict), Node.js 20 LTS  
**Primary Dependencies**: Next.js App Router, React, Prisma, Zod, react-hook-form, @hookform/resolvers, NextAuth.js  
**Storage**: PostgreSQL via Prisma (`Case`, `CaseDocument`) + local filesystem under `/public/uploads` for development (abstraction-ready for S3-compatible storage)  
**Testing**: Vitest (unit/integration), Playwright (e2e)  
**Target Platform**: Web application on server-rendered Next.js  
**Project Type**: Web application (single Next.js project with App Router + API routes)  
**Performance Goals**: Document list responses <= 1.0s for typical case pages (<100 docs); upload API returns within <= 2.0s for files up to 10 MB on local dev environment  
**Constraints**: Allowed file types PDF/DOCX/XLSX/JPG/PNG; max size 10 MB; checklist is advisory-only and must never block transitions; delete requires confirmation and safe metadata+file removal; shared docs must resolve across same `bulkUploadId` batch  
**Scale/Scope**: Internal operations users, low-thousands of active cases, low-hundreds of docs per case worst case, single-role model (Case Maker)

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
specs/004-document-management/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- documents.openapi.yaml
`-- tasks.md
```

### Source Code (repository root)

```text
src/
|-- app/
|   |-- (dashboard)/cases/[id]/page.tsx
|   `-- api/cases/[id]/documents/
|       |-- route.ts
|       `-- [docId]/route.ts
|-- components/
|   `-- cases/
|       |-- case-detail.tsx
|       |-- case-documents-tab.tsx
|       |-- document-upload-dialog.tsx
|       |-- document-list.tsx
|       `-- expected-documents-checklist.tsx
|-- lib/
|   |-- document-storage/
|   |   |-- index.ts
|   |   |-- local-storage.ts
|   |   `-- types.ts
|   |-- document-checklist.ts
|   |-- validations.ts
|   `-- prisma.ts
`-- types/

public/
`-- uploads/

tests/
|-- unit/
|   `-- lib/
|       `-- document-management.test.ts
|-- integration/
|   `-- cases/
|       `-- documents-route.test.ts
`-- e2e/
    `-- cases/
        `-- document-management.spec.ts
```

**Structure Decision**: Keep a single Next.js App Router project and add document-specific API routes, UI components, and storage abstraction modules in existing `src` boundaries.

**Test File Canonical Path**: The canonical unit test file for this feature is `tests/unit/lib/document-management.test.ts`. Any prior references to `document-checklist.test.ts` in this plan are superseded by this path. *(Resolves I1)*

## Phase 0: Research Plan

Research output is captured in `research.md` with explicit decisions on:
- Next.js App Router multipart upload handling pattern
- Local development file storage with production-ready abstraction
- Shared document linkage and cross-case deletion behavior
- Advisory checklist derivation model
- File serving/deletion safety guardrails

## Phase 1: Design & Contracts

Design outputs:
- `data-model.md`: document entities, shared linkage, and integrity constraints
- `contracts/documents.openapi.yaml`: GET/POST/DELETE contracts for case documents
- `quickstart.md`: setup, smoke checks, and test checklist

Architecture decisions:
- Implement `GET /api/cases/[id]/documents`, `POST /api/cases/[id]/documents`, and `DELETE /api/cases/[id]/documents/[docId]` as route handlers.
- Parse uploads via multipart form data and validate server-side type/size before write.
- Route storage operations through a pluggable storage interface; local implementation writes to `/public/uploads` during development.
- Compute expected-documents checklist from case status + uploaded document types as derived view logic only.
- For shared bulk documents, enforce batch-aware delete semantics across all linked rows in one atomic operation.

## Phase 2: Task Planning Approach

Task generation (`/speckit.tasks`) will group work by:
1. Storage and validation foundation (upload constraints, storage abstraction, safety checks)
2. API routes (list/upload/delete with shared delete behavior)
3. UI components (`CaseDocumentsTab`, upload dialog, list via shared DataTable, checklist)
4. Case detail integration and shared indicator rendering
5. Tests (unit/integration/e2e for upload, checklist, shared delete, and failures)

## Testing Strategy (Constitution-aligned)

- API integration tests: happy-path coverage for all document endpoints.
- Unit tests: checklist derivation and upload validation utilities.
- Integration tests: shared delete atomicity, storage failure rollback behavior, unsafe path rejection, unauthorized access (401/403), and timed performance assertions.
- E2E tests: upload flow, document list actions, advisory checklist behavior, Shared badge visibility, empty-state rendering.
- Financial calculation unit tests: run and extend existing tests covering premium computation, settlement totals, zero values, currency mismatches, and invalid rates (constitution V gate).
- Existing malformed XLS tests remain part of regression suite to satisfy constitutional requirement.

## Post-Design Constitution Re-Check

- [x] `spec.md` remains WHAT/WHY only; implementation details contained in plan/design artifacts.
- [x] All HOW decisions documented in plan/data-model/contracts/quickstart.
- [x] Existing Decimal + currency + dual-rate model unaffected and remains enforced for case financial logic.
- [x] Server-side case number generation format remains unchanged.
- [x] Existing state machine and history logging remain authoritative; checklist remains non-blocking.
- [x] Multi-table writes (shared delete metadata updates) are explicitly atomic.
- [x] Scope remains single-role operational model (no RBAC/multi-tenancy expansion).
- [x] Test strategy includes API coverage and preserves malformed XLS regression expectations.

## Complexity Tracking

### Justified Constitution Alignments

| Issue | Principle | Resolution |
|-------|-----------|------------|
| C2 — DataTable adoption | Constitution VIII: all table UIs MUST use shared DataTable | `DocumentList` (T019) is explicitly implemented using the shared `DataTable` component. T041 adds a dedicated refactor/validation step to confirm adoption. No deviation — full compliance required and tracked. |
| C1 — Financial calculation tests | Constitution V implementation gate | T040 added to run and extend existing financial calculation unit tests. These tests are cross-feature and not scoped to document management alone; they are included here to satisfy the constitution gate before implementation proceeds. |
| I1 — Test file path normalization | Canonical unit test path consistency | Canonical path is `tests/unit/lib/document-management.test.ts`. The `document-checklist.test.ts` reference previously in this plan is superseded. |

No constitution violations or justified deviations for this feature. All identified issues are resolved through task additions and plan alignment.