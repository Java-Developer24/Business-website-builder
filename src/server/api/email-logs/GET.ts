import type { Request, Response } from 'express';
import { getEmailLogs } from '../../lib/email-service.js';

export default async function handler(req: Request, res: Response) {
  try {
    const { status, emailType, recipient, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    const { logs, total } = await getEmailLogs({
      status: status as string | undefined,
      emailType: emailType as string | undefined,
      recipient: recipient as string | undefined,
      limit: limitNum,
      offset,
    });

    res.json({
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching email logs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch email logs', 
      message: error instanceof Error ? error.message : String(error) 
    });
  }
}
