'use strict';

/**
 * Image resize + auto-orient middleware.
 *
 * Runs on every multipart upload. For each image file:
 *  - Auto-orients via EXIF (fixes rotated iPhone photos)
 *  - Resizes large images to max 2400px width (preserving aspect ratio)
 *  - Re-encodes JPEGs at quality 82 + Progressive
 *  - Re-encodes PNGs with quality 85
 *  - Strips EXIF metadata
 *
 * Net effect: Anna can upload a 12MB iPhone photo → it lands as a ~600KB
 * properly-oriented file. Strapi then generates the responsive breakpoints
 * (xlarge / large / medium / small / thumbnail) on top.
 *
 * Must be registered AFTER `strapi::body` in config/middlewares.js so that
 * ctx.request.files is populated.
 */

const MAX_WIDTH = 2400;
const JPEG_QUALITY = 82;
const PNG_QUALITY = 85;

module.exports = (/* config, { strapi } */) => {
  return async (ctx, next) => {
    const files = ctx.request.files;
    if (files && files.files) {
      const sharp = require('sharp');
      const fs = require('fs/promises');
      const list = Array.isArray(files.files) ? files.files : [files.files];

      await Promise.all(
        list.map(async (file) => {
          if (!file || !file.mimetype || !file.mimetype.startsWith('image/')) return;
          if (file.mimetype === 'image/svg+xml' || file.mimetype === 'image/gif') return; // leave SVG/GIF alone

          try {
            const input = await fs.readFile(file.filepath || file.path);
            let pipeline = sharp(input).rotate(); // EXIF auto-orient (no args)

            const meta = await sharp(input).metadata();
            if (meta.width && meta.width > MAX_WIDTH) {
              pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
            }

            if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
              pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true });
            } else if (file.mimetype === 'image/png') {
              pipeline = pipeline.png({ quality: PNG_QUALITY, compressionLevel: 9 });
            } else if (file.mimetype === 'image/webp') {
              pipeline = pipeline.webp({ quality: JPEG_QUALITY });
            }

            const output = await pipeline.withMetadata({ orientation: 1 }).toBuffer();
            await fs.writeFile(file.filepath || file.path, output);

            // Update reported size so Strapi stores the right number
            file.size = output.length;
          } catch (err) {
            strapi.log.warn(`[image-resize] Skipped ${file.originalFilename || file.name}: ${err.message}`);
          }
        }),
      );
    }
    await next();
  };
};
