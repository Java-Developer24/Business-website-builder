import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { services } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const serviceId = parseInt(req.params.serviceId);
    if (isNaN(serviceId)) {
      return res.status(400).json({ error: 'Invalid service ID' });
    }

    // Check if service exists
    const [existing] = await db.select().from(services).where(eq(services.id, serviceId)).limit(1);
    if (!existing) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Delete service
    await db.delete(services).where(eq(services.id, serviceId));

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ error: 'Failed to delete service', message: String(error) });
  }
}
