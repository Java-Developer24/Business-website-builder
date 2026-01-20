import type { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { products, categories } from '../../db/schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const allProducts = await db.select().from(products);

    // Fetch category names for each product
    const productsWithCategories = await Promise.all(
      allProducts.map(async (product) => {
        if (product.categoryId) {
          const [category] = await db
            .select({ name: categories.name })
            .from(categories)
            .where(eq(categories.id, product.categoryId))
            .limit(1);
          return { ...product, categoryName: category?.name || null };
        }
        return { ...product, categoryName: null };
      })
    );

    res.json(productsWithCategories);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products', message: String(error) });
  }
}
