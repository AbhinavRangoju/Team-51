import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { BadgeCheck, Heart, Minus, Plus, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { StoreLayout } from "@/components/mh/StoreLayout";
import { ProductCard } from "@/components/mh/ProductCard";
import { Price, SectionHeader, Stars, StatusBadge, stockLabel } from "@/components/mh/ui";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProduct, getVendor, inr, products } from "@/lib/data";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const product = getProduct(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Product not found — MarketHub" }, { name: "robots", content: "noindex" }] };
    const p = loaderData.product;
    return {
      meta: [
        { title: `${p.name} — MarketHub` },
        { name: "description", content: p.description },
        { property: "og:title", content: `${p.name} — MarketHub` },
        { property: "og:description", content: p.description },
      ],
    };
  },
  component: ProductPage,
});

const reviews = [
  { name: "Aditi R.", rating: 5, date: "Sep 21, 2026", text: "Exactly as described and arrived two days early. Packaging was thoughtful." },
  { name: "Vikram S.", rating: 4, date: "Sep 12, 2026", text: "Great quality for the price. The seller answered my questions quickly." },
  { name: "Lena M.", rating: 5, date: "Aug 30, 2026", text: "Second purchase from this vendor. Consistently excellent." },
];

function ProductPage() {
  const { product: p } = Route.useLoaderData();
  const vendor = getVendor(p.vendorId)!;
  const { addToCart, wishlist, toggleWish } = useStore();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [img, setImg] = useState(0);
  const [zoom, setZoom] = useState(false);
  const gallery = [p.image, ...products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 2).map((x) => x.image), p.image];
  const out = p.stock === 0;
  const wished = wishlist.includes(p.id);
  const related = products.filter((x) => x.id !== p.id && (x.category === p.category || x.vendorId === p.vendorId)).slice(0, 4);
  const bundle = products.filter((x) => x.id !== p.id && x.stock > 0).slice(0, 2);

  return (
    <StoreLayout>
      <div className="container-mh pt-8">
        <nav className="text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link> / <Link to="/shop" search={{ cat: p.category }} className="capitalize hover:text-foreground">{p.category}</Link> / <span className="text-foreground">{p.name}</span>
        </nav>
        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <div>
            <div className="relative aspect-square cursor-zoom-in overflow-hidden rounded-3xl bg-surface" onMouseEnter={() => setZoom(true)} onMouseLeave={() => setZoom(false)}>
              <img src={gallery[img]} alt={p.name} className={cn("h-full w-full object-cover transition duration-500", zoom && "scale-125")} />
            </div>
            <div className="mt-3 grid grid-cols-4 gap-3">
              {gallery.map((g, i) => (
                <button key={i} onClick={() => setImg(i)} aria-label={`View image ${i + 1}`} className={cn("aspect-square overflow-hidden rounded-2xl border-2 bg-surface transition", img === i ? "border-primary" : "border-transparent hover:border-border")}>
                  <img src={g} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <Link to="/vendors" className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-semibold hover:bg-accent">
              Sold by {vendor.name} <BadgeCheck className="h-3.5 w-3.5 text-brand" />
            </Link>
            <h1 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">{p.name}</h1>
            <div className="mt-3"><Stars value={p.rating} reviews={p.reviews} size="md" /></div>
            <div className="mt-6"><Price price={p.price} original={p.originalPrice} size="lg" /></div>
            <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes</p>
            <div className="mt-5"><StatusBadge status={out ? "Out of stock" : p.stock < 10 ? `Only ${p.stock} left` : "In stock"} toneOverride={out ? "danger" : p.stock < 10 ? "warning" : "success"} /></div>
            <p className="mt-6 text-muted-foreground">{p.description}</p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="flex h-12 items-center rounded-full border border-border bg-card">
                <button className="grid h-12 w-12 place-items-center disabled:opacity-40" disabled={qty <= 1} onClick={() => setQty(qty - 1)} aria-label="Decrease"><Minus className="h-4 w-4" /></button>
                <span className="w-8 text-center font-semibold">{qty}</span>
                <button className="grid h-12 w-12 place-items-center disabled:opacity-40" disabled={qty >= p.stock} onClick={() => setQty(qty + 1)} aria-label="Increase"><Plus className="h-4 w-4" /></button>
              </div>
              <Button size="lg" variant="default" disabled={out} className="flex-1" onClick={() => { addToCart(p.id, qty); toast.success("Added to cart", { description: `${qty} × ${p.name}` }); }}>Add to Cart</Button>
              <Button size="lg" variant="brand" disabled={out} className="flex-1" onClick={() => { addToCart(p.id, qty); navigate({ to: "/checkout" }); }}>Buy Now</Button>
              <Button size="icon" variant="outline" className="h-12 w-12" aria-label="Wishlist" onClick={() => { toggleWish(p.id); toast(wished ? "Removed from wishlist" : "Saved to wishlist"); }}>
                <Heart className={cn(wished && "fill-brand text-brand")} />
              </Button>
            </div>

            <div className="mt-8 grid gap-3 rounded-2xl border border-border p-5 text-sm sm:grid-cols-3">
              <div className="flex gap-3"><Truck className="h-5 w-5 shrink-0 text-brand" /><div><div className="font-semibold">Free delivery</div><div className="text-muted-foreground">By Oct 9</div></div></div>
              <div className="flex gap-3"><RotateCcw className="h-5 w-5 shrink-0 text-brand" /><div><div className="font-semibold">7-day returns</div><div className="text-muted-foreground">No questions</div></div></div>
              <div className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-brand" /><div><div className="font-semibold">Buyer protection</div><div className="text-muted-foreground">On every order</div></div></div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="desc" className="mt-16">
          <TabsList className="h-auto gap-1 rounded-full bg-surface p-1">
            {[["desc", "Description"], ["specs", "Specifications"], ["seller", "Seller"], ["reviews", `Reviews (${p.reviews})`]].map(([v, l]) => (
              <TabsTrigger key={v} value={v} className="rounded-full px-4 py-2 data-[state=active]:bg-card data-[state=active]:shadow-card">{l}</TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="desc" className="mt-6 max-w-3xl text-muted-foreground">{p.description} Every MarketHub listing is reviewed for accuracy, and the seller ships directly from their own studio or warehouse.</TabsContent>
          <TabsContent value="specs" className="mt-6">
            <dl className="card-mh max-w-2xl divide-y divide-border">
              {Object.entries(p.specs).concat([["SKU", p.sku], ["Brand", p.brand]]).map(([k, v]) => (
                <div key={k} className="grid grid-cols-2 px-5 py-3.5 text-sm"><dt className="text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>
              ))}
            </dl>
          </TabsContent>
          <TabsContent value="seller" className="mt-6">
            <div className="card-mh flex max-w-2xl flex-col gap-5 p-6 sm:flex-row sm:items-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-surface font-display text-2xl font-semibold">{vendor.name[0]}</span>
              <div className="flex-1">
                <div className="flex items-center gap-1.5 text-lg font-semibold">{vendor.name}<BadgeCheck className="h-5 w-5 text-brand" /></div>
                <div className="text-sm text-muted-foreground">{vendor.tagline} · {vendor.city} · Selling since {vendor.since}</div>
                <div className="mt-2 text-sm">★ {vendor.rating} seller rating · {vendor.products} products</div>
              </div>
              <Button variant="outline" asChild><Link to="/vendors">Visit store</Link></Button>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6 grid max-w-3xl gap-4">
            {reviews.map((r) => (
              <div key={r.name} className="card-mh p-5">
                <div className="flex items-center justify-between"><span className="font-semibold">{r.name}</span><span className="text-xs text-muted-foreground">{r.date}</span></div>
                <div className="mt-1"><Stars value={r.rating} /></div>
                <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
              </div>
            ))}
          </TabsContent>
        </Tabs>

        <section className="mt-16">
          <SectionHeader title="Frequently bought together" />
          <div className="card-mh flex flex-col items-center gap-6 p-6 md:flex-row">
            {[p, ...bundle].map((b, i) => (
              <div key={b.id} className="flex items-center gap-6">
                {i > 0 && <Plus className="h-5 w-5 text-muted-foreground" />}
                <div className="w-32 text-center"><img src={b.image} alt="" className="aspect-square w-full rounded-2xl object-cover" /><div className="mt-2 line-clamp-1 text-sm">{b.name}</div><div className="text-sm font-semibold">{inr(b.price)}</div></div>
              </div>
            ))}
            <div className="md:ml-auto md:text-right">
              <div className="text-sm text-muted-foreground">Bundle total</div>
              <div className="font-display text-2xl font-semibold">{inr([p, ...bundle].reduce((s, b) => s + b.price, 0))}</div>
              <Button className="mt-3" disabled={out} onClick={() => { [p, ...bundle].forEach((b) => addToCart(b.id)); toast.success("Bundle added to cart"); }}>Add all to cart</Button>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <SectionHeader title="You may also like" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:gap-x-6 lg:grid-cols-4">{related.map((r) => <ProductCard key={r.id} product={r} />)}</div>
        </section>
      </div>
    </StoreLayout>
  );
}
