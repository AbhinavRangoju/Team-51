import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Flame, Plus, SearchX, Tag, Timer, TrendingDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { StoreLayout } from "@/components/mh/StoreLayout";
import { ProductCard } from "@/components/mh/ProductCard";
import { EmptyState, Price, SectionHeader, Stars } from "@/components/mh/ui";
import { Button } from "@/components/ui/button";
import { categories, discountPct, getVendor, inr, products, type Product } from "@/lib/data";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/deals")({
  head: () => ({
    meta: [
      { title: "Festive Week deals — MarketHub" },
      { name: "description", content: "Live discounts from verified MarketHub sellers. Festive Week offers with prices dropping daily at noon." },
      { property: "og:title", content: "Festive Week deals — MarketHub" },
      { property: "og:description", content: "Live discounts from verified MarketHub sellers. Festive Week offers with prices dropping daily at noon." },
    ],
  }),
  component: Deals,
});

const sorts = ["Biggest discount", "Biggest saving", "Price: Low to High", "Price: High to Low", "Top rated"] as const;
type Sort = (typeof sorts)[number];

const tiers = [
  { label: "All offers", min: 0 },
  { label: "20% & up", min: 20 },
  { label: "30% & up", min: 30 },
  { label: "40% & up", min: 40 },
] as const;

const saving = (p: Product) => (p.originalPrice ?? p.price) - p.price;

/** Festive Week runs to the end of the coming Sunday, so the countdown stays
 *  meaningful whenever the page is opened instead of expiring on a fixed date. */
function endOfFestiveWeek(from: Date) {
  const end = new Date(from);
  end.setDate(end.getDate() + ((7 - end.getDay()) % 7));
  end.setHours(23, 59, 59, 999);
  if (end.getTime() <= from.getTime()) end.setDate(end.getDate() + 7);
  return end;
}

type Remaining = { days: number; hours: number; mins: number; secs: number };

/** Ticks only after mount. The server has no business rendering a clock — doing
 *  so would hydrate into a mismatch the moment the two differ by a second. */
function useCountdown(): Remaining | null {
  const [left, setLeft] = useState<Remaining | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      let ms = endOfFestiveWeek(now).getTime() - now.getTime();
      if (ms < 0) ms = 0;
      const secs = Math.floor(ms / 1000);
      setLeft({
        days: Math.floor(secs / 86400),
        hours: Math.floor((secs % 86400) / 3600),
        mins: Math.floor((secs % 3600) / 60),
        secs: secs % 60,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return left;
}

function CountdownTiles() {
  const left = useCountdown();
  const pad = (n: number) => String(n).padStart(2, "0");
  const tiles: [string, string][] = [
    [left ? pad(left.days) : "--", "Days"],
    [left ? pad(left.hours) : "--", "Hours"],
    [left ? pad(left.mins) : "--", "Mins"],
    [left ? pad(left.secs) : "--", "Secs"],
  ];
  return (
    <div
      className="grid grid-cols-4 gap-3"
      role="timer"
      aria-live="off"
      aria-label={left ? `${left.days} days ${left.hours} hours ${left.mins} minutes remaining` : "Loading time remaining"}
    >
      {tiles.map(([n, l]) => (
        <div key={l} className="rounded-2xl bg-primary-foreground/10 p-4 text-center">
          <div className="font-display text-3xl font-semibold tabular-nums md:text-4xl">{n}</div>
          <div className="mt-1 text-xs text-primary-foreground/60">{l}</div>
        </div>
      ))}
    </div>
  );
}

function Spotlight({ product }: { product: Product }) {
  const { addToCart } = useStore();
  const vendor = getVendor(product.vendorId);
  const out = product.stock === 0;

  return (
    <div className="card-mh grid gap-0 overflow-hidden md:grid-cols-2">
      <Link to="/product/$id" params={{ id: product.id }} className="relative block aspect-[4/3] overflow-hidden bg-surface md:aspect-auto">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]" />
        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-xs font-bold text-brand-foreground">
          <Flame className="h-3.5 w-3.5" />
          Deal of the day
        </span>
      </Link>

      <div className="flex flex-col justify-center p-6 md:p-10">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">{vendor?.name}</span>
        <h2 className="mt-2 text-2xl font-semibold md:text-3xl">
          <Link to="/product/$id" params={{ id: product.id }} className="hover:text-brand">
            {product.name}
          </Link>
        </h2>
        <div className="mt-3">
          <Stars value={product.rating} reviews={product.reviews} />
        </div>
        <div className="mt-5">
          <Price price={product.price} original={product.originalPrice} size="lg" />
        </div>
        <p className="mt-2 text-sm font-semibold text-success">You save {inr(saving(product))}</p>
        <p className="mt-4 max-w-md text-sm text-muted-foreground">{product.description}</p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Button
            variant="brand"
            size="lg"
            disabled={out}
            onClick={() => {
              addToCart(product.id);
              toast.success("Added to cart", { description: product.name });
            }}
          >
            <Plus />
            {out ? "Sold out" : "Add to cart"}
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/product/$id" params={{ id: product.id }}>
              View details
            </Link>
          </Button>
        </div>

        {!out && product.stock < 10 && (
          <p className="mt-4 text-xs font-semibold text-warning">Only {product.stock} left at this price</p>
        )}
      </div>
    </div>
  );
}

function Deals() {
  const [tier, setTier] = useState(0);
  const [cat, setCat] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("Biggest discount");

  const all = useMemo(() => products.filter((p) => discountPct(p) > 0), []);
  const topPct = useMemo(() => all.reduce((m, p) => Math.max(m, discountPct(p)), 0), [all]);
  const totalSaving = useMemo(() => all.reduce((s, p) => s + saving(p), 0), [all]);
  const spotlight = useMemo(
    () => [...all].sort((a, b) => discountPct(b) - discountPct(a)).find((p) => p.stock > 0) ?? all[0],
    [all],
  );
  const dealCats = useMemo(() => categories.filter((c) => all.some((p) => p.category === c.slug)), [all]);

  const list = useMemo(() => {
    const min = tiers[tier]?.min ?? 0;
    const l = all.filter((p) => discountPct(p) >= min && (!cat || p.category === cat));
    switch (sort) {
      case "Biggest saving":
        return [...l].sort((a, b) => saving(b) - saving(a));
      case "Price: Low to High":
        return [...l].sort((a, b) => a.price - b.price);
      case "Price: High to Low":
        return [...l].sort((a, b) => b.price - a.price);
      case "Top rated":
        return [...l].sort((a, b) => b.rating - a.rating);
      default:
        return [...l].sort((a, b) => discountPct(b) - discountPct(a));
    }
  }, [all, tier, cat, sort]);

  const endingSoon = useMemo(() => all.filter((p) => p.stock > 0 && p.stock < 10), [all]);
  const reset = () => {
    setTier(0);
    setCat(null);
  };
  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
      active ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-foreground",
    );

  return (
    <StoreLayout>
      <div className="container-mh pt-8">
        <nav className="text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>{" "}
          / <span className="text-foreground">Deals</span>
        </nav>

        <section className="mt-3">
          <div className="grid items-center gap-8 rounded-[2rem] bg-primary p-8 text-primary-foreground md:grid-cols-2 md:p-14">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">Deals of the week</p>
              <h1 className="mt-2 text-3xl font-semibold md:text-5xl">
                Festive Week. Up to {topPct}% off.
              </h1>
              <p className="mt-3 max-w-md text-primary-foreground/70">
                {all.length} live offers from verified sellers. Prices drop daily at noon and the week closes Sunday night.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild variant="brand" size="lg">
                  <Link to="/shop">
                    Shop all products <ArrowRight />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/categories">Browse categories</Link>
                </Button>
              </div>
            </div>
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-primary-foreground/60">
                <Timer className="h-4 w-4" />
                Festive Week ends in
              </div>
              <CountdownTiles />
            </div>
          </div>
        </section>

        {spotlight && (
          <section className="mt-16">
            <SectionHeader eyebrow="Biggest markdown" title="Today's headline offer" />
            <Spotlight product={spotlight} />
          </section>
        )}

        <section className="mt-20">
          <SectionHeader
            eyebrow="Every offer"
            title="All Festive Week deals"
            action={
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                aria-label="Sort deals"
                className="h-10 rounded-full border border-input bg-card px-4 text-sm outline-none focus:border-brand"
              >
                {sorts.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            }
          />

          <div className="flex flex-col gap-3 border-b border-border pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <TrendingDown className="h-4 w-4" />
                Discount
              </span>
              {tiers.map((t, i) => (
                <button key={t.label} onClick={() => setTier(i)} className={chip(tier === i)}>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Tag className="h-4 w-4" />
                Category
              </span>
              <button onClick={() => setCat(null)} className={chip(cat === null)}>
                All
              </button>
              {dealCats.map((c) => (
                <button key={c.slug} onClick={() => setCat(c.slug)} className={chip(cat === c.slug)}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            {list.length} offer{list.length === 1 ? "" : "s"}
            {list.length > 0 && <> · save up to {inr(Math.max(...list.map(saving)))} on a single item</>}
          </p>

          {list.length === 0 ? (
            <div className="mt-8">
              <EmptyState
                icon={<SearchX />}
                title="No deals in that range"
                body="Nothing is discounted that deeply in this category right now. Widen the discount filter or browse the full catalogue."
                action={
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button onClick={reset}>Show all offers</Button>
                    <Button asChild variant="outline">
                      <Link to="/shop">Open full shop</Link>
                    </Button>
                  </div>
                }
              />
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
              {list.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>

        {endingSoon.length > 0 && (
          <section className="mt-20">
            <SectionHeader eyebrow="Low stock" title="Going fast at this price" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {endingSoon.map((p) => (
                <Link
                  key={p.id}
                  to="/product/$id"
                  params={{ id: p.id }}
                  className="card-mh flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <img src={p.image} alt="" loading="lazy" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{p.name}</div>
                    <div className="mt-0.5 text-xs font-semibold text-warning">Only {p.stock} left</div>
                    <div className="mt-1.5 flex items-baseline gap-1.5">
                      <span className="font-display font-semibold">{inr(p.price)}</span>
                      <span className="text-xs text-muted-foreground line-through">{inr(p.originalPrice ?? p.price)}</span>
                      <span className="text-xs font-semibold text-success">-{discountPct(p)}%</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <section className="container-mh mt-20">
        <div className="card-mh flex flex-col items-center gap-4 px-6 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-success-soft text-success">
              <TrendingDown className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-semibold">{inr(totalSaving)} off across every live offer</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Combined markdown on all {all.length} discounted items, from {new Set(all.map((p) => p.vendorId)).size} sellers.
              </p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link to="/cart">Review your cart</Link>
          </Button>
        </div>
      </section>
    </StoreLayout>
  );
}
