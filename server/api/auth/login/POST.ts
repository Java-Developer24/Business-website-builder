import type { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../../db/client.js';
import { users, userRoles, roles } from '../../../db/schema.js';
import {
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
} from '../../../lib/auth.js';
import { eq } from 'drizzle-orm';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default async function handler(req: Request, res: Response) {
  try {
    // Validate request body
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors,
      });
    }

    const { email, password } = validationResult.data;

    // Find user
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is suspended
    if (user.isSuspended) {
      return res.status(403).json({ error: 'Account suspended' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ error: 'Account inactive' });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
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

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      roles: roleNames,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      roles: roleNames,
    });

    // Store refresh token
    await storeRefreshToken(user.id, refreshToken);

    // Update last login
    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

    // Return user data (without password) and tokens
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
      accessToken,
      refreshToken,
      roles: roleNames,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', message: String(error) });
  }
}
