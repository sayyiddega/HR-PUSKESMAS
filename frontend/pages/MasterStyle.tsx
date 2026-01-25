
import React, { useState, useEffect, useRef } from 'react';
import { Settings } from '../types';
import { getSettings, saveSettings } from '../store';
import { INITIAL_SETTINGS } from '../constants';
import * as SettingsApi from '../src/api/settings';

const MasterStyle: React.FC<{ onUpdate: () => void }> = ({ onUpdate }) => {
  const [settings, setSettings] = useState<Settings>(INITIAL_SETTINGS);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [landingImagePreview, setLandingImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const landingImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getSettings();
      setSettings(data);
      setLogoPreview(data.logoUrl || null);
      setLandingImagePreview(data.landingHeroImageUrl || null);
      // Load email from localStorage if exists
      const savedEmail = localStorage.getItem('sikep_settings_email');
      if (savedEmail) {
        setSettings(prev => ({ ...prev, email: savedEmail }));
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat pengaturan');
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar (PNG, JPG, JPEG)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5MB');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      // Upload logo
      const result = await SettingsApi.settingsApi.uploadLogo(file);
      
      // Update settings dengan logoUrl baru
      const updatedSettings = await getSettings();
      setSettings(updatedSettings);
      setLogoPreview(result.logoUrl || URL.createObjectURL(file));
      
      setSuccess('Logo berhasil di-upload!');
      setTimeout(() => setSuccess(''), 3000);
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Gagal meng-upload logo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLandingImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar (PNG, JPG, JPEG)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5MB');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      await SettingsApi.settingsApi.uploadLandingImage(file);
      const updatedSettings = await getSettings();
      setSettings(updatedSettings);
      setLandingImagePreview(updatedSettings.landingHeroImageUrl || null);

      setSuccess('Gambar landing page berhasil di-upload!');
      setTimeout(() => setSuccess(''), 3000);
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Gagal meng-upload gambar landing');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      // Save settings ke backend
      await saveSettings(settings);
      
      // Save email ke localStorage (karena tidak ada di backend)
      if (settings.email) {
        localStorage.setItem('sikep_settings_email', settings.email);
      }

      setSuccess('Pengaturan berhasil disimpan!');
      setTimeout(() => setSuccess(''), 3000);
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan pengaturan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <div className="mb-10">
        <h1 className="text-2xl font-black text-slate-900 mb-1">Konfigurasi Instansi</h1>
        <p className="text-slate-500">Sesuaikan identitas Puskesmas untuk tampilan web dan laporan.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-teal-50 border border-teal-100 text-teal-700 text-sm rounded-2xl flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="ml-auto text-teal-400 hover:text-teal-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Nama Aplikasi / Instansi</label>
              <input 
                type="text" 
                value={settings.webName}
                onChange={(e) => setSettings({...settings, webName: e.target.value})}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none font-bold" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Website Base URL</label>
              <input 
                type="text" 
                value={settings.websiteBaseUrl || ''}
                onChange={(e) => setSettings({...settings, websiteBaseUrl: e.target.value})}
                placeholder="https://hr.puskesmas.id"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none" 
              />
              <p className="text-xs text-slate-400 mt-2">URL dasar untuk generate link file dan dokumen</p>
            </div>
          </div>
          
          <div className="bg-slate-50 p-6 rounded-3xl flex items-center justify-center border-2 border-dashed border-slate-200">
            <div className="text-center w-full">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest">Preview Branding</p>
              
              {/* Logo Preview */}
              <div className="mb-4 flex justify-center">
                {(logoPreview || settings.logoUrl) ? (
                  <img 
                    src={logoPreview || settings.logoUrl} 
                    alt="Logo Preview" 
                    className="w-20 h-20 mx-auto rounded-2xl object-cover shadow-xl border-2 border-white" 
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
                  />
                ) : (
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-slate-200 flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* Upload Logo Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="w-full py-2 px-4 bg-white border-2 border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:border-teal-500 hover:text-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {isLoading ? 'Mengupload...' : (logoPreview || settings.logoUrl ? 'Ganti Logo' : 'Upload Logo')}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <p className="text-[10px] text-slate-400 mb-4">PNG, JPG, JPEG (max 5MB)</p>

              <h4 className="font-black text-slate-800 text-lg">{settings.webName || 'Nama Instansi'}</h4>
              {settings.websiteBaseUrl && (
                <p className="text-xs text-slate-500 mt-2">{settings.websiteBaseUrl}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Alamat Kantor</label>
            <textarea 
              rows={2}
              value={settings.address}
              onChange={(e) => setSettings({...settings, address: e.target.value})}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none"
            ></textarea>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">No. Telp Kantor</label>
            <input 
              type="text" 
              value={settings.phone}
              onChange={(e) => setSettings({...settings, phone: e.target.value})}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Kantor</label>
            <input 
              type="email" 
              value={settings.email}
              onChange={(e) => setSettings({...settings, email: e.target.value})}
              placeholder="info@puskesmas.go.id"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none" 
            />
            <p className="text-xs text-slate-400 mt-2">Email akan tersimpan di browser (localStorage) untuk ditampilkan di landing page</p>
          </div>
        </div>

        {/* Landing Page Content */}
        <div className="pt-8 mt-4 border-t border-slate-100 space-y-6">
          <div>
            <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.25em] mb-2">Konten Landing Page</h2>
            <p className="text-xs text-slate-400">
              Ubah teks dan gambar yang tampil di halaman depan (hero, visi misi, dan footer) tanpa perlu ngoding.
            </p>
          </div>

          {/* Gambar Hero Landing Page */}
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Gambar Hero Landing Page</label>
            <p className="text-xs text-slate-500 mb-4">Gambar besar di samping judul hero (halaman depan). Kosongkan = tampil gambar default.</p>
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="w-full sm:max-w-xs aspect-video rounded-2xl bg-white border border-slate-200 overflow-hidden flex-shrink-0">
                {(landingImagePreview || settings.landingHeroImageUrl) ? (
                  <img
                    src={landingImagePreview || settings.landingHeroImageUrl || ''}
                    alt="Hero preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => landingImageInputRef.current?.click()}
                  disabled={isLoading}
                  className="px-5 py-3 bg-white border-2 border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:border-teal-500 hover:text-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Mengupload...' : (landingImagePreview || settings.landingHeroImageUrl ? 'Ganti Gambar' : 'Upload Gambar')}
                </button>
                <input
                  ref={landingImageInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleLandingImageUpload}
                  className="hidden"
                />
                <p className="text-[10px] text-slate-400">PNG, JPG, JPEG (max 5MB). Disarankan landscape.</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Hero Badge</label>
                <input
                  type="text"
                  value={settings.landingHeroBadge || ''}
                  onChange={(e) => setSettings({ ...settings, landingHeroBadge: e.target.value })}
                  placeholder="Portal Kepegawaian Internal"
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Judul Utama Hero</label>
                <input
                  type="text"
                  value={settings.landingHeroTitle || ''}
                  onChange={(e) => setSettings({ ...settings, landingHeroTitle: e.target.value })}
                  placeholder="Melayani dengan Hati & Profesionalisme."
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Deskripsi Singkat Hero</label>
                <textarea
                  rows={3}
                  value={settings.landingHeroSubtitle || ''}
                  onChange={(e) => setSettings({ ...settings, landingHeroSubtitle: e.target.value })}
                  placeholder="Deskripsi singkat tentang tujuan SIKEP di Puskesmas Anda."
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Teks Status Sistem</label>
                <input
                  type="text"
                  value={settings.landingStatusText || ''}
                  onChange={(e) => setSettings({ ...settings, landingStatusText: e.target.value })}
                  placeholder="Sistem Berjalan Optimal & Aman"
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Visi (Paragraf)</label>
                <textarea
                  rows={3}
                  value={settings.landingVisionText || ''}
                  onChange={(e) => setSettings({ ...settings, landingVisionText: e.target.value })}
                  placeholder="Visi Puskesmas terkait SDM dan pelayanan."
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Misi Utama (1 baris / bullet)</label>
                <textarea
                  rows={2}
                  value={settings.landingMission1 || ''}
                  onChange={(e) => setSettings({ ...settings, landingMission1: e.target.value })}
                  placeholder="Memberikan pelayanan prima sesuai standar."
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Misi Tambahan</label>
                <textarea
                  rows={2}
                  value={settings.landingMission2 || ''}
                  onChange={(e) => setSettings({ ...settings, landingMission2: e.target.value })}
                  placeholder="Mendorong kemandirian hidup sehat."
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none mb-2"
                />
                <textarea
                  rows={2}
                  value={settings.landingMission3 || ''}
                  onChange={(e) => setSettings({ ...settings, landingMission3: e.target.value })}
                  placeholder="Meningkatkan kompetensi tenaga kesehatan secara berkala."
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Deskripsi Singkat Footer</label>
                <textarea
                  rows={3}
                  value={settings.landingFooterText || ''}
                  onChange={(e) => setSettings({ ...settings, landingFooterText: e.target.value })}
                  placeholder="Sistem manajemen internal Puskesmas untuk efisiensi birokrasi..."
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-5 bg-teal-500 text-white font-black text-lg rounded-3xl shadow-xl shadow-teal-100 hover:bg-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Menyimpan...</span>
              </>
            ) : (
              'Simpan Perubahan Branding'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MasterStyle;
