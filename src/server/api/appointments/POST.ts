import type { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { appointments, services, customers, users } from '../../db/schema.js';
import { eq, and, gte, lte, isNull } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { sendEmail } from '../../lib/email-service.js';
import { generateAppointmentConfirmationEmail } from '../../lib/email-templates.js';

export default async function handler(req: Request, res: Response) {
  try {
    const { serviceId, customerId, customerName, customerEmail, customerPhone, appointmentDate, notes } = req.body;

    // Validate required fields
    if (!serviceId || !appointmentDate) {
      return res.status(400).json({ error: 'Service ID and appointment date are required' });
    }

    // If customerId not provided, we need customer contact info
    if (!customerId && (!customerName || !customerEmail)) {
      return res.status(400).json({ error: 'Customer ID or customer contact info (name, email) required' });
    }

    // Fetch service details
    const service = await db.select().from(services).where(eq(services.id, serviceId)).limit(1);
    if (!service.length) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const serviceData = service[0];
    const duration = serviceData.duration;
    const price = serviceData.price;

    // Parse appointment date
    const startTime = new Date(appointmentDate);
    const endTime = new Date(startTime.getTime() + duration * 60000);

    // Add buffer time if configured
    const bufferTime = serviceData.bufferTime || 0;
    const bufferEndTime = new Date(endTime.getTime() + bufferTime * 60000);

    // Check for conflicts - appointments that overlap with the requested time slot
    const conflicts = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.serviceId, serviceId),
          isNull(appointments.cancelledAt),
          // Appointment starts before our end time
          lte(appointments.appointmentDate, bufferEndTime),
          // Appointment ends after our start time (calculated from appointmentDate + duration)
          gte(appointments.appointmentDate, new Date(startTime.getTime() - duration * 60000))
        )
      );

    if (conflicts.length > 0) {
      return res.status(409).json({ error: 'Time slot not available - conflicts with existing appointment' });
    }

    // Handle customer creation or lookup
    let finalCustomerId = customerId;
    
    if (!finalCustomerId) {
      // Check if user exists by email
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, customerEmail))
        .limit(1);

      let userId: number;

      if (existingUser.length > 0) {
        userId = existingUser[0].id;
        
        // Check if customer record exists for this user
        const existingCustomer = await db
          .select()
          .from(customers)
          .where(eq(customers.userId, userId))
          .limit(1);

        if (existingCustomer.length > 0) {
          finalCustomerId = existingCustomer[0].id;
        } else {
          // Create customer record for existing user
          const newCustomerResult = await db.insert(customers).values({
            userId,
          });
          finalCustomerId = Number(newCustomerResult[0].insertId);
        }
      } else {
        // Create new user
        const hashedPassword = await bcrypt.hash(Math.random().toString(36), 10); // Random password
        const nameParts = customerName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        const newUserResult = await db.insert(users).values({
          firstName,
          lastName,
          email: customerEmail,
          phone: customerPhone || null,
          password: hashedPassword,
          emailVerified: false,
        });
        userId = Number(newUserResult[0].insertId);

        // Create customer record
        const newCustomerResult = await db.insert(customers).values({
          userId,
        });
        finalCustomerId = Number(newCustomerResult[0].insertId);
      }
    }

    // Create appointment
    const insertResult = await db.insert(appointments).values({
      serviceId,
      customerId: finalCustomerId,
      appointmentDate: startTime,
      duration,
      price,
      notes: notes || null,
      status: 'PENDING',
    });

    const insertId = Number(insertResult[0].insertId);

    // Fetch the created appointment with details
    const newAppointment = await db
      .select({
        id: appointments.id,
        serviceId: appointments.serviceId,
        customerId: appointments.customerId,
        appointmentDate: appointments.appointmentDate,
        duration: appointments.duration,
        status: appointments.status,
        price: appointments.price,
        notes: appointments.notes,
        serviceName: services.name,
        customerFirstName: users.firstName,
        customerLastName: users.lastName,
        customerEmail: users.email,
        customerPhone: users.phone,
      })
      .from(appointments)
      .innerJoin(services, eq(appointments.serviceId, services.id))
      .innerJoin(customers, eq(appointments.customerId, customers.id))
      .innerJoin(users, eq(customers.userId, users.id))
      .where(eq(appointments.id, insertId))
      .limit(1);

    const appointmentData = newAppointment[0];
    const response = {
      ...appointmentData,
      customerName: `${appointmentData.customerFirstName || ''} ${appointmentData.customerLastName || ''}`.trim(),
    };

    // Send appointment confirmation email
    try {
      if (customerEmail) {
        const appointmentDateTime = new Date(appointmentDate);
        const appointmentTime = appointmentDateTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });

        const emailData = generateAppointmentConfirmationEmail({
          customerName: customerName || 'Customer',
          serviceName: service[0].name,
          appointmentDate: appointmentDateTime.toISOString(),
          appointmentTime,
          duration: service[0].duration,
          price: service[0].price,
          notes,
        });

        await sendEmail({
          to: customerEmail,
          subject: emailData.subject,
          text: emailData.text,
          html: emailData.html,
          emailType: 'appointment_confirmation',
          relatedAppointmentId: appointmentData.id,
        });
      }
    } catch (emailError) {
      console.error('Error sending appointment confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json(response);
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Failed to create appointment', message: String(error) });
  }
}
