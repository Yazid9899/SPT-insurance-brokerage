# Quickstart: Email Template System

## Prerequisites

- Node.js 20 LTS
- PostgreSQL via `DATABASE_URL`
- Dependencies installed (`npm install`)

## Scope Notes

- Feature provides predefined email templates, template preview, case composer, and case email history.
- Phase 1 send behavior is log-only; no external email delivery is triggered.

## 1. Prepare database

```bash
npm run db:migrate
npm run db:seed
```

## 2. Run app

```bash
npm run dev
```

## 3. Validate user flows

1. Open `/email-templates`:
- Seven template cards are displayed.
- Each card shows name, description, subject preview, and variable list.
- Preview action renders sample values.

2. Open `/cases/{id}` -> Emails tab:
- Compose Email action is available.
- Template selection auto-populates subject/body preview using case context.
- To is pre-filled from client email when available; CC is editable.
- Subject/body remain editable after template fill.
- Send is blocked when To/subject/body is empty.
- Send logs email and shows: `Email logged (sending disabled in dev mode).`

3. In Emails tab history:
- Rows show template name, recipient, date, subject.
- Row expansion reveals full body.

## 4. API smoke checks

- `GET /api/email-templates`
- `POST /api/email-templates/preview` (template preview with sample/context vars)
- `GET /api/cases/{id}/emails`
- `POST /api/cases/{id}/emails` (log-only send)

## 5. Required tests

```bash
npm run test
npm run test:integration
npm run test:e2e
```

Minimum assertions:
- Unit:
  - Template token rendering for known and unresolved variables.
  - Required-field validation (`to`, `subject`, `body`).
- Integration:
  - Template list and preview endpoints.
  - Case emails list and create endpoints with log-only response.
  - Unauthorized access and consistent error shape.
- E2E:
  - Template page preview flow.
  - Case email compose and log history display.

## 6. Definition of done checks

- Exactly seven predefined templates are returned by template listing.
- Composer logs final edited subject/body with template identity.
- No external send provider is invoked in Phase 1.
- Case email history is auditable and expandable by row.

## 7. Performance smoke validation

- Run `tests/integration/email/performance-smoke.test.ts`.
- Confirm template list and case email history response envelopes meet `<= 1.0s` target.

## 8. Usability validation checklist (SC-002)

Use this script with at least 20 representative case-maker attempts:

- [ ] User opens a case and locates `Emails` tab without guidance.
- [ ] User clicks `Compose Email` and selects intended template.
- [ ] User verifies auto-filled subject/body variables are understandable.
- [ ] User edits subject/body and keeps required fields non-empty.
- [ ] User sends/logs successfully on first attempt.
- [ ] User confirms new email appears in history and can expand full body.

Success metric:
- First-attempt completion rate for the flow above is `>= 95%`.
