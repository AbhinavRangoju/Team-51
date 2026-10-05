import { createFileRoute, Link } from "@tanstack/react-router";
import { SearchX, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { StoreLayout } from "@/components/mh/StoreLayout";
import { ProductCard, ProductCardSkeleton } from "@/components/mh/ProductCard";
import { EmptyState } from "@/components/mh/ui";
import { Button } from "@/components/ui/button";
import { categories, discountPct, products, vendors } from "@/lib/data";
import { cn } from "@/lib/utils";

type Search = { q?: string; cat?: string };

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" && s.q ? s.q : undefined,
    cat: typeof s.cat === "string" && s.cat ? s.cat : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop all products — MarketHub" },
      { name: "description", content: "Search and filter products by category, price, rating and vendor across MarketHub." },
      { property: "og:title", content: "Shop all products — MarketHub" },
      { property: "og:description", content: "Search and filter products by category, price, rating and vendor across MarketHub." },
    ],
  }),
  component: Shop,
});

const sorts = ["Relevance", "Price: Low to High", "Price: High to Low", "Rating", "Newest", "Popularity"] as const;
const PAGE = 8;

function Shop() {
  const search = Route.useSearch();
  const [q, setQ] = useState(search.q ?? "");
  const [cats, setCats] = useState<string[]>(search.cat ? [search.cat] : []);
  const [maxPrice, setMaxPrice] = useState(70000);
  const [minRating, setMinRating] = useState(0);
  const [vend, setVend] = useState<string[]>([]);
  const [inStock, setInStock] = useState(false);
  const [onSale, setOnSale] = useState(false);
  const [sort, setSort] = useState<(typeof sorts)[number]>("Relevance");
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => { setQ(search.q ?? ""); setCats(search.cat ? [search.cat] : []); }, [search.q, search.cat]);
  useEffect(() => { setLoading(true); setPage(1); const t = setTimeout(() => setLoading(false), 450); return () => clearTimeout(t); }, [q, cats, maxPrice, minRating, vend, inStock, onSale, sort]);

  const list = useMemo(() => {
    let l = products.filter((p) =>
      (!q || (p.name + p.brand + p.category).toLowerCase().includes(q.toLowerCase())) &&
      (!cats.length || cats.includes(p.category)) && p.price <= maxPrice && p.rating >= minRating &&
      (!vend.length || vend.includes(p.vendorId)) && (!inStock || p.stock > 0) && (!onSale || discountPct(p) > 0));
    if (sort === "Price: Low to High") l = [...l].sort((a, b) => a.price - b.price);
    if (sort === "Price: High to Low") l = [...l].sort((a, b) => b.price - a.price);
    if (sort === "Rating") l = [...l].sort((a, b) => b.rating - a.rating);
    if (sort === "Newest") l = [...l].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (sort === "Popularity") l = [...l].sort((a, b) => b.reviews - a.reviews);
    return l;
  }, [q, cats, maxPrice, minRating, vend, inStock, onSale, sort]);

  const pages = Math.max(1, Math.ceil(list.length / PAGE));
  const shown = list.slice((page - 1) * PAGE, page * PAGE);
  const toggle = (arr: string[], set: (v: string[]) => void, v: string) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const reset = () => { setQ(""); setCats([]); setMaxPrice(70000); setMinRating(0); setVend([]); setInStock(false); setOnSale(false); };

  const check = "h-4 w-4 rounded accent-[var(--brand)]";
  const filters = (
    <div className="space-y-7">
      <div>
        <h4 className="mb-3 text-sm font-semibold">Category</h4>
        <div className="space-y-2.5">
          {categories.map((c) => (
            <label key={c.slug} className="flex cursor-pointer items-center gap-2.5 text-sm">
              <input type="checkbox" className={check} checked={cats.includes(c.slug)} onChange={() => toggle(cats, setCats, c.slug)} />{c.name}
            </label>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-3 flex justify-between text-sm font-semibold">Max price <span className="font-normal text-muted-foreground">₹{maxPrice.toLocaleString("en-IN")}</span></h4>
        <input type="range" min={500} max={70000} step={500} value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} className="w-full accent-[var(--brand)]" aria-label="Max price" />
      </div>
      <div>
        <h4 className="mb-3 text-sm font-semibold">Rating</h4>
        <div className="flex flex-wrap gap-2">
          {[0, 4, 4.5].map((r) => (
            <button key={r} onClick={() => setMinRating(r)} className={cn("rounded-full border px-3 py-1.5 text-xs font-medium transition", minRating === r ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-foreground")}>{r === 0 ? "Any" : `${r}★ & up`}</button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-3 text-sm font-semibold">Vendor</h4>
        <div className="space-y-2.5">
          {vendors.filter((v) => v.verified).map((v) => (
            <label key={v.id} className="flex cursor-pointer items-center gap-2.5 text-sm">
              <input type="checkbox" className={check} checked={vend.includes(v.id)} onChange={() => toggle(vend, setVend, v.id)} />{v.name}
            </label>
          ))}
        </div>
      </div>
      <div className="space-y-2.5">
        <h4 className="mb-3 text-sm font-semibold">Availability & offers</h4>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm"><input type="checkbox" className={check} checked={inStock} onChange={(e) => setInStock(e.target.checked)} />In stock only</label>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm"><input type="checkbox" className={check} checked={onSale} onChange={(e) => setOnSale(e.target.checked)} />On discount</label>
      </div>
      <Button variant="outline" className="w-full" onClick={reset}>Reset filters</Button>
    </div>
  );

  return (
    <StoreLayout>
      <div className="container-mh pt-8">
        <nav className="text-xs text-muted-foreground"><Link to="/" className="hover:text-foreground">Home</Link> / <span className="text-foreground">Shop</span></nav>
        <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-semibold md:text-4xl">{q ? `Results for “${q}”` : cats.length === 1 ? categories.find((c) => c.slug === cats[0])?.name : "Shop everything"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{list.length} products from verified sellers</p>
          </div>
          <div className="flex gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search in shop" aria-label="Search in shop" className="h-10 w-full rounded-full border border-input bg-card px-4 text-sm outline-none focus:border-brand md:w-56" />
            <Button variant="outline" className="lg:hidden" onClick={() => setDrawer(true)}><SlidersHorizontal />Filters</Button>
            <select value={sort} onChange={(e) => setSort(e.target.value as (typeof sorts)[number])} aria-label="Sort" className="h-10 rounded-full border border-input bg-card px-4 text-sm outline-none focus:border-brand">
              {sorts.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[240px_1fr]">
          <aside className="hidden lg:block">{filters}</aside>
          <div>
            {loading ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6">{Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}</div>
            ) : list.length === 0 ? (
              <EmptyState icon={<SearchX />} title="No products match" body="Try removing a filter or searching for something broader." action={<Button onClick={reset}>Clear all filters</Button>} />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6">{shown.map((p) => <ProductCard key={p.id} product={p} />)}</div>
                {pages > 1 && (
                  <div className="mt-12 flex justify-center gap-2">
                    {Array.from({ length: pages }).map((_, i) => (
                      <button key={i} onClick={() => setPage(i + 1)} className={cn("h-10 w-10 rounded-full text-sm font-semibold", page === i + 1 ? "bg-primary text-primary-foreground" : "border border-border hover:border-foreground")}>{i + 1}</button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {drawer && (
        <div className="fixed inset-0 z-50 bg-foreground/30 lg:hidden" onClick={() => setDrawer(false)}>
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-background p-6 animate-in slide-in-from-bottom" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between"><h3 className="text-lg font-semibold">Filters</h3><button onClick={() => setDrawer(false)} aria-label="Close"><X className="h-5 w-5" /></button></div>
            {filters}
            <Button className="mt-3 w-full" onClick={() => setDrawer(false)}>Show {list.length} results</Button>
          </div>
        </div>
      )}
    </StoreLayout>
  );
}
