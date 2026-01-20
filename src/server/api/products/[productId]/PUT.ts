import type { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../../db/client.js';
import { products } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  price: z.string().optional(),
  compareAtPrice: z.string().optional(),
  costPerItem: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  trackQuantity: z.boolean().optional(),
  quantity: z.number().int().min(0).optional(),
  categoryId: z.number().int().optional(),
  isDigital: z.boolean().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  weight: z.string().optional(),
  dimensions: z.string().optional(),
  tags: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export default async function handler(req: Request, res: Response) {
  try {
    const productId = parseInt(req.params.productId);
    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const validationResult = updateProductSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors,
      });
    }

    const data = validationResult.data;

    // Check if product exists
    const [existing] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Update product
    await db.update(products).set(data).where(eq(products.id, productId));

    // Fetch updated product
    const [updatedProduct] = await db.select().from(products).where(eq(products.id, productId)).limit(1);

    res.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product', message: String(error) });
  }
}
