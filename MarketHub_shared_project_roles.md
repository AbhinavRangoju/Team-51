# MarketHub — Shared Project & Team Role Specification

## 1. Project Overview

**Problem Statement:** PS-02 — MarketHub: Secure Multi-Vendor Marketplace  
**Domain:** E-Commerce

MarketHub is a secure multi-vendor marketplace where:
- Customers register, browse products, manage carts, place orders, and track purchases.
- Vendors manage their own products and orders.
- Administrators manage marketplace operations and security.

### Core Features
- Customer registration and authentication
- Vendor registration and profile management
- Product creation and management
- Product search and filtering
- Shopping cart
- Simulated checkout
- Order creation and tracking
- Vendor dashboard and order management
- Administrative management

**AI shopping assistant is not part of our project scope.**

---

# 2. Team Members & Responsibilities

## Member 1 — Backend Engineer

### Main Responsibility
Build the backend, APIs, database models, and core business logic.

### Owns
- User and vendor APIs
- Authentication/session implementation
- Product APIs
- Cart APIs
- Checkout and order APIs
- Database schema and backend data access
- Server-side validation
- Business rules
- Admin APIs

### Must Ensure
- Prices, stock, totals, roles, ownership, and order state are decided by the server.
- Users cannot modify another user's or vendor's data.
- Checkout calculates everything from trusted database data.
- Backend APIs follow the security policies defined by Member 2.

### Works Closely With
- **Member 2:** security requirements and authorization
- **Member 3:** API contracts for frontend
- **Member 4:** integration and bug fixing

---

## Member 2 — Security Architect & AppSec Engineer

### Main Responsibility
Define and enforce the security architecture of the application.

### Owns
- Threat model
- Authentication security requirements
- RBAC and authorization policies
- Vendor/customer/admin access boundaries
- Tenant isolation
- API security requirements
- CSRF, XSS and injection protections
- Rate limiting requirements
- Security headers
- Audit logging requirements
- Security test cases and attack scenarios

### Must Ensure
- Authorization is deny-by-default.
- Vendors can access only their own marketplace data.
- Customers can access only their own sensitive data and orders.
- Admin privileges cannot be obtained through public registration.
- Security-sensitive actions are properly protected.
- Every important security control has a test.

### Works Closely With
- **Member 1:** backend security implementation
- **Member 3:** frontend security requirements
- **Member 4:** security testing and attack simulation

---

## Member 3 — Frontend & UX Engineer

### Main Responsibility
Build the customer, vendor, and admin interfaces.

### Owns
- Customer registration/login UI
- Product browsing and search
- Product details
- Cart
- Checkout UI
- Order tracking
- Vendor dashboard
- Product management UI
- Vendor order management
- Admin dashboard
- Responsive UI and basic UX

### Must Ensure
- Frontend never decides authorization.
- Frontend does not trust prices, totals, stock, or roles from the client.
- User-controlled content is safely displayed.
- API errors are handled without exposing sensitive information.

### Works Closely With
- **Member 1:** API integration
- **Member 2:** security requirements
- **Member 4:** end-to-end testing

---

## Member 4 — Integration & Security QA Engineer

### Main Responsibility
Make sure the complete system works together and is resistant to common attacks.

### Owns
- Frontend/backend integration
- End-to-end workflows
- Functional testing
- Security testing
- Regression testing
- Attack simulation
- Finding and reproducing bugs
- Verifying fixes
- Demo security scenarios

### Main Test Areas
- Authentication and authorization
- Cross-vendor access
- Cross-customer order access
- Role escalation
- Price/total manipulation
- Checkout replay and race conditions
- XSS and injection attempts
- CSRF
- Rate limiting
- File upload security
- Invalid order-state transitions

### Works Closely With
- **Member 1:** reproduce and fix backend issues
- **Member 2:** execute security test plan
- **Member 3:** test complete user workflows

---

# 3. Responsibility Matrix

| Area | M1 | M2 | M3 | M4 |
|---|---|---|---|---|
| Backend/API | **Own** | Review | Integrate | Test |
| Database | **Own** | Security review | Use | Test |
| Authentication | Implement | **Own security design** | Integrate UI | Test |
| Authorization | Implement | **Own policy** | Consume | Test |
| Security architecture | Support | **Own** | Follow | Validate |
| Customer UI | API support | Security review | **Own** | Test |
| Vendor UI | API support | Security review | **Own** | Test |
| Admin UI | API support | **Own security requirements** | **Own UI** | Test |
| Checkout | **Own** | Security design | UI | **Test** |
| Security testing | Fix issues | **Design** | Support | **Own** |
| E2E testing | Support | Security cases | Support | **Own** |

---

# 4. Shared Security Rules

Everyone must follow these rules:

1. **Server is the authority.** Never trust client-provided roles, prices, totals, stock, ownership, or order state.
2. **Deny by default.** An endpoint should not become accessible simply because a route exists.
3. **Check ownership server-side.** Vendors must not access another vendor's resources.
4. **Validate all input.** Reject unexpected fields and invalid values.
5. **Use parameterized database queries.**
6. **Never render arbitrary user/vendor HTML.**
7. **Protect state-changing requests against CSRF.**
8. **Use secure server-side sessions.**
9. **Do not expose secrets or sensitive information in responses/logs.**
10. **Security controls must be tested, not just claimed to exist.**

---

# 5. Team Workflow

The normal workflow is:

**Security requirement → Backend implementation → Frontend integration → Security/functional testing → Fix → Regression test**

Member 2 defines security requirements.  
Member 1 implements backend controls.  
Member 3 builds the user-facing functionality.  
Member 4 verifies the complete system and attacks weak points.

Security-related disagreements are resolved according to the security architecture.

---

# 6. Definition of Done

A feature is considered complete when:

- The backend functionality works.
- The frontend can use it correctly.
- Authorization is enforced server-side.
- Invalid and malicious input is handled safely.
- Important attack cases are tested.
- Integration/regression testing passes.
- No known critical security issue remains.

---

# 7. Project Scope Discipline

Focus on a **secure, working marketplace** rather than trying to implement every possible feature.

Priority should be:

**Core marketplace functionality + strong authorization + secure checkout/order handling + practical security testing.**

Avoid adding features that do not materially improve the required marketplace or its security.
