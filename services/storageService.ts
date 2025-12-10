import { Contact, EmailTemplate, SmtpConfig, EmailLog } from '../types';

const KEYS = {
  CONTACTS: 'mailflow_contacts',
  TEMPLATES: 'mailflow_templates',
  SMTP: 'mailflow_smtp',
  LOGS: 'mailflow_logs',
  USER: 'mailflow_user'
};

// Initial Data
const DEFAULT_TEMPLATE: EmailTemplate = {
  id: 'default-forex',
  name: 'Forex Broker Award Invitation',
  subject: 'Exclusive Invitation: Global Forex Excellence Awards 2024',
  htmlContent: `<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
  .container { max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
  .header { background-color: #1e3a8a; color: white; padding: 20px; text-align: center; }
  .content { padding: 30px; background-color: #fff; }
  .btn { display: inline-block; background-color: #d97706; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
  .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #666; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Global Forex Awards 2024</h1>
    </div>
    <div class="content">
      <h2>Dear Broker Partner,</h2>
      <p>We are delighted to nominate your firm for the <strong>"Best Emerging Broker"</strong> category at the upcoming Global Forex Excellence Awards.</p>
      <p>Your commitment to transparency and user experience has set a new standard in the industry.</p>
      <div style="text-align: center;">
        <a href="#" class="btn">Confirm Your Nomination</a>
      </div>
    </div>
    <div class="footer">
      <p>&copy; 2024 Forex Awards Committee. All rights reserved.</p>
      <p>123 Financial District, London, UK</p>
    </div>
  </div>
</body>
</html>`,
  lastModified: new Date().toISOString()
};

export const storageService = {
  // Contacts
  getContacts: (): Contact[] => {
    const data = localStorage.getItem(KEYS.CONTACTS);
    return data ? JSON.parse(data) : [];
  },
  saveContacts: (contacts: Contact[]) => {
    localStorage.setItem(KEYS.CONTACTS, JSON.stringify(contacts));
  },
  addContact: (contact: Contact) => {
    const contacts = storageService.getContacts();
    contacts.push(contact);
    storageService.saveContacts(contacts);
  },

  // Templates
  getTemplates: (): EmailTemplate[] => {
    const data = localStorage.getItem(KEYS.TEMPLATES);
    return data ? JSON.parse(data) : [DEFAULT_TEMPLATE];
  },
  saveTemplate: (template: EmailTemplate) => {
    const templates = storageService.getTemplates();
    const index = templates.findIndex(t => t.id === template.id);
    if (index >= 0) {
      templates[index] = template;
    } else {
      templates.push(template);
    }
    localStorage.setItem(KEYS.TEMPLATES, JSON.stringify(templates));
  },
  deleteTemplate: (id: string) => {
    const templates = storageService.getTemplates().filter(t => t.id !== id);
    localStorage.setItem(KEYS.TEMPLATES, JSON.stringify(templates));
  },

  // SMTP
  getSmtpConfig: (): SmtpConfig => {
    const data = localStorage.getItem(KEYS.SMTP);
    return data ? JSON.parse(data) : {
      host: 'smtp.gmail.com',
      port: 587,
      username: '',
      fromName: 'My Company',
      fromEmail: '',
      encryption: 'tls'
    };
  },
  saveSmtpConfig: (config: SmtpConfig) => {
    localStorage.setItem(KEYS.SMTP, JSON.stringify(config));
  },

  // Logs
  getLogs: (): EmailLog[] => {
    const data = localStorage.getItem(KEYS.LOGS);
    return data ? JSON.parse(data) : [];
  },
  addLog: (log: EmailLog) => {
    const logs = storageService.getLogs();
    // Keep only last 1000 logs
    if (logs.length > 1000) logs.shift();
    logs.push(log);
    localStorage.setItem(KEYS.LOGS, JSON.stringify(logs));
  },

  // Auth
  isAuthenticated: () => !!localStorage.getItem(KEYS.USER),
  login: () => localStorage.setItem(KEYS.USER, 'true'),
  logout: () => localStorage.removeItem(KEYS.USER)
};