import type { SceneId } from "./Illustrations";

export type Slide = {
  id: string;
  label: string;
  title: string;
  text: string;
  scene: SceneId;
};

export const customerSlides: Slide[] = [
  {
    id: "discover",
    label: "Discover",
    scene: "discover",
    title: "Discover what you love",
    text: "Explore products from multiple trusted sellers, all in one place.",
  },
  {
    id: "compare",
    label: "Compare",
    scene: "compare",
    title: "Search. Compare. Choose.",
    text: "Find products faster with powerful search, filters, ratings, and seller information.",
  },
  {
    id: "secure",
    label: "Secure",
    scene: "secure",
    title: "Shop with confidence",
    text: "Compare verified sellers, review product information, and enjoy a secure checkout experience.",
  },
];

export const vendorSlides: Slide[] = [
  {
    id: "store",
    label: "Store",
    scene: "store",
    title: "Build your store on MarketHub",
    text: "Reach customers, showcase your products, and grow your business from one place.",
  },
  {
    id: "products",
    label: "Products",
    scene: "products",
    title: "Your products. Your store.",
    text: "Add products, manage pricing and inventory, and keep your catalog up to date.",
  },
  {
    id: "orders",
    label: "Orders",
    scene: "orders",
    title: "Stay on top of every order",
    text: "Track incoming orders, update order status, and keep your customers informed.",
  },
  {
    id: "analytics",
    label: "Analytics",
    scene: "analytics",
    title: "Understand your business",
    text: "Track sales, revenue, orders, and your best-performing products.",
  },
];

export const shoppingCategories = [
  "Fashion",
  "Electronics",
  "Home & Living",
  "Beauty",
  "Sports",
  "Books",
  "Accessories",
  "Grocery",
  "Other",
];

export const businessCategories = [
  "Fashion",
  "Electronics",
  "Home & Living",
  "Beauty",
  "Sports",
  "Books",
  "Food",
  "Handmade",
  "Other",
];
