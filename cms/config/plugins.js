module.exports = ({ env }) => ({
  upload: {
    config: {
      // Local uploads stored on Railway Volume at /app/public/uploads
      sizeLimit: 25 * 1024 * 1024, // 25MB max (covers video uploads)
      breakpoints: {
        xlarge: 1920,
        large: 1200,
        medium: 750,
        small: 500,
        thumbnail: 245,
      },
    },
  },
});
