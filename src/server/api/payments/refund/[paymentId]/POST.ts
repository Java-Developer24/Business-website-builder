import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { payments, orders } from '../../../../db/schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const paymentId = parseInt(req.params.paymentId);

    if (isNaN(paymentId)) {
      return res.status(400).json({ error: 'Invalid payment ID' });
    }

    // Find the payment
    const paymentResult = await db
      .select()
      .from(payments)
      .where(eq(payments.id, paymentId))
      .limit(1);

    if (!paymentResult.length) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const payment = paymentResult[0];

    if (payment.status === 'REFUNDED') {
      return res.status(400).json({ error: 'Payment already refunded' });
    }

    if (payment.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Only completed payments can be refunded' });
    }

    // Update payment status to refunded
    await db
      .update(payments)
      .set({ 
        status: 'REFUNDED',
        updatedAt: new Date()
      })
      .where(eq(payments.id, paymentId));

    // Update order status to refunded if orderId exists
    if (payment.orderId) {
      await db
        .update(orders)
        .set({ 
          status: 'REFUNDED',
          updatedAt: new Date()
        })
        .where(eq(orders.id, payment.orderId));
    }

    res.json({
      success: true,
      message: 'Refund processed successfully',
      payment: {
        id: payment.id,
        status: 'refunded',
        amount: payment.amount,
      },
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ 
      error: 'Failed to process refund', 
      message: error instanceof Error ? error.message : String(error) 
    });
  }
}
