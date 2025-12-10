import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, Users, Mail, Settings, FileEdit, LogOut, Menu, X } from 'lucide-react';
import { storageService } from './services/storageService';

// Pages
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Templates from './pages/Templates';
import SendMail from './pages/SendMail';
import SmtpSettings from './pages/Settings';
import Login from './pages/Login';

interface PrivateRouteProps {
  children?: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  return storageService.isAuthenticated() ? <>{children}</> : <Navigate to="/login" />;
};

interface SidebarItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}

const SidebarItem = ({ to, icon: Icon, label, active, onClick }: SidebarItemProps) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center space-x-3 px-6 py-3 transition-colors ${
      active 
        ? 'bg-blue-600 text-white border-r-4 border-blue-800' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{name: string} | null>({ name: 'Admin User' });

  const handleLogout = () => {
    storageService.logout();
    window.location.reload();
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900 text-white z-50 flex justify-between items-center p-4 shadow-md">
        <div className="font-bold text-xl tracking-tight">MailFlow Pro</div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex md:flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-20 flex items-center px-8 border-b border-slate-800 hidden md:flex">
          <div className="font-bold text-2xl tracking-tight text-blue-500">MailFlow<span className="text-white">Pro</span></div>
        </div>

        <nav className="flex-1 py-6 overflow-y-auto mt-16 md:mt-0">
          <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/'} onClick={() => setIsMobileMenuOpen(false)} />
          <SidebarItem to="/contacts" icon={Users} label="Contact Lists" active={location.pathname === '/contacts'} onClick={() => setIsMobileMenuOpen(false)} />
          <SidebarItem to="/templates" icon={FileEdit} label="Templates" active={location.pathname === '/templates'} onClick={() => setIsMobileMenuOpen(false)} />
          <SidebarItem to="/send" icon={Mail} label="Send Campaign" active={location.pathname === '/send'} onClick={() => setIsMobileMenuOpen(false)} />
          <SidebarItem to="/settings" icon={Settings} label="SMTP Settings" active={location.pathname === '/settings'} onClick={() => setIsMobileMenuOpen(false)} />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center space-x-3 text-slate-400 hover:text-red-400 w-full px-4 py-2 transition-colors">
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
      
      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </div>
  );
};

const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
        <Route path="/contacts" element={<PrivateRoute><Layout><Contacts /></Layout></PrivateRoute>} />
        <Route path="/templates" element={<PrivateRoute><Layout><Templates /></Layout></PrivateRoute>} />
        <Route path="/send" element={<PrivateRoute><Layout><SendMail /></Layout></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Layout><SmtpSettings /></Layout></PrivateRoute>} />
      </Routes>
    </HashRouter>
  );
};

export default App;