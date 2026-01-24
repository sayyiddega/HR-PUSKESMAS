
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { User, UserRole, Settings } from './types';
import { getSettings, getSettingsPublic, getUsers } from './store';
import * as MessageApi from './src/api/message';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import PegawaiDashboard from './pages/PegawaiDashboard';
import MasterKaryawan from './pages/MasterKaryawan';
import MasterDocument from './pages/MasterDocument';
import MasterStyle from './pages/MasterStyle';
import ProfilePage from './pages/ProfilePage';
import DocumentUploadPage from './pages/DocumentUploadPage';
import LeaveRequestsPage from './pages/LeaveRequestsPage';
import InternalMailPage from './pages/InternalMailPage';
import NotificationToast from './components/NotificationToast';
import { ICONS, INITIAL_SETTINGS } from './constants';

const Sidebar = ({ user, logout, settings, unreadCount }: { user: User, logout: () => void, settings: Settings, unreadCount: number }) => {
  const isAdmin = user.role === UserRole.ADMIN;
  
  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        {settings.logoUrl ? (
          <img src={settings.logoUrl} alt="Logo" className="w-10 h-10 rounded-lg object-cover" onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
          }} />
        ) : null}
        <div className={`w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center text-white font-bold text-xl ${settings.logoUrl ? 'hidden' : ''}`}>
          {settings.webName ? settings.webName.charAt(0) : 'P'}
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-800 leading-tight">{settings.webName || 'SIKEP'}</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Puskesmas App</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        <Link to="/" className="flex items-center gap-3 p-3 text-slate-600 hover:bg-teal-50 hover:text-teal-600 rounded-xl transition-all group">
          <ICONS.Dashboard />
          <span className="font-medium">Dashboard</span>
        </Link>
        
        {isAdmin ? (
          <>
            <Link to="/master-karyawan" className="flex items-center gap-3 p-3 text-slate-600 hover:bg-teal-50 hover:text-teal-600 rounded-xl transition-all group">
              <ICONS.Users />
              <span className="font-medium">Master Karyawan</span>
            </Link>
            <Link to="/master-document" className="flex items-center gap-3 p-3 text-slate-600 hover:bg-teal-50 hover:text-teal-600 rounded-xl transition-all group">
              <ICONS.Files />
              <span className="font-medium">Master Dokumen</span>
            </Link>
            <Link to="/master-style" className="flex items-center gap-3 p-3 text-slate-600 hover:bg-teal-50 hover:text-teal-600 rounded-xl transition-all group">
              <ICONS.Settings />
              <span className="font-medium">Master Style</span>
            </Link>
          </>
        ) : (
          <>
            <Link to="/profile" className="flex items-center gap-3 p-3 text-slate-600 hover:bg-teal-50 hover:text-teal-600 rounded-xl transition-all group">
              <ICONS.Users />
              <span className="font-medium">Profile Kepegawaian</span>
            </Link>
            <Link to="/dokumen" className="flex items-center gap-3 p-3 text-slate-600 hover:bg-teal-50 hover:text-teal-600 rounded-xl transition-all group">
              <ICONS.Files />
              <span className="font-medium">Kelengkapan Dokumen</span>
            </Link>
          </>
        )}
        
        <Link to="/cuti" className="flex items-center gap-3 p-3 text-slate-600 hover:bg-teal-50 hover:text-teal-600 rounded-xl transition-all group">
          <ICONS.Calendar />
          <span className="font-medium">{isAdmin ? 'Persetujuan Cuti' : 'Pengajuan Cuti'}</span>
        </Link>
        <Link to="/mail" className="flex items-center gap-3 p-3 text-slate-600 hover:bg-teal-50 hover:text-teal-600 rounded-xl transition-all group relative">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          <span className="font-medium">Surat Internal</span>
          {unreadCount > 0 && (
            <span className="absolute right-2 top-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full min-w-[20px] text-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>
      </nav>
      
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 mb-4 p-2">
          {user.profilePhotoUrl ? (
            <img 
              src={user.profilePhotoUrl} 
              alt="avatar" 
              className="w-10 h-10 rounded-full border-2 border-teal-100 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`;
              }}
            />
          ) : (
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="avatar" className="w-10 h-10 rounded-full border-2 border-teal-100" />
          )}
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-800 truncate">{user.fullName}</p>
            <p className="text-[10px] text-slate-500 uppercase">{user.role}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="flex w-full items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all group"
        >
          <ICONS.Logout />
          <span className="font-medium">Keluar</span>
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  // Fixed: settings initialization must be async-safe
  const [settings, setSettings] = useState<Settings>(INITIAL_SETTINGS);
  const [globalNotification, setGlobalNotification] = useState<string>("");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const savedUser = localStorage.getItem('sikep_active_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    // Load settings tanpa token (public) agar landing/login/logo tetap benar sebelum login
    getSettingsPublic().then(setSettings).catch(console.error);
  }, []);

  // Load unread count periodically
  useEffect(() => {
    if (!user) return;
    
    const loadUnreadCount = async () => {
      try {
        const count = await MessageApi.messageApi.getUnreadCount();
        setUnreadCount(count);
      } catch (err) {
        console.error('Failed to load unread count:', err);
      }
    };

    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [user]);

  // Listen for custom events to trigger notifications
  useEffect(() => {
    const handleNotify = (e: any) => setGlobalNotification(e.detail);
    window.addEventListener('sikep_notify', handleNotify);
    return () => window.removeEventListener('sikep_notify', handleNotify);
  }, []);

  const login = (u: User) => {
    setUser(u);
    localStorage.setItem('sikep_active_user', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sikep_active_user');
  };

  // Refresh user from localStorage (useful after profile updates)
  const refreshUser = () => {
    const savedUser = localStorage.getItem('sikep_active_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  };

  const refreshSettings = () => {
    getSettings().then(setSettings).catch(console.error);
  };

  // Sync document title & favicon dengan Master Style
  useEffect(() => {
    const title = settings?.webName?.trim() || 'SIKEP Puskesmas';
    document.title = title;
    const link = document.getElementById('sikep-favicon') as HTMLLinkElement | null;
    if (link) {
      if (settings?.logoUrl?.trim()) {
        link.href = settings.logoUrl;
        link.type = settings.logoUrl.match(/\.(jpg|jpeg)$/i) ? 'image/jpeg' : 'image/png';
      } else {
        link.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="%230d9488"/><text x="16" y="22" font-size="18" fill="white" text-anchor="middle" font-family="sans-serif">' + (title.charAt(0) || 'S') + '</text></svg>';
        link.type = 'image/svg+xml';
      }
    }
  }, [settings]);

  const refreshUnreadCount = async () => {
    if (!user) return;
    try {
      const count = await MessageApi.messageApi.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to refresh unread count:', err);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex">
        {user && <Sidebar user={user} logout={logout} settings={settings} unreadCount={unreadCount} />}
        <main className="flex-1 flex flex-col overflow-auto relative">
          <Routes>
            <Route path="/landing" element={<LandingPage settings={settings} />} />
            <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage onLogin={login} settings={settings} />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              user ? (
                user.role === UserRole.ADMIN ? <AdminDashboard /> : <PegawaiDashboard user={user} />
              ) : <Navigate to="/landing" />
            } />

            {/* Admin Only */}
            <Route path="/master-karyawan" element={user?.role === UserRole.ADMIN ? <MasterKaryawan /> : <Navigate to="/" />} />
            <Route path="/master-document" element={user?.role === UserRole.ADMIN ? <MasterDocument /> : <Navigate to="/" />} />
            <Route path="/master-style" element={user?.role === UserRole.ADMIN ? <MasterStyle onUpdate={refreshSettings} /> : <Navigate to="/" />} />
            
            {/* Shared/Pegawai */}
            <Route path="/profile" element={user ? <ProfilePage user={user} onUpdate={(u) => { login(u); refreshUser(); }} /> : <Navigate to="/login" />} />
            <Route path="/dokumen" element={user ? <DocumentUploadPage user={user} onUpdate={login} /> : <Navigate to="/login" />} />
            <Route path="/cuti" element={user ? <LeaveRequestsPage user={user} /> : <Navigate to="/login" />} />
            <Route path="/mail" element={user ? <InternalMailPage user={user} onUnreadCountChange={refreshUnreadCount} /> : <Navigate to="/login" />} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          
          <NotificationToast 
            content={globalNotification} 
            onClose={() => setGlobalNotification("")} 
          />
        </main>
      </div>
    </Router>
  );
};

export default App;
