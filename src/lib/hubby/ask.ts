/**
 * `askHubby` — the only thing the chat UI calls.
 *
 * A POST server function, so it inherits the CSRF middleware registered in
 * src/start.ts and cannot be driven from another origin. The Gemini key is read
 * inside the handler and the transport is pulled in by dynamic import, which
 * keeps both out of the browser bundle.
 *
 * The handler never trusts the model. Every product ID Gemini returns is
 * re-resolved against the real catalogue, deduplicated and capped before it
 * reaches the client, so a hallucinated or injected ID becomes nothing at all
 * rather than a broken link or a fabricated price. Prices, images and seller
 * names are never taken from the model — the client renders those from
 * `@/lib/data` using the validated IDs.
 */

import { createServerFn } from "@tanstack/react-start";

import { getProduct } from "@/lib/data";
import { HUBBY_LIMITS, type HubbyAnswer, type HubbyRole, type HubbyTurn } from "./contract";
import { answerOffline } from "./offline";

export type AskHubbyInput = { message: string; history: HubbyTurn[] };

/** Strips control characters, which have no place in a shopping question and
 *  would otherwise land in server logs and in the prompt verbatim. */
function clean(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim();
}

function validateAsk(raw: unknown): AskHubbyInput {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Invalid request body");
  }
  const { message, history } = raw as { message?: unknown; history?: unknown };

  if (typeof message !== "string") throw new Error("`message` must be a string");
  const cleaned = clean(message);
  if (!cleaned) throw new Error("`message` must not be empty");
  if (cleaned.length > HUBBY_LIMITS.message) {
    throw new Error(`\`message\` must be ${HUBBY_LIMITS.message} characters or fewer`);
  }

  const turns: HubbyTurn[] = [];
  if (Array.isArray(history)) {
    for (const entry of history.slice(-HUBBY_LIMITS.history)) {
      if (typeof entry !== "object" || entry === null) continue;
      const { role, text } = entry as { role?: unknown; text?: unknown };
      if (role !== "user" && role !== "bot") continue;
      if (typeof text !== "string") continue;
      const body = clean(text).slice(0, HUBBY_LIMITS.historyTurn);
      if (body) turns.push({ role: role as HubbyRole, text: body });
    }
  }

  return { message: cleaned, history: turns };
}

/**
 * Fixed-window rate limit, per client, in process memory.
 *
 * Every call spends real money against the Gemini key, and the endpoint is
 * reachable by anyone who can load the site. This is deliberately the simplest
 * thing that removes the "hold enter and drain the quota" problem. It resets on
 * restart and is not shared between instances — if MarketHub is ever scaled
 * past one process this needs to move to Redis or a durable counter.
 */
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(clientKey: string): boolean {
  const now = Date.now();
  const entry = hits.get(clientKey);

  if (!entry || now > entry.resetAt) {
    hits.set(clientKey, { count: 1, resetAt: now + HUBBY_LIMITS.rateWindowMs });
    if (hits.size > 5_000) {
      for (const [k, v] of hits) if (now > v.resetAt) hits.delete(k);
    }
    return false;
  }

  entry.count += 1;
  return entry.count > HUBBY_LIMITS.ratePerWindow;
}

/** Keeps only IDs that exist in the catalogue, deduplicated, best 3 first. */
function validateProductIds(ids: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of ids) {
    const id = raw.trim();
    if (!id || seen.has(id) || !getProduct(id)) continue;
    seen.add(id);
    out.push(id);
    if (out.length === 3) break;
  }
  return out;
}

function tidyFollowUps(items: string[]): string[] {
  return items
    .map((s) => clean(s).slice(0, 60))
    .filter(Boolean)
    .slice(0, 3);
}

export const askHubby = createServerFn({ method: "POST" })
  .validator(validateAsk)
  .handler(async ({ data }): Promise<HubbyAnswer> => {
    const { getRequestIP } = await import("@tanstack/react-start/server");
    const client = getRequestIP({ xForwardedFor: true }) ?? "unknown";

    if (rateLimited(client)) {
      return {
        reply: "You are asking faster than I can shop. Give me a moment and try again.",
        productIds: [],
        followUps: [],
        source: "offline",
        notice: "Rate limit reached.",
      };
    }

    const { askGemini, GeminiError, isGeminiConfigured } = await import("./gemini");

    if (!isGeminiConfigured()) {
      return answerOffline(
        data.message,
        "Hubby's AI is not connected yet, so this is a basic keyword match.",
      );
    }

    try {
      const draft = await askGemini(data.message, data.history);
      return {
        reply: clean(draft.reply).slice(0, 1200),
        productIds: validateProductIds(draft.productIds),
        followUps: tidyFollowUps(draft.followUps),
        source: "gemini",
      };
    } catch (error) {
      if (error instanceof GeminiError) {
        if (error.failure === "blocked") {
          return {
            reply: "I would rather not answer that one. Tell me what you are shopping for and I will help.",
            productIds: [],
            followUps: [],
            source: "gemini",
          };
        }
        // `rejected` deliberately reads the same as `unconfigured` to the
        // shopper. "Not connected" is all they can act on, and the state of
        // our credentials is not their business. The operator-facing detail
        // goes to the server log instead.
        const notice =
          error.failure === "unconfigured" || error.failure === "rejected"
            ? "Hubby's AI is not connected yet, so this is a basic keyword match."
            : error.failure === "busy"
              ? "Hubby's AI is busy right now, so this is a basic keyword match."
              : "Hubby's AI is briefly unavailable, so this is a basic keyword match.";
        return answerOffline(data.message, notice);
      }

      console.error("[hubby] unexpected failure", error);
      return answerOffline(data.message, "Something went wrong, so this is a basic keyword match.");
    }
  });
