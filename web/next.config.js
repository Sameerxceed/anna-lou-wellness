/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.railway.app' },
      { protocol: 'http', hostname: 'localhost', port: '1337' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cms.annalouwellness.com' },
      { protocol: 'http', hostname: '*.sslip.io' },
    ],
  },
  async redirects() {
    return [
      // Anna's 11 Jun feedback (item 5b): the old programme-matcher quiz at
      // /the-work/quiz ended its "you need community" result with "Step
      // into the Reset Room" — too aggressive for a first-time visitor.
      // The Nervous System Decoder is the warmer entry point. Permanent
      // 301 so SEO inbound links land on the new flow.
      {
        source: '/the-work/quiz',
        destination: '/free/nervous-system-decoder',
        permanent: true,
      },
      // 7 Jul site audit: /press and /anna-story were 404'ing (sitemap
      // referenced them, but the actual pages live under /about/).
      // 301 so any inbound links / SEO / cached shares still land.
      {
        source: '/press',
        destination: '/about/press',
        permanent: true,
      },
      {
        source: '/anna-story',
        destination: '/about/anna-story',
        permanent: true,
      },
      // 26 Oct 2026: the "money fear" post was published with a
      // placeholder slug of `article`. Anna is renaming it to
      // `money-fear` in CMS. This 301 keeps the original URL alive so
      // Google-indexed links and any shares still land on the post.
      {
        source: '/love-and-relationships/article',
        destination: '/love-and-relationships/money-fear',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
