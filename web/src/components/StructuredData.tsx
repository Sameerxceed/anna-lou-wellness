/**
 * Structured Data (JSON-LD) components for SEO, AEO, and GEO
 * Covers: Organization, Person, WebSite, LocalBusiness, Article, Product, FAQPage, BreadcrumbList
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
}

export function ProductSchema({ name, description, slug, price, image, inStock = true }: ProductSchemaProps) {
  const schema = {
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
}

export function ServiceSchema({ name, description, url, price, provider }: ServiceSchemaProps) {
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
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
