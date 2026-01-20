import type { Request, Response } from 'express';
import { z } from 'zod';
import { revokeRefreshToken } from '../../../lib/auth.js';

const logoutSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export default async function handler(req: Request, res: Response) {
  try {
    // Validate request body
    const validationResult = logoutSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors,
      });
    }

    const { refreshToken } = validationResult.data;

    // Revoke refresh token
    await revokeRefreshToken(refreshToken);

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed', message: String(error) });
  }
}
