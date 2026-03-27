# Feature Specification: Client And Insurer Entities

**Feature Branch**: `009-client-insurer-entities`  
**Created**: 2026-03-27  
**Status**: Draft  
**Input**: User description: "Add first-class Client/Insured and Insurer entities so cases can be tracked per client while preserving current behavior and backward compatibility."

## Constitution Alignment *(mandatory)*

- Keep this document technology-agnostic: describe only WHAT and WHY.
- Do not include implementation details such as frameworks, libraries, architecture,
  API transport design, or file/folder structure.
- If implementation detail is required for feasibility, note it as a clarification need
  and move final technical decisions to `plan.md`.

## Clarifications

### Session 2026-03-27

- Q: Should settlement records adopt direct insurer linkage in this feature or remain name-based until a dedicated settlement migration phase? -> A: Keep settlement name-based now; use normalized insurer on cases immediately; move settlement linkage migration to a follow-up feature.
- Q: Should client uniqueness be enforced on name alone or on a broader identity rule? -> A: Enforce uniqueness using normalized client name + normalized company.
- Q: What governance process will approve and manage party merges/splits after initial backfill? -> A: Supervisor-approved merges/splits with mandatory audit trail.
- Q: Should active open covers be allowed to have zero linked clients? -> A: Active open covers must have at least one linked client.
- Q: How should legacy open covers be backfilled to linked clients? -> A: Auto-link only when a unique normalized match exists; ambiguous/unmatched records go to manual review.
- Q: Can inactive clients linked to an open cover be selected for new open-cover cases? -> A: No; inactive clients cannot be selected for new cases, while historical cases remain readable.
## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and manage cases with normalized parties (Priority: P1)

As a case maker, I can create and edit cases by selecting a Client/Insured entity and an Insurer entity, and I can use one Open Cover across multiple clients, so each case is consistently tracked while preserving operational flexibility.

**Why this priority**: Case tracking by party is the core purpose of this feature and open-cover reuse across multiple clients is a critical operational need.

**Independent Test**: Create and edit both open-cover and single-shipment cases, verify each case links to a selected client and insurer while preserving existing lifecycle and premium behavior.

**Acceptance Scenarios**:

1. **Given** an open cover is linked to multiple clients, **When** a user creates an open-cover case, **Then** they must select one    
client from that open cover's linked client list.                                                                                      
2. **Given** a case uses an open cover, **When** the open cover is selected, **Then** insurer is derived from that open cover and client selection is restricted to linked clients.                                                                                      
3. **Given** a case uses single shipment, **When** the user submits the case, **Then** both client and insurer selection are required. 
  
---

### User Story 2 - Find and analyze cases by client and insurer (Priority: P1)

As a case maker, I can filter and report cases by client and insurer, so I can answer operational and financial questions for a specific party quickly.

**Why this priority**: Operational reporting, reconciliation, and workload management require party-based views.

**Independent Test**: Apply client and insurer filters in case list and reports, confirm counts, summaries, and breakdowns are consistent with filtered records.

**Acceptance Scenarios**:

1. **Given** mixed cases across multiple parties, **When** a user filters by a specific client or insurer, **Then** only matching cases are shown in list and report views.
2. **Given** insurer-based commission views, **When** data includes normalized insurer links, **Then** commission and case counts are grouped consistently per insurer.

---

### User Story 3 - Preserve legacy behavior during migration (Priority: P2)

As an operations user, I can continue using existing cases and flows during rollout, so migration to normalized entities does not disrupt daily work.

**Why this priority**: The system already has live data and workflows that must remain stable while the new model is introduced.

**Independent Test**: Verify existing records without full party linkage still appear and behave correctly across detail, lifecycle, settlements, and reports.

**Acceptance Scenarios**:

1. **Given** historical cases with only snapshot text fields, **When** users view cases and reports, **Then** records remain usable and correctly visible.
2. **Given** partially backfilled records, **When** users run key workflows, **Then** system behavior remains backward compatible with no blocking errors.

---

### Edge Cases

- Multiple legacy names likely represent the same party (for example spacing/casing variants) and require deterministic merge rules.
- A legacy case cannot be confidently matched to a single client or insurer during backfill.
- A party becomes inactive but still appears in historical cases and reports.
- Open cover party assignments and manually selected case party assignments conflict.
- Reports run over mixed records (normalized + legacy-only) must not drop rows or double-count party totals.
- Exported data for filtered views must remain complete even when some records use fallback party values.
- An open cover has no linked clients when user attempts open-cover case creation.                                                     
- A client previously linked to an open cover becomes inactive.                                                                        
- New case creation must reject inactive linked clients without altering historical case associations.
- A user attempts to select a client not linked to the selected open cover.                                                            
- Legacy open covers that were single-client need migration to multi-client linkage without breaking existing cases. 

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide first-class `Client/Insured` and `Insurer` entities that can be referenced by cases.
- **FR-002**: System MUST support these minimum entity fields:
  - Client (required): displayName
  - Client (optional): company, email, phone, status
  - Insurer (required): displayName
  - Insurer (optional): email, phone, status
- **FR-003**: System MUST allow cases to store normalized references to one client and one insurer while retaining existing snapshot text fields for backward compatibility.
- **FR-004**: System MUST model open cover party linkage as one insurer and many clients, while preserving existing snapshot text fields for backward compatibility.
- **FR-005**: During case create/edit, system MUST support selecting client and insurer for single-shipment flows.                     
- **FR-006**: During case create/edit under open-cover flow, system MUST derive insurer from the selected open cover and require client selection from that open cover's linked client list.   
- **FR-007**: Existing case lifecycle transitions, transition validations, and status history behavior MUST remain unchanged by this feature except for party-reference usage.
- **FR-008**: Cases list and reporting views MUST support filtering by normalized client and insurer without removing existing filters.
- **FR-009**: Insurer-based aggregations (including commission views) MUST use normalized insurer identity when available and apply fallback behavior for legacy rows without normalized linkage.
- **FR-010**: CSV export behavior MUST remain backward compatible with current required columns by default; any added columns must be additive and non-breaking.
- **FR-011**: System MUST support a non-breaking migration path where existing records remain readable and operational even if not yet fully linked to normalized parties.
- **FR-012**: System MUST provide deterministic duplicate-handling rules for party normalization and record ambiguous mappings for manual follow-up.
- **FR-013**: Validation rules MUST enforce that open-cover cases can only use clients linked to the selected open cover, while        
allowing phased compatibility for historical records.
- **FR-014**: Existing interface contracts for case, open-cover, settlement, and report workflows MUST evolve additively to avoid breaking existing consumers and screens.
- **FR-015**: Error responses for party-related validation and mapping failures MUST remain consistent with current platform error-shape conventions.
- **FR-016**: Settlement behavior MUST remain functionally stable during this feature rollout, and settlement records MUST remain name-based in this feature while cases adopt normalized insurer linkage.
- **FR-017**: System MUST record a formal follow-up work item for direct settlement-to-insurer linkage before feature release, including scope boundary, migration dependency, and backward-compatibility constraints.
- **FR-018**: Client identity uniqueness MUST be enforced using normalized client name plus normalized company, with ambiguous legacy mappings routed to manual review.
- **FR-019**: Party merge and split actions MUST require supervisor approval and MUST produce an auditable change history.
- **FR-020**: System MUST enforce and expose open-cover multi-client behavior in runtime workflows so the same open cover can be used across multiple clients in case creation, filtering, and reporting.

- **FR-021**: System MUST enforce that an active open cover has at least one linked client and MUST block active open-cover workflows when no client is linked.
- **FR-022**: During backfill, legacy open covers MUST auto-link to clients only when a unique normalized match exists; ambiguous or unmatched records MUST be flagged for manual review and MUST NOT be auto-linked.
- **FR-023**: System MUST prevent selection of inactive clients for new open-cover case creation while preserving visibility and integrity of historical cases already linked to inactive clients.
### Key Entities *(include if feature involves data)*

- **Client/Insured**: A reusable insured-party profile used to identify who a case is for. Includes identity and optional contact metadata, lifecycle status (active/inactive), and relationships to cases and open covers.
- **Insurer**: A reusable insurer profile used for underwriting/billing/settlement grouping. Includes identity and optional contact metadata, lifecycle status (active/inactive), and relationships to cases and open covers.
- **Case (enhanced)**: Existing case record with added normalized references to one client and one insurer, while preserving snapshot fields for continuity and historical fidelity.
- **Open Cover (enhanced)**: Existing open cover agreement with one insurer and multiple linked clients, acting as the authoritative
source for insurer derivation and allowed client selection in open-cover case flows.
- **OpenCoverClientLink**: Join entity linking open covers to multiple clients, enforcing link integrity and enabling linked-client selection constraints in open-cover case creation/edit flows.
- **PartyMergeAudit**: Immutable governance audit entity capturing supervisor-approved party merge/split actions, decision metadata, and timestamps for traceability.
- **Settlement (continuity scope)**: Existing settlement record that continues to produce stable insurer-based outcomes during rollout, with normalized insurer linkage considered a phased evolution.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of newly created cases are linked to exactly one client and one insurer according to their workflow rules.
- **SC-002**: At least 99% of historical cases are automatically linked to normalized client/insurer records during backfill; all unmatched records are captured in an explicit review list.
- **SC-003**: Case list and report filters by client and insurer return consistent counts across screens in 100% of acceptance validation scenarios.
- **SC-004**: Existing core workflows (case lifecycle transitions, settlements, document/email flows, and reporting exports) complete with no regression in UAT critical-path scenarios.
- **SC-005**: For a dataset of up to 50,000 cases, users can return filtered cases for a single client or insurer from list/report views within 30 seconds at p95 in UAT measurement runs.

## Assumptions

- Existing users and permissions remain unchanged for this feature.
- Existing snapshot name/contact fields remain available for compatibility, history display, and fallback behavior during migration.
- Existing external consumers and screens depend on current interfaces and must continue working with additive contract changes only.
- Historical data quality varies; some names may be duplicated, inconsistent, or ambiguous.
- This feature does not introduce a new settlement business process; it only improves party identity fidelity.
- Changes to data export shape are optional and must remain backward compatible by default.
- Open cover to client linkage is many-to-many.
- Existing single-client open cover records can be represented as open covers linked to exactly one client after migration/backfill.

## Risks

- Party deduplication may merge distinct real-world entities if normalization rules are too aggressive.
- Insufficient deduplication may leave fragmented identities and reduce reporting quality.
- Mixed migrated/unmigrated records may cause temporary inconsistency in party-based analytics if fallback rules are not strict.
- Ambiguous backfill mappings may require manual operations effort.
- If party reference rules are enforced too early, legacy edits could fail unexpectedly.
- Incorrect open-cover/client linkage can allow invalid client selection during case creation.
- Migration from single-client open cover shape to multi-client linkage may introduce duplicate or missing links if mapping is
incomplete.


