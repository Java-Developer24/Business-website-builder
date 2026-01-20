import type { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../../db/client.js';
import { users, roles } from '../../../db/schema.js';
import { createUser, generateAccessToken, generateRefreshToken, storeRefreshToken } from '../../../lib/auth.js';
import { eq } from 'drizzle-orm';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'STAFF', 'CUSTOMER']).default('CUSTOMER'),
});

export default async function handler(req: Request, res: Response) {
  try {
    // Validate request body
    const validationResult = registerSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors,
      });
    }

    const { email, password, firstName, lastName, phone, role } = validationResult.data;

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Get role ID
    const [roleRecord] = await db.select().from(roles).where(eq(roles.name, role)).limit(1);
    if (!roleRecord) {
      return res.status(500).json({ error: 'Role not found' });
    }

    // Create user
    const user = await createUser({
      email,
      password,
      firstName,
      lastName,
      phone,
      roleId: roleRecord.id,
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      roles: [role],
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      roles: [role],
    });

    // Store refresh token
    await storeRefreshToken(user.id, refreshToken);

    // Return user data (without password) and tokens
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed', message: String(error) });
  }
}
