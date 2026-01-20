import type { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';

const PAGES_DIR = path.join(process.cwd(), 'data', 'pages');

export default async function handler(req: Request, res: Response) {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({ error: 'Slug is required' });
    }

    const filePath = path.join(PAGES_DIR, `${slug}.json`);

    try {
      await fs.unlink(filePath);
      res.json({ message: 'Page deleted successfully' });
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({ error: 'Page not found' });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({ error: 'Failed to delete page' });
  }
}
