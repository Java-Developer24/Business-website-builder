import type { Request, Response } from 'express';
import Stripe from 'stripe';
import { getSecret } from '#airo/secrets';
import { db } from '../../../db/client.js';
import { orders, orderItems, payments, products, appointments, customers, users } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { sendEmail } from '../../../lib/email-service.js';
import { generateOrderConfirmationEmail, generatePaymentReceiptEmail } from '../../../lib/email-templates.js';

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

export default async function handler(req: Request, res: Response) {
  const stripe = getStripe();
  const webhookSecret = getSecret('STRIPE_WEBHOOK_SECRET');
  
  if (!webhookSecret) {
    console.warn('STRIPE_WEBHOOK_SECRET not configured - webhook signature verification disabled');
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature if secret is configured
    if (webhookSecret) {
      const signature = req.headers['stripe-signature'];
      if (!signature) {
        return res.status(400).json({ error: 'Missing stripe-signature header' });
      }

      event = stripe.webhooks.constructEvent(
        req.body,
        signature as string,
        webhookSecret as string
      );
    } else {
      // For development without webhook secret
      event = req.body as Stripe.Event;
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(paymentIntent);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(charge);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout session completed:', session.id);

  const metadata = session.metadata || {};
  const customerId = metadata.customerId ? parseInt(metadata.customerId) : null;
  const appointmentId = metadata.appointmentId ? parseInt(metadata.appointmentId) : null;
  const items: CheckoutItem[] = metadata.items ? JSON.parse(metadata.items) : [];

  // Calculate totals
  const amountTotal = session.amount_total || 0;
  const subtotal = (amountTotal / 100).toFixed(2); // Convert from cents
  const total = subtotal;

  // Generate order number
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // Create order
  const orderResult = await db.insert(orders).values({
    orderNumber,
    customerId,
    status: 'PROCESSING',
    subtotal,
    tax: '0.00',
    shipping: '0.00',
    discount: '0.00',
    total,
    notes: `Stripe Session: ${session.id}\nPayment Intent: ${session.payment_intent || 'N/A'}\nCustomer: ${session.customer_details?.name || session.customer_email || 'Guest'}`,
  });

  const orderId = Number(orderResult[0].insertId);

  // Create order items
  for (const item of items) {
    if (item.type === 'product') {
      const productResult = await db
        .select()
        .from(products)
        .where(eq(products.id, item.id))
        .limit(1);

      if (productResult.length) {
        const product = productResult[0];
        const quantity = item.quantity || 1;
        const price = product.price;
        const subtotal = (parseFloat(price) * quantity).toFixed(2);

        await db.insert(orderItems).values({
          orderId,
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          quantity,
          price,
          subtotal,
        });

        // Inventory update would go here if needed
      }
    }
  }

  // Create payment record
  await db.insert(payments).values({
    orderId,
    amount: total,
    currency: session.currency?.toUpperCase() || 'USD',
    status: 'COMPLETED',
    paymentMethod: 'STRIPE',
    transactionId: session.id,
    stripePaymentIntentId: session.payment_intent as string || null,
    metadata: {
      stripeSessionId: session.id,
      customerEmail: session.customer_email || session.customer_details?.email,
      customerName: session.customer_details?.name,
    },
  });

  // Update appointment if linked
  if (appointmentId) {
    await db
      .update(appointments)
      .set({ status: 'CONFIRMED' })
      .where(eq(appointments.id, appointmentId));
  }

  console.log(`Order ${orderNumber} created successfully`);

  // Send order confirmation email
  try {
    // Get customer info
    let customerEmail = session.customer_email || session.customer_details?.email;
    let customerName = session.customer_details?.name || 'Customer';

    if (customerId) {
      const customerResult = await db
        .select({
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
        })
        .from(customers)
        .innerJoin(users, eq(customers.userId, users.id))
        .where(eq(customers.id, customerId))
        .limit(1);

      if (customerResult.length) {
        customerEmail = customerResult[0].email;
        customerName = `${customerResult[0].firstName} ${customerResult[0].lastName}`;
      }
    }

    if (customerEmail) {
      // Get order items for email
      const orderItemsResult = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, orderId));

      const emailData = generateOrderConfirmationEmail({
        orderNumber,
        customerName,
        orderDate: new Date().toISOString(),
        items: orderItemsResult.map(item => ({
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
        })),
        subtotal,
        tax: '0.00',
        shipping: '0.00',
        total,
      });

      await sendEmail({
        to: customerEmail,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html,
        emailType: 'order_confirmation',
        relatedOrderId: orderId,
      });

      // Send payment receipt
      const receiptData = generatePaymentReceiptEmail({
        orderNumber,
        customerName,
        paymentDate: new Date().toISOString(),
        amount: total,
        paymentMethod: 'Stripe',
        transactionId: session.id,
      });

      await sendEmail({
        to: customerEmail,
        subject: receiptData.subject,
        text: receiptData.text,
        html: receiptData.html,
        emailType: 'payment_receipt',
        relatedOrderId: orderId,
      });
    }
  } catch (emailError) {
    console.error('Error sending order emails:', emailError);
    // Don't fail the webhook if email fails
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment intent succeeded:', paymentIntent.id);

  // Update payment status
  const paymentResult = await db
    .select()
    .from(payments)
    .where(eq(payments.stripePaymentIntentId, paymentIntent.id))
    .limit(1);

  if (paymentResult.length) {
    const currentMetadata = paymentResult[0].metadata as any || {};
    await db
      .update(payments)
      .set({ 
        status: 'COMPLETED',
        metadata: {
          ...currentMetadata,
          stripeChargeId: paymentIntent.latest_charge as string || null,
        },
      })
      .where(eq(payments.id, paymentResult[0].id));
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment intent failed:', paymentIntent.id);

  // Update payment status
  const paymentResult = await db
    .select()
    .from(payments)
    .where(eq(payments.stripePaymentIntentId, paymentIntent.id))
    .limit(1);

  if (paymentResult.length) {
    await db
      .update(payments)
      .set({ status: 'FAILED' })
      .where(eq(payments.id, paymentResult[0].id));

    // Update order status
    if (paymentResult[0].orderId) {
      await db
        .update(orders)
        .set({ status: 'CANCELLED' })
        .where(eq(orders.id, paymentResult[0].orderId));
    }
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  console.log('Charge refunded:', charge.id);

  // Find payment by charge ID in metadata
  const allPayments = await db.select().from(payments);
  const payment = allPayments.find(p => {
    const metadata = p.metadata as any;
    return metadata?.stripeChargeId === charge.id;
  });

  if (payment) {
    // Update payment status
    await db
      .update(payments)
      .set({ status: 'REFUNDED' })
      .where(eq(payments.id, payment.id));

    // Update order status
    if (payment.orderId) {
      await db
        .update(orders)
        .set({ status: 'REFUNDED' })
        .where(eq(orders.id, payment.orderId));
    }

    console.log(`Order ${payment.orderId} marked as refunded`);
  }
}
