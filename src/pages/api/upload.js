import multer from 'multer';
import fs from 'fs';
import path from 'path';

const storage = multer.memoryStorage();
const upload = multer({ storage });

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      upload.single('file')(req, res, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        const croppedImage = req.file;
        // Process the cropped image here (e.g., save to file, upload to cloud storage)
        
        res.status(200).json({ message: "Image uploaded successfully" });
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
