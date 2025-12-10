import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { EmailTemplate } from '../types';
import { Code, Eye, Save, Trash2, Plus, Sparkles, FileEdit } from 'lucide-react';
import { geminiService } from '../services/geminiService';

const Templates = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit State
  const [editName, setEditName] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editHtml, setEditHtml] = useState('');
  const [viewMode, setViewMode] = useState<'code' | 'preview'>('code');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const list = storageService.getTemplates();
    setTemplates(list);
    if (list.length > 0 && !selectedTemplate) setSelectedTemplate(list[0]);
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      setEditName(selectedTemplate.name);
      setEditSubject(selectedTemplate.subject);
      setEditHtml(selectedTemplate.htmlContent);
    }
  }, [selectedTemplate]);

  const handleCreateNew = () => {
    const newTemp: EmailTemplate = {
      id: Date.now().toString(),
      name: 'New Template',
      subject: 'Subject Line Here',
      htmlContent: '<h1>Hello World</h1><p>Start editing...</p>',
      lastModified: new Date().toISOString()
    };
    setSelectedTemplate(newTemp);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!selectedTemplate) return;
    const updated = {
      ...selectedTemplate,
      name: editName,
      subject: editSubject,
      htmlContent: editHtml,
      lastModified: new Date().toISOString()
    };
    storageService.saveTemplate(updated);
    setTemplates(storageService.getTemplates());
    setIsEditing(false);
  };

  const handleAiGenerate = async () => {
    if(!aiPrompt) return;
    setIsGenerating(true);
    try {
      const result = await geminiService.generateTemplate(aiPrompt);
      setEditSubject(result.subject);
      setEditHtml(result.html);
      setViewMode('preview');
    } catch (e) {
      alert("Failed to generate template. Check API Key.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6">
      {/* List Sidebar */}
      <div className="w-1/3 bg-white rounded-xl shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-bold text-slate-700">Templates</h2>
          <button onClick={handleCreateNew} className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100"><Plus size={18} /></button>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-2">
          {templates.map(t => (
            <div 
              key={t.id} 
              onClick={() => { setSelectedTemplate(t); setIsEditing(false); }}
              className={`p-3 rounded-lg cursor-pointer transition ${selectedTemplate?.id === t.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50 border border-transparent'}`}
            >
              <h4 className="font-medium text-slate-800">{t.name}</h4>
              <p className="text-xs text-slate-500 truncate">{t.subject}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 bg-white rounded-xl shadow-sm flex flex-col overflow-hidden">
        {selectedTemplate ? (
          <>
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <div className="flex-1 mr-4">
                 {isEditing ? (
                   <input className="w-full mb-2 p-1 border rounded" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Template Name" />
                 ) : (
                   <h2 className="text-xl font-bold text-slate-800">{selectedTemplate.name}</h2>
                 )}
               </div>
               <div className="flex space-x-2">
                 <button onClick={() => setViewMode(viewMode === 'code' ? 'preview' : 'code')} className="flex items-center space-x-2 px-3 py-1.5 bg-white border rounded text-sm text-slate-600 hover:bg-slate-50">
                    {viewMode === 'code' ? <><Eye size={16}/><span>Preview</span></> : <><Code size={16}/><span>Code</span></>}
                 </button>
                 {isEditing ? (
                   <button onClick={handleSave} className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700"><Save size={16}/><span>Save</span></button>
                 ) : (
                   <button onClick={() => setIsEditing(true)} className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"><FileEdit size={16}/><span>Edit</span></button>
                 )}
               </div>
            </div>
            
            {isEditing && (
              <div className="p-4 bg-slate-100 border-b border-slate-200">
                <input 
                  className="w-full p-2 border rounded mb-2" 
                  value={editSubject} 
                  onChange={e => setEditSubject(e.target.value)} 
                  placeholder="Email Subject Line"
                />
                
                {/* AI Generator Box */}
                <div className="flex gap-2 mt-2">
                   <input 
                    className="flex-1 p-2 border rounded text-sm"
                    placeholder="Describe a template to generate with AI (e.g., 'A welcome email for a new fintech client')..."
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                   />
                   <button 
                     onClick={handleAiGenerate}
                     disabled={isGenerating}
                     className="bg-purple-600 text-white px-4 rounded text-sm flex items-center gap-2 hover:bg-purple-700 disabled:opacity-50"
                   >
                     <Sparkles size={16}/> {isGenerating ? 'Thinking...' : 'Generate'}
                   </button>
                </div>
              </div>
            )}

            <div className="flex-1 relative overflow-hidden">
               {viewMode === 'code' ? (
                 <textarea 
                   className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none"
                   value={isEditing ? editHtml : selectedTemplate.htmlContent}
                   onChange={e => isEditing && setEditHtml(e.target.value)}
                   readOnly={!isEditing}
                 ></textarea>
               ) : (
                 <iframe 
                   title="preview"
                   className="w-full h-full border-0"
                   srcDoc={isEditing ? editHtml : selectedTemplate.htmlContent}
                 ></iframe>
               )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">Select a template to view</div>
        )}
      </div>
    </div>
  );
};

export default Templates;