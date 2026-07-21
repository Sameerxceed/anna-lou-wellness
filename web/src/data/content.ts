// ═══ PRODUCTS — Anna Lou of London ═══
export interface Product {
  id: number;
  name: string;
  slug: string;
  shortDescription: string;
  // Legacy markdown string — kept for metadata .slice() + ProductSchema JSON-LD
  // which need a plain string, not blocks JSON.
  description: string;
  // Blocks JSON companion — preferred for on-page rendering when populated.
  // Null when Anna hasn't migrated the entry yet; renderer falls back to
  // the plain-text `description` above.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  descriptionBlocks: any[] | null;
  price: number;
  category: string;
  images: string[];
  stock: number;
  isFeatured: boolean;
  isActive: boolean;
}

export interface Category {
  name: string;
  slug: string;
}

export const categories: Category[] = [
  { name: "All", slug: "all" },
  { name: "Crystals", slug: "crystals" },
  { name: "Crystal Jewellery", slug: "crystal-jewellery" },
  { name: "Emotional Support Jewellery", slug: "esj" },
  { name: "Digital Downloads", slug: "digital" },
  { name: "Gifts", slug: "gifts" },
];

export const products: Product[] = [
  // Placeholder products — will be replaced by CMS content
];

// ═══ EVENTS ═══
export interface Event {
  title: string;
  date: string;
  time: string;
  description: string;
  eventType: string;
}

export const events: Event[] = [
  // Placeholder events — will be replaced by CMS content
];
