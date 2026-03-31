# Backend Review Summary

## 1. Overall Assessment
Backend is **solid mid-stage**, not production-ready yet.

Strongest parts:
- Broad Zod validation usage and good integration/e2e test coverage.
- Core settlement workflows wrapped in transactions.
- Clear domain vocabulary and enum-driven state model in Prisma.

Biggest risks:
- Concurrency correctness (generated numbers, payment reference uniqueness).
- Scalability of reports (in-memory sorting/pagination on full datasets).
- Runtime durability for uploads (in-memory temp store + non-atomic file/DB writes).
- API consistency gaps and missing production controls (env validation, rate limiting, health/readiness, observability).

## 2. Critical Issues

### 1) Race-prone identifier generation (`caseNumber`, `settlementNumber`)
- Why it matters: concurrent requests can generate the same number and fail unpredictably under load.
- Where it appears: `src/lib/case-number.ts`, `src/lib/settlement-number.ts`, and usage in case/bulk/settlement flows.
- Recommended fix:
  - Move numbering to DB-backed counters (sequence table + `SELECT ... FOR UPDATE`), or dedicated PG sequence per prefix.
  - Keep unique constraints and add retry-on-conflict wrapper for rare collisions.
- Priority: Critical

### 2) Bulk temp document store is process-memory only
- Why it matters: breaks in multi-instance/serverless, loses state on restart, leaks memory over time.
- Where it appears: `src/lib/bulk-upload/temp-documents-store.ts`.
- Recommended fix:
  - Replace with persistent ephemeral store (Postgres table or Redis) with TTL/cleanup job.
  - Add max temp docs per user/session and expiration timestamp.
- Priority: Critical

### 3) Report endpoints do full reads and in-memory sort/paginate
- Why it matters: latency/memory blow up with growth; pagination semantics degrade.
- Where it appears: `src/lib/reports-service.ts` (`sortRows`, `slice`, full `findMany` then paginate).
- Recommended fix:
  - Push sorting/pagination into SQL (`orderBy/skip/take` at DB level).
  - Use aggregate/groupBy queries for summary widgets.
  - Add guardrails on export size and async export for large ranges.
- Priority: Critical

### 4) File storage and DB writes are not atomic/compensated
- Why it matters: orphan files or broken DB pointers during partial failure.
- Where it appears:
  - Upload path saves file before DB create (`src/app/api/cases/[id]/documents/route.ts`).
  - Delete path removes storage before DB delete (`src/app/api/cases/[id]/documents/[docId]/route.ts`).
- Recommended fix:
  - Implement two-phase/compensation strategy:
    - Upload: create DB row in `PENDING`, upload, mark `READY`; cleanup on failure.
    - Delete: soft-delete DB, async worker removes blob, finalize DB deletion.
- Priority: Critical

### 5) Settlement integrity gaps (currency + uniqueness + insurer matching)
- Why it matters: financial correctness and reconciliation risk.
- Where it appears:
  - Hardcoded USD settlement currency in service layer.
  - `paymentRef` checked in app code only, no DB unique index.
  - Eligibility by `openCover.insurerName` string instead of `insurerId`.
- Recommended fix:
  - Enforce `paymentRef` unique constraint at DB level (nullable unique index strategy).
  - Make settlement selection/ownership insurer-id based.
  - Enforce single-currency settlement inputs or explicit FX conversion policy.
- Priority: Critical

## 3. Important Improvements

### 1) Open-cover expired filter logic is wrong with search
- Why it matters: users can get non-expired records when requesting expired + query.
- Where it appears: `src/app/api/open-covers/route.ts` (OR mutation for expired branch).
- Recommended fix:
  - Build `AND` conditions explicitly (`AND: [expiredPredicate, searchPredicate]`), avoid OR mutation.
- Priority: High

### 2) API auth/error behavior inconsistent
- Why it matters: client integration complexity; brittle API expectations.
- Where it appears:
  - Foundation routes return raw `{ error }` while most others use `apiError`.
  - Middleware redirects cover `/api/foundation`.
- Recommended fix:
  - Standardize all API unauthorized responses as JSON `401`.
  - Remove API redirect behavior from middleware; keep redirects for page routes only.
- Priority: High

### 3) Route handlers are too fat and contain mixed concerns
- Why it matters: harder change safety and testability.
- Where it appears: case create/update and bulk-upload handlers.
- Recommended fix:
  - Move business flows to use-case services (`createCase`, `updateCase`, `bulkCreateCases`, `transitionCaseStatus`).
  - Keep handlers as parse/auth/invoke/serialize layers.
- Priority: High

### 4) Missing production platform controls (env validation, health/readiness, observability)
- Why it matters: fragile deploys and poor incident response.
- Where it appears:
  - No runtime env schema.
  - No health/readiness endpoints.
  - No structured request logging/trace IDs.
- Recommended fix:
  - Add startup env validation with Zod.
  - Add `/api/health` and `/api/ready`.
  - Add structured logger + request correlation ID middleware.
- Priority: High

### 5) Upload endpoints need abuse controls
- Why it matters: memory/DoS risk.
- Where it appears: bulk temp docs and documents endpoints.
- Recommended fix:
  - Limit file count per request.
  - Enforce total payload size cap.
  - Add per-user rate limiting and request timeout protections.
- Priority: High

## 4. Nice-to-Have Improvements

### 1) Remove redundant status-machine wrapper
- Why it matters: unnecessary indirection.
- Where it appears: `src/lib/status-machine.ts`.
- Recommended fix: inline or deprecate wrapper; keep one canonical status module.
- Priority: Medium

### 2) Tighten TypeScript boundaries (remove `as never` hacks)
- Why it matters: hides type contract issues.
- Where it appears: case routes and service constructions.
- Recommended fix: accept `PrismaClient | Prisma.TransactionClient` or narrowed repository interfaces.
- Priority: Medium

### 3) Response shape normalization
- Why it matters: simpler frontend and contract testing.
- Where it appears: mixed patterns across routes.
- Recommended fix: define explicit API envelope conventions and apply consistently.
- Priority: Medium

### 4) Decimal/date serialization contract docs + utilities
- Why it matters: reduce drift/bugs at API edges.
- Where it appears: formatting duplicated in many handlers.
- Recommended fix: central serializer helpers per domain DTO.
- Priority: Medium

### 5) Constrained pagination defaults on all list endpoints
- Why it matters: stability and consistent UX.
- Where it appears: different endpoint limits (`20`, `100`, `200`).
- Recommended fix: shared pagination schema utility and max cap policy.
- Priority: Low

## 5. Architecture Refactor Recommendations

Pragmatic target structure:

1. `src/server/http/routes/*` (thin route handlers only).
2. `src/server/http/guards` (`requireSession`, `requireRole`).
3. `src/server/http/response` (success/error envelopes + status mappers).
4. `src/server/validation` (Zod schemas by feature; query/body/path separated).
5. `src/server/use-cases/cases/*` (`createCase`, `updateCase`, `transitionStatus`, `bulkCreate`).
6. `src/server/use-cases/settlements/*` (`createDraft`, `updateMatching`, `confirm`, `pay`).
7. `src/server/repositories/*` (Prisma data access + query composition).
8. `src/server/domain/*` (status rules, settlement policies, money/currency invariants).
9. `src/server/adapters/*` (document storage, email provider, clock, idempotency store).
10. `src/server/observability/*` (logger, metrics, trace IDs).

## 6. Reliability Checklist

- [ ] Replace case/settlement number generation with DB-safe atomic counters.
- [ ] Add retry-on-unique-conflict wrapper for number generation endpoints.
- [ ] Add DB uniqueness for `paymentRef` (nullable-safe unique strategy).
- [ ] Convert settlement insurer matching to `insurerId` domain key.
- [ ] Enforce settlement currency policy (single currency per settlement or conversion).
- [ ] Move report sorting/pagination to DB.
- [ ] Replace in-memory temp-doc store with persistent TTL-backed store.
- [ ] Add compensation flow for file upload/delete partial failures.
- [ ] Add idempotency keys for sensitive POSTs (`bulk-upload`, `settlements/{id}/pay`).
- [ ] Add concurrency integration tests for numbering and payment reference race.
- [ ] Add integration test for open-cover expired+search filter correctness.

## 7. Security Checklist

- [ ] Add rate limiting for write-heavy endpoints (uploads, bulk, settlement mutations).
- [ ] Add CSRF protections for session-cookie JSON mutation routes (origin check + anti-CSRF token/header policy).
- [ ] Add strict request size/file count limits for upload endpoints.
- [ ] Add content-type sniffing (not only extension/MIME metadata).
- [ ] Standardize unauthorized responses to JSON (avoid redirect behavior for APIs).
- [ ] Validate and sanitize all date query params before DB usage.
- [ ] Add structured security logging for auth failures and critical mutations.
- [ ] Add security headers baseline (if not already configured at platform level).
- [ ] Add environment secret validation and fail-fast startup checks.
- [ ] Add audit trail for settlement confirm/pay and document delete actions.

## 8. API Standardization Recommendations

Recommended standard:

- Success response:
  - List: `{ data: [...], meta: { page, pageSize, totalItems, totalPages } }`
  - Single: `{ data: {...} }`
- Error response:
  - `{ error: { code, message, details?, requestId } }`
- Pagination:
  - Uniform params: `page`, `pageSize` with shared limits.
- Filtering/sorting:
  - Arrays as comma-separated or repeated params, but one global convention.
  - Explicit `sortBy`, `sortDirection`.
- Validation errors:
  - Stable shape with field-level paths (`issues: [{ path, message, code }]`).
- Decimal/date:
  - All money/decimal as strings.
  - DateTime as ISO-8601 UTC.
  - Date-only fields explicitly documented as `YYYY-MM-DD`.
- Route naming:
  - Keep resource-based nouns (`/cases`, `/open-covers`, `/settlements`) and action subpaths only for workflow transitions (`/status`, `/confirm`, `/pay`).
- Versioning:
  - Introduce `/api/v1` before external integrations grow.

## 9. Deployability Checklist

- [ ] Add env schema validation at startup.
- [ ] Add `db:deploy`/migration production script path and release checklist.
- [ ] Add health and readiness endpoints.
- [ ] Add connection pooling strategy for Prisma on serverless/managed Postgres.
- [ ] Replace local filesystem document storage for production (S3-compatible adapter).
- [ ] Add background processing path for heavy exports/cleanup jobs.
- [ ] Add centralized structured logging and metrics (latency/error rate per endpoint).
- [ ] Add backup/recovery runbook (DB snapshots, restore drill).
- [ ] Add rollback strategy for schema migrations.
- [ ] Guard seed scripts from accidental production usage.

## 10. Suggested Implementation Order

1. Fix critical correctness: numbering concurrency + paymentRef DB uniqueness.
2. Replace in-memory temp-doc store with persistent TTL store.
3. Fix report scalability (DB-side sort/paginate/aggregate).
4. Fix open-cover filter logic bug and unify auth/error contract behavior.
5. Add upload safety controls + file/DB compensation workflow.
6. Add env validation + health/readiness + structured logs.
7. Extract use-case services from large route handlers.
8. Add idempotency keys for critical POST endpoints.
9. Add missing concurrency/security/API-contract tests.
10. Finalize production storage adapter and deployment runbook.

## 11. Optional Refactor Targets

- `src/app/api/cases/route.ts`
- `src/app/api/cases/[id]/route.ts`
- `src/app/api/cases/bulk-upload/route.ts`
- `src/lib/settlement-service.ts`
- `src/lib/reports-service.ts`
- `src/lib/bulk-upload/temp-documents-store.ts`
- `src/middleware.ts`
- `src/app/api/open-covers/route.ts`

## Executive Action Plan

### 1. Top 5 backend risks
1. Concurrency collisions in case/settlement number generation.
2. In-memory temp upload store breaks in real multi-instance environments.
3. Reporting path won’t scale due to full-table read + in-memory sorting.
4. File storage and DB operations can diverge on partial failure.
5. Settlement financial integrity gaps (`paymentRef` uniqueness, insurer-name matching, hardcoded currency).

### 2. Top 5 fastest wins
1. Add unique DB index/policy for `paymentRef`.
2. Fix open-cover expired filter query logic.
3. Standardize unauthorized/error response shape across all routes.
4. Add upload file-count/total-size limits.
5. Add health/readiness endpoints + env validation.

### 3. Top 5 production-readiness tasks
1. Replace number generators with transactional DB counters.
2. Move temp document store to Redis/Postgres with TTL.
3. Push reports sorting/pagination/aggregation into SQL.
4. Implement robust storage compensation workflow.
5. Add structured observability + rate limiting + CSRF hardening.

### 4. Recommended target architecture (10 bullets or fewer)
1. Thin route handlers only (parse/auth/dispatch/serialize).
2. Feature use-case services for all mutations.
3. Repository layer for Prisma query composition.
4. Central domain policy modules (workflow, settlement, currency rules).
5. Shared response/error contract utilities.
6. Central authz guard utilities.
7. Storage adapter abstraction with prod/dev providers.
8. Idempotency module for mutation endpoints.
9. Observability module (logger, metrics, tracing IDs).
10. Contract tests + concurrency tests as release gates.
