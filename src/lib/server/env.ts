/**
 * Tolerant reads of server-side environment variables. Server-only.
 *
 * Why this exists rather than touching `process.env` directly:
 *
 * Nitro loads `.env` through `node:util.parseEnv`, which does not strip a
 * UTF-8 byte order mark. Several editors on Windows save as "UTF-8 with BOM"
 * by default, and when that happens the BOM lands on the *first* key in the
 * file. `parseEnv` then yields a key literally named "\uFEFFGEMINI_API_KEY",
 * so `process.env.GEMINI_API_KEY` reads back `undefined` while the value sits
 * correctly in `.env`.
 *
 * That failure mode is nasty precisely because nothing errors. The variable is
 * simply absent, every consumer takes its "not configured" branch, and the
 * feature degrades silently — which is exactly how Hubby ended up answering
 * from its offline keyword matcher with a valid key in place.
 *
 * `serverEnv` closes that gap: it tries the plain name, falls back to the
 * BOM-prefixed name, trims, and treats whitespace-only as absent so a stray
 * trailing space cannot produce a technically-present-but-useless value.
 */

const BOM = "\uFEFF";

let dotEnvCache: Record<string, string> | null = null;

function loadDotEnvFallback(): Record<string, string> {
  if (dotEnvCache) return dotEnvCache;
  dotEnvCache = {};
  try {
    // Dynamic import / require guard for server environment
    if (typeof process !== "undefined" && typeof process.cwd === "function") {
      const fs = require("node:fs");
      const path = require("node:path");
      const envPath = path.resolve(process.cwd(), ".env");
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf-8").replace(/^\uFEFF/, "");
        for (const line of content.split(/\r?\n/)) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;
          const eqIdx = trimmed.indexOf("=");
          if (eqIdx > 0) {
            const key = trimmed.slice(0, eqIdx).trim().replace(/^\uFEFF/, "");
            let val = trimmed.slice(eqIdx + 1).trim();
            if (
              (val.startsWith('"') && val.endsWith('"')) ||
              (val.startsWith("'") && val.endsWith("'"))
            ) {
              val = val.slice(1, -1);
            }
            dotEnvCache[key] = val;
          }
        }
      }
    }
  } catch {
    // Non-fatal if fs is unavailable or reading fails
  }
  return dotEnvCache;
}

/**
 * Reads an environment variable, returning `undefined` when it is missing or
 * blank. Never throws, so callers keep their own "not configured" handling.
 */
export function serverEnv(name: string): string | undefined {
  const raw = process.env[name] ?? process.env[BOM + name];
  const value = raw?.trim();
  if (value) return value;
  const fallback = loadDotEnvFallback()[name];
  return fallback?.trim() ? fallback.trim() : undefined;
}

