# MarketHub — Secure Multi-Vendor Marketplace

**Team 51 (Trishul) · Build Secure 24 · Abhedya — VBIT Cybersecurity Forum**

A multi-vendor marketplace where shoppers, independent sellers and operators share
one dataset. Because those parties do not trust each other, the design problem is
**authorization**, not authentication: the server owns identity, roles, prices,
stock, ownership and order state, and the browser is treated as an untrusted
renderer with no authority.

Architecture, threat model and decision records: [`docs/APPROACH.md`](docs/APPROACH.md).

---

## Quick Start

### Prerequisites

- **Node.js 22.12 or newer.** `@tanstack/start-server-core` requires it. The app
  does run on Node 20, but that is outside the supported range and npm will warn.
- npm 10+

### Install and run

```bash
npm install
npm run dev          # http://localhost:3000
```

### Verify

```bash
npm run typecheck    # expect 2 pre-existing failures, see "Known issues"
npm test             # 25 security tests + 1 routing test
npm run build        # emits .output/
npm start            # serves the production build (honours PORT)
```

### End-to-end security harness

`npm test` covers the server logic directly. The harness additionally drives the
real HTTP endpoints — session cookie, CSRF, serialisation — against a running
server. It needs the generated server-function ids, which change on each build.

```bash
npm run build
npm start                                    # in one terminal, note the port

# in another terminal
npm run serverfn:ids                         # copy the comma-separated last line
$env:MH_FN_IDS="<ids>"                       # PowerShell
export MH_FN_IDS="<ids>"                     # bash
npm run test:e2e -- http://localhost:3000
```

Run it against a **freshly started** server. The suite intentionally exhausts the
login rate-limit bucket at the end, so a second run on the same process will
report that limiter instead of the checks it is meant to make.

Expected: `PASS 110   FAIL 0`.

---

## Environment Variables

All are optional. Copy [`.env.example`](.env.example) to `.env` to set them.

| Variable | Default | Purpose |
|---|---|---|
| `MH_DATA_FILE` | `./data/markethub.json` | Where the server store is written. **Point this at a persistent volume in production** — see Deployment. |
| `MH_SEED_PASSWORD` | `Demo@1234` | Password for the fictional seeded demo accounts. |
| `MH_ADMIN_PASSWORD` | *(unset)* | **No default by design.** An admin account is created only if this is set, so a deployment never ships a privileged account with a guessable password. |
| `GEMINI_API_KEY` | *(unset)* | Optional, for the Hubby assistant. Without it Hubby falls back to offline keyword matching. |
| `GEMINI_MODEL` | *(built-in)* | Optional model override. |

`NODE_ENV` does **not** need to be set for cookie security: Vite inlines
`process.env.NODE_ENV` as `"production"` when building, so the built server always
sets the `Secure` flag. This was verified directly against the production bundle.

---

## Demo Accounts

Seeded accounts are fictional sample data from `src/lib/data.ts`. All use
`MH_SEED_PASSWORD` (default `Demo@1234`).

| Role | Email | Sees |
|---|---|---|
| Shopper | `priya@mail.com` | Her own order history only |
| Seller | `arjun@nordicsound.in` | Nordic Sound Co. (`v1`) only |
| Seller | `neha@stride.in` | Stride Athletics (`v2`) only |

Signing in as a seller shows **only that seller's** listings and only the order
lines they are fulfilling. Shopper street addresses, phone numbers and other
sellers' revenue are never sent to a seller. Both properties are covered by tests.

Deliberate note on these credentials: the demo password is public so evaluators
can sign in, and that is an accepted trade-off because every seeded account holds
fictional data and each one is confined to its own slice by the same
authorization checks that protect a real account. The **admin** role is handled
differently and has no default password at all.

---

## Project Layout

```
src/
├── lib/
│   ├── server/        ← server-only; never reaches the browser
│   │   ├── db.ts          tables, unique indexes, atomic persistence, tx()
│   │   ├── pricing.ts     the single source of money truth (integer paise)
│   │   ├── password.ts    scrypt hashing, constant-time compare
│   │   ├── session.ts     opaque session ids, httpOnly cookie
│   │   ├── guards.ts      requireUser / requireRole / ownership checks
│   │   ├── dto.ts         explicit field-by-field serialisation
│   │   ├── validate.ts    allow-list validators + error boundary
│   │   ├── ratelimit.ts   fixed-window per-IP buckets
│   │   └── seed.ts        one-time catalogue import
│   ├── api/           ← server functions (the only trust boundary)
│   │   ├── auth.ts        signup / login / logout / me
│   │   ├── checkout.ts    getQuote / placeOrder
│   │   ├── orders.ts      listMyOrders / getMyOrder / cancelOrder
│   │   └── vendor.ts      getVendorDashboard / advanceVendorOrder
│   ├── data.ts        ← public catalogue + imagery (client-side by design)
│   └── store.tsx      ← client state; cart/wishlist only, zero authority
├── routes/            ← 18 pages
└── test/              ← security test suite

scripts/               ← verification tooling, not application code
```

`src/lib/server/*` is only ever reached through `await import()` inside a handler
body, which keeps it and any secrets out of the client bundle.

---

## Deployment

```bash
npm ci
npm run build
npm start            # listens on $PORT, default 3000
```

Three things to get right:

1. **Use Node 22.12+.** Declared in `engines`.
2. **Set `MH_DATA_FILE` to a path on a persistent volume.** The store is a JSON
   file. On a platform with an ephemeral filesystem (Render, Railway, Fly without
   a volume, most container hosts) the default path lives inside the deployed
   bundle and **every account and order is lost on restart or redeploy**. This is
   the single most important deployment setting.
3. **Leave `MH_ADMIN_PASSWORD` unset** unless an admin account is actually wanted.

There is no dedicated `/health` endpoint; `/` returns 200 and serves as the health
check. Record the live URL in [`deployment/README.md`](deployment/README.md) and
[`metadata/submission.yaml`](metadata/submission.yaml).

---

## Known Issues

- `npm run typecheck` reports **2 pre-existing failures** in
  `src/components/ui/chart.tsx` and `src/components/ui/calendar.tsx`. These are
  stale shadcn wrappers versus the installed `recharts` / `react-day-picker`
  majors. Neither file is imported by any route. Everything else is clean.
- The JSON store is correct on a single process but **does not survive horizontal
  scaling** — two instances would each hold their own copy. See ADR-001 in
  `docs/APPROACH.md`.
- Browse pages read stock from the static catalogue, so a product's stock number
  can look stale after a purchase. Checkout re-prices and re-checks stock
  server-side, so the worst case is a corrected message at checkout, never an
  oversell.

---

# Build Secure 24 — Competition Reference

**Abhedya — VBIT Cybersecurity Forum, Vignana Bharathi Institute of Technology, Hyderabad**

## 1. Challenge Overview

- **Schedule**: October 5, 2026, 11:00 AM IST to October 6, 2026, 11:00 AM IST
- **Duration**: Exactly 24 Hours
- **Submission Deadline**: October 6, 2026, 11:00 AM IST (`2026-10-06T11:00:00+05:30`)
- **Team Size**: Exactly 2 or 4 participants per team (teams of 1, 3, or >4 are not permitted)
- **Core Requirement**: All project code must be created live during the 24-hour hackathon. Importing pre-built or third-party repositories is strictly prohibited.

---

## 2. Repository Structure

```
├── AGENTS.md                  ← AI agent behavioral contract & logging gate
├── README.md                  ← This file
├── PARTICIPANT_RULES.md       ← Competition rules
│
├── docs/                      ← Autonomous documentation layer
│   ├── APPROACH.md            ← Problem breakdown & architecture approach
│   └── logs.txt               ← Turn-by-turn prompt, file location & timeline log
│
├── metadata/                  ← Submission metadata
│   ├── team.yaml              ← Team information (2 or 4 members)
│   └── submission.yaml        ← Final submission details
│
├── src/                       ← Application source code directory
└── deployment/                ← Deployment configuration directory
    └── README.md              ← Deployment record
```

---

## 3. Getting Started

### Step 1: Team Registration & GitHub Repository Setup
1. Create a new GitHub repository for your team's project.
2. Fill in `metadata/team.yaml` with your assigned Team ID, team name, your newly created GitHub repository URL (`team.repository`), and all 2 or 4 member details.

### Step 2: AI Agent Onboarding
When you open this repository in an AI coding assistant (Cursor, Windsurf, Claude Code, Copilot, ChatGPT, etc.):
- The agent will read `AGENTS.md`, greet your team, recite the competition ground rules, display the remaining time until **October 6, 2026, 11:00 AM IST**, and collect your `I agree` confirmation.
- Once confirmed, the agent records your team details and GitHub repository URL, and configures your Git remote origin.
- The agent will **automatically log every prompt, the full agent response, the Git commit SHA, exact file changes, and timeline** in `docs/logs.txt` as you build.

### Step 3: Build & Ship with Continuous Push
- Author your application code inside `src/`.
- After each prompt, changes are committed with the exact commit SHA recorded in `docs/logs.txt`, and can be pushed directly to your team's GitHub repository (`git push origin main`).
- Document your technical approach in `docs/APPROACH.md`.
- Deploy your application and record live details in `deployment/README.md`.
- Update `metadata/submission.yaml` with your final commit SHA before the **October 6, 2026, 11:00 AM IST** deadline.

---

## 4. Multi-Device Team Collaboration

All 4 team members can work simultaneously across separate laptops:

1. **Clone**: Every teammate clones your team's GitHub repository to their device.
2. **Syncing Progress**:
   - When one teammate finishes a feature or prompt:
     ```bash
     git add src/ docs/
     git commit -m "feat: implement feature description"
     git push origin main
     ```
   - Other teammates pull the latest updates:
     ```bash
     git pull origin main
     ```
3. **Agent Continuity**: When a teammate opens the updated repo on their laptop, their AI assistant automatically reads `docs/APPROACH.md` and recent `docs/logs.txt` entries, immediately picking up where the team left off.

---

*Build freely. Use AI freely. Secure what you build. Document what you claim. Prove what you implemented.*
