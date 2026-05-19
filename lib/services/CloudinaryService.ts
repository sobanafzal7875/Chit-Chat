import * as cloudinary from 'cloudinary';

const { CLOUD_NAME, API_KEY, API_SECRET } = process.env;

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  throw new Error('Cloudinary environment variables are required: CLOUD_NAME, API_KEY, API_SECRET');
}

cloudinary.v2.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

export class CloudinaryService {
  static async uploadImage(data: string, folder = 'chit-chat/profiles') {
    if (!data) {
      throw new Error('No image data provided for Cloudinary upload');
    }

    if (/^https?:\/\//i.test(data)) {
      return data;
    }

    if (!data.startsWith('data:image/')) {
      throw new Error('Invalid image format. Expected a base64 image data URL.');
    }

    const result = await cloudinary.v2.uploader.upload(data, {
      folder,
      resource_type: 'image',
    });

    if (!result.secure_url) {
      throw new Error('Failed to upload image to Cloudinary');
    }

    return result.secure_url;
  }
}
