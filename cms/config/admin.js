module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'change-me-admin-jwt-secret'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'change-me-api-token-salt'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', 'change-me-transfer-salt'),
    },
  },
  // Live preview: shows the front-end iframe inside the edit screen
  // so Anna sees the actual rendered page beside the fields she's editing.
  // Wired to Next.js /api/preview route which enables draft mode then redirects
  // to the correct URL based on content type + slug.
  preview: {
    enabled: true,
    config: {
      allowedOrigins: env('CLIENT_URL', 'https://staging.annalouwellness.com'),
      async handler(uid, { documentId, locale, status }) {
        const previewSecret = env('PREVIEW_SECRET', 'change-me-preview-secret');
        const clientUrl = env('CLIENT_URL', 'https://staging.annalouwellness.com');
        // Get the document so we can read its slug/title for the redirect target
        const doc = await strapi.documents(uid).findOne({ documentId, status });
        const slug = doc?.slug || '';
        const params = new URLSearchParams({
          secret: previewSecret,
          uid,
          documentId,
          status: status || 'draft',
        });
        if (slug) params.set('slug', slug);
        return `${clientUrl}/api/preview?${params.toString()}`;
      },
    },
  },
});
