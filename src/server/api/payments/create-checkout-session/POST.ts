import type { Request, Response } from 'express';
import Stripe from 'stripe';
import { getSecret } from '#airo/secrets';
import { db } from '../../../db/client.js';
import { products, services } from '../../../db/schema.js';
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

interface CheckoutItem {
  type: 'product' | 'service';
  id: number;
  quantity?: number;
}

interface CheckoutRequest {
  items: CheckoutItem[];
  customerId?: number;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
  appointmentId?: number; // For service bookings
}

export default async function handler(req: Request, res: Response) {
  try {
    const { items, customerId, customerEmail, successUrl, cancelUrl, appointmentId }: CheckoutRequest = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items provided' });
    }

    if (!successUrl || !cancelUrl) {
      return res.status(400).json({ error: 'Success and cancel URLs are required' });
    }

    const stripe = getStripe();
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    // Process each item
    for (const item of items) {
      if (item.type === 'product') {
        // Fetch product details
        const productResult = await db
          .select()
          .from(products)
          .where(eq(products.id, item.id))
          .limit(1);

        if (!productResult.length) {
          return res.status(404).json({ error: `Product ${item.id} not found` });
        }

        const product = productResult[0];

        if (!product.isActive) {
          return res.status(400).json({ error: `Product ${product.name} is not available` });
        }

        // Stock checking would go here if needed

        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: product.description || undefined,
            },
            unit_amount: Math.round(parseFloat(product.price) * 100), // Convert to cents
          },
          quantity: item.quantity || 1,
        });
      } else if (item.type === 'service') {
        // Fetch service details
        const serviceResult = await db
          .select()
          .from(services)
          .where(eq(services.id, item.id))
          .limit(1);

        if (!serviceResult.length) {
          return res.status(404).json({ error: `Service ${item.id} not found` });
        }

        const service = serviceResult[0];

        if (!service.isActive) {
          return res.status(400).json({ error: `Service ${service.name} is not available` });
        }

        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: service.name,
              description: service.description || undefined,
            },
            unit_amount: Math.round(parseFloat(service.price) * 100), // Convert to cents
          },
          quantity: 1, // Services are typically one-time bookings
        });
      }
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      metadata: {
        customerId: customerId?.toString() || '',
        appointmentId: appointmentId?.toString() || '',
        items: JSON.stringify(items),
      },
    });

    res.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session', 
      message: error instanceof Error ? error.message : String(error) 
    });
  }
}
