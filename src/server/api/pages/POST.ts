import type { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';

const PAGES_DIR = path.join(process.cwd(), 'data', 'pages');

interface PageSection {
  id: string;
  type: 'hero' | 'features' | 'content' | 'gallery' | 'cta' | 'contact';
  title?: string;
  content?: string;
  image?: string;
  buttonText?: string;
  buttonLink?: string;
  items?: any[];
}

interface Page {
  id: string;
  slug: string;
  title: string;
  description?: string;
  isPublished: boolean;
  sections: PageSection[];
  order?: number;
  createdAt: string;
  updatedAt: string;
}

export default async function handler(req: Request, res: Response) {
  try {
    const { slug, title, description, isPublished, sections, order } = req.body;

    if (!slug || !title) {
      return res.status(400).json({ error: 'Slug and title are required' });
    }

    // Ensure pages directory exists
    await fs.mkdir(PAGES_DIR, { recursive: true });

    // Check if slug already exists
    const files = await fs.readdir(PAGES_DIR);
    const existingPage = files.find((file) => file === `${slug}.json`);
    if (existingPage) {
      return res.status(400).json({ error: 'Page with this slug already exists' });
    }

    const page: Page = {
      id: `page-${Date.now()}`,
      slug,
      title,
      description: description || '',
      isPublished: isPublished || false,
      sections: sections || [],
      order: order || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save page to file
    await fs.writeFile(path.join(PAGES_DIR, `${slug}.json`), JSON.stringify(page, null, 2));

    res.status(201).json(page);
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({ error: 'Failed to create page' });
  }
}
