import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { appointments, services, customers, users } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const appointmentId = parseInt(req.params.appointmentId);

    if (isNaN(appointmentId)) {
      return res.status(400).json({ error: 'Invalid appointment ID' });
    }

    const result = await db
      .select({
        id: appointments.id,
        serviceId: appointments.serviceId,
        customerId: appointments.customerId,
        appointmentDate: appointments.appointmentDate,
        duration: appointments.duration,
        status: appointments.status,
        price: appointments.price,
        notes: appointments.notes,
        createdAt: appointments.createdAt,
        serviceName: services.name,
        servicePrice: services.price,
        serviceDuration: services.duration,
        customerFirstName: users.firstName,
        customerLastName: users.lastName,
        customerEmail: users.email,
        customerPhone: users.phone,
      })
      .from(appointments)
      .innerJoin(services, eq(appointments.serviceId, services.id))
      .innerJoin(customers, eq(appointments.customerId, customers.id))
      .innerJoin(users, eq(customers.userId, users.id))
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (!result.length) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Add calculated endTime and full customer name
    const appointment = result[0];
    const response = {
      ...appointment,
      customerName: `${appointment.customerFirstName || ''} ${appointment.customerLastName || ''}`.trim(),
      startTime: appointment.appointmentDate.toISOString(),
      endTime: new Date(appointment.appointmentDate.getTime() + appointment.duration * 60000).toISOString(),
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ error: 'Failed to fetch appointment', message: String(error) });
  }
}
