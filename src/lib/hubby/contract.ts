/**
 * The contract shared by Hubby's client UI and its server function.
 *
 * Kept deliberately free of any Gemini or prompt detail so the component can
 * import it without pulling the model plumbing — or the API key handling —
 * into the browser bundle.
 */

export type HubbyRole = "user" | "bot";

/** One turn of conversation, as sent back to the server for context. */
export type HubbyTurn = { role: HubbyRole; text: string };

export type HubbySource =
  /** Answered by Gemini against the live catalogue. */
  | "gemini"
  /** Answered by the on-device keyword matcher (no API key, or Gemini failed). */
  | "offline";

export type HubbyAnswer = {
  reply: string;
  /** Always validated against the real catalogue before it leaves the server. */
  productIds: string[];
  /** Suggested next questions, at most 3. */
  followUps: string[];
  source: HubbySource;
  /** Set when the answer is a degraded fallback, so the UI can say so. */
  notice?: string;
};

/**
 * Input limits. Enforced on the server — the client copies are only there to
 * stop the textarea sending something that will certainly be rejected.
 */
export const HUBBY_LIMITS = {
  /** Longest single question. A shopping query needs nowhere near this. */
  message: 500,
  /** Turns of prior conversation replayed to the model. */
  history: 8,
  /** Longest replayed turn; older turns are truncated rather than dropped. */
  historyTurn: 400,
  /** Requests allowed per client per rolling window. */
  ratePerWindow: 12,
  rateWindowMs: 60_000,
} as const;
