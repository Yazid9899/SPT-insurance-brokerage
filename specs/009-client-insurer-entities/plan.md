# Implementation Plan: Client And Insurer Entities

**Branch**: `[009-client-insurer-entities]` | **Date**: 2026-03-27 | **Spec**: [/specs/009-client-insurer-entities/spec.md](./spec.md)  
**Input**: Feature specification from `/specs/009-client-insurer-entities/spec.md`

## Summary

Introduce first-class `Client` and `Insurer` entities with backward-compatible linkage to `Case` and `OpenCover`, while changing open cover relationships to support one insurer and multiple clients. Preserve existing behavior through additive contracts, phased migration/backfill, and strict fallback reads. Settlement remains name-based in this feature by explicit scope boundary.

## Technical Context

**Language/Version**: TypeScript (strict mode), Node.js 20 LTS  
**Primary Dependencies**: Next.js App Router, React, Prisma, Zod, NextAuth.js, decimal.js  
**Storage**: PostgreSQL via Prisma (`Case`, `OpenCover`, new `Client`, new `Insurer`, new open-cover-to-client link table)  
**Testing**: Vitest (unit + integration), Playwright (e2e)  
**Target Platform**: Internal web operations application  
**Project Type**: Single Next.js application (App Router + API routes)  
**Performance Goals**: Party-filtered case/report views remain within current response-time expectations at low-to-mid five-digit case volume  
**Constraints**: Additive API evolution only; no lifecycle/settlement/export regressions; active open cover requires at least one linked client; backfill auto-link only on unique normalized match  
**Scale/Scope**: Single-role internal users with mixed historical data quality and phased migration coexistence

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
specs/009-client-insurer-entities/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- parties-and-case-linkage.openapi.yaml
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
|   |-- (dashboard)/cases/
|   |-- (dashboard)/open-covers/
|   |-- (dashboard)/reports/
|   `-- api/
|       |-- cases/
|       |-- open-covers/
|       |-- reports/
|       `-- settlements/  # unchanged behavior boundary in this feature
|-- components/
|   |-- cases/
|   |-- open-covers/
|   `-- reports/
|-- lib/
|   |-- validations.ts
|   |-- reports-service.ts
|   |-- settlement-service.ts
|   |-- api-error.ts
|   |-- party-normalization.ts
|   |-- party-service.ts
|   |-- party-projection.ts
|   |-- party-backfill-service.ts
|   `-- party-governance-service.ts
`-- types/

scripts/
`-- backfill/
    |-- parties.ts
    `-- party-report-writer.ts

tests/
|-- unit/lib/
|-- integration/cases/
|-- integration/open-covers/
|-- integration/reports/
|-- integration/settlements/
`-- e2e/
```

**Structure Decision**: Keep current App Router + `lib` service pattern; add normalization, projection, backfill, and governance modules in `src/lib` and `scripts/backfill`; keep UI logic thin and route handlers additive.

## Architecture Fit and Module Map

- `prisma/schema.prisma`: add `Client`, `Insurer`, `OpenCoverClientLink` (many-to-many), and `PartyMergeAudit`; add nullable `clientId`/`insurerId` on `Case`; retain snapshots.
- `prisma/migrations/*`: staged migrations for new tables, constraints, indexes, and relation wiring.
- `src/lib/validations.ts`: add schemas for party selection and open-cover client membership checks.
- `src/lib/party-normalization.ts`: canonical normalization and key generation.
- `src/lib/party-service.ts`: resolve/create/link logic and open-cover client membership helper.
- `src/lib/party-projection.ts`: normalized-first response projection with snapshot fallback.
- `src/lib/party-backfill-service.ts`: unique-match-only backfill resolver and ambiguity classifier.
- `src/lib/party-governance-service.ts`: supervisor-approved merge/split audit workflow.
- `scripts/backfill/parties.ts`: dry-run/apply, idempotent linkage updates, stats.
- `scripts/backfill/party-report-writer.ts`: ambiguous/unmatched report output.
- `src/app/api/cases/*`: additive `clientId`/`insurerId` with single-shipment and open-cover rules.
- `src/app/api/open-covers/*`: open-cover client linkage list support and active-cover validation.
- `src/app/api/reports/*`: party filters and normalized grouping fallback.
- `src/app/api/settlements/*` and `src/lib/settlement-service.ts`: no settlement schema change; maintain compatibility.
- `src/components/cases/*`, `src/components/open-covers/*`, `src/components/reports/*`: selector/filter updates with clear empty/error states.

## Data Model and Constraints

- `Client`:
  - required display name; optional company/email/phone; active/inactive status.
  - unique identity: normalized name + normalized company.
- `Insurer`:
  - required display name; optional email/phone; active/inactive status.
  - unique identity: normalized name.
- `OpenCover`:
  - one insurer linkage.
  - many-to-many client linkage via `OpenCoverClientLink`.
  - active open covers must have at least one linked client.
- `Case`:
  - stores `clientId` and `insurerId` references.
  - retains snapshot fields for compatibility/history.
  - open-cover case path: insurer derived from open cover; selected client must belong to open cover link set.
  - single-shipment path: explicit client and insurer required.
- `PartyMergeAudit`:
  - append-only governance records for merge/split actions with requester/approver/timestamps/reason.

## Migration and Backfill Strategy

### Stage 1: Schema Expansion
- Add new entities and join table.
- Add nullable case FKs and indexes.
- Preserve existing fields and behavior.

### Stage 2: Backfill (Unique-Match Only)
- Build normalized candidate matches from open-cover and case snapshots.
- Auto-link only when exactly one normalized candidate matches.
- Mark ambiguous/unmatched for manual review output.
- Do not auto-link uncertain records.

### Stage 3: Dual-Write Activation
- New create/update paths write FKs and snapshots.
- Reads prefer normalized references; fallback to snapshots for unmigrated rows.

### Stage 4: Rule Enforcement
- Enforce active open-cover minimum linked-client rule.
- Enforce open-cover case client must be in linked client set.
- Enforce inactive client cannot be selected for new open-cover cases.
- Preserve historical case readability regardless of active status.

### Rollback/Safety
- Migration rollback possible until strict rule enablement.
- Backfill script idempotent with dry-run mode and report outputs.
- Verify parity in cases/reports/settlements before rollout gate.

### Backfill Completion Gate
- >=99% case/open-cover rows auto-linked or explicitly classified ambiguous/unmatched.
- No regression in lifecycle, settlement, reports, and CSV export.
- Ambiguous queue exported and operationally owned.

## API and Contract Updates

Impacted endpoints:
- `/api/cases` (GET/POST)
- `/api/cases/[id]` (GET/PUT)
- `/api/open-covers` (GET/POST)
- `/api/open-covers/[id]` (GET/PUT)
- `/api/reports/cases`, `/api/reports/commission`, `/api/reports/export`
- `/api/settlements/*` (compatibility validation only)

Contract policy:
- Additive request/response fields only.
- Keep existing legacy fields and `apiError` shape.
- Fallback projection for unmigrated rows.
- Settlement payload behavior unchanged in this feature.

## UX / Screen Impact

- Cases new/edit:
  - single-shipment: required client + insurer selectors.
  - open-cover: insurer derived; client selector restricted to linked active clients.
  - empty linked-client state: block action with explicit message.
- Case detail/list:
  - show resolved normalized identity with legacy fallback.
- Open covers new/edit:
  - manage linked client list and insurer linkage.
  - prevent active state when no linked clients.
- Reports:
  - client/insurer filters and grouping parity under mixed migration state.
- Settlement pages:
  - unchanged behavior boundary; validate no regression.

## Validation and Rules

- Zod/domain validation additions:
  - party IDs with existence checks.
  - open-cover membership check for case client selection.
  - active open-cover linked-client minimum.
  - inactive client selection blocked for new open-cover cases.
- Duplicate/ambiguity:
  - deterministic normalization-based matching.
  - unique-match-only auto-linking.
  - ambiguous/unmatched routed to manual review.
- Governance:
  - merge/split requires supervisor approval and audit trail record.

## Testing Strategy (FR/SC Aligned)

- Unit tests:
  - normalization keys and uniqueness behavior.
  - membership/active-state rule helpers.
  - backfill match/ambiguity classifier.
- Integration tests:
  - cases/open-covers API additive fields and validation rules.
  - reports party filter/grouping parity and CSV compatibility.
  - backfill idempotency and ambiguous output behavior.
  - settlement regression boundary.
- E2E tests:
  - case create/edit for single-shipment and open-cover paths.
  - linked client selection constraints and inactive client rejection.
  - reports filtering by client/insurer.
- Regression:
  - status transitions, settlement lifecycle, existing export columns unchanged.

## Risk Register and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Incorrect open-cover client links | Invalid client selection for new cases | Membership validation + active-cover minimum + e2e coverage |
| Over/under matching during backfill | Reporting inconsistency | Unique-match-only policy + ambiguity queue + manual review |
| Inactive-client rule blocks expected ops | User confusion | Clear validation messaging + historical case fallback |
| API contract drift | Consumer breakage | Additive-only responses + compatibility tests |
| Settlement side effects | Financial workflow regression | Explicit boundary + settlement regression tests |

## Phased Implementation Strategy

1. Milestone A: Schema + shared services
   - Entry: approved spec clarifications
   - Exit: entities/join table/FKs/indexes + normalization services in place
2. Milestone B: Backfill and reports
   - Entry: schema merged
   - Exit: idempotent backfill script + ambiguity reports + readiness metrics
3. Milestone C: Case/open-cover UX/API updates
   - Entry: linkage model stable
   - Exit: create/edit/list/detail/report filters fully aligned
4. Milestone D: Hardening and governance
   - Entry: core flows stable
   - Exit: merge/split approval audit and full regression suite pass

## FR/SC Mapping to Workstreams and Tests

| Requirement Group | Workstream | Validation |
|-------------------|------------|------------|
| FR-001..FR-004, FR-020 | Data model + open-cover many-to-many linkage | Prisma/integration schema tests |
| FR-005..FR-007, FR-013, FR-021, FR-023 | Case/open-cover validation and UX behavior | Integration + e2e case/open-cover tests |
| FR-008..FR-010 | Reporting and export parity | Reports integration + export tests |
| FR-011..FR-012, FR-022 | Backfill and ambiguity handling | Unit matcher + idempotent backfill integration |
| FR-014..FR-015 | API compatibility and error shape | API contract/integration tests |
| FR-016..FR-017 | Settlement boundary | Settlement regression tests |
| FR-018..FR-019 | Uniqueness and merge governance | Unit + integration governance tests |
| SC-001..SC-005 | Outcome verification | UAT checkpoints + automated regression coverage |

## Explicit Out of Scope (This Feature)

- Direct settlement-to-insurer foreign-key migration.
- Breaking changes to existing CSV/export contract.
- RBAC/multi-tenant scope expansion.

## Post-Design Constitution Re-Check

- [x] `spec.md` remains WHAT/WHY; plan documents HOW.
- [x] Financial integrity and dual-rate model unaffected.
- [x] Case numbering and lifecycle constraints unchanged.
- [x] Multi-table writes and backfill updates are transaction-safe by design.
- [x] Scope remains single-role and monolithic app architecture.
- [x] Test strategy covers API, financial safety boundaries, transitions, and upload regression baseline.

## Complexity Tracking

No constitution violations or approved deviations.
