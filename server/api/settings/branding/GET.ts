import type { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'branding-settings.json');

const DEFAULT_SETTINGS = {
  businessName: 'Business Platform',
  tagline: 'Your business tagline',
  logo: '',
  favicon: '',
  primaryColor: '#0ea5e9',
  secondaryColor: '#64748b',
  accentColor: '#f59e0b',
  fontHeading: 'Inter',
  fontBody: 'Inter',
};

export default async function handler(req: Request, res: Response) {
  try {
    // Ensure data directory exists
    await fs.mkdir(path.dirname(SETTINGS_FILE), { recursive: true });

    // Try to read existing settings
    try {
      const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
      const settings = JSON.parse(data);
      res.json(settings);
    } catch (error) {
      // File doesn't exist, return defaults
      res.json(DEFAULT_SETTINGS);
    }
  } catch (error) {
    console.error('Error reading branding settings:', error);
    res.status(500).json({ error: 'Failed to read settings', message: String(error) });
  }
}
