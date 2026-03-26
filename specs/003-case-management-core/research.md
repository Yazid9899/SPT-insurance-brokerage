# Research: Case Management Core

## Decision 1: Shared premium calculator for UX preview and persistence integrity
- Decision: Use one shared `calculatePremiums()` domain utility with Decimal-safe arithmetic, called client-side on form changes and server-side before create/update persistence.
- Rationale: Removes drift between UI preview values and stored values; enforces constitution on deterministic financial math.
- Alternatives considered:
  - Separate client/server formulas: rejected due to mismatch risk.
  - Server-only calculation: rejected because it weakens live form UX feedback.

## Decision 2: Status transition enforcement model
- Decision: Implement centralized `STATUS_TRANSITIONS` map and per-transition validation schemas, all enforced in `POST /api/cases/[id]/status`.
- Rationale: Single source of truth for allowed transitions and prerequisites; simplifies testing of invalid/valid paths.
- Alternatives considered:
  - UI-only guardrails: rejected because server integrity would be bypassable.
  - Hardcoded route conditionals only: rejected due to maintainability and test matrix complexity.

## Decision 3: Transition audit logging and atomicity
- Decision: Case status update and `CaseStatusHistory` insert occur in one DB transaction.
- Rationale: Prevents partial writes where status changes without audit trail.
- Alternatives considered:
  - Async fire-and-forget history insert: rejected as non-auditable on failure.
  - Eventual consistency queue: rejected as unnecessary complexity.

## Decision 4: Draft deletion behavior
- Decision: Implement Draft deletion as soft-delete, excluded from default list/search responses.
- Rationale: Preserves auditability and case-number continuity while meeting user-level delete semantics.
- Alternatives considered:
  - Hard-delete Draft: rejected due to audit loss.
  - Archive-only explicit flow: rejected as extra UX complexity for current scope.

## Decision 5: Case list filtering contract
- Decision: Use URL search parameters as canonical list filter state and server-side query filtering for status/product/cargo/cover/search/sort/page.
- Rationale: Shareable URLs, predictable navigation state, server-authoritative pagination.
- Alternatives considered:
  - Client-only filtering after broad fetch: rejected for scale/performance and inconsistent paging.
  - Session-local filter state only: rejected due to poor linkability.

## Decision 6: Status visual consistency
- Decision: Keep status color mapping in shared constants and consume through `StatusBadge` in list/detail views.
- Rationale: Meets constitution UX consistency rule and prevents divergent status visuals.
- Alternatives considered:
  - Inline color logic per component: rejected for inconsistency risk.
  - CSS-only ad-hoc class naming by page: rejected for duplication.
