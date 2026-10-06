# Project Approach & Architecture — Build Secure 24

**Team ID:** 51
**Project Name:** MarketHub — secure multi-vendor marketplace
**Team Size:** 4 Members (Abhinav Rangoju, Vivek Rajoju, Rohit Bhalkikar, Mani Kanta Sarapu)
**Primary Track / Domain:** Secure multi-vendor e-commerce — a marketplace where mutually untrusting sellers, their customers and platform administrators share one storefront, plus an in-app AI shopping assistant

> **Reading note for evaluators.** This document is the architecture and decision record. The authoritative, per-control security specification lives in [`SECURITY_ARCHITECTURE.md`](../SECURITY_ARCHITECTURE.md) at the repository root. A plain-English, non-technical explanation of the whole product is in [`docs/DOCUMENTATION.md`](DOCUMENTATION.md). The full turn-by-turn build history, including every failure and every verification command, is in [`docs/logs.txt`](logs.txt). Deployment instructions are in [`deployment/README.md`](../deployment/README.md). Where a control is incomplete, this document says so.

> **Document provenance.** This file is the reconciled union of two branches that were written in parallel and merged on 2026-10-06: the `Security` branch (threat model, AI assistant surface, ADR set, engineering journal) and the `main` line of development (the implemented server-side backend, its 25 unit tests and its 110-check end-to-end harness). Where the two disagreed on whether a control was finished, the more current and more conservative statement was kept. See §5 Entry 14.

---

## 1. Problem Understanding, Scope & Threat Model

### 1.1 Problem Statement & Real-World Motivation

A multi-vendor marketplace is the hardest common case in web commerce because it has no single trusted tenant. One storefront hosts many independent sellers who are commercial rivals, each uploading their own listings, prices and copy, each able to see part of a shared order pipeline. The customer trusts the platform, not the sellers. The sellers trust the platform, not each other. The platform therefore has to be the only authority in the system.

Put another way: mutually distrusting parties share one data store, and each has a reason to want data they are not entitled to. A seller would like to see what competitors are selling and who is buying it. A shopper would like to pay less than the asking price. Anyone at all would like to read someone else's order history. That makes the interesting problem an **authorization** problem, not an authentication one. Logging in is the easy half; deciding what an authenticated party may then see and do is where marketplaces actually leak.

MarketHub implements that storefront: 12 seeded products across 8 categories from 8 independent sellers, a cart and a four-step simulated checkout with real Indian commerce rules (free delivery at a ₹999 subtotal else ₹79, 5% GST, Standard free versus Express ₹149, 7-day returns, 8% seller commission), order tracking, a seller onboarding application, a vendor dashboard, and Hubby — an AI shopping assistant grounded in the live catalogue.

The security problem that follows is concrete, not theoretical:

- **Horizontal isolation.** Seller A must never read seller B's orders, listings or payouts. Customer X must never read customer Y's order history or postal address.
- **Vertical isolation.** A visitor must not be able to become a seller, and a seller must not be able to become an admin, by asserting it.
- **Price and total integrity.** Money is computed from stored catalogue rows, not from what the browser submits. A marketplace that accepts a client-supplied total is a marketplace that sells laptops for ₹1.
- **Seller PII is a target in its own right.** A public directory that lists seller contact addresses is a ready-made phishing list aimed at the marketplace's own revenue base.
- **The AI assistant is an attacker-reachable component.** It takes free-form text from anonymous visitors, spends real money per call, and returns text that the UI is tempted to trust.

### 1.2 Target Users & Personas

| Persona | Role id | Trust level | Workflow / what they may do | What they must never reach |
|---|---|---|---|---|
| **Anonymous visitor** | — | Untrusted | Browse `/`, `/shop`, `/categories`, `/deals`, `/vendors`, `/product/$id`; build a local cart; get a price quote; ask Hubby | Any account, order, address, seller back-office, or seller contact detail |
| **Customer / shopper** | `customer` | Authenticated, lowest privilege | `/login` → `/account`, `/orders`, `/notifications`, `/cart`, `/checkout`. Place orders; read and cancel **their own** orders | Another customer's orders or addresses; any seller or admin surface |
| **Vendor (seller)** | `vendor` | Authenticated, scoped to own store | `/vendor-register` application → `/vendor` dashboard. Read **their own** listings and only the lines of orders containing their products; advance those orders | Another seller's data; a shopper's full address or phone; platform-wide order totals |
| **Admin / operator** | `admin` | Highest privilege, created only by deliberate configuration | Verification of sellers, dispute and audit review | — the role exists and is enforced server-side, but **no admin endpoints are exposed in this build**; see §6.3 |

The sign-in role picker that originally let a visitor choose their own persona **has been removed**. The `signup` server function takes no role parameter at all, and the role is assigned server-side and re-read from the session on every request. See §2.4 and ADR-004.

### 1.3 Threat Model & Attack Surface

**Trust boundary.** Exactly one: the server function call. Everything on the browser side of it — including the cart and the wishlist — is attacker-controlled input. The project treats the React application as a convenient renderer with no authority.

**Critical assets**

| Asset | Where it lives | Exposure |
|---|---|---|
| Password hashes and salts | `data/markethub.json`, written by `src/lib/server/password.ts` | Server-only; never serialised to any client |
| Session / identity | Server-side session records, `src/lib/server/session.ts`; opaque id in an `httpOnly` cookie | Not forgeable; no identity in `localStorage` |
| Customer PII (name, phone, postal address) | Order rows; `/account` address book | Server-side; stripped from any seller-facing DTO |
| Order history | `src/lib/api/orders.ts` | Filtered by session user; other users' rows report "not found" |
| Seller business identity (GSTIN, PAN) | `src/routes/vendor-register.tsx` | Collected, never displayed publicly |
| Seller contact data (`owner`, `email` in `src/lib/data.ts`) | Withheld from `/vendors` and from the AI prompt | Not exposed |
| Per-seller revenue, payout and commission figures | `src/lib/server/dto.ts`, `src/routes/vendor.tsx` | Behind a server-side role check; grand total stripped |
| Catalogue prices and stock levels | Stored rows; `src/lib/server/pricing.ts` | Authoritative server-side; client figures carry no authority |
| `GEMINI_API_KEY`, `MH_ADMIN_PASSWORD` | Server process env only | Verified absent from the client bundle; `MH_ADMIN_PASSWORD` has no default |

**Attack vectors, mapped to real files**

| Vector | Control | Location |
|---|---|---|
| Privilege escalation via client-chosen role | `signup` has no role parameter; role assigned server-side and read from the session on every request | `src/lib/api/auth.ts`, `src/lib/server/session.ts` |
| Price / total tampering | Totals recomputed from stored rows; no validator accepts a price | `src/lib/server/pricing.ts`, `src/lib/api/checkout.ts` |
| IDOR on orders | No endpoint accepts a user id; lookups filter by session user and answer "not found" for other people's rows | `src/lib/server/guards.ts` |
| Cross-tenant leakage between sellers | Store resolved by `userId`; other sellers' lines, the grand total and shopper PII stripped before serialisation | `src/lib/server/dto.ts` |
| Double-charge on checkout | Per-user unique idempotency key; replay returns the original order | `src/lib/api/checkout.ts` |
| Overselling / stock races | Check and decrement inside one synchronous critical section | `src/lib/server/db.ts` (`tx`) |
| Order-state forgery | Transitions computed from current state; the request cannot name a destination | `src/lib/api/orders.ts`, `src/lib/api/vendor.ts` |
| Credential stuffing | Fixed-window per-IP rate limit on login, signup and checkout | `src/lib/server/ratelimit.ts` |
| Account enumeration | One message for bad email and bad password, plus a decoy hash to equalise timing | `src/lib/server/password.ts` (`fakeVerify`) |
| Session theft via XSS | `httpOnly` session cookie; no identity in `localStorage` | `src/lib/server/session.ts` |
| Cross-site request forgery | Framework CSRF middleware over all server functions, plus `SameSite=Strict` | `src/start.ts` |
| Information disclosure via errors | Only curated `AppError` messages escape; everything else logged server-side and replaced | `src/lib/server/validate.ts` (`guarded`) |
| Open redirect / phishing hop | `safeRedirect()` accepts only single-slash absolute paths, rejecting `https://`, protocol-relative `//host` and `/\host` | `src/routes/login.tsx` |
| Stored XSS via seller-supplied text | All listing and policy text renders through React's escaping JSX path; no `dangerouslySetInnerHTML` on user or seller data; the static 500 page interpolates no request data | `src/lib/error-page.ts` |
| Search index leakage | `noindex, nofollow` on `/account`, `/orders`, `/notifications`, `/vendor` | route modules |
| Seller contact scraping | Seller emails exist in the data model and render nowhere public | ADR-008 |
| Supply chain | `npm ci` installs lockfile-exact; no external repository is cloned or vendored into `src/` | `package-lock.json` |

**AI-assistant-specific attack surface** (`src/lib/hubby/*`)

| Vector | Control | File |
|---|---|---|
| Prompt injection / system-prompt extraction | Shopper text wrapped in a `<shopper_message>` delimiter; forged closing tags stripped; refusal verified live against the model | `prompt.ts`, `ask.ts` |
| Model output treated as trusted content | Every product ID the model returns is re-resolved against the real catalogue, deduplicated and capped at 3; price, image, seller and rating render from `src/lib/data.ts`, never from the model | `ask.ts` → `validateProductIds()` |
| Data exfiltration through the prompt | Seller `owner` and `email` are never serialised into the grounding snapshot — asserted against all 8 seed sellers | `catalog.ts` |
| Quota drain / cost DoS | In-process fixed-window limiter, 12 requests per client per 60s, keyed on `getRequestIP({ xForwardedFor: true })` | `ask.ts` → `rateLimited()` |
| Secret exposure through the bundle | Key read inside the handler behind `await import("./gemini")`; env vars deliberately not `VITE_`-prefixed. Built client bundle scanned for 7 secret and prompt patterns: 0 hits | `ask.ts`, `gemini.ts` |
| Unbounded input | Non-empty string, control characters stripped, 500-char cap, history clamped to 8 turns × 400 chars | `ask.ts` → `validateAsk()`, `contract.ts` |
| Upstream failure as an outage | 429/503 retried once, then classified and answered by a no-network keyword matcher with a visible notice | `ask.ts`, `offline.ts` |

**OWASP Top 10 (2021) status**

| ID | Relevance to MarketHub | Status |
|---|---|---|
| A01 Broken Access Control | The guards and DTO layer: three guards (`requireUser`, `requireRole`, `requireVendor`) plus three ownership helpers; no endpoint accepts a user id | **Addressed** — server-side roles and ownership; verified by 11 IDOR and 12 vendor-isolation checks |
| A02 Cryptographic Failures | `scrypt` with per-user salts and constant-time comparison; 256-bit CSPRNG session ids | **Addressed** |
| A03 Injection | No SQL and no shell in the stack; all input through allow-list validators. XSS surface handled by React escaping; LLM prompt injection handled structurally | **Addressed** |
| A04 Insecure Design | Client-authoritative money and self-asserted identity were design-level faults, not bugs | **Addressed** — server-authoritative pricing and state machines |
| A05 Security Misconfiguration | CSRF middleware registered in `src/start.ts`, default-deny; session cookie flags verified on the production build | **Addressed** |
| A06 Vulnerable & Outdated Components | `npm ci` lockfile-exact, `npm audit` 0 vulnerabilities; 11 typecheck errors in two unused shadcn wrappers | **Addressed, with known inert drift** |
| A07 Identification & Authentication Failures | Per-IP rate limiting, enumeration resistance with a decoy hash, server-side revocable sessions | **Addressed** |
| A08 Software & Data Integrity Failures | Live authorship only, no vendored external repo, pinned lockfile | **Addressed** |
| A09 Security Logging & Monitoring Failures | Global error middleware logs server-side and returns curated messages only; no structured security event stream | **Partial** |
| A10 SSRF | One outbound call, to a fixed Gemini endpoint. No user-controlled URL is ever fetched | **Not applicable by design** |

**Explicitly out of scope:** payment processing (no gateway is contacted), email verification and password reset, and admin tooling.

---

## 2. Technical Architecture & Secure System Design

### 2.1 High-Level Architecture Overview

MarketHub is a single deployable artifact, not a microservice fleet. There is no separate API service.

```
┌─ TB1 ─ Untrusted: the browser ───────────────────────────────────────┐
│  SSR'd HTML, then a hydrated React 19 SPA (TanStack Router).         │
│  Cart and wishlist in localStorage — convenience only, ZERO          │
│  authority. Everything it sends is attacker-controlled by definition.│
└──────────────────────────────┬───────────────────────────────────────┘
                               │ HTTPS
┌─ TB2 ─ nitro server process (Node) ──────────────────────────────────┐
│  src/server.ts → src/start.ts                                        │
│    requestMiddleware: [ errorMiddleware, csrfMiddleware ]            │
│      · errorMiddleware   — rethrows HTTP errors, logs the rest,      │
│                            returns a static 500 page, never a stack  │
│      · csrfMiddleware    — default-deny over all server functions    │
│                                                                      │
│  Server functions  src/lib/api/*   ← the ONLY write path             │
│    validate → authenticate → authorize → act                         │
│    · auth.ts · checkout.ts · orders.ts · vendor.ts                   │
│    · src/lib/hubby/ask.ts  askHubby (POST, validated, rate-limited)  │
│                                                                      │
│  Server core       src/lib/server/*  ← never reaches the browser     │
│    db · pricing · password · session · guards · dto · validate       │
│    · ratelimit · seed                                                │
└──────────────┬──────────────────────────────────┬────────────────────┘
               │                                  │ outbound HTTPS
┌─ TB3 ─ JSON store ────────────┐   ┌─ TB4 ─ Google Gemini ───────────┐
│  data/markethub.json          │   │  generativelanguage.googleapis  │
│  debounced atomic write-then- │   │  Untrusted output. Fixed URL.   │
│  rename, gitignored. Accounts,│   │  Key never leaves TB2.          │
│  sessions, orders, stock.     │   │                                 │
└───────────────────────────────┘   └─────────────────────────────────┘
```

`src/lib/server/*` is reached only through `await import()` inside a handler body, which keeps it — and anything it touches, including secrets — out of the client bundle entirely.

The architecturally important property is that server functions are the **only** write path. A control placed in middleware cannot be routed around, because there is no other endpoint. There is no database server, no Redis, no reverse proxy and no container orchestration: a deliberate, time-boxed choice defended in §2.3, ADR-007 and ADR-009.

### 2.2 Data Flow & Component Interaction

**Read path (browse).** Request → nitro → `errorMiddleware` → route loader → catalogue read from `src/lib/data.ts` → SSR HTML → hydration. No user data crosses TB2 inbound, so this path is cacheable and safe for anonymous traffic. Verified: 18/18 routes return the correct SSR `<title>` and `/nope-404` returns a real 404.

**Write path (every mutation).** Checkout is the representative case:

1. The browser posts product ids, quantities, delivery speed, payment method, shipping address and an idempotency key. **No prices and no total.**
2. CSRF middleware rejects the call if it did not originate from this site.
3. The validator coerces and bounds every field and drops unknown keys.
4. `requireUser()` resolves the caller from the session cookie — **never from the request body**.
5. A synchronous critical section re-reads every product, verifies stock, re-checks the idempotency key, recomputes all money, decrements stock and writes the order.
6. A DTO is assembled field by field, so no row internals escape.

**AI path.** Browser → `askHubby` (POST, CSRF-protected) → rate limiter → input validation and control-character stripping → `await import("./gemini")` pulls the transport and the key into scope server-side only → grounding snapshot built from the catalogue with seller PII excluded → HTTPS to Gemini → response parsed, product IDs re-resolved against the real catalogue, reply truncated → client renders cards from local data using validated IDs only. Two trust boundaries are crossed in one request (TB1 inbound, TB4 outbound) and both directions are treated as untrusted.

**Trust boundaries, named.** TB1 browser→server: validate, authenticate, authorise. TB2→TB3 server→disk: atomic write, no interpolation of untrusted strings into paths. TB2→TB4 server→Gemini: no secrets or PII in the payload. TB4→TB2 Gemini→server: output is data, re-resolved against local truth before it can reach a user.

### 2.3 Technology Stack Rationale

- **Backend / API framework: TanStack Start server functions (`createServerFn`) on nitro.** *Why chosen:* the frontend was already built on it, the global middleware hook and a working CSRF middleware already existed in this repository, and it keeps one build and one deploy artifact. *Rejected:* a separate **Express** or **NestJS** service — a second process, a second deploy target, cross-origin/CORS plumbing, hand-rolled CSRF and its own session transport, for no control we cannot implement here. The first audit of this repo wrongly concluded no server boundary existed (it searched for `*.server.ts` filenames; Start server functions live in ordinary `.ts` modules), which inflated the cost of this option before the error was caught and recorded. See ADR-002.
- **Frontend / client: React 19 + TanStack Router (SSR + hydration), Vite 8, Tailwind CSS 4, shadcn/ui.** *Why chosen:* inherited from the existing `src/` tree; typed routing gives compile-time detection of dead links, which is how the nine unbuilt routes were found. **Vite 8 specifically** was forced: the nitro build plugin requires `^8`, and `@vitejs/plugin-react` 6 peers `^8`. *Rejected:* **Next.js** — the original security document assumed it, but the app was already written against TanStack Start and a framework migration inside 24 hours would have spent the whole budget. **`resolve.tsconfigPaths`** was rejected in favour of an explicit `resolve.alias`, because it is a Vite 8 feature that was silently inert on 7 and broke every `@/` import. See ADR-001.
- **Database & persistence: a hand-written JSON-backed store with zero dependencies, at `data/markethub.json`, debounced atomic write-then-rename, gitignored.** *Why chosen:* no managed database is available to this team inside the hackathon window, and a store that works on a laptop and on a single Node host is the only thing that can be demonstrated end-to-end. *Rejected:* **PostgreSQL + Prisma** (no instance, no migration budget, and the original document's Row-Level Security design presumes one), **Redis** for rate-limit and lockout counters (second service; the in-process limiter already proves the pattern), and **SQLite** — which was in fact the first choice and failed on the environment: `node:sqlite` does not exist on Node 20, and the `better-sqlite3` native build timed out. Residual risk is stated plainly in ADR-007.
- **Authentication & cryptography: `node:crypto` `scrypt` (N=2^15) with a 16-byte per-user salt and `timingSafeEqual` comparison; `crypto.randomBytes` for 256-bit session ids; server-side session records in `httpOnly` cookies.** *Why chosen:* `scrypt` is in the Node standard library, is memory-hard, and needs no compiler. *Rejected:* **bcrypt** and **argon2** — Argon2id would be marginally preferable, but every implementation is a native dependency, and native builds on Windows were a demonstrated hard stop for part of this team. **JWTs carrying role claims** were rejected because they cannot be revoked at sign-out without inventing a server-side denylist anyway. See ADR-003 and ADR-004.
- **Money: integer paise end to end.** Rupee floats stop reconciling once summed, so no float ever represents money.
- **AI: Google Gemini over plain `fetch`, no SDK.** *Why chosen:* one REST call, zero new dependencies, nothing between our code and the wire. *Rejected:* the official SDK (extra supply-chain surface for a single endpoint) and a `VITE_`-prefixed key (would publish a billable key to every visitor).
- **Testing: vitest 4 + jsdom for unit tests, a hand-written Node harness (`scripts/e2e.mjs`) for end-to-end HTTP checks, plus HTTP route probes and real headless-Chrome CDP checks.** *Why chosen:* vitest shares the Vite config and alias, so tests resolve modules identically to the app. The e2e harness speaks the framework's own seroval wire format against a running production build with a real cookie jar, so a pass means a real browser would behave the same way.

### 2.4 Defense-in-Depth Security Controls

Per-control detail, with the implementing symbol and the test that proves it, is in the conformance matrix in [`SECURITY_ARCHITECTURE.md`](../SECURITY_ARCHITECTURE.md). Summary:

1. **Authentication.** `scrypt` (N=2^15) with a 16-byte per-user salt and `timingSafeEqual` comparison; a decoy hash (`fakeVerify`) computed on unknown emails so response time does not reveal account existence; one identical message for a bad email and a bad password; per-IP fixed-window rate limits on login and signup. Open-redirect validation on the post-login destination (`safeRedirect()`, verified against 4 hostile values). Logout clears the address book as well as the session, because postal addresses and phone numbers should not survive a sign-out on a shared machine, **and** revokes the session server-side — verified by replaying the original session id after logout and being rejected. The "Continue with Google" button states in the UI that it is simulated and contacts no Google account.
2. **Authorization & access control.** Three guards — `requireUser`, `requireRole`, `requireVendor` — plus three ownership helpers. Roles are stored server-side and never accepted from a request body. Ownership failures report **"not found" rather than "forbidden"**, so endpoints cannot be used to probe for valid ids. There is no fallback path anywhere; an unresolvable store is an error, never somebody else's store. Per-account order scoping; `noindex, nofollow` on the four personal/seller routes; the seller order view shows destination city and contents, not the shopper's full address; no bank account or IFSC field exists on `/vendor-register`. Admin provisioning is out-of-band only.
3. **Input validation & sanitisation.** Allow-list validators per endpoint. Fields the server owns — price, total, role, user id, vendor id, order status — have **no validator at all**, which makes them unrepresentable in a request rather than merely rejected. `validateAsk()` in `src/lib/hubby/ask.ts` is a hand-rolled allow-list (type check, control-character strip, 500-char cap, history clamped to 8 × 400), and `validateProductIds()` applies the same posture to the model's *output*. `validateSearch` on `/login` and `/vendors` narrows URL search params to known shapes, with an unknown `?v=` falling through to the directory rather than erroring. GSTIN, PAN, Indian PIN and phone formats are validated on the seller and address forms. There is no SQL in the system, so there is no parameterisation to get wrong.
4. **Rate limiting & abuse prevention.** Fixed-window per-IP buckets on login, signup and checkout. A separate per-client limiter on `askHubby`, 12 requests per 60 seconds with map eviction, because every call spends real money; upstream 429/503 degrade to the offline matcher instead of erroring. *Documented limitation:* the limiters are per-process and reset on restart, so horizontal scaling would require a shared counter.
5. **Secrets & configuration hygiene.** Zero hardcoded credentials in `src/`. `.gitignore` excludes `.env*` while allowing `.env.example`, and excludes `data/` because it holds password hashes and live session ids. `git check-ignore -v .env` was used to confirm the real key file was ignored before committing, and files were staged by name rather than with `git add -A` so the exclusion was explicit. `GEMINI_API_KEY` is read only inside the server handler behind a dynamic import; no file under `src/` references `import.meta.env` or any `VITE_`-prefixed variable; the built client bundle (26 files) was scanned for `GEMINI_API_KEY`, `generativelanguage`, `x-goog-api-key` and four prompt fingerprints with 0 hits, against 5/1/1/1 hits in `.output/server` where they belong. `MH_ADMIN_PASSWORD` has no default, so an admin account cannot come into existence by accident.
6. **Error handling.** Only curated `AppError` messages escape to a caller; everything else is logged server-side and replaced. Probed across every endpoint with deliberately malformed input for stack traces, absolute filesystem paths, source file names, internal module names and secret-looking values.
7. **Integer money.** All amounts are integer paise end to end, recomputed from stored rows on every quote and every order.

---

## 3. Implementation Milestones & 24-Hour Timeline

At a coarse grain the 24 hours divided into four phases: **Foundation & setup** (0–4h, onboarding and the build toolchain), **Frontend** (4–20h, all 18 routes and the design system), **Backend & hardening** (20–23h, the server data layer, auth, guards and server-authoritative checkout), and **Deployment & freeze** (23–24h, still pending at the time of writing). The detailed record follows.

All times IST. Reconstructed from [`docs/logs.txt`](logs.txt); commit SHAs verified against `git log`.

| Milestone / Phase | Time Window | Key Objectives & Deliverables | Security Verification | Status |
|---|---|---|---|---|
| **P1: Onboarding & repo audit** | 13:00 – 13:04 | AGENTS.md contract read, agreement recorded, repository audited | Found the entire build toolchain absent; confirmed `src/` untracked; no secrets in tree | `Complete` |
| **P2: Build toolchain & bring-up** | 13:04 – 14:13 | `package.json`, `vite.config.ts`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`; 344 packages; dev + production server up (`9f6a202`, `d6f1806`) | `npm audit` 0 vulnerabilities; `.gitignore` excludes `.env*`; 7 SSR route probes + two deliberate 404 checks | `Complete` |
| **P3: Browse surface** | 14:40 – 15:15 | `/categories` (`bee2edd`), `/deals` (`fe57515`), `/vendors` + per-seller store (`99dc064`) | 3 known seller emails asserted absent from directory, populated-store and pending-store HTML; SSR-safe countdown asserted as exactly 4 `--` placeholders; `?v=nope` falls back to the directory with a byte-identical response | `Complete` |
| **P4: Auth stage visuals** | 15:34 – 15:36 | Blurred themed login stage (`1d818e3`) | A/B headless-Chrome screenshots proved the 420px card clipping was pre-existing, not introduced; confirmed no diagnostic markers shipped | `Complete` |
| **P5: Hubby grounded in the catalogue** | 16:28 – 16:34 | 6 modules under `src/lib/hubby/`, `AIAssistant.tsx` rewritten against the server function, `.env.example` (`a7fb2a9`) | Client bundle scanned for 7 secret/prompt patterns — 0 hits; 4 live catalogue questions answered with correct prices and stock; prompt-extraction attempt refused cleanly; model-returned IDs re-resolved against the catalogue | `Complete (with a noted gap: 3 of 5 adversarial probes hit 429 quota and remain unverified at the model layer; defended structurally)` |
| **P6: Account, vendor & policy surface** | 21:05 – 21:07 | 9 routes (`/orders`, `/account`, `/notifications`, `/vendor`, `/vendor-register`, 4 policy pages), `RequireAuth`, `LegalPage`, `lib/legal`, `lib/notifications`, and the fix that made sign-in actually create a session (`aac16ce`) | 25 HTTP route probes; 22 real-Chrome CDP render checks across signed-out/shopper/seller; 9 CDP security checks — cross-account order read returns "No orders yet" and leaks no order ID; open-redirect guard held against 4 hostile values; typecheck 22 → 11 | `Complete` |
| **P7: Submission metadata** | 21:14 | `metadata/team.yaml` (team 51, Trishul, 4 members, repository URL) and `team_id` + `repository` in `metadata/submission.yaml` (`67d088c`) | Team size 4 satisfies the exactly-2-or-4 rule; `git remote get-url origin` confirmed to already match the team repository | `Complete` |
| **P8: Full frontend verification** | 23:25 | Fresh-clone `npm ci` (343 packages), dev server, production build, 18 route probes (`c918a44`, `2f05975`) | 18/18 routes 200 with asserted SSR titles, `/nope-404` correctly 404; `npm test` 1/1; build exit 0; typecheck still 11, unchanged → nothing regressed; first build's exit -1 root-caused to a teammate's mid-build branch switch, not to code | `Complete` |
| **P9: Security scope lock & stack audit** | 00:05 – 00:14 | All security work confined to the `Security` branch; stack reconciled against reality; the false "no server boundary" finding corrected in the log | `git rev-parse --abbrev-ref HEAD` = `Security` confirmed before any change; found global CSRF + error middleware already registered in `src/start.ts` and a validated, rate-limited POST server function in `src/lib/hubby/ask.ts` | `Complete` |
| **P10: Security architecture reconciliation & design** | 00:16 – 00:30 | Rewrite `SECURITY_ARCHITECTURE.md` against the real stack with an auditable conformance matrix; author the hardening design (`.agents/tasks/security-hardening-2026-10-06/design.md`, 974 lines) covering scrypt auth, revocable sessions, server-side roles and ownership, allow-list validation, server-authoritative totals, rate limiting, security headers and atomic persistence | Design specified 11 executed attack tests as the required evidence: role forgery in the body, cross-account order read, CSRF with forged/absent token, tampered price/total/quantity, sign-in brute force, `Set-Cookie` flag inspection, logged-out session replay, client-bundle secret grep, stored-XSS payload rendered inert, open-redirect, live response headers | `Complete (design + document; on the Security branch)` |
| **P11: Submission documentation** | 00:27 – 11:00 | `docs/APPROACH.md` (this file), `deployment/README.md`, and `docs/DOCUMENTATION.md` — a 1,456-line plain-English explanation of the whole product for non-technical evaluators | Every claim cross-checked against `docs/logs.txt`, `git log`, and the source files named | `Complete` |
| **P12: Backend implementation & hardening** | 07:49 – 09:18 | The design of P10 implemented on the `backend` branch and merged to `main` (`e2d6d38`): `src/lib/server/*` (db, dto, guards, password, pricing, ratelimit, seed, session, validate) and `src/lib/api/*` (auth, checkout, orders, vendor), integer-paise money, plus `src/test/backend.test.ts` | 25 unit tests authored for pricing, stock, idempotency, IDOR, response shaping and credentials; `tsc --noEmit` clean across all new files; 10 significant routes 200 | `Complete (see §6.1 — 2 of these tests fail on re-run)` |
| **P13: End-to-end security harness** | 10:33 – 10:54 | `scripts/e2e.mjs` (`0cfe108`): 110 HTTP checks against a running production build with a real cookie jar, speaking the framework's seroval wire format | 110/110 passing at time of authoring, across CSRF, privilege escalation, cookie flags, authentication, enumeration, pricing, input validation, checkout, IDOR, order state machine, vendor isolation, error handling, logout revocation and rate limiting | `Complete` |
| **P14: Branch integration** | 11:11 – 11:5x | `origin/main` merged into `Security`; the two divergent copies of `docs/APPROACH.md` and `docs/logs.txt` reconciled; `Security` then merged into `main` | Verified the merged `src/` tree is byte-identical to `origin/main` (zero source regression possible); union-merged the append-only log with all 47 entry headers preserved; `npm run typecheck` 11 pre-existing errors, unchanged; `npm test` 24/26 | `Complete` |
| **P15: Deployment & submission freeze** | Pending | Deploy the nitro artifact to a host with a persistent writable volume, then record `commit_sha`, `deployment_url` and `submitted_at` in `metadata/submission.yaml` | Final build, test run and route probe against the deployed URL; confirm security response headers on a live response | `Not done — the 2026-10-06T11:00:00+05:30 deadline passed with these fields empty. See §6.3.` |

---

## 4. Architecture Decision Records (ADRs)

### ADR-001: Vite 8 with an explicit `resolve.alias`, not `resolve.tsconfigPaths`
- **Status:** Accepted
- **Context:** The existing `src/` tree imports everything through the `@/` prefix. The first toolchain used Vite 7 with `resolve.tsconfigPaths`; the dev server could not resolve a single `@/...` import, and the nitro plugin additionally reported that it requires Vite `^8`.
- **Options Considered:**
  1. Stay on Vite 7 and rewrite every import to a relative path.
  2. Stay on Vite 7 and drop the nitro builder.
  3. Upgrade to Vite 8 + `@vitejs/plugin-react` 6 and declare the alias explicitly, mirroring the `tsconfig.json` `paths` entry.
- **Decision & Rationale:** Option 3. The root cause was that `resolve.tsconfigPaths` is a Vite 8 feature and was silently inert on 7 — it failed open with no error, which is the worst failure mode. `@vitejs/plugin-react` 6 peers Vite `^8` and the nitro builder requires `^8`, so the upgrade was forced anyway. An explicit alias means the dev server, the nitro production build and vitest resolve `@` identically and version-independently. Rewriting ~100 files of imports would have consumed hours and lost the compile-time guarantee.
- **Security & Performance Trade-offs:** Moving to a beta-adjacent major (`nitro 3.0.260903-beta`) accepts some upstream churn risk in exchange for a supported build path; `npm audit` reported 0 vulnerabilities on the resolved tree. A single resolution source removes the class of bug where a test resolves a different module than production does — which is a security property, not just a convenience.

### ADR-002: TanStack Start server functions, not a separate Express/NestJS backend
- **Status:** Accepted
- **Context:** Every server-authority control — password verification, session issuance, role assignment, ownership checks, authoritative totals — needs a server. The security document originally assumed a separate Node API service. An early audit of this repo concluded no server boundary existed at all.
- **Options Considered:**
  1. Stand up an Express or NestJS service alongside the app.
  2. Extend the server boundary that already exists in-repo: `createStart` request middleware in `src/start.ts` plus `createServerFn` handlers.
- **Decision & Rationale:** Option 2. The early audit was wrong, and the correction is recorded in `docs/logs.txt` at 00:14: it had searched for `*.server.ts` filenames, but Start server functions are declared with `createServerFn` inside ordinary `.ts` modules. A real boundary was already there — global CSRF and error middleware on every request, and `src/lib/hubby/ask.ts` as a working exemplar with validation, rate limiting and server-only secret handling. Option 1 would have added a second process, a second deploy target, CORS plumbing, hand-rolled CSRF and a cross-service session transport, buying no control that option 2 cannot enforce.
- **Security & Performance Trade-offs:** One artifact means one place to misconfigure and one place to audit, and server functions are the only write path, so a control placed in middleware cannot be routed around. The trade-off is coupling: the security layer now depends on a framework API, and the whole app shares one process, so a server-side crash takes the storefront down with the API. The global `errorMiddleware` already contains that by catching non-HTTP errors and returning a static 500 page with no stack trace.

### ADR-003: `node:crypto` `scrypt` for password hashing, not bcrypt or argon2
- **Status:** Accepted
- **Context:** Real password verification was needed within hours, across a mixed team including Windows machines.
- **Options Considered:**
  1. `bcrypt` (native module).
  2. `argon2` (native module, current best practice on paper).
  3. `node:crypto.scrypt` (standard library, memory-hard, no compiler).
- **Decision & Rationale:** Option 3. `bcrypt` and `argon2` both require native compilation, which routinely fails on Windows without a full MSVC build chain — a dependency that will not install is a control that does not exist. This was not hypothetical: the same class of failure killed `better-sqlite3` later the same night (ADR-007). `scrypt` is memory-hard, ships with Node, needs no build step, and is used with N=2^15, a 16-byte per-user random salt, cost parameters stored alongside the hash, and a `timingSafeEqual` comparison.
- **Security & Performance Trade-offs:** Argon2id is the stronger primitive against GPU and ASIC attackers, so this is a real, accepted downgrade in exchange for guaranteed installability and zero native build risk. `scrypt` is deliberately CPU- and memory-expensive, so sign-in cost is a DoS vector on its own; per-IP auth rate limiting is part of the same work package for exactly that reason.

### ADR-004: Server-side session records, not a JWT carrying role claims
- **Status:** Accepted
- **Context:** Identity was a `localStorage` object holding `{name, email, role}` (`src/lib/store.tsx`), and `/vendor` was gated on it, so any visitor could grant themselves any role from devtools. Both the session and the role had to become server-owned.
- **Options Considered:**
  1. Signed JWT in a cookie, carrying `sub` and `role`.
  2. Opaque 256-bit random session ID in an `httpOnly` cookie, with the record — including the role — held server-side.
- **Decision & Rationale:** Option 2. A JWT's role claim is a snapshot: a suspended seller keeps their access until the token expires, and fixing that needs a revocation list, which is a session table with extra steps. The cookie here carries 256 bits of CSPRNG output and nothing else, so there is no payload to tamper with and nothing to learn from stealing a decoded token. More importantly, a client cannot tamper with a role it never holds: role and ownership are looked up server-side on every request, so a forged `role` in a request body is not "rejected", it is structurally meaningless — `signup` has no role parameter at all.
- **Security & Performance Trade-offs:** A store read per request, which is trivial here, and sessions become server state that must be persisted and expired — the cost of real revocability. Account status is re-checked on every request, so suspension and sign-out take effect immediately; verified by replaying a logged-out session id and being rejected. The cookie is `httpOnly` (an XSS foothold cannot read it), `SameSite=Strict` (a second layer under the CSRF middleware), `Secure` in production, and `Path=/`. `SameSite=Strict` will drop the session on inbound cross-site navigations; acceptable for a marketplace with no third-party embed. The session store inherits the durability limits of ADR-007.

### ADR-005: Gemini key server-only behind a dynamic import, with an offline fallback
- **Status:** Accepted
- **Context:** Hubby needs a paid third-party API from a client-side chat panel. Vite inlines any `VITE_`-prefixed env var into the browser bundle.
- **Options Considered:**
  1. Call Gemini from the browser with a `VITE_`-prefixed key.
  2. Proxy through a server function and read the key with `process.env` inside the handler, pulling the transport in by `await import("./gemini")`.
  3. Drop the AI assistant.
- **Decision & Rationale:** Option 2. Option 1 publishes a billable key to every visitor and is non-negotiable. The dynamic import matters beyond style: it keeps `gemini.ts` out of the client module graph entirely, so the key and the endpoint cannot be reached by bundle analysis. `.env.example` states explicitly that these vars must never be renamed to `VITE_*`. Verified by scanning the built client bundle for seven secret and prompt fingerprints with zero hits. The assistant also degrades rather than failing: with no key, or on a Gemini 429/503 after one retry, `src/lib/hubby/offline.ts` answers with a no-network keyword match and the UI displays a visible notice that the answer is a fallback.
- **Security & Performance Trade-offs:** The server now pays the latency of the upstream call and owns the cost exposure, which is why `askHubby` is rate-limited at 12 requests per client per minute. Honest degradation means a user can receive a weaker answer without being told it was caused by a quota limit — mitigated by always showing the fallback notice.

### ADR-006: Model output is data, never trusted content
- **Status:** Accepted
- **Context:** Gemini returns a reply plus product IDs, and the chat UI renders product cards from them. The prompt is reachable by any anonymous visitor, so anything the model says is downstream of attacker-controlled input.
- **Options Considered:**
  1. Render what the model returns, instructing it in the system prompt to be accurate.
  2. Re-resolve every model-returned ID against the real catalogue server-side and render all facts from local data.
- **Decision & Rationale:** Option 2. Prompt instructions are mitigation by request, not enforcement; the model can be talked out of them. `validateProductIds()` keeps only IDs that `getProduct()` resolves, deduplicates, and caps at 3, so a hallucinated or injected ID becomes nothing at all rather than a broken link or an invented price. Price, image, seller and rating always come from `src/lib/data.ts`. Complementary measures: seller `owner` and `email` are never put into the prompt, so no injection can extract them; the shopper's text is wrapped in a `<shopper_message>` delimiter with forged closing tags stripped; the reply is truncated to 1200 characters.
- **Security & Performance Trade-offs:** Suggestions are capped at 3 and a legitimately recommended product that does not resolve is silently dropped, so recall is slightly reduced in exchange for an upper bound on what the model can inject. Validation cost is a few map lookups.

### ADR-007: Hand-written JSON store with atomic writes, not PostgreSQL or SQLite
- **Status:** Accepted (under time pressure; revisit after the event)
- **Context:** Server-side accounts, sessions and orders need to survive a process restart, and the backend needed transactional guarantees for stock decrement plus a uniqueness constraint for checkout idempotency. SQLite was the plan. There is no managed database available to this team inside the 24-hour window, and the original security document's design depended on PostgreSQL Row-Level Security and per-role database users.
- **Options Considered:**
  1. PostgreSQL + Prisma, with RLS as a third isolation layer.
  2. `node:sqlite` — unavailable: the development machine runs Node 20, where the module does not exist.
  3. `better-sqlite3` — needs a native toolchain build; the install timed out, and it would also have had to survive the nitro bundle step.
  4. A hand-written store with zero dependencies, JSON-backed, loaded into memory on boot.
- **Decision & Rationale:** Option 4, with roughly 2.5 hours to the freeze. Option 1 needs an instance, a migration pipeline and a connection secret that nobody on the team could provision that night; a design that cannot be stood up is not a control. Options 2 and 3 failed on the environment, not on preference. A dependency that fails to compile on a teammate's machine is worse than no dependency. The guarantees that mattered were preserved rather than abandoned: Node is single-threaded, so a **synchronous** check-and-mutate block cannot be interleaved by a concurrent request — the same end state a SQL transaction gives on a single-process server. `tx()` makes that contract explicit and throws if its callback returns a promise. Uniqueness is enforced by `Map` indexes, which is exact.
- **Security & Performance Trade-offs:** Stated plainly. This loses RLS as a defence-in-depth layer, so isolation rests on the application layer alone — which is why ownership checks are enforced at the server-function boundary and listed individually in the conformance matrix. There is no rollback, so every mutation follows validate-then-mutate: all checks throw first, then writes happen and cannot fail. Durability is weaker than WAL — persistence is a debounced atomic write-then-rename, so a crash can lose the last few milliseconds of writes, though it cannot corrupt the file. **The guarantee does not survive horizontal scaling**: two processes would each hold their own copy. There is no encryption at rest beyond filesystem permissions. Operationally this introduces a hard deployment constraint — the data file must sit on a persistent writable volume, or accounts vanish on restart; see §6.4 and `deployment/README.md`. `data/` is gitignored so persisted hashes and live session ids can never be committed. Migrating to SQLite or Postgres is the first post-event task; the repository interface is narrow enough that only `src/lib/server/db.ts` changes.

### ADR-008: Seller email addresses withheld from the public vendor directory
- **Status:** Accepted
- **Context:** The `Vendor` type in `src/lib/data.ts` carries `owner` and `email`. The natural, conventional design for a seller directory page is to publish contact details.
- **Options Considered:**
  1. Render seller email on the public `/vendors` page.
  2. Obfuscate it (image, JS-assembled string).
  3. Expose business-level information only, and put seller contact behind authentication on the vendor or admin dashboards.
- **Decision & Rationale:** Option 3. An unauthenticated directory of verified seller contacts is a ready-made target list for scraping and for spear-phishing the marketplace's own revenue base — and a phishing email that correctly names a seller's store, city and listing count is highly credible. Obfuscation only raises the cost of scraping marginally. Verified by asserting that three known seed emails appear nowhere in the rendered HTML of the directory, a populated store and a pending store. The same rule is applied consistently: seller PII is excluded from Hubby's grounding snapshot, the vendor order DTO strips the shopper's street address, PIN and phone, and `/vendor-register` collects no bank account or IFSC number at all.
- **Security & Performance Trade-offs:** A genuine product cost — buyers cannot contact a seller directly before purchase, which some marketplaces allow. The mitigation is to route contact through the platform once an order exists. No performance impact.

### ADR-009: Catalogue browsing stays client-side
- **Status:** Accepted
- **Context:** `src/lib/data.ts` is imported directly by 15+ components for product and category data, including Vite image asset imports.
- **Options Considered:**
  1. Move all catalogue reads behind server functions for consistency with the rest of the data layer.
  2. Leave the public catalogue client-side and move only the figures that carry authority.
- **Decision & Rationale:** Option 2. The catalogue is public, so serving it from the client leaks nothing, and product imagery genuinely cannot live in a data row. Only the figures that carry authority — price, stock, ownership — moved server-side. Rewriting every browse page would have consumed the time the security work needed, for no security gain.
- **Security & Performance Trade-offs:** The browse pages can show a stale stock number after a purchase. `getQuote` reports the true availability and `placeOrder` is strict, so the worst case is a corrected message at checkout rather than an oversell. Client-side catalogue data also keeps the browse path cacheable and fast.

---

## 5. Engineering Journal & Real-Time Decision Log

### [2026-10-05 13:00 IST] Entry 1: Onboarding gate, and a project with no toolchain
- **Focus:** AGENTS.md contract, agreement, and establishing what the repository actually contained.
- **Key Challenges:** `src/` held a complete TanStack Start application — routes, components, shadcn UI, lib — but there was no `package.json`, no Vite config, no `tsconfig.json`, no lockfile and no `node_modules` anywhere. Verified by recursive search, not assumed. There was no command that could start the project.
- **Resolution:** Closed the onboarding gate first (agreement recorded 13:04), reported the blocker and the two real options rather than scaffolding unrequested files, and waited for the participant's choice.

### [2026-10-05 14:10 IST] Entry 2: Authoring the build toolchain — the `@/` resolution failure
- **Focus:** `package.json`, `vite.config.ts`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`; dependency install; first bring-up.
- **Key Challenges:** The first boot resolved not one `@/...` import. The symptom looked like a bad alias; the root cause was that `resolve.tsconfigPaths` is a Vite 8 feature and was **silently inert on Vite 7** — no warning, no error, just unresolved modules. The nitro builder separately reported that it requires Vite `^8`.
- **Resolution:** Upgraded to `vite@^8` + `@vitejs/plugin-react@^6` and replaced `resolve.tsconfigPaths` with an explicit `resolve.alias`, so dev, build and vitest resolve `@/` identically (ADR-001). Then verified rather than assumed: SSR probes on 7 routes with asserted titles, `/product/1` correctly 404 while `/product/p1` is 200, `npm test` 1/1, `npm run build` exit 0, and the built nitro server probed on port 3001. Reported — and deliberately did not fix — the nine routes the UI linked to that did not exist, and the two stale shadcn wrappers.

### [2026-10-05 14:40 – 15:15 IST] Entry 3: The browse surface, and the first security decisions
- **Focus:** `/categories`, `/deals`, `/vendors`, built one at a time with no change to the theme.
- **Key Challenges:** Three non-obvious ones. `product.$id.tsx` already linked to `/vendors` twice with no params, so the route had to work bare. A live countdown on `/deals` would hydrate into a React mismatch the moment server and client clocks differed by a second. And `/vendors` is a public page over a data model that carries seller emails.
- **Resolution:** `/vendors` takes an **optional** `?v=<vendorId>` search param so both pre-existing bare links keep working untouched, with an unknown ID falling through to the directory instead of erroring (verified: byte-identical response). The countdown renders `--` during SSR and only starts ticking in `useEffect` — asserted as exactly 4 placeholders in the server HTML. Seller emails were excluded from the public page entirely (ADR-008), verified by asserting three known seed addresses appear in none of the three rendered views. Also kept the data honest: the seed catalogue count and the number of actually browsable listings are shown as two distinctly labelled figures rather than conflated.

### [2026-10-05 15:34 IST] Entry 4: Login stage — scoping a visual change, and proving a bug was not ours
- **Focus:** Replacing the flat black surround on `/login` with the site's own blurred theme, touching that area only.
- **Key Challenges:** The participant had rebuilt `/login` by hand between turns, so the file had to be read before editing rather than remembered. Separately, the auth card visibly clips at a 420px viewport, and it would have been easy to assume the new backdrop caused it.
- **Resolution:** Grepped first and confirmed `bg-stage` had exactly one usage, so the change could be confined to one element. Then proved the clipping was pre-existing by removing the backdrop and re-screenshotting at 420px: identical clipping. Also reverted an `overflow-hidden` that had been added speculatively. Left the real bug documented and untouched because it was out of the turn's scope.

### [2026-10-05 16:28 IST] Entry 5: Hubby gets a real brain, and a hard look at what that exposes
- **Focus:** Replacing a 15-keyword lookup table with a Gemini-backed assistant grounded in the live catalogue; six modules under `src/lib/hubby/`.
- **Key Challenges:** Three. A declaration collision — a new `const payload` for the request body shadowed the existing `payload` holding the parsed response, surfacing as a transform `PARSE_ERROR` on the first live run. A misdiagnosis: the first probe hit a stale dev server left on port 3000 by an earlier session and its 500 was briefly read as a bug in the new code. And the free-tier quota: rapid testing drew 429 `RESOURCE_EXHAUSTED`, which blocked three of five planned adversarial probes even after a 90-second wait.
- **Resolution:** Renamed to `requestBody`; found the real server on 3001. Verified live against the real API: four catalogue questions answered with correct prices, correct stock ("out of stock", ₹64,990 from ₹72,990) and correct policy figures, returning zero product cards for a policy-only question — and a system-prompt extraction attempt refused cleanly. Recorded the three unverified probes **as unverified** in the log rather than claiming five passes, and noted that each is already defended structurally: PII is never in the prompt, the delimiter is stripped, and unresolvable IDs are discarded server-side. Also proved the env plumbing with a temporary probe rather than assuming it, then removed the probe and confirmed `src/server.ts` was byte-identical.

### [2026-10-05 21:05 IST] Entry 6: Nine routes — and the discovery that sign-in never signed anyone in
- **Focus:** `/orders`, `/account`, `/notifications`, `/vendor`, `/vendor-register` and four policy pages; taking the app from 9 routes to 17. Nine routes were linked from the UI but had no file and returned 404; all nine were built from existing design primitives only.
- **Key Challenges:** The blocker came first: `src/components/auth/AuthPanel.tsx` **never called `store.login()`**. Both forms ran a 1.3s `fakeAuth()` and set a success flag, so no session was ever created and `/account`, `/orders` and `/vendor` were unreachable by construction — nothing downstream could be built or tested until that was fixed. Then two self-inflicted problems: `LEGAL_PAGES` was placed in `LegalPage.tsx`, which `StoreLayout` imported for the footer, while `LegalPage` renders *inside* `StoreLayout` — a circular import. And the first typecheck after writing the routes reported **65 errors**, which looked like a catastrophe.
- **Resolution:** Made sign-in create a real session. Moved the constant to `src/lib/legal.ts`, breaking the cycle. Chased the 65 errors to their actual cause — a stale `src/routeTree.gen.ts`, which the TanStack plugin regenerates at build time; after a rebuild the count was 11, all in two unused shadcn wrappers. Then verified behaviour instead of asserting it: 25 HTTP probes, 22 real-Chrome CDP checks across signed-out, shopper and seller sessions, and 9 CDP security checks. Browser verification was necessary because auth was client-side at this point — `/vendor` server-renders as a 3.3 KB gate shell. Security decisions recorded the same turn: order scoping, the `safeRedirect()` open-redirect guard, no bank fields on the seller form, a minimal seller order view, `noindex` on personal pages, logout clearing addresses, and an `/account?tab=security` panel that states plainly that the role gates are navigation rather than security.

### [2026-10-05 21:14 IST] Entry 7: Submission metadata recorded
- **Focus:** `metadata/team.yaml` and `metadata/submission.yaml`.
- **Key Challenges:** Team size had to satisfy the exactly-2-or-4 rule, and the git remote had to be the team's own repository, not the starter.
- **Resolution:** Four members recorded; `git remote get-url origin` confirmed it already pointed at `https://github.com/AbhinavRangoju/Team-51.git`, so no remote change was needed. `commit_sha`, `deployment_url` and `submitted_at` were deliberately left empty as final-freeze fields. One data oddity was flagged to the participant rather than silently corrected: member 3's recorded email does not obviously match the given name, and it was written exactly as provided because it is the team's own registration data.

### [2026-10-05 21:18 – 21:34 IST] Entry 8: First push, and a divergent `main`
- **Focus:** Getting the work off one laptop and onto `origin`, then preparing a review path into `main`.
- **Key Challenges:** `main` had diverged from the local branch, so a merge-to-main could not be done blindly.
- **Resolution:** Pushed `Frontend` to `origin` — the first push of the project. Paused the merge rather than forcing it, explained what `main` actually contained, and prepared a pull request from `Frontend` into `main` (`gh` was unavailable, so the PR was raised through the web flow). Merged as PR #1.

### [2026-10-05 23:25 IST] Entry 9: Full frontend verification on a second machine
- **Focus:** Proving the app installs and runs from a clean checkout — `npm ci`, dev, typecheck, test, build, 18 route probes.
- **Key Challenges:** `node_modules` was absent: this is a fresh clone on a different teammate's machine from the one the app was authored on. Then the first `npm run build` died with **no output and exit -1**, which reads exactly like a toolchain failure. And `src/routeTree.gen.ts` showed as modified.
- **Resolution:** `npm ci` for lockfile-exact installation (343 packages, 0 vulnerabilities) rather than `npm install`, so no version could drift between machines. Root-caused the failed build from the reflog rather than guessing: a teammate had checked out `main`, then `Security`, then committed a merge **while the build was running**, so source files changed underneath Vite mid-build; the re-run on a settled tree exited 0. Confirmed the `routeTree.gen.ts` content diff was **empty** — a pure LF-to-CRLF artifact from the dev server on Windows — and deliberately left it uncommitted rather than handing teammates a line-ending-only merge conflict. Surfaced a real consequence to the team: the merge took `origin/Frontend`, not the local `Frontend`, so four log commits existed only locally.

### [2026-10-06 00:08 IST] Entry 10: Security scope lock — and a wrong conclusion, corrected in the log
- **Focus:** Confining all security work to the `Security` branch; auditing `SECURITY_ARCHITECTURE.md` against the repository.
- **Key Challenges:** The 644-line document declared itself authoritative over a React/Next.js + NestJS + PostgreSQL/Prisma + Redis + Zod + Docker Compose stack and specified controls that depend on it: Row-Level Security, per-role database users, Redis-backed counters, reverse-proxy TLS/HSTS, an `admin:create` CLI. None of that exists here. Worse, the audit then concluded that **no server boundary existed at all**, because it had searched for `*.server.ts`, `api*` and `*.api.ts` filenames and found nothing.
- **Resolution:** The conclusion was wrong and was corrected in `docs/logs.txt` at 00:14 rather than quietly amended. TanStack Start server functions are declared with `createServerFn` inside ordinary `.ts` modules, so a filename search cannot see them. Re-searching for the actual symbols found a real boundary: global CSRF and error middleware already registered in `src/start.ts`, and `src/lib/hubby/ask.ts` as a working POST server function with allow-list validation, a rate limiter and server-only secret handling. That changed the plan materially — server-enforced security is an extension of an existing in-repo pattern, not a new backend, and the "6+ hours and a new backend" estimate put to the participant had been built on a false premise.

### [2026-10-06 00:16 IST] Entry 11: Reconciliation and hardening design
- **Focus:** Making every claim in `SECURITY_ARCHITECTURE.md` true of this repository, and designing the server-side controls that make it true.
- **Key Challenges:** The document and the code had drifted so far apart that editing either alone would have produced a lie. And the live privilege-escalation hole — a role picker that lets any visitor assert `vendor` — had to be closed without breaking the gated routes that the 21:05 work had just made reachable.
- **Resolution:** Dispatched the rewrite and the design together, with a conformance matrix that gives every control a status, an implementing file and symbol, and the test that proves it — controls that are **not** implemented are listed as not implemented with a reason, not deleted and not claimed. Verification is required as evidence: eleven executed attack tests, not a code review. The resulting 974-line design document lives at `.agents/tasks/security-hardening-2026-10-06/design.md` and is what the backend implementation of Entry 13 was built against.

### [2026-10-06 00:27 IST] Entry 12: Submission documentation, and four gates that are not the agent's to open
- **Focus:** Filling the remaining blank graded artifacts — `docs/APPROACH.md`, `deployment/README.md`, and later `docs/DOCUMENTATION.md`.
- **Key Challenges:** Two agents writing the same repository at once, and four remaining blockers that are participant decisions rather than engineering work.
- **Resolution:** File ownership was partitioned with no overlap: the hardening work owned `SECURITY_ARCHITECTURE.md`, `src/`, `.gitignore`, `.env.example` and `package.json`; the documentation work could read all of those but write only its own files; `docs/logs.txt` stayed with one writer so concurrent appends could not corrupt it. Both were bound to verify `git rev-parse --abbrev-ref HEAD` is `Security` before any write and to perform zero git mutations. The four gates — **commit**, **push**, **merge for review**, and **deployment** — were put to the participant explicitly and left closed.

### [2026-10-06 07:49 IST] Entry 13: Backend audit
- **Focus:** Establish what existed before writing anything.
- **Key Challenges:** Only one server function existed (`askHubby`); all marketplace state was client-side. Eleven conflicts recorded, the sharpest being the client-side role picker, browser-computed order totals, and `useMyVendor()`'s fallback to another seller's store.
- **Resolution:** Scope cut to P0+P1 and agreed before implementation.

### [2026-10-06 08:00 – 09:15 IST] Entry 14: Backend implementation
- **Focus:** Data layer, auth, sessions, guards, checkout, orders, vendor scoping.
- **Key Challenges:** Three environment failures ate roughly 50 minutes. (a) Node 20 has no `node:sqlite`. (b) `better-sqlite3` install timed out. (c) `npm install` failed repeatedly with `UNABLE_TO_VERIFY_LEAF_SIGNATURE` on every tarball — TLS interception by a local proxy or AV, which npm reported misleadingly as `Exit handler never called!`.
- **Resolution:** (a)+(b) → ADR-007. (c) → exported the Windows trust store to a PEM bundle and passed it via `npm_config_cafile`, which fixed the fetches **without** disabling certificate verification. `strict-ssl false` was considered and rejected: turning off TLS verification to install dependencies is precisely the kind of shortcut this competition is about not taking.

### [2026-10-06 10:33 – 10:54 IST] Entry 15: The end-to-end harness, and two findings it produced
- **Focus:** `scripts/e2e.mjs` — 110 HTTP checks against a running production build, closing the gap the unit tests cannot reach.
- **Key Challenges:** The harness had to speak the framework's own seroval wire format and carry a real cookie jar, or a pass would not mean a real browser behaves the same way.
- **Resolution:** Built and run to 110/110. Two findings came out of building it, both resolved. An early run reported an enumeration mismatch; the cause was the login rate limiter engaging across repeated runs against one long-lived process — the control working correctly, not a defect — and the harness now detects and reports that condition instead of mis-attributing it. And one assertion demanded "not found" from all three order endpoints, but the seller endpoint correctly answers "you do not have access" first, because `requireRole("vendor")` trips before it ever looks at the order, which reveals nothing about the order; the assertion was too blunt and was corrected to test the property that matters — refuses, and never confirms existence.

### [2026-10-06 11:11 IST] Entry 16: Branch integration, and what the merge revealed
- **Focus:** Merging `origin/main` into `Security`, reconciling two divergent copies of `docs/APPROACH.md` and `docs/logs.txt`, then merging `Security` into `main`.
- **Key Challenges:** Both branches had independently filled the same `docs/APPROACH.md` template with different content, so a union merge would have duplicated every heading and collided two different ADR-001s. `docs/logs.txt` had been appended to concurrently on both branches, and AGENTS.md §2 forbids rewriting, reordering or deleting any entry.
- **Resolution:** `docs/logs.txt` was resolved as a strict union rebuilt from git's own stage blobs — common base plus both branches' appends verbatim, with a reconciliation note recording the true interleaved chronology; all 47 entry headers were asserted present afterwards. `docs/APPROACH.md` was merged section by section, resolving the ADR collision by keeping the richer set and renumbering main's unique "catalogue stays client-side" decision as ADR-009. Two things worth recording came out of the merge. First, `git diff origin/main -- src/` on the merged tree was **empty**, which proves the integration could not have regressed any source file, and also shows that the `Security` branch's contribution was documentation and design rather than source code — the implementation reached `main` through the `backend` branch. Second, re-running the suite on the merged tree gave **24 of 26 tests passing**, not the 25-of-25 recorded at 09:15; the two stock-decrement failures are pre-existing on `origin/main` and are recorded in §6.1 and §6.3 rather than quietly dropped.

---

## 6. Testing, Security Verification & Deployment Record

### 6.1 Testing & Security Verification Strategy

**Unit and security tests.** `src/test/` contains `app-routing.test.tsx` (one test, asserting that `/` matches a real route rather than falling through to not-found), `backend.test.ts` (25 security tests), and `setup.ts`. The backend tests target the rules the client is not allowed to decide, not line coverage:

- *Pricing is authoritative:* totals derive from stored rows; delivery threshold and express fee correct; totals are exact integers; discount comes from stored MRP.
- *Stock:* decrements by exactly the quantity ordered; refuses to oversell; leaves stock untouched when an order is rejected; never goes negative across 20 competing orders.
- *Idempotency:* a replayed key returns the original order and does not decrement stock twice; keys are scoped per user, so one shopper cannot use a key to fetch another's order.
- *Authorization / IDOR:* a shopper gets their own order; another shopper's order reports "not found"; a product from another store reports "not found"; a seller gets an order only when they have a line in it.
- *Response shaping:* a seller's view omits other sellers' lines and the grand total; shopper street address, PIN and phone are absent from it; password hash, salt, user id and idempotency key never serialise to a shopper.
- *Credentials:* correct password verifies, wrong one does not; identical passwords do not share a hash; plaintext is never stored.

**Correction, recorded rather than dropped.** These 25 tests were all passing when authored at 09:15. On re-run against the merged tree at 11:46 the result is **24 of 26 passing, with 2 failures**, both in `backend.test.ts` under "checkout: stock and idempotency":

- `decrements stock by exactly the quantity ordered` — expected 107, received 110.
- `returns the same order for a replayed idempotency key and does not double-charge stock` — expected 108, received 110.

In both cases the stock figure did not move at all. These are **pre-existing on `origin/main`**, not a merge regression: the merged `src/` tree is byte-identical to `origin/main` (`git diff origin/main -- src/` is empty), including all six files these tests exercise. No `data/` store was present on disk, so stale persisted state is not the explanation. The likely cause is shared mutable seed state or idempotency-key reuse across tests within a single run, meaning the tests are order-dependent rather than the control being broken — but that is a hypothesis, not a verified diagnosis, and it has not been fixed. It is listed again in §6.3 so it cannot be missed.

**Type checking.** `npm run typecheck` reports **11 errors**, all pre-existing and all inert: 10 in `src/components/ui/chart.tsx` and 1 in `src/components/ui/calendar.tsx`. These are stale shadcn wrappers against the installed `recharts` and `react-day-picker` majors. Neither file is imported by any route, so neither affects the running app. The count has been stable across four separate runs on two machines and across two branch merges, which is what makes it useful as a regression signal — any new error is a new error. Zero errors were introduced by the backend work or by the integration merge. They were deliberately left alone: fixing them changes nothing an evaluator can observe and risks regressions with hours left.

**Static analysis.** No SAST tool and no linter is wired into the repository. `npm audit` reports 0 vulnerabilities on the resolved dependency tree, and `npm ci` is used rather than `npm install` so installs are lockfile-exact across machines. Secret hygiene was verified empirically rather than by policy: the built client bundle was grepped for the API key name, the Gemini hostname, the auth header name and four prompt fingerprints, returning 0 hits against the expected hits in the server bundle.

**Verification methods actually used.** Four, in increasing fidelity:

| Method | What it proves | Evidence |
|---|---|---|
| HTTP route probes with asserted SSR `<title>` | The server really renders the route; no soft-404s | 18/18 routes 200 with correct titles; `/nope-404` → 404; `/product/p1` → 200 while `/product/1` → 404; signed-out gates on `/checkout`, `/orders`, `/account` |
| Real headless-Chrome CDP checks | Client-side behaviour an SSR fetch cannot reach | 22 render checks across signed-out, shopper and seller sessions; 9 security checks — cross-account order read shows "No orders yet" and leaks no order ID; the open-redirect guard held against 4 hostile values; a shopper hitting `/vendor` gets "Restricted area" |
| Unit / security tests | That the server-owned rules hold in isolation | `backend.test.ts`, 24/26 passing — see the correction above |
| End-to-end attack harness | That a control rejects a real attack over real HTTP, not that the code looks right | `scripts/e2e.mjs`, 110 checks — see §6.2. Plus a live prompt-extraction attempt refused, and a clean client-bundle secret scan |

**Build.** `npm run build` completes and emits `.output/server/index.mjs`.

### 6.2 End-to-End Security Harness — 110 checks

`scripts/e2e.mjs` closes the gap the unit tests cannot reach. It drives the real HTTP endpoints against a running production build with a real cookie jar, speaking the framework's own seroval wire format, so a pass means a real browser would behave the same way. Run instructions are in the README. All 110 were passing when the harness was authored.

What it proves, grouped:

- **CSRF (4):** a request carrying no `Origin`, `Referer` or `Sec-Fetch-Site` is rejected with 403; `Sec-Fetch-Site: cross-site` is rejected; a foreign `Origin` is rejected; a same-origin request is allowed through. The middleware is default-deny, which is the strong posture.
- **Privilege escalation (7):** `role: "admin"` in the signup body is ignored and the account is created as a customer; a forged `id` is ignored; duplicate email, weak password and malformed email are all rejected.
- **Session cookie (6):** `HttpOnly`, `Secure`, `SameSite=Strict` and `Path=/` are all present on the production build; the cookie value carries no readable identity.
- **Authentication (5):** a forged session id is not accepted; `me()` reports nobody without a cookie; order history requires a session; no password material is ever serialised.
- **Enumeration resistance:** a wrong password and an unknown email return the identical message, and neither reveals which half was wrong.
- **Pricing (9):** unit price, subtotal, GST, delivery threshold and express fee all come from stored rows; injected `price`, `unitPricePaise`, `totalPaise`, `subtotalPaise` and `discountPaise` fields change nothing.
- **Input validation (9):** quantity zero, negative, absurd and non-integer are rejected; duplicate product lines, an empty cart, a non-array `items` and an unknown delivery speed are rejected.
- **Checkout (13):** a session is required; injected `total`, `status`, `payment` and `userId` are ignored; order ids match `MH-[0-9A-F]{10}`; stock decrements by exactly the quantity ordered; a replayed idempotency key returns the original order and does **not** decrement stock twice; an out-of-stock product cannot be bought; invalid addresses and unknown payment methods are rejected.
- **IDOR (11):** a second shopper sees an empty history; another shopper's order id is refused by every order endpoint, the refusal never confirms the order exists, and no order data is echoed back.
- **Order state machine (9):** cancelling restores stock and sets `Refunded`; cancelling twice is idempotent rather than an error; an unknown order id reports not found; a **shipped** order can no longer be cancelled; a **delivered** order can neither be cancelled nor advanced further.
- **Vendor isolation (12):** each seller sees only their own store and listings; a seller cannot advance an order containing none of their products and the refusal does not confirm it exists; the seller's view carries only their own line and omits the shopper's street address, PIN and phone; no owner email or password material appears.
- **Error handling (5):** no stack traces, absolute filesystem paths, source file names, internal module names or secret-looking values in any error body, probed across every endpoint with deliberately malformed input.
- **Logout (2):** the cookie is cleared **and** replaying the original session id is rejected, proving revocation is server-side rather than cosmetic.
- **Rate limiting (1):** repeated failed logins are throttled (observed at 11 attempts). Runs last, because it deliberately exhausts the bucket.

Note that the harness asserts correct stock decrement and correct idempotency replay over real HTTP (the Checkout group), which is the same behaviour the two currently-failing unit tests cover. That divergence between the two layers is itself unresolved and is listed in §6.3.

### 6.3 Known Gaps and Remaining Verification Debt

Listed so an evaluator does not have to find them.

1. **Two unit tests fail on re-run.** `backend.test.ts` reports 24/26 with both stock-decrement assertions failing, while the end-to-end harness asserts the same behaviour passing over real HTTP. Pre-existing on `origin/main`, not a merge regression, and not diagnosed. This is the single most important open item: either the tests are order-dependent, or stock decrement has a real defect that the harness happens not to catch in the same sequence. See §6.1.
2. **`metadata/submission.yaml` is incomplete and the deadline has passed.** `commit_sha`, `deployment_url` and `submitted_at` are all empty, and the official freeze was `2026-10-06T11:00:00+05:30`. These fields have deliberately **not** been backdated or filled with an invented SHA; a forged submission record would be a far more serious breach than a late one. The organisers need to be told.
3. **Nothing is deployed.** No deployment URL exists. None has been invented here, because a fabricated one would be worse than a blank.
4. **No genuine parallel-concurrency test.** The single-threaded atomicity argument is sound by construction and is covered by a sequential 20-order drain test plus the idempotency replay test, but nothing launches truly simultaneous requests.
5. **Local development runs on Node 20**, while `@tanstack/start-server-core` declares `node >=22.12.0`. `engines` has been corrected to `>=22.12.0` so a deployment provisions a supported runtime, but the machine used to build this is outside that range.
6. **No browser-driven UI test.** The harness exercises the API surface, not React rendering or hydration. Route-level smoke tests confirm every page returns 200 with no error page, in both dev and production builds.
7. **Three of five planned adversarial AI probes are unverified at the model layer** (forged-delimiter jailbreak, direct seller-email request, sub-budget hallucination bait). All three returned 429 `RESOURCE_EXHAUSTED` before the model answered. Each is defended structurally regardless of the model's cooperation.
8. **Rate limiters are per-process** and reset on restart, so horizontal scaling would require a shared counter. The same single-process assumption underpins the storage atomicity guarantee (ADR-007).
9. **No structured security event log.** The global error middleware logs server-side and returns curated messages, but there is no queryable security event stream (OWASP A09, rated Partial).
10. **Test coverage is still thin outside the backend rules**, and no SAST tool or linter is configured.
11. **`/admin` is not built.** The `admin` role exists and is enforced server-side, but no admin endpoint or console is exposed. Nothing links to it.
12. **The auth card clips below roughly 456px viewport width.** Pre-existing, proven not to be caused by the themed login backdrop, documented and left unfixed.

### 6.4 Deployment Verification

- **Live Deployment Platform:** `PENDING — not yet deployed.` Recommended target and exact commands are in [`deployment/README.md`](../deployment/README.md).
- **Deployment URL:** `PENDING.` No URL has been invented here.
- **Health Check Endpoint:** No dedicated `/health` route exists. `GET /` is the health probe: it must return HTTP 200 **and** the SSR title `MarketHub — Everything you want, from sellers you trust`. A 200 with the wrong title means the server is up but SSR is broken, which a bare status check would miss.
- **Pre-deploy requirements**, in order of importance:
  1. **Point `MH_DATA_FILE` at a persistent volume.** The default path sits inside the deployed bundle, so on an ephemeral filesystem every account and order is lost on restart. This is the highest-impact deployment setting, and it follows directly from ADR-007.
  2. **Provision Node 22.12+**, now declared in `engines`.
  3. **Leave `MH_ADMIN_PASSWORD` unset** unless an admin account is wanted; it has no default, so an admin cannot come into existence by accident.
  4. `NODE_ENV` does **not** need setting for cookie security — corrected from an earlier claim in this document. Vite inlines it as `"production"` at build time, so the built server always sets `Secure`. Verified by inspecting the raw `Set-Cookie` from the production bundle with `NODE_ENV` unset.
- **Deployment constraint that governs platform choice:** the production artifact is a nitro Node server (`node .output/server/index.mjs`), so a static-only host cannot run it, and the file-backed store requires a persistent writable volume.
