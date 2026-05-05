import type { Metadata } from 'next';
import { getSiteSettings, getNavigation, getFooterLinks } from '@/lib/cms';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Lightbox from '@/components/Lightbox';
import CookieBanner from '@/components/CookieBanner';
import BackToTop from '@/components/BackToTop';
import ScrollReveal from '@/components/ScrollReveal';
import Toast from '@/components/Toast';
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
    alternates: {
      canonical: '/',
    },
    openGraph: {
      siteName: settings.siteName,
      locale: 'en_GB',
      type: 'website',
      title: `${settings.siteName} — Beautifully Whole`,
      description: settings.seoDescription,
      url: '/',
      images: [{ url: settings.ogDefaultImage || '/og-default.jpg', width: 1200, height: 630 }],
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
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://annalouwellness.com'}/og-default.jpg`,
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
  const [siteSettings, navigation, footerLinks] = await Promise.all([
    getSiteSettings(),
    getNavigation(),
    getFooterLinks(),
  ]);

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="canonical" href={process.env.NEXT_PUBLIC_SITE_URL || 'https://annalouwellness.com'} />
        <OrganizationSchema settings={siteSettings} />
      </head>
      <body>
        <Nav navigation={navigation} siteSettings={siteSettings} />
        <main>{children}</main>
        <Footer siteSettings={siteSettings} footerLinks={footerLinks} />
        <Lightbox />
        <CookieBanner bannerText={siteSettings.cookieBannerText} />
        <BackToTop />
        <ScrollReveal />
        <Toast />
      </body>
    </html>
  );
}
