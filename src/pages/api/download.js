import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const { sessionId, fileName } = req.query;

  if (!sessionId || !fileName) {
    return res.status(400).json({ message: 'Session ID or file name missing' });
  }

  const filePath = path.join('/tmp/cropped', sessionId, fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found' });
  }

  res.setHeader('Content-Type', 'image/jpeg'); // Assuming all images are JPEG. Adjust accordingly if you expect PNG or other formats.
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
}
