# Quickstart: Client And Insurer Entities

## Goal

Validate normalized party linkage with multi-client open-cover behavior while preserving lifecycle, settlement, and export compatibility.

## Prerequisites

- Database configured (`DATABASE_URL`).
- Latest migrations applied.
- Seeded baseline data available.

## 1) Apply schema changes

```bash
npm run db:migrate
```

Expected:
- `Client`, `Insurer`, `OpenCoverClientLink`, and `PartyMergeAudit` are available.
- `Case` contains nullable `clientId`/`insurerId`.

## 2) Run backfill dry-run then apply

```bash
npm run backfill:parties -- --dry-run
npm run backfill:parties
```

Expected:
- Output includes `matched`, `ambiguous`, `unmatched`.
- Re-run is idempotent.
- Open-cover auto-link only occurs for unique normalized matches.

## 3) Validate open-cover rules

- Active open cover cannot exist with zero linked clients.
- Open-cover case creation allows only linked active clients.
- Inactive linked clients are rejected for new open-cover cases.
- Historical cases linked to now-inactive clients remain readable.

## 4) Validate case flows

- Single-shipment case requires explicit client + insurer.
- Open-cover case derives insurer from open cover and enforces linked-client selection.
- Case create/edit/detail returns normalized identities with legacy fallback where needed.

## 5) Validate reporting/export compatibility

- Cases list supports client/insurer filtering.
- Reports support client/insurer filters and insurer grouping consistency.
- CSV required existing columns remain unchanged and filtered dataset parity holds.

## 6) Validate settlement boundary

- Settlement flows (`create/confirm/pay`) remain operational.
- Settlement storage remains name-based in this feature.
- No regression in settlement totals and case transitions.

## 7) Run tests

```bash
npm test
npm run test:integration
npm run test:e2e
npm run build
```

### Latest Execution Record (2026-03-27)

- `npm test`: partial pass, failed suites due Prisma client generation and one component regression fixed during run.
  - Remaining blocker: `Cannot find module '.prisma/client/default'` in Prisma-dependent unit suites.
- `npm run test:integration`: PASS (56 files / 82 tests).
- `npm run test:e2e`: FAIL (Playwright browser binaries missing).
  - Required setup: `npx playwright install`.
- `npm run build`: FAIL at type-checking because Prisma client artifacts are unavailable.
  - Error: `Module "@prisma/client" has no exported member "PrismaClient"` from `prisma/seed.ts`.

## 8) Release-readiness checks

- Backfill completion threshold met (>=99% linked or classified).
- Ambiguous/unmatched report exported and assigned for manual resolution.
- No critical regressions in lifecycle, settlements, reports, or exports.

## 9) Settlement FK follow-up work item

- Work item: `FOLLOWUP-SETTLEMENT-INSURER-FK-001`
- Owner: Platform backend lead
- Scope boundary: settlement table/entity remains name-based in feature 009; direct insurer FK migration deferred.
- Migration dependency: requires stable party backfill completion and settlement data migration design.
- Backward-compatibility constraints: preserve existing settlement API response shape and historical reporting outputs during migration rollout.
