import type { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../../db/client.js';
import { refreshTokens, users, userRoles, roles } from '../../../db/schema.js';
import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  revokeRefreshToken,
} from '../../../lib/auth.js';
import { eq } from 'drizzle-orm';

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export default async function handler(req: Request, res: Response) {
  try {
    // Validate request body
    const validationResult = refreshSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors,
      });
    }

    const { refreshToken: token } = validationResult.data;

    // Verify refresh token
    const payload = verifyRefreshToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // Check if refresh token exists in database
    const [tokenRecord] = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token, token))
      .limit(1);

    if (!tokenRecord) {
      return res.status(401).json({ error: 'Refresh token not found' });
    }

    // Check if token is expired
    if (new Date() > tokenRecord.expiresAt) {
      await revokeRefreshToken(token);
      return res.status(401).json({ error: 'Refresh token expired' });
    }

    // Get user
    const [user] = await db.select().from(users).where(eq(users.id, payload.userId)).limit(1);

    if (!user || !user.isActive || user.isSuspended) {
      return res.status(403).json({ error: 'User account is not active' });
    }

    // Get user roles
    const userRoleRecords = await db
      .select({ roleId: userRoles.roleId })
      .from(userRoles)
      .where(eq(userRoles.userId, user.id));

    const roleIds = userRoleRecords.map((r) => r.roleId);
    const roleNames: string[] = [];

    for (const roleId of roleIds) {
      const [role] = await db.select({ name: roles.name }).from(roles).where(eq(roles.id, roleId)).limit(1);
      if (role) {
        roleNames.push(role.name);
      }
    }

    // Revoke old refresh token
    await revokeRefreshToken(token);

    // Generate new tokens
    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      roles: roleNames,
    });

    const newRefreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      roles: roleNames,
    });

    // Store new refresh token
    await storeRefreshToken(user.id, newRefreshToken);

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Token refresh failed', message: String(error) });
  }
}
