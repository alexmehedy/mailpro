import React, { useEffect, useState } from 'react';
import { storageService } from '../services/storageService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Mail, BookOpen, MousePointer, AlertCircle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white rounded-xl shadow-sm p-6 flex items-center space-x-4 border border-slate-100">
    <div className={`p-4 rounded-full ${color} bg-opacity-10`}>
      <Icon className={color.replace('bg-', 'text-')} size={24} />
    </div>
    <div>
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  const [logs, setLogs] = useState(storageService.getLogs());
  const [stats, setStats] = useState({ sent: 0, opened: 0, clicked: 0, failed: 0 });

  useEffect(() => {
    const s = { sent: 0, opened: 0, clicked: 0, failed: 0 };
    logs.forEach(log => {
      if (log.status === 'sent') s.sent++;
      if (log.status === 'opened') s.opened++;
      if (log.status === 'clicked') s.clicked++;
      if (log.status === 'failed') s.failed++;
    });
    setStats(s);
  }, [logs]);

  const data = [
    { name: 'Sent', value: stats.sent },
    { name: 'Opened', value: stats.opened },
    { name: 'Clicked', value: stats.clicked },
    { name: 'Failed', value: stats.failed },
  ];
  
  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#ef4444'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Campaign Overview</h1>
        <span className="text-sm text-slate-500">Last updated: Just now</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Sent" value={stats.sent} icon={Mail} color="bg-blue-500" />
        <StatCard title="Opened" value={stats.opened} icon={BookOpen} color="bg-emerald-500" />
        <StatCard title="Clicked" value={stats.clicked} icon={MousePointer} color="bg-violet-500" />
        <StatCard title="Bounced/Failed" value={stats.failed} icon={AlertCircle} color="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-700 mb-4">Performance Metrics</h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <h3 className="font-semibold text-slate-700 mb-4">Recent Activity</h3>
           <div className="overflow-auto max-h-64">
             <table className="w-full text-sm text-left">
               <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0">
                 <tr>
                   <th className="px-4 py-2">Recipient</th>
                   <th className="px-4 py-2">Status</th>
                   <th className="px-4 py-2">Time</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {logs.slice().reverse().slice(0, 10).map((log) => (
                   <tr key={log.id}>
                     <td className="px-4 py-3 font-medium text-slate-900 truncate max-w-[150px]">{log.recipient}</td>
                     <td className="px-4 py-3">
                       <span className={`px-2 py-1 rounded-full text-xs font-semibold
                         ${log.status === 'sent' ? 'bg-blue-100 text-blue-700' : 
                           log.status === 'opened' ? 'bg-emerald-100 text-emerald-700' :
                           log.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}
                       `}>
                         {log.status}
                       </span>
                     </td>
                     <td className="px-4 py-3 text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                   </tr>
                 ))}
                 {logs.length === 0 && (
                   <tr>
                     <td colSpan={3} className="px-4 py-8 text-center text-slate-400">No activity yet.</td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;