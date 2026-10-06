# Project Approach & Architecture — Build Secure 24

**Team ID:** 51
**Project Name:** MarketHub
**Team Size:** 4 Members (Abhinav Rangoju, Vivek Rajoju, Rohit Bhalkikar, Mani Kanta Sarapu)
**Primary Track / Domain:** Secure multi-vendor e-commerce — a marketplace where mutually untrusting sellers, their customers and platform administrators share one storefront, plus an in-app AI shopping assistant

> **Reading note for evaluators.** This document is the architecture and decision record. The authoritative, per-control security specification lives in [`SECURITY_ARCHITECTURE.md`](../SECURITY_ARCHITECTURE.md) at the repository root. The full turn-by-turn build history, including every failure and every verification command, is in [`docs/logs.txt`](logs.txt). Deployment instructions are in [`deployment/README.md`](../deployment/README.md). Where a control is incomplete, this document says so.

---

## 1. Problem Understanding, Scope & Threat Model

### 1.1 Problem Statement & Real-World Motivation

A multi-vendor marketplace is the hardest common case in web commerce because it has no single trusted tenant. One storefront hosts many independent sellers who are commercial rivals, each uploading their own listings, prices and copy, each able to see part of a shared order pipeline. The customer trusts the platform, not the sellers. The sellers trust the platform, not each other. The platform therefore has to be the only authority in the system.

MarketHub implements that storefront: 12 seeded products across 8 categories from 8 independent sellers, a cart and a four-step simulated checkout with real Indian commerce rules (free delivery at a ₹999 subtotal else ₹79, 5% GST, Standard free versus Express ₹149, 7-day returns, 8% seller commission), order tracking, a seller onboarding application, a vendor dashboard, and Hubby — an AI shopping assistant grounded in the live catalogue.

The security problem that follows is concrete, not theoretical:

- **Horizontal isolation.** Seller A must never read seller B's orders, listings or payouts. Customer X must never read customer Y's order history or postal address.
- **Vertical isolation.** A visitor must not be able to become a seller, and a seller must not be able to become an admin, by asserting it.
- **Price and total integrity.** Money is computed from the catalogue, not from what the browser submits. A marketplace that accepts a client-supplied total is a marketplace that sells laptops for ₹1.
- **Seller PII is a target in its own right.** A public directory that lists seller contact addresses is a ready-made phishing list aimed at the marketplace's own revenue base.
- **The AI assistant is an attacker-reachable component.** It takes free-form text from anonymous visitors, spends real money per call, and returns text that the UI is tempted to trust.

### 1.2 Target Users & Personas

| Persona | Trust level | Workflow | What they must never reach |
|---|---|---|---|
| **Anonymous visitor** | Untrusted | Browse `/`, `/shop`, `/categories`, `/deals`, `/vendors`, `/product/$id`; build a cart; ask Hubby | Any account, order, address, seller back-office, or seller contact detail |
| **Customer** | Authenticated, lowest privilege | `/login` → `/account`, `/orders`, `/notifications`, `/cart`, `/checkout` | Another customer's orders or addresses; any seller or admin surface |
| **Vendor (seller)** | Authenticated, scoped to own store | `/vendor-register` application → `/vendor` dashboard: listings, order queue, payouts | Another seller's data; a customer's full address or profile; platform-wide totals |
| **Admin** | Highest privilege, out-of-band provisioning only | Verification of sellers, dispute and audit review | — (no `/admin` console is built in this submission; see §6.3) |

The role picker shown at sign-in is being removed as part of the hardening work in flight, precisely because a persona a visitor can select is not a trust level. Role assignment moves to the server; see §2.4 and ADR-004.

### 1.3 Threat Model & Attack Surface

**Critical assets**

| Asset | Where it lives today | Exposure |
|---|---|---|
| Session / identity | `src/lib/store.tsx` (browser `localStorage`) → moving to server-side session records | Forgeable today |
| Customer PII (name, phone, postal address) | `/account` address book, `src/routes/checkout.tsx` | Browser-resident today |
| Order history | `src/routes/orders.tsx`, `src/routes/notifications.tsx` | Scoped per account, client-side |
| Seller business identity (GSTIN, PAN) | `src/routes/vendor-register.tsx` | Collected, never displayed publicly |
| Seller contact data (`owner`, `email` in `src/lib/data.ts`) | Deliberately withheld from `/vendors` and from the AI prompt | Not exposed |
| Payout and commission figures | `src/routes/vendor.tsx` | Behind a role gate |
| `GEMINI_API_KEY` | Server process env, read only inside `src/lib/hubby/ask.ts` | Verified absent from the client bundle |
| Price and total integrity | `src/lib/data.ts`, `src/routes/cart.tsx`, `src/routes/checkout.tsx` | Client-computed today; moving server-side |

**Attack vectors, mapped to real files**

1. **Privilege escalation by self-assertion** — `src/components/auth/AuthPanel.tsx` offers a Shopper/Seller role picker, and `src/components/mh/RequireAuth.tsx` is the only gate. Any visitor can currently choose `vendor` and reach `/vendor`. This is the single highest-severity finding in the repository and it is being closed now.
2. **Cross-account data read** — a second account in the same browser reading the first account's orders. Mitigated today by per-account filtering in `src/routes/orders.tsx` and `src/routes/notifications.tsx`, verified in real Chrome; this is privacy hygiene, not an authorization boundary, because the data is in the visitor's own storage.
3. **Open redirect / phishing hop** — `/login?redirect=` is attacker-controlled. `safeRedirect()` in `src/routes/login.tsx` accepts only single-slash absolute paths, rejecting `https://`, protocol-relative `//host` and `/\host`.
4. **Cross-site request forgery against server functions** — defined `src/start.ts` opts out of Start's automatic CSRF middleware, so it is re-registered explicitly: `createCsrfMiddleware({ filter: (ctx) => ctx.handlerType === "serverFn" })` in `requestMiddleware`.
5. **Price / total tampering at checkout** — `src/routes/checkout.tsx` builds the order object in the browser, including `total`. Server-authoritative totals are part of the hardening work in flight.
6. **Credential attacks** — sign-in verifies no password today. Password hashing, lockout and auth rate limiting are in flight.
7. **Stored XSS via seller-supplied text** — all listing and policy text renders through React's escaping JSX path; no `dangerouslySetInnerHTML` is used for user or seller data. `src/lib/error-page.ts` renders a static server error page with no interpolated request data.
8. **Search index leakage** — `/account`, `/orders`, `/notifications` and `/vendor` carry `noindex, nofollow`.
9. **Seller contact scraping** — seller emails exist in the data model and are rendered nowhere public (ADR-008).
10. **Supply chain** — `npm ci` installs lockfile-exact (343 packages, 0 reported vulnerabilities); no external repository is cloned or vendored into `src/`.

**AI-assistant-specific attack surface** (`src/lib/hubby/*`)

| Vector | Control | File |
|---|---|---|
| Prompt injection / system-prompt extraction | Shopper text wrapped in a `<shopper_message>` delimiter; forged closing tags stripped; refusal verified live against the model | `src/lib/hubby/prompt.ts`, `ask.ts` |
| Model output treated as trusted data | Every product ID the model returns is re-resolved against the real catalogue, deduplicated and capped at 3; price, image, seller and rating are rendered from `src/lib/data.ts`, never from the model | `ask.ts` → `validateProductIds()` |
| Data exfiltration through the prompt | Seller `owner` and `email` are never serialised into the grounding snapshot, so there is nothing to disclose — asserted against all 8 seed sellers | `src/lib/hubby/catalog.ts` |
| Quota drain / cost DoS | In-process fixed-window limiter, 12 requests per client per 60s, keyed on `getRequestIP({ xForwardedFor: true })` | `ask.ts` → `rateLimited()` |
| Secret exposure through the bundle | Key read inside the handler behind `await import("./gemini")`; env vars deliberately not `VITE_`-prefixed. Built client bundle scanned for 7 secret and prompt patterns: 0 hits | `ask.ts`, `gemini.ts` |
| Unbounded input | Non-empty string, control characters stripped, 500-char cap, history clamped to 8 turns × 400 chars | `ask.ts` → `validateAsk()`, `contract.ts` |
| Upstream failure as an outage | 429/503 retried once, then classified and answered by a no-network keyword matcher with a visible notice | `ask.ts`, `offline.ts` |

**OWASP Top 10 (2021) status**

| ID | Relevance to MarketHub | Status |
|---|---|---|
| A01 Broken Access Control | Client-only role gate in `RequireAuth.tsx`; self-asserted role in `AuthPanel.tsx`; object ownership resolved from client state | **Open — being closed now.** Server-side roles + ownership checks in flight |
| A02 Cryptographic Failures | No password hashing today; no session secret | **In progress** — `node:crypto` scrypt, 256-bit random session IDs |
| A03 Injection | No SQL and no shell in the stack. XSS surface handled by React escaping; LLM prompt injection handled structurally | **Addressed** |
| A04 Insecure Design | Client-authoritative money and self-asserted identity were design-level faults, not bugs | **In progress** — server-authoritative checkout |
| A05 Security Misconfiguration | CSRF middleware explicitly re-registered in `src/start.ts`; security response headers absent | **Partial** — headers in flight |
| A06 Vulnerable & Outdated Components | `npm ci` lockfile-exact, `npm audit` 0 vulnerabilities; 11 typecheck errors in two unused shadcn wrappers | **Addressed, with known inert drift** |
| A07 Identification & Authentication Failures | Sign-in verifies nothing; no lockout | **In progress** — verification, lockout, rate limiting |
| A08 Software & Data Integrity Failures | Live authorship only, no vendored external repo, pinned lockfile | **Addressed** |
| A09 Security Logging & Monitoring Failures | Global error middleware logs to console only; no structured security events | **In progress** — redacted security event log |
| A10 SSRF | One outbound call, to a fixed Gemini endpoint. No user-controlled URL is ever fetched | **Not applicable by design** |

---

## 2. Technical Architecture & Secure System Design

### 2.1 High-Level Architecture Overview

MarketHub is a single deployable artifact, not a microservice fleet. There are three tiers and one external dependency.

```
┌─ TB1 ─ Untrusted: the browser ───────────────────────────────────────┐
│  SSR'd HTML, then a hydrated React 19 SPA (TanStack Router, 17       │
│  routes). Holds presentation state only. Everything it sends is      │
│  attacker-controlled by definition.                                  │
└──────────────────────────────┬───────────────────────────────────────┘
                               │ HTTPS
┌─ TB2 ─ nitro server process (Node) ──────────────────────────────────┐
│  src/server.ts → src/start.ts                                        │
│    requestMiddleware: [ errorMiddleware, csrfMiddleware ]            │
│      · errorMiddleware   — rethrows HTTP errors, logs the rest,      │
│                            returns a static 500 page, never a stack  │
│      · csrfMiddleware    — createCsrfMiddleware, filtered to         │
│                            handlerType === "serverFn"                │
│                                                                      │
│  Server functions (createServerFn) — the ONLY write path.            │
│    · src/lib/hubby/ask.ts   askHubby  (POST, validated, rate-limited)│
│    · auth / session / order server functions — IN PROGRESS           │
│  SSR route rendering, loaders, catalogue reads from src/lib/data.ts   │
└──────────────┬──────────────────────────────────┬────────────────────┘
               │                                  │ outbound HTTPS
┌─ TB3 ─ on-disk store ─────────┐   ┌─ TB4 ─ Google Gemini ───────────┐
│  .data/*.json, atomic writes, │   │  generativelanguage.googleapis  │
│  gitignored. Accounts,        │   │  Untrusted output. Fixed URL.   │
│  sessions, orders.            │   │  Key never leaves TB2.          │
│  IN PROGRESS                  │   │                                 │
└───────────────────────────────┘   └─────────────────────────────────┘
```

What exists today and what is being added is stated precisely in the conformance matrix in `SECURITY_ARCHITECTURE.md`. Architecturally, the important property is that the server boundary is already real — `src/start.ts` registers global middleware on every request and `src/lib/hubby/ask.ts` is a working, validated, rate-limited POST server function. The hardening work extends an existing in-repo pattern rather than introducing a second runtime.

There is no database, no Redis, no reverse proxy and no container orchestration. That is a deliberate, time-boxed choice, defended in §2.3 and ADR-007.

### 2.2 Data Flow & Component Interaction

**Read path (browse).** Request → nitro → `errorMiddleware` → route loader → catalogue read from `src/lib/data.ts` → SSR HTML → hydration. No user data crosses TB2 inbound, so this path is cacheable and safe for anonymous traffic. Verified: 18/18 routes return the correct SSR `<title>` and `/nope-404` returns a real 404.

**Write path (every mutation).** Browser → `POST` server function → `csrfMiddleware` rejects cross-origin callers → the function's own `.validator()` rejects anything off the allow-list → handler executes with identity resolved **from the session cookie, never from the request body** → atomic write to `.data/` → the handler returns only what the caller is entitled to see. This is the single chokepoint; a control placed here cannot be bypassed by calling a different endpoint, because there is no other endpoint.

**AI path.** Browser → `askHubby` (POST, CSRF-protected) → rate limiter → input validation and control-character stripping → `await import("./gemini")` pulls the transport and the key into scope server-side only → grounding snapshot built from the catalogue with seller PII excluded → HTTPS to Gemini → response parsed, product IDs re-resolved against the real catalogue, reply truncated → client renders cards from local data using validated IDs only. Two trust boundaries are crossed in one request (TB1 inbound, TB4 outbound) and both directions are treated as untrusted.

**Trust boundaries, named.** TB1 browser→server: validate, authenticate, authorise. TB2→TB3 server→disk: atomic write, no interpolation of untrusted strings into paths. TB2→TB4 server→Gemini: no secrets or PII in the payload. TB4→TB2 Gemini→server: output is data, re-resolved against local truth before it can reach a user.

### 2.3 Technology Stack Rationale

- **Backend / API framework: TanStack Start server functions (`createServerFn`) on nitro.** *Why chosen:* the pattern, the global middleware hook and a working CSRF middleware already existed in this repository, and it keeps one build and one deploy artifact. *Rejected:* a separate **Express** or **NestJS** service — it would have meant a second process, a second deploy target, cross-origin/CORS plumbing and its own session transport, for no control we cannot implement here. The first audit of this repo wrongly concluded no server boundary existed (it searched for `*.server.ts` filenames; Start server functions live in ordinary `.ts` modules), which inflated the cost of this option before the error was caught and recorded. See ADR-002.
- **Frontend / client: React 19 + TanStack Router (SSR + hydration), Vite 8, Tailwind CSS 4, shadcn/ui.** *Why chosen:* inherited from the existing `src/` tree; typed routing gives compile-time detection of dead links, which is how the eight unbuilt routes were found. **Vite 8 specifically** was forced: the nitro build plugin requires `^8`, and `@vitejs/plugin-react` 6 peers `^8`. *Rejected:* **Next.js** — the document originally assumed it, but the app was already written against TanStack Start and a framework migration inside 24 hours would have spent the whole budget. **`resolve.tsconfigPaths`** was rejected in favour of an explicit `resolve.alias`, because it is a Vite 8 feature that was silently inert on 7 and broke every `@/` import. See ADR-001.
- **Database & persistence: file-backed JSON under a gitignored `.data/`, written atomically (in progress).** *Why chosen:* no managed database is available to this team inside the hackathon window, and a store that works on a laptop and on a single Node host is the only thing that can be demonstrated end-to-end. *Rejected:* **PostgreSQL + Prisma** (no instance, no migration budget, and the original document's Row-Level Security design presumes one), **Redis** for rate-limit and lockout counters (second service; the in-process limiter in `ask.ts` already proves the pattern), **SQLite** (closest alternative, rejected because `better-sqlite3` is a native module and native builds on Windows were already a known failure mode for this team). Residual risk is stated plainly in ADR-007.
- **Authentication & cryptography: `node:crypto` `scrypt` for password hashing, `crypto.randomBytes` for 256-bit session IDs, server-side session records in HttpOnly cookies (in progress).** *Why chosen:* `scrypt` is in the Node standard library, is memory-hard, and needs no compiler. *Rejected:* **bcrypt** and **argon2** — both require native compilation, which routinely fails on Windows and would have been a hard stop for part of the team. **JWTs carrying role claims** were rejected because they cannot be revoked at sign-out without inventing a server-side denylist anyway, and because a client cannot tamper with a role it never holds. See ADR-003 and ADR-004.
- **AI: Google Gemini over plain `fetch`, no SDK.** *Why chosen:* one REST call, zero new dependencies, and nothing between our code and the wire. *Rejected:* the official SDK (extra supply-chain surface for a single endpoint) and a `VITE_`-prefixed key (would publish the key to every visitor).
- **Testing: vitest 4 + jsdom, plus HTTP route probes and real headless-Chrome CDP checks.** *Why chosen:* vitest shares the Vite config and alias, so tests resolve modules identically to the app. CDP was necessary because auth is client-side today: an SSR fetch of `/vendor` returns a 3.3 KB gate shell and proves nothing about the signed-in view.

### 2.4 Defense-in-Depth Security Controls

Per-control detail, with the implementing symbol and the test that proves it, is in the conformance matrix in [`SECURITY_ARCHITECTURE.md`](../SECURITY_ARCHITECTURE.md). Summary:

1. **Authentication & session security.** *Implemented:* open-redirect validation on the post-login destination (`safeRedirect()` in `src/routes/login.tsx`, verified against 4 hostile values); logout clears the address book as well as the session, because postal addresses and phone numbers should not survive a sign-out on a shared machine; the "Continue with Google" button states in the UI that it is simulated and contacts no Google account. *In progress:* `scrypt` password hashing with constant-time verification, generic non-enumerating failure messages, `HttpOnly` + `Secure` + `SameSite=Strict` cookies carrying a 256-bit random session ID, absolute and idle expiry, rotation on privilege change, and real server-side revocation at logout.
2. **Authorization & access control.** *Implemented:* per-account order scoping in `src/routes/orders.tsx` and `src/routes/notifications.tsx`; `noindex, nofollow` on the four personal/seller routes; the seller order view deliberately shows destination city and contents, not the shopper's full address; no bank account or IFSC field exists on `/vendor-register`. *In progress:* roles stored server-side and never accepted from a request body, removal of the sign-in role picker, object-level ownership checks resolved from the session, admin provisioning out-of-band only. *Known gap today:* `src/components/mh/RequireAuth.tsx` is a navigation guard, and the product says so in plain language on `/account?tab=security` and on every policy page rather than implying protection it does not have.
3. **Input validation & sanitisation.** *Implemented:* `validateAsk()` in `src/lib/hubby/ask.ts` is a hand-rolled allow-list — type check, control-character strip, 500-char cap, history clamped to 8 × 400 — and `validateProductIds()` applies the same posture to the model's output; `validateSearch` on `/login` and `/vendors` narrows URL search params to known shapes, with an unknown `?v=` falling through to the directory rather than erroring; GSTIN, PAN, Indian PIN and phone formats are validated on the seller and address forms. There is no SQL in the system, so there is no parameterisation to get wrong. *In progress:* the same allow-list discipline applied to every new server function.
4. **Rate limiting & abuse prevention.** *Implemented:* fixed-window per-client limiter on `askHubby`, 12 requests per 60 seconds, with map eviction, because every call spends real money; upstream 429/503 degrade to the offline matcher instead of erroring. *In progress:* generalising that limiter to sign-in, plus per-account lockout. *Documented limitation:* the limiter is per-process and resets on restart, so horizontal scaling would require a shared counter.
5. **Secrets & configuration hygiene.** *Implemented:* zero hardcoded credentials in `src/`; `.gitignore` excludes `.env*` while allowing `.env.example`; `git check-ignore -v .env` was used to confirm the real key file was ignored before committing, and files were staged by name rather than with `git add -A` so the exclusion was explicit; the key is read only inside the server handler behind a dynamic import; no file under `src/` references `import.meta.env` or any `VITE_`-prefixed variable; the built client bundle (26 files) was scanned for `GEMINI_API_KEY`, `generativelanguage`, `x-goog-api-key` and four prompt fingerprints with 0 hits, against 5/1/1/1 hits in `.output/server` where they belong. *In progress:* `.data/` added to `.gitignore` so no persisted account data can be committed.

---

## 3. Implementation Milestones & 24-Hour Timeline

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
| **P10: Security architecture reconciliation & server-side hardening** | 00:16 → | Rewrite `SECURITY_ARCHITECTURE.md` against the real stack with an auditable conformance matrix; implement controls A–J (scrypt auth, revocable sessions, server-side roles and ownership, allow-list validation, server-authoritative totals, auth rate limiting and lockout, security headers, redacted security event log, atomic `.data/` persistence); close the self-asserted role hole | 11 executed attack tests required as evidence: role forgery in the body, cross-account order read, CSRF with forged/absent token, tampered price/total/quantity, sign-in brute force, `Set-Cookie` flag inspection, logged-out session replay, client-bundle secret grep, stored-XSS payload rendered inert, open-redirect against 3 hostile values, live response header values | `In progress` |
| **P11: Submission documentation** | 00:27 → | `docs/APPROACH.md` (this file) and `deployment/README.md` filled from the real history rather than from invention | Every claim cross-checked against `docs/logs.txt`, `git log`, and the source files named | `Complete` |
| **P12: Commit, push, merge & deployment freeze** | Before 11:00 | Commit the uncommitted change set, push `Security` (17 commits ahead of `origin/Security`), merge for review, deploy, then freeze `commit_sha`, `deployment_url` and `submitted_at` in `metadata/submission.yaml` | Final `npm run build`, test run and route probe against the deployed URL | `Not started — gated on explicit participant approval (no commit, push, merge or deploy has been performed)` |

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
- **Decision & Rationale:** Option 2. The early audit was wrong, and the correction is recorded in `docs/logs.txt` at 00:14: it had searched for `*.server.ts` filenames, but Start server functions are declared with `createServerFn` inside ordinary `.ts` modules. A real boundary was already there — global CSRF and error middleware on every request, and `src/lib/hubby/ask.ts` as a working exemplar with validation, rate limiting and server-only secret handling. Option 1 would have added a second process, a second deploy target, CORS plumbing and a cross-service session transport, buying no control that option 2 cannot enforce.
- **Security & Performance Trade-offs:** One artifact means one place to misconfigure and one place to audit, and server functions are the only write path, so a control placed in middleware cannot be routed around. The trade-off is coupling: the security layer now depends on a framework API, and the whole app shares one process, so a server-side crash takes the storefront down with the API. The global `errorMiddleware` already contains that by catching non-HTTP errors and returning a static 500 page with no stack trace.

### ADR-003: `node:crypto` `scrypt` for password hashing, not bcrypt or argon2
- **Status:** Accepted
- **Context:** Real password verification was needed within hours, across a mixed team including Windows machines.
- **Options Considered:**
  1. `bcrypt` (native module).
  2. `argon2` (native module, current best practice on paper).
  3. `node:crypto.scrypt` (standard library, memory-hard, no compiler).
- **Decision & Rationale:** Option 3. `bcrypt` and `argon2` both require native compilation, which routinely fails on Windows without a full MSVC build chain — a dependency that will not install is a control that does not exist. `scrypt` is memory-hard, ships with Node, needs no build step, and is paired with a per-user random salt, tuned cost parameters stored alongside the hash, and a constant-time comparison.
- **Security & Performance Trade-offs:** Argon2id is the stronger primitive against GPU and ASIC attackers, so this is a real, accepted downgrade in exchange for guaranteed installability and zero native build risk. `scrypt` is deliberately CPU- and memory-expensive, so sign-in cost is a DoS vector on its own; auth rate limiting and lockout are part of the same work package for exactly that reason.

### ADR-004: Server-side session records, not a JWT carrying role claims
- **Status:** Accepted
- **Context:** Identity is currently a `localStorage` object (`src/lib/store.tsx`) and the role is chosen by the visitor at sign-in. Both the session and the role need to become server-owned.
- **Options Considered:**
  1. Signed JWT in a cookie, carrying `sub` and `role`.
  2. Opaque 256-bit random session ID in an `HttpOnly` cookie, with the record — including the role — held server-side.
- **Decision & Rationale:** Option 2. A JWT cannot be revoked at sign-out without a server-side denylist, which is the server-side store it was meant to avoid. More importantly, a client cannot tamper with a role it never holds: with an opaque ID, role and ownership are looked up server-side on every request, so a forged `role` in a request body is not "rejected", it is structurally meaningless. The cookie is `HttpOnly` + `Secure` + `SameSite=Strict`, with absolute and idle expiry and rotation on privilege change.
- **Security & Performance Trade-offs:** Every authenticated request now costs a session lookup, and sessions become server state that must be persisted and expired — the cost of real revocability. `SameSite=Strict` is the strictest setting and will drop the session on inbound cross-site navigations; acceptable for a marketplace with no third-party embed. The session store inherits the durability limits of ADR-007.

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

### ADR-007: File-backed JSON with atomic writes, not PostgreSQL
- **Status:** Accepted
- **Context:** Server-side accounts, sessions and orders need to survive a process restart. There is no managed database available to this team inside the 24-hour window, and the original security document's design depended on PostgreSQL Row-Level Security and per-role database users.
- **Options Considered:**
  1. PostgreSQL + Prisma, with RLS as a third isolation layer.
  2. SQLite via `better-sqlite3`.
  3. JSON files under a gitignored `.data/`, written atomically (temp file + rename), loaded into memory on boot.
- **Decision & Rationale:** Option 3. Option 1 needs an instance, a migration pipeline and a connection secret that nobody on the team can provision tonight; a design that cannot be stood up is not a control. Option 2 is the closest alternative but `better-sqlite3` is a native module, and native builds on Windows were already a demonstrated failure mode for this team (see ADR-003). Atomic temp-file-and-rename writes give crash-consistency, which is the property that actually matters for an account store.
- **Security & Performance Trade-offs:** Stated plainly: this loses RLS as a defense-in-depth layer, so isolation rests on the application layer alone — which is why ownership checks are enforced at the server-function boundary and listed individually in the conformance matrix. It does not scale past one process, and it offers no encryption at rest beyond filesystem permissions. Operationally it introduces a hard deployment constraint — the data directory must be a persistent writable volume, or accounts vanish on restart. That is called out prominently in `deployment/README.md`. `.data/` is gitignored so persisted account data can never be committed.

### ADR-008: Seller email addresses withheld from the public vendor directory
- **Status:** Accepted
- **Context:** The `Vendor` type in `src/lib/data.ts` carries `owner` and `email`. The natural, conventional design for a seller directory page is to publish contact details.
- **Options Considered:**
  1. Render seller email on the public `/vendors` page.
  2. Obfuscate it (image, JS-assembled string).
  3. Expose business-level information only, and put seller contact behind authentication on the vendor or admin dashboards.
- **Decision & Rationale:** Option 3. An unauthenticated directory of verified seller contacts is a ready-made target list for scraping and for spear-phishing the marketplace's own revenue base — and a phishing email that correctly names a seller's store, city and listing count is highly credible. Obfuscation only raises the cost of scraping marginally. Verified by asserting that three known seed emails appear nowhere in the rendered HTML of the directory, a populated store and a pending store. The same rule is applied consistently: seller PII is also excluded from Hubby's grounding snapshot, the vendor order table shows destination city rather than the shopper's full address, and `/vendor-register` collects no bank account or IFSC number at all.
- **Security & Performance Trade-offs:** A genuine product cost — buyers cannot contact a seller directly before purchase, which some marketplaces allow. The mitigation is to route contact through the platform once an order exists. No performance impact.

---

## 5. Engineering Journal & Real-Time Decision Log

### [2026-10-05 13:00 IST] Entry 1: Onboarding gate, and a project with no toolchain
- **Focus:** AGENTS.md contract, agreement, and establishing what the repository actually contained.
- **Key Challenges:** `src/` held a complete TanStack Start application — routes, components, shadcn UI, lib — but there was no `package.json`, no Vite config, no `tsconfig.json`, no lockfile and no `node_modules` anywhere. Verified by recursive search, not assumed. There was no command that could start the project.
- **Resolution:** Closed the onboarding gate first (agreement recorded 13:04), reported the blocker and the two real options rather than scaffolding unrequested files, and waited for the participant's choice.

### [2026-10-05 14:10 IST] Entry 2: Authoring the build toolchain — the `@/` resolution failure
- **Focus:** `package.json`, `vite.config.ts`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`; dependency install; first bring-up.
- **Key Challenges:** The first boot resolved not one `@/...` import. The symptom looked like a bad alias; the root cause was that `resolve.tsconfigPaths` is a Vite 8 feature and was **silently inert on Vite 7** — no warning, no error, just unresolved modules. The nitro builder separately reported that it requires Vite `^8`.
- **Resolution:** Upgraded to `vite@^8` + `@vitejs/plugin-react@^6` and replaced `resolve.tsconfigPaths` with an explicit `resolve.alias` (ADR-001). Then verified rather than assumed: SSR probes on 7 routes with asserted titles, `/product/1` correctly 404 while `/product/p1` is 200, `npm test` 1/1, `npm run build` exit 0, and the built nitro server probed on port 3001. Reported — and deliberately did not fix — the eight routes the UI linked to that did not exist, and the two stale shadcn wrappers.

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
- **Focus:** `/orders`, `/account`, `/notifications`, `/vendor`, `/vendor-register` and four policy pages; taking the app from 9 routes to 17.
- **Key Challenges:** The blocker came first: `src/components/auth/AuthPanel.tsx` **never called `store.login()`**. Both forms ran a 1.3s `fakeAuth()` and set a success flag, so no session was ever created and `/account`, `/orders` and `/vendor` were unreachable by construction — nothing downstream could be built or tested until that was fixed. Then two self-inflicted problems: `LEGAL_PAGES` was placed in `LegalPage.tsx`, which `StoreLayout` imported for the footer, while `LegalPage` renders *inside* `StoreLayout` — a circular import. And the first typecheck after writing the routes reported **65 errors**, which looked like a catastrophe.
- **Resolution:** Made sign-in create a real session. Moved the constant to `src/lib/legal.ts`, breaking the cycle. Chased the 65 errors to their actual cause — a stale `src/routeTree.gen.ts`, which the TanStack plugin regenerates at build time; after a rebuild the count was 11, all in two unused shadcn wrappers. Then verified behaviour instead of asserting it: 25 HTTP probes, 22 real-Chrome CDP checks across signed-out, shopper and seller sessions, and 9 CDP security checks. Browser verification was necessary because auth is client-side — `/vendor` server-renders as a 3.3 KB gate shell. Security decisions recorded the same turn: order scoping, the `safeRedirect()` open-redirect guard, no bank fields on the seller form, a minimal seller order view, `noindex` on personal pages, logout clearing addresses, and an `/account?tab=security` panel that states plainly that the role gates are navigation rather than security.

### [2026-10-05 21:14 IST] Entry 7: Submission metadata recorded
- **Focus:** `metadata/team.yaml` and `metadata/submission.yaml`.
- **Key Challenges:** Team size had to satisfy the exactly-2-or-4 rule, and the git remote had to be the team's own repository, not the starter.
- **Resolution:** Four members recorded; `git remote get-url origin` confirmed it already pointed at `https://github.com/AbhinavRangoju/Team-51.git`, so no remote change was needed. `commit_sha`, `deployment_url` and `submitted_at` were deliberately left empty as final-freeze fields. One data oddity was flagged to the participant rather than silently corrected: member 3's recorded email does not obviously match the given name, and it was written exactly as provided because it is the team's own registration data.

### [2026-10-05 23:25 IST] Entry 8: Full frontend verification on a second machine
- **Focus:** Proving the app installs and runs from a clean checkout — `npm ci`, dev, typecheck, test, build, 18 route probes.
- **Key Challenges:** `node_modules` was absent: this is a fresh clone on a different teammate's machine from the one the app was authored on. Then the first `npm run build` died with **no output and exit -1**, which reads exactly like a toolchain failure. And `src/routeTree.gen.ts` showed as modified.
- **Resolution:** `npm ci` for lockfile-exact installation (343 packages, 0 vulnerabilities) rather than `npm install`, so no version could drift between machines. Root-caused the failed build from the reflog rather than guessing: a teammate had checked out `main`, then `Security`, then committed a merge **while the build was running**, so source files changed underneath Vite mid-build; the re-run on a settled tree exited 0. Confirmed the `routeTree.gen.ts` content diff was **empty** — a pure LF-to-CRLF artifact from the dev server on Windows — and deliberately left it uncommitted rather than handing teammates a line-ending-only merge conflict. Surfaced a real consequence to the team: the merge took `origin/Frontend`, not the local `Frontend`, so four log commits exist only locally.

### [2026-10-06 00:08 IST] Entry 9: Security scope lock — and a wrong conclusion, corrected in the log
- **Focus:** Confining all security work to the `Security` branch; auditing `SECURITY_ARCHITECTURE.md` against the repository.
- **Key Challenges:** The 644-line document declared itself authoritative over a React/Next.js + NestJS + PostgreSQL/Prisma + Redis + Zod + Docker Compose stack and specified controls that depend on it: Row-Level Security, per-role database users, Redis-backed counters, reverse-proxy TLS/HSTS, an `admin:create` CLI. None of that exists here. Worse, the audit then concluded that **no server boundary existed at all**, because it had searched for `*.server.ts`, `api*` and `*.api.ts` filenames and found nothing.
- **Resolution:** The conclusion was wrong and was corrected in `docs/logs.txt` at 00:14 rather than quietly amended. TanStack Start server functions are declared with `createServerFn` inside ordinary `.ts` modules, so a filename search cannot see them. Re-searching for the actual symbols found a real boundary: global CSRF and error middleware already registered in `src/start.ts`, and `src/lib/hubby/ask.ts` as a working POST server function with allow-list validation, a rate limiter and server-only secret handling. That changed the plan materially — server-enforced security is an extension of an existing in-repo pattern, not a new backend, and the "6+ hours and a new backend" estimate put to the participant had been built on a false premise.

### [2026-10-06 00:16 IST] Entry 10: Reconciliation and hardening begun
- **Focus:** Making every claim in `SECURITY_ARCHITECTURE.md` true of this repository, and implementing the server-side controls that make it true.
- **Key Challenges:** The document and the code had drifted so far apart that editing either alone would have produced a lie. And the live privilege-escalation hole — a role picker that lets any visitor assert `vendor` — had to be closed without breaking the gated routes that the 21:05 work had just made reachable.
- **Resolution:** Dispatched the rewrite and the implementation together, with a conformance matrix that gives every control a status, an implementing file and symbol, and the test that proves it — controls that are **not** implemented are listed as not implemented with a reason, not deleted and not claimed. Verification is required as evidence: eleven executed attack tests, not a code review. The thirteen frontend files the work is permitted to touch were disclosed to the participant up front, and nothing is committed, so any of them can be vetoed on sight.

### [2026-10-06 00:27 IST] Entry 11: Submission documentation, and four gates that are not the agent's to open
- **Focus:** Filling the two remaining blank graded artifacts — `docs/APPROACH.md` and `deployment/README.md`.
- **Key Challenges:** Two agents writing the same repository at once, and four remaining blockers that are participant decisions rather than engineering work.
- **Resolution:** File ownership was partitioned with no overlap: the hardening work owns `SECURITY_ARCHITECTURE.md`, `src/`, `.gitignore`, `.env.example` and `package.json`; the documentation work may read all of those but may write only its own two files; `docs/logs.txt` stays with one writer so concurrent appends cannot corrupt it. Both are bound to verify `git rev-parse --abbrev-ref HEAD` is `Security` before any write and to perform zero git mutations. The four gates — **commit**, **push** (`Security` is 17 commits ahead of `origin/Security`, which still sits at `78eeab3`), **merge for review**, and **deployment** — were put to the participant explicitly and left closed. `metadata/submission.yaml` cannot be completed until a commit exists, because `commit_sha` is by definition the SHA of a commit that does not yet exist.

---

## 6. Testing, Security Verification & Deployment Record

### 6.1 Testing & Security Verification Strategy

**Automated tests — stated honestly, because the number is small.** `src/test/` contains exactly two files: `app-routing.test.tsx` (one test, asserting that `/` matches a real route rather than falling through to not-found) and `setup.ts`. One test across 17 routes is thin coverage, it was flagged to the team at 23:25, and inflating it here would be worse than admitting it. The hardening work in flight is adding security tests under `src/test/`; their final count and content will be recorded in `SECURITY_ARCHITECTURE.md` and in `docs/logs.txt` when that work reports.

The reason coverage is thin is structural, not an excuse: until tonight, authentication was client-side `localStorage`, so there was nothing server-side to unit test. Moving auth, sessions, roles and totals to the server is what makes real unit tests possible, and that boundary is the right place to test — `validateAsk()`, `validateProductIds()`, `safeRedirect()`, password hash/verify, session issue/revoke and total computation are all pure or near-pure functions. Anything that depends on a cookie round-trip or a rendered page needs an integration test; CSRF rejection, cookie flags, and the role and ownership gates fall into that category.

**Type checking.** `npm run typecheck` reports **11 errors**, all pre-existing and all inert: 10 in `src/components/ui/chart.tsx` and 1 in `src/components/ui/calendar.tsx`. These are stale shadcn wrappers against the installed `recharts` and `react-day-picker` majors. Neither file is imported by any route, so neither affects the running app. The count has been stable across three separate runs on two machines and across a branch switch, which is what makes it useful as a regression signal — any new error is a new error. Zero errors have been introduced by any work this session. They were deliberately left alone: fixing them changes nothing an evaluator can observe and risks regressions with hours left.

**Static analysis.** No SAST tool and no linter is wired into the repository. `npm audit` reports 0 vulnerabilities on the resolved dependency tree, and `npm ci` is used rather than `npm install` so installs are lockfile-exact across machines. Secret hygiene was verified empirically rather than by policy: the built client bundle was grepped for the API key name, the Gemini hostname, the auth header name and four prompt fingerprints, returning 0 hits against the expected hits in the server bundle.

**Verification methods actually used.** Three, in increasing fidelity:

| Method | What it proves | Evidence |
|---|---|---|
| HTTP route probes with asserted SSR `<title>` | The server really renders the route; no soft-404s | 18/18 routes 200 with correct titles; `/nope-404` → 404; `/product/p1` → 200 while `/product/1` → 404 |
| Real headless-Chrome CDP checks | Client-side behaviour an SSR fetch cannot reach (auth is client-side today; `/vendor` SSRs as a 3.3 KB gate shell) | 22 render checks across signed-out, shopper and seller sessions; 9 security checks — cross-account order read shows "No orders yet" and leaks no order ID; the open-redirect guard held against 4 hostile values; a shopper hitting `/vendor` gets "Restricted area" |
| Executed attack tests | That a control rejects a real attack, not that the code looks right | Live prompt-extraction attempt refused; bundle secret scan clean. 11 further attack tests are required as the exit condition of the hardening work in flight: role forgery in a request body, cross-account order read, CSRF with a forged and an absent token, tampered price/total/quantity at checkout, sign-in brute force against the lockout, `Set-Cookie` flag inspection, logged-out session replay, client-bundle secret and hash grep, a stored-XSS payload rendered as inert text, the open-redirect guard, and the shipped header values on a live response |

**Verification debt, listed rather than hidden.** Three of five planned adversarial AI probes (forged-delimiter jailbreak, direct seller-email request, sub-budget hallucination bait) returned 429 `RESOURCE_EXHAUSTED` before the model answered and remain unverified at the model layer; each is defended structurally regardless of the model's cooperation. The `askHubby` rate limiter is per-process and resets on restart. The auth card clips below roughly 456px viewport width. `/admin` is not built and nothing links to it.

### 6.2 Deployment Verification

- **Live Deployment Platform:** `PENDING — not yet deployed.` Recommended target and exact commands are in [`deployment/README.md`](../deployment/README.md).
- **Deployment URL:** `PENDING — must be recorded in metadata/submission.yaml and deployment/README.md before 2026-10-06T11:00:00+05:30.` No URL has been invented here; a fabricated one would be worse than a blank.
- **Health Check Endpoint:** No dedicated `/health` route exists. `GET /` is the health probe: it must return HTTP 200 and the SSR title `MarketHub — Everything you want, from sellers you trust`. A 200 with the wrong title means the server is up but SSR is broken, which a bare status check would miss. Verification steps, including confirming the security response headers on a live response, are in `deployment/README.md`.
- **Deployment constraint that governs platform choice:** the production artifact is a nitro Node server (`node .output/server/index.mjs`), so a static-only host cannot run it, and the file-backed store requires a **persistent writable volume** — a platform with an ephemeral filesystem will silently lose user accounts on every restart. See ADR-007 and `deployment/README.md`.

### 6.3 Known Gaps at the Time of Writing

Listed so an evaluator does not have to find them:

1. **Server-side hardening is in progress, not finished.** Password hashing, revocable sessions, server-side roles, ownership checks, server-authoritative totals, auth rate limiting, security headers and the security event log are being implemented now; the authoritative per-control status is the conformance matrix in `SECURITY_ARCHITECTURE.md`. Until it lands, the role picker in `AuthPanel.tsx` remains a live privilege-escalation path and `RequireAuth.tsx` remains a navigation guard.
2. **Nothing is committed, pushed, merged or deployed.** The working tree carries the security and documentation change set uncommitted, by the participant's explicit instruction. Local `Security` is 17 commits ahead of `origin/Security`, which still sits at `78eeab3`.
3. **`metadata/submission.yaml` is incomplete.** `commit_sha`, `deployment_url` and `submitted_at` are empty and cannot be filled until the commit and the deployment exist.
4. **Test coverage is thin** (§6.1) and no SAST or linter is configured.
5. **`/admin` is not built.** The sign-in role picker deliberately never offered Admin, so nothing links to a route that does not exist.
