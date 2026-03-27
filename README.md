# SPT Insurance Brokerage (CargoShield)

This README is an onboarding guide for new engineers, based on `PRD.md`, `specs/*`, and the current code in `src/`, `prisma/`, and `tests/`.

## 1) What the app does

CargoShield is an internal brokerage operations app for managing insurance cases end-to-end:

- Foundation/auth shell and protected dashboard routes.
- Open Cover management.
- Case management lifecycle (`DRAFT -> ... -> CLOSED`) with transition validation and history.
- Case documents (upload/list/delete, expected-doc checklist, shared bulk docs).
- Case email template system (compose/preview/log to DB in dev mode).
- Bulk draft upload wizard (XLS parse, map/review, transactional case creation).
- Monthly insurer settlements (draft/confirm/pay, atomic case transitions).
- Dashboard + operational reports + CSV export.

Primary evidence:
- `PRD.md` (sections 5-11)
- `src/app/(dashboard)/*`
- `src/app/api/*`
- `tests/integration/*`, `tests/e2e/*`

## 2) How the architecture works

The app uses Next.js App Router with server components for pages and route handlers for APIs:

- UI layer: `src/app/(dashboard)/*`, `src/components/**`
- API layer: `src/app/api/**/route.ts`
- Domain/service logic: `src/lib/**`
- Validation: Zod schemas in `src/lib/validations.ts`
- Persistence: Prisma models in `prisma/schema.prisma`
- Auth: NextAuth credentials in `src/lib/auth.ts`, route guard in `src/middleware.ts`
- Storage abstraction for docs: `src/lib/document-storage/*` (local dev backend implemented)

Key design patterns in code:

- Shared business utilities:
  - premiums/currency conversion: `src/lib/calculations.ts`
  - status graph/guards: `src/lib/status-transitions.ts`
  - reporting aggregation: `src/lib/reports-service.ts`
  - settlement orchestration: `src/lib/settlement-service.ts`
- Transaction boundaries for multi-record transitions:
  - bulk case create: `src/app/api/cases/bulk-upload/route.ts`
  - settlement confirm/pay: `src/lib/settlement-service.ts`

## 3) APIs that exist (and most important)

All APIs are App Router handlers under `src/app/api/**`, and all major business routes enforce session checks.

Core APIs to know first:

- Cases:
  - `GET/POST /api/cases`
  - `GET/PUT/DELETE /api/cases/[id]`
  - `POST /api/cases/[id]/status`
  - `POST /api/cases/bulk-upload`
  - `POST /api/cases/bulk-upload/temp-documents`
- Case documents:
  - `GET/POST /api/cases/[id]/documents`
  - `DELETE /api/cases/[id]/documents/[docId]`
- Case emails:
  - `GET/POST /api/cases/[id]/emails`
  - `GET /api/email-templates`
  - `POST /api/email-templates/preview`
- Open covers:
  - `GET/POST /api/open-covers`
  - `GET/PUT /api/open-covers/[id]`
- Settlements:
  - `GET/POST /api/settlements`
  - `GET/PUT /api/settlements/[id]`
  - `POST /api/settlements/[id]/confirm`
  - `POST /api/settlements/[id]/pay`
- Reports:
  - `GET /api/reports/summary`
  - `GET /api/reports/cases`
  - `GET /api/reports/commission`
  - `GET /api/reports/export`

Most operationally critical endpoints:

- `POST /api/cases/[id]/status` (lifecycle enforcement).
- `POST /api/cases/bulk-upload` (batch creation transaction).
- `POST /api/settlements/[id]/confirm` and `/pay` (financial/state transitions).
- `GET /api/reports/export` (downstream reconciliation/audit output).

## 4) How to run and operate the app

Prerequisites:

- Node.js 20 LTS
- PostgreSQL (configured in `.env`)

Setup:

```bash
npm install
cp .env.example .env
npm run db:migrate
npm run db:seed
```

Start:

```bash
npm run dev
```

Open:

- `http://localhost:3000`

Seed login (from `prisma/seed.ts`):

- Email: `casemaker@cargoshield.local`
- Password: `ChangeMe123!`

Useful commands:

```bash
npm test
npm run test:integration
npm run test:e2e
npm run lint
npm run build
```

Operational note from current repo check:

- If you hit `Module "@prisma/client" has no exported member "PrismaClient"` during build, regenerate client:

```bash
npx prisma generate
```

## 5) Files/folders to read first

Recommended reading order:

1. `PRD.md` (product/lifecycle/business context)
2. `prisma/schema.prisma` (source-of-truth data model)
3. `src/lib/validations.ts` (API contracts and rules)
4. `src/lib/status-transitions.ts` + `src/lib/settlement-service.ts` + `src/lib/reports-service.ts`
5. `src/app/api/**/route.ts` (actual server behavior)
6. `src/app/(dashboard)/**/page.tsx` (user-facing module composition)
7. `tests/integration` then `tests/e2e` (expected behavior and edge cases)

## 6) Risks / unclear areas to know now

Evidence-based risks observed:

- README drift:
  - Existing README content referenced only early features; current code includes features through dashboard/reports.
- Prisma client generation mismatch risk:
  - Current `npm run build` failed locally because generated Prisma client types were missing (`PrismaClient` export issue).
- Bulk temp documents are in-memory before final batch creation:
  - `src/lib/bulk-upload/temp-documents-store.ts` uses process memory map; restart loses temp references.
- Soft delete adoption is active in many queries (`deletedAt`), so local DB schema and generated client must be in sync with latest migrations.

Areas to confirm with team:

- Production document storage adapter target (local abstraction exists; S3-compatible implementation is not in this repo yet).
- Operational policy for settlement period eligibility edge cases (currently inferred via first BILLING status history timestamp).

## 7) How this README should be improved further

High-value next improvements:

- Add a module-to-owner section (who owns cases/settlements/reports).
- Add an API quick reference table with request/response examples per endpoint.
- Add local troubleshooting section for common environment issues (Prisma client, migration drift, auth redirect loops).
- Add deployment runbook (env vars, migration strategy, seed strategy, storage backend setup).
- Add architecture diagrams (request flow + domain boundaries + transaction-sensitive workflows).
