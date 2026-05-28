import type { Metadata } from 'next';
import { getSiteSettings, getNavigation, getFooterLinks, getTopStripText, getFooter } from '@/lib/cms';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Lightbox from '@/components/Lightbox';
import CookieBanner from '@/components/CookieBanner';
import BackToTop from '@/components/BackToTop';
import ScrollReveal from '@/components/ScrollReveal';
import Toast from '@/components/Toast';
import FloatingAskAnna from '@/components/FloatingAskAnna';
import { WebSiteSchema, PersonSchema, LocalBusinessSchema } from '@/components/StructuredData';
import Analytics from '@/components/Analytics';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: {
      default: `${settings.siteName} — Beautifully Whole`,
      template: `%s — ${settings.siteName}`,
    },
    description: settings.seoDescription,
    keywords: settings.seoKeywords,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://annalouwellness.com'),
    alternates: {},
    openGraph: {
      siteName: settings.siteName,
      locale: 'en_GB',
      type: 'website',
      title: `${settings.siteName} — Beautifully Whole`,
      description: settings.seoDescription,
      url: '/',
      images: [{ url: settings.ogDefaultImage || '/og-default.svg', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${settings.siteName} — Beautifully Whole`,
      description: settings.seoDescription,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large' as const,
        'max-snippet': -1,
      },
    },
    icons: {
      icon: '/favicon.svg',
      apple: '/apple-touch-icon.png',
    },
    other: {
      'theme-color': '#231F20',
      // Search-engine verification meta tags — Anna fills these in CMS once
      // she's claimed each property. Empty values are rendered as empty
      // strings and ignored by the engines, which is fine.
      ...(settings.googleSiteVerification ? { 'google-site-verification': settings.googleSiteVerification } : {}),
      ...(settings.bingSiteVerification ? { 'msvalidate.01': settings.bingSiteVerification } : {}),
      ...(settings.pinterestSiteVerification ? { 'p:domain_verify': settings.pinterestSiteVerification } : {}),
    },
  };
}

// Organization schema for SEO
function OrganizationSchema({ settings }: { settings: any }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings.siteName,
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://annalouwellness.com',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://annalouwellness.com'}/og-default.svg`,
    description: settings.seoDescription,
    founder: {
      '@type': 'Person',
      name: 'Anna Lou Scaife',
    },
    foundingDate: '2004',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'London',
      addressCountry: 'GB',
    },
    sameAs: [
      settings.instagramUrl,
      settings.facebookUrl,
      settings.youtubeUrl,
      settings.substackUrl,
    ].filter(Boolean),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [siteSettings, navigation, footerLinks, topStripText, footer] = await Promise.all([
    getSiteSettings(),
    getNavigation(),
    getFooterLinks(),
    getTopStripText(),
    getFooter(),
  ]);
  void footerLinks; // kept for backwards-compat with other consumers; Footer now uses `footer`

  return (
    <html lang="en">
      <head>
        {/* Font loading — order matters for performance.
            1. preconnect to Google's static + CSS hosts (parallel DNS + TLS warmup)
            2. preload the CSS itself with high priority so the parser sees it ASAP
            3. fallback <link rel="stylesheet"> for browsers ignoring preload
            Previously this was an @import inside globals.css, which blocked the
            stylesheet parser until the @import URL resolved — fonts arrived AFTER
            first paint and caused the menu to reflow when they swapped in. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Mulish:wght@300;400;600&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Mulish:wght@300;400;600&display=swap"
        />
        <link rel="manifest" href="/manifest.json" />
        {/* Feed + AI-discovery autodiscovery — RSS readers and AI agents
            (Perplexity, ChatGPT browsing, Claude, Gemini) check these links
            on the root page to find machine-readable views of the site.
            llms.txt: curated map of important pages, refreshed every 10 min.
            feed.xml: RSS of all editorial articles.
            products.xml: Google Merchant Centre catalogue feed. */}
        <link rel="alternate" type="application/rss+xml" title="Anna Lou Wellness — articles" href="/feed.xml" />
        <link rel="alternate" type="application/xml" title="Anna Lou Wellness — product feed" href="/products.xml" />
        <link rel="alternate" type="text/plain" title="AI discovery map" href="/llms.txt" />
        {/* Canonical URLs are set per-page via generateMetadata */}
        <OrganizationSchema settings={siteSettings} />
        <WebSiteSchema />
        <PersonSchema />
        <LocalBusinessSchema />
      </head>
      <body>
        <Analytics gaId={siteSettings.googleAnalyticsId} fbPixelId={siteSettings.facebookPixelId} />
        <Nav navigation={navigation} siteSettings={siteSettings} topStripText={topStripText} />
        <main>{children}</main>
        <Footer siteSettings={siteSettings} footer={footer} />
        <Lightbox />
        <CookieBanner bannerText={siteSettings.cookieBannerText} />
        <BackToTop />
        <ScrollReveal />
        <Toast />
        <FloatingAskAnna />
      </body>
    </html>
  );
}
