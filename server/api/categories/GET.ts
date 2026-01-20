import type { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { categories, products } from '../../db/schema.js';
import { eq, isNull, sql } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    // Fetch all active categories with product count and parent category name
    const result = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        parentId: categories.parentId,
        isActive: categories.isActive,
        createdAt: categories.createdAt,
        parentName: sql<string | null>`parent.name`,
        productCount: sql<number>`COUNT(DISTINCT ${products.id})`,
      })
      .from(categories)
      .leftJoin(sql`categories as parent`, sql`parent.id = ${categories.parentId}`)
      .leftJoin(products, eq(products.categoryId, categories.id))
      .where(isNull(categories.deletedAt))
      .groupBy(categories.id)
      .orderBy(categories.name);

    res.json(result);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories', message: String(error) });
  }
}
