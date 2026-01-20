import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { payments } from '../../../db/schema.js';
import { sql } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    // Get payment statistics
    const stats = await db
      .select({
        totalRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${payments.status} = 'completed' THEN ${payments.amount} ELSE 0 END), 0)`,
        successfulPayments: sql<number>`COUNT(CASE WHEN ${payments.status} = 'completed' THEN 1 END)`,
        pendingPayments: sql<number>`COUNT(CASE WHEN ${payments.status} = 'pending' THEN 1 END)`,
        failedPayments: sql<number>`COUNT(CASE WHEN ${payments.status} = 'failed' THEN 1 END)`,
        refundedAmount: sql<number>`COALESCE(SUM(CASE WHEN ${payments.status} = 'refunded' THEN ${payments.amount} ELSE 0 END), 0)`,
      })
      .from(payments);

    const result = stats[0] || {
      totalRevenue: 0,
      successfulPayments: 0,
      pendingPayments: 0,
      failedPayments: 0,
      refundedAmount: 0,
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({
      error: 'Failed to fetch payment stats',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
