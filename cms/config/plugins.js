module.exports = ({ env }) => ({
  upload: {
    config: {
      // 50MB ceiling — iPhone HEIC photos run 20-30MB; large workshop hero
      // shots and short MP4s sometimes hit 40MB. Anything bigger is almost
      // certainly an accident and should be flagged before upload.
      sizeLimit: 50 * 1024 * 1024,
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
