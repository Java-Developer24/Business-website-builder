import type { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { users, orders, appointments } from '../../db/schema.js';
import { sql, desc } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const { page = '1', limit = '20' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Get customers with order and appointment counts
    const customers = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phone: users.phone,
        createdAt: users.createdAt,
        orderCount: sql<number>`(
          SELECT COUNT(*) FROM ${orders} 
          WHERE ${orders.customerId} = ${users.id}
        )`,
        appointmentCount: sql<number>`(
          SELECT COUNT(*) FROM ${appointments} 
          WHERE ${appointments.customerId} = ${users.id}
        )`,
        totalSpent: sql<number>`(
          SELECT COALESCE(SUM(${orders.total}), 0) FROM ${orders} 
          WHERE ${orders.customerId} = ${users.id}
        )`,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(parseInt(limit as string))
      .offset(offset);

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    res.json({
      customers,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: Number(count),
        pages: Math.ceil(Number(count) / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
}
