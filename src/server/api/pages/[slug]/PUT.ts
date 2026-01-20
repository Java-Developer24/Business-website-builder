import type { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';

const PAGES_DIR = path.join(process.cwd(), 'data', 'pages');

export default async function handler(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    const updates = req.body;

    if (!slug) {
      return res.status(400).json({ error: 'Slug is required' });
    }

    const filePath = path.join(PAGES_DIR, `${slug}.json`);

    // Read existing page
    let existingPage;
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      existingPage = JSON.parse(content);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({ error: 'Page not found' });
      }
      throw error;
    }

    // Update page
    const updatedPage = {
      ...existingPage,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // If slug changed, rename file
    if (updates.slug && updates.slug !== slug) {
      const newFilePath = path.join(PAGES_DIR, `${updates.slug}.json`);
      await fs.writeFile(newFilePath, JSON.stringify(updatedPage, null, 2));
      await fs.unlink(filePath);
    } else {
      await fs.writeFile(filePath, JSON.stringify(updatedPage, null, 2));
    }

    res.json(updatedPage);
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({ error: 'Failed to update page' });
  }
}
