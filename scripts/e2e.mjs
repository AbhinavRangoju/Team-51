/**
 * End-to-end security harness against a running MarketHub server.
 *
 * WHY THIS EXISTS
 * The vitest suite covers the server logic by calling it directly. It cannot
 * cover the HTTP layer: the session cookie and its flags, the CSRF middleware,
 * and the serialisation boundary. This drives the real endpoints over real HTTP
 * with a real cookie jar, so those are actually exercised.
 *
 * It speaks the framework's own wire format (seroval, already installed as a
 * transitive dependency) rather than a hand-rolled approximation, so a passing
 * result here means the real client would behave the same way.
 *
 * Usage:
 *   node scripts/e2e.mjs [baseUrl]
 */

import { toJSONAsync } from "seroval";

import { decodeEnvelope } from "./seroval-lite.mjs";

const BASE = (process.argv[2] ?? "http://localhost:3101").replace(/\/$/, "");
const ORIGIN = new URL(BASE).origin;
const SEED_PASSWORD = process.env.MH_SEED_PASSWORD?.trim() || "Demo@1234";

let pass = 0;
let fail = 0;
const failures = [];

function check(name, condition, detail = "") {
  if (condition) {
    pass += 1;
    console.log(`  PASS  ${name}`);
  } else {
    fail += 1;
    failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function section(title) {
  console.log(`\n== ${title}`);
}

/** Safe preview for failure messages; JSON.stringify(undefined) is not a string. */
function preview(v, n = 90) {
  let s;
  try {
    s = typeof v === "string" ? v : JSON.stringify(v);
  } catch {
    s = String(v);
  }
  if (s === undefined) s = String(v);
  return s.slice(0, n);
}

// ---------------------------------------------------------------------------
// Cookie jar
// ---------------------------------------------------------------------------
class Jar {
  constructor() {
    this.cookies = new Map();
    this.lastSetCookie = [];
  }
  absorb(res) {
    const raw = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
    this.lastSetCookie = raw;
    for (const line of raw) {
      const [pair] = line.split(";");
      const idx = pair.indexOf("=");
      if (idx === -1) continue;
      const k = pair.slice(0, idx).trim();
      const v = pair.slice(idx + 1).trim();
      if (v === "" || /expires=thu, 01 jan 1970/i.test(line)) this.cookies.delete(k);
      else this.cookies.set(k, v);
    }
  }
  header() {
    return [...this.cookies.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  }
}

// ---------------------------------------------------------------------------
// Server function call
// ---------------------------------------------------------------------------
async function encode(data) {
  return JSON.stringify(await toJSONAsync({ data }));
}

/**
 * Server functions answer with a seroval-encoded `{ result, error, context }`
 * envelope and HTTP 200 even when the handler threw. So "did it fail" is
 * decided by the presence of `error`, not by the status code. Getting this
 * wrong silently inverts every negative assertion.
 */
function decode(text) {
  try {
    return decodeEnvelope(text);
  } catch {
    return text;
  }
}

/**
 * @param id      server function id
 * @param opts.data      payload (omit for GET with no args)
 * @param opts.method    POST | GET
 * @param opts.jar       cookie jar
 * @param opts.csrf      "same-origin" | "cross-site" | "none" | {origin}
 */
async function call(id, opts = {}) {
  const { data, method = "POST", jar, csrf = "same-origin" } = opts;
  const headers = {
    "x-tsr-serverFn": "true",
    accept: "application/json",
  };

  if (csrf === "same-origin") headers["Sec-Fetch-Site"] = "same-origin";
  else if (csrf === "cross-site") headers["Sec-Fetch-Site"] = "cross-site";
  else if (typeof csrf === "object" && csrf.origin) headers["Origin"] = csrf.origin;
  // csrf === "none": send nothing, to prove default-deny

  if (jar) {
    const c = jar.header();
    if (c) headers["Cookie"] = c;
  }

  let url = `${BASE}/_serverFn/${id}`;
  let body;
  if (method === "POST") {
    if (data !== undefined) {
      body = await encode(data);
      headers["content-type"] = "application/json";
    }
  } else if (data !== undefined) {
    url += `?payload=${encodeURIComponent(await encode(data))}`;
  }

  const res = await fetch(url, { method, headers, body, redirect: "manual" });
  const text = await res.text();
  if (jar) jar.absorb(res);

  const envelope = decode(text);
  const hasEnvelope = envelope && typeof envelope === "object" && !Array.isArray(envelope)
    && ("result" in envelope || "error" in envelope);

  const error = hasEnvelope ? envelope.error : undefined;
  const value = hasEnvelope ? envelope.result : envelope;
  // Transport failure OR a handler error both count as "not ok".
  const ok = res.ok && error === undefined;

  return { status: res.status, httpOk: res.ok, ok, text, value, error, envelope, res };
}

/** Pulls a human message out of whatever shape the error came back in. */
function errMessage(r) {
  const e = r.error;
  if (e) {
    if (typeof e === "string") return e;
    if (typeof e.message === "string") return e.message;
    if (e.data && typeof e.data.message === "string") return e.data.message;
    try {
      return JSON.stringify(e);
    } catch {
      return String(e);
    }
  }
  if (typeof r.value === "string") return r.value;
  if (!r.httpOk) return r.text ?? "";
  return "";
}

// ---------------------------------------------------------------------------
// Endpoint discovery: probe every candidate id and identify it by behaviour
// ---------------------------------------------------------------------------
const CANDIDATE_IDS = process.env.MH_FN_IDS
  ? process.env.MH_FN_IDS.split(",").map((s) => s.trim()).filter(Boolean)
  : [];

async function discover() {
  section("Endpoint discovery");
  const map = {};

  for (const id of CANDIDATE_IDS) {
    // An empty object body makes each validator complain in a distinctive way.
    let r = await call(id, { data: {} });
    let method = "POST";

    // 405 means the function is declared GET-only.
    if (r.status === 405) {
      r = await call(id, { method: "GET" });
      method = "GET";
    }

    const msg = errMessage(r).toLowerCase();
    let name = null;

    if (msg.includes("name is required")) {
      // Only signup validates a name, and it does so before the email.
      name = "signup";
    } else if (msg.includes("email is required") || msg.includes("email doesn't look right")) {
      name = "login";
    } else if (msg.includes("`message` must be a string")) {
      // Pre-existing Hubby AI assistant endpoint; not part of this review.
      name = "hubby";
    } else if (msg.includes("cart is empty")) {
      name = "cartish";
    } else if (msg.includes("order is required")) {
      name = "orderish";
    } else if (msg.includes("sign in to continue")) {
      name = method === "GET" ? "getAuthRequired" : "postAuthRequired";
    } else if (method === "GET" && r.ok) {
      // me() returns null when signed out; others would have thrown.
      name = r.value === null || r.value === undefined ? "meOrNullable" : "getPublic";
    } else if (msg.includes("something went wrong")) {
      name = "unknown-internal";
    }

    map[id] = { name, method, status: r.status, msg: errMessage(r).slice(0, 80) };
    console.log(
      `  ${id.slice(0, 12)}… ${method.padEnd(4)} ${String(r.status).padEnd(4)} ${(name ?? "?").padEnd(17)} ${map[id].msg}`,
    );
  }
  return map;
}

// ---------------------------------------------------------------------------
async function main() {
  console.log(`MarketHub E2E — ${BASE}`);

  if (!CANDIDATE_IDS.length) {
    console.log("\nNo MH_FN_IDS supplied. Set it to the comma-separated server function ids.");
    process.exit(2);
  }

  const probed = await discover();

  // Resolve the ids we need by behaviour rather than by guessing order.
  const ids = {};
  for (const [id, info] of Object.entries(probed)) {
    if (info.name === "signup") ids.signup = id;
    if (info.name === "login") ids.login = id;
    if (info.name === "hubby") ids.hubby = id;
  }

  // getQuote vs placeOrder: placeOrder requires a session, getQuote does not.
  const cartIds = Object.entries(probed)
    .filter(([, i]) => i.name === "cartish")
    .map(([id]) => id);
  // A FULL placeOrder payload is required to tell them apart: a partial one is
  // rejected by placeOrder's validator before it ever reaches the auth check,
  // which would make it look like getQuote.
  for (const id of cartIds) {
    const r = await call(id, {
      data: {
        items: [{ productId: "p1", qty: 1 }],
        speed: "std",
        method: "UPI",
        address: {
          name: "Probe User",
          phone: "9000000000",
          line: "1 Probe Street, Area",
          city: "Hyderabad",
          pin: "500001",
        },
        idempotencyKey: `discover-${Date.now()}-${id.slice(0, 6)}`,
      },
    });
    // Anonymous: getQuote answers with a quote, placeOrder demands a session.
    if (r.ok && r.value && typeof r.value.totalPaise === "number") ids.getQuote = id;
    else if (/sign in/i.test(errMessage(r))) ids.placeOrder = id;
  }

  // Endpoints taking an orderId: getMyOrder, cancelOrder, advanceVendorOrder.
  const orderIsh = Object.entries(probed)
    .filter(([, i]) => i.name === "orderish")
    .map(([id]) => id);

  // Every GET-only endpoint: me, listMyOrders, getVendorDashboard.
  const getIds = Object.entries(probed)
    .filter(([, i]) => i.method === "GET")
    .map(([id]) => id);

  // POST endpoints that need a session and take no arguments: logout.
  const postNoArg = Object.entries(probed)
    .filter(([, i]) => i.name === null && i.method === "POST" && i.status !== 405)
    .map(([id]) => id)
    .filter((id) => id !== ids.hubby);

  console.log("\nResolved:", JSON.stringify({ ...ids, orderIsh, getIds, postNoArg }));

  // -------------------------------------------------------------------------
  section("CSRF protection");
  if (ids.login) {
    const noHeaders = await call(ids.login, {
      data: { email: "x@example.com", password: "Whatever@123" },
      csrf: "none",
    });
    check("rejects a request with no Origin / Referer / Sec-Fetch-Site", noHeaders.status === 403,
      `got ${noHeaders.status}`);

    const crossSite = await call(ids.login, {
      data: { email: "x@example.com", password: "Whatever@123" },
      csrf: "cross-site",
    });
    check("rejects Sec-Fetch-Site: cross-site", crossSite.status === 403, `got ${crossSite.status}`);

    const evilOrigin = await call(ids.login, {
      data: { email: "x@example.com", password: "Whatever@123" },
      csrf: { origin: "https://evil.example" },
    });
    check("rejects a foreign Origin header", evilOrigin.status === 403, `got ${evilOrigin.status}`);

    const sameOrigin = await call(ids.login, {
      data: { email: "x@example.com", password: "Whatever@123" },
      csrf: { origin: ORIGIN },
    });
    check("allows a same-origin Origin header through to the handler",
      sameOrigin.status !== 403, `got ${sameOrigin.status}`);
  } else {
    check("login endpoint identified", false, "could not resolve login id");
  }

  // -------------------------------------------------------------------------
  section("Signup: role assignment and validation");
  const alice = new Jar();
  const aliceEmail = `alice+${Date.now()}@example.com`;

  if (ids.signup) {
    // Attempt privilege escalation through the request body.
    const escalate = await call(ids.signup, {
      data: {
        name: "Alice Escalate",
        email: aliceEmail,
        password: "Alice@12345",
        role: "admin",
        status: "Active",
        id: "forged-id",
      },
      jar: alice,
    });
    const user = escalate.value;
    check("signup succeeds", escalate.ok, `status ${escalate.status} ${errMessage(escalate)}`);
    check("role=admin in the request body is ignored; account is a customer",
      user && user.role === "customer", `got role=${user && user.role}`);
    check("forged id in the request body is ignored",
      user && user.id !== "forged-id", `got id=${user && user.id}`);
    check("response carries no password hash or salt",
      !/passwordHash|passwordSalt/.test(escalate.text));

    const dup = await call(ids.signup, {
      data: { name: "Alice Twin", email: aliceEmail, password: "Alice@12345" },
    });
    check("duplicate email is rejected", !dup.ok, `status ${dup.status}`);

    const weak = await call(ids.signup, {
      data: { name: "Weak", email: `weak+${Date.now()}@example.com`, password: "short" },
    });
    check("weak password is rejected", !weak.ok && /8 characters/i.test(errMessage(weak)),
      errMessage(weak));

    const badEmail = await call(ids.signup, {
      data: { name: "Bad", email: "not-an-email", password: "Good@12345" },
    });
    check("malformed email is rejected", !badEmail.ok, errMessage(badEmail));
  }

  // -------------------------------------------------------------------------
  section("Session cookie");
  const setCookie = alice.lastSetCookie.join(" | ");
  const sessionLine = alice.lastSetCookie.find((c) => c.startsWith("mh_session=")) ?? "";
  check("session cookie is set on signup", sessionLine.length > 0, setCookie);
  check("cookie is HttpOnly", /httponly/i.test(sessionLine), sessionLine);
  check("cookie is SameSite=Strict", /samesite=strict/i.test(sessionLine), sessionLine);
  check("cookie is Path=/", /path=\//i.test(sessionLine), sessionLine);
  if (process.env.NODE_ENV === "production" || process.env.MH_EXPECT_SECURE === "1") {
    check("cookie is Secure (production)", /;\s*secure/i.test(sessionLine), sessionLine);
  } else {
    console.log(`  INFO  Secure flag not asserted (NODE_ENV=${process.env.NODE_ENV ?? "unset"})`);
  }
  check("cookie value is not a readable identity blob",
    !/alice|example\.com|customer/i.test(sessionLine), sessionLine);

  // -------------------------------------------------------------------------
  section("Login: enumeration resistance");
  if (ids.login) {
    const wrongPw = await call(ids.login, { data: { email: aliceEmail, password: "Wrong@12345" } });
    const unknown = await call(ids.login, {
      data: { email: `nobody+${Date.now()}@example.com`, password: "Wrong@12345" },
    });
    check("wrong password is rejected", !wrongPw.ok);
    check("unknown email is rejected", !unknown.ok);

    const throttled = /too many/i.test(errMessage(wrongPw)) || /too many/i.test(errMessage(unknown));
    if (throttled) {
      console.log("  SKIP  enumeration comparison — rate limiter already engaged; run against a fresh server");
    } else {
      check("both give the same message, so accounts cannot be enumerated",
        errMessage(wrongPw) === errMessage(unknown),
        `"${errMessage(wrongPw)}" vs "${errMessage(unknown)}"`);
      check("the message does not reveal which half was wrong",
        !/no such|unknown email|user not found|wrong password/i.test(errMessage(wrongPw)),
        errMessage(wrongPw));
    }
  }

  // -------------------------------------------------------------------------
  section("Identity endpoints (me / orders) require a session");
  let meId = null;
  let ordersId = null;
  let dashId = null;

  // Identified by what they return for a signed-in customer:
  //   me                 -> the user object
  //   listMyOrders       -> an array
  //   getVendorDashboard -> refuses a customer
  for (const id of getIds) {
    const signedIn = await call(id, { method: "GET", jar: alice });
    if (signedIn.ok && signedIn.value && signedIn.value.email === aliceEmail) meId = id;
    else if (signedIn.ok && Array.isArray(signedIn.value)) ordersId = id;
    else if (!signedIn.ok) dashId = id;
  }

  console.log(`  resolved me=${meId?.slice(0, 10)} orders=${ordersId?.slice(0, 10)} dashboard=${dashId?.slice(0, 10)}`);

  if (meId) {
    const anonMe = await call(meId, { method: "GET" });
    check("me() without a cookie reports nobody",
      anonMe.ok && (anonMe.value === null || anonMe.value === undefined),
      `got ${JSON.stringify(anonMe.value)}`);

    const forged = new Jar();
    forged.cookies.set("mh_session", "forged-session-id-that-does-not-exist");
    const forgedMe = await call(meId, { method: "GET", jar: forged });
    check("a forged session id is not accepted",
      forgedMe.ok && (forgedMe.value === null || forgedMe.value === undefined),
      `got ${JSON.stringify(forgedMe.value)}`);

    const mine = await call(meId, { method: "GET", jar: alice });
    check("me() with a valid cookie returns the signed-in user",
      mine.ok && mine.value && mine.value.email === aliceEmail);
    check("me() never returns a password hash", !/passwordHash|passwordSalt/.test(mine.text));
  }

  if (ordersId) {
    const anonOrders = await call(ordersId, { method: "GET" });
    check("order history requires a session", !anonOrders.ok, `status ${anonOrders.status}`);
  }

  // -------------------------------------------------------------------------
  section("Server-authoritative pricing");
  let quote = null;
  if (!ids.getQuote) {
    check("getQuote endpoint identified", false, "could not resolve getQuote id");
  } else {
    const qr = await call(ids.getQuote, {
      data: { items: [{ productId: "p1", qty: 2 }], speed: "std" },
    });
    quote = qr.value;
    check("quote returns priced lines",
      quote && Array.isArray(quote.lines) && quote.lines.length === 1,
      `status ${qr.status} ${errMessage(qr)}`);
  }

  if (quote && quote.lines && quote.lines.length) {
    // p1 is Rs.8999 from Rs.12999 in the seed catalogue.
    check("unit price comes from the catalogue, not the request",
      quote.lines[0].unitPricePaise === 899900,
      `got ${quote.lines[0].unitPricePaise}`);
    check("subtotal is quantity x stored price",
      quote && quote.subtotalPaise === 899900 * 2, `got ${quote && quote.subtotalPaise}`);
    check("GST is 5% of subtotal", quote && quote.taxPaise === Math.round(899900 * 2 * 0.05),
      `got ${quote && quote.taxPaise}`);
    check("delivery is free above the threshold", quote && quote.deliveryPaise === 0);
    check("total is subtotal + delivery + tax",
      quote && quote.totalPaise === quote.subtotalPaise + quote.deliveryPaise + quote.taxPaise);

    const tampered = (await call(ids.getQuote, {
      data: {
        items: [{ productId: "p1", qty: 2, price: 1, unitPricePaise: 1 }],
        speed: "std",
        totalPaise: 1,
        subtotalPaise: 1,
        discountPaise: 999999,
      },
    })).value;
    check("injected price/total fields change nothing",
      tampered && tampered.totalPaise === quote.totalPaise,
      `${tampered && tampered.totalPaise} vs ${quote.totalPaise}`);

    const expressQuote = (await call(ids.getQuote, {
      data: { items: [{ productId: "p1", qty: 2 }], speed: "exp" },
    })).value;
    check("express delivery fee is applied server-side",
      expressQuote && expressQuote.deliveryPaise === 14900,
      `got ${expressQuote && expressQuote.deliveryPaise}`);

    const cheapQuote = (await call(ids.getQuote, {
      data: { items: [{ productId: "p10", qty: 1 }], speed: "std" },
    })).value;
    check("delivery is charged below the free threshold",
      cheapQuote && cheapQuote.deliveryPaise === 7900,
      `got ${cheapQuote && cheapQuote.deliveryPaise}`);
  }

  // -------------------------------------------------------------------------
  section("Input validation");
  if (ids.getQuote) {
    const cases = [
      ["quantity 0 is rejected", { items: [{ productId: "p1", qty: 0 }] }],
      ["negative quantity is rejected", { items: [{ productId: "p1", qty: -5 }] }],
      ["absurd quantity is rejected", { items: [{ productId: "p1", qty: 99999 }] }],
      ["non-integer quantity is rejected", { items: [{ productId: "p1", qty: 1.5 }] }],
      ["duplicate product lines are rejected",
        { items: [{ productId: "p1", qty: 1 }, { productId: "p1", qty: 1 }] }],
      ["empty cart is rejected", { items: [] }],
      ["non-array items is rejected", { items: "p1" }],
      ["unknown delivery speed is rejected", { items: [{ productId: "p1", qty: 1 }], speed: "teleport" }],
    ];
    for (const [name, data] of cases) {
      const r = await call(ids.getQuote, { data });
      check(name, !r.ok, `status ${r.status} ${errMessage(r).slice(0, 60)}`);
    }

    const unknownProduct = (await call(ids.getQuote, {
      data: { items: [{ productId: "does-not-exist", qty: 1 }] },
    })).value;
    check("an unknown product id yields no priced line",
      unknownProduct && unknownProduct.lines.length === 0 && unknownProduct.problems.length > 0);
  }

  // -------------------------------------------------------------------------
  section("Checkout: stock, idempotency, authority");
  const address = {
    name: "Alice Shopper",
    phone: "9876543210",
    line: "12 Test Street, Example Area",
    city: "Hyderabad",
    pin: "500001",
  };
  let aliceOrderId = null;

  if (ids.placeOrder && ids.getQuote) {
    const anon = await call(ids.placeOrder, {
      data: { items: [{ productId: "p10", qty: 1 }], speed: "std", method: "UPI", address, idempotencyKey: "anon-key-1" },
    });
    check("checkout requires a session", !anon.ok, `status ${anon.status}`);

    const stockBefore = (await call(ids.getQuote, { data: { items: [{ productId: "p10", qty: 1 }] } }))
      .value.lines[0].available;

    const key = `alice-key-${Date.now()}`;
    const first = await call(ids.placeOrder, {
      data: {
        items: [{ productId: "p10", qty: 2 }],
        speed: "std",
        method: "UPI",
        address,
        idempotencyKey: key,
        // Attempt to dictate what the server should record.
        totalPaise: 1,
        status: "Delivered",
        payment: "Refunded",
        userId: "somebody-else",
      },
      jar: alice,
    });
    check("order is placed", first.ok, `status ${first.status} ${errMessage(first)}`);
    const order = first.value;
    aliceOrderId = order && order.id;

    check("server ignores an injected total", order && order.totalPaise !== 1,
      `got ${order && order.totalPaise}`);
    check("server ignores an injected status; new orders start at Order Placed",
      order && order.status === "Order Placed", `got ${order && order.status}`);
    check("server decides payment state (UPI => Paid)", order && order.payment === "Paid",
      `got ${order && order.payment}`);
    check("order id is server-generated and unguessable",
      order && /^MH-[0-9A-F]{10}$/.test(order.id), `got ${order && order.id}`);
    check("order response leaks no userId or idempotency key",
      !/somebody-else|idempotencyKey|userId/.test(first.text));

    const stockAfter = (await call(ids.getQuote, { data: { items: [{ productId: "p10", qty: 1 }] } }))
      .value.lines[0].available;
    check("stock decremented by exactly the quantity ordered",
      stockBefore - stockAfter === 2, `${stockBefore} -> ${stockAfter}`);

    const replay = await call(ids.placeOrder, {
      data: {
        items: [{ productId: "p10", qty: 2 }],
        speed: "std",
        method: "UPI",
        address,
        idempotencyKey: key,
      },
      jar: alice,
    });
    check("replaying the idempotency key returns the original order",
      replay.ok && replay.value && replay.value.id === order.id,
      `got ${replay.value && replay.value.id}`);

    const stockAfterReplay = (await call(ids.getQuote, { data: { items: [{ productId: "p10", qty: 1 }] } }))
      .value.lines[0].available;
    check("replay does not decrement stock a second time",
      stockAfterReplay === stockAfter, `${stockAfter} -> ${stockAfterReplay}`);

    const oversell = await call(ids.placeOrder, {
      data: {
        items: [{ productId: "p5", qty: 1 }], // p5 has stock 0 in the seed
        speed: "std",
        method: "UPI",
        address,
        idempotencyKey: `oversell-${Date.now()}`,
      },
      jar: alice,
    });
    check("cannot buy an out-of-stock product", !oversell.ok, errMessage(oversell).slice(0, 70));

    const badAddress = await call(ids.placeOrder, {
      data: {
        items: [{ productId: "p10", qty: 1 }],
        speed: "std",
        method: "UPI",
        address: { ...address, pin: "12", phone: "abc" },
        idempotencyKey: `badaddr-${Date.now()}`,
      },
      jar: alice,
    });
    check("invalid shipping address is rejected", !badAddress.ok, errMessage(badAddress).slice(0, 70));

    const badMethod = await call(ids.placeOrder, {
      data: {
        items: [{ productId: "p10", qty: 1 }],
        speed: "std",
        method: "Barter",
        address,
        idempotencyKey: `badmethod-${Date.now()}`,
      },
      jar: alice,
    });
    check("unknown payment method is rejected", !badMethod.ok, errMessage(badMethod).slice(0, 70));
  }

  // -------------------------------------------------------------------------
  section("IDOR: one shopper cannot reach another's order");
  const bob = new Jar();
  const bobEmail = `bob+${Date.now()}@example.com`;
  if (ids.signup) {
    await call(ids.signup, {
      data: { name: "Bob Shopper", email: bobEmail, password: "Bob@123456" },
      jar: bob,
    });
  }

  const bobSignedIn = bob.cookies.has("mh_session");
  check("second shopper account created", bobSignedIn,
    "signup may be rate limited; restart the server for a clean run");

  if (ordersId && bobSignedIn) {
    const bobOrders = await call(ordersId, { method: "GET", jar: bob });
    check("a new shopper sees an empty order history",
      bobOrders.ok && Array.isArray(bobOrders.value) && bobOrders.value.length === 0,
      `got ${preview(bobOrders.value)}`);

    const aliceOrders = await call(ordersId, { method: "GET", jar: alice });
    check("the buyer sees their own order",
      aliceOrders.ok && Array.isArray(aliceOrders.value)
        && aliceOrders.value.some((o) => o.id === aliceOrderId),
      `got ${preview(aliceOrders.value)}`);
    check("another shopper's order id does not appear in the other's history",
      !preview(bobOrders.value, 10000).includes(String(aliceOrderId)));
  }

  // getMyOrder / cancelOrder take an order id; find them and try IDOR.
  if (aliceOrderId && bobSignedIn) {
    for (const id of orderIsh) {
      const asBob = await call(id, { data: { orderId: aliceOrderId }, jar: bob });
      const msg = errMessage(asBob);

      // Two legitimate refusals, depending on which guard trips first:
      //   ownership guard  -> "Not found." (shopper endpoints)
      //   role guard       -> "You do not have access to that." (seller endpoint,
      //                       which refuses any customer before it ever looks at
      //                       the order, so it reveals nothing about it either)
      const refusedSafely = /not found/i.test(msg) || /do not have access/i.test(msg);

      check(`endpoint ${id.slice(0, 10)} refuses another shopper's order id`,
        !asBob.ok && refusedSafely, `status ${asBob.status} ${msg.slice(0, 60)}`);

      // The property that actually matters: the reply must never confirm that
      // the order exists or hint that it belongs to someone else.
      check(`endpoint ${id.slice(0, 10)} does not confirm the order exists`,
        !/not yours|belongs to|another user|owned by/i.test(msg), msg.slice(0, 60));
      check(`endpoint ${id.slice(0, 10)} returns no order data to a non-owner`,
        !asBob.text.includes(String(aliceOrderId)), "order id echoed back");
    }
  }

  // -------------------------------------------------------------------------
  section("Order state machine");

  /** Places an order and returns the OrderDto, or null. */
  async function placeFor(jar, productId, qty, tag) {
    const r = await call(ids.placeOrder, {
      data: {
        items: [{ productId, qty }],
        speed: "std",
        method: "UPI",
        address,
        idempotencyKey: `${tag}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      },
      jar,
    });
    return r.ok ? r.value : null;
  }

  async function availability(productId) {
    const r = await call(ids.getQuote, { data: { items: [{ productId, qty: 1 }] } });
    return r.ok && r.value.lines.length ? r.value.lines[0].available : null;
  }

  let cancelId = null;
  let getOrderId = null;
  let advanceId = null;

  if (ids.placeOrder && ids.getQuote && orderIsh.length) {
    const probe = await placeFor(alice, "p10", 1, "probe");
    if (!probe) {
      check("probe order placed for endpoint identification", false, "could not place order");
    } else {
      for (const id of orderIsh) {
        const r = await call(id, { data: { orderId: probe.id }, jar: alice });
        if (!r.ok) {
          // A customer hitting a seller-only endpoint.
          if (/seller|store|access/i.test(errMessage(r))) advanceId = id;
          continue;
        }
        if (r.value && r.value.status === "Cancelled") cancelId = id;
        else if (r.value && r.value.id === probe.id) getOrderId = id;
      }
      console.log(`  resolved cancel=${cancelId?.slice(0, 10)} getOrder=${getOrderId?.slice(0, 10)} advance=${advanceId?.slice(0, 10)}`);

      check("a customer cannot call the seller order-advance endpoint", advanceId !== null,
        "no endpoint refused the customer; seller endpoint may be reachable");
    }
  }

  if (cancelId && ids.placeOrder) {
    const before = await availability("p9");
    const order = await placeFor(alice, "p9", 2, "cancel-test");
    const during = await availability("p9");
    check("placing an order reserves stock", before !== null && during === before - 2,
      `${before} -> ${during}`);

    const cancelled = await call(cancelId, { data: { orderId: order.id }, jar: alice });
    check("owner can cancel a freshly placed order", cancelled.ok, errMessage(cancelled));
    check("cancelled order reports status Cancelled",
      cancelled.ok && cancelled.value.status === "Cancelled",
      `got ${cancelled.value && cancelled.value.status}`);
    check("a paid order becomes Refunded on cancellation",
      cancelled.ok && cancelled.value.payment === "Refunded",
      `got ${cancelled.value && cancelled.value.payment}`);

    const after = await availability("p9");
    check("cancelling returns the stock", after === before, `${during} -> ${after} (was ${before})`);

    const again = await call(cancelId, { data: { orderId: order.id }, jar: alice });
    check("cancelling twice is idempotent, not an error",
      again.ok && again.value.status === "Cancelled", errMessage(again));

    const bogus = await call(cancelId, { data: { orderId: "MH-DOESNOTEXIST" }, jar: alice });
    check("cancelling an unknown order reports not found",
      !bogus.ok && /not found/i.test(errMessage(bogus)), errMessage(bogus));
  }

  // -------------------------------------------------------------------------
  section("Role enforcement: customer cannot use seller endpoints");
  if (dashId) {
    const asCustomer = await call(dashId, { method: "GET", jar: alice });
    check("a customer is refused the vendor dashboard", !asCustomer.ok,
      `status ${asCustomer.status} ${errMessage(asCustomer).slice(0, 60)}`);
  }

  // -------------------------------------------------------------------------
  section("Vendor isolation");
  const vendorA = new Jar();
  const vendorB = new Jar();
  if (ids.login) {
    const la = await call(ids.login, {
      data: { email: "arjun@nordicsound.in", password: SEED_PASSWORD },
      jar: vendorA,
    });
    const lb = await call(ids.login, {
      data: { email: "neha@stride.in", password: SEED_PASSWORD },
      jar: vendorB,
    });
    check("seeded seller can sign in", la.ok, `status ${la.status} ${errMessage(la)}`);
    check("seller session reports role=vendor", la.ok && la.value && la.value.role === "vendor",
      `got ${la.value && la.value.role}`);

    if (dashId && la.ok && lb.ok) {
      const dashA = await call(dashId, { method: "GET", jar: vendorA });
      const dashB = await call(dashId, { method: "GET", jar: vendorB });
      check("seller A gets a dashboard", dashA.ok, errMessage(dashA).slice(0, 70));
      check("seller B gets a dashboard", dashB.ok, errMessage(dashB).slice(0, 70));

      if (dashA.ok && dashB.ok) {
        check("seller A sees only their own store", dashA.value.vendor.id === "v1",
          `got ${dashA.value.vendor.id}`);
        check("seller B sees a different store", dashB.value.vendor.id === "v2",
          `got ${dashB.value.vendor.id}`);
        check("every listing returned to seller A belongs to seller A",
          dashA.value.products.every((p) => p.vendorId === "v1"));
        check("seller A's dashboard contains no other seller's product ids",
          !dashA.value.products.some((p) => p.vendorId === "v2"));
        check("seller dashboard exposes no shopper street address or PIN",
          !/shipLine|shipPin|shipPhone|Test Street|500001/.test(dashA.text));
        check("seller dashboard exposes no owner email",
          !/arjun@nordicsound\.in|neha@stride\.in/.test(dashA.text));
        check("seller dashboard exposes no password material",
          !/passwordHash|passwordSalt/.test(dashA.text));

        // Alice's order was for p10 (vendor v6), so neither A nor B should see it.
        check("sellers do not see an order with none of their lines",
          !dashA.text.includes(String(aliceOrderId)) && !dashB.text.includes(String(aliceOrderId)));
      }
    }
  }

  // -------------------------------------------------------------------------
  section("Vendor order workflow and cross-seller isolation on it");
  if (advanceId && ids.placeOrder && vendorA.cookies.has("mh_session")) {
    // p1 belongs to vendor v1 (seller A). p2 belongs to v2 (seller B).
    const order = await placeFor(alice, "p1", 1, "vendor-flow");
    if (!order) {
      check("order placed for the vendor workflow", false, "could not place order");
    } else {
      const byB = await call(advanceId, { data: { orderId: order.id }, jar: vendorB });
      check("a seller cannot advance an order containing none of their products",
        !byB.ok && /not found/i.test(errMessage(byB)), errMessage(byB));
      check("the refusal does not confirm the order exists",
        !/forbidden|not yours|belongs to/i.test(errMessage(byB)), errMessage(byB));

      const step1 = await call(advanceId, { data: { orderId: order.id }, jar: vendorA });
      check("the owning seller can advance the order", step1.ok, errMessage(step1));
      check("status advances one step to Confirmed",
        step1.ok && step1.value.status === "Confirmed",
        `got ${step1.value && step1.value.status}`);
      check("the seller's view carries only their own line",
        step1.ok && step1.value.items.length === 1 && step1.value.items[0].productId === "p1");
      check("the seller's view omits the shopper's street address and PIN",
        step1.ok && !/Test Street|500001|9876543210/.test(step1.text));

      // Walk it to Shipped, then prove the shopper can no longer cancel.
      await call(advanceId, { data: { orderId: order.id }, jar: vendorA }); // Processing
      const shipped = await call(advanceId, { data: { orderId: order.id }, jar: vendorA });
      check("status reaches Shipped after three advances",
        shipped.ok && shipped.value.status === "Shipped",
        `got ${shipped.value && shipped.value.status}`);

      if (cancelId) {
        const lateCancel = await call(cancelId, { data: { orderId: order.id }, jar: alice });
        check("a shipped order can no longer be cancelled by the shopper",
          !lateCancel.ok && /shipped|cannot/i.test(errMessage(lateCancel)),
          errMessage(lateCancel));
      }

      // Walk to Delivered, then confirm it is terminal.
      await call(advanceId, { data: { orderId: order.id }, jar: vendorA }); // Out for Delivery
      const delivered = await call(advanceId, { data: { orderId: order.id }, jar: vendorA });
      check("status reaches Delivered",
        delivered.ok && delivered.value.status === "Delivered",
        `got ${delivered.value && delivered.value.status}`);

      const past = await call(advanceId, { data: { orderId: order.id }, jar: vendorA });
      check("a delivered order cannot be advanced further",
        !past.ok && /complete/i.test(errMessage(past)), errMessage(past));

      if (cancelId) {
        const cancelDelivered = await call(cancelId, { data: { orderId: order.id }, jar: alice });
        check("a delivered order cannot be cancelled; it directs to returns",
          !cancelDelivered.ok && /deliver|return/i.test(errMessage(cancelDelivered)),
          errMessage(cancelDelivered));
      }
    }
  }

  // -------------------------------------------------------------------------
  section("Error handling: no internals leak");
  const probes = [];
  for (const id of CANDIDATE_IDS) {
    const r = await call(id, { data: { items: [{ productId: "\u0000bad", qty: "x" }], email: 12345 } });
    probes.push(r.text);
  }
  const all = probes.join("\n");
  check("no stack traces in error bodies", !/\bat\s+\w+.*\(.*:\d+:\d+\)/.test(all));
  check("no absolute filesystem paths in error bodies", !/[A-Za-z]:\\\\|\/home\/|\/Users\//.test(all));
  check("no source file names in error bodies", !/\.ts:\d+|\.tsx:\d+|node_modules/.test(all));
  check("no internal module names in error bodies", !/lib\\?\/server|markethub\.json/.test(all));
  check("no secret-looking values in error bodies",
    !/GEMINI_API_KEY|MH_ADMIN_PASSWORD|passwordHash/.test(all));

  // -------------------------------------------------------------------------
  section("Logout");
  if (meId && ids.signup) {
    let loggedOut = false;
    for (const id of postNoArg) {
      if (id === ids.signup || id === ids.login || id === ids.placeOrder) continue;

      const jar = new Jar();
      const s = await call(ids.signup, {
        data: {
          name: "Temp User",
          email: `temp+${Date.now()}+${id.slice(0, 4)}@example.com`,
          password: "Temp@12345",
        },
        jar,
      });
      if (!s.ok) continue;

      const before = await call(meId, { method: "GET", jar });
      if (!before.ok || !before.value) continue;

      const r = await call(id, { jar });
      if (!r.ok) continue;

      const cleared = jar.lastSetCookie.some((c) => /^mh_session=;|^mh_session=\s*;/.test(c))
        || !jar.cookies.has("mh_session");

      // Prove the server dropped it, not just the jar: replay the ORIGINAL
      // cookie value. A client-side-only logout would still be accepted here.
      const replay = new Jar();
      const original = s.res.headers.getSetCookie?.().find((c) => c.startsWith("mh_session="));
      if (original) {
        const v = original.split(";")[0].split("=").slice(1).join("=");
        replay.cookies.set("mh_session", v);
      }
      const afterReplay = await call(meId, { method: "GET", jar: replay });

      loggedOut = true;
      check("logout clears the session cookie", cleared, jar.lastSetCookie.join(" | "));
      check("the old session id is rejected after logout (revoked server-side)",
        afterReplay.ok && (afterReplay.value === null || afterReplay.value === undefined),
        `got ${JSON.stringify(afterReplay.value)}`);
      break;
    }
    if (!loggedOut) {
      check("logout endpoint exercised", false, "could not identify the logout endpoint");
    }
  }

  // -------------------------------------------------------------------------
  // Deliberately last: it exhausts the login bucket for this client, which
  // would make every earlier login-based assertion unreliable.
  section("Rate limiting (runs last — exhausts the login bucket)");
  if (ids.login) {
    let throttledAt = null;
    for (let i = 1; i <= 25 && throttledAt === null; i += 1) {
      const r = await call(ids.login, {
        data: { email: `bruteforce+${i}@example.com`, password: "Guess@12345" },
      });
      if (/too many/i.test(errMessage(r))) throttledAt = i;
    }
    check("repeated failed logins are eventually throttled", throttledAt !== null,
      throttledAt === null ? "never throttled within 25 attempts" : "");
    if (throttledAt !== null) {
      console.log(`  INFO  throttled after ${throttledAt} attempts in this window`);
    }
  }

  // -------------------------------------------------------------------------
  console.log(`\n=========================================`);
  console.log(`  PASS ${pass}   FAIL ${fail}`);
  if (failures.length) {
    console.log(`\nFailures:`);
    for (const f of failures) console.log(`  - ${f}`);
  }
  console.log(`=========================================`);
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("harness error:", e);
  process.exit(3);
});
