# Project Approach & Architecture — Build Secure 24

**Team ID:** 51
**Project Name:** MarketHub — secure multi-vendor marketplace
**Team Size:** 4 Members
**Primary Track / Domain:** Secure web application / e-commerce

---

## 1. Problem Understanding, Scope & Threat Model

### 1.1 Problem Statement & Real-World Motivation

A multi-vendor marketplace is a system where mutually distrusting parties share
one database. Shoppers, independent sellers and operators all touch the same
orders and the same catalogue, and each one has a reason to want data they are
not entitled to. A seller would like to see what competitors are selling and who
is buying it. A shopper would like to pay less than the asking price. Anyone at
all would like to read someone else's order history.

That makes the interesting problem an **authorization** problem, not an
authentication one. Logging in is the easy half; deciding what an authenticated
party may then see and do is where marketplaces actually leak.

### 1.2 Target Users & Personas

| Persona | Trust level | What they may do |
|---|---|---|
| Visitor | None | Browse the catalogue, build a local cart, get a price quote |
| Shopper (`customer`) | Authenticated | Place orders, read and cancel **their own** orders |
| Seller (`vendor`) | Authenticated + linked to a store | Read **their own** listings and the lines of orders containing their products; advance those orders |
| Operator (`admin`) | Authenticated, created only by deliberate configuration | Role exists and is enforced; no admin endpoints are exposed in this build |

### 1.3 Threat Model & Attack Surface

**Critical assets:** password hashes, session identifiers, shopper postal
addresses and phone numbers, order history, per-seller revenue, catalogue
prices and stock levels.

**Trust boundary:** exactly one — the server function call. Everything on the
browser side of it, including the cart, is attacker-controlled input. The
project treats the React application as a convenient renderer with no authority.

**Attack vectors considered, and where each is addressed:**

| Vector | Control | Location |
|---|---|---|
| Privilege escalation via client-chosen role | `signup` has no role parameter; role is assigned server-side and read from the session on every request | `src/lib/api/auth.ts`, `src/lib/server/session.ts` |
| Price / total tampering | Totals recomputed from stored rows; no validator accepts a price | `src/lib/server/pricing.ts`, `src/lib/api/checkout.ts` |
| IDOR on orders | No endpoint accepts a user id; lookups filter by session user and answer "not found" for other people's rows | `src/lib/server/guards.ts` |
| Cross-tenant leakage between sellers | Store resolved by `userId`; other sellers' order lines, the grand total and shopper PII stripped before serialisation | `src/lib/server/dto.ts` |
| Double-charge on checkout | Per-user unique idempotency key; replay returns the original order | `src/lib/api/checkout.ts` |
| Overselling / stock races | Check and decrement inside one synchronous critical section | `src/lib/server/db.ts` (`tx`) |
| Order-state forgery | Transitions computed from the current state; the request cannot name a destination | `src/lib/api/orders.ts`, `src/lib/api/vendor.ts` |
| Credential stuffing | Fixed-window per-IP rate limit on login and signup | `src/lib/server/ratelimit.ts` |
| Account enumeration | One message for bad email and bad password, plus a decoy hash to equalise timing | `src/lib/server/password.ts` (`fakeVerify`) |
| Session theft via XSS | `httpOnly` session cookie; no identity in `localStorage` | `src/lib/server/session.ts` |
| CSRF | Framework CSRF middleware over all server functions, plus `SameSite=Strict` | `src/start.ts` |
| Information disclosure via errors | Only curated `AppError` messages escape; everything else is logged server-side and replaced | `src/lib/server/validate.ts` (`guarded`) |

**OWASP Top 10 mapping.** The work is concentrated on **A01 Broken Access
Control** (the guards and DTO layer), **A02 Cryptographic Failures** (scrypt with
per-user salts, constant-time comparison), **A03 Injection** (no string-built
queries anywhere; all input through allow-list validators), **A04 Insecure
Design** (server-authoritative pricing and state machines), and **A07
Authentication Failures** (rate limiting, enumeration resistance, server-side
revocable sessions).

**Explicitly out of scope:** payment processing (no gateway is contacted),
email verification and password reset, and admin tooling.

---

## 2. Technical Architecture & Secure System Design

### 2.1 High-Level Architecture Overview

A single TanStack Start application, so there is no separate API service:

```
Browser (React 19)
  │  cart / wishlist in localStorage — convenience only, zero authority
  ▼
Server functions  src/lib/api/*        ← the only trust boundary
  │  validate → authenticate → authorize → act
  ▼
Server core       src/lib/server/*     ← never reaches the browser
  │  db · pricing · password · session · guards · dto
  ▼
JSON store        data/markethub.json  (gitignored)
```

`src/lib/server/*` is reached only through `await import()` inside a handler
body, which keeps it — and anything it touches, including secrets — out of the
client bundle.

### 2.2 Data Flow & Component Interaction

Checkout is the representative path:

1. The browser posts product ids, quantities, delivery speed, payment method,
   shipping address and an idempotency key. **No prices and no total.**
2. CSRF middleware rejects the call if it did not originate from this site.
3. The validator coerces and bounds every field and drops unknown keys.
4. `requireUser()` resolves the caller from the session cookie.
5. A synchronous critical section re-reads every product, verifies stock,
   re-checks the idempotency key, recomputes all money, decrements stock and
   writes the order.
6. A DTO is assembled field by field, so no row internals escape.

### 2.3 Technology Stack Rationale

- **Backend / API:** TanStack Start server functions. Chosen because the
  frontend was already built on it — adding a separate Express service would
  have meant a second deployment target and hand-rolled CSRF for no benefit.
  Start's server functions already carry CSRF protection.
- **Frontend:** React 19 + Vite 8 (pre-existing, built by the team).
- **Persistence:** a hand-written JSON-backed store with zero dependencies.
  See ADR-001; this was **not** the first choice.
- **Authentication:** `scrypt` from `node:crypto`. Memory-hard, in the standard
  library, no native build. Argon2id would be marginally preferable but every
  implementation is a native dependency.
- **Sessions:** opaque random id in an `httpOnly` cookie, resolved server-side.
  Chosen over JWT specifically so sessions are revocable — see ADR-002.

### 2.4 Defense-in-Depth Security Controls

1. **Authentication.** scrypt (N=2^15) with a 16-byte per-user salt;
   `timingSafeEqual` comparison; a decoy hash computed on unknown emails so
   response time does not reveal account existence; per-IP rate limits.
2. **Authorization.** Three guards — `requireUser`, `requireRole`,
   `requireVendor` — plus three ownership helpers. Ownership failures report
   "not found" rather than "forbidden", so endpoints cannot be used to probe for
   valid ids. There is no fallback path anywhere; an unresolvable store is an
   error, never somebody else's store.
3. **Input validation.** Allow-list validators per endpoint. Fields the server
   owns (price, total, role, user id, vendor id, order status) have **no
   validator at all**, which makes them unrepresentable in a request rather than
   merely rejected.
4. **Rate limiting.** Fixed-window per-IP buckets on login, signup and checkout.
5. **Secrets hygiene.** No credential in source. `MH_ADMIN_PASSWORD` has no
   default, so an admin account cannot come into existence by accident.
   `data/` is gitignored because it holds hashes and live session ids.
6. **Integer money.** All amounts are integer paise end to end; rupee floats
   stop reconciling once summed.

---

## 3. Implementation Milestones & 24-Hour Timeline

| Milestone / Phase | Time Window | Key Objectives & Deliverables | Security Verification | Status |
|---|---|---|---|---|
| **Phase 1: Foundation & Setup** | 0h – 4h | Onboarding, repo setup, build toolchain authored for the existing app | Secret scan, `.gitignore` for env files | `Complete` |
| **Phase 2: Frontend** | 4h – 20h | All 18 routes, design system, nine previously-404 pages | Seller emails withheld from public pages; redirect allow-list on `/login` | `Complete` |
| **Phase 3: Backend & Hardening** | 20h – 23h | Server data layer, auth + sessions, authorization guards, server-authoritative checkout, orders, vendor scoping | 25 security tests; typecheck clean; all routes 200 | `Complete` |
| **Phase 4: Deployment & Freeze** | 23h – 24h | Live deployment, commit freeze in `metadata/submission.yaml` | Deployment URL check | `Pending` |

---

## 4. Architecture Decision Records (ADRs)

### ADR-001: JSON-backed store instead of SQLite

- **Status:** Accepted (under time pressure; revisit after the event)
- **Context:** The backend needed transactional guarantees for stock decrement
  and a uniqueness constraint for checkout idempotency. SQLite was the plan.
- **Options Considered:**
  1. `node:sqlite` — unavailable: this machine runs Node 20, where the module
     does not exist.
  2. `better-sqlite3` — needs a native toolchain build; the install timed out
     and would also have had to survive the Nitro bundle step.
  3. A hand-written store with zero dependencies.
- **Decision & Rationale:** Option 3, with ~2.5 hours to the freeze. A
  dependency that fails to compile on a teammate's machine is worse than no
  dependency. The guarantees that mattered were preserved rather than
  abandoned: Node is single-threaded, so a **synchronous** check-and-mutate
  block cannot be interleaved by a concurrent request — the same end state a
  SQL transaction gives on a single-process server. `tx()` makes that contract
  explicit and throws if its callback returns a promise. Uniqueness is enforced
  by `Map` indexes, which is exact.
- **Security & Performance Trade-offs:** No rollback, so every mutation follows
  validate-then-mutate — all checks throw first, then writes happen and cannot
  fail. Durability is weaker than WAL: persistence is a debounced atomic
  write-then-rename, so a crash can lose the last few milliseconds of writes,
  though it cannot corrupt the file. **The guarantee does not survive horizontal
  scaling** — two processes would each hold their own copy. Migrating to SQLite
  or Postgres is the first post-event task; the repository interface is narrow
  enough that only `src/lib/server/db.ts` changes.

### ADR-002: Server-side sessions instead of JWT

- **Status:** Accepted
- **Context:** The frontend previously stored `{name, email, role}` in
  `localStorage` and gated `/vendor` on it, so any visitor could grant
  themselves any role from devtools.
- **Options Considered:**
  1. Signed JWT carrying the role.
  2. Opaque session id, with identity resolved server-side per request.
- **Decision & Rationale:** Option 2. A JWT's role claim is a snapshot: a
  suspended seller keeps their access until the token expires, and fixing that
  needs a revocation list, which is a session table with extra steps. The cookie
  here carries 256 bits of CSPRNG output and nothing else, so there is no
  payload to tamper with and nothing to learn from stealing a decoded token.
- **Security & Performance Trade-offs:** A store read per request, which is
  trivial here. Account status is re-checked on every request, so suspension and
  sign-out take effect immediately. Cookie is `httpOnly` (an XSS foothold cannot
  read it), `SameSite=Strict` (second layer under the CSRF middleware), and
  `Secure` in production.

### ADR-003: Catalogue browsing stays client-side

- **Status:** Accepted
- **Context:** `src/lib/data.ts` is imported directly by 15+ components for
  product and category data, including Vite image asset imports.
- **Decision & Rationale:** Left in place. The catalogue is public, so serving
  it from the client leaks nothing, and product imagery genuinely cannot live in
  a data row. Only the figures that carry authority — price, stock, ownership —
  moved server-side. Rewriting every browse page would have consumed the time
  the security work needed, for no security gain.
- **Trade-offs:** The browse pages can show a stale stock number after a
  purchase. `getQuote` reports the true availability, and `placeOrder` is strict,
  so the worst case is a corrected message at checkout rather than an oversell.

---

## 5. Engineering Journal & Real-Time Decision Log

### [2026-10-05 13:00 IST] Entry 1: Onboarding and toolchain
- **Focus:** Agreement recorded; the app had no `package.json`, Vite config or
  lockfile.
- **Key Challenges:** Nitro's Vite plugin requires Vite 8, and
  `resolve.tsconfigPaths` is inert on Vite 7.
- **Resolution:** Authored the toolchain, moved to Vite 8, used an explicit
  `resolve.alias` so dev, build and vitest resolve `@/` identically.

### [2026-10-05 14:40 – 20:00 IST] Entry 2: The nine missing pages
- **Focus:** Nine routes were linked from the UI but had no file and returned 404.
- **Resolution:** Built all nine from existing design primitives only. Notable
  security decision: seller email addresses exist in the seed data and were
  deliberately withheld from the public `/vendors` directory, since publishing
  them hands over a scrapeable list of seller contacts.

### [2026-10-06 07:49 IST] Entry 3: Backend audit
- **Focus:** Establish what existed before writing anything.
- **Key Challenges:** Only one server function existed (`askHubby`); all
  marketplace state was client-side. Eleven conflicts recorded, the sharpest
  being the client-side role picker, browser-computed order totals, and
  `useMyVendor()`'s fallback to another seller's store.
- **Resolution:** Scope cut to P0+P1 and agreed before implementation.

### [2026-10-06 08:00 – 09:15 IST] Entry 4: Backend implementation
- **Focus:** Data layer, auth, sessions, guards, checkout, orders, vendor scoping.
- **Key Challenges:** Three environment failures ate roughly 50 minutes.
  (a) Node 20 has no `node:sqlite`. (b) `better-sqlite3` install timed out.
  (c) `npm install` failed repeatedly with `UNABLE_TO_VERIFY_LEAF_SIGNATURE` on
  every tarball — TLS interception by a local proxy or AV, which npm reported
  misleadingly as `Exit handler never called!`.
- **Resolution:** (a)+(b) → ADR-001. (c) → exported the Windows trust store to a
  PEM bundle and passed it via `npm_config_cafile`, which fixed the fetches
  **without** disabling certificate verification. `strict-ssl false` was
  considered and rejected: turning off TLS verification to install dependencies
  is precisely the kind of shortcut this competition is about not taking.

---

## 6. Testing, Security Verification & Deployment Record

### 6.1 Testing & Security Verification Strategy

- **Security tests — 25, all passing** (`src/test/backend.test.ts`). These
  target the rules the client is not allowed to decide, not line coverage:
  - *Pricing is authoritative:* totals derive from stored rows; delivery
    threshold and express fee correct; totals are exact integers; discount comes
    from stored MRP.
  - *Stock:* decrements by exactly the quantity ordered; refuses to oversell;
    leaves stock untouched when an order is rejected; never goes negative across
    20 competing orders.
  - *Idempotency:* a replayed key returns the original order and does not
    decrement stock twice; keys are scoped per user, so one shopper cannot use a
    key to fetch another's order.
  - *Authorization / IDOR:* a shopper gets their own order; another shopper's
    order reports "not found"; a product from another store reports "not found";
    a seller gets an order only when they have a line in it.
  - *Response shaping:* a seller's view omits other sellers' lines and the grand
    total; shopper street address, PIN and phone are absent from it; password
    hash, salt, user id and idempotency key never serialise to a shopper.
  - *Credentials:* correct password verifies, wrong one does not; identical
    passwords do not share a hash; plaintext is never stored.
- **Static analysis:** `npx tsc --noEmit` reports **zero errors** across all new
  and modified files. Two pre-existing failures remain in
  `src/components/ui/chart.tsx` and `calendar.tsx` — stale shadcn wrappers
  versus the installed `recharts` / `react-day-picker` majors. Neither file is
  imported by any route.
- **Route smoke test:** all 10 significant routes return HTTP 200 with correct
  titles and no error page, including the signed-out gates on `/checkout`,
  `/orders` and `/account`.
- **Build:** `npm run build` completes and emits `.output/server/index.mjs`.

### 6.2 End-to-End Security Harness — 110 checks, all passing

`scripts/e2e.mjs` closes the gap the unit tests cannot reach. It drives the real
HTTP endpoints against a running production build with a real cookie jar,
speaking the framework's own seroval wire format, so a pass means a real browser
would behave the same way. Run instructions are in the README.

What it proves, grouped:

- **CSRF (4):** a request carrying no `Origin`, `Referer` or `Sec-Fetch-Site` is
  rejected with 403; `Sec-Fetch-Site: cross-site` is rejected; a foreign `Origin`
  is rejected; a same-origin request is allowed through. The middleware is
  default-deny, which is the strong posture.
- **Privilege escalation (7):** `role: "admin"` in the signup body is ignored and
  the account is created as a customer; a forged `id` is ignored; duplicate
  email, weak password and malformed email are all rejected.
- **Session cookie (6):** `HttpOnly`, `Secure`, `SameSite=Strict` and `Path=/`
  are all present on the production build; the cookie value carries no readable
  identity.
- **Authentication (5):** a forged session id is not accepted; `me()` reports
  nobody without a cookie; order history requires a session; no password
  material is ever serialised.
- **Enumeration resistance:** a wrong password and an unknown email return the
  identical message, and neither reveals which half was wrong.
- **Pricing (9):** unit price, subtotal, GST, delivery threshold and express fee
  all come from stored rows; injected `price`, `unitPricePaise`, `totalPaise`,
  `subtotalPaise` and `discountPaise` fields change nothing.
- **Input validation (9):** quantity zero, negative, absurd and non-integer are
  rejected; duplicate product lines, an empty cart, a non-array `items` and an
  unknown delivery speed are rejected.
- **Checkout (13):** a session is required; injected `total`, `status`, `payment`
  and `userId` are ignored; order ids match `MH-[0-9A-F]{10}`; stock decrements
  by exactly the quantity ordered; a replayed idempotency key returns the
  original order and does **not** decrement stock twice; an out-of-stock product
  cannot be bought; invalid addresses and unknown payment methods are rejected.
- **IDOR (11):** a second shopper sees an empty history; another shopper's order
  id is refused by every order endpoint, the refusal never confirms the order
  exists, and no order data is echoed back.
- **Order state machine (9):** cancelling restores stock and sets `Refunded`;
  cancelling twice is idempotent rather than an error; an unknown order id
  reports not found; a **shipped** order can no longer be cancelled; a
  **delivered** order can neither be cancelled nor advanced further.
- **Vendor isolation (12):** each seller sees only their own store and listings;
  a seller cannot advance an order containing none of their products and the
  refusal does not confirm it exists; the seller's view carries only their own
  line and omits the shopper's street address, PIN and phone; no owner email or
  password material appears.
- **Error handling (5):** no stack traces, absolute filesystem paths, source file
  names, internal module names or secret-looking values in any error body,
  probed across every endpoint with deliberately malformed input.
- **Logout (2):** the cookie is cleared **and** replaying the original session id
  is rejected, proving revocation is server-side rather than cosmetic.
- **Rate limiting (1):** repeated failed logins are throttled (observed at 11
  attempts). Runs last, because it deliberately exhausts the bucket.

Two findings came out of building the harness, both resolved:
- An early run reported an enumeration mismatch. The cause was the login rate
  limiter engaging across repeated runs against one long-lived process — the
  control working correctly, not a defect. The harness now detects and reports
  that condition instead of mis-attributing it.
- One assertion demanded "not found" from all three order endpoints. The seller
  endpoint correctly answers "you do not have access" first, because
  `requireRole("vendor")` trips before it ever looks at the order — which
  reveals nothing about the order. The assertion was too blunt and was corrected
  to test the property that matters: refuses, and never confirms existence.

### 6.3 Remaining Verification Gaps

- **No genuine parallel-concurrency test.** The single-threaded atomicity
  argument is sound by construction and is covered by a sequential 20-order
  drain test plus the idempotency replay test, but nothing launches truly
  simultaneous requests.
- **Local development runs on Node 20**, while `@tanstack/start-server-core`
  declares `node >=22.12.0`. `engines` has been corrected to `>=22.12.0` so a
  deployment provisions a supported runtime, but the machine used to build this
  is outside that range.
- **No browser-driven UI test.** The harness exercises the API surface, not
  React rendering or hydration. Route-level smoke tests confirm every page
  returns 200 with no error page, in both dev and production builds.

### 6.4 Deployment Verification

- **Live Deployment Platform:** not yet deployed.
- **Deployment URL:** pending — record in `metadata/submission.yaml` and
  `deployment/README.md`.
- **Health Check Endpoint:** none dedicated. `/` returns 200 and serves as the
  health check.
- **Pre-deploy requirements**, in order of importance:
  1. **Point `MH_DATA_FILE` at a persistent volume.** The default path sits
     inside the deployed bundle, so on an ephemeral filesystem every account and
     order is lost on restart. This is the highest-impact deployment setting.
  2. **Provision Node 22.12+**, now declared in `engines`.
  3. **Leave `MH_ADMIN_PASSWORD` unset** unless an admin account is wanted.
  4. `NODE_ENV` does **not** need setting for cookie security — corrected from an
     earlier claim in this document. Vite inlines it as `"production"` at build
     time, so the built server always sets `Secure`. Verified by inspecting the
     raw `Set-Cookie` from the production bundle with `NODE_ENV` unset.
