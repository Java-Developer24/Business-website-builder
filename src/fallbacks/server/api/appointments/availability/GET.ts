import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { appointments, services } from '../../../db/schema.js';
import { eq, and, gte, lte, isNull } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const { serviceId, date } = req.query;

    if (!serviceId || !date) {
      return res.status(400).json({ error: 'Service ID and date are required' });
    }

    // Fetch service details
    const service = await db.select().from(services).where(eq(services.id, parseInt(serviceId as string))).limit(1);
    
    if (!service.length) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const serviceData = service[0];
    const duration = serviceData.duration;
    const bufferTime = serviceData.bufferTime || 0;

    // Parse date and set time range (9 AM to 5 PM)
    const targetDate = new Date(date as string);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(9, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(17, 0, 0, 0);

    // Fetch existing appointments for this service on this date
    const existingAppointments = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.serviceId, parseInt(serviceId as string)),
          gte(appointments.appointmentDate, startOfDay),
          lte(appointments.appointmentDate, endOfDay),
          isNull(appointments.cancelledAt)
        )
      );

    // Generate time slots (every 30 minutes)
    const slots = [];
    const slotInterval = 30; // minutes
    let currentTime = new Date(startOfDay);

    while (currentTime < endOfDay) {
      const slotStart = new Date(currentTime);
      const slotEnd = new Date(currentTime.getTime() + duration * 60000);
      const slotEndWithBuffer = new Date(slotEnd.getTime() + bufferTime * 60000);

      // Check if this slot conflicts with any existing appointments
      const hasConflict = existingAppointments.some((apt) => {
        const aptStart = new Date(apt.appointmentDate);
        const aptEnd = new Date(aptStart.getTime() + apt.duration * 60000);
        
        // Check for overlap
        return (
          (slotStart >= aptStart && slotStart < aptEnd) ||
          (slotEnd > aptStart && slotEnd <= aptEnd) ||
          (slotStart <= aptStart && slotEnd >= aptEnd)
        );
      });

      // Only add slots that don't go past end of day
      if (slotEndWithBuffer <= endOfDay) {
        slots.push({
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
          available: !hasConflict,
          remainingCapacity: hasConflict ? 0 : 1,
        });
      }

      // Move to next slot
      currentTime = new Date(currentTime.getTime() + slotInterval * 60000);
    }

    res.json({
      date: date as string,
      serviceId: parseInt(serviceId as string),
      serviceName: serviceData.name,
      duration,
      slots,
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ error: 'Failed to fetch availability', message: String(error) });
  }
}
