
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
      localStorage.setItem('sikep_token', data.token);
      localStorage.setItem('sikep_active_user', JSON.stringify(data.user));
      onLogin(data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Email atau password salah.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-100 bg-pattern-dots">
      <div className="w-full max-w-md">
        {/* Kartu dengan strip atas amber - gaya baru */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="h-2 w-full bg-amber-500" />
          <div className="p-8">
            <div className="text-center mb-8">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="" className="h-16 w-16 rounded-2xl object-cover mx-auto mb-4 ring-2 ring-slate-200" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); }} />
              ) : null}
              <div className={`h-16 w-16 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-900 text-2xl font-bold mx-auto mb-4 ${settings.logoUrl ? 'hidden' : ''}`}>
                {settings.webName ? settings.webName.charAt(0) : 'P'}
              </div>
              <h1 className="text-xl font-bold text-slate-900">{settings.webName || 'Portal SIKEP'}</h1>
              <p className="text-slate-500 text-sm mt-1">Masuk ke akun Anda</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@instansi.go.id"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-slate-900 placeholder:text-slate-400"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-slate-900 placeholder:text-slate-400"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-amber-500 text-slate-900 font-bold hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-2 border-amber-600/30"
              >
                {isLoading ? 'Memproses...' : 'Masuk'}
              </button>
            </form>

            <p className="mt-6 text-center">
              <Link to="/landing" className="text-sm text-slate-500 hover:text-amber-600 font-medium transition-colors">
                &larr; Kembali
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
