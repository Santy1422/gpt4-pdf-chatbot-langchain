import { run } from '../../scripts/ingest-data';
import { NextApiRequest, NextApiResponse } from 'next';
import multer, { MulterError } from 'multer';
import path from 'path';
import { Request, Response } from 'express';

interface CustomNextApiRequest extends NextApiRequest {
  file: Express.Multer.File;
}

const storage = multer.diskStorage({
  destination: './docs',
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

export default async function handler(req: CustomNextApiRequest, res: NextApiResponse) {
  try {
    await new Promise<void>((resolve, reject) => {
      upload.single('pdf')(req, res, (err: MulterError) => {
          
        resolve();
      });
    });

    const pdfPath = path.join(process.cwd(), 'docs', req.file.filename);
    await run(pdfPath);
    res.status(200).json({ message: 'Ingestion complete' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to ingest data' });
  }
}