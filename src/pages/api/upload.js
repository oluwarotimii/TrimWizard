import multer from 'multer';
import Jimp from 'jimp';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import cloudinary from 'cloudinary';
import fs from 'fs';
import { promisify } from 'util';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// File upload configuration (limit to 50 files and larger size limits)
const upload = multer({
  limits: { 
    files: 50, // Allow up to 50 files
    fileSize: 10 * 1024 * 1024, // Limit individual file size to 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and JPG formats are allowed.'));
    }
  },
});

// Function to crop images based on pixels to remove from all sides
async function cropImageBySides(imagePath, top, bottom, left, right) {
  try {
    const image = await Jimp.read(imagePath);

    const { width, height } = image.bitmap;
    const newWidth = Math.max(1, width - left - right);
    const newHeight = Math.max(1, height - top - bottom);
    const x = Math.max(0, left);
    const y = Math.max(0, top);

    const croppedImage = image.crop(x, y, newWidth, newHeight);
    const outputFilePath = path.join('/tmp', `cropped-${path.basename(imagePath)}`);
    await croppedImage.writeAsync(outputFilePath);

    return outputFilePath;
  } catch (error) {
    console.error(`Error cropping image ${imagePath}:`, error);
    return null;
  }
}

// Middleware to handle file upload
const uploadMiddleware = upload.array('files', 50); // Max 50 files

export const config = {
  api: {
    bodyParser: false, // Disable body parser for file uploads
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await new Promise((resolve, reject) => {
        uploadMiddleware(req, res, (err) => {
          if (err instanceof multer.MulterError) {
            reject(new Error(`Multer error: ${err.message}`));
          } else if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });

      const croppedImagePaths = [];
      const { top, bottom, left, right } = req.body;

      // Upload each file to Cloudinary and crop it
      for (const file of req.files) {
        // Crop the image before uploading to Cloudinary
        const croppedImagePath = await cropImageBySides(file.path, parseInt(top), parseInt(bottom), parseInt(left), parseInt(right));
        if (croppedImagePath) {
          // Upload the cropped image to Cloudinary
          const result = await cloudinary.v2.uploader.upload(croppedImagePath);
          croppedImagePaths.push({
            name: file.originalname,
            url: result.secure_url, // Cloudinary URL of the uploaded image
          });
          // Optionally, delete the cropped image from local temp storage
          await promisify(fs.unlink)(croppedImagePath);
        }
      }

      if (croppedImagePaths.length > 0) {
        res.status(200).json({
          message: 'Success',
          files: croppedImagePaths,
        });
      } else {
        res.status(400).json({ message: 'Cropping failed.' });
      }
    } catch (error) {
      console.error('Error in upload handler:', error);
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed.' });
  }
}
