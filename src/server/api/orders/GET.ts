import type { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { orders, customers, users, orderItems } from '../../db/schema.js';
import { eq, like, or, sql } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const { search, status } = req.query;

    // Build where conditions
    const conditions = [];

    if (status && typeof status === 'string') {
      conditions.push(eq(orders.status, status as any));
    }

    if (search && typeof search === 'string') {
      conditions.push(
        or(
          like(orders.orderNumber, `%${search}%`),
          like(users.email, `%${search}%`),
          like(users.firstName, `%${search}%`),
          like(users.lastName, `%${search}%`)
        )
      );
    }

    // Fetch orders with customer details and item count
    const result = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        customerId: orders.customerId,
        status: orders.status,
        subtotal: orders.subtotal,
        tax: orders.tax,
        shipping: orders.shipping,
        discount: orders.discount,
        total: orders.total,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        customerFirstName: users.firstName,
        customerLastName: users.lastName,
        customerEmail: users.email,
        itemCount: sql<number>`COUNT(DISTINCT ${orderItems.id})`,
      })
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .leftJoin(users, eq(customers.userId, users.id))
      .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
      .where(conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined)
      .groupBy(orders.id)
      .orderBy(sql`${orders.createdAt} DESC`);

    // Transform to include full customer name
    const transformedResult = result.map((order) => ({
      ...order,
      customerName: order.customerFirstName && order.customerLastName
        ? `${order.customerFirstName} ${order.customerLastName}`.trim()
        : order.customerEmail || 'Guest',
    }));

    res.json(transformedResult);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders', message: String(error) });
  }
}
