import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { geminiService } from '../services/geminiService';
import { Contact, EmailTemplate } from '../types';
import { Send, Users, FileText, CheckCircle, AlertTriangle, Play, Loader2 } from 'lucide-react';

const SendMail = () => {
  const [step, setStep] = useState(1);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  
  // Selection
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  
  // Sending State
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, success: 0, failed: 0 });
  const [logs, setLog] = useState<string[]>([]);
  const [spamScore, setSpamScore] = useState<string | null>(null);

  useEffect(() => {
    setContacts(storageService.getContacts());
    setTemplates(storageService.getTemplates());
  }, []);

  const toggleContact = (id: string) => {
    const newSet = new Set(selectedContactIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedContactIds(newSet);
  };

  const toggleAll = () => {
    if (selectedContactIds.size === contacts.length) setSelectedContactIds(new Set());
    else setSelectedContactIds(new Set(contacts.map(c => c.id)));
  };

  const analyzeSpam = async () => {
    const tmpl = templates.find(t => t.id === selectedTemplateId);
    if (!tmpl) return;
    setSpamScore("Analyzing with AI...");
    const result = await geminiService.analyzeSpamScore(tmpl.subject, tmpl.htmlContent);
    setSpamScore(result);
  };

  const startSending = async () => {
    const recipients = contacts.filter(c => selectedContactIds.has(c.id));
    const template = templates.find(t => t.id === selectedTemplateId);
    
    if (!recipients.length || !template) return;

    setIsSending(true);
    setProgress({ current: 0, total: recipients.length, success: 0, failed: 0 });
    setLog([]);

    // Simulating SMTP Delay
    for (let i = 0; i < recipients.length; i++) {
      const contact = recipients[i];
      setProgress(prev => ({ ...prev, current: i + 1 }));
      
      // Simulate network request
      await new Promise(r => setTimeout(r, 800 + Math.random() * 1000));
      
      const success = Math.random() > 0.1; // 90% success rate simulation
      
      storageService.addLog({
        id: Math.random().toString(),
        recipient: contact.email,
        subject: template.subject,
        status: success ? 'sent' : 'failed',
        timestamp: new Date().toISOString()
      });

      if (success) {
        setProgress(prev => ({ ...prev, success: prev.success + 1 }));
        setLog(prev => [`[SUCCESS] Sent to ${contact.email}`, ...prev]);
      } else {
        setProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
        setLog(prev => [`[ERROR] Failed to send to ${contact.email} (SMTP Timeout)`, ...prev]);
      }
    }
    
    setIsSending(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Send Campaign</h1>

      {/* Steps */}
      <div className="flex items-center space-x-4 mb-8">
        <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>
           <span className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold border-current">1</span>
           <span className="font-medium">Select Recipients</span>
        </div>
        <div className="h-px bg-slate-300 w-16"></div>
        <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>
           <span className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold border-current">2</span>
           <span className="font-medium">Choose Template</span>
        </div>
        <div className="h-px bg-slate-300 w-16"></div>
        <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-blue-600' : 'text-slate-400'}`}>
           <span className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold border-current">3</span>
           <span className="font-medium">Send</span>
        </div>
      </div>

      {/* Step 1: Recipients */}
      {step === 1 && (
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Select Contacts</h3>
            <div className="space-x-2">
              <span className="text-sm text-slate-500">{selectedContactIds.size} selected</span>
              <button onClick={toggleAll} className="text-blue-600 text-sm hover:underline">Select All</button>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto border rounded-lg">
            {contacts.map(c => (
              <div key={c.id} onClick={() => toggleContact(c.id)} className={`flex items-center p-3 border-b cursor-pointer hover:bg-slate-50 ${selectedContactIds.has(c.id) ? 'bg-blue-50' : ''}`}>
                <div className={`w-5 h-5 rounded border mr-3 flex items-center justify-center ${selectedContactIds.has(c.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                  {selectedContactIds.has(c.id) && <CheckCircle size={14} className="text-white" />}
                </div>
                <div>
                  <div className="font-medium">{c.email}</div>
                  <div className="text-xs text-slate-500">{c.name}</div>
                </div>
              </div>
            ))}
            {contacts.length === 0 && <div className="p-8 text-center text-slate-400">No contacts found. Go to 'Contact Lists' to add some.</div>}
          </div>
          <div className="mt-6 flex justify-end">
            <button 
              disabled={selectedContactIds.size === 0}
              onClick={() => setStep(2)} 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Step
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Template */}
      {step === 2 && (
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-bold text-lg mb-4">Select Email Template</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-1">
             {templates.map(t => (
               <div 
                 key={t.id} 
                 onClick={() => setSelectedTemplateId(t.id)}
                 className={`border rounded-lg p-4 cursor-pointer transition ${selectedTemplateId === t.id ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50' : 'hover:border-blue-300'}`}
               >
                 <div className="font-bold text-slate-700 mb-2 truncate">{t.name}</div>
                 <div className="text-xs text-slate-500 mb-2">Subject: {t.subject}</div>
                 <div className="h-20 bg-white border border-slate-100 rounded overflow-hidden text-[8px] text-slate-300 p-1 select-none">
                    Preview: {t.htmlContent.substring(0, 100)}...
                 </div>
               </div>
             ))}
          </div>
          <div className="mt-6 flex justify-between">
            <button onClick={() => setStep(1)} className="text-slate-500 hover:text-slate-800">Back</button>
            <button 
              disabled={!selectedTemplateId}
              onClick={() => setStep(3)} 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Step
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Final Review & Send */}
      {step === 3 && (
        <div className="bg-white p-6 rounded-xl shadow-sm">
          {!isSending && progress.total === 0 ? (
            <>
              <h3 className="font-bold text-lg mb-4">Review Campaign</h3>
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Users className="text-slate-400" />
                    <div>
                      <div className="text-sm text-slate-500">Recipients</div>
                      <div className="font-bold">{selectedContactIds.size} Contacts Selected</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="text-slate-400" />
                    <div>
                      <div className="text-sm text-slate-500">Template</div>
                      <div className="font-bold">{templates.find(t => t.id === selectedTemplateId)?.name}</div>
                    </div>
                  </div>
                </div>
                
                {/* AI Spam Check */}
                <div className="border border-purple-100 bg-purple-50 p-4 rounded-lg">
                   <div className="flex justify-between items-start">
                     <div>
                       <h4 className="font-bold text-purple-900 flex items-center gap-2"><Users size={16}/> AI Inbox Delivery Check</h4>
                       <p className="text-sm text-purple-700 mt-1">{spamScore || "Click analyze to check if this email will hit the inbox or spam folder."}</p>
                     </div>
                     {!spamScore && (
                       <button onClick={analyzeSpam} className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700">Analyze</button>
                     )}
                   </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                 <button onClick={() => setStep(2)} className="text-slate-500 hover:text-slate-800">Back</button>
                 <button onClick={startSending} className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-700 flex items-center space-x-2">
                   <Send size={18} />
                   <span>Start Sending</span>
                 </button>
              </div>
            </>
          ) : (
            // Sending Progress Screen
            <div className="text-center py-8">
               <h3 className="text-xl font-bold mb-6">Sending Campaign...</h3>
               
               <div className="mb-4 flex justify-between text-sm text-slate-600 px-10">
                 <span>Progress: {progress.current} / {progress.total}</span>
                 <span>{(progress.current / progress.total * 100).toFixed(0)}%</span>
               </div>
               <div className="w-full bg-slate-200 rounded-full h-4 mb-8 mx-auto max-w-2xl overflow-hidden">
                 <div className="bg-blue-600 h-4 rounded-full transition-all duration-300" style={{ width: `${(progress.current / progress.total) * 100}%` }}></div>
               </div>

               <div className="flex justify-center gap-8 mb-8">
                 <div className="text-emerald-600 font-bold">Success: {progress.success}</div>
                 <div className="text-red-600 font-bold">Failed: {progress.failed}</div>
               </div>

               <div className="bg-slate-900 text-left p-4 rounded-lg h-48 overflow-y-auto font-mono text-xs text-green-400 mx-auto max-w-2xl shadow-inner">
                 {logs.map((l, i) => <div key={i}>{l}</div>)}
                 {!isSending && progress.total > 0 && <div className="text-white mt-2">--- Campaign Completed ---</div>}
               </div>

               {!isSending && (
                 <button onClick={() => { setStep(1); setSelectedContactIds(new Set()); }} className="mt-8 bg-slate-800 text-white px-6 py-2 rounded-lg">Start New Campaign</button>
               )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SendMail;