import type { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../db/client.js';
import { products } from '../../db/schema.js';
import { eq } from 'drizzle-orm';

const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  price: z.string().min(0, 'Price must be positive'),
  compareAtPrice: z.string().optional(),
  costPerItem: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  trackQuantity: z.boolean().default(true),
  quantity: z.number().int().min(0).default(0),
  categoryId: z.number().int().optional(),
  isDigital: z.boolean().default(false),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  weight: z.string().optional(),
  dimensions: z.string().optional(),
  tags: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export default async function handler(req: Request, res: Response) {
  try {
    const validationResult = createProductSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors,
      });
    }

    const data = validationResult.data;

    // Check if slug already exists
    const existingProduct = await db.select().from(products).where(eq(products.slug, data.slug)).limit(1);
    if (existingProduct.length > 0) {
      return res.status(409).json({ error: 'Product with this slug already exists' });
    }

    // Create product
    const result = await db.insert(products).values(data);
    const productId = Number(result[0].insertId);

    // Fetch created product
    const [newProduct] = await db.select().from(products).where(eq(products.id, productId)).limit(1);

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product', message: String(error) });
  }
}
