/**
 * JSON-file persistence backend. Extracted from the original db.ts so the
 * coordinator can swap backends without changing callers.
 *
 * Write-then-rename keeps a crash mid-write from truncating the catalogue.
 * Absolute paths and raw errors are deliberately not logged.
 */

import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import type { Persisted, StorePersistence } from "./store-types";

function emptyPersisted(): Persisted {
  return {
    users: [],
    sessions: [],
    vendors: [],
    products: [],
    orders: [],
    seeded: false,
  };
}

export function createJsonPersistence(dataFile: string): StorePersistence {
  return {
    kind: "json",

    async load(): Promise<Persisted> {
      try {
        const text = readFileSync(dataFile, "utf8");
        return JSON.parse(text) as Persisted;
      } catch {
        // No file yet, or an unreadable one. Start clean; seed repopulates.
        // Deliberately not logging the raw error (absolute path leakage).
        return emptyPersisted();
      }
    },

    async save(snapshot: Persisted): Promise<void> {
      mkdirSync(dirname(dataFile), { recursive: true });
      const tmp = `${dataFile}.${process.pid}.tmp`;
      writeFileSync(tmp, JSON.stringify(snapshot), "utf8");
      renameSync(tmp, dataFile);
    },
  };
}
