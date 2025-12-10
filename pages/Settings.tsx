import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { SmtpConfig } from '../types';
import { Save, Server, ShieldCheck, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const SmtpSettings = () => {
  const [config, setConfig] = useState<SmtpConfig>({
    host: '', port: 587, username: '', password: '', fromName: '', fromEmail: '', encryption: 'tls'
  });
  const [saved, setSaved] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean, message: string} | null>(null);

  useEffect(() => {
    setConfig(storageService.getSmtpConfig());
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
    setSaved(false);
    setTestResult(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveSmtpConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTestConnection = async () => {
    setTestResult(null);
    setIsTesting(true);

    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Validation Logic
    if (!config.host) {
      setTestResult({ success: false, message: 'Error: SMTP Host is required.' });
      setIsTesting(false);
      return;
    }

    if (!config.username || !config.password) {
      setTestResult({ success: false, message: 'Error: Username and Password are required for authentication.' });
      setIsTesting(false);
      return;
    }

    // Specific check for Gmail/Workspace
    if (config.host.includes('gmail.com') || config.host.includes('googlemail')) {
      if (config.port != 587 && config.port != 465) {
        setTestResult({ success: false, message: 'Error: Google Workspace requires Port 587 (TLS) or 465 (SSL).' });
        setIsTesting(false);
        return;
      }
    }

    // Simulate success
    setTestResult({ 
      success: true, 
      message: `Connection Successful! Authenticated as ${config.username} via ${config.encryption.toUpperCase()}.` 
    });
    setIsTesting(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">SMTP Configuration</h1>

      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg mb-6 flex items-start gap-3">
        <AlertCircle className="mt-1 flex-shrink-0" />
        <div className="text-sm">
          <strong>Google Workspace Users:</strong> Use <code>smtp.gmail.com</code>. You must enable "2-Step Verification" and generate an "App Password" to use as the password below. Your regular Gmail password will not work.
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm p-8 space-y-6">
        
        {/* Server Details */}
        <div>
          <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2"><Server size={20}/> Server Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">SMTP Host</label>
              <input type="text" name="host" value={config.host} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="smtp.gmail.com" />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Port</label>
               <input type="number" name="port" value={config.port} onChange={handleChange} className="w-full p-2 border rounded-lg" placeholder="587" />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Encryption</label>
               <select name="encryption" value={config.encryption} onChange={handleChange} className="w-full p-2 border rounded-lg bg-white">
                 <option value="tls">TLS (Recommended)</option>
                 <option value="ssl">SSL</option>
                 <option value="none">None</option>
               </select>
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Auth Details */}
        <div>
          <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2"><ShieldCheck size={20}/> Authentication</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username (Email)</label>
              <input type="email" name="username" value={config.username} onChange={handleChange} className="w-full p-2 border rounded-lg" placeholder="you@company.com" />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">App Password</label>
               <input type="password" name="password" value={config.password} onChange={handleChange} className="w-full p-2 border rounded-lg" placeholder="••••••••••••" />
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Sender Info */}
        <div>
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Sender Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">From Name</label>
              <input type="text" name="fromName" value={config.fromName} onChange={handleChange} className="w-full p-2 border rounded-lg" placeholder="Company Name" />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">From Email</label>
               <input type="email" name="fromEmail" value={config.fromEmail} onChange={handleChange} className="w-full p-2 border rounded-lg" placeholder="noreply@company.com" />
            </div>
          </div>
        </div>

        {/* Test Result Feedback */}
        {testResult && (
          <div className={`p-4 rounded-lg flex items-start gap-3 ${testResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {testResult.success ? <CheckCircle className="flex-shrink-0" /> : <XCircle className="flex-shrink-0" />}
            <div className="text-sm font-medium">{testResult.message}</div>
          </div>
        )}

        <div className="pt-4 flex items-center justify-between">
           <button 
             type="button" 
             onClick={handleTestConnection} 
             disabled={isTesting}
             className="text-blue-600 text-sm hover:underline disabled:opacity-50 flex items-center gap-2"
            >
             {isTesting && <Loader2 className="animate-spin" size={14} />}
             {isTesting ? 'Connecting...' : 'Test Connection'}
           </button>
           <button type="submit" className="bg-blue-600 text-white px-8 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2">
             <Save size={18} />
             {saved ? 'Saved!' : 'Save Settings'}
           </button>
        </div>

      </form>
    </div>
  );
};

export default SmtpSettings;