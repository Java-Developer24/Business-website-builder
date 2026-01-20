import type { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';

const PAGES_DIR = path.join(process.cwd(), 'data', 'pages');

export default async function handler(req: Request, res: Response) {
  try {
    // Ensure pages directory exists
    await fs.mkdir(PAGES_DIR, { recursive: true });

    // Read all page files
    const files = await fs.readdir(PAGES_DIR);
    const pages = await Promise.all(
      files
        .filter((file) => file.endsWith('.json'))
        .map(async (file) => {
          const content = await fs.readFile(path.join(PAGES_DIR, file), 'utf-8');
          return JSON.parse(content);
        })
    );

    // Sort by order or createdAt
    pages.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    res.json(pages);
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
}
