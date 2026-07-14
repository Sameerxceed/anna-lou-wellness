/**
 * Structured Data (JSON-LD) components for SEO, AEO, and GEO
 *
 * Covers:
 *   WebSite, Person, LocalBusiness (HealthAndBeautyBusiness) — rendered on every page via layout.tsx
 *   Article — editorial pages
 *   Product — shop items
 *   Service — programmes, generic services
 *   FAQPage — any page with FAQs
 *   BreadcrumbList — every page with breadcrumbs
 *   Event — dated retreats + workshops (unlocks Google Events + AI "when's the next X" answers)
 *   Course — REGULATED + Reset Room membership (unlocks Google course carousel)
 *   VideoObject — public embedded videos with contentUrl/uploadDate
 *   Speakable — marks text sections that voice assistants should read aloud
 *
 * Reviews + AggregateRating fold into Product/Service/Event via buildReviewSchema.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://annalouwellness.com';

// ═══ WebSite schema with SearchAction (enables sitelinks search box in Google) ═══
export function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Anna Lou Wellness',
    alternateName: 'ALW',
    url: SITE_URL,
    description: 'Coaching, healing, and transformation for women ready to step into a more aligned version of themselves.',
    publisher: { '@type': 'Organization', name: 'Anna Lou Wellness' },
    inLanguage: 'en-GB',
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

// ═══ Person schema for Anna Lou Scaife (AEO — entity recognition) ═══
export function PersonSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Anna Lou Scaife',
    alternateName: 'Anna Lou',
    url: `${SITE_URL}/about`,
    image: `${SITE_URL}/og-default.svg`,
    jobTitle: 'Wellness Coach & Therapist',
    description: 'Coach, trainer, podcaster, author, entrepreneur, and jewellery designer with 25 years of experience in wellness, personal development, and emotional healing.',
    worksFor: { '@type': 'Organization', name: 'Anna Lou Wellness', url: SITE_URL },
    knowsAbout: [
      'Wellness coaching', 'Personal development', 'Emotional healing',
      'Crystal healing', 'Meditation', 'Retreats', 'Corporate wellbeing',
      'Narcissistic abuse recovery', 'Nervous system regulation',
      'Jewellery design', 'Mantra practice',
    ],
    sameAs: [
      'https://www.instagram.com/annalouwellness',
      'https://www.facebook.com/annalouwellness',
      'https://www.youtube.com/@annalouwellness',
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'London',
      addressCountry: 'GB',
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

// ═══ LocalBusiness schema (GEO — location-aware AI and local search) ═══
export function LocalBusinessSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HealthAndBeautyBusiness',
    name: 'Anna Lou Wellness',
    url: SITE_URL,
    logo: `${SITE_URL}/og-default.svg`,
    image: `${SITE_URL}/og-default.svg`,
    description: 'London-based wellness coaching, crystal healing, retreats, and handmade jewellery. Founded by Anna Lou Scaife.',
    founder: { '@type': 'Person', name: 'Anna Lou Scaife' },
    foundingDate: '2004',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'London',
      addressRegion: 'Greater London',
      addressCountry: 'GB',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 51.5074,
      longitude: -0.1278,
    },
    areaServed: [
      { '@type': 'City', name: 'London' },
      { '@type': 'Country', name: 'United Kingdom' },
      { '@type': 'Place', name: 'Worldwide (online coaching)' },
    ],
    priceRange: '££',
    email: 'hello@annalouwellness.com',
    sameAs: [
      'https://www.instagram.com/annalouwellness',
      'https://www.facebook.com/annalouwellness',
      'https://www.youtube.com/@annalouwellness',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Wellness Services',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: '1:1 Coaching Sessions', description: 'Personalised wellness coaching and therapy sessions' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Retreats & Workshops', description: 'Immersive healing retreats and group workshops' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Corporate Wellbeing', description: 'Workplace wellness programmes and speaking engagements' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'The Reset Room', description: 'Monthly digital wellness membership community' } },
      ],
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

// ═══ Article schema (for blog/editorial pages) ═══
interface ArticleSchemaProps {
  title: string;
  description: string;
  slug: string;
  section: string;
  author?: string;
  publishedAt?: string;
  heroImage?: string;
}

export function ArticleSchema({ title, description, slug, section, author, publishedAt, heroImage }: ArticleSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url: `${SITE_URL}/${section}/${slug}`,
    image: heroImage || `${SITE_URL}/og-default.svg`,
    author: {
      '@type': 'Person',
      name: author || 'Anna Lou Scaife',
      url: `${SITE_URL}/about`,
      image: `${SITE_URL}/og-default.svg`,
      jobTitle: 'Wellness Coach & Therapist',
      sameAs: [
        'https://www.instagram.com/annalouwellness',
        'https://www.facebook.com/annalouwellness',
        'https://www.youtube.com/@annalouwellness',
      ],
    },
    publisher: {
      '@type': 'Organization',
      name: 'Anna Lou Wellness',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/og-default.svg` },
    },
    datePublished: publishedAt || new Date().toISOString(),
    dateModified: publishedAt || new Date().toISOString(),
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/${section}/${slug}` },
    inLanguage: 'en-GB',
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

// ═══ Product schema (for shop pages) ═══
interface ProductSchemaProps {
  name: string;
  description: string;
  slug: string;
  price: number;
  image?: string;
  inStock?: boolean;
  reviews?: ReviewInput[];
}

export function ProductSchema({ name, description, slug, price, image, inStock = true, reviews }: ProductSchemaProps) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    url: `${SITE_URL}/shop/${slug}`,
    image: image || `${SITE_URL}/og-default.svg`,
    brand: { '@type': 'Brand', name: 'Anna Lou Wellness' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'GBP',
      price: price.toFixed(2),
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'Anna Lou Wellness' },
      url: `${SITE_URL}/shop/${slug}`,
    },
  };
  const reviewBits = buildReviewSchema(reviews);
  if (reviewBits) Object.assign(schema, reviewBits);
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

// ═══ FAQ schema (AEO — AI answer extraction) ═══
interface FAQSchemaProps {
  faqs: { question: string; answer: string }[];
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
  if (!faqs.length) return null;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

// ═══ Breadcrumb schema ═══
interface BreadcrumbItem {
  name: string;
  href: string;
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.href}`,
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

// ═══ Service schema (for coaching/experiences pages) ═══
interface ServiceSchemaProps {
  name: string;
  description: string;
  url: string;
  price?: string;
  provider?: string;
  reviews?: ReviewInput[];
}

export function ServiceSchema({ name, description, url, price, provider, reviews }: ServiceSchemaProps) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    url: `${SITE_URL}${url}`,
    provider: {
      '@type': 'Person',
      name: provider || 'Anna Lou Scaife',
      url: `${SITE_URL}/about`,
    },
    areaServed: { '@type': 'Country', name: 'United Kingdom' },
    serviceType: 'Wellness Coaching',
  };
  if (price) {
    schema.offers = {
      '@type': 'Offer',
      priceCurrency: 'GBP',
      price,
    };
  }
  const reviewBits = buildReviewSchema(reviews);
  if (reviewBits) Object.assign(schema, reviewBits);
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

// ═══ Reviews — shared helper used by Product/Service schema ═══
export interface ReviewInput {
  reviewerName: string;
  quote: string;
  rating: number | null;
  date?: string;
}

function buildReviewSchema(reviews?: ReviewInput[]) {
  if (!reviews || reviews.length === 0) return null;
  const rated = reviews.filter((r) => typeof r.rating === 'number' && r.quote);
  const out: any = {};
  if (rated.length > 0) {
    const avg = rated.reduce((sum, r) => sum + (r.rating as number), 0) / rated.length;
    out.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: avg.toFixed(1),
      reviewCount: rated.length,
      bestRating: '5',
      worstRating: '1',
    };
  }
  const reviewItems = reviews
    .filter((r) => r.quote)
    .slice(0, 20)
    .map((r) => {
      const reviewObj: any = {
        '@type': 'Review',
        author: { '@type': 'Person', name: r.reviewerName },
        reviewBody: r.quote,
      };
      if (r.rating) {
        reviewObj.reviewRating = {
          '@type': 'Rating',
          ratingValue: String(r.rating),
          bestRating: '5',
          worstRating: '1',
        };
      }
      if (r.date) reviewObj.datePublished = r.date;
      return reviewObj;
    });
  if (reviewItems.length > 0) out.review = reviewItems;
  return Object.keys(out).length > 0 ? out : null;
}

// ═══ Event schema (for dated retreats + workshops) ═══
// Unlocks Google Events + lets AI answer "when's the next Anna retreat?".
// Omit `startDate` and this returns null — evergreen items belong on ServiceSchema, not here.
interface EventSchemaProps {
  name: string;
  description: string;
  url: string;
  startDate?: string;      // ISO 8601 — required for a valid Event
  endDate?: string;
  location?: string;       // free-text venue label
  price?: number;
  image?: string;
  reviews?: ReviewInput[];
  eventStatus?: 'scheduled' | 'cancelled' | 'postponed' | 'rescheduled';
  eventAttendanceMode?: 'offline' | 'online' | 'mixed';
}

export function EventSchema({
  name,
  description,
  url,
  startDate,
  endDate,
  location,
  price,
  image,
  reviews,
  eventStatus = 'scheduled',
  eventAttendanceMode = 'offline',
}: EventSchemaProps) {
  if (!startDate) return null;

  const attendanceModeMap = {
    offline: 'https://schema.org/OfflineEventAttendanceMode',
    online: 'https://schema.org/OnlineEventAttendanceMode',
    mixed: 'https://schema.org/MixedEventAttendanceMode',
  };
  const statusMap = {
    scheduled: 'https://schema.org/EventScheduled',
    cancelled: 'https://schema.org/EventCancelled',
    postponed: 'https://schema.org/EventPostponed',
    rescheduled: 'https://schema.org/EventRescheduled',
  };

  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name,
    description,
    url: `${SITE_URL}${url}`,
    image: image || `${SITE_URL}/og-default.svg`,
    startDate,
    ...(endDate ? { endDate } : {}),
    eventStatus: statusMap[eventStatus],
    eventAttendanceMode: attendanceModeMap[eventAttendanceMode],
    organizer: {
      '@type': 'Person',
      name: 'Anna Lou Scaife',
      url: `${SITE_URL}/about`,
    },
    performer: {
      '@type': 'Person',
      name: 'Anna Lou Scaife',
    },
  };

  if (location) {
    // Location shape depends on whether it's an in-person or online event.
    if (eventAttendanceMode === 'online') {
      schema.location = {
        '@type': 'VirtualLocation',
        url: `${SITE_URL}${url}`,
      };
    } else {
      schema.location = {
        '@type': 'Place',
        name: location,
        address: {
          '@type': 'PostalAddress',
          addressLocality: location,
          addressCountry: 'GB',
        },
      };
    }
  }

  if (typeof price === 'number' && price > 0) {
    schema.offers = {
      '@type': 'Offer',
      priceCurrency: 'GBP',
      price: price.toFixed(2),
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}${url}`,
      validFrom: new Date().toISOString(),
    };
  }

  const reviewBits = buildReviewSchema(reviews);
  if (reviewBits) Object.assign(schema, reviewBits);
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

// ═══ Course schema (for REGULATED + Reset Room + other structured learning) ═══
// Unlocks Google's course carousel + helps AI engines identify these as trainable
// content vs generic services. Use for offerings with modules/lessons.
interface CourseSchemaProps {
  name: string;
  description: string;
  url: string;
  price?: number;
  isFree?: boolean;
  courseMode?: 'online' | 'onsite' | 'blended';
  duration?: string;         // ISO 8601 duration e.g. 'P6W' (6 weeks) — omit if unknown
  image?: string;
  reviews?: ReviewInput[];
}

export function CourseSchema({
  name,
  description,
  url,
  price,
  isFree = false,
  courseMode = 'online',
  duration,
  image,
  reviews,
}: CourseSchemaProps) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name,
    description,
    url: `${SITE_URL}${url}`,
    image: image || `${SITE_URL}/og-default.svg`,
    provider: {
      '@type': 'Organization',
      name: 'Anna Lou Wellness',
      url: SITE_URL,
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode,
      ...(duration ? { courseWorkload: duration } : {}),
    },
    inLanguage: 'en-GB',
  };

  // Google requires an Offer on Course (even if free) — signals accessibility.
  const offerPrice = isFree ? 0 : (typeof price === 'number' ? price : undefined);
  if (offerPrice !== undefined) {
    schema.offers = {
      '@type': 'Offer',
      priceCurrency: 'GBP',
      price: offerPrice.toFixed(2),
      category: isFree ? 'Free' : 'Paid',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}${url}`,
    };
  }

  const reviewBits = buildReviewSchema(reviews);
  if (reviewBits) Object.assign(schema, reviewBits);
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

// ═══ VideoObject schema (for publicly embedded videos) ═══
// Google Video results + AI engines can cite the video directly. Skip for
// paywalled content (Circle recordings, gated workshop replays) — use only
// where the video itself is publicly viewable.
interface VideoObjectSchemaProps {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;         // ISO 8601
  contentUrl?: string;        // direct video file URL (mp4 etc.)
  embedUrl?: string;          // iframe embed URL (YouTube/Vimeo/Bunny)
  duration?: string;          // ISO 8601 duration e.g. 'PT10M30S'
}

export function VideoObjectSchema({
  name,
  description,
  thumbnailUrl,
  uploadDate,
  contentUrl,
  embedUrl,
  duration,
}: VideoObjectSchemaProps) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name,
    description,
    thumbnailUrl,
    uploadDate,
    ...(contentUrl ? { contentUrl } : {}),
    ...(embedUrl ? { embedUrl } : {}),
    ...(duration ? { duration } : {}),
    publisher: {
      '@type': 'Organization',
      name: 'Anna Lou Wellness',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/og-default.svg` },
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

// ═══ Speakable schema (AEO — voice assistant hints) ═══
// Tells Alexa / Siri / Google Assistant which text on the page they should
// read aloud when answering a voice query. Wrap the target elements with
// `class="speakable"` (or use the CSS selectors passed in), then render this
// component on the page. Google explicitly supports CSS-selector based markers.
interface SpeakableSchemaProps {
  cssSelectors?: string[];    // default targets .speakable elements
  url?: string;               // page URL — defaults to the current page's canonical
  headline?: string;          // optional page headline for the WebPage node
}

export function SpeakableSchema({
  cssSelectors = ['.speakable'],
  url,
  headline,
}: SpeakableSchemaProps = {}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    ...(url ? { url: `${SITE_URL}${url}` } : {}),
    ...(headline ? { headline } : {}),
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: cssSelectors,
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
