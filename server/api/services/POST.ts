import type { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../db/client.js';
import { services } from '../../db/schema.js';
import { eq } from 'drizzle-orm';

const createServiceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  price: z.string().min(0, 'Price must be positive'),
  duration: z.number().int().min(1, 'Duration must be at least 1 minute'),
  isActive: z.boolean().default(true),
  categoryId: z.number().int().optional(),
  maxBookingsPerSlot: z.number().int().min(1).default(1),
  bufferTime: z.number().int().min(0).default(0),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export default async function handler(req: Request, res: Response) {
  try {
    const validationResult = createServiceSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors,
      });
    }

    const data = validationResult.data;

    // Check if slug already exists
    const existingService = await db.select().from(services).where(eq(services.slug, data.slug)).limit(1);
    if (existingService.length > 0) {
      return res.status(409).json({ error: 'Service with this slug already exists' });
    }

    // Create service
    const result = await db.insert(services).values(data);
    const serviceId = Number(result[0].insertId);

    // Fetch created service
    const [newService] = await db.select().from(services).where(eq(services.id, serviceId)).limit(1);

    res.status(201).json(newService);
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ error: 'Failed to create service', message: String(error) });
  }
}
