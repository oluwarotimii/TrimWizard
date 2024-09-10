import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { file } = req.query;

  if (!file) {
    return res.status(400).json({ message: 'No file specified' });
  }

  const filePath = path.join('/tmp/cropped', file);  // Make sure this path matches where the zip files are stored

  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=${path.basename(filePath)}`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } else {
    return res.status(404).json({ message: 'File not found' });
  }
}
