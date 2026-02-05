
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Settings } from '../types';

const LandingPage: React.FC<{ settings: Settings }> = ({ settings }) => {
  const [isReady, setIsReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Pastikan settings sudah ter-load dari API (bukan default/initial)
  useEffect(() => {
    // Check jika settings sudah ter-load (ada address/phone yang biasanya dari backend, atau logoUrl)
    // Atau minimal pastikan bukan initial state yang kosong
    if (settings && (settings.address || settings.phone || settings.logoUrl || settings.landingHeroImageUrl)) {
      setIsReady(true);
    } else {
      // Fallback: set ready setelah delay kecil untuk prevent flash
      const timer = setTimeout(() => setIsReady(true), 150);
      return () => clearTimeout(timer);
    }
  }, [settings]);

  // Loading skeleton saat settings belum ready
  if (!isReady) {
    return (
      <div className="bg-white min-h-screen">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent mb-4"></div>
            <p className="text-slate-600 font-medium">Memuat halaman...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex flex-col" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Navbar — responsive: desktop baris satu, mobile hamburger + drawer */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50 safe-area-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 md:h-20 flex items-center justify-between min-h-[44px]">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {settings.logoUrl ? (
              <img 
                src={settings.logoUrl} 
                alt="Logo" 
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-cover flex-shrink-0" 
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }} 
              />
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-teal-500 rounded-lg flex items-center justify-center text-white font-bold text-lg sm:text-xl flex-shrink-0">
                {settings.webName ? settings.webName.charAt(0) : 'P'}
              </div>
            )}
            <span className="font-bold text-base sm:text-xl text-slate-800 truncate">{settings.webName || 'SIKEP Puskesmas'}</span>
          </div>
          {/* Desktop: link + login */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#about" className="text-sm font-medium text-slate-600 hover:text-teal-600">Tentang</a>
            <a href="#services" className="text-sm font-medium text-slate-600 hover:text-teal-600">Layanan</a>
            <Link to="/login" className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all">
              Login Pegawai
            </Link>
          </div>
          {/* Mobile: tombol menu — relative z-index agar di atas elemen lain */}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(true); }}
            className="md:hidden relative z-[60] p-2 -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-xl touch-manipulation"
            aria-label="Buka menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </div>
        {/* Mobile menu — render via portal ke body agar selalu di atas & klik jalan */}
        {menuOpen && typeof document !== 'undefined' && createPortal(
          <>
            <div className="fixed inset-0 bg-slate-900/60 z-[100] md:hidden" onClick={() => setMenuOpen(false)} aria-hidden="true" role="presentation" />
            <div 
              className="fixed inset-0 z-[110] flex flex-col bg-white overflow-hidden md:hidden" 
              style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 flex-shrink-0 min-h-[52px]">
                <span className="font-bold text-slate-800 truncate">{settings.webName || 'SIKEP'}</span>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 active:bg-slate-200 touch-manipulation flex-shrink-0"
                  aria-label="Tutup menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              <nav className="px-4 py-3 flex flex-col flex-1 min-h-0 overflow-y-auto">
                <a href="#about" className="block py-2.5 px-4 text-slate-700 font-medium rounded-xl hover:bg-teal-50 hover:text-teal-600 min-h-[44px] flex items-center active:bg-teal-100 touch-manipulation" onClick={() => setMenuOpen(false)}>Tentang</a>
                <a href="#services" className="block py-2.5 px-4 text-slate-700 font-medium rounded-xl hover:bg-teal-50 hover:text-teal-600 min-h-[44px] flex items-center active:bg-teal-100 touch-manipulation" onClick={() => setMenuOpen(false)}>Layanan</a>
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <Link to="/login" className="block w-full py-2.5 px-4 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 text-center min-h-[44px] flex items-center justify-center active:scale-[0.98] transition-transform touch-manipulation" onClick={() => setMenuOpen(false)}>Login Pegawai</Link>
                </div>
              </nav>
            </div>
          </>,
          document.body
        )}
      </nav>

      {/* Hero — padding cukup di mobile agar judul & bottom tidak kepotong */}
      <section className="relative overflow-hidden py-12 sm:py-16 md:py-24 pb-8 sm:pb-16 md:pb-24">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-teal-50/50 -skew-x-12 translate-x-32 -z-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="min-w-0">
            <span className="inline-block py-1 px-3 bg-teal-100 text-teal-700 rounded-full text-xs font-bold uppercase tracking-widest mb-3 md:mb-4">
              {settings.landingHeroBadge || 'Portal Kepegawaian Internal'}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight mb-4 md:mb-6 break-words">
              {settings.landingHeroTitle || 'Melayani dengan Hati & Profesionalisme.'}
            </h1>
            <p className="text-base sm:text-lg text-slate-600 mb-6 md:mb-8 max-w-lg leading-relaxed break-words">
              {settings.landingHeroSubtitle || `Sistem Informasi Kepegawaian (SIKEP) ${settings.webName} dirancang untuk mempermudah manajemen data karyawan, dokumen, dan administrasi harian.`}
            </p>
            <div className="flex flex-wrap gap-3 md:gap-4">
              <Link to="/login" className="bg-slate-900 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all min-h-[44px] flex items-center justify-center">
                Mulai Akses
              </Link>
              <div className="flex -space-x-3 items-center ml-0 sm:ml-4">
                {[1,2,3,4].map(i => (
                  <img key={i} src={`https://picsum.photos/seed/${i}/40`} alt="user" className="w-10 h-10 rounded-full border-4 border-white" />
                ))}
                <span className="pl-4 text-sm font-semibold text-slate-500">+120 Pegawai Aktif</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <img 
              src={settings.landingHeroImageUrl || 'https://picsum.photos/seed/doctor/800/600'} 
              alt="Hero" 
              className="rounded-[3rem] shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 w-full max-w-lg object-cover" 
              onError={(e) => {
                const el = e.target as HTMLImageElement;
                if (settings.landingHeroImageUrl) el.src = 'https://picsum.photos/seed/doctor/800/600';
              }}
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl border border-slate-100 max-w-[240px]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-slate-400 uppercase">Status Sistem</span>
              </div>
              <p className="text-sm font-semibold text-slate-800">
                {settings.landingStatusText || 'Sistem Berjalan Optimal & Aman'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Section (Customizable) */}
      <section id="about" className="py-12 sm:py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center mb-10 md:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">Profil & Visi Misi</h2>
          <div className="w-24 h-1 bg-teal-500 mx-auto rounded-full"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-8 md:gap-12">
          <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center">V</span> Visi Kami
            </h3>
            <p className="text-slate-600 leading-relaxed italic">
              {settings.landingVisionText || '"Menjadi Puskesmas terdepan dalam pelayanan kesehatan masyarakat yang bermutu, mandiri, dan berkeadilan melalui manajemen sumber daya manusia yang unggul."'}
            </p>
          </div>
          <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">M</span> Misi Utama
            </h3>
            <ul className="space-y-3 text-slate-600">
              {(settings.landingMission1 || 'Memberikan pelayanan prima sesuai standar.').split('\n').map((line, idx) => (
                <li key={`m1-${idx}`} className="flex gap-2"><span>•</span> {line}</li>
              ))}
              {settings.landingMission2 && settings.landingMission2.split('\n').map((line, idx) => (
                <li key={`m2-${idx}`} className="flex gap-2"><span>•</span> {line}</li>
              ))}
              {settings.landingMission3 && settings.landingMission3.split('\n').map((line, idx) => (
                <li key={`m3-${idx}`} className="flex gap-2"><span>•</span> {line}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Footer / Contact — dipentok ke bawah dengan safe-area */}
      <footer className="bg-slate-900 text-white py-12 sm:py-16 mt-auto" style={{ paddingBottom: 'max(3rem, env(safe-area-inset-bottom))' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-3 gap-8 md:gap-12">
          <div>
            <h4 className="text-xl font-bold mb-6">{settings.webName}</h4>
            <p className="text-slate-400 leading-relaxed mb-6">
              {settings.landingFooterText || 'Sistem manajemen internal Puskesmas untuk efisiensi birokrasi dan peningkatan kualitas layanan kesehatan.'}
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6">Kontak Kantor</h4>
            <div className="space-y-4 text-slate-400">
              <p className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                {settings.address}
              </p>
              <p className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                {settings.phone}
              </p>
              <p className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                {settings.email}
              </p>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-6">Pintasan</h4>
            <div className="flex flex-col gap-4 text-slate-400">
              <Link to="/login" className="hover:text-white">Portal Pegawai</Link>
              <a href="#" className="hover:text-white">Bantuan & FAQ</a>
              <a href="#" className="hover:text-white">Kebijakan Privasi</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} {settings.webName}. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
