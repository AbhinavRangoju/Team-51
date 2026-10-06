# Implementation Plan — Neon Postgres integration for MarketHub

Task: replace the **backend** of MarketHub's persistence layer with Neon Postgres while preserving
`src/lib/server/db.ts`'s exported interface exactly, so no caller in `src/lib/api/` or `src/routes/`
changes. The JSON file store remains a mandatory, fully working fallback.

Planned against the tree at commit `5f5fb120` (branch `main`).

---

## 0. What the exploration established

These are facts read out of the code, not assumptions. Everything below depends on them.

### 0.1 The real persistence boundary

`src/lib/server/db.ts` (306 lines) exports exactly this surface:

| Export | Kind | Notes |
|---|---|---|
| `Role`, `UserStatus`, `UserRow`, `SessionRow`, `VendorStatus`, `VendorRow`, `ProductStatus`, `ProductRow`, `OrderStatus`, `PaymentStatus`, `OrderItemRow`, `OrderRow` | types | the row shapes |
| `db()` | **sync** fn | returns `Db` = `{ t: {users,sessions,vendors,products,orders}: Map, emailIndex: Map, idemIndex: Map, seeded: boolean }` |
| `persist()` | **sync, fire-and-forget** | debounced flush on `queueMicrotask` |
| `tx(fn)` | **sync** | throws if `fn` returns a Promise |
| `newId()`, `newOrderId()`, `nowIso()` | sync | `newOrderId()` probes `d.t.orders.has(...)` |

Callers do far more than call accessors — they **mutate rows in place inside a synchronous critical
section**:

- `src/lib/api/checkout.ts`: `product.stock -= qty` inside `tx(() => ...)`; reads `d.idemIndex`,
  `d.t.products`, writes `d.t.orders` / `d.idemIndex`.
- `src/lib/api/orders.ts`: `order.status = "Cancelled"`, `order.eta = "—"`, `order.payment = "Refunded"`,
  `product.stock += item.qty` inside `tx()`.
- `src/lib/api/vendor.ts`: `order.status = FLOW[index + 1]`, `order.payment = "Paid"` inside `tx()`.
- `src/lib/api/auth.ts`: `d.emailIndex.has/get`, `d.t.users.set`, then `persist()`.
- `src/lib/server/session.ts`: `d.t.sessions.set/get/delete`, iteration in `revokeAllSessions`.
- `src/lib/server/guards.ts`: `[...db().t.vendors.values()].find(v => v.userId === user.id)`,
  `db().t.products.get()`, `db().t.orders.get()`.
- `src/test/backend.test.ts`: imports `db`, `newOrderId`, `tx` **statically** and mutates rows the same way.

**Consequence that drives the whole design:** `db()` is synchronous and hands out live mutable `Map`s.
Postgres access is asynchronous. There is therefore exactly one way to add a Postgres backend without
touching a single caller: **keep the in-memory working set as-is and change only where it is loaded
from and flushed to.** `tx()`'s "Node is single-threaded so a sync block cannot interleave" guarantee
is preserved untouched, because the critical section still runs entirely against memory.

Rejected alternative: making `db()` async / returning a repository of async methods. That is the
textbook design, and it rewrites every file listed above plus the test suite. The brief forbids it
("zero caller changes"), and it would also destroy `tx()`'s atomicity argument, which is the control
ADR-007 relies on.

### 0.2 Environment loading — the question is already answered in-tree

`src/lib/server/env.ts` (landed in `783f5234`) exports `serverEnv(name): string | undefined`. Its doc
comment records the mechanism and a real bug it caused:

- Nitro loads `.env` through `node:util.parseEnv`, so `.env` **is** placed into `process.env`. No
  dotenv dependency is needed.
- `parseEnv` does **not** strip a UTF-8 BOM. A `.env` saved as "UTF-8 with BOM" (common on Windows)
  attaches the BOM to the **first key**, yielding `"\uFEFFNAME"`, so `process.env.NAME` is `undefined`
  while the value sits correctly in the file. Nothing throws. This silently broke `GEMINI_API_KEY`.
- `serverEnv` tries the plain name, falls back to the BOM-prefixed name, trims, and treats
  whitespace-only as absent.

`DATABASE_URL` is currently the **only** key in `.env`, i.e. it occupies exactly the first-key position
that breaks the moment anyone re-saves the file with a BOM. So: **all `DATABASE_URL` reads go through
`serverEnv("DATABASE_URL")`, never `process.env.DATABASE_URL`.** Usage pattern to copy is
`src/lib/hubby/gemini.ts:15,63,86,89`.

Empirically confirmed that env reads survive the nitro build as *runtime* lookups, not build-time
inlines: `.output/server/_ssr/gemini-EgdzX_Ay.mjs` contains `process.env.GEMINI_API_KEY?.trim()`
verbatim at lines 336/349. Only `NODE_ENV`, `TSS_SHELL` and `TSS_PRERENDERING` are substituted. So
reading `DATABASE_URL` at runtime in server code is sound.

**Unresolved conflict in the repo's own docs, and how this plan resolves it.**
`docs/TECHNICAL_SECURITY_DOCUMENTATION.md` (~line 798) states, from a verified probe, that `vite dev`
loads `.env` into `process.env` but `node .output/server/index.mjs` does **not**. `src/lib/server/env.ts`
states nitro loads `.env`. These disagree about the built-server case. Rather than bet on either,
the decision is to make the built server load it explicitly:

| Context | Mechanism | Change |
|---|---|---|
| `npm run dev` (`vite dev`) | nitro/vite loads `.env` | none |
| `npm start` | add `--env-file-if-exists=.env` | **changed** — resolves the conflict; harmless if nitro already loaded it, because Node's `--env-file` does not override already-set variables |
| `npm test` (vitest, no nitro) | `.env` deliberately **not** loaded | none — this is what makes the JSON fallback the default for the unit suite |
| `npm run db:migrate` / `db:inspect` / `test:db` (plain node / vitest) | `node --env-file-if-exists=.env ...` | **new scripts** |

Verified on this machine (Node v24.13.0, npm 11.6.2): `node --env-file-if-exists=.env -e ...` works;
`node_modules/vite/bin/vite.js` (vite 8.3.2) and `node_modules/vitest/vitest.mjs` (vitest 4.1.11) are
both directly node-invocable, so the flag can be applied to any of them if ever needed.

`scripts/*.mjs` cannot import `src/lib/server/env.ts` (TypeScript, and `@/` alias is a bundler
concern). Those scripts therefore **mirror `serverEnv`'s exact semantics inline** — try the plain key,
fall back to `"\uFEFF" + key`, trim, treat blank as absent — with a comment pointing at
`src/lib/server/env.ts` as the source of truth. This duplication is deliberate and documented; reading
`process.env.DATABASE_URL` raw in a script is not acceptable because `--env-file` uses the same
BOM-naive parser.

### 0.3 Driver choice and pooler compatibility

- `@neondatabase/serverless` — latest published version is **`1.2.0`** (confirmed via
  `npm view @neondatabase/serverless version`). Pin **exactly** `1.2.0`, no caret. The coder must
  re-confirm with `npm view` before pinning in case a newer release lands.
- **No ORM.** Hand-written parameterized SQL, matching this codebase's hand-rolled, zero-ORM style.
- **HTTP path only.** Import `{ neon }` and nothing else. Do not import `Pool` or `Client`.
  Per the [Neon serverless driver docs](https://neon.com/docs/serverless/serverless-driver):
  `neon()` sends each query as one HTTP fetch and is the recommended default; `Pool`/`Client` use
  WebSockets and exist for interactive transactions and node-postgres compatibility. Avoiding them
  keeps WebSocket code out of the nitro bundle and avoids any `ws` dependency question.
- API surface available on the value returned by `neon()`:
  - tagged template — `` sql`SELECT ... WHERE id = ${id}` ``
  - `sql.query(text, params)` — manual parameterization, which is what hand-written SQL wants
  - `sql.transaction([...])` — multiple queries in **one non-interactive transaction, one HTTP request**
  - `sql.unsafe(str)` — trusted-string interpolation. **This project must never call `unsafe()`.**
- **Pooler reasoning (host is `...-pooler...`).** The pooled Neon host routes through PgBouncer in
  transaction mode, which forbids state that spans statements (session-scoped `SET`, reused named
  prepared statements, advisory locks held across calls, `LISTEN`/`NOTIFY`). The HTTP driver sends each
  query, and each `sql.transaction([...])` batch, as a single self-contained request with its own
  `BEGIN`/`COMMIT`, so it never relies on cross-statement session state. That is precisely the usage
  transaction-mode pooling supports, and Neon documents the pooled endpoint as the one to use for
  application queries. Therefore the driver is compatible, and the design additionally commits to
  using **no** session-scoped feature.
- TLS: the connection string already carries `sslmode=require`. Pass the string through unmodified.
  Never append `sslmode=disable`, never set `rejectUnauthorized: false`, never touch
  `NODE_TLS_REJECT_UNAUTHORIZED`.
- Node >= 19 is required by the driver; `engines.node` is `>=22.12.0` and the machine runs 24.13.0.

### 0.4 Verification baseline on `5f5fb120` (do not count these as regressions)

- `npx tsc --noEmit` → **exactly 11 errors**: 10 in `src/components/ui/chart.tsx`, 1 in
  `src/components/ui/calendar.tsx`. Pre-existing stale shadcn wrappers; neither file is imported by a
  route. The gate is "still exactly these 11, and zero under `src/lib/`, `src/test/` or `scripts/`".
- `npx vitest --run` → 2 test files, **26/26 passing**, when run with a temporary `MH_DATA_FILE`.
  Without that override the suite writes into the repo's real `data/markethub.json` and two
  idempotency-key tests fail on the second run (reproduced: "expected 110 to be 107" and
  "expected 110 to be 108"). **Every test run in this plan sets a temporary `MH_DATA_FILE` and deletes
  it afterwards**, as the team's prior turns did.
- `npm run build` → exit 0, `.output/server/index.mjs` ~26 KB, 70 client assets, only upstream
  react-query `"use client"` warnings.

### 0.5 Onboarding state — explicit conclusion: stays client-side, no schema

`src/lib/onboarding-store.ts` is `localStorage`-only and its own header says: "Frontend-only
onboarding state. The backend must remain the source of truth for roles once one exists — this only
remembers UI progress on this device." It stores `onboardingCompleted`, `selectedRole`,
`onboardingStep`, `customerPreferences`, `vendorSetupStatus`.

**Conclusion: no Postgres columns, no tables, no server writes for onboarding.** Reasons: (1) it is UI
progress and carries zero authority; (2) `selectedRole` is *not* the security role — `signup` in
`src/lib/api/auth.ts` takes no role parameter and every new account is `customer`, re-read from the
session on each request, so persisting a client-chosen `selectedRole` server-side would manufacture
exactly the privilege-escalation surface ADR-004 removed; (3) adding it would mean a new write
endpoint, which is unrequested scope and new attack surface. `src/components/auth/AuthPanel.tsx`
routing first-run sign-ins to `/onboarding` needs nothing from the persistence layer.

---

## 1. Architecture decisions

**D1 — In-memory working set, pluggable persistence.** `db.ts` becomes a coordinator over a
`StorePersistence` interface with two implementations. Both produce and consume the *same* `Persisted`
shape that `hydrate()` already accepts, so `hydrate()`, `snapshot()`, `tx()`, `newId()`, `newOrderId()`
and `nowIso()` are untouched.

```
StorePersistence = {
  load(): Promise<Persisted>
  save(snapshot: Persisted): Promise<void>
  readonly kind: "json" | "postgres"
}
```

**D2 — Backend selection.** A pure function `selectBackend(url: string | undefined): "json" | "postgres"`
returns `"postgres"` when the value is a non-blank string, else `"json"`. It is called with
`serverEnv("DATABASE_URL")`. Pure and exported so it is unit-testable without touching module globals.

**D3 — Async hydration with a synchronous `db()`.** New export `ensureStoreReady(): Promise<void>`,
idempotent, caches its promise. Awaited in a new **unfiltered request middleware in `src/start.ts`**
— which is a server entry point, not a caller in `src/lib/api/` or `src/routes/`, so the
zero-caller-change rule holds. This covers server functions and SSR document requests alike, the same
hook the existing `errorMiddleware` and `csrfMiddleware` use.
With the JSON backend, `db()` keeps today's lazy `readFileSync` behaviour exactly, so nothing about
`npm test` or the JSON path changes. With the Postgres backend, if `db()` is somehow reached before
hydration completes it **throws a plain `Error`** — `guarded()` in `validate.ts` converts that to the
generic "Something went wrong" message and logs server-side. A loud failure, never a silent empty
store that would look like an empty catalogue.

**D4 — Flush = whole-snapshot upsert with tombstone deletes, 11 statements, constant.** Per data table,
two statements: one `INSERT ... SELECT ... FROM jsonb_to_recordset($1::jsonb) ... ON CONFLICT (id) DO
UPDATE`, and one `DELETE ... WHERE id <> ALL($1::text[])`. All eleven run inside one
`sql.transaction([...])`.
Chosen over (a) delete-all-then-insert, because a failure mid-flush must never be able to empty the
catalogue; and over (b) one statement per row, because a constant 11-statement flush is far easier to
audit for "is every statement parameterized" than an N-statement one, and the statement count stops
depending on row count. Dirty-row tracking was rejected: callers mutate rows in place
(`product.stock -= qty`), so changes cannot be observed without Proxies.
Honest cost: O(rows) bytes per flush. At this scale (14 users, 8 vendors, 12 products, tens of orders)
that is irrelevant; it is recorded as a scaling limit in the ADR.

**D5 — Statement ordering inside the transaction.** Upserts parent-first, deletes child-first, so
immediate FK checks always pass:
`users → vendors → products → orders → sessions → meta`, then
`delete sessions → orders → products → vendors → users`.
FKs stay non-deferrable; explicit ordering is easier to review than `DEFERRABLE INITIALLY DEFERRED`.

**D6 — Serialized flushes.** `persist()` keeps its exact signature (`(): void`) and its microtask
debounce. Internally, if a flush is in flight, set a `dirty` flag and re-flush once it settles, so two
snapshot writes can never interleave in the database. New export `flushNow(): Promise<void>` awaits
the pending flush — needed by one-shot scripts and the live test so the process cannot exit before the
write lands. `flushNow` is additive; no existing caller changes.

**D7 — Timestamps stored as `text`, not `timestamptz`.** Every `createdAt` in the row types is an ISO
string, and `src/lib/api/orders.ts` / `vendor.ts` sort with `b.createdAt.localeCompare(a.createdAt)`
while `toOrderDto` returns it verbatim. A `timestamptz` round-trip would reformat the string (offset
notation, fractional-second rendering), changing sort behaviour and DTO output the tests assert.
Storing the exact string is lossless. `SessionRow.expiresAt` is epoch milliseconds → `bigint`.

**D8 — Numeric coercion on hydrate is mandatory.** `node-postgres`-family drivers return `int8`/`numeric`
as **strings**. `session.expiresAt < Date.now()` would be a string comparison and silently break
session expiry. Every numeric column is passed through `Number(...)` in the row mapper, and a unit test
feeds string values to prove the mapper produces `number`s.

**D9 — Migrations: `migrations/001_init.sql` + a `mh_migrations` ledger.** Chosen over a single
`schema.sql` because it gives a real forward path. Idempotent twice over: the ledger skips files
already applied, and every statement is `CREATE TABLE IF NOT EXISTS` / `CREATE INDEX IF NOT EXISTS`
so even a wiped ledger is safe. Statements are separated by a `-- @statement` sentinel line and split
on it — never by splitting on `;`, which breaks on dollar-quoted blocks and semicolons inside literals.

**D10 — Table prefix `mh_`.** Namespaces MarketHub's tables inside a database the user may share.

**D11 — Error redaction.** A `redactDbUrl(text)` helper strips anything matching
`postgres(ql)?://...` from a string before it is logged. Applied to every message `db.ts` or the
Postgres module logs. Existing behaviour of logging only `error.message` is kept. No DB error text ever
reaches a client — `guarded()` already guarantees that, and this plan adds nothing that bypasses it.

---

## 2. Schema

`migrations/001_init.sql`, statements separated by `-- @statement`.

```
mh_migrations(name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())
mh_meta(key text PRIMARY KEY, value text NOT NULL)            -- holds key 'seeded'

mh_users
  id text PK | email text NOT NULL UNIQUE | name text NOT NULL | phone text NULL
  password_hash text NOT NULL | password_salt text NOT NULL
  role text NOT NULL CHECK (role IN ('customer','vendor','admin'))
  status text NOT NULL CHECK (status IN ('Active','Suspended'))
  created_at text NOT NULL

mh_sessions
  id text PK | user_id text NOT NULL REFERENCES mh_users(id) ON DELETE CASCADE
  expires_at bigint NOT NULL | created_at text NOT NULL
  idx: (user_id), (expires_at)

mh_vendors
  id text PK | user_id text NULL REFERENCES mh_users(id) ON DELETE SET NULL
  name/tagline/city text NOT NULL | since integer NOT NULL
  status text NOT NULL CHECK (status IN ('Verified','Pending Verification','Rejected'))
  verified boolean NOT NULL | rating double precision NOT NULL | created_at text NOT NULL
  idx: (user_id)                       -- requireVendor() looks a store up by owner

mh_products
  id text PK | vendor_id text NOT NULL REFERENCES mh_vendors(id) ON DELETE CASCADE
  name/category/brand text NOT NULL
  price_paise integer NOT NULL CHECK (price_paise >= 0)
  original_price_paise integer NULL CHECK (original_price_paise IS NULL OR original_price_paise >= 0)
  stock integer NOT NULL CHECK (stock >= 0)
  rating double precision NOT NULL | reviews integer NOT NULL | sku text NOT NULL
  status text NOT NULL CHECK (status IN ('Active','Draft','Archived'))
  description text NOT NULL | specs jsonb NOT NULL DEFAULT '{}'::jsonb | created_at text NOT NULL
  idx: (vendor_id)                     -- the seller->product relation

mh_orders
  id text PK | user_id text NOT NULL REFERENCES mh_users(id) ON DELETE CASCADE
  items jsonb NOT NULL
  subtotal_paise/discount_paise/delivery_paise/tax_paise/total_paise integer NOT NULL
  status text NOT NULL CHECK (status IN ('Order Placed','Confirmed','Processing','Shipped',
                                         'Out for Delivery','Delivered','Cancelled'))
  payment text NOT NULL CHECK (payment IN ('Paid','Pending','Refunded'))
  method/eta text NOT NULL
  ship_name/ship_phone/ship_line/ship_city/ship_pin text NOT NULL
  idempotency_key text NOT NULL UNIQUE          -- mirrors idemIndex
  created_at text NOT NULL
  idx: (user_id), (created_at DESC)
```

Notes the coder must honour:
- Session lookup is by primary key, so it is already indexed — that satisfies the "index on session
  id/token lookup" requirement. The extra `(user_id)` index serves `revokeAllSessions`.
- `CHECK (stock >= 0)` mirrors the in-memory invariant in `checkout.ts` as a second line of defence.
- `specs` and `items` are nested structures → `jsonb`.
- `backend.test.ts` creates orders for synthetic user ids like `"owner-1"` that do not exist as users.
  Those tests run on the **JSON** backend, where no FK applies. The live test must create a real user
  row first. Do not relax the FK to accommodate the JSON-path tests.

### Upsert statement shape (products shown; replicate per table)

```sql
INSERT INTO mh_products (id, vendor_id, name, category, brand, price_paise,
                         original_price_paise, stock, rating, reviews, sku, status,
                         description, specs, created_at)
SELECT r.id, r.vendor_id, r.name, r.category, r.brand, r.price_paise,
       r.original_price_paise, r.stock, r.rating, r.reviews, r.sku, r.status,
       r.description, r.specs, r.created_at
FROM jsonb_to_recordset($1::jsonb) AS r(
  id text, vendor_id text, name text, category text, brand text,
  price_paise integer, original_price_paise integer, stock integer,
  rating double precision, reviews integer, sku text, status text,
  description text, specs jsonb, created_at text)
ON CONFLICT (id) DO UPDATE SET
  vendor_id = EXCLUDED.vendor_id, name = EXCLUDED.name, /* ... every non-id column ... */
  created_at = EXCLUDED.created_at
-- @statement
DELETE FROM mh_products WHERE id <> ALL($1::text[])
```

Parameter encoding: pass `JSON.stringify(rows)` for the `jsonb` parameter, and a JS `string[]` for the
`text[]` parameter. If the driver's JS-array-to-`text[]` mapping misbehaves, the decided fallback is
`WHERE id <> ALL(SELECT jsonb_array_elements_text($1::jsonb))` with `JSON.stringify(ids)`.
`id <> ALL('{}')` is `TRUE` for every row, so an empty in-memory table correctly empties the SQL table —
memory is authoritative.

---

## 3. Files

| Path | Status | Purpose |
|---|---|---|
| `package.json` | modified | pin `@neondatabase/serverless@1.2.0`; add `db:migrate`, `db:inspect`, `test:db`; add `--env-file-if-exists=.env` to `start` |
| `migrations/001_init.sql` | new | the DDL above |
| `scripts/migrate.mjs` | new | idempotent ledger-based runner |
| `scripts/db-inspect.mjs` | new | read-only catalog assertions + row counts |
| `src/lib/server/store-types.ts` | new | `Persisted`, `StorePersistence`, `SqlExecutor`, `selectBackend`, `redactDbUrl` |
| `src/lib/server/store-json.ts` | new | today's `loadFromDisk` + atomic write-then-rename, extracted verbatim |
| `src/lib/server/store-postgres.ts` | new | `createNeonExecutor`, `createPostgresPersistence`, all SQL, row mappers |
| `src/lib/server/db.ts` | modified | coordinator: `ensureStoreReady`, `flushNow`, serialized async flush; **all existing exports unchanged** |
| `src/start.ts` | modified | hydration request middleware |
| `src/test/setup.ts` | modified | delete `process.env.DATABASE_URL` so the unit suite can never hit a live DB |
| `src/test/db-sql.test.ts` | new | mocked-executor SQL tests |
| `vitest.config.ts` | modified | exclude `**/*.live.test.ts` from the default run |
| `vitest.live.config.ts` | new | live-only config, no `setupFiles` |
| `src/test/postgres-live.test.ts` | new | live round-trip through the `db.ts` interface |
| `.env.example` | modified | append a commented `DATABASE_URL` section |
| `docs/APPROACH.md` | modified | ADR-010 + surgical §2.1 / §2.3 updates |
| `docs/TECHNICAL_SECURITY_DOCUMENTATION.md` | modified | correct the now-false "no database / no SQL" claims |
| `docs/logs.txt` | modified | one appended turn entry (append-only) |

---

## 4. Ordered implementation plan

### Phase A — schema, migrations, tooling

- [ ] 1. Pin the driver and add the npm scripts.
      `npm view @neondatabase/serverless version` to re-confirm, then
      `npm install --save-exact @neondatabase/serverless@1.2.0`. Verify `package.json` shows
      `"1.2.0"` with no caret. Add scripts: `"db:migrate": "node --env-file-if-exists=.env scripts/migrate.mjs"`,
      `"db:inspect": "node --env-file-if-exists=.env scripts/db-inspect.mjs"`,
      `"test:db": "node --env-file-if-exists=.env node_modules/vitest/vitest.mjs run --config vitest.live.config.ts"`,
      and change `start` to `"node --env-file-if-exists=.env .output/server/index.mjs"`.
      Files: `package.json`, `package-lock.json`
      Verify: `npm run build` exits 0 and `.output/server/index.mjs` still ~26 KB;
      `npx tsc --noEmit` still exactly 11 pre-existing errors.

- [ ] 2. Probe the three driver unknowns against the live DB and write the answers into
      `FEAT-001.findings` before building on them. Throwaway script, deleted after:
      (a) does `sql.transaction([...])` accept items built by `sql.query(text, params)`?
      (b) does `sql.transaction([...])` accept DDL over the pooled HTTP endpoint?
      (c) does a JS `string[]` bind correctly to `$1::text[]`?
      Ordered fallbacks if any answer is no: for (a)/(b) run the statements sequentially via
      `sql.query()` — still idempotent because all DDL is `IF NOT EXISTS`; for (c) use the
      `jsonb_array_elements_text` form from §2.
      Files: none committed
      Verify: each probe prints a definite yes/no; never print the connection string.

- [ ] 3. Write `migrations/001_init.sql` exactly as specified in §2, `-- @statement`-separated.
      Files: `migrations/001_init.sql`
      Verify: covered by item 4.

- [ ] 4. Write `scripts/migrate.mjs`.
      Reads `DATABASE_URL` with inline BOM-tolerant semantics mirroring `src/lib/server/env.ts`
      (comment must say so). If absent: print a clear actionable message naming `DATABASE_URL` and
      `.env`, and `process.exit(1)` — never a stack trace, never the value. Creates
      `mh_migrations` first, reads `migrations/*.sql` sorted by name, skips applied files, splits on
      `-- @statement`, runs each file's statements plus its ledger insert in one transaction.
      Files: `scripts/migrate.mjs`
      Verify: `npm run db:migrate` succeeds; **run it a second time** and confirm it reports the
      migration already applied and makes no changes. To prove the loud failure path, temporarily
      rename `.env` to `.env.bak`, run `npm run db:migrate`, confirm exit code 1 with a clear message
      naming `DATABASE_URL`, then restore `.env` immediately. Do not mutate the shell environment.

- [ ] 5. Write `scripts/db-inspect.mjs` — read-only, no writes, no DDL, no DELETE.
      Queries `information_schema` / `pg_indexes` and prints: the 7 `mh_*` tables; the UNIQUE
      constraint on `mh_users.email`; the UNIQUE constraint on `mh_orders.idempotency_key`; every FK
      with its referenced table; every index; and `COUNT(*)` per table.
      Files: `scripts/db-inspect.mjs`
      Verify: `npm run db:inspect` lists all 7 tables, the unique email constraint, the 4 FKs
      (`mh_sessions.user_id`, `mh_vendors.user_id`, `mh_products.vendor_id`, `mh_orders.user_id`) and
      the `(user_id)`, `(expires_at)`, `(vendor_id)`, `(created_at)` indexes.

### Phase B — the store adapter

- [ ] 6. Create `src/lib/server/store-types.ts`: move `Persisted` out of `db.ts`, add
      `StorePersistence`, `SqlExecutor` (`{ query(text, params): Promise<Record<string, unknown>[]>;
      transaction(items: {text: string; params: unknown[]}[]): Promise<unknown[]> }`), plus pure
      `selectBackend(url)` and `redactDbUrl(text)`.
      Files: `src/lib/server/store-types.ts`
      Verify: `npx tsc --noEmit` — still exactly 11 pre-existing errors.

- [ ] 7. Create `src/lib/server/store-json.ts` — `createJsonPersistence(dataFile)` returning
      `{ kind: "json", load, save }`, lifting today's `loadFromDisk` / `flush` bodies verbatim,
      including the write-then-rename and the deliberate "do not log the raw error / absolute path"
      comment.
      Files: `src/lib/server/store-json.ts`
      Verify: `npx tsc --noEmit` clean of new errors.

- [ ] 8. Create `src/lib/server/store-postgres.ts` — `createNeonExecutor(connectionString)` (dynamic
      `import("@neondatabase/serverless")`, `neon()`, HTTP only, never `unsafe()`), and
      `createPostgresPersistence(exec: SqlExecutor)` with `load()` (6 SELECTs, mappers applying
      `Number(...)` per D8) and `save()` (the 11 statements in D4/D5 order, one transaction).
      Every statement uses `$n` placeholders only — zero string interpolation of any value.
      Files: `src/lib/server/store-postgres.ts`
      Verify: covered by items 11 and 13.

- [ ] 9. Rework `src/lib/server/db.ts` as the coordinator. Keep `db`, `persist`, `tx`, `newId`,
      `newOrderId`, `nowIso` and every exported type **identical in name, signature and behaviour**.
      Add `ensureStoreReady()` and `flushNow()`. Read the URL via
      `serverEnv("DATABASE_URL")` (`import { serverEnv } from "./env"`). Pick the backend with
      `selectBackend`. Keep the `globalThis` singleton key. Keep the JSON path's lazy synchronous
      load so `npm test` behaviour is byte-identical to today. Implement D6 serialized flush and D11
      redaction on every log line.
      Files: `src/lib/server/db.ts`
      Verify: with a temp `MH_DATA_FILE` and `DATABASE_URL` unset,
      `npx vitest --run` → 26/26 passing, i.e. `src/test/backend.test.ts` still green unchanged;
      `npx tsc --noEmit` still exactly 11 errors.

- [ ] 10. Add the hydration middleware to `src/start.ts`: an unfiltered `createMiddleware().server`
      that `await`s `ensureStoreReady()` (via `await import("./lib/server/db")`) before `next()`,
      registered **first** in `requestMiddleware`, ahead of `errorMiddleware`. Do not alter the
      existing middleware or the CSRF filter.
      Files: `src/start.ts`
      Verify: `npm run build` exits 0; `npx tsc --noEmit` still exactly 11 errors.

- [ ] 11. Add `src/test/db-sql.test.ts` using a fake `SqlExecutor` that records every
      `{text, params}`. Assert: every statement contains `$1`-style placeholders; **no** statement text
      contains a data value (feed a user whose email and password hash are distinctive sentinels and
      assert both appear only in `params`, never in `text`); statement count is constant at 11 for 1
      row and for 100 rows; upsert order is users→vendors→products→orders→sessions→meta and delete
      order is the reverse; the row mapper coerces string-typed numeric columns to `number`
      (D8); `selectBackend` returns `"postgres"` for a URL, `"json"` for `undefined`, `""` and
      `"   "`; `redactDbUrl` removes a `postgresql://user:pw@host/db` substring; and a `console.error`
      spy proves a simulated flush failure logs no connection string.
      Files: `src/test/db-sql.test.ts`
      Verify: `npx vitest --run` → 26 existing + new tests all passing.

- [ ] 12. Add the `DATABASE_URL` guard to `src/test/setup.ts`
      (`delete process.env.DATABASE_URL;` with a comment explaining it stops the unit suite from ever
      writing to a live database) and add `exclude: ["**/*.live.test.ts"]` alongside the existing
      `include` in `vitest.config.ts`.
      Files: `src/test/setup.ts`, `vitest.config.ts`
      Verify: `npx vitest --run` → all tests pass and the live file is not collected.

### Phase C — live verification and documentation

- [ ] 13. Add `vitest.live.config.ts` (same `@` alias, `environment: "node"`, no `setupFiles`,
      `include: ["src/test/**/*.live.test.ts"]`) and `src/test/postgres-live.test.ts`. The live test:
      `await ensureStoreReady()`; assert the backend is `postgres`; `seedIfEmpty()`; `await flushNow()`;
      record per-table row counts; run `seedIfEmpty()` again and assert **counts are unchanged**;
      assert zero `role = 'admin'` rows while `MH_ADMIN_PASSWORD` is unset; snapshot the bytes of
      `data/markethub.json` before the run; create a uniquely-named throwaway user
      (`neon-live-<uuid>@example.invalid`) through `db().t.users.set(...)` + `persist()` + `flushNow()`,
      re-hydrate from Postgres and assert it is there, update one field and assert the update
      round-trips, then assert `data/markethub.json` bytes are **unchanged**; finally, in a `finally`
      block, delete **only** that user row (and its cascaded rows) by id. No DROP, no TRUNCATE, no
      table-wide DELETE anywhere.
      Files: `vitest.live.config.ts`, `src/test/postgres-live.test.ts`
      Verify: `npm run test:db` → all assertions pass; `npm run db:inspect` afterwards shows row
      counts back at their post-seed values.

- [ ] 14. Run the full live checklist end to end and record the output in `FEAT-003.findings`:
      `npm run db:migrate` twice (second is a no-op); `npm run db:inspect`; `npm run test:db`;
      `npm run build`; then with `DATABASE_URL` unset and a temp `MH_DATA_FILE`, `npx vitest --run`
      → 26/26 to prove the JSON fallback survives; and a built-server env probe that prints only
      `Boolean(DATABASE_URL)` to settle the §0.2 doc conflict without a long-running server.
      Files: none
      Verify: every command above exits 0 / passes; delete the temp data file afterwards.

- [ ] 15. Scan the built client bundle for leakage, matching the project's existing practice.
      Grep `.output/public/assets/**` for `neon`, `DATABASE_URL`, `postgresql://`, `@neondatabase`
      and the Neon host suffix → expect **0 hits**; confirm the same strings appear only under
      `.output/server/`.
      Files: none
      Verify: 0 client-side hits.

- [ ] 16. Append the `DATABASE_URL` section to `.env.example`, in the existing commented style, under
      a new `# Postgres (Neon) data store` banner placed just above the existing
      `# Server data store` block. Explain: unset → JSON file store, exactly as today; set → Neon
      Postgres; must include `sslmode=require`; use the pooled `-pooler` host; run `npm run db:migrate`
      first. **No real value, no host, no endpoint id.** Do not disturb the teammate's new BOM guidance.
      Files: `.env.example`
      Verify: read the file back; confirm the BOM paragraph and every pre-existing block are intact
      and no secret is present.

- [ ] 17. Add **ADR-010** to `docs/APPROACH.md`, inserted after ADR-009 (which currently ends at
      line ~312, before the `---` preceding `## 5` at line 314), using the house format exactly:
      `Status` / `Context` / `Options Considered` / `Decision & Rationale` /
      `Security & Performance Trade-offs`. Title: "ADR-010: Neon Postgres behind the existing store
      interface, with the JSON file store as fallback". It must state: that it supersedes the
      "revisit after the event" note in ADR-007; why Neon (managed, serverless, pooled HTTP endpoint,
      no native build — which is what killed SQLite in ADR-003/ADR-007); the adapter/fallback design
      and why the in-memory working set stays (preserving `tx()`'s atomicity argument and zero caller
      changes); the schema and why timestamps are `text`; the migration path; and honest trade-offs —
      O(rows) snapshot flush, durability now depends on a network hop, and **horizontal scaling is
      still not solved** because each process holds its own working set. Then make two surgical edits:
      the TB3 box in the §2.1 diagram (line ~116-155) to name both backends, and the persistence
      bullet in §2.3 (line ~177) to point at ADR-010. Change nothing else.
      Files: `docs/APPROACH.md`
      Verify: `Select-String -Path docs/APPROACH.md -Pattern '^### ADR-'` lists ADR-001..ADR-010 in
      order; the ADR-007 text is still present.

- [ ] 18. Correct the now-false claims in `docs/TECHNICAL_SECURITY_DOCUMENTATION.md`:
      the `### Database` section (line ~263, "**None in this build.**"); the **A03 Injection** row
      (line ~462, "No SQL (no database)") — which must now say SQL exists and is exclusively
      parameterized with zero interpolation of request data; and the deployment note (line ~805,
      "No database or external service needs provisioning"). Keep each edit minimal and in the
      document's voice; do not restructure it.
      Files: `docs/TECHNICAL_SECURITY_DOCUMENTATION.md`
      Verify: `Select-String` for "No SQL (no database)" and "None in this build" returns no stale
      matches in the persistence/A03 context.

- [ ] 19. Append exactly one AGENTS.md §5.2 turn entry to the **end** of `docs/logs.txt`, then commit.
      ISO-8601 timestamp with `+05:30`; verbatim user prompt; agent response; every relative file
      path with Created/Modified; the commit SHA. **Never** write the connection string, the Neon host
      or the endpoint id. Do not rewrite, reorder or delete any existing entry and do not touch the
      two "MERGE RECONCILIATION" seam notes.
      Re-check `git status` first (teammates are pushing to `main`). Stage **only** the files this task
      changed plus `docs/logs.txt`, by name. Never `git add -A`. Do **not** stage
      `src/routeTree.gen.ts` — its modification is an empty CRLF-only diff the team has decided to
      leave uncommitted. Never stage `.env`, `node_modules/`, `.output/` or `data/`. **Do not push.**
      Files: `docs/logs.txt`
      Verify: `git show --stat HEAD` lists only intended files; `git status` still shows
      `src/routeTree.gen.ts` as unstaged; `git log --oneline -1` gives the SHA recorded in the log.

---

## 5. Security requirements (non-negotiable, applies to every item above)

1. **Parameterized SQL only.** Every value reaches Postgres as a `$n` bind parameter. Zero string
   interpolation of any value, and nothing derived from a request body ever contributes to statement
   *text*. No dynamic SQL. `sql.unsafe()` is never called. Table and column names are compile-time
   constants in source, never variables.
2. **Credential hygiene.** `DATABASE_URL` is read only through `serverEnv("DATABASE_URL")` (or the
   mirrored semantics in `.mjs` scripts), never hardcoded, never logged, never committed, never
   written into `.env.example`, `docs/APPROACH.md`, `docs/logs.txt` or any other tracked file. The
   Neon host and endpoint id are equally off-limits in tracked files. `redactDbUrl` guards every log
   line the new code emits.
3. **TLS.** The connection string's `sslmode=require` is preserved verbatim. Never disable or weaken
   certificate verification by any mechanism.
4. **Hashing unchanged.** `src/lib/server/password.ts` is not touched. `password_hash` /
   `password_salt` store the existing scrypt outputs. No plaintext password is ever written.
5. **No raw DB errors to clients.** `guarded()` in `validate.ts` stays the only error boundary; its
   behaviour and the existing `AppError` shape are unchanged. Driver errors are logged (redacted)
   server-side and surface to the client as today's generic message.
6. **Authorization untouched.** `guards.ts`, `dto.ts`, `session.ts` and every ownership and
   role check keep working against the same in-memory rows. No new endpoint, no new write path, no
   query that could return another seller's or shopper's rows. The FK/index work is additive.
7. **Seeding rules preserved exactly.** Admin account **only** when `MH_ADMIN_PASSWORD` is set, with
   no default; demo password from `MH_SEED_PASSWORD` defaulting to `Demo@1234`; the `seeded` flag
   (now `mh_meta`) keeps seeding idempotent across restarts and across both backends.
8. **No destructive operations.** No `DROP DATABASE`, no `DROP TABLE`, no `TRUNCATE`, no table-wide
   `DELETE` in any npm script. `db:inspect` is strictly read-only. The live test cleans up only the
   specific rows it created, by id.

## 6. Windows / PowerShell constraints for the implementer

- Chain commands with `;`, never `&&`.
- Never start a long-running dev server. One-shot commands only (`vitest --run`, `npm run build`).
- Quote any path containing spaces; the workspace path contains `OneDrive`.
- Do not mutate the shell's environment to test the missing-`DATABASE_URL` path — temporarily rename
  `.env` instead, and restore it immediately.

## 7. Assumptions

- The live Neon database is empty of `mh_*` tables at the start. If `001_init.sql` finds them already
  present, `IF NOT EXISTS` makes that a no-op, which is the intended behaviour.
- `data/markethub.json` keeps its current contents; nothing in this task deletes or rewrites it. The
  live test only reads its bytes to prove Postgres writes did not touch it.
- The suite's existing dependence on a clean `MH_DATA_FILE` is treated as pre-existing and is handled
  by the verification procedure, not by changing `src/test/setup.ts` to fabricate a temp path — that
  would be an unrequested change to the team's established workflow.
