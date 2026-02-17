
import React, { useState, useEffect } from 'react';
import { User, DocumentType, UserDocument } from '../types';
import { getDocTypes, uploadDocument, getMyDocuments } from '../store';
import { showNotification } from '../src/utils/notification';

const DocumentUploadPage: React.FC<{ user: User, onUpdate: (user: User) => void }> = ({ user, onUpdate }) => {
  const [docTypes, setDocTypes] = useState<DocumentType[]>([]);
  const [myDocuments, setMyDocuments] = useState<UserDocument[]>([]);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [docTypesData, documentsData] = await Promise.all([
        getDocTypes(),
        getMyDocuments()
      ]);
      // Force state update by creating new arrays
      setDocTypes([...docTypesData]);
      setMyDocuments([...documentsData.documents]);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data.');
      showNotification(`Gagal memuat data: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (docTypeId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setError('File harus berupa PDF, JPG, atau PNG');
      showNotification('File harus berupa PDF, JPG, atau PNG', 'error');
      return;
    }

    setError('');
    setUploadingId(docTypeId);

    try {
      await uploadDocument(docTypeId, file);
      showNotification('Dokumen berhasil diunggah!', 'success');
      // Clear file input to allow re-upload
      if (e.target) {
        e.target.value = '';
      }
      // Reload data setelah upload
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Gagal mengunggah dokumen.');
      showNotification(`Gagal mengunggah dokumen: ${err.message}`, 'error');
      // Clear file input on error too
      if (e.target) {
        e.target.value = '';
      }
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 mb-1">Kelengkapan Berkas</h1>
          <p className="text-slate-500">Unggah dokumen pendukung untuk verifikasi kepegawaian.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 font-bold">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="p-20 text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 rounded-full border-t-amber-500 border-amber-200"></div>
          <p className="text-slate-400 font-medium mt-4">Memuat data dokumen...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {docTypes.map(type => {
            const doc = myDocuments.find(d => d.documentTypeId === type.id);
            const isUploading = uploadingId === type.id;

          return (
            <div key={type.id} className={`bg-white p-6 rounded-[2rem] border transition-all ${doc ? 'border-amber-100 shadow-amber-50/50 shadow-lg' : 'border-slate-100 shadow-sm'}`}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${doc ? 'bg-amber-600 text-white' : 'bg-slate-50 text-slate-300'}`}>
                    {doc ? '📄' : '📤'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{type.name}</h4>
                    {type.isRequired && <span className="text-[9px] font-black uppercase text-red-500 tracking-widest">Wajib Diunggah</span>}
                  </div>
                </div>
                {doc && (
                  <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                  </div>
                )}
              </div>

              {doc ? (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-800 truncate mb-1">{doc.originalFilename}</p>
                    <p className="text-[10px] text-slate-400">Diunggah: {new Date(doc.uploadedAt).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div className="flex gap-2">
                    <label className="flex-1 text-center py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-200 transition-colors">
                      Ganti Berkas
                      <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload(type.id, e)} disabled={isUploading} />
                    </label>
                    <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="flex-1 text-center py-2.5 bg-amber-50 text-amber-600 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors">
                      Lihat
                    </a>
                  </div>
                </div>
              ) : (
                <div className="relative group">
                  <label className={`w-full h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-[1.5rem] transition-all cursor-pointer ${isUploading ? 'bg-slate-50 border-amber-200' : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-amber-400'}`}>
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs font-bold text-amber-600 animate-pulse">Mengunggah...</span>
                      </div>
                    ) : (
                      <>
                        <svg className="w-8 h-8 text-slate-300 mb-2 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                        <span className="text-xs font-bold text-slate-400 uppercase">Pilih File</span>
                      </>
                    )}
                    <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload(type.id, e)} disabled={isUploading} />
                  </label>
                </div>
              )}
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
};

export default DocumentUploadPage;
