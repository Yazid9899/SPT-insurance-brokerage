# Research: Email Template System

## Decision 1: Source of predefined templates
- Decision: Keep the seven templates as system-defined catalog entries with stable IDs and metadata managed by the application (not user-editable in Phase 1).
- Rationale: The feature requires fixed predefined templates and avoids introducing template CRUD complexity.
- Alternatives considered:
  - Database-managed editable templates: rejected for Phase 1 scope creep.
  - Hardcoded inline template strings in components: rejected due to poor maintainability and testability.

## Decision 2: Variable rendering semantics
- Decision: Use double-curly token replacement where known keys are replaced and unresolved keys remain unchanged.
- Rationale: Matches PRD rendering behavior and the clarified spec decision, while preserving visibility of missing context.
- Alternatives considered:
  - Replace missing keys with empty strings: rejected due to hidden data issues.
  - Throw rendering errors for missing keys: rejected due to poor compose UX.

## Decision 3: Compose flow and persisted output
- Decision: On send, persist final edited subject/body with template identity, recipient fields, and actor/timestamp in case email history.
- Rationale: Satisfies auditability and supports traceability from template usage to final communication text.
- Alternatives considered:
  - Persist only raw template render result: rejected because user edits would be lost.
  - Persist template only and render on read: rejected because historical edits become non-deterministic.

## Decision 4: Phase 1 delivery mode
- Decision: Implement log-only send path with explicit confirmation message and no outbound provider call.
- Rationale: Aligns with PRD Phase 1 behavior and reduces operational dependencies.
- Alternatives considered:
  - Stub provider invocation: rejected as unnecessary for current requirement.
  - Queue for later sending: rejected because current requirement is explicit no-send behavior.

## Decision 5: Template preview behavior
- Decision: Template cards render preview using sample data set; composer preview renders using current case/context/settlement data.
- Rationale: Separates demonstration preview from real composition context and improves operator confidence.
- Alternatives considered:
  - No sample preview on templates page: rejected because preview is explicit requirement.

## Decision 6: Settlement variable availability
- Decision: Settlement variables are included in variable catalog and populated when settlement context is available; otherwise unresolved tokens remain unchanged.
- Rationale: Supports mixed template usage while honoring clarified fallback rule.
- Alternatives considered:
  - Block settlement templates without settlement context: rejected as too rigid for Phase 1.
