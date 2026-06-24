module.exports = ({ env }) => [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', 'res.cloudinary.com'],
          'media-src': ["'self'", 'data:', 'blob:', 'res.cloudinary.com'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      headers: '*',
      origin: [
        'http://localhost:3000',         // Next.js dev
        'http://localhost:1337',         // Strapi admin
        'https://annalouwellness.com',   // Production
        'https://www.annalouwellness.com',
        env('FRONTEND_URL', 'http://localhost:3000'),
      ],
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  {
    name: 'strapi::body',
    config: {
      // Lift the multipart cap so bulk uploads of iPhone photos don't fail
      // before reaching the image-resize middleware. 250mb covers ~10
      // HEIC photos at once. Matches the per-file 50mb cap in
      // plugins.js -> upload.sizeLimit.
      formLimit: '256mb',
      jsonLimit: '256mb',
      textLimit: '256mb',
      formidable: {
        maxFileSize: 250 * 1024 * 1024,
      },
    },
  },
  'global::image-resize',
  'strapi::session',
  // 'strapi::favicon' MUST stay — Strapi v5's middleware validator marks
  // it as required and refuses to boot without it. Removing this crashed
  // the container at 04:46 UTC on 24 Jun ("Missing required middlewares
  // in configuration"). The ENOENT 500 spam from a missing /app/favicon.png
  // is harmless noise and preferable to a dead CMS.
  'strapi::favicon',
  'strapi::public',
];
