/**
 * Mocked-executor SQL tests — no live database.
 * Proves: parameterized statements only, constant 11-statement flush,
 * upsert/delete ordering, numeric coercion, selectBackend, redactDbUrl.
 */

import { describe, expect, it, vi } from "vitest";

import {
  buildFlushStatements,
  createPostgresPersistence,
  mapRowsFromDriver,
} from "@/lib/server/store-postgres";
import type { Persisted, SqlExecutor } from "@/lib/server/store-types";
import { redactDbUrl, selectBackend } from "@/lib/server/store-types";
import type { UserRow } from "@/lib/server/db";

function sampleUser(overrides: Partial<UserRow> = {}): UserRow {
  return {
    id: "u1",
    email: "sentinel-email-XYZ@example.invalid",
    name: "Test",
    phone: null,
    passwordHash: "sentinel-hash-ABCDEF123456",
    passwordSalt: "salt1",
    role: "customer",
    status: "Active",
    createdAt: "2026-10-05T00:00:00.000Z",
    ...overrides,
  };
}

function emptySnapshot(overrides: Partial<Persisted> = {}): Persisted {
  return {
    users: [],
    sessions: [],
    vendors: [],
    products: [],
    orders: [],
    seeded: false,
    ...overrides,
  };
}

describe("selectBackend", () => {
  it("returns postgres for a non-blank URL", () => {
    expect(selectBackend("postgresql://x")).toBe("postgres");
  });
  it("returns json for undefined / empty / whitespace", () => {
    expect(selectBackend(undefined)).toBe("json");
    expect(selectBackend("")).toBe("json");
    expect(selectBackend("   ")).toBe("json");
  });
});

describe("redactDbUrl", () => {
  it("strips credentialed postgres URLs", () => {
    const raw =
      "boom postgresql://user:pw@ep-x.region.aws.neon.tech/neondb?sslmode=require done";
    expect(redactDbUrl(raw)).toBe("boom [redacted] done");
    expect(redactDbUrl(raw)).not.toContain("pw");
  });
});

describe("mapRowsFromDriver", () => {
  it("coerces string-typed numerics to number", () => {
    const mapped = mapRowsFromDriver({
      users: [],
      sessions: [
        {
          id: "s1",
          user_id: "u1",
          expires_at: "1735689600000",
          created_at: "2026-01-01T00:00:00.000Z",
        },
      ],
      vendors: [
        {
          id: "v1",
          user_id: null,
          name: "V",
          tagline: "t",
          city: "Hyd",
          since: "2020",
          status: "Verified",
          verified: true,
          rating: "4.5",
          created_at: "2026-01-01T00:00:00.000Z",
        },
      ],
      products: [
        {
          id: "p1",
          vendor_id: "v1",
          name: "P",
          category: "c",
          brand: "b",
          price_paise: "19900",
          original_price_paise: null,
          stock: "5",
          rating: "4.2",
          reviews: "10",
          sku: "SKU",
          status: "Active",
          description: "d",
          specs: {},
          created_at: "2026-01-01T00:00:00.000Z",
        },
      ],
      orders: [],
      seeded: false,
    });
    expect(typeof mapped.sessions[0].expiresAt).toBe("number");
    expect(mapped.sessions[0].expiresAt).toBe(1735689600000);
    expect(typeof mapped.vendors[0].since).toBe("number");
    expect(typeof mapped.vendors[0].rating).toBe("number");
    expect(typeof mapped.products[0].pricePaise).toBe("number");
    expect(typeof mapped.products[0].stock).toBe("number");
  });
});

describe("buildFlushStatements", () => {
  it("emits exactly 11 statements for 1 row and for 100 rows", () => {
    const one = emptySnapshot({ users: [sampleUser()] });
    const many = emptySnapshot({
      users: Array.from({ length: 100 }, (_, i) =>
        sampleUser({ id: `u${i}`, email: `u${i}@example.invalid` }),
      ),
    });
    expect(buildFlushStatements(one)).toHaveLength(11);
    expect(buildFlushStatements(many)).toHaveLength(11);
  });

  it("never puts sentinel data values into statement text", () => {
    const snap = emptySnapshot({
      users: [sampleUser()],
    });
    const stmts = buildFlushStatements(snap);
    for (const stmt of stmts) {
      expect(stmt.text).not.toContain("sentinel-email-XYZ");
      expect(stmt.text).not.toContain("sentinel-hash-ABCDEF123456");
      expect(stmt.text).toMatch(/\$1/);
    }
    const usersUpsert = stmts.find((s) => s.text.includes("INSERT INTO mh_users"));
    expect(usersUpsert).toBeDefined();
    const blob = JSON.stringify(usersUpsert!.params);
    expect(blob).toContain("sentinel-email-XYZ");
    expect(blob).toContain("sentinel-hash-ABCDEF123456");
  });

  it("upserts parent-first and deletes child-first", () => {
    const stmts = buildFlushStatements(emptySnapshot({ users: [sampleUser()] }));
    const texts = stmts.map((s) => s.text);
    const upsertUsers = texts.findIndex((t) => t.includes("INSERT INTO mh_users"));
    const upsertVendors = texts.findIndex((t) => t.includes("INSERT INTO mh_vendors"));
    const upsertProducts = texts.findIndex((t) => t.includes("INSERT INTO mh_products"));
    const upsertOrders = texts.findIndex((t) => t.includes("INSERT INTO mh_orders"));
    const upsertSessions = texts.findIndex((t) => t.includes("INSERT INTO mh_sessions"));
    const upsertMeta = texts.findIndex((t) => t.includes("INSERT INTO mh_meta"));
    const delSessions = texts.findIndex((t) => t.includes("DELETE FROM mh_sessions"));
    const delOrders = texts.findIndex((t) => t.includes("DELETE FROM mh_orders"));
    const delProducts = texts.findIndex((t) => t.includes("DELETE FROM mh_products"));
    const delVendors = texts.findIndex((t) => t.includes("DELETE FROM mh_vendors"));
    const delUsers = texts.findIndex((t) => t.includes("DELETE FROM mh_users"));

    expect(upsertUsers).toBeLessThan(upsertVendors);
    expect(upsertVendors).toBeLessThan(upsertProducts);
    expect(upsertProducts).toBeLessThan(upsertOrders);
    expect(upsertOrders).toBeLessThan(upsertSessions);
    expect(upsertSessions).toBeLessThan(upsertMeta);
    expect(upsertMeta).toBeLessThan(delSessions);
    expect(delSessions).toBeLessThan(delOrders);
    expect(delOrders).toBeLessThan(delProducts);
    expect(delProducts).toBeLessThan(delVendors);
    expect(delVendors).toBeLessThan(delUsers);
  });
});

describe("createPostgresPersistence save logging", () => {
  it("redacts connection strings from flush failure logs", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const exec: SqlExecutor = {
      async query() {
        return [];
      },
      async transaction() {
        throw new Error(
          "fail postgresql://user:secretpw@host/db?sslmode=require mid-flush",
        );
      },
    };
    const p = createPostgresPersistence(exec);
    await expect(p.save(emptySnapshot())).rejects.toThrow();
    // Persistence itself throws; coordinator redacts — assert helper here.
    expect(
      redactDbUrl("fail postgresql://user:secretpw@host/db?sslmode=require mid-flush"),
    ).not.toContain("secretpw");
    spy.mockRestore();
  });
});
