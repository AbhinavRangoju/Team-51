/**
 * Hubby's offline brain.
 *
 * Used when Gemini is unreachable or `GEMINI_API_KEY` is unset. It is a plain
 * keyword-and-intent matcher over the same catalogue — no network, no key — so
 * the assistant degrades to something useful instead of an error toast.
 *
 * It replaces the original hardcoded `answer()` that lived in AIAssistant.tsx
 * and matched a fixed map of 15 keywords to product IDs. This version scores
 * every product against the whole searchable record, so it also handles
 * budgets, discounts, ratings, stock and recency.
 */

import { discountPct, getVendor, inr, products, type Product } from "@/lib/data";
import type { HubbyAnswer } from "./contract";

/** Shopper vocabulary that does not literally appear in the catalogue text. */
const SYNONYMS: Record<string, string[]> = {
  headphones: ["headphone", "earphone", "earphones", "headset", "audio", "music", "anc", "noise"],
  laptop: ["laptop", "notebook", "ultrabook", "computer", "macbook", "pc", "student", "college", "work"],
  shoes: ["shoe", "shoes", "sneaker", "sneakers", "trainer", "trainers", "running", "run", "jog"],
  watch: ["watch", "smartwatch", "wearable", "fitness", "tracker"],
  serum: ["serum", "skincare", "skin", "beauty", "face", "cream", "glow", "vitamin"],
  vase: ["vase", "decor", "pottery", "ceramic", "stoneware", "interior", "home"],
  bag: ["bag", "handbag", "purse", "crossbody", "sling", "leather"],
  yoga: ["yoga", "mat", "workout", "exercise", "fitness", "gym", "stretch"],
  coffee: ["coffee", "beans", "granola", "breakfast", "grocery", "food", "snack"],
  books: ["book", "books", "reading", "read", "hardcover", "novel"],
  sweater: ["sweater", "knit", "knitwear", "jumper", "crewneck", "merino", "winter", "clothing", "clothes", "apparel"],
};

const STOP_WORDS = new Set([
  "a", "an", "and", "any", "are", "best", "buy", "can", "find", "for", "from", "get", "good",
  "have", "help", "i", "in", "is", "it", "looking", "me", "my", "need", "of", "on", "or", "please",
  "show", "something", "that", "the", "to", "under", "want", "what", "which", "with", "you", "your",
]);

function searchableText(p: Product): string {
  return [
    p.name,
    p.brand,
    p.category,
    p.tags.join(" "),
    p.description,
    Object.entries(p.specs).map(([k, v]) => `${k} ${v}`).join(" "),
    getVendor(p.vendorId)?.name ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

function parseBudget(s: string): number {
  const m = s.match(/(?:under|below|less than|within|upto|up to|max|<|around|about)\s*₹?\s*(\d[\d,]*)\s*(k\b)?/i);
  if (!m) return Infinity;
  const n = Number(m[1].replace(/,/g, ""));
  return m[2] ? n * 1000 : n;
}

type Intent = {
  budget: number;
  cheap: boolean;
  topRated: boolean;
  discounted: boolean;
  newest: boolean;
  inStock: boolean;
};

function readIntent(s: string): Intent {
  return {
    budget: parseBudget(s),
    cheap: /\b(cheap|cheapest|budget|affordable|low ?price|inexpensive)\b/.test(s),
    topRated: /\b(top|best|highest|highly|well) ?rated\b|\brating\b|\breviews?\b|\bbest\b/.test(s),
    discounted: /\b(deal|deals|discount|discounted|offer|offers|sale|sales|bargain)\b|\d+\s*%\s*off/.test(s),
    newest: /\b(new|newest|latest|recent)\b/.test(s),
    inStock: /\b(in stock|available|availability|ship|deliver)\b/.test(s),
  };
}

/** Token overlap score between the query and a product's searchable record. */
function relevance(p: Product, tokens: string[]): number {
  const text = searchableText(p);
  let score = 0;
  for (const t of tokens) {
    if (p.name.toLowerCase().includes(t)) score += 5;
    else if (p.category.includes(t) || p.brand.toLowerCase().includes(t)) score += 3;
    else if (text.includes(t)) score += 1;

    for (const [key, words] of Object.entries(SYNONYMS)) {
      if (words.includes(t) && text.includes(key)) score += 4;
    }
  }
  return score;
}

export function answerOffline(question: string, notice?: string): HubbyAnswer {
  const s = question.toLowerCase();
  const intent = readIntent(s);
  const tokens = s
    .replace(/[^\w\s₹]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t) && !/^\d+$/.test(t));

  let pool = products.filter((p) => p.price <= intent.budget);
  if (intent.discounted) pool = pool.filter((p) => discountPct(p) > 0);
  if (intent.inStock) pool = pool.filter((p) => p.stock > 0);

  const scored = pool
    .map((p) => ({ p, score: relevance(p, tokens) }))
    .sort((a, b) => b.score - a.score);

  const anyMatch = scored.some((x) => x.score > 0);
  let picks = (anyMatch ? scored.filter((x) => x.score > 0) : scored).map((x) => x.p);

  if (intent.cheap) picks = [...picks].sort((a, b) => a.price - b.price);
  else if (intent.discounted) picks = [...picks].sort((a, b) => discountPct(b) - discountPct(a));
  else if (intent.newest) picks = [...picks].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  else if (intent.topRated && !anyMatch) picks = [...picks].sort((a, b) => b.rating - a.rating);

  picks = picks.slice(0, 3);

  if (!picks.length) {
    const cheapest = products.reduce((a, b) => (a.price <= b.price ? a : b));
    return {
      reply:
        intent.budget < Infinity
          ? `Nothing in the catalogue comes in under ${inr(intent.budget)}. The lowest-priced listing is the ${cheapest.name} at ${inr(cheapest.price)}.`
          : "I could not find a close match for that. Try naming a category — electronics, fashion, home, beauty, sports, accessories, books or grocery.",
      productIds: [],
      followUps: ["What's on offer this week?", "Show me your top rated items"],
      source: "offline",
      notice,
    };
  }

  const lead = intent.discounted
    ? `${picks.length === 1 ? "This one is" : `These ${picks.length} are`} discounted right now`
    : intent.budget < Infinity
      ? `${picks.length === 1 ? "This fits" : `These ${picks.length} fit`} under ${inr(intent.budget)}`
      : `Here ${picks.length === 1 ? "is a pick" : `are ${picks.length} picks`} from verified MarketHub sellers`;

  const oos = picks.filter((p) => p.stock === 0);
  const stockNote = oos.length ? ` Note that ${oos.map((p) => p.name).join(" and ")} is out of stock.` : "";

  return {
    reply: `${lead}.${stockNote}`,
    productIds: picks.map((p) => p.id),
    followUps: ["Anything cheaper?", "Which has the best rating?", "What's the delivery charge?"],
    source: "offline",
    notice,
  };
}
