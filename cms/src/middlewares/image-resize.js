'use strict';

/**
 * Image upload pipeline (runs on every multipart upload).
 *
 * For each image file:
 *  - Slugifies the filename to lowercase-ascii-with-dashes (so 'IMG 5847.jpeg'
 *    becomes 'img-5847.jpeg' — easier for Anna to find in the media library).
 *  - Converts HEIC (iPhone default) to JPEG so Strapi + browsers can show it.
 *  - Auto-orients via EXIF (fixes rotated iPhone photos).
 *  - Resizes large images to max 2400px width.
 *  - Re-encodes JPEGs at quality 82 + progressive; PNGs at quality 85;
 *    WebPs at quality 82. Strips EXIF metadata.
 *
 * Processes files SEQUENTIALLY, not in parallel — Anna's small VPS (2GB RAM)
 * runs out of memory when sharp loads many iPhone photos at once. Sequential
 * is a few seconds slower per batch but doesn't crash. Fixes her 'bulk upload
 * loads then fails each time' complaint.
 *
 * Must be registered AFTER `strapi::body` in config/middlewares.js so that
 * ctx.request.files is populated.
 */

const path = require('path');

const MAX_WIDTH = 2400;
const JPEG_QUALITY = 82;
const PNG_QUALITY = 85;

function slugifyFilename(name) {
  // Split off extension so we don't slugify the dot.
  const ext = path.extname(name || '').toLowerCase();
  const base = (path.basename(name || '', ext) || 'image')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')   // strip diacritics
    .replace(/[^a-z0-9]+/g, '-')        // anything not [a-z0-9] -> dash
    .replace(/^-+|-+$/g, '')             // trim leading/trailing dashes
    .replace(/-{2,}/g, '-')              // collapse runs
    .slice(0, 80);                        // cap length so Strapi index doesn't blow up
  return (base || 'image') + ext;
}

async function processOne(file, strapi) {
  if (!file || !file.mimetype) return;

  // Always rename the file so Anna's media library is searchable.
  const original = file.originalFilename || file.name;
  if (original) {
    file.originalFilename = slugifyFilename(original);
    file.name = file.originalFilename;
  }

  if (!file.mimetype.startsWith('image/')) return;
  if (file.mimetype === 'image/svg+xml' || file.mimetype === 'image/gif') return;

  const sharp = require('sharp');
  const fs = require('fs/promises');

  try {
    const inputPath = file.filepath || file.path;
    const isHeic =
      file.mimetype === 'image/heic' ||
      file.mimetype === 'image/heif' ||
      /\.hei[cf]$/i.test(original || '');

    const input = await fs.readFile(inputPath);
    let pipeline = sharp(input).rotate(); // EXIF auto-orient

    const meta = await sharp(input).metadata();
    if (meta.width && meta.width > MAX_WIDTH) {
      pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
    }

    // HEIC -> JPEG so Strapi previews + browsers can render it.
    if (isHeic) {
      pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true });
      file.mimetype = 'image/jpeg';
      if (file.originalFilename) {
        file.originalFilename = file.originalFilename.replace(/\.hei[cf]$/i, '.jpg');
        file.name = file.originalFilename;
      }
    } else if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
      pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true });
    } else if (file.mimetype === 'image/png') {
      pipeline = pipeline.png({ quality: PNG_QUALITY, compressionLevel: 9 });
    } else if (file.mimetype === 'image/webp') {
      pipeline = pipeline.webp({ quality: JPEG_QUALITY });
    }

    const inputSize = input.length;
    const output = await pipeline.withMetadata({ orientation: 1 }).toBuffer();
    await fs.writeFile(inputPath, output);
    file.size = output.length;
    // Log compression result so we can see in Coolify what Anna's uploads
    // are actually doing. Helps diagnose "image didn't upload" complaints.
    const inMb = (inputSize / 1024 / 1024).toFixed(2);
    const outMb = (output.length / 1024 / 1024).toFixed(2);
    const ratio = inputSize > 0 ? Math.round((1 - output.length / inputSize) * 100) : 0;
    strapi.log.info(`[image-resize] ${original}: ${inMb}MB -> ${outMb}MB (-${ratio}%)`);
  } catch (err) {
    strapi.log.warn(`[image-resize] Skipped ${original}: ${err.message}`);
  }
}

module.exports = (/* config, { strapi } */) => {
  return async (ctx, next) => {
    const files = ctx.request.files;
    if (files && files.files) {
      const list = Array.isArray(files.files) ? files.files : [files.files];
      // Sequential, not Promise.all — see file header.
      for (const file of list) {
        await processOne(file, strapi);
      }
    }
    await next();
  };
};
