import type { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'branding-settings.json');

export default async function handler(req: Request, res: Response) {
  try {
    const settings = req.body;

    // Validate required fields
    if (!settings.businessName) {
      return res.status(400).json({ error: 'Business name is required' });
    }

    // Ensure data directory exists
    await fs.mkdir(path.dirname(SETTINGS_FILE), { recursive: true });

    // Save settings
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));

    res.json({ success: true, settings });
  } catch (error) {
    console.error('Error saving branding settings:', error);
    res.status(500).json({ error: 'Failed to save settings', message: String(error) });
  }
}
