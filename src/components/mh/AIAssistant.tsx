import { Link } from "@tanstack/react-router";
import { Send, Sparkles, TriangleAlert, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getProduct, getVendor, inr, products } from "@/lib/data";
import { askHubby } from "@/lib/hubby/ask";
import { HUBBY_LIMITS, type HubbyRole, type HubbyTurn } from "@/lib/hubby/contract";

type ChatMsg = {
  id: number;
  role: HubbyRole;
  text: string;
  /** Catalogue IDs, already validated server-side. */
  productIds?: string[];
  /** Set when the answer came from the offline matcher instead of Gemini. */
  notice?: string;
};

const GREETING: ChatMsg = {
  id: 0,
  role: "bot",
  text: "Hi, I'm Hubby. I know every product on MarketHub, what it costs and who sells it. Tell me what you're after — a budget helps.",
};

const OPENERS = [
  "Running shoes under ₹3000",
  "A laptop for a student",
  "Best rated headphones",
  "What's discounted right now?",
];

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<ChatMsg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [followUps, setFollowUps] = useState<string[]>([]);

  const nextId = useRef(1);
  const scroller = useRef<HTMLDivElement>(null);
  /** Guards against a slow reply landing after a newer one. */
  const inFlight = useRef(0);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [msgs, pending]);

  const send = async (raw: string) => {
    const question = raw.trim().slice(0, HUBBY_LIMITS.message);
    if (!question || pending) return;

    const turn = ++inFlight.current;
    const history: HubbyTurn[] = msgs
      .slice(1)
      .slice(-HUBBY_LIMITS.history)
      .map((m) => ({ role: m.role, text: m.text }));

    setMsgs((m) => [...m, { id: nextId.current++, role: "user", text: question }]);
    setInput("");
    setPending(true);

    try {
      const answer = await askHubby({ data: { message: question, history } });
      if (turn !== inFlight.current) return;
      setMsgs((m) => [
        ...m,
        {
          id: nextId.current++,
          role: "bot",
          text: answer.reply,
          productIds: answer.productIds,
          notice: answer.notice,
        },
      ]);
      setFollowUps(answer.followUps);
    } catch (error) {
      console.error(error);
      if (turn !== inFlight.current) return;
      setMsgs((m) => [
        ...m,
        {
          id: nextId.current++,
          role: "bot",
          text: "I couldn't reach the catalogue just then. Try asking again in a moment.",
        },
      ]);
      setFollowUps([]);
    } finally {
      if (turn === inFlight.current) setPending(false);
    }
  };

  const chips = msgs.length === 1 ? OPENERS : followUps;

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close shopping assistant" : "Open shopping assistant"}
        aria-expanded={open}
        className="fixed bottom-20 right-4 z-40 flex h-12 items-center gap-2 rounded-full bg-primary pl-4 pr-5 text-sm font-semibold text-primary-foreground shadow-lift transition hover:scale-[1.03] md:bottom-6 md:right-6"
      >
        {open ? <X className="h-4 w-4" /> : <Sparkles className="h-4 w-4 text-brand" />}
        {open ? "Close" : "Ask Hubby"}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Hubby, the MarketHub shopping assistant"
          className="fixed inset-x-3 bottom-36 z-40 flex max-h-[70vh] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-lift animate-in fade-in slide-in-from-bottom-4 md:inset-x-auto md:bottom-22 md:right-6 md:w-[380px]"
        >
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-soft text-brand">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <div className="font-display font-semibold">Hubby · AI assistant</div>
              <div className="text-xs text-muted-foreground">
                Knows all {products.length} live listings, prices and sellers
              </div>
            </div>
          </div>

          <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto p-4">
            <div aria-live="polite" className="space-y-3">
              {msgs.map((m) => (
                <div key={m.id} className={m.role === "user" ? "flex justify-end" : ""}>
                  <div
                    className={
                      m.role === "user"
                        ? "max-w-[80%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-sm text-primary-foreground"
                        : "max-w-[90%] rounded-2xl rounded-bl-md bg-surface px-3.5 py-2 text-sm"
                    }
                  >
                    {m.text}
                  </div>

                  {m.notice && (
                    <p className="mt-1.5 flex items-start gap-1.5 text-xs text-muted-foreground">
                      <TriangleAlert className="mt-0.5 h-3 w-3 shrink-0 text-warning" />
                      {m.notice}
                    </p>
                  )}

                  {!!m.productIds?.length && (
                    <div className="mt-2 space-y-2">
                      {m.productIds.map((id) => {
                        const p = getProduct(id);
                        if (!p) return null;
                        return (
                          <Link
                            key={id}
                            to="/product/$id"
                            params={{ id: p.id }}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 rounded-2xl border border-border p-2 transition hover:border-brand"
                          >
                            <img src={p.image} alt="" className="h-12 w-12 rounded-xl object-cover" />
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-medium">{p.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {getVendor(p.vendorId)?.name} · ★ {p.rating}
                                {p.stock === 0 && " · out of stock"}
                              </div>
                            </div>
                            <div className="text-sm font-semibold">{inr(p.price)}</div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {pending && (
              <div className="flex w-fit gap-1 rounded-2xl rounded-bl-md bg-surface px-3.5 py-3">
                <span className="sr-only">Hubby is typing</span>
                {[0, 150, 300].map((d) => (
                  <span
                    key={d}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
                    style={{ animationDelay: `${d}ms` }}
                  />
                ))}
              </div>
            )}

            {!pending && chips.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {chips.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs transition hover:border-brand hover:text-brand"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="flex gap-2 border-t border-border p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={HUBBY_LIMITS.message}
              disabled={pending}
              aria-label="Ask Hubby about a product"
              placeholder="e.g. headphones under ₹10000"
              className="h-10 flex-1 rounded-full bg-surface px-4 text-sm outline-none focus:ring-2 focus:ring-brand/30 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              aria-label="Send"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground transition disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
