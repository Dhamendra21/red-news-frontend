import sharp from 'sharp';

/**
 * Compresses and standardizes an image buffer.
 * - Rotates based on EXIF (then strips EXIF)
 * - Resizes to 16:9 (1280x720) with cover fit
 * - Converts to WebP format
 * @param {Buffer} imageBuffer - The raw image buffer
 * @returns {Promise<Buffer>} - The compressed WebP image buffer
 */
export async function compressImage(imageBuffer) {
  // sharp strips EXIF/GPS metadata by default unless .withMetadata() is called.
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
      quality: 78,
      effort: 4,
      alphaQuality: 80,
    })
    .toBuffer();
}
