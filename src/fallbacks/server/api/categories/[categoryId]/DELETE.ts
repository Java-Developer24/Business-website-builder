import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { categories } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const categoryId = parseInt(req.params.categoryId);

    if (isNaN(categoryId)) {
      return res.status(400).json({ error: 'Invalid category ID' });
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

    // Soft delete the category
    await db
      .update(categories)
      .set({ deletedAt: new Date() })
      .where(eq(categories.id, categoryId));

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category', message: String(error) });
  }
}
