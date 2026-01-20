import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { users, userRoles, roles } from '../../../db/schema.js';
import { authenticate } from '../../../middleware/auth.js';
import { eq } from 'drizzle-orm';

// This route requires authentication middleware
export const middleware = [authenticate];

export default async function handler(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user
    const [user] = await db.select().from(users).where(eq(users.id, req.user.userId)).limit(1);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
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

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
      roles: roleNames,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user', message: String(error) });
  }
}
