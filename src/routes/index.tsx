import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, ShieldCheck, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import hero from "@/assets/hero.jpg";
import { StoreLayout } from "@/components/mh/StoreLayout";
import { ProductCard } from "@/components/mh/ProductCard";
import { SectionHeader } from "@/components/mh/ui";
import { Button } from "@/components/ui/button";
import { categories, products, vendors } from "@/lib/data";
import vase from "@/assets/p-vase.jpg";
import sneaker from "@/assets/p-sneaker.jpg";
import serum from "@/assets/p-serum.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MarketHub — Everything you want, from sellers you trust" },
      { name: "description", content: "Discover products from thousands of verified vendors. Secure checkout, fast delivery, real reviews." },
      { property: "og:title", content: "MarketHub — Everything you want, from sellers you trust" },
      { property: "og:description", content: "Discover products from thousands of verified vendors. Secure checkout, fast delivery, real reviews." },
    ],
  }),
  component: Index,
});

function Rail({ tag, eyebrow, title }: { tag: "trending" | "new" | "best" | "deal"; eyebrow: string; title: string }) {
  const list = products.filter((p) => p.tags.includes(tag)).slice(0, 4);
  return (
    <section className="container-mh mt-20">
      <SectionHeader eyebrow={eyebrow} title={title} action={<Link to="/shop" className="flex items-center gap-1 text-sm font-semibold hover:text-brand">View all <ArrowRight className="h-4 w-4" /></Link>} />
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:gap-x-6 lg:grid-cols-4">
        {list.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}

function Index() {
  const [email, setEmail] = useState("");
  const promos = [
    { title: "Big Deals", sub: "Up to 40% off top-rated picks", img: sneaker, to: "/deals", dark: true },
    { title: "New Arrivals", sub: "Fresh drops this week", img: vase, to: "/shop", dark: false },
    { title: "Vendor Specials", sub: "Exclusive from indie makers", img: serum, to: "/vendors", dark: false },
  ] as const;

  return (
    <StoreLayout>
      <section className="container-mh pt-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-surface">
          <img src={hero} alt="Shopper carrying MarketHub bags" width={1600} height={1008} className="absolute inset-0 h-full w-full object-cover object-[70%_center]" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent md:via-background/40" />
          <div className="relative flex min-h-[520px] max-w-xl flex-col justify-center px-6 py-14 md:min-h-[600px] md:px-14">
            <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-card px-3 py-1.5 text-xs font-semibold shadow-card">
              <span className="h-2 w-2 rounded-full bg-brand" /> 6,200+ verified sellers
            </span>
            <h1 className="text-4xl font-semibold leading-[1.05] md:text-6xl">
              Everything you want. <span className="text-brand">From sellers you trust.</span>
            </h1>
            <p className="mt-5 max-w-md text-base text-muted-foreground md:text-lg">
              One cart for independent brands across fashion, tech, home and more — with protected payments on every order.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="brand" size="lg"><Link to="/shop">Shop Now <ArrowRight /></Link></Button>
              <Button asChild variant="outline" size="lg"><Link to="/categories">Explore Categories</Link></Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium">
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand" />Secure checkout</span>
              <span className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-brand" />Verified vendors</span>
              <span className="flex items-center gap-2"><Truck className="h-4 w-4 text-brand" />Fast delivery</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container-mh mt-16">
        <SectionHeader eyebrow="Browse" title="Shop by category" />
        <div className="-mx-4 flex gap-5 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-8 md:px-0">
          {categories.map((c) => (
            <Link key={c.slug} to="/shop" search={{ cat: c.slug }} className="group flex w-24 shrink-0 flex-col items-center text-center md:w-auto">
              <div className="aspect-square w-full overflow-hidden rounded-full border border-border bg-surface transition group-hover:border-brand group-hover:shadow-lift">
                <img src={c.image} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
              </div>
              <span className="mt-3 text-sm font-semibold">{c.name}</span>
              <span className="text-xs text-muted-foreground">{c.count.toLocaleString("en-IN")} items</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-mh mt-16 grid gap-4 md:grid-cols-3">
        {promos.map((p) => (
          <Link key={p.title} to={p.to} className={`group relative flex h-56 overflow-hidden rounded-3xl p-7 ${p.dark ? "bg-primary text-primary-foreground" : "bg-surface"}`}>
            <div className="relative z-10 flex flex-col">
              <h3 className="text-2xl font-semibold">{p.title}</h3>
              <p className={`mt-1 max-w-[12rem] text-sm ${p.dark ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{p.sub}</p>
              <span className="mt-auto flex items-center gap-1 text-sm font-semibold">Shop now <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
            </div>
            <img src={p.img} alt="" loading="lazy" className="absolute -bottom-6 -right-6 h-52 w-52 rounded-full object-cover transition duration-500 group-hover:scale-105" />
          </Link>
        ))}
      </section>

      <Rail tag="trending" eyebrow="Right now" title="Trending products" />
      <Rail tag="new" eyebrow="Just landed" title="New arrivals" />

      <section className="container-mh mt-20">
        <div className="grid items-center gap-8 rounded-[2rem] bg-primary p-8 text-primary-foreground md:grid-cols-2 md:p-14">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">Deals of the week</p>
            <h2 className="mt-2 text-3xl font-semibold md:text-4xl">Festive Week. Prices drop daily at noon.</h2>
            <p className="mt-3 text-primary-foreground/70">Hand-picked offers from top-rated vendors, ending Sunday.</p>
            <Button asChild variant="brand" size="lg" className="mt-7"><Link to="/deals">See all deals</Link></Button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[["02", "Days"], ["14", "Hours"], ["36", "Mins"]].map(([n, l]) => (
              <div key={l} className="rounded-2xl bg-primary-foreground/10 p-5 text-center">
                <div className="font-display text-4xl font-semibold">{n}</div>
                <div className="mt-1 text-xs text-primary-foreground/60">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Rail tag="best" eyebrow="Loved by shoppers" title="Best sellers" />

      <section className="container-mh mt-20">
        <SectionHeader eyebrow="Meet the makers" title="Featured vendors" action={<Link to="/vendors" className="flex items-center gap-1 text-sm font-semibold hover:text-brand">All vendors <ArrowRight className="h-4 w-4" /></Link>} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {vendors.filter((v) => v.verified).slice(0, 4).map((v) => {
            const sample = products.filter((p) => p.vendorId === v.id).slice(0, 3);
            return (
              <Link key={v.id} to="/vendors" className="card-mh p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-surface font-display font-semibold">{v.name[0]}</span>
                  <div>
                    <div className="flex items-center gap-1 font-semibold">{v.name}<BadgeCheck className="h-4 w-4 text-brand" /></div>
                    <div className="text-xs text-muted-foreground">★ {v.rating} · {v.products} products</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {sample.map((p) => <img key={p.id} src={p.image} alt="" loading="lazy" className="aspect-square rounded-xl object-cover" />)}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container-mh mt-20">
        <div className="flex flex-col items-center rounded-[2rem] border border-border bg-card px-6 py-14 text-center">
          <h2 className="text-3xl font-semibold">Get first dibs on drops & deals</h2>
          <p className="mt-2 max-w-md text-muted-foreground">One email a week. New vendors, price drops, and nothing else.</p>
          <form
            className="mt-7 flex w-full max-w-md gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error("Please enter a valid email");
              toast.success("You're on the list!");
              setEmail("");
            }}
          >
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" aria-label="Email" className="h-12 flex-1 rounded-full border border-input bg-background px-5 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/10" />
            <Button variant="default" size="lg" type="submit">Subscribe</Button>
          </form>
        </div>
      </section>
    </StoreLayout>
  );
}
