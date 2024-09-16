import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { sessionId } = req.query;

  if (!sessionId) {
    return res.status(400).json({ message: 'No session ID specified' });
  }

  const filePath = path.join('/tmp/cropped', sessionId, 'cropped-images.zip');

  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=cropped-images.zip`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } else {
    return res.status(404).json({ message: 'File not found' });
  }
}
