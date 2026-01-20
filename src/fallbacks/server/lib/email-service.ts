import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  emailType?: string;
  relatedOrderId?: number;
  relatedAppointmentId?: number;
  metadata?: Record<string, any>;
}

interface EmailLog {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  htmlBody?: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  error?: string;
  emailType?: string;
  relatedOrderId?: number;
  relatedAppointmentId?: number;
  metadata?: Record<string, any>;
  sentAt?: string;
  createdAt: string;
}

const EMAIL_LOGS_DIR = '/private/email-logs';
const EMAIL_LOGS_FILE = path.join(EMAIL_LOGS_DIR, 'logs.json');

// Create email transport
const transport = nodemailer.createTransport({
  host: 'localhost',
  port: 25,
  secure: false,
});

// Ensure logs directory exists
async function ensureLogsDir() {
  try {
    await fs.mkdir(EMAIL_LOGS_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating email logs directory:', error);
  }
}

// Read logs from file
async function readLogs(): Promise<EmailLog[]> {
  try {
    await ensureLogsDir();
    const data = await fs.readFile(EMAIL_LOGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist yet
    return [];
  }
}

// Write logs to file
async function writeLogs(logs: EmailLog[]) {
  try {
    await ensureLogsDir();
    await fs.writeFile(EMAIL_LOGS_FILE, JSON.stringify(logs, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing email logs:', error);
  }
}

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Send email and log
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; logId: string; error?: string }> {
  const logId = generateId();
  const log: EmailLog = {
    id: logId,
    recipient: options.to,
    subject: options.subject,
    body: options.text,
    htmlBody: options.html,
    status: 'PENDING',
    emailType: options.emailType,
    relatedOrderId: options.relatedOrderId,
    relatedAppointmentId: options.relatedAppointmentId,
    metadata: options.metadata,
    createdAt: new Date().toISOString(),
  };

  // Save initial log
  const logs = await readLogs();
  logs.push(log);
  await writeLogs(logs);

  try {
    // Send email
    await transport.sendMail({
      from: 'noreply@airoapp.ai',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    // Update log as sent
    log.status = 'SENT';
    log.sentAt = new Date().toISOString();
    await writeLogs(logs);

    return { success: true, logId };
  } catch (error) {
    // Update log as failed
    log.status = 'FAILED';
    log.error = error instanceof Error ? error.message : String(error);
    await writeLogs(logs);

    console.error('Error sending email:', error);
    return { success: false, logId, error: log.error };
  }
}

// Get all logs with optional filters
export async function getEmailLogs(filters?: {
  status?: string;
  emailType?: string;
  recipient?: string;
  limit?: number;
  offset?: number;
}): Promise<{ logs: EmailLog[]; total: number }> {
  let logs = await readLogs();

  // Apply filters
  if (filters?.status) {
    logs = logs.filter(log => log.status === filters.status);
  }
  if (filters?.emailType) {
    logs = logs.filter(log => log.emailType === filters.emailType);
  }
  if (filters?.recipient) {
    logs = logs.filter(log => log.recipient.toLowerCase().includes(filters.recipient!.toLowerCase()));
  }

  const total = logs.length;

  // Sort by creation date (newest first)
  logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Apply pagination
  if (filters?.offset !== undefined) {
    logs = logs.slice(filters.offset);
  }
  if (filters?.limit !== undefined) {
    logs = logs.slice(0, filters.limit);
  }

  return { logs, total };
}

// Get single log by ID
export async function getEmailLog(id: string): Promise<EmailLog | null> {
  const logs = await readLogs();
  return logs.find(log => log.id === id) || null;
}

// Resend email
export async function resendEmail(logId: string): Promise<{ success: boolean; newLogId: string; error?: string }> {
  const log = await getEmailLog(logId);
  if (!log) {
    return { success: false, newLogId: '', error: 'Email log not found' };
  }

  const result = await sendEmail({
    to: log.recipient,
    subject: log.subject,
    text: log.body,
    html: log.htmlBody,
    emailType: log.emailType,
    relatedOrderId: log.relatedOrderId,
    relatedAppointmentId: log.relatedAppointmentId,
    metadata: { ...log.metadata, resendOf: logId },
  });

  return { success: result.success, newLogId: result.logId, error: result.error };
}
