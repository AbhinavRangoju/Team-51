/**
 * Password hashing.
 *
 * scrypt from node:crypto — memory-hard, in the standard library, and therefore
 * no new dependency and no native build. Parameters below are the Node defaults
 * bumped to N=2^15, which costs roughly 50-100 ms per verification on this
 * hardware. That is the point: it makes an offline guessing run expensive while
 * staying invisible on a single login.
 *
 * Every password gets its own 16-byte random salt, so two users who pick the
 * same password do not share a hash and a precomputed table is useless.
 *
 * Comparison is timingSafeEqual, not `===`. String equality short-circuits on
 * the first differing byte, which leaks how much of a guess was correct.
 */

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LEN = 64;
const COST = 2 ** 15;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;
// scrypt needs roughly 128 * N * r bytes; the default 32 MB cap is below what
// N=2^15 asks for, so raise it explicitly or the call throws.
const MAX_MEMORY = 128 * COST * BLOCK_SIZE * 2;

const opts = { N: COST, r: BLOCK_SIZE, p: PARALLELIZATION, maxmem: MAX_MEMORY };

export function hashPassword(plain: string): { hash: string; salt: string } {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(plain.normalize("NFKC"), salt, KEY_LEN, opts).toString("hex");
  return { hash, salt };
}

export function verifyPassword(plain: string, hash: string, salt: string): boolean {
  let expected: Buffer;
  try {
    expected = Buffer.from(hash, "hex");
  } catch {
    return false;
  }
  if (expected.length !== KEY_LEN) return false;

  const actual = scryptSync(plain.normalize("NFKC"), salt, KEY_LEN, opts);
  return timingSafeEqual(actual, expected);
}

/**
 * Burns roughly the same time as a real verification.
 *
 * Called when the email does not exist. Without it, "unknown email" returns in
 * microseconds while "wrong password" takes ~80 ms, and that gap is a reliable
 * oracle for enumerating which addresses hold accounts.
 */
export function fakeVerify(): void {
  scryptSync("decoy-input-of-similar-length", "0".repeat(32), KEY_LEN, opts);
}
