import { describe, it, expect } from "vitest";
import { answerOffline } from "../lib/hubby/offline";
import { askGemini } from "../lib/hubby/gemini";
import { serverEnv } from "../lib/server/env";

describe("Hubby Chatbot Offline Intelligence", () => {
  it("handles greetings conversationally without dumping products", () => {
    const res = answerOffline("hi");
    expect(res.reply).toMatch(/Hubby/i);
    expect(res.productIds).toEqual([]);
    expect(res.followUps.length).toBeGreaterThan(0);
  });

  it("handles 'who are you' / capability questions without dumping products", () => {
    const res = answerOffline("who are you and what can you do?");
    expect(res.reply).toMatch(/MarketHub/i);
    expect(res.productIds).toEqual([]);
  });

  it("answers shipping and delivery questions accurately", () => {
    const res = answerOffline("how much is delivery?");
    expect(res.reply).toMatch(/999/);
    expect(res.productIds).toEqual([]);
  });

  it("answers return and refund questions accurately", () => {
    const res = answerOffline("what is your return policy?");
    expect(res.reply).toMatch(/7-day/i);
    expect(res.productIds).toEqual([]);
  });

  it("answers payment options accurately", () => {
    const res = answerOffline("can I pay with COD or UPI?");
    expect(res.reply).toMatch(/UPI/i);
    expect(res.productIds).toEqual([]);
  });

  it("handles gratitude politely without dumping products", () => {
    const res = answerOffline("thank you so much!");
    expect(res.reply).toMatch(/welcome/i);
    expect(res.productIds).toEqual([]);
  });

  it("finds matching products for specific shopping intent", () => {
    const res = answerOffline("running shoes");
    expect(res.productIds.length).toBeGreaterThan(0);
  });

  it("does not dump arbitrary products for unrecognizable queries", () => {
    const res = answerOffline("supercalifragilistic");
    expect(res.productIds).toEqual([]);
    expect(res.reply).toMatch(/couldn't find any products/i);
  });
});

describe("Hubby Gemini Live Integration", () => {
  it("successfully converses via Gemini with reliable fallback model", async () => {
    if (!serverEnv("GEMINI_API_KEY")) {
      console.log("Skipping live Gemini test: GEMINI_API_KEY not set");
      return;
    }

    const res = await askGemini("hi, who are you?", []);
    expect(res.reply).toBeDefined();
    expect(res.reply.length).toBeGreaterThan(10);
    expect(res.productIds).toBeDefined();
    expect(res.followUps).toBeDefined();
  }, 20000);
});
