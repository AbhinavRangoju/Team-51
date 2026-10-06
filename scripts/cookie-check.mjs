/**
 * Prints the raw Set-Cookie emitted on signup, so the session cookie's flags
 * can be inspected directly under a given NODE_ENV.
 *
 * Usage: node scripts/cookie-check.mjs http://localhost:3105 <signupFnId>
 */
import { toJSONAsync } from "seroval";

const BASE = process.argv[2];
const ID = process.argv[3];

const email = `cookiecheck+${Date.now()}@example.com`;
const res = await fetch(`${BASE}/_serverFn/${ID}`, {
  method: "POST",
  headers: {
    "x-tsr-serverFn": "true",
    "content-type": "application/json",
    accept: "application/json",
    "Sec-Fetch-Site": "same-origin",
  },
  body: JSON.stringify(await toJSONAsync({ data: { name: "Cookie Check", email, password: "Cookie@12345" } })),
});

const cookies = res.headers.getSetCookie?.() ?? [];
console.log(`status: ${res.status}`);
for (const c of cookies) console.log(`Set-Cookie: ${c}`);
if (!cookies.length) console.log("(no Set-Cookie header)");

const session = cookies.find((c) => c.startsWith("mh_session="));
if (session) {
  console.log("\nflags:");
  for (const flag of ["HttpOnly", "Secure", "SameSite=Strict", "Path=/"]) {
    console.log(`  ${flag.padEnd(16)} ${new RegExp(flag.replace("/", "\\/"), "i").test(session) ? "present" : "ABSENT"}`);
  }
}
