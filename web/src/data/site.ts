export interface SiteSettings {
  siteName: string;
  siteTagline: string;
  logo: string | null;
  logoDark: string | null;
  favicon: string;
  ogDefaultImage: string;
  seoDescription: string;
  seoKeywords: string;
  instagramUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  substackUrl: string;
  tiktokUrl: string;
  email: string;
  phone: string;
  address: string;
  mapLatitude: number;
  mapLongitude: number;
  stripePublishableKey: string;
  notificationEmail: string;
  shopEmail: string;
  googleAnalyticsId: string;
  cookieBannerText: string;
  footerCopyright: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface FooterLinks {
  explore: NavItem[];
  connect: NavItem[];
}

export const siteSettings: SiteSettings = {
  siteName: "Anna Lou Wellness",
  siteTagline: "Beautifully Whole",
  logo: null as string | null,
  logoDark: null as string | null,
  favicon: "/favicon.svg",
  ogDefaultImage: "/og-default.jpg",
  seoDescription: "Coaching, healing, and transformation for women ready to step into a more aligned, elevated version of themselves. Beautifully Whole.",
  seoKeywords: "wellness coaching, somatic healing, trauma release, TRE, coaching for women, Anna Lou Wellness, emotional support jewellery, reset stories",
  instagramUrl: "https://instagram.com/annalouwellness",
  facebookUrl: "",
  youtubeUrl: "",
  substackUrl: "",
  tiktokUrl: "",
  email: "hello@annalouwellness.com",
  phone: "",
  address: "London, UK",
  mapLatitude: 51.4500,
  mapLongitude: -0.3300,
  stripePublishableKey: "",
  notificationEmail: "hello@annalouwellness.com",
  shopEmail: "hello@annalouwellness.com",
  googleAnalyticsId: "",
  cookieBannerText: "We use cookies to improve your experience. By continuing to visit this site, you agree to our use of cookies.",
  footerCopyright: "Anna Lou Wellness. All rights reserved.",
  maintenanceMode: false,
  maintenanceMessage: "We're making some improvements. Please check back shortly.",
};

export const navigation: NavItem[] = [
  { label: "Blog", href: "/blog" },
  { label: "Lifestyle", href: "/lifestyle" },
  { label: "Workshops", href: "/workshops" },
  { label: "Coaching", href: "/coaching" },
  { label: "Shop", href: "/shop" },
  { label: "Media", href: "/media" },
  { label: "Community", href: "/community" },
  { label: "About", href: "/about" },
];

export const footerLinks: FooterLinks = {
  explore: [
    { label: "Blog", href: "/blog" },
    { label: "Coaching", href: "/coaching" },
    { label: "Shop", href: "/shop" },
    { label: "Workshops", href: "/workshops" },
  ],
  connect: [
    { label: "Community", href: "/community" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/about/contact" },
    { label: "Media", href: "/media" },
  ],
};

export const siteConfig = {
  name: siteSettings.siteName,
  tagline: siteSettings.siteTagline,
  email: siteSettings.email,
  phone: siteSettings.phone,
  address: siteSettings.address,
  instagram: siteSettings.instagramUrl,
  mapLatitude: siteSettings.mapLatitude,
  mapLongitude: siteSettings.mapLongitude,
};
