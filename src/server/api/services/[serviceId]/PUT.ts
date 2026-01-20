import type { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../../db/client.js';
import { services } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';

const updateServiceSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  price: z.string().optional(),
  duration: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
  categoryId: z.number().int().optional(),
  maxBookingsPerSlot: z.number().int().min(1).optional(),
  bufferTime: z.number().int().min(0).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export default async function handler(req: Request, res: Response) {
  try {
    const serviceId = parseInt(req.params.serviceId);
    if (isNaN(serviceId)) {
      return res.status(400).json({ error: 'Invalid service ID' });
    }

    const validationResult = updateServiceSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors,
      });
    }

    const data = validationResult.data;

    // Check if service exists
    const [existing] = await db.select().from(services).where(eq(services.id, serviceId)).limit(1);
    if (!existing) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Update service
    await db.update(services).set(data).where(eq(services.id, serviceId));

    // Fetch updated service
    const [updatedService] = await db.select().from(services).where(eq(services.id, serviceId)).limit(1);

    res.json(updatedService);
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ error: 'Failed to update service', message: String(error) });
  }
}
