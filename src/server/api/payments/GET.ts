import type { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { payments, orders, users } from '../../db/schema.js';
import { eq, desc } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    // Fetch all payments with order and customer information
    const allPayments = await db
      .select({
        id: payments.id,
        orderId: payments.orderId,
        amount: payments.amount,
        currency: payments.currency,
        status: payments.status,
        paymentMethod: payments.paymentMethod,
        transactionId: payments.transactionId,
        createdAt: payments.createdAt,
        orderNumber: orders.orderNumber,
        customerFirstName: users.firstName,
        customerLastName: users.lastName,
        customerEmail: users.email,
      })
      .from(payments)
      .leftJoin(orders, eq(payments.orderId, orders.id))
      .leftJoin(users, eq(orders.customerId, users.id))
      .orderBy(desc(payments.createdAt));

    // Transform the data to match the frontend interface
    const formattedPayments = allPayments.map((payment) => ({
      id: payment.id,
      orderId: payment.orderId,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId,
      createdAt: payment.createdAt,
      order: payment.orderNumber
        ? {
            id: payment.orderId,
            orderNumber: payment.orderNumber,
            customer: {
              name: `${payment.customerFirstName || ''} ${payment.customerLastName || ''}`.trim() || 'Unknown',
              email: payment.customerEmail || 'N/A',
            },
          }
        : undefined,
    }));

    res.json(formattedPayments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      error: 'Failed to fetch payments',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
