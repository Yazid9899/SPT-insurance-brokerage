# Quickstart: Open Cover Management

## Prerequisites

- Feature 001 baseline available
- Node.js 20+
- PostgreSQL configured
- Case Maker login credentials seeded

## 1. Install dependencies and prepare DB

```bash
npm install
npm run db:migrate
npm run db:seed
```

## 2. Start app

```bash
npm run dev
```

## 3. Validate open cover core flows

1. Sign in and navigate to `Open Covers`.
2. Verify list columns include required fields and declaration count.
3. Create a new agreement with unique reference (example `OC-2026-001`).
4. Confirm duplicate reference creates a clear validation error.
5. Open an agreement detail and apply declaration filters.
6. Edit agreement details and save.

## 4. Validate insurer-rate and period integrity

1. Change agreement insurer rate.
2. Verify existing declarations keep original insurer rate values.
3. Create a new declaration after rate change and verify new rate applies.
4. Attempt to set effective period that excludes existing declarations; verify update is blocked.

## 5. Validate case creation integration

1. Open new case form.
2. Select `coverType = Open Cover`.
3. Confirm selector includes active agreements only.
4. Select agreement and verify client info + insurer rate auto-fill.
5. Verify insurer rate and currency are read-only.
6. Verify client rate remains editable.
7. Save and verify premiums are consistent with shared `calculatePremiums()` behavior.

## 6. Validate list/status behaviors

1. Use URL query parameters for case filters and verify server-side results.
2. Trigger status updates through `POST /api/cases/{id}/status` and verify transition validation.
3. Verify status color rendering remains consistent across status badges.

## 7. Test command matrix

```bash
npm run test
npm run test:integration
npm run test:e2e
```

- `npm run test`: unit + integration coverage for calculations, transitions, components, and route contracts
- `npm run test:integration`: integration-only contract checks under `tests/integration`
- `npm run test:e2e`: Playwright smoke scenarios for open cover and case creation journeys

## Notes

- Premium calculations execute client-side for UX and server-side for integrity.
- Existing malformed XLS parser tests remain part of regression coverage; this feature adds no new parser logic.
