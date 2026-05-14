/**
 * Curated Unsplash stock images for Anna Lou Wellness.
 *
 * All photos are hosted on images.unsplash.com (free for commercial use, attribution appreciated).
 * To swap an image: replace the photo ID in the URL with another Unsplash photo ID.
 * Format: https://images.unsplash.com/photo-{ID}?w=1200&q=80&auto=format&fit=crop
 *
 * Categories map to article sections, programme tone, and page contexts.
 * getStockImage(category, seed) returns a deterministic image based on a slug or string,
 * so the same article always shows the same image but cards across a feed look varied.
 */

const u = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop&crop=entropy`;

// Category -> array of Unsplash photo IDs
// Each ID is a known Unsplash photo (replace any to swap)
export const STOCK = {
  // Reset Stories — intimate, contemplative woman portraits, water, return-to-self
  'reset-stories': [
    u('photo-1499209974431-9dddcece7f88'), // woman by water
    u('photo-1518621845630-1a8a4ed7b3c4'), // contemplative silhouette
    u('photo-1487423152198-5b87c2f7a5b4'), // hands holding tea
    u('photo-1519682337058-a94d519337bc'), // sunlit window
    u('photo-1444065381814-865dc9da92c0'), // golden hour silhouette
    u('photo-1494438639946-1ebd1d20bf85'), // soft portrait
    u('photo-1517363898874-737b62a7db91'), // boat on water
  ],

  // Life — home, ritual, beauty, food, lifestyle
  life: [
    u('photo-1495577644756-7e5ac4e2a8e2'), // morning ritual
    u('photo-1542838132-92c53300491e'), // breakfast spread
    u('photo-1481349518771-20055b2a7b24'), // open book + coffee
    u('photo-1505691938895-1758d7feb511'), // candle + linen
    u('photo-1556909114-f6e7ad7d3136'), // cosy interior
    u('photo-1499933374294-4584851497cc'), // food styling
    u('photo-1509281373149-e957c6296406'), // home interior soft light
  ],

  // Love & Relationships — intimate hands, touch, soft, connection
  'love-and-relationships': [
    u('photo-1518621845630-1a8a4ed7b3c4'), // soft portrait
    u('photo-1516589178581-6cd7833ae3b2'), // candle light
    u('photo-1518156677180-95a2893f3e9f'), // hand touching surface
    u('photo-1469571486292-0ba58a3f068b'), // intertwined hands
    u('photo-1487701400454-8a8a8b1b8baf'), // soft floral
    u('photo-1490480940504-fe8c1b46a7ad'), // close detail
    u('photo-1492684223066-81342ee5ff30'), // group connection
  ],

  // Work & Money — desk, founder, planning, light professional
  'work-and-money': [
    u('photo-1486312338219-ce68d2c6f44d'), // laptop coffee
    u('photo-1531403009284-440f080d1e12'), // notebook desk
    u('photo-1516321497487-e288fb19713f'), // workspace
    u('photo-1499951360447-b19be8fe80f5'), // planner journal
    u('photo-1517245386807-bb43f82c33c4'), // founder thinking
    u('photo-1542435503-956c469947f6'), // calendar + coffee
    u('photo-1454165804606-c3d57bc86b40'), // creative workspace
  ],

  // Houseboat / water / Taggs Island — water, boats, calm
  houseboat: [
    u('photo-1517363898874-737b62a7db91'), // boat
    u('photo-1503551723145-6c040742065b'), // canal boat
    u('photo-1444065381814-865dc9da92c0'), // golden water
    u('photo-1499209974431-9dddcece7f88'), // woman by water
    u('photo-1502082553048-f009c37129b9'), // misty water
  ],

  // Crystal / healing — stones, crystals, ritual objects
  crystals: [
    u('photo-1518173946687-a4c8892bbd9f'), // crystals arranged
    u('photo-1559059699-085698eba48c'), // amethyst
    u('photo-1551478968-9d22c8b35464'), // crystal grid
    u('photo-1583244532610-2a234ef74f10'), // rose quartz
    u('photo-1620207418302-439b387441b0'), // healing stones
  ],

  // Programme heroes — somatic, body, breath, presence
  programmes: [
    u('photo-1545205597-3d9d02c29597'), // somatic body work
    u('photo-1506126613408-eca07ce68773'), // meditation hands
    u('photo-1544367567-0f2fcb009e0b'), // yoga calm
    u('photo-1532798442725-41036acc7489'), // breathwork
    u('photo-1518611012118-696072aa579a'), // back of woman, golden
  ],

  // Reset Room — community, podcast, intimate group, audio
  'reset-room': [
    u('photo-1490578474895-699cd4e2cf59'), // podcast headphones
    u('photo-1492684223066-81342ee5ff30'), // group circle
    u('photo-1545205597-3d9d02c29597'), // somatic
    u('photo-1518611012118-696072aa579a'), // golden hour woman
    u('photo-1506126613408-eca07ce68773'), // meditation
  ],

  // Decoder / lead magnet — book, guide, quiet morning
  decoder: [
    u('photo-1481349518771-20055b2a7b24'), // open book + coffee
    u('photo-1499951360447-b19be8fe80f5'), // notebook + journal
    u('photo-1531346878377-a5be20888e57'), // sunlit pages
  ],

  // About / portrait imagery
  about: [
    u('photo-1518611012118-696072aa579a'), // golden hour
    u('photo-1485206412256-701ccc5b93ca'), // portrait
    u('photo-1508214751196-bcfd4ca60f91'), // designer hands
  ],

  // Community / circle / events
  community: [
    u('photo-1492684223066-81342ee5ff30'), // circle group
    u('photo-1530538095376-a4936b35b5f0'), // candles ritual
    u('photo-1505236858219-8359eb29e329'), // group warmth
  ],

  // Experiences / retreats — outdoor, water, nature, gathering
  experiences: [
    u('photo-1517363898874-737b62a7db91'), // boat
    u('photo-1506905925346-21bda4d32df4'), // mountain landscape
    u('photo-1469474968028-56623f02e42e'), // forest light
    u('photo-1551632811-561732d1e306'), // water reflection
  ],

  // Shop / product fallback
  product: [
    u('photo-1573408301185-9146fe634ad0'), // jewellery flatlay
    u('photo-1599643478518-a784e5dc4c8f'), // necklace pendant
    u('photo-1535632787350-4e68ef0ac584'), // crystal jewellery
    u('photo-1535632066274-f5e4d23b4670'), // gold jewellery
  ],

  // Cosmic forecast / astrology
  cosmic: [
    u('photo-1419242902214-272b3f66ee7a'), // night sky
    u('photo-1532798442725-41036acc7489'), // moon crystals
    u('photo-1502134249126-9f3755a50d78'), // celestial
  ],

  // Hero / banner placeholder fallback
  hero: [
    u('photo-1518611012118-696072aa579a'), // golden hour woman (signature)
    u('photo-1499209974431-9dddcece7f88'), // woman by water
  ],
};

export type StockCategory = keyof typeof STOCK;

/**
 * Hash a string to a non-negative integer (deterministic).
 */
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Get a stock image for a category. If `seed` is provided (e.g. article slug),
 * the same seed always returns the same image. Otherwise picks a stable default (first).
 */
export function getStockImage(category: StockCategory, seed?: string): string {
  const pool = STOCK[category] || STOCK.hero;
  if (!seed) return pool[0];
  const idx = hashString(seed) % pool.length;
  return pool[idx];
}

/**
 * Map article-category section slug → stock category key.
 * Used by article cards / hero to pick visual tone.
 */
export function stockCategoryForSection(section: string): StockCategory {
  const map: Record<string, StockCategory> = {
    'reset-stories': 'reset-stories',
    life: 'life',
    'love-and-relationships': 'love-and-relationships',
    'work-and-money': 'work-and-money',
  };
  return map[section] || 'reset-stories';
}
