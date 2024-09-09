import multer from 'multer';
import Jimp from 'jimp';
import path from 'path';
import fs from 'fs';

// Set the output directory for cropped images
const OutputDir = './tmp/cropped';

// Ensure the output directory exists
fs.mkdirSync(OutputDir, { recursive: true });

// Multer setup for file handling
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './tmp/uploads'; // Directory where the uploaded images are stored
    // Ensure the directory exists
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Save the file with the current timestamp to avoid duplicates
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// Helper function to get a random integer between min and max
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to crop image using Jimp
async function cropImage(imagePath) {
  try {
    const image = await Jimp.read(imagePath);
    const fileName = path.basename(imagePath);
    const originalWidth = image.bitmap.width;
    const originalHeight = image.bitmap.height;

    // Random reduction values for the new image dimensions
    const widthReduction = getRandomInt(40, 60);
    const heightReduction = getRandomInt(40, 70);

    const newWidth = originalWidth - widthReduction;
    const newHeight = originalHeight - heightReduction;

    // Ensure the new dimensions are valid
    if (newWidth > 0 && newHeight > 0) {
      const croppedImage = image.crop(0, 0, newWidth, newHeight);
      // Save the cropped image to the output directory
      await croppedImage.writeAsync(`${OutputDir}/cropped-${fileName}`);
      console.log(`Cropped and saved: ${fileName}`);
    } else {
      console.log(`Skipping ${fileName}: Image dimensions are too small to crop.`);
    }
  } catch (error) {
    console.error(`Error cropping image ${imagePath}:`, error);
  }
}

// Multer middleware for handling multiple file uploads
const uploadMiddleware = upload.array('files'); // Adjusted to handle multiple files

// Next.js API handler
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Use Multer to handle the file upload
      await new Promise((resolve, reject) => {
        uploadMiddleware(req, res, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });

      // Process each uploaded file
      if (req.files) {
        for (const file of req.files) {
          await cropImage(file.path);
        }
      }

      // Send success response
      res.status(200).json({ message: 'Files uploaded and cropped successfully!' });
    } catch (error) {
      console.error('Error during file upload/cropping:', error);
      res.status(500).json({ message: 'An error occurred during file upload or cropping.' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

// Disable the default body parsing in Next.js for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};
