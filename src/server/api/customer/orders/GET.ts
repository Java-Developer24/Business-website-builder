import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { orders, orderItems, customers } from '../../../db/schema.js';
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

    // Get orders for this customer
    const customerOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.customerId, customerId))
      .orderBy(orders.createdAt);

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      customerOrders.map(async (order) => {
        const items = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id));

        return {
          ...order,
          items: items.map(item => ({
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
          })),
        };
      })
    );

    res.json(ordersWithItems);
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ 
      error: 'Failed to fetch orders', 
      message: error instanceof Error ? error.message : String(error) 
    });
  }
}
