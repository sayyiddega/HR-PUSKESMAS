
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Settings } from '../types';
import { loginUser } from '../store';

const LoginPage: React.FC<{ onLogin: (user: User) => void, settings: Settings }> = ({ onLogin, settings }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const data = await loginUser(email, password);
      // Simpan token ke localStorage
      localStorage.setItem('sikep_token', data.token);
      localStorage.setItem('sikep_active_user', JSON.stringify(data.user));
      onLogin(data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Email atau Password salah.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="md:w-1/2 bg-teal-500 hidden md:flex items-center justify-center p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-black mb-6">Kelola Kepegawaian Puskesmas.</h2>
          <p className="text-teal-50 text-lg leading-relaxed mb-8">
            Gunakan kredensial yang telah diberikan oleh Administrator TI untuk mengakses dashboard SIKEP.
          </p>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center md:text-left">
            <div className="inline-flex items-center justify-center gap-3 mb-6">
              {settings.logoUrl ? (
                <img 
                  src={settings.logoUrl} 
                  alt="Logo" 
                  className="w-16 h-16 rounded-2xl object-cover" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }} 
                />
              ) : null}
              <div className={`w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center ${settings.logoUrl ? 'hidden' : ''}`}>
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">{settings.webName || 'Portal SIKEP'}</h1>
            <p className="text-slate-500">Sistem Informasi Kepegawaian Internal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email" 
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:bg-white outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:bg-white outline-none transition-all"
                required
              />
            </div>
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-2xl shadow-lg shadow-teal-100 transition-all transform active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? 'Memproses...' : 'Masuk Sekarang'}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <Link to="/landing" className="text-sm font-medium text-slate-400 hover:text-teal-600 transition-colors">
              &larr; Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
