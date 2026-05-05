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
  colour?: string;
  children?: NavItem[];
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
  {
    label: "Reset Stories", href: "/reset-stories", colour: "#6E3A5A",
    children: [
      { label: "All Stories", href: "/reset-stories" },
      { label: "You're Holding Everything", href: "/reset-stories/youre-holding-everything" },
      { label: "The Strong One", href: "/reset-stories/the-strong-one" },
      { label: "Signal vs Noise", href: "/reset-stories/signal-vs-noise" },
      { label: "Houseboat Life", href: "/reset-stories/houseboat-life" },
      { label: "Emotional Anchors", href: "/reset-stories/emotional-anchors" },
    ],
  },
  {
    label: "Life", href: "/life", colour: "#FAA21B",
    children: [
      { label: "Rituals and Energy", href: "/life/rituals-and-energy" },
      { label: "Home and Space", href: "/life/home-and-space" },
      { label: "Style and Beauty", href: "/life/style-and-beauty" },
      { label: "Food and Nourishment", href: "/life/food-and-nourishment" },
      { label: "Weekend Finds", href: "/life/weekend-finds" },
    ],
  },
  {
    label: "Love & Relationships", href: "/love-and-relationships", colour: "#F280AA",
    children: [
      { label: "Dating and Patterns", href: "/love-and-relationships/dating-and-patterns" },
      { label: "Breakups and Reset", href: "/love-and-relationships/breakups-and-reset" },
      { label: "Friendship", href: "/love-and-relationships/friendship" },
      { label: "Motherhood", href: "/love-and-relationships/motherhood" },
      { label: "Self Worth and Identity", href: "/love-and-relationships/self-worth-and-identity" },
    ],
  },
  {
    label: "Work & Money", href: "/work-and-money", colour: "#FFD07A",
    children: [
      { label: "Founder Reset", href: "/work-and-money/founder-reset" },
      { label: "Burnout and Nervous System", href: "/work-and-money/burnout-and-nervous-system" },
      { label: "Signal Method\u2122", href: "/work-and-money/signal-method" },
      { label: "Career and Direction", href: "/work-and-money/career-and-direction" },
      { label: "Money and Worth", href: "/work-and-money/money-and-worth" },
    ],
  },
  {
    label: "Experiences", href: "/experiences", colour: "#7BAFDD",
    children: [
      { label: "Retreats", href: "/experiences/retreats" },
      { label: "Workshops", href: "/experiences/workshops" },
      { label: "Corporate Wellbeing", href: "/experiences/corporate-wellbeing" },
      { label: "Speaking", href: "/experiences/speaking" },
    ],
  },
  {
    label: "The Work", href: "/the-work", colour: "#F280AA",
    children: [
      { label: "Ways to Work With Me", href: "/the-work/ways-to-work-with-me" },
      { label: "What Do You Need Right Now?", href: "/the-work/quiz" },
      { label: "Client Stories", href: "/the-work/client-stories" },
      { label: "1:1 Sessions", href: "/the-work/sessions" },
    ],
  },
  {
    label: "Shop", href: "/shop", colour: "#5DCAA5",
    children: [
      { label: "All Jewellery", href: "/shop" },
      { label: "Emotional Support Jewellery", href: "/shop/emotional-support-jewellery" },
      { label: "Personalised Pieces", href: "/shop/personalised" },
      { label: "New In", href: "/shop/new-in" },
    ],
  },
  {
    label: "Community", href: "/community", colour: "#231F20",
    children: [
      { label: "The Returning Circle", href: "/community/the-returning-circle" },
      { label: "Membership", href: "/community/membership" },
      { label: "Events Calendar", href: "/community/events" },
      { label: "Resource Library", href: "/community/resources" },
    ],
  },
  {
    label: "About", href: "/about", colour: "#231F20",
    children: [
      { label: "Anna's Story", href: "/about" },
      { label: "Press", href: "/about/press" },
      { label: "Work With Me", href: "/about/partnerships" },
      { label: "Contact", href: "/about/contact" },
    ],
  },
];

export const footerLinks: FooterLinks = {
  explore: [
    { label: "Reset Stories", href: "/reset-stories" },
    { label: "Life", href: "/life" },
    { label: "Love & Relationships", href: "/love-and-relationships" },
    { label: "Work & Money", href: "/work-and-money" },
    { label: "Experiences", href: "/experiences" },
  ],
  connect: [
    { label: "The Work", href: "/the-work" },
    { label: "Shop", href: "/shop" },
    { label: "Community", href: "/community" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/about/contact" },
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
