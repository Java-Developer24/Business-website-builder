import type { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { appointments, services, customers, users } from '../../db/schema.js';
import { eq, and, gte, lte, isNull } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const { status, startDate, endDate } = req.query;

    // Build where conditions
    const conditions = [isNull(appointments.cancelledAt)];

    if (status && typeof status === 'string') {
      conditions.push(eq(appointments.status, status as any));
    }

    if (startDate && typeof startDate === 'string') {
      conditions.push(gte(appointments.appointmentDate, new Date(startDate)));
    }

    if (endDate && typeof endDate === 'string') {
      conditions.push(lte(appointments.appointmentDate, new Date(endDate)));
    }

    // Fetch appointments with service and customer details
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
      .where(and(...conditions))
      .orderBy(appointments.appointmentDate);

    // Transform to include calculated endTime and full customer name
    const transformedResult = result.map((apt) => ({
      ...apt,
      customerName: `${apt.customerFirstName || ''} ${apt.customerLastName || ''}`.trim(),
      startTime: apt.appointmentDate.toISOString(),
      endTime: new Date(apt.appointmentDate.getTime() + apt.duration * 60000).toISOString(),
    }));

    res.json(transformedResult);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments', message: String(error) });
  }
}
