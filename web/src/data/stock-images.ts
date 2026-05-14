/**
 * Curated Unsplash stock images for Anna Lou Wellness.
 *
 * Aesthetic: editorial, warm, natural light, soft, women's wellness, cream tones,
 * Hampton-on-Thames / Taggs Island vibe, slow rituals, "beautifully whole."
 *
 * All photos: images.unsplash.com (free for commercial use).
 * URL format: https://images.unsplash.com/{ID}?w={W}&h={H}&fit=crop&crop=faces,entropy&q=80&auto=format
 *
 * Three sizing presets via getStockImage(category, seed, size):
 *   - 'hero'    16:9 landscape (1600×900) for big banner blocks
 *   - 'card'    16:10 landscape (800×500) for article cards / grids
 *   - 'portrait' 4:5 (900×1125) for tall hero / fallback article images
 */

type Size = 'hero' | 'card' | 'portrait';

const SIZE_PRESETS: Record<Size, { w: number; h: number }> = {
  hero: { w: 1600, h: 900 },
  card: { w: 800, h: 500 },
  portrait: { w: 900, h: 1125 },
};

const url = (id: string, size: Size = 'card') => {
  const { w, h } = SIZE_PRESETS[size];
  return `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&crop=faces,entropy&q=80&auto=format`;
};

// Curated Unsplash photo IDs. To swap an image, replace the ID.
// Find replacements at unsplash.com → copy the photo-XXXXX-YYYYY portion of the URL.
const IDS = {
  // Reset Stories — contemplative women, water, golden hour, return-to-self
  'reset-stories': [
    'photo-1499209974431-9dddcece7f88', // woman gazing at lake
    'photo-1518621736915-f3b1c41bfd00', // golden hour silhouette
    'photo-1499014995410-c97e3b40caa1', // woman wrapped in soft light
    'photo-1502323777036-f29e3972d82f', // hands on warm cup
    'photo-1516589091380-5d8e87df6999', // soft window light portrait
    'photo-1517248135467-4c7edcad34c4', // boat reflection
    'photo-1490750967868-88aa4486c946', // tea by window
  ],

  // Life — home rituals, breakfast, books, slow morning
  life: [
    'photo-1495577644756-7e5ac4e2a8e2', // morning ritual
    'photo-1502230831726-fe5549140034', // breakfast spread
    'photo-1481349518771-20055b2a7b24', // open book + coffee
    'photo-1505691938895-1758d7feb511', // candle + linen
    'photo-1556909114-f6e7ad7d3136', // cosy interior
    'photo-1495546968767-f0573cca821e', // bedroom soft light
    'photo-1509281373149-e957c6296406', // home interior
  ],

  // Love & Relationships — touch, soft connection, intimacy
  'love-and-relationships': [
    'photo-1516589178581-6cd7833ae3b2', // candle light
    'photo-1518156677180-95a2893f3e9f', // hand touching surface
    'photo-1469571486292-0ba58a3f068b', // intertwined hands
    'photo-1487701400454-8a8a8b1b8baf', // soft floral
    'photo-1518621736915-f3b1c41bfd00', // golden silhouette
    'photo-1518621845630-1a8a4ed7b3c4', // tender portrait
    'photo-1485290334039-a3c69043e517', // affection scene
  ],

  // Work & Money — desk, founder, notebook, considered workspace
  'work-and-money': [
    'photo-1486312338219-ce68d2c6f44d', // laptop + coffee
    'photo-1531403009284-440f080d1e12', // notebook on desk
    'photo-1499951360447-b19be8fe80f5', // planner + pen
    'photo-1542435503-956c469947f6', // calendar coffee
    'photo-1454165804606-c3d57bc86b40', // creative workspace
    'photo-1517245386807-bb43f82c33c4', // founder thinking
    'photo-1517502884422-41eaead166d4', // journal writing
  ],

  // Houseboat / water / Taggs Island — calm water, narrow boats
  houseboat: [
    'photo-1517248135467-4c7edcad34c4', // boat reflection
    'photo-1503551723145-6c040742065b', // canal boat
    'photo-1502082553048-f009c37129b9', // misty water
    'photo-1444065381814-865dc9da92c0', // golden water
    'photo-1485727749690-d091e8284ef3', // moored boats
  ],

  // Crystals / healing objects
  crystals: [
    'photo-1518173946687-a4c8892bbd9f', // crystals arranged
    'photo-1551478968-9d22c8b35464', // crystal grid
    'photo-1583244532610-2a234ef74f10', // rose quartz
    'photo-1620207418302-439b387441b0', // healing stones
    'photo-1601225998165-013aaca8b27b', // amethyst cluster
  ],

  // Programme heroes — somatic body, breath, presence
  programmes: [
    'photo-1506126613408-eca07ce68773', // meditation hands
    'photo-1544367567-0f2fcb009e0b', // yoga calm
    'photo-1545205597-3d9d02c29597', // somatic
    'photo-1518611012118-696072aa579a', // back of woman, golden
    'photo-1532798442725-41036acc7489', // breathwork
    'photo-1518310383802-640c2de311b2', // stretching warm light
  ],

  // Reset Room — community, podcast, intimate group
  'reset-room': [
    'photo-1490578474895-699cd4e2cf59', // podcast headphones
    'photo-1492684223066-81342ee5ff30', // group circle
    'photo-1518611012118-696072aa579a', // golden hour woman
    'photo-1505236858219-8359eb29e329', // candles + warmth
    'photo-1545205597-3d9d02c29597', // somatic
  ],

  // Decoder / lead magnet — book, quiet morning
  decoder: [
    'photo-1481349518771-20055b2a7b24', // open book + coffee
    'photo-1499951360447-b19be8fe80f5', // notebook + journal
    'photo-1531346878377-a5be20888e57', // sunlit pages
    'photo-1517502884422-41eaead166d4', // journal writing
  ],

  // About / Anna portraits placeholder
  about: [
    'photo-1518611012118-696072aa579a', // golden hour woman
    'photo-1485206412256-701ccc5b93ca', // soft portrait
    'photo-1508214751196-bcfd4ca60f91', // designer hands
    'photo-1499209974431-9dddcece7f88', // by water
  ],

  // Community / circle / events
  community: [
    'photo-1492684223066-81342ee5ff30', // circle group
    'photo-1530538095376-a4936b35b5f0', // candles ritual
    'photo-1505236858219-8359eb29e329', // group warmth
    'photo-1543269865-cbf427effbad', // gathered hands
  ],

  // Experiences / retreats — outdoor, water, nature
  experiences: [
    'photo-1517248135467-4c7edcad34c4', // boat
    'photo-1506905925346-21bda4d32df4', // mountain landscape
    'photo-1469474968028-56623f02e42e', // forest light
    'photo-1551632811-561732d1e306', // water reflection
    'photo-1500964757637-c85e8a162699', // misty lake
  ],

  // Shop / product
  product: [
    'photo-1573408301185-9146fe634ad0', // jewellery flatlay
    'photo-1599643478518-a784e5dc4c8f', // necklace pendant
    'photo-1535632787350-4e68ef0ac584', // crystal jewellery
    'photo-1535632066274-f5e4d23b4670', // gold jewellery
  ],

  // Cosmic forecast / astrology
  cosmic: [
    'photo-1419242902214-272b3f66ee7a', // night sky
    'photo-1502134249126-9f3755a50d78', // celestial
    'photo-1532798442725-41036acc7489', // moon
  ],

  // Hero / banner — signature golden hour calm
  hero: [
    'photo-1518611012118-696072aa579a', // signature golden hour
    'photo-1499209974431-9dddcece7f88', // woman by water
    'photo-1444065381814-865dc9da92c0', // golden water
    'photo-1518621736915-f3b1c41bfd00', // silhouette
  ],
};

// Build sized URLs from IDs.
function buildPool(ids: string[], size: Size): string[] {
  return ids.map((id) => url(id, size));
}

// Default exported STOCK pool uses 'card' size for backward compat.
export const STOCK: Record<string, string[]> = Object.fromEntries(
  Object.entries(IDS).map(([k, v]) => [k, buildPool(v, 'card')]),
);

export type StockCategory = keyof typeof IDS;

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * Pick a deterministic stock image.
 * @param category  one of the curated categories
 * @param seed      e.g. article slug; same seed → same image
 * @param size      'hero' (16:9 1600w) | 'card' (16:10 800w) | 'portrait' (4:5 900w)
 */
export function getStockImage(
  category: StockCategory,
  seed?: string,
  size: Size = 'card',
): string {
  const ids = IDS[category] || IDS.hero;
  const idx = seed ? hashString(seed) % ids.length : 0;
  return url(ids[idx], size);
}

/**
 * Map article-category section slug → stock category key.
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
