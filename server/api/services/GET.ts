import type { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { services } from '../../db/schema.js';

export default async function handler(req: Request, res: Response) {
  try {
    const allServices = await db.select().from(services);
    res.json(allServices);
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Failed to fetch services', message: String(error) });
  }
}
