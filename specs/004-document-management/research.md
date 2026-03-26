# Research: Document Management

## Decision 1: Upload transport and validation strategy
- Decision: Use `multipart/form-data` upload at `POST /api/cases/{id}/documents`, with server-side validation of MIME/extension allowlist and max size 10 MB before persistence.
- Rationale: Multipart is the standard browser upload mechanism and allows direct transfer of file + metadata; server-side validation is mandatory for integrity regardless of client checks.
- Alternatives considered:
  - Base64 JSON payload: rejected due to higher payload overhead and poor ergonomics for large files.
  - Client-only validation: rejected because it is bypassable.

## Decision 2: Local development storage with production-ready abstraction
- Decision: Store files under `/public/uploads` in development, while routing reads/writes/deletes through a storage interface (`save`, `delete`, `resolvePublicUrl`) designed for swapping to S3-compatible storage in production.
- Rationale: Gives immediate local operability now and avoids rewrite risk when moving to object storage later.
- Alternatives considered:
  - Hardcode filesystem logic inside API route: rejected because it tightly couples route behavior to one backend.
  - Build S3-only now: rejected as unnecessary operational complexity for local feature delivery.

## Decision 3: Shared document representation across bulk-created cases
- Decision: Persist per-case document metadata rows while attaching a shared batch linkage key for batch-origin files; render Shared indicator from that linkage and resolve cross-case behavior from the shared key.
- Rationale: Keeps case-local listing simple while supporting cross-case delete semantics and auditability.
- Alternatives considered:
  - Separate shared-document table + join table: rejected for current scope due to higher migration and query complexity.
  - Duplicate rows without shared linkage: rejected because shared deletion and traceability become unreliable.

## Decision 4: Expected documents checklist computation
- Decision: Compute checklist from current case status + uploaded document types at read time, with a fixed status-to-types mapping; do not write checklist state to persistence.
- Rationale: Checklist is advisory and derived, so computed state prevents drift and keeps transitions independent.
- Alternatives considered:
  - Persist checklist completion flags: rejected due to stale-state risk and unnecessary write paths.

## Decision 5: File serving and deletion safety
- Decision: Serve files only by metadata lookup and resolved storage key/path owned by the server; enforce path normalization, disallow path traversal, and delete file + DB record in one transaction-like workflow with safe rollback/error handling.
- Rationale: Prevents arbitrary file access/deletion and keeps metadata-storage consistency.
- Alternatives considered:
  - Trust client-provided file path for download/delete: rejected as unsafe.
  - Delete DB record first then file best-effort: rejected because it can orphan files without traceability.

## Decision 6: Next.js App Router upload handling pattern
- Decision: Use Route Handlers with `request.formData()` for multipart parsing, keep runtime Node.js, and centralize upload constraints in shared validation utilities used by both route and UI.
- Rationale: Aligns with App Router conventions and avoids custom upload middleware for this scope.
- Alternatives considered:
  - Legacy API route middleware stack: rejected as inconsistent with current project structure.
  - Server Actions for upload endpoint: rejected because explicit REST routes are required by feature contract.
