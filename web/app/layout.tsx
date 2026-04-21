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
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://annalouwellness.com'),
    openGraph: {
      siteName: settings.siteName,
      locale: 'en_GB',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
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
