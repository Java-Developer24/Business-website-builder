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

    const [service] = await db.select().from(services).where(eq(services.id, serviceId)).limit(1);

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json(service);
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ error: 'Failed to fetch service', message: String(error) });
  }
}
