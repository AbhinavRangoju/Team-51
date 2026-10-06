/**
 * Live Neon round-trip through the db.ts interface.
 * Run via: npm run test:db
 * Cleans up only the throwaway user it creates (by id). No DROP/TRUNCATE.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  db,
  ensureStoreReady,
  flushNow,
  persist,
  storeBackend,
} from "@/lib/server/db";
import { seedIfEmpty } from "@/lib/server/seed";
import { createNeonExecutor } from "@/lib/server/store-postgres";
import { serverEnv } from "@/lib/server/env";

const DATA_FILE = join(process.cwd(), "data", "markethub.json");

describe("postgres live store", () => {
  const throwawayId = randomUUID();
  const throwawayEmail = `neon-live-${throwawayId}@example.invalid`;
  let jsonBytesBefore = "";

  beforeAll(async () => {
    const url = serverEnv("DATABASE_URL");
    if (!url) {
      throw new Error("DATABASE_URL required for live tests");
    }
    try {
      jsonBytesBefore = readFileSync(DATA_FILE, "utf8");
    } catch {
      jsonBytesBefore = "";
    }
    await ensureStoreReady();
  }, 60_000);

  afterAll(async () => {
    const url = serverEnv("DATABASE_URL");
    if (!url) return;
    const exec = createNeonExecutor(url);
    await exec.query(`DELETE FROM mh_users WHERE id = $1`, [throwawayId]);
  }, 60_000);

  it("uses the postgres backend", async () => {
    expect(storeBackend()).toBe("postgres");
  });

  it("seeds idempotently and keeps counts stable", async () => {
    await seedIfEmpty();
    await flushNow();
    const d = db();
    const counts = {
      users: d.t.users.size,
      vendors: d.t.vendors.size,
      products: d.t.products.size,
      orders: d.t.orders.size,
    };
    await seedIfEmpty();
    await flushNow();
    expect(db().t.users.size).toBe(counts.users);
    expect(db().t.vendors.size).toBe(counts.vendors);
    expect(db().t.products.size).toBe(counts.products);
    expect(db().t.orders.size).toBe(counts.orders);
    if (!serverEnv("MH_ADMIN_PASSWORD")) {
      expect([...db().t.users.values()].filter((u) => u.role === "admin")).toHaveLength(0);
    }
  }, 60_000);

  it("round-trips a throwaway user without touching the JSON file", async () => {
    const d = db();
    d.t.users.set(throwawayId, {
      id: throwawayId,
      email: throwawayEmail,
      name: "Neon Live",
      phone: null,
      passwordHash: "hash",
      passwordSalt: "salt",
      role: "customer",
      status: "Active",
      createdAt: new Date().toISOString(),
    });
    d.emailIndex.set(throwawayEmail.toLowerCase(), throwawayId);
    persist();
    await flushNow();

    const g = globalThis as Record<string, unknown>;
    delete g.__markethub_db__;
    delete g.__markethub_db_ready__;
    delete g.__markethub_db_backend__;
    await ensureStoreReady();

    const loaded = db().t.users.get(throwawayId);
    expect(loaded?.email).toBe(throwawayEmail);

    loaded!.name = "Neon Live Updated";
    persist();
    await flushNow();

    delete g.__markethub_db__;
    delete g.__markethub_db_ready__;
    delete g.__markethub_db_backend__;
    await ensureStoreReady();
    expect(db().t.users.get(throwawayId)?.name).toBe("Neon Live Updated");

    let jsonBytesAfter = "";
    try {
      jsonBytesAfter = readFileSync(DATA_FILE, "utf8");
    } catch {
      jsonBytesAfter = "";
    }
    expect(jsonBytesAfter).toBe(jsonBytesBefore);
  }, 90_000);
});
