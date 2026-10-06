/**
 * Read-only catalog inspector for MarketHub's mh_* tables.
 * Never writes, never drops, never prints DATABASE_URL.
 *
 * Usage: npm run db:inspect
 */

import { neon } from "@neondatabase/serverless";

const BOM = "\uFEFF";

/** Mirrors src/lib/server/env.ts serverEnv. */
function serverEnv(name) {
  const raw = process.env[name] ?? process.env[BOM + name];
  const value = raw?.trim();
  return value ? value : undefined;
}

function redact(text) {
  return String(text).replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, "[redacted]");
}

async function main() {
  const url = serverEnv("DATABASE_URL");
  if (!url) {
    console.error(
      "DATABASE_URL is not set. Add it to .env (UTF-8 without BOM) and re-run npm run db:inspect.",
    );
    process.exit(1);
  }

  const sql = neon(url);

  async function query(text, params) {
    let last;
    for (let i = 0; i < 4; i += 1) {
      try {
        return await sql.query(text, params);
      } catch (err) {
        last = err;
        const msg = String(err?.message ?? err);
        if (!/fetch failed|ECONNRESET|ETIMEDOUT|socket|network/i.test(msg) || i === 3) {
          throw err;
        }
        await new Promise((r) => setTimeout(r, 400 * (i + 1)));
      }
    }
    throw last;
  }

  const tables = await query(
    `SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name LIKE 'mh_%'
     ORDER BY table_name`,
    [],
  );
  console.log("\n=== mh_* tables ===");
  for (const t of tables) console.log(`  ${t.table_name}`);
  if (tables.length === 0) console.log("  (none â€” run npm run db:migrate first)");

  const uniques = await query(
    `SELECT tc.table_name, kcu.column_name, tc.constraint_name
     FROM information_schema.table_constraints tc
     JOIN information_schema.key_column_usage kcu
       ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
     WHERE tc.table_schema = 'public'
       AND tc.constraint_type = 'UNIQUE'
       AND tc.table_name LIKE 'mh_%'
     ORDER BY tc.table_name, kcu.column_name`,
    [],
  );
  console.log("\n=== UNIQUE constraints ===");
  for (const u of uniques) {
    console.log(`  ${u.table_name}.${u.column_name} (${u.constraint_name})`);
  }

  const fks = await query(
    `SELECT
       tc.table_name AS from_table,
       kcu.column_name AS from_column,
       ccu.table_name AS to_table,
       ccu.column_name AS to_column,
       tc.constraint_name
     FROM information_schema.table_constraints tc
     JOIN information_schema.key_column_usage kcu
       ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
     JOIN information_schema.constraint_column_usage ccu
       ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
     WHERE tc.constraint_type = 'FOREIGN KEY'
       AND tc.table_schema = 'public'
       AND tc.table_name LIKE 'mh_%'
     ORDER BY tc.table_name, kcu.column_name`,
    [],
  );
  console.log("\n=== Foreign keys ===");
  for (const fk of fks) {
    console.log(
      `  ${fk.from_table}.${fk.from_column} -> ${fk.to_table}.${fk.to_column} (${fk.constraint_name})`,
    );
  }

  const indexes = await query(
    `SELECT tablename, indexname, indexdef
     FROM pg_indexes
     WHERE schemaname = 'public' AND tablename LIKE 'mh_%'
     ORDER BY tablename, indexname`,
    [],
  );
  console.log("\n=== Indexes ===");
  for (const ix of indexes) {
    console.log(`  ${ix.tablename}.${ix.indexname}`);
    console.log(`    ${ix.indexdef}`);
  }

  // Fixed allow-list â€” never interpolate catalog names into SQL text.
  const COUNT_SQL = {
    mh_migrations: `SELECT COUNT(*)::int AS n FROM mh_migrations`,
    mh_meta: `SELECT COUNT(*)::int AS n FROM mh_meta`,
    mh_users: `SELECT COUNT(*)::int AS n FROM mh_users`,
    mh_sessions: `SELECT COUNT(*)::int AS n FROM mh_sessions`,
    mh_vendors: `SELECT COUNT(*)::int AS n FROM mh_vendors`,
    mh_products: `SELECT COUNT(*)::int AS n FROM mh_products`,
    mh_orders: `SELECT COUNT(*)::int AS n FROM mh_orders`,
  };

  console.log("\n=== Row counts ===");
  for (const t of tables) {
    const q = COUNT_SQL[t.table_name];
    if (!q) {
      console.log(`  ${t.table_name}: (skipped â€” not in allow-list)`);
      continue;
    }
    const rows = await query(q, []);
    console.log(`  ${t.table_name}: ${rows[0]?.n ?? 0}`);
  }
  console.log("");
}

main().catch((err) => {
  console.error("Inspect failed:", redact(err?.message ?? err));
  process.exit(1);
});
