import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { Contact } from '../types';
import { Upload, Plus, Trash2, FileText, Check, AlertCircle, Users } from 'lucide-react';

const Contacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [mode, setMode] = useState<'list' | 'add' | 'upload' | 'paste'>('list');
  
  // Inputs
  const [singleEmail, setSingleEmail] = useState('');
  const [singleName, setSingleName] = useState('');
  const [pasteData, setPasteData] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');

  useEffect(() => {
    setContacts(storageService.getContacts());
  }, []);

  const refresh = () => setContacts(storageService.getContacts());

  const handleAddSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleEmail) return;
    
    storageService.addContact({
      id: Date.now().toString(),
      email: singleEmail,
      name: singleName,
      status: 'active',
      addedAt: new Date().toISOString()
    });
    
    setSingleEmail('');
    setSingleName('');
    setMode('list');
    refresh();
  };

  const handlePasteProcess = () => {
    const emails = pasteData.split(/[\n,]+/).map(e => e.trim()).filter(e => e.includes('@'));
    let count = 0;
    emails.forEach(email => {
      storageService.addContact({
        id: Math.random().toString(36).substr(2, 9),
        email: email,
        status: 'active',
        addedAt: new Date().toISOString()
      });
      count++;
    });
    setUploadStatus(`Successfully added ${count} contacts.`);
    setPasteData('');
    setTimeout(() => {
      setMode('list');
      setUploadStatus('');
      refresh();
    }, 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      // Simple CSV parser: assumes Email is the first column or header "email" exists
      const lines = text.split('\n');
      let count = 0;
      
      lines.forEach(line => {
        const parts = line.split(',');
        const email = parts[0]?.trim(); // Very basic assumption
        if (email && email.includes('@')) {
           storageService.addContact({
             id: Math.random().toString(36).substr(2, 9),
             email: email,
             name: parts[1]?.trim() || '',
             status: 'active',
             addedAt: new Date().toISOString()
           });
           count++;
        }
      });
      setUploadStatus(`Imported ${count} contacts from CSV.`);
      setTimeout(() => {
        setMode('list');
        setUploadStatus('');
        refresh();
      }, 1500);
    };
    reader.readAsText(file);
  };

  const clearContacts = () => {
    if(window.confirm('Are you sure you want to delete ALL contacts?')) {
      storageService.saveContacts([]);
      refresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Contact Management</h1>
           <p className="text-slate-500">Total Contacts: {contacts.length}</p>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => setMode('add')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${mode === 'add' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>Single</button>
          <button onClick={() => setMode('paste')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${mode === 'paste' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>Paste List</button>
          <button onClick={() => setMode('upload')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${mode === 'upload' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>Upload CSV</button>
        </div>
      </div>

      {/* Input Areas */}
      {mode === 'add' && (
        <div className="bg-white p-6 rounded-xl shadow-sm animate-fade-in-down">
          <h3 className="font-semibold mb-4">Add Single Contact</h3>
          <form onSubmit={handleAddSingle} className="flex gap-4">
            <input type="email" placeholder="Email Address" required className="flex-1 p-2 border rounded-lg" value={singleEmail} onChange={e => setSingleEmail(e.target.value)} />
            <input type="text" placeholder="Name (Optional)" className="flex-1 p-2 border rounded-lg" value={singleName} onChange={e => setSingleName(e.target.value)} />
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Add</button>
          </form>
        </div>
      )}

      {mode === 'paste' && (
        <div className="bg-white p-6 rounded-xl shadow-sm animate-fade-in-down">
          <h3 className="font-semibold mb-4">Paste Comma/Line Separated Emails</h3>
          <textarea 
            className="w-full h-32 p-3 border rounded-lg mb-4 text-sm font-mono"
            placeholder="john@example.com, jane@example.com..."
            value={pasteData}
            onChange={e => setPasteData(e.target.value)}
          ></textarea>
          <div className="flex justify-between items-center">
             <button onClick={handlePasteProcess} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Process List</button>
             {uploadStatus && <span className="text-emerald-600 flex items-center gap-2"><Check size={16}/> {uploadStatus}</span>}
          </div>
        </div>
      )}

      {mode === 'upload' && (
        <div className="bg-white p-6 rounded-xl shadow-sm animate-fade-in-down text-center border-2 border-dashed border-slate-300 hover:border-blue-500 transition-colors cursor-pointer relative">
          <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          <Upload className="mx-auto text-slate-400 mb-2" size={32} />
          <h3 className="font-semibold text-slate-700">Click to Upload CSV</h3>
          <p className="text-slate-400 text-sm">Format: Email, Name (Optional)</p>
          {uploadStatus && <p className="text-emerald-600 mt-4 font-medium">{uploadStatus}</p>}
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-700">Contact List</h3>
          {contacts.length > 0 && <button onClick={clearContacts} className="text-red-500 text-sm hover:underline">Delete All</button>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Added</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id} className="bg-white border-b hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{contact.email}</td>
                  <td className="px-6 py-4">{contact.name || '-'}</td>
                  <td className="px-6 py-4">
                     <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Active</span>
                  </td>
                  <td className="px-6 py-4">{new Date(contact.addedAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {contacts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                    <div className="flex flex-col items-center">
                      <Users size={48} className="mb-2 opacity-20" />
                      No contacts found. Add some to get started.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Contacts;