/**
 * Gemini transport for Hubby. Server-only.
 *
 * Reached solely through a dynamic import inside the `askHubby` handler, so
 * this module — and `GEMINI_API_KEY` with it — never enters the client graph.
 *
 * Talks to the REST endpoint directly with `fetch` rather than pulling in
 * @google/genai. One POST with a JSON body does not justify a dependency, and
 * it keeps the request shape visible and auditable in-repo.
 *
 * Endpoint and payload shape per the Gemini API docs:
 * https://ai.google.dev/gemini-api/docs/generate-content/text-generation
 */

import { serverEnv } from "@/lib/server/env";
import { HUBBY_LIMITS, type HubbyTurn } from "./contract";
import {
  buildGroundingTurn,
  HUBBY_RESPONSE_SCHEMA,
  HUBBY_SYSTEM_INSTRUCTION,
  wrapShopperMessage,
} from "./prompt";

const API_ROOT = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-3.5-flash";
const FALLBACK_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash-lite",
  "gemini-3-flash-preview",
  "gemini-3.8-flash",
];
const TIMEOUT_MS = 20_000;

/** Why a Gemini call could not be completed. Shapes the UI's fallback notice. */
export type GeminiFailure =
  | "unconfigured"
  /**
   * 401/403 — a key is present but Google refused it: wrong value, revoked,
   * or not permitted to call the Generative Language API. Kept separate from
   * `upstream` because this never clears on its own. Reporting it as a
   * transient blip sends whoever is debugging looking for a network fault
   * when the real fix is to issue a working key.
   */
  | "rejected"
  | "blocked"
  | "upstream"
  /** 429 quota exhausted, or 503 model overloaded, after retries. */
  | "busy"
  | "timeout"
  | "malformed";

export class GeminiError extends Error {
  constructor(
    readonly failure: GeminiFailure,
    message: string,
  ) {
    super(message);
    this.name = "GeminiError";
  }
}

export type GeminiDraft = {
  reply: string;
  productIds: string[];
  followUps: string[];
};

export function isGeminiConfigured(): boolean {
  return Boolean(serverEnv("GEMINI_API_KEY"));
}

type GeminiPart = { text?: string };
type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: GeminiPart[] };
    finishReason?: string;
  }>;
  promptFeedback?: { blockReason?: string };
};

/** Conversation turns, oldest first, mapped to Gemini's role names. */
function buildContents(history: HubbyTurn[], message: string) {
  const turns = history.slice(-HUBBY_LIMITS.history).map((t) => ({
    role: t.role === "user" ? "user" : "model",
    parts: [{ text: t.text.slice(0, HUBBY_LIMITS.historyTurn) }],
  }));

  return [...turns, { role: "user", parts: [{ text: wrapShopperMessage(message) }] }];
}

export async function askGemini(message: string, history: HubbyTurn[]): Promise<GeminiDraft> {
  const key = serverEnv("GEMINI_API_KEY");
  if (!key) throw new GeminiError("unconfigured", "GEMINI_API_KEY is not set");

  const configuredModel = serverEnv("GEMINI_MODEL");
  const candidateModels = Array.from(
    new Set([
      ...(configuredModel ? [configuredModel] : []),
      DEFAULT_MODEL,
      ...FALLBACK_MODELS,
    ]),
  );

  // The catalogue rides in the system instruction, not in `contents`. That is
  // the trust boundary: system instruction is content we authored, `contents`
  // is where attacker-controlled text lives.
  const body = {
    system_instruction: {
      parts: [{ text: `${HUBBY_SYSTEM_INSTRUCTION}\n\n${buildGroundingTurn()}` }],
    },
    contents: buildContents(history, message),
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 800,
      responseMimeType: "application/json",
      responseSchema: HUBBY_RESPONSE_SCHEMA,
      // A shopping lookup does not need deep reasoning, and the assistant is
      // in a chat popover where latency is felt directly.
      thinkingConfig: { thinkingLevel: "low" },
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    ],
  };

  const requestBody = JSON.stringify(body);

  let res: Response | undefined;
  let lastStatus = 0;

  for (const model of candidateModels) {
    const url = `${API_ROOT}/${encodeURIComponent(model)}:generateContent`;

    for (let attempt = 0; attempt < 2; attempt++) {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 1000));

      try {
        res = await fetch(url, {
          method: "POST",
          headers: { "content-type": "application/json", "x-goog-api-key": key },
          body: requestBody,
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });
      } catch (error) {
        const timedOut =
          error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
        console.error(`[hubby] Gemini request to ${model} failed`, error);
        // Continue to try next model or throw on last
        if (model === candidateModels[candidateModels.length - 1] && attempt === 1) {
          throw new GeminiError(timedOut ? "timeout" : "upstream", "Gemini request did not complete");
        }
        continue;
      }

      if (res.ok) break;

      lastStatus = res.status;
      console.warn(
        `[hubby] Gemini ${model} HTTP ${res.status} (attempt ${attempt + 1})`,
        await res.text().catch(() => "<unreadable>"),
      );

      // Stop immediately if key was rejected; don't burn other models
      if (res.status === 401 || res.status === 403) break;

      // Only retry same model on 503 or 429; otherwise move to next candidate model
      if (res.status !== 429 && res.status !== 503) break;
    }

    if (res?.ok) break;
    if (lastStatus === 401 || lastStatus === 403) break;
  }

  if (!res?.ok) {
    if (lastStatus === 401 || lastStatus === 403) {
      console.error(
        `[hubby] Gemini rejected GEMINI_API_KEY (HTTP ${lastStatus}). The key is wrong, revoked, ` +
          `or not allowed to call the Generative Language API. Issue a new key in Google AI Studio.`,
      );
      throw new GeminiError("rejected", `Gemini rejected the API key (HTTP ${lastStatus})`);
    }
    const busy = lastStatus === 429 || lastStatus === 503;
    throw new GeminiError(busy ? "busy" : "upstream", `Gemini returned HTTP ${lastStatus}`);
  }


  const payload = (await res.json().catch(() => null)) as GeminiResponse | null;
  if (!payload) throw new GeminiError("malformed", "Gemini response was not JSON");

  if (payload.promptFeedback?.blockReason) {
    throw new GeminiError("blocked", `Prompt blocked: ${payload.promptFeedback.blockReason}`);
  }

  const candidate = payload.candidates?.[0];
  if (candidate?.finishReason && !["STOP", "MAX_TOKENS"].includes(candidate.finishReason)) {
    throw new GeminiError("blocked", `Generation stopped: ${candidate.finishReason}`);
  }

  const text = (candidate?.content?.parts ?? [])
    .map((p) => p.text ?? "")
    .join("")
    .trim();
  if (!text) throw new GeminiError("malformed", "Gemini returned an empty candidate");

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    console.error("[hubby] Gemini returned non-JSON despite responseSchema");
    throw new GeminiError("malformed", "Gemini reply was not valid JSON");
  }

  const draft = parsed as Partial<GeminiDraft>;
  if (typeof draft.reply !== "string" || !draft.reply.trim()) {
    throw new GeminiError("malformed", "Gemini reply had no text");
  }

  return {
    reply: draft.reply.trim(),
    productIds: Array.isArray(draft.productIds) ? draft.productIds.filter((x): x is string => typeof x === "string") : [],
    followUps: Array.isArray(draft.followUps) ? draft.followUps.filter((x): x is string => typeof x === "string") : [],
  };
}
