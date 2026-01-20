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
      const content = await fs.readFile(filePath, 'utf-8');
      const page = JSON.parse(content);
      res.json(page);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({ error: 'Page not found' });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({ error: 'Failed to fetch page' });
  }
}
