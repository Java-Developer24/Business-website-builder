import type { Request, Response } from 'express';
import { resendEmail } from '../../../lib/email-service.js';

export default async function handler(req: Request, res: Response) {
  try {
    const { logId } = req.body;

    if (!logId) {
      return res.status(400).json({ error: 'Log ID is required' });
    }

    const result = await resendEmail(logId);

    if (!result.success) {
      return res.status(400).json({ error: result.error || 'Failed to resend email' });
    }

    res.json({ success: true, newLogId: result.newLogId });
  } catch (error) {
    console.error('Error resending email:', error);
    res.status(500).json({ 
      error: 'Failed to resend email', 
      message: error instanceof Error ? error.message : String(error) 
    });
  }
}
