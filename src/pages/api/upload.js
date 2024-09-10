import multer from 'multer';
import Jimp from 'jimp';
import path from 'path';
import fs from 'fs';
import archiver from 'archiver';
import { v4 as uuidv4 } from 'uuid';  // For session-specific folders

const baseDir = '/tmp'; // Ensure it works on Vercel
const uploadDir = `${baseDir}/uploads`;
const croppedDir = `${baseDir}/cropped`;

// Ensure directories exist
fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(croppedDir, { recursive: true });

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

const upload = multer({ storage });

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function cropImage(imagePath, sessionId) {
  try {
    const image = await Jimp.read(imagePath);
    const fileName = path.basename(imagePath);
    const originalWidth = image.bitmap.width;
    const originalHeight = image.bitmap.height;
    const widthReduction = getRandomInt(40, 60);
    const heightReduction = getRandomInt(40, 70);
    const newWidth = originalWidth - widthReduction;
    const newHeight = originalHeight - heightReduction;

    if (newWidth > 0 && newHeight > 0) {
      const croppedImage = image.crop(0, 0, newWidth, newHeight);
      const sessionCroppedDir = `${croppedDir}/${sessionId}`;
      fs.mkdirSync(sessionCroppedDir, { recursive: true });
      const outputFilePath = path.join(sessionCroppedDir, `cropped-${fileName}`);
      await croppedImage.writeAsync(outputFilePath);
      return outputFilePath;
    } else {
      console.log(`Skipping ${imagePath}: Image dimensions are too small to crop.`);
      return null;
    }
  } catch (error) {
    console.error(`Error cropping image ${imagePath}:`, error);
    return null;
  }
}

const uploadMiddleware = upload.array('files');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Generate a session-specific ID for each request
      const sessionId = uuidv4();
      req.sessionId = sessionId;

      await new Promise((resolve, reject) => {
        uploadMiddleware(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      const croppedImages = [];
      if (req.files) {
        for (const file of req.files) {
          const croppedImagePath = await cropImage(file.path, sessionId);
          if (croppedImagePath) {
            croppedImages.push(croppedImagePath);
          }
        }
      }

      if (croppedImages.length > 0) {
        const zipFilePath = `${croppedDir}/${sessionId}/cropped-images.zip`;
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip');

        output.on('close', () => {
          res.status(200).json({
            message: 'Images cropped and saved successfully.',
            downloadLink: `/api/download?file=${sessionId}/cropped-images.zip`
          });
        });

        archive.on('error', (err) => {
          throw err;
        });

        archive.pipe(output);
        croppedImages.forEach((imagePath) => {
          archive.file(imagePath, { name: path.basename(imagePath) });
        });

        archive.finalize();
      } else {
        res.status(204).json({ message: 'No images cropped.' });
      }
    } catch (error) {
      console.error('Error during file upload/cropping:', error);
      res.status(500).json({ message: 'An error occurred during file upload or cropping.' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
