# Feature Specification: Email Template System

**Feature Branch**: `005-email-template-system`  
**Created**: 2026-03-26  
**Status**: Draft  
**Input**: User description: "Feature 006: Email Template System"

## Constitution Alignment *(mandatory)*

- This specification defines business outcomes for template-driven case emails and operational traceability.
- It focuses on expected behavior and user value without implementation design decisions.
- Technical execution details are deferred to planning.

## Clarifications

### Session 2026-03-26

- Q: How should unresolved template variables be rendered? -> A: Keep unresolved variables unchanged in output.
- Q: What should be stored when users edit subject/body before send? -> A: Store the final edited subject/body and preserve template identity.
- Q: What fields are required before logging an email? -> A: Require non-empty To, subject, and body before Send can log.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Compose And Log Case Emails From Templates (Priority: P1)

A case maker opens a case, chooses an email template, reviews auto-filled variables, optionally edits subject/body, and logs the email to case history.

**Why this priority**: Template-based communication on a case is the core functional outcome for this feature.

**Independent Test**: Can be tested by selecting each template in the case composer, confirming variable population and preview rendering, and verifying the email is logged in the case Emails tab.

**Acceptance Scenarios**:

1. **Given** a case with client data, **When** the case maker opens Compose Email and selects a template, **Then** subject and body render with populated variables from case/context data.
2. **Given** a selected template, **When** the case maker edits subject/body before sending, **Then** the edited content is what gets logged.
3. **Given** a composed email, **When** Send is clicked in Phase 1, **Then** the system stores the email record and shows confirmation that sending is disabled in dev mode.
4. **Given** a case with existing email history, **When** a new email is logged, **Then** the new item appears in the Emails tab list with template name, recipient, date, and subject.

---

### User Story 2 - Manage Visibility Of Predefined Templates (Priority: P2)

A case maker views all predefined templates on the Email Templates page, understands each template at a glance, and previews rendered output with sample data.

**Why this priority**: Discoverability and confidence in template content are required to reduce communication errors.

**Independent Test**: Can be tested by loading the Email Templates page and validating all seven templates display as cards with metadata and preview behavior.

**Acceptance Scenarios**:

1. **Given** the Email Templates page is opened, **When** templates load, **Then** exactly seven predefined templates are shown as cards.
2. **Given** a template card, **When** the user inspects it, **Then** the card shows name, description, subject preview, and used variables.
3. **Given** a template card, **When** Preview is clicked, **Then** rendered sample output is shown with variable placeholders replaced by sample values.

---

### User Story 3 - Ensure Variable Coverage Across Template Contexts (Priority: P3)

A case maker can rely on consistent variable behavior across case, context, and settlement fields without template rendering failures.

**Why this priority**: Consistent variable handling prevents broken communications and supports settlement-related messages.

**Independent Test**: Can be tested by rendering all templates against sample case and settlement datasets and verifying all declared variables resolve safely.

**Acceptance Scenarios**:

1. **Given** the variable list defined for the feature, **When** any template is rendered, **Then** known variables are replaced with available values.
2. **Given** a template contains a variable with no available value, **When** rendered, **Then** the output remains readable and the unresolved token is handled consistently.
3. **Given** settlement templates and non-settlement templates, **When** composing from case context, **Then** settlement variables are populated only when settlement context exists.

---

### Edge Cases

- The selected template has variables that are missing from current case data.
- The case has no client email; To field prefill is blank and the user must enter recipient manually.
- A case maker edits subject/body to empty content before send.
- The case has many logged emails; list still shows newest entries clearly and each row can expand for full body.
- Template preview sample values are present for all declared variables, including settlement variables.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide seven predefined templates: New Case Notification, Documentation Request, Open Cover Declaration, Billing/Premium Notice, Case Closure Notice, Bulk Declaration, and Settlement Confirmation.
- **FR-002**: Each template MUST include name, description, subject, body, and a declared variable list.
- **FR-003**: Template variables MUST use `{{variableName}}` syntax.
- **FR-004**: The Email Templates page MUST display all templates as cards with name, description, subject preview, and variables used.
- **FR-005**: Each template card MUST provide a Preview action that renders output using sample data.
- **FR-006**: The case Emails tab MUST provide a Compose Email action.
- **FR-007**: The composer MUST allow template selection from a dropdown.
- **FR-008**: On template selection, known variables MUST auto-populate from case and context data.
- **FR-009**: Composer MUST prefill To with client email when available and provide an editable CC field.
- **FR-010**: Composer MUST allow editing of subject and body after template fill.
- **FR-011**: In Phase 1, Send MUST log the email to case history without external delivery.
- **FR-012**: After Phase 1 send, system MUST confirm logging with a message indicating sending is disabled in dev mode.
- **FR-013**: Case Emails tab MUST list logged emails showing template name, recipient, date, and subject.
- **FR-014**: Each listed email MUST be expandable to show full body.
- **FR-015**: Supported variable scope MUST include case fields, context fields (`brokerName`, `today`), and settlement fields (`settlementNumber`, `settlementPeriod`, `totalInsurerPremium`, `caseCount`).
- **FR-016**: Variable rendering behavior MUST follow token replacement semantics where known keys are substituted and unresolved keys remain unchanged in output.
- **FR-017**: The system MUST preserve an auditable email log per case by storing the final edited subject and body while retaining template identity on the same log entry.
- **FR-018**: Send action MUST be blocked until To, subject, and body fields are all non-empty.

### Key Entities *(include if feature involves data)*

- **Email Template**: Predefined communication pattern containing name, description, subject/body content, and variable definitions.
- **Template Variable Context**: Structured value source for rendering tokens, composed of case attributes, broker/time context, and optional settlement attributes.
- **Case Email Log Entry**: Persisted record of a composed email including template used, recipients, rendered and edited content, timestamp, and case linkage.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the seven predefined templates are visible on the Email Templates page with required card metadata.
- **SC-002**: At least 95% of case makers can compose and log a template-based case email on first attempt in usability validation.
- **SC-003**: 100% of logged emails are visible in the case Emails tab with correct template name, recipient, date, and subject.
- **SC-004**: In rendering tests, all declared known variables resolve correctly for applicable context data.
- **SC-005**: 100% of Phase 1 send actions produce a persisted log entry and a confirmation that external sending is disabled.

## Assumptions

- Templates are predefined and viewable in Phase 1; template authoring/editing workflow is out of scope.
- Email sending providers are not invoked in Phase 1; this feature is log-only for outbound actions.
- Case makers have permission to compose and log emails for cases they can access.
- Sample preview data is system-defined and not user-edited in this feature scope.
- Unresolved variables remain unchanged in rendered output across all templates.
