import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { appointments } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const appointmentId = parseInt(req.params.appointmentId);
    if (isNaN(appointmentId)) {
      return res.status(400).json({ error: 'Invalid appointment ID' });
    }

    // Check if appointment exists
    const [existing] = await db.select().from(appointments).where(eq(appointments.id, appointmentId)).limit(1);
    if (!existing) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Delete appointment
    await db.delete(appointments).where(eq(appointments.id, appointmentId));

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ error: 'Failed to delete appointment', message: String(error) });
  }
}
