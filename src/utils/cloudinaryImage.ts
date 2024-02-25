import cloudinary, { UploadApiResponse } from 'cloudinary';
import catchAsync from './catchAsync';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const cloudinaryUploadImage = async (file: string) => {
  try {
    const data = (await cloudinary.v2.uploader.upload(file, {
      resource_type: 'auto',
    })) as UploadApiResponse;

    return data;
  } catch (err) {
    console.log(err);
  }
};

export const cloudinaryRemoveImage = async (imageId: string) => {
  try {
    const result = await cloudinary.v2.uploader.destroy(imageId);
    return result;
  } catch (err) {
    return err;
  }
};

export const cloudinaryRemoveMultipleImage = async (publicIds: string[]) => {
  try {
    const result = await cloudinary.v2.api.delete_resources(publicIds);
    return result;
  } catch (err) {
    console.log(err);
  }
};
