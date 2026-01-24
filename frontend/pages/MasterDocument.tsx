
import React, { useState, useEffect, useMemo } from 'react';
import { DocumentType } from '../types';
import { getDocTypes, saveDocType, deleteDocType } from '../store';

const MasterDocument: React.FC = () => {
  const [docTypes, setDocTypes] = useState<DocumentType[]>([]);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const loadDocTypes = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await getDocTypes();
      setDocTypes(data);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat daftar dokumen');
      console.error('Error loading doc types:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocTypes();
  }, []);

  useEffect(() => {
    // Reset ke halaman pertama setiap kali data berubah
    setCurrentPage(1);
  }, [docTypes.length]);

  const totalPages = Math.max(1, Math.ceil(docTypes.length / pageSize));
  const pagedDocTypes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return docTypes.slice(start, start + pageSize);
  }, [docTypes, currentPage]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      await saveDocType({
        name: newName.trim(),
        description: newDescription.trim() || undefined,
        isRequired
      });
      
      // Refresh list
      await loadDocTypes();
      
      // Show success notification
      setSuccess(`Jenis dokumen "${newName}" berhasil ditambahkan!`);
      
      // Clear form
      setNewName('');
      setNewDescription('');
      setIsRequired(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Gagal menambahkan jenis dokumen');
      console.error('Error saving doc type:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus jenis dokumen ini?')) return;
    
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      await deleteDocType(id);
      
      // Refresh list
      await loadDocTypes();
      
      // Show success notification
      setSuccess('Jenis dokumen berhasil dihapus!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus jenis dokumen');
      console.error('Error deleting doc type:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="mb-10">
        <h1 className="text-2xl font-black text-slate-900 mb-1">Master Jenis Dokumen</h1>
        <p className="text-slate-500">Kelola kategori berkas yang harus diunggah pegawai.</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl flex items-center gap-3 animate-in fade-in">
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
        <div className="mb-6 p-4 bg-teal-50 border border-teal-100 text-teal-700 text-sm rounded-2xl flex items-center gap-3 animate-in fade-in">
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

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Form Add */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-fit sticky top-8">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Tambah Jenis Baru</h3>
          <form onSubmit={handleAdd} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Nama Dokumen</label>
              <input 
                type="text" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Mis: Sertifikat Vaksin, Ijazah..." 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Deskripsi (Opsional)</label>
              <textarea 
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Deskripsi dokumen..." 
                rows={2}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl cursor-pointer">
              <input 
                type="checkbox" 
                checked={isRequired}
                onChange={(e) => setIsRequired(e.target.checked)}
                className="w-5 h-5 accent-teal-500"
              />
              <span className="text-sm font-semibold text-slate-600">Dokumen ini Wajib diunggah</span>
            </label>
            <button 
              type="submit"
              disabled={isLoading || !newName.trim()}
              className="w-full py-4 bg-teal-500 text-white font-bold rounded-2xl shadow-lg shadow-teal-100 hover:bg-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                'Daftarkan Dokumen'
              )}
            </button>
          </form>
          <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <p className="text-xs text-amber-700 leading-relaxed">
              <strong>Info:</strong> Menambahkan dokumen baru di sini akan secara otomatis memunculkan kolom unggah di dashboard setiap pegawai.
            </p>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">Daftar Dokumen Aktif</h3>
            <div className="flex items-center gap-3">
              {isLoading && (
                <svg className="animate-spin h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span className="text-sm font-bold text-slate-400">{docTypes.length} Tipe</span>
            </div>
          </div>
          {isLoading && docTypes.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center text-slate-400">
              <svg className="animate-spin h-8 w-8 mx-auto mb-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p>Memuat daftar dokumen...</p>
            </div>
          ) : (
            pagedDocTypes.map(doc => (
            <div key={doc.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-teal-100 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{doc.name}</h4>
                  {doc.description && (
                    <p className="text-xs text-slate-500 mt-1">{doc.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${doc.isRequired ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                      {doc.isRequired ? 'Wajib' : 'Opsional'}
                    </span>
                    <span className="text-[10px] text-slate-300">•</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">ID: {doc.id}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(doc.id)}
                className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
            ))
          )}
          {!isLoading && docTypes.length === 0 && (
             <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center text-slate-400">
               Belum ada dokumen yang dikonfigurasi.
             </div>
          )}
          {docTypes.length > 0 && (
            <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                {(() => {
                  const start = (currentPage - 1) * pageSize + 1;
                  const end = Math.min(docTypes.length, currentPage * pageSize);
                  return `Menampilkan ${start}-${end} dari ${docTypes.length} tipe dokumen`;
                })()}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-full border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Sebelumnya
                </button>
                <span className="px-3 text-[11px] font-semibold text-slate-600">
                  Hal {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-full border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Berikutnya
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MasterDocument;
