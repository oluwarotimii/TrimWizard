import multer from 'multer';
import Jimp from 'jimp';
import path from 'path';
import fs from 'fs';
import archiver from 'archiver';
import { v4 as uuidv4 } from 'uuid';

const baseDir = '/tmp'; 
const uploadDir = `${baseDir}/uploads`;
const croppedDir = `${baseDir}/cropped`;

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

async function cropImage(imagePath, cropWidth, cropHeight, x, y, sessionId) {
  try {
    const image = await Jimp.read(imagePath);
    const fileName = path.basename(imagePath);

    const newWidth = Math.min(cropWidth, image.bitmap.width - x);
    const newHeight = Math.min(cropHeight, image.bitmap.height - y);

    const croppedImage = image.crop(x, y, newWidth, newHeight);
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

const uploadMiddleware = upload.single('file');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const sessionId = uuidv4();
      req.sessionId = sessionId;

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

      const { cropWidth, cropHeight, x, y } = req.body;

      if (req.file) {
        const croppedImagePath = await cropImage(req.file.path, parseInt(cropWidth), parseInt(cropHeight), parseInt(x), parseInt(y), sessionId);
        
        if (croppedImagePath) {
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

          archive.pipe(output);
          archive.file(croppedImagePath, { name: path.basename(croppedImagePath) });
          await archive.finalize();
        } else {
          res.status(400).json({ message: 'Cropping failed.' });
        }
      } else {
        res.status(400).json({ message: 'No file uploaded.' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed.' });
  }
}
