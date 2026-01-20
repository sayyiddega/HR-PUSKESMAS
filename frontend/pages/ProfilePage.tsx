
import React, { useState, useRef } from 'react';
import { User } from '../types';
import { saveUser } from '../store';
import * as EmployeeApi from '../src/api/employee';
import { showNotification } from '../src/utils/notification';

const ProfilePage: React.FC<{ user: User, onUpdate: (user: User) => void }> = ({ user, onUpdate }) => {
  const [fullName, setFullName] = useState(user.fullName);
  const [position, setPosition] = useState(user.position || '');
  const [department, setDepartment] = useState(user.department || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [address, setAddress] = useState(user.address || '');
  const [dateOfBirth, setDateOfBirth] = useState(user.dateOfBirth || '');
  const [joinDate, setJoinDate] = useState(user.joinDate || '');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(user.profilePhotoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Update profile
      await EmployeeApi.employeeApi.updateProfile({
        fullName,
        position,
        department,
        phone,
        address,
        dateOfBirth: dateOfBirth || undefined,
        joinDate: joinDate || undefined,
      });

      // Update password if provided
      if (newPassword) {
        await EmployeeApi.employeeApi.changePassword({ newPassword });
      }

      // Reload profile to get updated data
      const updatedProfile = await EmployeeApi.employeeApi.getProfile();
      const updatedUser: User = {
        ...user,
        fullName: updatedProfile.fullName,
        position: updatedProfile.position || '',
        department: updatedProfile.department,
        phone: updatedProfile.phone,
        address: updatedProfile.address,
        dateOfBirth: updatedProfile.dateOfBirth,
        joinDate: updatedProfile.joinDate,
        profilePhotoUrl: updatedProfile.profilePhotoUrl,
      };

      onUpdate(updatedUser);
      setProfilePhotoUrl(updatedProfile.profilePhotoUrl);
      setNewPassword('');
      showNotification('Profil berhasil diperbarui!', 'success');
    } catch (err: any) {
      showNotification(`Gagal memperbarui profil: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (only images)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      showNotification('File harus berupa JPG atau PNG', 'error');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const updatedProfile = await EmployeeApi.employeeApi.uploadProfilePhoto(file);
      const updatedUser: User = {
        ...user,
        profilePhotoUrl: updatedProfile.profilePhotoUrl,
      };
      onUpdate(updatedUser);
      setProfilePhotoUrl(updatedProfile.profilePhotoUrl);
      showNotification('Foto profil berhasil diunggah!', 'success');
    } catch (err: any) {
      showNotification(`Gagal mengunggah foto profil: ${err.message}`, 'error');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto w-full">
      <div className="mb-10">
        <h1 className="text-2xl font-black text-slate-900 mb-1">Profil Saya</h1>
        <p className="text-slate-500">Perbarui informasi pribadi dan kata sandi Anda.</p>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="h-32 bg-teal-500"></div>
        <div className="px-10 pb-10">
            <div className="relative -mt-16 mb-8 flex items-end justify-between">
            <div className="relative group">
              {profilePhotoUrl ? (
                <img 
                  src={profilePhotoUrl} 
                  alt="Profile Photo" 
                  className="w-32 h-32 rounded-[2.5rem] border-8 border-white shadow-xl object-cover"
                  onError={(e) => {
                    // Fallback to avatar if image fails to load
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`;
                  }}
                />
              ) : (
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                  alt="Avatar" 
                  className="w-32 h-32 rounded-[2.5rem] border-8 border-white shadow-xl" 
                />
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="absolute inset-0 bg-black/50 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer disabled:opacity-30"
              >
                {isUploadingPhoto ? (
                  <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                )}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                className="hidden"
                accept="image/jpeg,image/jpg,image/png"
              />
            </div>
            <div className="mb-2 text-right">
               <h2 className="text-xl font-black text-slate-900">{user.fullName}</h2>
               <p className="text-slate-400 font-mono text-xs">{user.username}</p>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Nama Lengkap</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-bold" 
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Jabatan</label>
                <input 
                  type="text" 
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Departemen</label>
                <input 
                  type="text" 
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none" 
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">No. Telepon</label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email (Login)</label>
                <input 
                  type="email" 
                  value={user.username}
                  disabled
                  className="w-full px-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl text-slate-400 cursor-not-allowed outline-none" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Alamat</label>
              <textarea 
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none" 
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Tanggal Lahir</label>
                <input 
                  type="date" 
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Tanggal Bergabung</label>
                <input 
                  type="date" 
                  value={joinDate}
                  onChange={(e) => setJoinDate(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none" 
                />
              </div>
            </div>

            <hr className="border-slate-50 my-8" />

            <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50">
              <h3 className="text-xs font-black text-blue-800 uppercase tracking-widest mb-4">Ganti Kata Sandi</h3>
              <div>
                <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2 ml-1">Password Baru (Kosongkan jika tidak ingin ganti)</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-4 bg-white border border-blue-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-5 bg-slate-900 text-white font-black text-lg rounded-3xl shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Menyimpan...</span>
                </>
              ) : (
                'Perbarui Profil'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
