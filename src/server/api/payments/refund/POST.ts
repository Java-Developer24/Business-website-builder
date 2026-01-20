import type { Request, Response } from 'express';
import Stripe from 'stripe';
import { getSecret } from '#airo/secrets';
import { db } from '../../../db/client.js';
import { payments, orders } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';

const getStripe = () => {
  const secretKey = getSecret('STRIPE_SECRET_KEY');
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }
  return new Stripe(secretKey as string, {
    apiVersion: '2025-12-15.clover',
  });
};

export default async function handler(req: Request, res: Response) {
  try {
    const { orderId, reason } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    // Find the payment for this order
    const paymentResult = await db
      .select()
      .from(payments)
      .where(eq(payments.orderId, orderId))
      .limit(1);

    if (!paymentResult.length) {
      return res.status(404).json({ error: 'Payment not found for this order' });
    }

    const payment = paymentResult[0];

    if (payment.status === 'REFUNDED') {
      return res.status(400).json({ error: 'Payment already refunded' });
    }

    if (payment.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Only completed payments can be refunded' });
    }

    if (!payment.stripePaymentIntentId) {
      return res.status(400).json({ error: 'No Stripe payment intent found' });
    }

    const stripe = getStripe();

    // Create refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      reason: reason || 'requested_by_customer',
    });

    // Update payment status
    await db
      .update(payments)
      .set({ status: 'REFUNDED' })
      .where(eq(payments.id, payment.id));

    // Update order status
    await db
      .update(orders)
      .set({ status: 'REFUNDED' })
      .where(eq(orders.id, orderId));

    res.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount,
        status: refund.status,
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
