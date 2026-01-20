import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { orders, customers, users, orderItems, products, payments, productImages } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const orderId = parseInt(req.params.orderId);

    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    // Fetch order with customer details
    const orderResult = await db
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
        shippingAddress: orders.shippingAddress,
        billingAddress: orders.billingAddress,
        notes: orders.notes,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        customerFirstName: users.firstName,
        customerLastName: users.lastName,
        customerEmail: users.email,
        customerPhone: users.phone,
      })
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .leftJoin(users, eq(customers.userId, users.id))
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!orderResult.length) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult[0];

    // Fetch order items with primary product image
    const items = await db
      .select({
        id: orderItems.id,
        productId: orderItems.productId,
        productName: orderItems.productName,
        productSku: orderItems.productSku,
        quantity: orderItems.quantity,
        price: orderItems.price,
        subtotal: orderItems.subtotal,
        productImage: productImages.url,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .leftJoin(productImages, eq(productImages.productId, products.id))
      .where(eq(orderItems.orderId, orderId));

    // Fetch payments
    const orderPayments = await db
      .select()
      .from(payments)
      .where(eq(payments.orderId, orderId));

    // Build response
    const response = {
      ...order,
      customerName: order.customerFirstName && order.customerLastName
        ? `${order.customerFirstName} ${order.customerLastName}`.trim()
        : order.customerEmail || 'Guest',
      items: items.map((item) => ({
        ...item,
        productImage: item.productImage || null,
      })),
      payments: orderPayments,
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order', message: String(error) });
  }
}
