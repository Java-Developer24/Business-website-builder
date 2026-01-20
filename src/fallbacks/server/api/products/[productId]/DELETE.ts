import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { products } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const productId = parseInt(req.params.productId);
    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    // Check if product exists
    const [existing] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Delete product
    await db.delete(products).where(eq(products.id, productId));

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product', message: String(error) });
  }
}
