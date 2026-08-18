import { v2 as cloudinary } from 'cloudinary';
import logger from '@/lib/logger';

// ─── Configure Cloudinary ─────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a file buffer to Cloudinary.
 * @param {Buffer} buffer - File data
 * @param {object} opts
 * @param {string} opts.folder - Cloudinary folder (default: 'mailgenius/avatars')
 * @param {string} [opts.publicId] - Optional existing public_id to overwrite
 * @param {number} [opts.width] - Max width for auto-resize
 * @param {number} [opts.height] - Max height for auto-resize
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export async function uploadToCloudinary(buffer, {
  folder = 'mailgenius/avatars',
  publicId,
  width = 256,
  height = 256,
} = {}) {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: 'image',
      transformation: [
        { width, height, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
      ...(publicId ? { public_id: publicId, overwrite: true } : {}),
    };

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        logger.error('Cloudinary upload failed', { error: error.message });
        return reject(error);
      }
      logger.info('Cloudinary upload success', { publicId: result.public_id, url: result.secure_url });
      resolve({ url: result.secure_url, publicId: result.public_id });
    });

    stream.end(buffer);
  });
}

/**
 * Delete an image from Cloudinary by public_id.
 */
export async function deleteFromCloudinary(publicId) {
  try {
    await cloudinary.uploader.destroy(publicId);
    logger.info('Cloudinary delete success', { publicId });
  } catch (err) {
    logger.error('Cloudinary delete failed', { error: err.message });
  }
}

export default cloudinary;
