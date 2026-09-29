import sharp from 'sharp';

/**
 * Optimizes an image for the news portal.
 * - Auto-orients based on EXIF and strips metadata
 * - Resizes to 1280x720 (cover fit, centered)
 * - Converts to WebP format with quality 80
 * @param {Buffer} imageBuffer - Raw image buffer
 * @returns {Promise<Buffer>} - Compressed WebP buffer
 */
export async function optimizeNewsImage(imageBuffer) {
  return await sharp(imageBuffer)
    .rotate()
    .resize({
      width: 1280,
      height: 720,
      fit: 'cover',
      position: 'centre',
      withoutEnlargement: true,
    })
    .webp({
      quality: 80,
      effort: 4,
    })
    .toBuffer();
}
