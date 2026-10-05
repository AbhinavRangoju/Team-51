import headphones from "@/assets/p-headphones.jpg";
import sneaker from "@/assets/p-sneaker.jpg";
import vase from "@/assets/p-vase.jpg";
import bag from "@/assets/p-bag.jpg";
import laptop from "@/assets/p-laptop.jpg";
import serum from "@/assets/p-serum.jpg";
import watch from "@/assets/p-watch.jpg";
import books from "@/assets/p-books.jpg";
import yoga from "@/assets/p-yoga.jpg";
import coffee from "@/assets/p-coffee.jpg";
import sweater from "@/assets/p-sweater.jpg";

export type Category = { slug: string; name: string; image: string; count: number };
export type Vendor = {
  id: string;
  name: string;
  tagline: string;
  rating: number;
  products: number;
  verified: boolean;
  city: string;
  since: number;
  status: "Verified" | "Pending Verification" | "Rejected";
  owner: string;
  email: string;
};
export type Product = {
  id: string;
  name: string;
  vendorId: string;
  category: string;
  brand: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  stock: number;
  image: string;
  tags: ("trending" | "new" | "best" | "deal")[];
  description: string;
  specs: Record<string, string>;
  sku: string;
  status: "Active" | "Draft" | "Archived";
  createdAt: string;
};

export const categories: Category[] = [
  { slug: "fashion", name: "Fashion", image: sweater, count: 1240 },
  { slug: "electronics", name: "Electronics", image: laptop, count: 860 },
  { slug: "home", name: "Home & Living", image: vase, count: 1032 },
  { slug: "beauty", name: "Beauty", image: serum, count: 540 },
  { slug: "sports", name: "Sports", image: yoga, count: 412 },
  { slug: "accessories", name: "Accessories", image: bag, count: 688 },
  { slug: "books", name: "Books", image: books, count: 2310 },
  { slug: "grocery", name: "Grocery", image: coffee, count: 976 },
];

export const vendors: Vendor[] = [
  { id: "v1", name: "Nordic Sound Co.", tagline: "Audio, engineered quietly", rating: 4.8, products: 64, verified: true, city: "Bengaluru", since: 2021, status: "Verified", owner: "Arjun Mehta", email: "arjun@nordicsound.in" },
  { id: "v2", name: "Stride Athletics", tagline: "Performance footwear & gear", rating: 4.7, products: 128, verified: true, city: "Mumbai", since: 2019, status: "Verified", owner: "Neha Kapoor", email: "neha@stride.in" },
  { id: "v3", name: "Clay & Kiln", tagline: "Handmade home objects", rating: 4.9, products: 42, verified: true, city: "Jaipur", since: 2022, status: "Verified", owner: "Ishita Rao", email: "ishita@claykiln.in" },
  { id: "v4", name: "Lumora Skin", tagline: "Clean, clinical skincare", rating: 4.6, products: 37, verified: true, city: "Delhi", since: 2023, status: "Verified", owner: "Kavya Iyer", email: "kavya@lumora.in" },
  { id: "v5", name: "Tessera Tech", tagline: "Laptops & wearables", rating: 4.5, products: 210, verified: true, city: "Hyderabad", since: 2018, status: "Verified", owner: "Rohan Das", email: "rohan@tessera.in" },
  { id: "v6", name: "Riverstone Pantry", tagline: "Small-batch food & coffee", rating: 4.8, products: 89, verified: true, city: "Coorg", since: 2020, status: "Verified", owner: "Meera Pillai", email: "meera@riverstone.in" },
  { id: "v7", name: "Urban Loom", tagline: "Knitwear & essentials", rating: 0, products: 0, verified: false, city: "Pune", since: 2026, status: "Pending Verification", owner: "Sahil Jain", email: "sahil@urbanloom.in" },
  { id: "v8", name: "PageTurners", tagline: "Independent bookstore", rating: 0, products: 0, verified: false, city: "Kolkata", since: 2026, status: "Pending Verification", owner: "Ananya Bose", email: "ananya@pageturners.in" },
];

const base = (p: Omit<Product, "status" | "sku" | "createdAt"> & { createdAt?: string }): Product => ({
  status: "Active",
  sku: `MH-${p.id.toUpperCase()}-${p.category.slice(0, 3).toUpperCase()}`,
  createdAt: p.createdAt ?? "2026-09-01",
  ...p,
});

export const products: Product[] = [
  base({ id: "p1", name: "Aura ANC Wireless Headphones", vendorId: "v1", category: "electronics", brand: "Nordic", price: 8999, originalPrice: 12999, rating: 4.8, reviews: 1284, stock: 34, image: headphones, tags: ["trending", "best", "deal"], description: "Adaptive noise cancellation, 40-hour battery and memory-foam cushions wrapped in vegan leather. Tuned for long listening sessions without fatigue.", specs: { Battery: "40 hours", Connectivity: "Bluetooth 5.3", Weight: "254 g", Warranty: "1 year" } }),
  base({ id: "p2", name: "Velocity Run 3 Running Shoes", vendorId: "v2", category: "sports", brand: "Stride", price: 2799, originalPrice: 3999, rating: 4.7, reviews: 932, stock: 8, image: sneaker, tags: ["trending", "deal"], description: "Lightweight engineered mesh upper with a responsive foam midsole for everyday runs and tempo days.", specs: { Upper: "Engineered mesh", Drop: "8 mm", Weight: "248 g", Use: "Road running" } }),
  base({ id: "p3", name: "Dune Stoneware Vase", vendorId: "v3", category: "home", brand: "Clay & Kiln", price: 1450, rating: 4.9, reviews: 211, stock: 22, image: vase, tags: ["new", "best"], description: "Wheel-thrown stoneware with a speckled matte glaze. Each piece is unique and made in small batches in Jaipur.", specs: { Height: "24 cm", Material: "Stoneware", Finish: "Matte glaze", Care: "Hand wash" }, createdAt: "2026-09-28" }),
  base({ id: "p4", name: "Mira Leather Crossbody", vendorId: "v3", category: "accessories", brand: "Clay & Kiln", price: 3299, originalPrice: 4199, rating: 4.6, reviews: 418, stock: 15, image: bag, tags: ["trending", "new"], description: "Full-grain vegetable-tanned leather crossbody with an adjustable strap and magnetic flap.", specs: { Material: "Full-grain leather", Dimensions: "22 × 16 × 7 cm", Strap: "Adjustable", Lining: "Cotton twill" }, createdAt: "2026-09-25" }),
  base({ id: "p5", name: "Tessera Air 14 Laptop", vendorId: "v5", category: "electronics", brand: "Tessera", price: 64990, originalPrice: 72990, rating: 4.5, reviews: 657, stock: 0, image: laptop, tags: ["best"], description: "A 1.2 kg aluminium ultrabook with an all-day battery, 16 GB RAM and a 2.8K display. Ideal for students and creators.", specs: { Processor: "8-core, 4.2 GHz", Memory: "16 GB", Storage: "512 GB SSD", Display: "14\" 2.8K" } }),
  base({ id: "p6", name: "Radiant Vitamin C Serum Set", vendorId: "v4", category: "beauty", brand: "Lumora", price: 1899, originalPrice: 2499, rating: 4.6, reviews: 1543, stock: 56, image: serum, tags: ["trending", "best", "deal"], description: "15% vitamin C serum with hyaluronic acid, paired with a ceramide night cream for brighter, calmer skin.", specs: { Volume: "30 ml + 50 ml", "Skin type": "All", "Key actives": "Vitamin C, Ceramides", Cruelty: "Free" } }),
  base({ id: "p7", name: "Pulse 2 Smartwatch", vendorId: "v5", category: "electronics", brand: "Tessera", price: 5499, originalPrice: 6999, rating: 4.4, reviews: 803, stock: 41, image: watch, tags: ["trending", "new"], description: "Always-on AMOLED display, heart rate and SpO2 tracking, and 10-day battery in a slim aluminium case.", specs: { Display: "1.8\" AMOLED", Battery: "10 days", Water: "5 ATM", Sensors: "HR, SpO2, GPS" }, createdAt: "2026-09-20" }),
  base({ id: "p8", name: "Slow Living Book Collection", vendorId: "v6", category: "books", brand: "Riverstone", price: 2199, rating: 4.9, reviews: 176, stock: 12, image: books, tags: ["new"], description: "Three hardcover linen-bound titles on calm living, interiors and indoor plants.", specs: { Format: "Hardcover", Pages: "720 total", Language: "English", Publisher: "Kinfolk" }, createdAt: "2026-10-01" }),
  base({ id: "p9", name: "Cork Yoga Essentials Kit", vendorId: "v2", category: "sports", brand: "Stride", price: 2499, originalPrice: 3299, rating: 4.7, reviews: 389, stock: 5, image: yoga, tags: ["deal", "best"], description: "6 mm non-slip mat, two natural cork blocks and an insulated steel bottle. Everything you need for daily practice.", specs: { "Mat thickness": "6 mm", Blocks: "2 × cork", Bottle: "750 ml steel", Strap: "Included" } }),
  base({ id: "p10", name: "Estate Coffee & Granola Box", vendorId: "v6", category: "grocery", brand: "Riverstone", price: 899, rating: 4.8, reviews: 642, stock: 120, image: coffee, tags: ["trending", "new"], description: "Medium-roast single-estate Arabica beans from Coorg paired with honey-almond organic granola.", specs: { Coffee: "340 g, whole bean", Granola: "340 g", Roast: "Medium", Origin: "Coorg, India" }, createdAt: "2026-09-30" }),
  base({ id: "p11", name: "Oat Merino Crewneck Sweater", vendorId: "v2", category: "fashion", brand: "Stride", price: 3499, originalPrice: 4999, rating: 4.6, reviews: 274, stock: 19, image: sweater, tags: ["new", "deal"], description: "Soft merino-blend knit with a relaxed fit and ribbed trims. A year-round layering essential.", specs: { Material: "70% merino, 30% nylon", Fit: "Relaxed", Care: "Cold hand wash", Origin: "India" }, createdAt: "2026-09-27" }),
  base({ id: "p12", name: "Studio Wireless Headphones (Refurb)", vendorId: "v1", category: "electronics", brand: "Nordic", price: 5999, originalPrice: 9999, rating: 4.3, reviews: 98, stock: 3, image: headphones, tags: ["deal"], description: "Certified-refurbished Aura headphones with a new set of cushions and a full 6-month warranty.", specs: { Battery: "36 hours", Condition: "Certified refurbished", Warranty: "6 months", Connectivity: "Bluetooth 5.2" } }),
];

export type OrderStatus = "Order Placed" | "Confirmed" | "Processing" | "Shipped" | "Out for Delivery" | "Delivered" | "Cancelled";
export const orderFlow: OrderStatus[] = ["Order Placed", "Confirmed", "Processing", "Shipped", "Out for Delivery", "Delivered"];

export type OrderItem = { productId: string; qty: number; price: number };
export type Order = {
  id: string;
  date: string;
  customer: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  payment: "Paid" | "Pending" | "Refunded";
  method: string;
  eta: string;
  address: string;
};

export const seedOrders: Order[] = [
  { id: "MH-482913", date: "2026-09-28", customer: "Priya Sharma", items: [{ productId: "p1", qty: 1, price: 8999 }, { productId: "p10", qty: 2, price: 899 }], total: 10797, status: "Shipped", payment: "Paid", method: "UPI", eta: "Oct 7, 2026", address: "12 Lake View Rd, Bengaluru 560034" },
  { id: "MH-471205", date: "2026-09-14", customer: "Priya Sharma", items: [{ productId: "p6", qty: 1, price: 1899 }], total: 1899, status: "Delivered", payment: "Paid", method: "Card", eta: "Sep 18, 2026", address: "12 Lake View Rd, Bengaluru 560034" },
  { id: "MH-465530", date: "2026-08-30", customer: "Priya Sharma", items: [{ productId: "p3", qty: 1, price: 1450 }], total: 1450, status: "Cancelled", payment: "Refunded", method: "Wallet", eta: "—", address: "12 Lake View Rd, Bengaluru 560034" },
];

export const vendorOrders: Order[] = [
  { id: "MH-483120", date: "2026-10-04", customer: "Rahul Verma", items: [{ productId: "p2", qty: 1, price: 2799 }], total: 2799, status: "Order Placed", payment: "Paid", method: "Card", eta: "Oct 9", address: "Mumbai" },
  { id: "MH-483044", date: "2026-10-04", customer: "Sneha Gupta", items: [{ productId: "p9", qty: 2, price: 2499 }], total: 4998, status: "Confirmed", payment: "Paid", method: "UPI", eta: "Oct 8", address: "Pune" },
  { id: "MH-482990", date: "2026-10-03", customer: "Aman Khan", items: [{ productId: "p11", qty: 1, price: 3499 }], total: 3499, status: "Processing", payment: "Pending", method: "COD", eta: "Oct 8", address: "Delhi" },
  { id: "MH-482871", date: "2026-10-02", customer: "Divya Nair", items: [{ productId: "p2", qty: 2, price: 2799 }], total: 5598, status: "Shipped", payment: "Paid", method: "Card", eta: "Oct 6", address: "Kochi" },
  { id: "MH-482650", date: "2026-09-30", customer: "Karan Singh", items: [{ productId: "p9", qty: 1, price: 2499 }], total: 2499, status: "Delivered", payment: "Paid", method: "Wallet", eta: "Oct 3", address: "Jaipur" },
  { id: "MH-482411", date: "2026-09-29", customer: "Pooja Reddy", items: [{ productId: "p11", qty: 1, price: 3499 }], total: 3499, status: "Cancelled", payment: "Refunded", method: "UPI", eta: "—", address: "Hyderabad" },
];

export const customers = [
  { id: "u1", name: "Priya Sharma", email: "priya@mail.com", orders: 14, spent: 48210, joined: "2024-03-11", status: "Active" },
  { id: "u2", name: "Rahul Verma", email: "rahul@mail.com", orders: 6, spent: 15400, joined: "2025-01-08", status: "Active" },
  { id: "u3", name: "Sneha Gupta", email: "sneha@mail.com", orders: 22, spent: 91230, joined: "2023-07-19", status: "Active" },
  { id: "u4", name: "Aman Khan", email: "aman@mail.com", orders: 2, spent: 3499, joined: "2026-08-02", status: "Suspended" },
  { id: "u5", name: "Divya Nair", email: "divya@mail.com", orders: 9, spent: 27650, joined: "2024-11-23", status: "Active" },
  { id: "u6", name: "Karan Singh", email: "karan@mail.com", orders: 4, spent: 9800, joined: "2025-06-14", status: "Active" },
];

export const salesSeries = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"].map((m, i) => ({
  month: m,
  sales: [182, 214, 198, 256, 289, 342][i] * 1000,
  orders: [64, 78, 71, 92, 104, 121][i],
}));

export const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
export const getProduct = (id: string) => products.find((p) => p.id === id);
export const getVendor = (id: string) => vendors.find((v) => v.id === id);
export const discountPct = (p: Product) => (p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0);
