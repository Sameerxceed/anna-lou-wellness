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
    ];
  },
};

module.exports = nextConfig;
