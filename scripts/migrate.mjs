/**
 * Idempotent migration runner for MarketHub's Neon Postgres schema.
 *
 * Reads DATABASE_URL with the same BOM-tolerant semantics as
 * src/lib/server/env.ts (nitro's parseEnv does not strip a UTF-8 BOM, so the
 * first key in a BOM-saved .env becomes "\uFEFFNAME"). Never prints the URL.
 *
 * Usage: npm run db:migrate
 */

import { readdir, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

const BOM = "\uFEFF";
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const MIGRATIONS_DIR = join(ROOT, "migrations");

/** Mirrors src/lib/server/env.ts serverEnv — never use process.env.DATABASE_URL raw. */
function serverEnv(name) {
  const raw = process.env[name] ?? process.env[BOM + name];
  const value = raw?.trim();
  return value ? value : undefined;
}

function redact(text) {
  return String(text).replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, "[redacted]");
}

function isTransient(err) {
  const msg = String(err?.message ?? err);
  return /fetch failed|ECONNRESET|ETIMEDOUT|socket|network/i.test(msg);
}

async function queryWithRetry(sql, text, params, attempts = 4) {
  let last;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await sql.query(text, params);
    } catch (err) {
      last = err;
      if (!isTransient(err) || i === attempts - 1) throw err;
      const wait = 400 * (i + 1);
      console.warn(`transient error, retry ${i + 1}/${attempts - 1} in ${wait}ms:`, redact(err?.message ?? err));
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw last;
}

async function main() {
  const url = serverEnv("DATABASE_URL");
  if (!url) {
    console.error(
      "DATABASE_URL is not set. Add it to .env (UTF-8 without BOM) and re-run npm run db:migrate.",
    );
    process.exit(1);
  }

  const sql = neon(url);

  // Ledger first. Sequential queries (not one big HTTP transaction) are more
  // reliable over the pooled endpoint when the link is flaky.
  await queryWithRetry(
    sql,
    `CREATE TABLE IF NOT EXISTS mh_migrations (
      name text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )`,
    [],
  );

  const appliedRows = await queryWithRetry(
    sql,
    `SELECT name FROM mh_migrations ORDER BY name`,
    [],
  );
  const applied = new Set(appliedRows.map((r) => r.name));

  const files = (await readdir(MIGRATIONS_DIR))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("No migration files found in migrations/.");
    return;
  }

  let ran = 0;
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`skip  ${file} (already applied)`);
      continue;
    }

    const body = await readFile(join(MIGRATIONS_DIR, file), "utf8");
    const statements = body
      .split(/^\s*--\s*@statement\s*$/m)
      .map((s) => s.trim())
      .filter(Boolean);

    for (const text of statements) {
      await queryWithRetry(sql, text, []);
    }
    await queryWithRetry(
      sql,
      `INSERT INTO mh_migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`,
      [file],
    );

    console.log(`apply ${file} (${statements.length} statements)`);
    ran += 1;
  }

  if (ran === 0) {
    console.log("All migrations already applied. No changes.");
  } else {
    console.log(`Done. Applied ${ran} migration(s).`);
  }
}

main().catch((err) => {
  console.error("Migration failed:", redact(err?.message ?? err));
  process.exit(1);
});
