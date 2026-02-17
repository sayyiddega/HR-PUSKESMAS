
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings } from '../types';

const LandingPage: React.FC<{ settings: Settings }> = ({ settings }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (settings && (settings.address || settings.phone || settings.logoUrl || settings.landingHeroImageUrl)) {
      setIsReady(true);
    } else {
      const timer = setTimeout(() => setIsReady(true), 150);
      return () => clearTimeout(timer);
    }
  }, [settings]);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-amber-500 border-t-transparent mb-3" />
          <p className="text-slate-500 text-sm">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Nav: minimal - logo kiri, Login kanan (amber CTA) */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="flex items-center gap-2">
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt="" className="h-9 w-9 rounded-xl object-cover ring-1 ring-slate-200" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <div className="h-9 w-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-900 text-sm font-bold">
              {settings.webName ? settings.webName.charAt(0) : 'P'}
            </div>
          )}
          <span className="font-semibold text-slate-800">{settings.webName || 'SIKEP'}</span>
        </div>
        <Link to="/login" className="px-4 py-2 rounded-xl bg-amber-500 text-slate-900 font-semibold hover:bg-amber-600 transition-colors shadow-md">
          Login
        </Link>
      </nav>

      {/* Hero: asimetris - kiri teks besar, kanan blok dekoratif */}
      <section className="relative flex-1 flex items-center px-6 py-16 md:py-24 overflow-hidden">
        <div className="max-w-5xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-amber-600 text-xs font-bold uppercase tracking-widest mb-4">
              {settings.landingHeroBadge || 'Portal Kepegawaian'}
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-5">
              {settings.landingHeroTitle || 'Melayani dengan Hati & Profesionalisme.'}
            </h1>
            <p className="text-slate-600 text-base sm:text-lg mb-8 max-w-lg">
              {settings.landingHeroSubtitle || `Sistem Informasi Kepegawaian (SIKEP) ${settings.webName} untuk manajemen data karyawan, dokumen, dan administrasi harian.`}
            </p>
            <Link to="/login" className="inline-block px-8 py-4 rounded-xl bg-slate-900 text-amber-400 font-bold hover:bg-slate-800 transition-colors shadow-lg border-2 border-amber-500/30">
              Masuk ke Portal
            </Link>
          </div>
          <div className="hidden md:block relative">
            <div className="aspect-square max-w-md mx-auto rounded-3xl bg-gradient-to-br from-amber-400/20 via-slate-200/50 to-slate-300/30 border-2 border-slate-200 flex items-center justify-center">
              <div className="grid grid-cols-3 gap-4 p-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-xl bg-amber-500/40 border border-amber-400/50" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About: kartu dengan aksen amber kiri */}
      <section id="about" className="py-20 px-6 bg-white border-t border-slate-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-12">Profil & Visi Misi</h2>
          <div className="space-y-6">
            <div className="pl-5 border-l-4 border-amber-500 bg-slate-50 py-5 pr-5 rounded-r-xl">
              <h3 className="font-bold text-slate-800 mb-2">Visi</h3>
              <p className="text-slate-600 text-sm leading-relaxed italic">
                {settings.landingVisionText || '"Menjadi Puskesmas terdepan dalam pelayanan kesehatan masyarakat yang bermutu, mandiri, dan berkeadilan melalui manajemen sumber daya manusia yang unggul."'}
              </p>
            </div>
            <div className="pl-5 border-l-4 border-amber-500 bg-slate-50 py-5 pr-5 rounded-r-xl">
              <h3 className="font-bold text-slate-800 mb-2">Misi</h3>
              <ul className="text-slate-600 text-sm space-y-1">
                {(settings.landingMission1 || 'Memberikan pelayanan prima sesuai standar.').split('\n').map((line, i) => (
                  <li key={i} className="flex gap-2"><span className="text-amber-500">•</span> {line}</li>
                ))}
                {settings.landingMission2 && settings.landingMission2.split('\n').map((line, i) => (
                  <li key={`m2-${i}`} className="flex gap-2"><span className="text-amber-500">•</span> {line}</li>
                ))}
                {settings.landingMission3 && settings.landingMission3.split('\n').map((line, i) => (
                  <li key={`m3-${i}`} className="flex gap-2"><span className="text-amber-500">•</span> {line}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer: slate-900 + amber accent */}
      <footer className="py-10 px-6 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <p className="font-bold text-amber-400">{settings.webName}</p>
            <p className="text-slate-400 text-sm mt-1 max-w-md">
              {settings.landingFooterText || 'Sistem manajemen internal untuk efisiensi dan layanan prima.'}
            </p>
          </div>
          <div className="text-slate-400 text-sm space-y-1">
            {settings.address && <p>{settings.address}</p>}
            {settings.phone && <p>{settings.phone}</p>}
            {settings.email && <p>{settings.email}</p>}
          </div>
        </div>
        <p className="text-slate-500 text-xs text-center mt-8">
          &copy; {new Date().getFullYear()} {settings.webName}
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
