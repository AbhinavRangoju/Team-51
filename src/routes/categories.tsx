import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, LayoutGrid, SearchX, Tag } from "lucide-react";
import { useMemo, useState } from "react";
import { StoreLayout } from "@/components/mh/StoreLayout";
import { EmptyState, SectionHeader, Stars } from "@/components/mh/ui";
import { Button } from "@/components/ui/button";
import { categories, discountPct, inr, products, vendors } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "All categories — MarketHub" },
      { name: "description", content: "Browse every MarketHub category — fashion, electronics, home, beauty, sports, books and more, from verified independent sellers." },
      { property: "og:title", content: "All categories — MarketHub" },
      { property: "og:description", content: "Browse every MarketHub category — fashion, electronics, home, beauty, sports, books and more, from verified independent sellers." },
    ],
  }),
  component: Categories,
});

const sorts = ["Most items", "A to Z", "Lowest price", "Top rated"] as const;
type Sort = (typeof sorts)[number];

/** Catalogue counts come from the category record; everything else is derived
 *  from the live product list so the numbers can never drift apart. */
function useCategoryStats() {
  return useMemo(
    () =>
      categories.map((c) => {
        const items = products.filter((p) => p.category === c.slug);
        const sellers = new Set(items.map((p) => p.vendorId));
        return {
          ...c,
          live: items.length,
          sellers: sellers.size,
          from: items.length ? Math.min(...items.map((p) => p.price)) : 0,
          rating: items.length ? items.reduce((s, p) => s + p.rating, 0) / items.length : 0,
          deals: items.filter((p) => discountPct(p) > 0).length,
          thumbs: items.slice(0, 3),
        };
      }),
    [],
  );
}

function Categories() {
  const all = useCategoryStats();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("Most items");

  const list = useMemo(() => {
    const l = all.filter((c) => c.name.toLowerCase().includes(q.trim().toLowerCase()));
    switch (sort) {
      case "A to Z":
        return [...l].sort((a, b) => a.name.localeCompare(b.name));
      case "Lowest price":
        return [...l].sort((a, b) => a.from - b.from);
      case "Top rated":
        return [...l].sort((a, b) => b.rating - a.rating);
      default:
        return [...l].sort((a, b) => b.count - a.count);
    }
  }, [all, q, sort]);

  const totalItems = all.reduce((s, c) => s + c.count, 0);
  const verifiedSellers = vendors.filter((v) => v.verified).length;

  return (
    <StoreLayout>
      <div className="container-mh pt-8">
        <nav className="text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>{" "}
          / <span className="text-foreground">Categories</span>
        </nav>

        <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-semibold md:text-4xl">Shop by category</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {all.length} categories · {totalItems.toLocaleString("en-IN")} items · {verifiedSellers} verified sellers
            </p>
          </div>
          <div className="flex gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Find a category"
              aria-label="Find a category"
              className="h-10 w-full rounded-full border border-input bg-card px-4 text-sm outline-none focus:border-brand md:w-56"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              aria-label="Sort categories"
              className="h-10 rounded-full border border-input bg-card px-4 text-sm outline-none focus:border-brand"
            >
              {sorts.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              icon={<SearchX />}
              title="No category matches"
              body={`Nothing here called “${q}”. Try a broader word, or search the full catalogue instead.`}
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <Button onClick={() => setQ("")}>Clear search</Button>
                  <Button asChild variant="outline">
                    <Link to="/shop" search={{ q }}>
                      Search all products
                    </Link>
                  </Button>
                </div>
              }
            />
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((c) => (
              <Link
                key={c.slug}
                to="/shop"
                search={{ cat: c.slug }}
                aria-label={`Shop ${c.name}`}
                className="card-mh group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-surface">
                  <img
                    src={c.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  {c.deals > 0 && (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-brand-foreground">
                      <Tag className="h-3 w-3" />
                      {c.deals} on offer
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold">{c.name}</h2>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {c.count.toLocaleString("en-IN")} items · {c.sellers} seller{c.sellers === 1 ? "" : "s"}
                      </p>
                    </div>
                    {c.from > 0 && (
                      <div className="shrink-0 text-right">
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">From</div>
                        <div className="font-display text-base font-semibold">{inr(c.from)}</div>
                      </div>
                    )}
                  </div>

                  {c.rating > 0 && (
                    <div className="mt-3">
                      <Stars value={c.rating} />
                    </div>
                  )}

                  {c.thumbs.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {c.thumbs.map((p) => (
                        <img key={p.id} src={p.image} alt="" loading="lazy" className="aspect-square rounded-xl object-cover" />
                      ))}
                    </div>
                  )}

                  <span className="mt-5 flex items-center gap-1 text-sm font-semibold">
                    Browse {c.name}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <section className="container-mh mt-20">
        <SectionHeader eyebrow="Can't decide" title="Popular right now across categories" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products
            .filter((p) => p.tags.includes("trending"))
            .slice(0, 4)
            .map((p) => {
              const cat = categories.find((c) => c.slug === p.category);
              return (
                <Link
                  key={p.id}
                  to="/product/$id"
                  params={{ id: p.id }}
                  className="card-mh flex items-center gap-3 p-3 transition hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <img src={p.image} alt="" loading="lazy" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{cat?.name}</div>
                    <div className="mt-0.5 text-sm font-semibold">{inr(p.price)}</div>
                  </div>
                </Link>
              );
            })}
        </div>
      </section>

      <section className="container-mh mt-20">
        <div className="grid items-center gap-8 rounded-[2rem] bg-primary p-8 text-primary-foreground md:grid-cols-[1fr_auto] md:p-14">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">One cart, every category</p>
            <h2 className="mt-2 text-3xl font-semibold md:text-4xl">Mix and match across sellers.</h2>
            <p className="mt-3 max-w-md text-primary-foreground/70">
              Add items from any number of independent vendors and check out once. Every order is covered by the MarketHub Buyer
              Guarantee.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild variant="brand" size="lg">
                <Link to="/shop">
                  Shop everything <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 md:w-[22rem]">
            {[
              [`${verifiedSellers}`, "Verified sellers"],
              [`${all.length}`, "Categories"],
              [`${products.filter((p) => discountPct(p) > 0).length}`, "Live offers"],
            ].map(([n, l]) => (
              <div key={l} className="rounded-2xl bg-primary-foreground/10 p-5 text-center">
                <div className="font-display text-3xl font-semibold">{n}</div>
                <div className={cn("mt-1 text-xs text-primary-foreground/60")}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-mh mt-20">
        <div className="card-mh flex flex-col items-center gap-4 px-6 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
              <LayoutGrid className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-semibold">Looking for something specific?</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Filter the full catalogue by price, rating, seller and availability.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 text-xs font-semibold text-muted-foreground lg:flex">
              <BadgeCheck className="h-4 w-4 text-brand" />
              Every seller ID-verified
            </span>
            <Button asChild variant="outline">
              <Link to="/shop">Open full shop</Link>
            </Button>
          </div>
        </div>
      </section>
    </StoreLayout>
  );
}
