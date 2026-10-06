/**
 * Dev utility: lists the generated server-function endpoint ids from the built
 * server bundle, so scripts/e2e.mjs can drive the real HTTP endpoints.
 *
 * Prints a comma-separated list on the last line for easy capture.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = join(dir, e);
    let s;
    try {
      s = statSync(p);
    } catch {
      continue;
    }
    if (s.isDirectory()) walk(p, out);
    else if (p.endsWith(".mjs") || p.endsWith(".js")) out.push(p);
  }
  return out;
}

const files = walk(join(process.cwd(), ".output", "server"));
const ids = new Set();

for (const f of files) {
  const text = readFileSync(f, "utf8");
  for (const m of text.matchAll(/["']([a-f0-9]{64}(?:_\d+)?)["']/g)) ids.add(m[1]);
}

console.log(`scanned ${files.length} server files, found ${ids.size} ids`);
console.log([...ids].join(","));
