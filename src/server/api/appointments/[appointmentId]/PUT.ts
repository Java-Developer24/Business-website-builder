import type { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../../db/client.js';
import { appointments } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';

const updateAppointmentSchema = z.object({
  startTime: z.string().datetime().optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']).optional(),
  notes: z.string().optional(),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
});

export default async function handler(req: Request, res: Response) {
  try {
    const appointmentId = parseInt(req.params.appointmentId);
    if (isNaN(appointmentId)) {
      return res.status(400).json({ error: 'Invalid appointment ID' });
    }

    const validationResult = updateAppointmentSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors,
      });
    }

    const data = validationResult.data;

    // Check if appointment exists
    const [existing] = await db.select().from(appointments).where(eq(appointments.id, appointmentId)).limit(1);
    if (!existing) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Update appointment
    await db.update(appointments).set(data).where(eq(appointments.id, appointmentId));

    // Fetch updated appointment
    const [updatedAppointment] = await db.select().from(appointments).where(eq(appointments.id, appointmentId)).limit(1);

    res.json(updatedAppointment);
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ error: 'Failed to update appointment', message: String(error) });
  }
}
