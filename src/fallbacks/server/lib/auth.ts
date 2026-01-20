import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/client.js';
import { users, userRoles, refreshTokens } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const JWT_EXPIRES_IN = '15m'; // Access token expires in 15 minutes
const REFRESH_TOKEN_EXPIRES_IN = '7d'; // Refresh token expires in 7 days

export interface JWTPayload {
  userId: number;
  email: string;
  roles: string[];
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate access token
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Generate refresh token
export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
}

// Verify access token
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// Verify refresh token
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// Store refresh token in database
export async function storeRefreshToken(userId: number, token: string): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  await db.insert(refreshTokens).values({
    userId,
    token,
    expiresAt,
  });
}

// Revoke refresh token
export async function revokeRefreshToken(token: string): Promise<void> {
  await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
}

// Get user roles
export async function getUserRoles(userId: number): Promise<string[]> {
  const result = await db
    .select({
      roleName: userRoles.roleId,
    })
    .from(userRoles)
    .where(eq(userRoles.userId, userId));

  // Fetch role names
  const roleIds = result.map((r) => r.roleName);
  if (roleIds.length === 0) return [];

  const { roles } = await import('../db/schema.js');
  const roleNames = await db
    .select({ name: roles.name })
    .from(roles)
    .where(eq(roles.id, roleIds[0]));

  return roleNames.map((r) => r.name);
}

// Create user with role
export async function createUser(data: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  roleId: number;
}) {
  const hashedPassword = await hashPassword(data.password);

  // Insert user
  const result = await db.insert(users).values({
    email: data.email,
    password: hashedPassword,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
  });

  const userId = Number(result[0].insertId);

  // Assign role
  await db.insert(userRoles).values({
    userId,
    roleId: data.roleId,
  });

  // Fetch created user
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  return user;
}
