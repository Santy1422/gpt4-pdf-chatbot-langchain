import { run } from '../../scripts/ingest-data';
import { NextApiRequest, NextApiResponse } from 'next';
import multer, { MulterError } from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: './docs', // Ruta de destino para guardar los archivos PDF
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({ storage });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await upload.single('pdf')(req, res, async (err: MulterError) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          res.status(500).json({ error: 'Failed to upload file' });
        } else {
          res.status(500).json({ error: 'An unexpected error occurred' });
        }
        return;
      }

      const pdfPath = path.join(process.cwd(), 'docs', req.file.filename);
      await run(pdfPath);
      res.status(200).json({ message: 'Ingestion complete' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to ingest data' });
  }
}