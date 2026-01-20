import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { users, orders, appointments } from '../../../db/schema.js';
import { eq, desc } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    // Get customer details
    const [customer] = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(customerId)));

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Get customer orders
    const customerOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.customerId, parseInt(customerId)))
      .orderBy(desc(orders.createdAt));

    // Get customer appointments
    const customerAppointments = await db
      .select()
      .from(appointments)
      .where(eq(appointments.customerId, parseInt(customerId)))
      .orderBy(desc(appointments.appointmentDate));

    // Remove password from response
    const { password, ...customerData } = customer;

    res.json({
      customer: customerData,
      orders: customerOrders,
      appointments: customerAppointments,
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
}
