import { Link } from "@tanstack/react-router";
import { Send, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { getVendor, inr, products, type Product } from "@/lib/data";

type Msg = { role: "user" | "bot"; text: string; results?: Product[] };

const suggestions = [
  "Running shoes under ₹3000",
  "Laptops for students",
  "Highly rated headphones",
  "Products from verified vendors",
];

function answer(q: string): Msg {
  const s = q.toLowerCase();
  const budget = s.match(/(?:under|below|<)\s*₹?\s*(\d[\d,]*)/);
  const max = budget ? Number(budget[1].replace(/,/g, "")) : Infinity;
  const keys: Record<string, string[]> = {
    shoe: ["p2"], run: ["p2"], laptop: ["p5"], student: ["p5", "p7"], headphone: ["p1", "p12"], audio: ["p1", "p12"],
    watch: ["p7"], skin: ["p6"], beauty: ["p6"], yoga: ["p9"], coffee: ["p10"], book: ["p8"], bag: ["p4"], sweater: ["p11"], home: ["p3"],
  };
  let ids = Object.entries(keys).filter(([k]) => s.includes(k)).flatMap(([, v]) => v);
  if (s.includes("verified") || s.includes("rated") || ids.length === 0) {
    ids = ids.length ? ids : products.filter((p) => p.rating >= 4.7).map((p) => p.id);
  }
  let results = products.filter((p) => ids.includes(p.id) && p.price <= max);
  if (s.includes("rated")) results = results.sort((a, b) => b.rating - a.rating);
  results = results.slice(0, 3);
  if (!results.length) return { role: "bot", text: "I couldn't find a close match. Try widening your budget or asking about a category." };
  return { role: "bot", text: `Here ${results.length === 1 ? "is a pick" : `are ${results.length} picks`} from verified MarketHub sellers:`, results };
}

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "bot", text: "Hi! I'm Hubby, your shopping assistant. Tell me what you're looking for — a budget helps." },
  ]);
  const [input, setInput] = useState("");

  const send = (q: string) => {
    if (!q.trim()) return;
    setMsgs((m) => [...m, { role: "user", text: q }, answer(q)]);
    setInput("");
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open shopping assistant"
        className="fixed bottom-20 right-4 z-40 flex h-12 items-center gap-2 rounded-full bg-primary pl-4 pr-5 text-sm font-semibold text-primary-foreground shadow-lift transition hover:scale-[1.03] md:bottom-6 md:right-6"
      >
        {open ? <X className="h-4 w-4" /> : <Sparkles className="h-4 w-4 text-brand" />}
        {open ? "Close" : "Ask Hubby"}
      </button>
      {open && (
        <div className="fixed inset-x-3 bottom-36 z-40 flex max-h-[70vh] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-lift animate-in fade-in slide-in-from-bottom-4 md:inset-x-auto md:bottom-22 md:right-6 md:w-[380px]">
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-soft text-brand"><Sparkles className="h-4 w-4" /></span>
            <div>
              <div className="font-display font-semibold">Hubby · AI assistant</div>
              <div className="text-xs text-muted-foreground">Searches 6,000+ verified listings</div>
            </div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {msgs.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
                <div className={m.role === "user" ? "max-w-[80%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-sm text-primary-foreground" : "max-w-[90%] rounded-2xl rounded-bl-md bg-surface px-3.5 py-2 text-sm"}>
                  {m.text}
                </div>
                {m.results && (
                  <div className="mt-2 space-y-2">
                    {m.results.map((p) => (
                      <Link key={p.id} to="/product/$id" params={{ id: p.id }} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-2xl border border-border p-2 transition hover:border-brand">
                        <img src={p.image} alt="" className="h-12 w-12 rounded-xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">{p.name}</div>
                          <div className="text-xs text-muted-foreground">{getVendor(p.vendorId)?.name} · ★ {p.rating}</div>
                        </div>
                        <div className="text-sm font-semibold">{inr(p.price)}</div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {msgs.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-full border border-border px-3 py-1.5 text-xs transition hover:border-brand hover:text-brand">{s}</button>
                ))}
              </div>
            )}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2 border-t border-border p-3">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. headphones under ₹10000" className="h-10 flex-1 rounded-full bg-surface px-4 text-sm outline-none focus:ring-2 focus:ring-brand/30" />
            <button aria-label="Send" className="grid h-10 w-10 place-items-center rounded-full bg-brand text-brand-foreground"><Send className="h-4 w-4" /></button>
          </form>
        </div>
      )}
    </>
  );
}
