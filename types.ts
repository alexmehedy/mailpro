export interface Contact {
  id: string;
  email: string;
  name?: string;
  company?: string;
  status: 'active' | 'bounced' | 'unsubscribed';
  addedAt: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  lastModified: string;
}

export interface SmtpConfig {
  host: string;
  port: number;
  username: string;
  password?: string; // Stored insecurely in localstorage for demo only
  fromName: string;
  fromEmail: string;
  encryption: 'tls' | 'ssl' | 'none';
}

export interface EmailLog {
  id: string;
  recipient: string;
  subject: string;
  status: 'sent' | 'failed' | 'opened' | 'clicked';
  timestamp: string;
}

export interface DashboardStats {
  totalSent: number;
  openRate: number;
  clickRate: number;
  bounced: number;
}