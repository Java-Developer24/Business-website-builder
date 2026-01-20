import type { Request, Response } from 'express';
import { getEmailLog } from '../../../lib/email-service.js';

export default async function handler(req: Request, res: Response) {
  try {
    const { logId } = req.params;

    if (!logId) {
      return res.status(400).json({ error: 'Log ID is required' });
    }

    const log = await getEmailLog(logId);

    if (!log) {
      return res.status(404).json({ error: 'Email log not found' });
    }

    res.json(log);
  } catch (error) {
    console.error('Error fetching email log:', error);
    res.status(500).json({ 
      error: 'Failed to fetch email log', 
      message: error instanceof Error ? error.message : String(error) 
    });
  }
}
