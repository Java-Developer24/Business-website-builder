import type { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { categories } from '../../db/schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const { name, slug, description, parentId, isActive } = req.body;

    // Validate required fields
    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' });
    }

    // Check if slug already exists
    const existingCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);

    if (existingCategory.length > 0) {
      return res.status(409).json({ error: 'A category with this slug already exists' });
    }

    // Create category
    const result = await db.insert(categories).values({
      name: name.trim(),
      slug: slug.trim(),
      description: description?.trim() || null,
      parentId: parentId || null,
      isActive: isActive ?? true,
    });

    const insertId = Number(result[0].insertId);

    // Fetch the created category
    const newCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.id, insertId))
      .limit(1);

    res.status(201).json(newCategory[0]);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category', message: String(error) });
  }
}
