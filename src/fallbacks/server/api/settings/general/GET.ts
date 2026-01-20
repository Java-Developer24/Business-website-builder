import type { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'general-settings.json');

interface Settings {
  business?: any;
  email?: any;
  payment?: any;
}

export default async function handler(req: Request, res: Response) {
  try {
    // Ensure data directory exists
    await fs.mkdir(path.dirname(SETTINGS_FILE), { recursive: true });

    // Try to read existing settings
    let settings: Settings = {};
    try {
      const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
      settings = JSON.parse(data);
    } catch (error) {
      // File doesn't exist yet, return empty settings
      settings = {
        business: {
          businessName: '',
          businessEmail: '',
          businessPhone: '',
          businessAddress: '',
          businessCity: '',
          businessState: '',
          businessZip: '',
          businessCountry: '',
          taxId: '',
          currency: 'USD',
          timezone: 'America/New_York',
        },
        email: {
          smtpHost: '',
          smtpPort: '587',
          smtpUser: '',
          smtpPassword: '',
          smtpSecure: true,
          fromEmail: '',
          fromName: '',
        },
        payment: {
          stripePublishableKey: '',
          stripeSecretKey: '',
          stripeWebhookSecret: '',
          paymentMethods: ['card'],
          currency: 'USD',
        },
      };
    }

    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
}
