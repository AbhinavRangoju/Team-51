import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BadgeCheck, MapPin, PackageSearch, SearchX, ShieldCheck, Store } from "lucide-react";
import { useMemo, useState } from "react";
import { StoreLayout } from "@/components/mh/StoreLayout";
import { ProductCard } from "@/components/mh/ProductCard";
import { EmptyState, SectionHeader, Stars, StatusBadge } from "@/components/mh/ui";
import { Button } from "@/components/ui/button";
import { inr, products, vendors, type Vendor } from "@/lib/data";
import { cn } from "@/lib/utils";

type Search = { v?: string };

export const Route = createFileRoute("/vendors")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    v: typeof s.v === "string" && s.v ? s.v : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Verified sellers — MarketHub" },
      { name: "description", content: "Browse every independent seller on MarketHub. Each store is ID-verified before it can list a product." },
      { property: "og:title", content: "Verified sellers — MarketHub" },
      { property: "og:description", content: "Browse every independent seller on MarketHub. Each store is ID-verified before it can list a product." },
    ],
  }),
  component: Vendors,
});

const sorts = ["Top rated", "Most products", "Newest", "A to Z"] as const;
type Sort = (typeof sorts)[number];

const listingsFor = (id: string) => products.filter((p) => p.vendorId === id);

function VendorAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn("grid shrink-0 place-items-center rounded-full bg-surface font-display font-semibold", className)}>
      {name[0]}
    </span>
  );
}

function VendorMeta({ vendor }: { vendor: Vendor }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      <span className="flex items-center gap-1">
        <MapPin className="h-3.5 w-3.5" />
        {vendor.city}
      </span>
      <span>Selling since {vendor.since}</span>
      <span>{vendor.products.toLocaleString("en-IN")} products</span>
    </div>
  );
}

/** Single-store view, reached via /vendors?v=<id>. */
function VendorStore({ vendor }: { vendor: Vendor }) {
  const listings = listingsFor(vendor.id);
  const from = listings.length ? Math.min(...listings.map((p) => p.price)) : 0;
  const avg = listings.length ? listings.reduce((s, p) => s + p.rating, 0) / listings.length : 0;

  return (
    <div className="container-mh pt-8">
      <nav className="text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>{" "}
        /{" "}
        <Link to="/vendors" className="hover:text-foreground">
          Vendors
        </Link>{" "}
        / <span className="text-foreground">{vendor.name}</span>
      </nav>

      <div className="card-mh mt-4 flex flex-col gap-6 p-6 md:flex-row md:items-center md:p-8">
        <VendorAvatar name={vendor.name} className="h-20 w-20 text-3xl" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold md:text-3xl">{vendor.name}</h1>
            {vendor.verified && <BadgeCheck className="h-6 w-6 text-brand" />}
            <StatusBadge status={vendor.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{vendor.tagline}</p>
          <div className="mt-3">
            <VendorMeta vendor={vendor} />
          </div>
          {vendor.rating > 0 && (
            <div className="mt-3">
              <Stars value={vendor.rating} size="md" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 md:items-end">
          {from > 0 && (
            <div className="md:text-right">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Listings from</div>
              <div className="font-display text-xl font-semibold">{inr(from)}</div>
            </div>
          )}
          <Button asChild variant="outline">
            <Link to="/vendors">
              <ArrowLeft />
              All sellers
            </Link>
          </Button>
        </div>
      </div>

      <section className="mt-12">
        <SectionHeader
          eyebrow="In this store"
          title={`${listings.length} listing${listings.length === 1 ? "" : "s"} available`}
          action={
            listings.length > 0 ? (
              <Link to="/shop" className="flex items-center gap-1 text-sm font-semibold hover:text-brand">
                Shop everything <ArrowRight className="h-4 w-4" />
              </Link>
            ) : undefined
          }
        />
        {listings.length === 0 ? (
          <EmptyState
            icon={<PackageSearch />}
            title="No live listings yet"
            body={
              vendor.verified
                ? "This seller is verified but has not published a product yet. Check back shortly."
                : "This store is still going through ID verification, so it cannot publish products yet."
            }
            action={
              <Button asChild variant="outline">
                <Link to="/shop">Browse other sellers</Link>
              </Button>
            }
          />
        ) : (
          <>
            {avg > 0 && (
              <p className="mb-6 text-sm text-muted-foreground">
                Average product rating {avg.toFixed(1)} across this store
              </p>
            )}
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
              {listings.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function VendorCard({ vendor }: { vendor: Vendor }) {
  const listings = listingsFor(vendor.id);
  return (
    <div className="card-mh flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-start gap-3">
        <VendorAvatar name={vendor.name} className="h-12 w-12 text-lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h2 className="truncate font-semibold">{vendor.name}</h2>
            {vendor.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-brand" />}
          </div>
          <p className="truncate text-xs text-muted-foreground">{vendor.tagline}</p>
        </div>
        <StatusBadge status={vendor.status} />
      </div>

      <div className="mt-4">
        {vendor.rating > 0 ? <Stars value={vendor.rating} /> : <span className="text-xs text-muted-foreground">Not yet rated</span>}
      </div>

      <div className="mt-3">
        <VendorMeta vendor={vendor} />
      </div>

      {listings.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {listings.slice(0, 3).map((p) => (
            <Link key={p.id} to="/product/$id" params={{ id: p.id }} aria-label={p.name}>
              <img src={p.image} alt="" loading="lazy" className="aspect-square w-full rounded-xl object-cover transition hover:opacity-85" />
            </Link>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">
          {listings.length} live listing{listings.length === 1 ? "" : "s"}
        </span>
        <Button asChild size="sm" variant="outline">
          <Link to="/vendors" search={{ v: vendor.id }}>
            Visit store
          </Link>
        </Button>
      </div>
    </div>
  );
}

function Vendors() {
  const { v } = Route.useSearch();
  const selected = v ? vendors.find((x) => x.id === v) : undefined;

  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("Top rated");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const verified = useMemo(() => vendors.filter((x) => x.verified), []);
  const pending = useMemo(() => vendors.filter((x) => !x.verified), []);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    const l = vendors.filter(
      (x) =>
        (!verifiedOnly || x.verified) &&
        (!term || (x.name + x.tagline + x.city).toLowerCase().includes(term)),
    );
    switch (sort) {
      case "Most products":
        return [...l].sort((a, b) => b.products - a.products);
      case "Newest":
        return [...l].sort((a, b) => b.since - a.since);
      case "A to Z":
        return [...l].sort((a, b) => a.name.localeCompare(b.name));
      default:
        return [...l].sort((a, b) => b.rating - a.rating);
    }
  }, [q, sort, verifiedOnly]);

  if (selected) return <StoreLayout><VendorStore vendor={selected} /></StoreLayout>;

  const cities = new Set(vendors.map((x) => x.city)).size;

  return (
    <StoreLayout>
      <div className="container-mh pt-8">
        <nav className="text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>{" "}
          / <span className="text-foreground">Vendors</span>
        </nav>

        <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-semibold md:text-4xl">Independent sellers</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {verified.length} verified · {pending.length} awaiting verification · shipping from {cities} cities
            </p>
          </div>
          <div className="flex gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search sellers or cities"
              aria-label="Search sellers or cities"
              className="h-10 w-full rounded-full border border-input bg-card px-4 text-sm outline-none focus:border-brand md:w-56"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              aria-label="Sort sellers"
              className="h-10 rounded-full border border-input bg-card px-4 text-sm outline-none focus:border-brand"
            >
              {sorts.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-border pb-6">
          <button
            onClick={() => setVerifiedOnly(false)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
              !verifiedOnly ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-foreground",
            )}
          >
            All sellers
          </button>
          <button
            onClick={() => setVerifiedOnly(true)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
              verifiedOnly ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-foreground",
            )}
          >
            <BadgeCheck className="h-3.5 w-3.5" />
            Verified only
          </button>
        </div>

        {list.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              icon={<SearchX />}
              title="No sellers match"
              body={`Nothing matched “${q}”. Try a seller name, a product category or a city.`}
              action={
                <Button
                  onClick={() => {
                    setQ("");
                    setVerifiedOnly(false);
                  }}
                >
                  Clear search
                </Button>
              }
            />
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((x) => (
              <VendorCard key={x.id} vendor={x} />
            ))}
          </div>
        )}
      </div>

      <section className="container-mh mt-20">
        <div className="grid items-center gap-8 rounded-[2rem] bg-primary p-8 text-primary-foreground md:grid-cols-[1fr_auto] md:p-14">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">How verification works</p>
            <h2 className="mt-2 text-3xl font-semibold md:text-4xl">No listing goes live unverified.</h2>
            <p className="mt-3 max-w-md text-primary-foreground/70">
              Every seller submits business registration and identity documents before a single product can be published. Stores
              awaiting review are shown with a pending badge and cannot take orders.
            </p>
            <div className="mt-7">
              <Button asChild variant="brand" size="lg">
                <Link to="/shop">
                  Shop verified sellers <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 md:w-[22rem]">
            {[
              [`${verified.length}`, "Verified"],
              [`${cities}`, "Cities"],
              [`${products.length}`, "Live listings"],
            ].map(([n, l]) => (
              <div key={l} className="rounded-2xl bg-primary-foreground/10 p-5 text-center">
                <div className="font-display text-3xl font-semibold">{n}</div>
                <div className="mt-1 text-xs text-primary-foreground/60">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-mh mt-20">
        <div className="card-mh flex flex-col items-center gap-4 px-6 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-semibold">Buyer Guarantee on every seller</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Item not as described or never shipped? You are refunded in full, whichever store you bought from.
              </p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-muted-foreground">
            <Store className="h-4 w-4" />
            {vendors.length} stores on MarketHub
          </span>
        </div>
      </section>
    </StoreLayout>
  );
}
