import type { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'general-settings.json');

export default async function handler(req: Request, res: Response) {
  try {
    const { type, settings } = req.body;

    if (!type || !settings) {
      return res.status(400).json({ error: 'Type and settings are required' });
    }

    // Ensure data directory exists
    await fs.mkdir(path.dirname(SETTINGS_FILE), { recursive: true });

    // Read existing settings
    let allSettings: any = {};
    try {
      const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
      allSettings = JSON.parse(data);
    } catch (error) {
      // File doesn't exist yet, start with empty object
    }

    // Update the specific settings type
    allSettings[type] = settings;

    // Write back to file
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(allSettings, null, 2));

    res.json({ success: true, settings: allSettings });
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({ error: 'Failed to save settings' });
  }
}
