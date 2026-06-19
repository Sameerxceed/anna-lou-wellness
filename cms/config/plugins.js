module.exports = ({ env }) => ({
  upload: {
    config: {
      // 100MB ceiling — gives headroom for iPhone Pro RAW (40-70MB), short MP4
      // workshop clips, and high-res Photoshop exports. The image-resize
      // middleware (src/middlewares/image-resize.js) compresses everything
      // post-upload to 2400px wide @ q82, so storage cost stays low even with
      // big inputs. Anna doesn't need to compress before upload — server does it.
      sizeLimit: 100 * 1024 * 1024,
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
