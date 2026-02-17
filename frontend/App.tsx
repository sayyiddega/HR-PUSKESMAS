
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

const NavLink = ({ to, children, badge }: { to: string; children: React.ReactNode; badge?: number }) => (
  <Link
    to={to}
    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-amber-400 transition-colors text-sm font-medium relative"
  >
    {children}
    {badge != null && badge > 0 && (
      <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{badge > 99 ? '99+' : badge}</span>
    )}
  </Link>
);

const TopNavBar = ({ user, logout, settings, unreadCount }: { user: User, logout: () => void, settings: Settings, unreadCount: number }) => {
  const isAdmin = user.role === UserRole.ADMIN;
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems: { to: string; label: string; badge?: number }[] = [
    { to: '/', label: 'Dashboard' },
    ...(isAdmin
      ? [
          { to: '/master-karyawan', label: 'Master Karyawan' },
          { to: '/master-document', label: 'Master Dokumen' },
          { to: '/master-style', label: 'Master Style' },
        ]
      : [{ to: '/profile', label: 'Profil' }]),
    { to: '/dokumen', label: 'Berkas' },
    { to: '/cuti', label: isAdmin ? 'Cuti' : 'Cuti' },
    { to: '/mail', label: 'Surat', badge: unreadCount },
  ];

  return (
    <div className="sticky top-0 z-40 w-full bg-slate-800 text-white shadow-lg border-b border-slate-700/50">
      <header className="flex h-14 items-center justify-between px-4 max-w-[1400px] mx-auto gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt="" className="h-8 w-8 rounded-lg object-cover ring-1 ring-slate-600" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); }} />
          ) : null}
          <div className={`h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-900 font-bold text-sm ${settings.logoUrl ? 'hidden' : ''}`}>
            {settings.webName ? settings.webName.charAt(0) : 'P'}
          </div>
          <span className="font-semibold truncate hidden sm:block max-w-[140px]">{settings.webName || 'SIKEP'}</span>
        </div>

        {/* Nav menu di atas - horizontal */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center min-w-0">
          {navItems.map(({ to, label, badge }) => (
            <NavLink key={to} to={to} badge={badge}>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile: hamburger buka menu dropdown di bawah navbar */}
        <div className="md:hidden flex-1 flex justify-end">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="p-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-amber-400 transition-colors"
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </div>

        {/* User + Logout */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-2 pr-3 border-r border-slate-600">
            {user.profilePhotoUrl ? (
              <img src={user.profilePhotoUrl} alt="" className="h-8 w-8 rounded-full object-cover ring-1 ring-amber-500/50" onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`; }} />
            ) : (
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="" className="h-8 w-8 rounded-full ring-1 ring-amber-500/50" />
            )}
            <div className="hidden sm:block max-w-[100px] truncate">
              <p className="text-xs font-semibold truncate">{user.fullName}</p>
              <p className="text-[10px] text-slate-400 uppercase">{user.role}</p>
            </div>
          </div>
          <button type="button" onClick={logout} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-amber-400 rounded-lg transition-colors">
            <ICONS.Logout />
            <span className="hidden xs:inline">Keluar</span>
          </button>
        </div>
      </header>

      {/* Mobile dropdown: menu tampil di bawah navbar (masih "di atas") */}
      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-slate-800 border-t border-slate-700 shadow-xl z-50">
          <nav className="flex flex-col p-2 gap-0.5">
            {navItems.map(({ to, label, badge }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-amber-400 transition-colors font-medium"
              >
                {label}
                {badge != null && badge > 0 && (
                  <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{badge > 99 ? '99+' : badge}</span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  // Fixed: settings initialization must be async-safe
  const [settings, setSettings] = useState<Settings>(INITIAL_SETTINGS);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [globalNotification, setGlobalNotification] = useState<string>("");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const savedUser = localStorage.getItem('sikep_active_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    // Load settings tanpa token (public) agar landing/login/logo tetap benar sebelum login
    setIsLoadingSettings(true);
    getSettingsPublic()
      .then(setSettings)
      .catch(console.error)
      .finally(() => setIsLoadingSettings(false));
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
    setIsLoadingSettings(true);
    getSettings()
      .then(setSettings)
      .catch(console.error)
      .finally(() => setIsLoadingSettings(false));
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
        link.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="%23f59e0b"/><text x="16" y="22" font-size="18" fill="%230f172a" text-anchor="middle" font-family="sans-serif">' + (title.charAt(0) || 'S') + '</text></svg>';
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

  // Loading screen saat settings masih dimuat (prevent glitch)
  if (isLoadingSettings) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent mb-4"></div>
          <p className="text-slate-600 font-medium">Memuat pengaturan...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 bg-pattern-dots flex flex-col">
        {user && <TopNavBar user={user} logout={logout} settings={settings} unreadCount={unreadCount} />}
        <main className="flex-1 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden relative">
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
