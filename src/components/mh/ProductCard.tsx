import { Link } from "@tanstack/react-router";
import { Heart, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { discountPct, getVendor, inr, type Product } from "@/lib/data";
import { useStore } from "@/lib/store";
import { Stars } from "./ui";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, wishlist, toggleWish } = useStore();
  const vendor = getVendor(product.vendorId);
  const wished = wishlist.includes(product.id);
  const pct = discountPct(product);
  const out = product.stock === 0;

  return (
    <div className="group relative flex flex-col">
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="relative block aspect-square overflow-hidden rounded-2xl bg-surface"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={816}
          height={816}
          className={cn("h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]", out && "opacity-60")}
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {pct > 0 && <span className="rounded-full bg-brand px-2.5 py-1 text-[11px] font-bold text-brand-foreground">-{pct}%</span>}
          {out ? (
            <span className="rounded-full bg-card px-2.5 py-1 text-[11px] font-semibold">Sold out</span>
          ) : product.stock < 10 ? (
            <span className="rounded-full bg-card px-2.5 py-1 text-[11px] font-semibold text-warning">Only {product.stock} left</span>
          ) : null}
        </div>
      </Link>
      <button
        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        onClick={() => {
          toggleWish(product.id);
          toast(wished ? "Removed from wishlist" : "Saved to wishlist");
        }}
        className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-card/90 backdrop-blur transition hover:scale-105"
      >
        <Heart className={cn("h-4 w-4", wished ? "fill-brand text-brand" : "text-foreground")} />
      </button>
      <div className="mt-3 flex flex-1 flex-col">
        <span className="text-xs text-muted-foreground">{vendor?.name}</span>
        <Link to="/product/$id" params={{ id: product.id }} className="mt-0.5 line-clamp-1 font-medium hover:text-brand">
          {product.name}
        </Link>
        <div className="mt-1.5">
          <Stars value={product.rating} reviews={product.reviews} />
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-lg font-semibold">{inr(product.price)}</span>
            {product.originalPrice && <span className="text-xs text-muted-foreground line-through">{inr(product.originalPrice)}</span>}
          </div>
          <button
            disabled={out}
            onClick={() => {
              addToCart(product.id);
              toast.success("Added to cart", { description: product.name });
            }}
            aria-label="Add to cart"
            className="flex h-9 items-center gap-1 rounded-full border border-border bg-card px-3 text-xs font-semibold transition hover:border-primary hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square rounded-2xl bg-surface" />
      <div className="mt-3 h-3 w-1/3 rounded bg-surface" />
      <div className="mt-2 h-4 w-3/4 rounded bg-surface" />
      <div className="mt-3 h-5 w-1/2 rounded bg-surface" />
    </div>
  );
}
