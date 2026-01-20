import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { appointments, services, customers } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get customer ID from user ID
    const customerResult = await db
      .select({ id: customers.id })
      .from(customers)
      .where(eq(customers.userId, userId))
      .limit(1);

    if (!customerResult.length) {
      return res.json([]);
    }

    const customerId = customerResult[0].id;

    // Get appointments with service details
    const customerAppointments = await db
      .select({
        id: appointments.id,
        appointmentDate: appointments.appointmentDate,
        duration: appointments.duration,
        status: appointments.status,
        notes: appointments.notes,
        serviceName: services.name,
        price: services.price,
      })
      .from(appointments)
      .innerJoin(services, eq(appointments.serviceId, services.id))
      .where(eq(appointments.customerId, customerId))
      .orderBy(appointments.appointmentDate);

    res.json(customerAppointments);
  } catch (error) {
    console.error('Error fetching customer appointments:', error);
    res.status(500).json({ 
      error: 'Failed to fetch appointments', 
      message: error instanceof Error ? error.message : String(error) 
    });
  }
}
