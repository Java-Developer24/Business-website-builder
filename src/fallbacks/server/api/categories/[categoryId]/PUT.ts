import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { categories } from '../../../db/schema.js';
import { eq, and, ne } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const categoryId = parseInt(req.params.categoryId);

    if (isNaN(categoryId)) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    const { name, slug, description, parentId, isActive } = req.body;

    // Validate required fields
    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' });
    }

    // Check if category exists
    const existingCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);

    if (!existingCategory.length || existingCategory[0].deletedAt) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if slug is taken by another category
    const slugCheck = await db
      .select()
      .from(categories)
      .where(and(eq(categories.slug, slug), ne(categories.id, categoryId)))
      .limit(1);

    if (slugCheck.length > 0) {
      return res.status(409).json({ error: 'A category with this slug already exists' });
    }

    // Prevent circular parent reference
    if (parentId && parentId === categoryId) {
      return res.status(400).json({ error: 'A category cannot be its own parent' });
    }

    // Update category
    await db
      .update(categories)
      .set({
        name: name.trim(),
        slug: slug.trim(),
        description: description?.trim() || null,
        parentId: parentId || null,
        isActive: isActive ?? true,
      })
      .where(eq(categories.id, categoryId));

    // Fetch updated category
    const updatedCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);

    res.json(updatedCategory[0]);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category', message: String(error) });
  }
}
