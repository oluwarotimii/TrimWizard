import path from 'path';
import fs from 'fs';

export default function handler(req, res) {
  if (req.method === 'GET') {
    const file = req.query.file;
    const filePath = path.resolve('./tmp', file);

    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename=${file}`);
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.status(404).json({ message: 'File not found.' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
