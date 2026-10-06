# Deployment Documentation — MarketHub (Team 51)

## Overview

MarketHub is a single TanStack Start application. `npm run build` produces a
self-contained Nitro server at `.output/server/index.mjs`; there is no separate
API service to deploy and no external database to provision.

---

## Live Deployment Reference

- **Live Application URL:** _not yet deployed_
- **Hosting Platform:** _to be decided_
- **Access Credentials (demo accounts for evaluators):**
  - Shopper: `priya@mail.com` / `Demo@1234`
  - Seller: `arjun@nordicsound.in` / `Demo@1234` (sees Nordic Sound Co. only)
  - Seller: `neha@stride.in` / `Demo@1234` (sees Stride Athletics only)

Both seller accounts are listed on purpose: signing into each one shows that a
seller sees only their own listings and only the order lines they are fulfilling.

The password above is the default `MH_SEED_PASSWORD`. Every seeded account holds
fictional sample data and is confined to its own slice by the same authorization
checks that protect a real account. The **admin** role is handled differently and
has no default password — it is only created when `MH_ADMIN_PASSWORD` is set.

---

## Required Environment Variables

| Variable Name | Description | Required |
|---------------|-------------|----------|
| `PORT` | Port to listen on. Most platforms inject this automatically. Defaults to 3000. | No |
| `MH_DATA_FILE` | Absolute path to the server data store. **Must point at a persistent volume** or all accounts and orders are lost on restart. See the warning below. | **Yes, in production** |
| `MH_SEED_PASSWORD` | Password for the seeded demo accounts. Defaults to `Demo@1234`. | No |
| `MH_ADMIN_PASSWORD` | Creates an admin account when set. **No default by design.** Leave unset unless an admin account is wanted. | No |
| `GEMINI_API_KEY` | Enables the Hubby AI assistant. Without it Hubby falls back to offline keyword matching. | No |
| `GEMINI_MODEL` | Optional model override for Hubby. | No |
| `NODE_ENV` | Not required for cookie security. Vite inlines it as `"production"` at build time, so the built server always sets the `Secure` flag on the session cookie. Verified against the production bundle. | No |

### Persistence warning

The server store is a JSON file written with an atomic write-then-rename. Its
default location is `./data/markethub.json`, which on most hosts sits **inside the
deployed bundle on an ephemeral filesystem**. On Render, Railway, Fly without a
volume, or any container host, that means every account, session and order is
discarded on restart or redeploy.

Attach a persistent disk and point `MH_DATA_FILE` at it:

```bash
MH_DATA_FILE=/var/lib/markethub/markethub.json
```

The directory is created automatically if missing. Note that the file contains
scrypt password hashes and live session ids, so the volume should not be publicly
readable and `data/` is gitignored.

---

## Build & Deployment Instructions

1. **Provision Node 22.12 or newer.** Declared in `package.json` `engines`.
   `@tanstack/start-server-core` requires it.

2. **Install dependencies from the lockfile:**
   ```bash
   npm ci
   ```

3. **Build:**
   ```bash
   npm run build
   ```
   Produces `.output/server/index.mjs` plus static assets in `.output/public/`.

4. **Attach a persistent volume and set `MH_DATA_FILE`** to a path on it.

5. **Start:**
   ```bash
   npm start
   ```
   Equivalent to `node .output/server/index.mjs`. Honours `PORT`.

6. **Health check:** there is no dedicated `/health` route. `/` returns HTTP 200
   and serves as the health check. Note it renders the full homepage via SSR.

---

## Post-Deployment Verification

Run against the live URL to confirm the security controls survived deployment:

```bash
npm run serverfn:ids              # from the same build that was deployed
export MH_FN_IDS="<ids>"
npm run test:e2e -- https://<live-url>
```

Expected: `PASS 110   FAIL 0`.

The ids are build-specific, so they must come from the exact build that was
deployed. Run this against a freshly started instance — the suite deliberately
exhausts the login rate-limit bucket at the end.

Minimum manual checks if the harness cannot be run:

- [ ] `/` loads over **HTTPS**.
- [ ] Sign-in works and the `mh_session` cookie shows `HttpOnly`, `Secure` and
      `SameSite=Strict` in browser devtools.
- [ ] Signing in as `arjun@nordicsound.in` shows only Nordic Sound Co.
- [ ] Placing an order charges the server-computed total and decrements stock.
- [ ] An order id from one account is not reachable from another.

---

## Deployment Record

| Date | Commit SHA | Platform | URL | Notes |
|------|-----------|----------|-----|-------|
| | | | | _not yet deployed_ |
