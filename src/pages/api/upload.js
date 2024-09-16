import multer from 'multer';
import Jimp from 'jimp';
import path from 'path';
import fs from 'fs';
import archiver from 'archiver';
import { v4 as uuidv4 } from 'uuid';

// Configure directories
const baseDir = '/tmp';
const uploadDir = `${baseDir}/uploads`;
const croppedDir = `${baseDir}/cropped`;

// Ensure directories exist
fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(croppedDir, { recursive: true });

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const sessionId = req.sessionId;
    const sessionUploadDir = `${uploadDir}/${sessionId}`;
    fs.mkdirSync(sessionUploadDir, { recursive: true });
    cb(null, sessionUploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

// File upload configuration (limit to 500 files and specific types)
const upload = multer({
  storage,
  limits: { files: 500 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and JPG formats are allowed.'));
    }
  },
});

// Function to crop images dynamically based on their dimensions
async function cropImageDynamically(imagePath, sessionId) {
  try {
    const image = await Jimp.read(imagePath);
    const fileName = path.basename(imagePath);

    // Calculate crop dimensions dynamically (center crop)
    const { width, height } = image.bitmap;
    const cropWidth = Math.min(width, height); // Center square crop
    const cropHeight = cropWidth;
    const x = (width - cropWidth) / 2;  // Start cropping from center
    const y = (height - cropHeight) / 2;

    // Crop the image
    const croppedImage = image.crop(x, y, cropWidth, cropHeight);
    const sessionCroppedDir = `${croppedDir}/${sessionId}`;
    fs.mkdirSync(sessionCroppedDir, { recursive: true });
    const outputFilePath = path.join(sessionCroppedDir, `cropped-${fileName}`);
    await croppedImage.writeAsync(outputFilePath);
    return outputFilePath;
  } catch (error) {
    console.error(`Error cropping image ${imagePath}:`, error);
    return null;
  }
}

// Middleware to handle file upload
const uploadMiddleware = upload.array('files', 100); // Max 100 files

export const config = {
  api: {
    bodyParser: false, // Disable body parser for file uploads
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const sessionId = uuidv4();
      req.sessionId = sessionId;

      // Handle file upload
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

      // Crop images dynamically
      for (const file of req.files) {
        const croppedImagePath = await cropImageDynamically(
          file.path,
          sessionId
        );
        if (croppedImagePath) {
          croppedImagePaths.push(croppedImagePath);
        }
      }

      // If cropping successful, create ZIP archive
      if (croppedImagePaths.length > 0) {
        const zipFilePath = `${croppedDir}/${sessionId}/cropped-images.zip`;
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip');

        output.on('close', () => {
          res.status(200).json({
            message: 'Success',
            downloadLink: `/api/download?sessionId=${sessionId}`,
          });
        });

        archive.on('error', (err) => {
          throw err;
        });

        // Add cropped files to the archive
        archive.pipe(output);
        croppedImagePaths.forEach((imagePath) => {
          archive.file(imagePath, { name: path.basename(imagePath) });
        });

        await archive.finalize();
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
