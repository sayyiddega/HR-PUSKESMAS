
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { User, LeaveStatus, DocumentType, UserDocument } from '../types';
import { getDocTypes, getMyDocuments } from '../store';
import * as DashboardApi from '../src/api/dashboard';

const PegawaiDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [dashboardStats, setDashboardStats] = useState<DashboardApi.EmployeeDashboardStats | null>(null);
  const [docTypes, setDocTypes] = useState<DocumentType[]>([]);
  const [myDocuments, setMyDocuments] = useState<UserDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [user.id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsData, docTypesData, documentsData] = await Promise.all([
        DashboardApi.dashboardApi.getEmployeeStats(),
        getDocTypes(),
        getMyDocuments()
      ]);
      setDashboardStats(statsData);
      setDocTypes(docTypesData);
      setMyDocuments(documentsData.documents);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadedCount = useMemo(() => dashboardStats?.uploadedDocuments || 0, [dashboardStats]);
  const totalDocTypes = useMemo(() => dashboardStats?.totalDocumentTypes || docTypes.length, [dashboardStats, docTypes]);
  const completionPercent = useMemo(() => {
    if (!totalDocTypes || totalDocTypes === 0) return 0;
    return Math.min(100, Math.round((uploadedCount / totalDocTypes) * 100));
  }, [uploadedCount, totalDocTypes]);

  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin inline-block w-12 h-12 border-4 rounded-full border-t-teal-500 border-teal-200 mb-4"></div>
            <p className="text-slate-400 font-medium">Memuat data dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Halo, {user.fullName.split(' ')[0]}! 👋</h1>
          <p className="text-slate-500">Senang melihatmu kembali. Pantau administrasi Anda di sini.</p>
        </div>
        <div className="flex gap-4">
          <Link to="/cuti" className="bg-teal-500 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-teal-100 hover:bg-teal-600 transition-all flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            Ajukan Cuti
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-[4rem] transition-all group-hover:w-40 group-hover:h-40 -z-0"></div>
            <div className="relative z-10 flex flex-col md:flex-row gap-10">
              <div className="flex-shrink-0">
                {user.profilePhotoUrl ? (
                  <img 
                    src={user.profilePhotoUrl} 
                    alt="Profile Photo" 
                    className="w-32 h-32 rounded-[2.5rem] border-4 border-white shadow-xl object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`;
                    }}
                  />
                ) : (
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} alt="Avatar" className="w-32 h-32 rounded-[2.5rem] border-4 border-white shadow-xl" />
                )}
                <div className="mt-4 text-center">
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded-full">Pegawai Aktif</span>
                </div>
              </div>
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Nama Lengkap</h3>
                  <p className="text-2xl font-black text-slate-800">{user.fullName}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Email</h3>
                    <p className="text-sm font-bold text-slate-700 font-mono">{user.username}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Jabatan Sekarang</h3>
                    <p className="text-sm font-bold text-slate-700">{user.position || '-'}</p>
                  </div>
                  {user.department && (
                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Departemen</h3>
                      <p className="text-sm font-bold text-slate-700">{user.department}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-20">
                 <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 00 2 2h12a2 2 0 00 2-2V7l-5-5zM9 15h6v2H9v-2zm0-4h6v2H9v-2zm4-4V3.5L17.5 7H13z"/></svg>
               </div>
               <h4 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Dokumen Terunggah</h4>
               <div className="flex items-end gap-3 mb-6">
                 <span className="text-5xl font-black">{uploadedCount}</span>
                 <span className="text-slate-500 pb-1 font-bold">/ {totalDocTypes} Total</span>
               </div>
               <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                 <div className="bg-teal-400 h-full rounded-full transition-all duration-1000" style={{ width: `${completionPercent}%` }}></div>
               </div>
               <p className="mt-4 text-[10px] text-slate-500 font-bold uppercase">{100-completionPercent}% Lagi untuk kelengkapan 100%</p>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
               <h4 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-6">Status Cuti Terakhir</h4>
               {dashboardStats?.latestLeaveRequest ? (
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-800">Cuti</span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        dashboardStats.latestLeaveRequest.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        dashboardStats.latestLeaveRequest.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {dashboardStats.latestLeaveRequest.status}
                      </span>
                    </div>
                    {dashboardStats.latestLeaveRequest.reason && (
                      <p className="text-xs text-slate-400 leading-relaxed italic">"{dashboardStats.latestLeaveRequest.reason}"</p>
                    )}
                    <div className="text-[10px] font-bold text-slate-300 pt-2 border-t border-slate-50">
                      Diajukan: {new Date(dashboardStats.latestLeaveRequest.createdAt).toLocaleDateString('id-ID')}
                    </div>
                 </div>
               ) : (
                 <div className="h-24 flex items-center justify-center text-slate-300 italic text-sm">Belum ada pengajuan.</div>
               )}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Document Checklist */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-slate-800">Checklist Berkas</h3>
            <Link to="/dokumen" className="text-teal-600 text-xs font-bold hover:underline">Kelola</Link>
          </div>
          <div className="space-y-6">
            {isLoading ? (
              <div className="p-10 text-center">
                <div className="animate-spin inline-block w-6 h-6 border-3 rounded-full border-t-teal-500 border-teal-200"></div>
                <p className="text-slate-400 text-xs mt-2">Memuat...</p>
              </div>
            ) : (
              docTypes.map(doc => {
                const isUploaded = myDocuments.some(d => d.documentTypeId === doc.id);
                return (
                <div key={doc.id} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isUploaded ? 'bg-teal-500 text-white shadow-lg shadow-teal-100' : 'bg-slate-100 text-slate-300'}`}>
                    {isUploaded ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                    ) : (
                      <span className="text-xs font-black italic">!</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${isUploaded ? 'text-slate-800' : 'text-slate-400'}`}>{doc.name}</p>
                    {doc.isRequired && !isUploaded && <span className="text-[9px] text-red-500 font-black uppercase tracking-tighter">Wajib</span>}
                  </div>
                </div>
              );
            })
            )}
          </div>
          <div className="mt-10 p-6 bg-blue-50 rounded-[2rem] border border-blue-100">
             <h5 className="text-xs font-bold text-blue-800 mb-2">Pemberitahuan Sistem</h5>
             <p className="text-[11px] text-blue-600 leading-relaxed">
               Mohon lengkapi seluruh dokumen bertanda <strong>Wajib</strong> untuk keperluan validasi data kepegawaian tahunan.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PegawaiDashboard;
