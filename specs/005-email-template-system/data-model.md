# Data Model: Email Template System

## Entity: EmailTemplateCatalog (system-defined)
- Purpose: Defines the fixed set of seven templates available to case makers.
- Identity:
  - `templateId` (stable key)
- Fields:
  - `name`
  - `description`
  - `subjectTemplate`
  - `bodyTemplate`
  - `variables` (declared list of supported placeholders)
- Invariants:
  - Exactly seven templates are available in Phase 1.
  - Template authoring/editing is out of scope.

## Entity: TemplateVariableContext (derived)
- Purpose: Runtime context object used to resolve `{{variable}}` tokens.
- Context groups:
  - Case: case number, client fields, product/cover, financial, shipment, open cover reference, insurer name.
  - System context: `brokerName`, `today`.
  - Settlement context: settlement number, period, total insurer premium, case count.
- Rendering rule:
  - Known keys are substituted.
  - Unresolved keys remain unchanged in output.

## Entity: CaseEmail (persisted)
- Purpose: Immutable audit record of logged outbound communication for a case.
- Existing schema fields (plus constraints):
  - `id`
  - `caseId`
  - `templateId` (references template identity key)
  - `to`
  - `cc`
  - `subject` (final edited value)
  - `body` (final edited value)
  - `sentById`
  - `sentAt`
- Invariants:
  - In Phase 1, every send action creates one CaseEmail log row only (no external send).
  - Send blocked when `to`, `subject`, or `body` is empty.

## Relationships
- One `Case` to many `CaseEmail`.
- One `User` to many `CaseEmail` via `sentById`.
- Each `CaseEmail.templateId` maps to one template in `EmailTemplateCatalog`.

## Lifecycle and Operations
- Template page list: read catalog + sample preview rendering.
- Composer open: load case, template list, variable context.
- Template select: render subject/body preview from selected template.
- Send (Phase 1): validate required fields, persist CaseEmail, return log-only confirmation.
- Emails tab list: return case email history with expandable body.

## Validation Rules
- `to`, `subject`, `body` are required before logging.
- `cc` optional.
- `templateId` required when composing from template.
- Variable declarations are constrained to supported catalog list.

## Consistency Rules
- Logged email history stores final edited content, not only initial rendered content.
- Template identity is retained for each log entry.
- Rendering behavior is deterministic for known keys and stable for unresolved keys.
