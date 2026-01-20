import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { users } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const { customerId } = req.params;
    const updates = req.body;

    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    // Don't allow updating password or role through this endpoint
    delete updates.password;
    delete updates.role;

    await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, parseInt(customerId)));

    const [updatedCustomer] = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(customerId)));

    if (!updatedCustomer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Remove password from response
    const { password, ...customerData } = updatedCustomer;

    res.json(customerData);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
}
