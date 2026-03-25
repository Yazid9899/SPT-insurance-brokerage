# Feature Specification: Foundation Application Shell

**Feature Branch**: `001-foundation-auth-shell`  
**Created**: 2026-03-25  
**Status**: Draft  
**Input**: User description: "Feature 001 foundation for CargoShield with login, authenticated app shell navigation, protected pages, product line scaffolding, and case lifecycle baseline"

## Constitution Alignment *(mandatory)*

- This specification defines business behavior and user outcomes only.
- Technical implementation decisions are intentionally deferred to `plan.md`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Secure Access to Workspace (Priority: P1)

As a Case Maker, I can sign in with my assigned email and password so that only authorized staff can access CargoShield.

**Why this priority**: Authentication is a hard prerequisite for all internal workflows and data protection.

**Independent Test**: Enter valid credentials and verify access to the main application; enter invalid credentials and verify access is denied.

**Acceptance Scenarios**:

1. **Given** the predefined user account exists, **When** the Case Maker submits valid email and password, **Then** the system signs the user in and opens the main application on the Dashboard page.
2. **Given** an unauthenticated visitor enters an invalid email/password combination, **When** sign-in is submitted, **Then** access is denied and the user remains on the login page with a clear error message.
3. **Given** an unauthenticated visitor requests a protected application page URL, **When** the page is requested, **Then** the visitor is redirected to the login page.
4. **Given** the user is already authenticated, **When** they request the login page, **Then** the system redirects them to the Dashboard page.

---

### User Story 2 - Navigate Core Modules from a Persistent Shell (Priority: P1)

As a signed-in Case Maker, I can use a persistent sidebar to navigate key modules so that I can move across core workflows without losing context.

**Why this priority**: The shared navigation shell is foundational infrastructure for all upcoming features.

**Independent Test**: Sign in and verify the sidebar is visible on each module page with all required navigation links and user identity details.

**Acceptance Scenarios**:

1. **Given** the Case Maker is signed in, **When** any main-application page is shown, **Then** a persistent sidebar displays links to Dashboard, Cases, Open Covers, Settlements, Reports, and Email Templates.
2. **Given** the sidebar is visible, **When** the user views sidebar branding and footer information, **Then** the app name "CargoShield" and the signed-in user's name and email are displayed.
3. **Given** the Case Maker selects a sidebar link, **When** navigation completes, **Then** the main content area updates to the selected page while the sidebar remains persistent.

---

### User Story 3 - Establish Product and Lifecycle Baselines (Priority: P2)

As a Case Maker, I can see supported insurance product lines and the standard 7-step case lifecycle so that all future case workflows start from consistent business definitions.

**Why this priority**: Product taxonomy and lifecycle vocabulary must be fixed early to prevent later workflow inconsistency.

**Independent Test**: Verify the system surfaces Cargo, Property, Marine Hull, and Utility product lines, with Cargo sub-products and placeholder behavior for non-Cargo lines, plus the defined lifecycle states.

**Acceptance Scenarios**:

1. **Given** the user is working in the main application, **When** product-line options are presented, **Then** the system shows Cargo, Property, Marine Hull, and Utility.
2. **Given** Cargo is selected, **When** product details are needed, **Then** the system supports Cargo sub-products CPO, Biodiesel, and Shortening.
3. **Given** Property, Marine Hull, or Utility is selected in Phase 1, **When** details are shown, **Then** those lines appear as label-only placeholders for future enhancement.
4. **Given** a case lifecycle reference is shown, **When** statuses are presented, **Then** the lifecycle is Draft -> Documentation -> Underwriting -> Active -> Billing -> Settling -> Closed.

---

### Edge Cases

- If an authenticated session expires while viewing a protected page, the next protected request redirects to the login page.
- If a user directly requests an existing module route without functional content, the system returns the protected page shell with a placeholder content state (not a not-found error).
- If product context changes from Cargo to a non-Cargo line during placeholder workflows, Cargo-specific detail inputs are cleared and only generic placeholder context remains visible.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide an email-and-password login flow for Case Maker access.
- **FR-002**: The system MUST support exactly one predefined Case Maker account in Phase 1, with no self-service registration flow.
- **FR-003**: The system MUST deny access when submitted credentials are invalid.
- **FR-003a**: The system MUST return a generic invalid-credentials message and MUST NOT reveal whether email or password was incorrect.
- **FR-004**: The system MUST redirect unauthenticated users attempting to access protected application pages to the login page.
- **FR-005**: The system MUST show the main application only after successful authentication.
- **FR-006**: The system MUST default the first post-login view to the Dashboard page.
- **FR-006a**: The system MUST redirect authenticated users away from the login page to the Dashboard page.
- **FR-007**: The system MUST provide a persistent sidebar on all authenticated application pages.
- **FR-008**: The sidebar MUST include navigation links for Dashboard, Cases, Open Covers, Settlements, Reports, and Email Templates.
- **FR-009**: The sidebar MUST display the application name "CargoShield" and the current user's name and email.
- **FR-010**: The main content area MUST display a placeholder for each navigable module not yet implemented, including Dashboard.
- **FR-011**: The system MUST support product lines Cargo, Property, Marine Hull, and Utility.
- **FR-012**: The system MUST support Cargo sub-products CPO, Biodiesel, and Shortening.
- **FR-013**: In Phase 1, non-Cargo product lines (Property, Marine Hull, Utility) MUST remain label-only navigation placeholders and MUST NOT expose full case-detail workflows or full detail-field sets.
- **FR-014**: The system MUST define the case lifecycle with exactly seven statuses: Draft, Documentation, Underwriting, Active, Billing, Settling, and Closed.
- **FR-015**: The system MUST make the lifecycle states available for future transition-rule enforcement in subsequent features.

### Key Entities *(include if feature involves data)*

- **User**: Represents the Case Maker account with identity attributes used for login and sidebar identity display.
- **Application Module**: Represents each top-level navigable page (Dashboard, Cases, Open Covers, Settlements, Reports, Email Templates) displayed inside the authenticated shell.
- **Product Line**: Represents supported insurance lines (Cargo, Property, Marine Hull, Utility), including Cargo-specific sub-products.
- **Case Lifecycle Status**: Represents one of the seven ordered case stages used across case management workflows.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of unauthenticated requests to protected pages are redirected to the login page in acceptance testing.
- **SC-002**: 100% of successful sign-ins route users to the Dashboard view as the first authenticated page.
- **SC-003 (Manual QA)**: A signed-in user can navigate to all six core module pages from the sidebar without losing shell context; this is verified via manual QA in Feature 001 (30-second target guideline).
- **SC-004**: 100% of authenticated application pages display consistent sidebar branding and signed-in user identity details.
- **SC-005**: 100% of product-line lists display Cargo, Property, Marine Hull, and Utility, and Cargo displays CPO, Biodiesel, and Shortening in validation checks.
- **SC-006**: 100% of lifecycle references display the seven required statuses in the defined sequence.

## Assumptions

- Phase 1 has a single internal user role (Case Maker) and no additional role-based permissions.
- Password reset, account management, and self-registration are out of scope for Feature 001.
- Placeholder module pages are acceptable provided navigation structure and authentication enforcement are complete.
- Failed login attempts show a generic invalid-credentials message for security.
- Feature 001 intentionally introduces the full core Prisma schema as shared foundation infrastructure, while workflow logic and advanced feature behavior are delivered in subsequent features.
- Detailed transition validation rules for lifecycle progression are intentionally deferred to Feature 002.
- Property, Marine Hull, and Utility remain placeholder-only lines in Feature 001; full workflows are deferred.
