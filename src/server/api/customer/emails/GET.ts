import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { emailLogs, users } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user email
    const userResult = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userResult.length) {
      return res.json([]);
    }

    const userEmail = userResult[0].email;

    // Get emails sent to this user
    const customerEmails = await db
      .select({
        id: emailLogs.id,
        subject: emailLogs.subject,
        status: emailLogs.status,
        sentAt: emailLogs.sentAt,
        metadata: emailLogs.metadata,
      })
      .from(emailLogs)
      .where(eq(emailLogs.recipientEmail, userEmail))
      .orderBy(emailLogs.createdAt);

    // Extract emailType from metadata
    const formattedEmails = customerEmails.map(email => ({
      id: email.id,
      subject: email.subject,
      status: email.status,
      emailType: (email.metadata as any)?.emailType || 'general',
      sentAt: email.sentAt,
    }));

    res.json(formattedEmails);
  } catch (error) {
    console.error('Error fetching customer emails:', error);
    res.status(500).json({ 
      error: 'Failed to fetch emails', 
      message: error instanceof Error ? error.message : String(error) 
    });
  }
}
