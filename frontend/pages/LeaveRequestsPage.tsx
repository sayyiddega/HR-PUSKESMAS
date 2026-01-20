
import React, { useState, useMemo, useEffect } from 'react';
import { User, UserRole, LeaveRequest, LeaveType, LeaveStatus } from '../types';
import { getLeaveRequests, saveLeaveRequest, updateLeaveStatus, generateActivityNotification } from '../store';

const LeaveRequestsPage: React.FC<{ user: User }> = ({ user }) => {
  // Fixed: requests initialization must be async-safe
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const isAdmin = user.role === UserRole.ADMIN;

  useEffect(() => {
    getLeaveRequests().then(setRequests).catch(console.error);
  }, []);

  const [formData, setFormData] = useState({
    type: LeaveType.CUTI,
    startDate: '',
    endDate: '',
    reason: ''
  });

  const displayRequests = useMemo(() => {
    return isAdmin ? requests : requests.filter(r => r.userId === user.id);
  }, [requests, user.id, isAdmin]);

  const triggerNotification = (content: string) => {
    const event = new CustomEvent('sikep_notify', { detail: content });
    window.dispatchEvent(event);
  };

  // Fixed: Properly await saveLeaveRequest and refresh list from server
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const newReq: Partial<LeaveRequest> = {
      userId: user.id,
      userName: user.fullName,
      status: LeaveStatus.PENDING,
      ...formData
    };

    await saveLeaveRequest(newReq);
    const updated = await getLeaveRequests();
    setRequests(updated);
    setIsModalOpen(false);
    
    // Gemini: Generate simulated email content using the exported store function
    const emailContent = await generateActivityNotification("Pengajuan Layanan Cuti Baru", {
      pegawai: user.fullName,
      email: user.username,
      tipe: formData.type,
      durasi: `${formData.startDate} s/d ${formData.endDate}`,
      alasan: formData.reason
    });

    triggerNotification(emailContent);
    setIsProcessing(false);
  };

  // Fixed: Use updateLeaveStatus singular and refresh list
  const handleAction = async (id: string, status: LeaveStatus) => {
    await updateLeaveStatus(id, status);
    const refreshed = await getLeaveRequests();
    setRequests(refreshed);
    
    const req = refreshed.find(r => r.id === id);
    if (req) {
      const emailContent = await generateActivityNotification("Update Status Layanan Cuti", {
        pegawai: req.userName,
        status: status === LeaveStatus.APPROVED ? "DISETUJUI" : "DITOLAK",
        admin: user.fullName
      });
      triggerNotification(emailContent);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-2xl font-black text-slate-900 mb-1">
            {isAdmin ? 'Persetujuan Layanan Pegawai' : 'Pengajuan Layanan Saya'}
          </h1>
          <p className="text-slate-500">Manajemen cuti, izin sakit, dan keperluan administrasi.</p>
        </div>
        {!isAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-teal-500 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-teal-100 hover:bg-teal-600 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            Buat Pengajuan Baru
          </button>
        )}
      </div>

      <div className="space-y-4">
        {displayRequests.map(req => (
          <div key={req.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-teal-100 transition-all">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
                req.type === LeaveType.SAKIT ? 'bg-red-50 text-red-600' :
                req.type === LeaveType.CUTI ? 'bg-teal-50 text-teal-600' : 'bg-blue-50 text-blue-600'
              }`}>
                {req.type === LeaveType.SAKIT ? '🤒' : req.type === LeaveType.CUTI ? '🏖️' : '📁'}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-slate-800">{isAdmin ? req.userName : req.type}</span>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">
                    {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-500 italic">"{req.reason}"</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                req.status === LeaveStatus.APPROVED ? 'bg-green-100 text-green-700' :
                req.status === LeaveStatus.REJECTED ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {req.status}
              </div>
              
              {isAdmin && req.status === LeaveStatus.PENDING && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleAction(req.id, LeaveStatus.APPROVED)}
                    className="w-10 h-10 bg-green-500 text-white rounded-xl flex items-center justify-center hover:bg-green-600 shadow-lg shadow-green-100 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                  </button>
                  <button 
                    onClick={() => handleAction(req.id, LeaveStatus.REJECTED)}
                    className="w-10 h-10 bg-red-500 text-white rounded-xl flex items-center justify-center hover:bg-red-600 shadow-lg shadow-red-100 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {displayRequests.length === 0 && (
          <div className="p-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200 text-slate-400">
             Belum ada riwayat pengajuan layanan.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-800">Form Layanan Baru</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Jenis Layanan</label>
                <select 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as LeaveType})}
                >
                  <option value={LeaveType.CUTI}>🏖️ Cuti Tahunan</option>
                  <option value={LeaveType.SAKIT}>🤒 Izin Sakit</option>
                  <option value={LeaveType.IZIN}>📁 Izin Lainnya</option>
                </select>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Mulai</label>
                  <input 
                    type="date" required
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Berakhir</label>
                  <input 
                    type="date" required
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Alasan</label>
                <textarea 
                  rows={3} required
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none"
                ></textarea>
              </div>
              <button 
                type="submit" 
                disabled={isProcessing}
                className="w-full py-5 bg-teal-500 text-white font-black text-lg rounded-3xl shadow-xl hover:bg-teal-600 transition-all disabled:opacity-50"
              >
                {isProcessing ? 'Memproses...' : 'Kirim Pengajuan'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequestsPage;
