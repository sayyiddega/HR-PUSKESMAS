
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
  // Biodata ASN – boleh diupdate sendiri, kecuali sisa cuti
  const [nik, setNik] = useState(user.nik || '');
  const [gender, setGender] = useState(user.gender || '');
  const [placeOfBirth, setPlaceOfBirth] = useState(user.placeOfBirth || '');
  const [maritalStatus, setMaritalStatus] = useState(user.maritalStatus || '');
  const [religion, setReligion] = useState(user.religion || '');
  const [lastEducation, setLastEducation] = useState(user.lastEducation || '');
  const [rankGolongan, setRankGolongan] = useState(user.rankGolongan || '');
  const [employmentStatus, setEmploymentStatus] = useState(user.employmentStatus || '');
  // Extended ASN/PNS
  const [tmtPangkatGolRuang, setTmtPangkatGolRuang] = useState(user.tmtPangkatGolRuang || '');
  const [tmtJabatan, setTmtJabatan] = useState(user.tmtJabatan || '');
  const [tmtCpns, setTmtCpns] = useState(user.tmtCpns || '');
  const [tmtPns, setTmtPns] = useState(user.tmtPns || '');
  const [masaKerja, setMasaKerja] = useState(user.masaKerja || '');
  const [namaLatihanJabatan, setNamaLatihanJabatan] = useState(user.namaLatihanJabatan || '');
  const [tanggalLatihanJabatan, setTanggalLatihanJabatan] = useState(user.tanggalLatihanJabatan || '');
  const [lamaJam, setLamaJam] = useState(user.lamaJam || '');
  const [namaFakultasPendidikanTerakhir, setNamaFakultasPendidikanTerakhir] = useState(user.namaFakultasPendidikanTerakhir || '');
  const [jurusanPendidikanTerakhir, setJurusanPendidikanTerakhir] = useState(user.jurusanPendidikanTerakhir || '');
  const [tahunLulusPendidikan, setTahunLulusPendidikan] = useState(user.tahunLulusPendidikan !== undefined ? String(user.tahunLulusPendidikan) : '');
  const [catatanMutasi, setCatatanMutasi] = useState(user.catatanMutasi || '');
  const [karpeg, setKarpeg] = useState(user.karpeg || '');
  const [keterangan, setKeterangan] = useState(user.keterangan || '');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const PASSWORD_MIN = 8;
  const PASSWORD_MAX = 72;
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(user.profilePhotoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const didChangePassword = newPassword.trim().length > 0;
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
        // Biodata yang boleh diubah sendiri
        nik,
        gender,
        placeOfBirth,
        maritalStatus,
        religion,
        lastEducation,
        rankGolongan,
        employmentStatus,
        tmtPangkatGolRuang: tmtPangkatGolRuang || undefined,
        tmtJabatan: tmtJabatan || undefined,
        tmtCpns: tmtCpns || undefined,
        tmtPns: tmtPns || undefined,
        masaKerja: masaKerja || undefined,
        namaLatihanJabatan: namaLatihanJabatan || undefined,
        tanggalLatihanJabatan: tanggalLatihanJabatan || undefined,
        lamaJam: lamaJam || undefined,
        namaFakultasPendidikanTerakhir: namaFakultasPendidikanTerakhir || undefined,
        jurusanPendidikanTerakhir: jurusanPendidikanTerakhir || undefined,
        tahunLulusPendidikan: tahunLulusPendidikan ? parseInt(tahunLulusPendidikan, 10) : undefined,
        catatanMutasi: catatanMutasi || undefined,
        karpeg: karpeg || undefined,
        keterangan: keterangan || undefined,
        // remainingLeaveDays sengaja TIDAK dikirim dari sisi pegawai
      });

      // Update password if provided
      if (newPassword.trim()) {
        await EmployeeApi.employeeApi.changePassword({ newPassword: newPassword.trim() });
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
        // Sinkronkan biodata ASN + sisa cuti dari backend
        nik: updatedProfile.nik,
        gender: updatedProfile.gender,
        placeOfBirth: updatedProfile.placeOfBirth,
        maritalStatus: updatedProfile.maritalStatus,
        religion: updatedProfile.religion,
        lastEducation: updatedProfile.lastEducation,
        rankGolongan: updatedProfile.rankGolongan,
        employmentStatus: updatedProfile.employmentStatus,
        remainingLeaveDays: updatedProfile.remainingLeaveDays,
        tmtPangkatGolRuang: updatedProfile.tmtPangkatGolRuang,
        tmtJabatan: updatedProfile.tmtJabatan,
        tmtCpns: updatedProfile.tmtCpns,
        tmtPns: updatedProfile.tmtPns,
        masaKerja: updatedProfile.masaKerja,
        namaLatihanJabatan: updatedProfile.namaLatihanJabatan,
        tanggalLatihanJabatan: updatedProfile.tanggalLatihanJabatan,
        lamaJam: updatedProfile.lamaJam,
        namaFakultasPendidikanTerakhir: updatedProfile.namaFakultasPendidikanTerakhir,
        jurusanPendidikanTerakhir: updatedProfile.jurusanPendidikanTerakhir,
        tahunLulusPendidikan: updatedProfile.tahunLulusPendidikan,
        catatanMutasi: updatedProfile.catatanMutasi,
        karpeg: updatedProfile.karpeg,
        keterangan: updatedProfile.keterangan,
      };

      onUpdate(updatedUser);
      setProfilePhotoUrl(updatedProfile.profilePhotoUrl);
      // Perbarui state form biodata supaya form tidak kembali ke nilai lama
      setNik(updatedProfile.nik || '');
      setGender(updatedProfile.gender || '');
      setPlaceOfBirth(updatedProfile.placeOfBirth || '');
      setMaritalStatus(updatedProfile.maritalStatus || '');
      setReligion(updatedProfile.religion || '');
      setLastEducation(updatedProfile.lastEducation || '');
      setRankGolongan(updatedProfile.rankGolongan || '');
      setEmploymentStatus(updatedProfile.employmentStatus || '');
      setTmtPangkatGolRuang(updatedProfile.tmtPangkatGolRuang || '');
      setTmtJabatan(updatedProfile.tmtJabatan || '');
      setTmtCpns(updatedProfile.tmtCpns || '');
      setTmtPns(updatedProfile.tmtPns || '');
      setMasaKerja(updatedProfile.masaKerja || '');
      setNamaLatihanJabatan(updatedProfile.namaLatihanJabatan || '');
      setTanggalLatihanJabatan(updatedProfile.tanggalLatihanJabatan || '');
      setLamaJam(updatedProfile.lamaJam || '');
      setNamaFakultasPendidikanTerakhir(updatedProfile.namaFakultasPendidikanTerakhir || '');
      setJurusanPendidikanTerakhir(updatedProfile.jurusanPendidikanTerakhir || '');
      setTahunLulusPendidikan(updatedProfile.tahunLulusPendidikan !== undefined ? String(updatedProfile.tahunLulusPendidikan) : '');
      setCatatanMutasi(updatedProfile.catatanMutasi || '');
      setKarpeg(updatedProfile.karpeg || '');
      setKeterangan(updatedProfile.keterangan || '');
      setNewPassword('');
      setPasswordError('');
      showNotification(didChangePassword ? 'Profil dan kata sandi berhasil diperbarui!' : 'Profil berhasil diperbarui!', 'success');
    } catch (err: any) {
      const msg = err?.message || 'Gagal memperbarui';
      setPasswordError(msg.includes('password') || msg.includes('Password') || msg.includes('kata sandi') ? msg : '');
      showNotification(`Gagal memperbarui: ${msg}`, 'error');
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
    <div className="p-8 w-full max-w-6xl mx-auto">
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
               {user.nip && (
                 <p className="text-slate-400 font-mono text-[11px] mt-1">NIP: {user.nip}</p>
               )}
               {typeof user.remainingLeaveDays === 'number' && (
                 <p className="text-emerald-600 font-mono text-[11px] mt-1">
                   Sisa cuti: {user.remainingLeaveDays} hari
                 </p>
               )}
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

            {/* Biodata tambahan yang boleh diubah sendiri */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">NIK</label>
                <input 
                  type="text" 
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Jenis Kelamin</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="">Pilih</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Tempat Lahir</label>
                <input 
                  type="text" 
                  value={placeOfBirth}
                  onChange={(e) => setPlaceOfBirth(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Status Perkawinan</label>
                <input 
                  type="text" 
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Agama</label>
                <input 
                  type="text" 
                  value={religion}
                  onChange={(e) => setReligion(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Pendidikan Terakhir</label>
                <input 
                  type="text" 
                  value={lastEducation}
                  onChange={(e) => setLastEducation(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Pangkat / Golongan</label>
                <input 
                  type="text" 
                  value={rankGolongan}
                  onChange={(e) => setRankGolongan(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Status Kepegawaian</label>
                <input 
                  type="text" 
                  value={employmentStatus}
                  onChange={(e) => setEmploymentStatus(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none" 
                />
              </div>
            </div>

            {/* Extended ASN/PNS */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">TMT Pangkat/Gol/Ruang</label>
                <input type="text" value={tmtPangkatGolRuang} onChange={(e) => setTmtPangkatGolRuang(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">TMT Jabatan</label><input type="date" value={tmtJabatan} onChange={(e) => setTmtJabatan(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none" /></div>
              <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">TMT CPNS</label><input type="date" value={tmtCpns} onChange={(e) => setTmtCpns(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none" /></div>
              <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">TMT PNS</label><input type="date" value={tmtPns} onChange={(e) => setTmtPns(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none" /></div>
              <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Masa Kerja</label><input type="text" value={masaKerja} onChange={(e) => setMasaKerja(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none" /></div>
              <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Nama Latihan Jabatan</label><input type="text" value={namaLatihanJabatan} onChange={(e) => setNamaLatihanJabatan(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none" /></div>
              <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Tanggal Latihan Jabatan</label><input type="date" value={tanggalLatihanJabatan} onChange={(e) => setTanggalLatihanJabatan(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none" /></div>
              <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Lama (Jam)</label><input type="text" value={lamaJam} onChange={(e) => setLamaJam(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none" /></div>
              <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Fakultas Pendidikan Terakhir</label><input type="text" value={namaFakultasPendidikanTerakhir} onChange={(e) => setNamaFakultasPendidikanTerakhir(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none" /></div>
              <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Jurusan Pendidikan Terakhir</label><input type="text" value={jurusanPendidikanTerakhir} onChange={(e) => setJurusanPendidikanTerakhir(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none" /></div>
              <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Tahun Lulus Pendidikan</label><input type="number" value={tahunLulusPendidikan} onChange={(e) => setTahunLulusPendidikan(e.target.value)} placeholder="Contoh: 2015" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none" /></div>
              <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Karpeg</label><input type="text" value={karpeg} onChange={(e) => setKarpeg(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none" /></div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Catatan Mutasi</label>
              <textarea rows={2} value={catatanMutasi} onChange={(e) => setCatatanMutasi(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Keterangan</label>
              <textarea rows={2} value={keterangan} onChange={(e) => setKeterangan(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>

            <hr className="border-slate-50 my-8" />

            <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50">
              <h3 className="text-xs font-black text-blue-800 uppercase tracking-widest mb-4">Ganti Kata Sandi</h3>
              <p className="text-xs text-blue-700/80 mb-3">
                Kosongkan jika tidak ingin ganti. Format: minimal {PASSWORD_MIN} karakter, maksimal {PASSWORD_MAX} karakter.
              </p>
              <div>
                <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2 ml-1">Password Baru</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setPasswordError(''); }}
                  placeholder="Min. 8 karakter, maks. 72 karakter"
                  minLength={PASSWORD_MIN}
                  maxLength={PASSWORD_MAX}
                  className={`w-full px-5 py-4 bg-white border rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${passwordError ? 'border-red-300' : 'border-blue-100'}`}
                />
                {passwordError && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    {passwordError}
                  </p>
                )}
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
