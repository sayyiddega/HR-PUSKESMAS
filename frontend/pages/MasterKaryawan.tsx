
import React, { useState, useMemo, useEffect } from 'react';
import { User, UserRole, DocumentType, UserDocument, Settings } from '../types';
import { getUsers, saveUser, deleteUser, getDocTypes, getSettings, PagedResult } from '../store';
import * as DocumentApi from '../src/api/document';
import { mapEmployeeDocument } from '../src/utils/mappers';
import { generateEmployeeDocumentPDF, generateAllEmployeesDocumentPDF } from '../src/utils/pdfGenerator';

const MasterKaryawan: React.FC = () => {
  // Fixed: Initialize as empty arrays and fetch in useEffect since store functions are async
  const [users, setUsers] = useState<User[]>([]);
  const [docTypes, setDocTypes] = useState<DocumentType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [viewingUserDocuments, setViewingUserDocuments] = useState<UserDocument[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [allEmployeesDocuments, setAllEmployeesDocuments] = useState<Map<string, UserDocument[]>>(new Map());
  const [settings, setSettings] = useState<Settings | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadData(1);
  }, []);

  const loadData = async (page: number) => {
    try {
      const [usersPage, docTypesData, settingsData] = await Promise.all([
        getUsers(page, pageSize),
        getDocTypes(),
        getSettings()
      ]);
      setUsers(usersPage.items);
      setCurrentPage(usersPage.page);
      setTotalUsers(usersPage.totalElements);
      setTotalPages(usersPage.totalPages);
      setDocTypes(docTypesData);
      setSettings(settingsData);

      // Load documents for all employees to show counter
      const groupedDocs = await DocumentApi.documentApi.listAllUploads();
      const documentsMap = new Map<string, UserDocument[]>();
      groupedDocs.forEach(group => {
        const employeeId = group.employeeId.toString();
        documentsMap.set(employeeId, group.documents.map(mapEmployeeDocument));
      });
      setAllEmployeesDocuments(documentsMap);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  // Form State
  const [formData, setFormData] = useState({
    username: '', // Email
    fullName: '',
    position: '',
    department: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    joinDate: '',
    password: '',
    nip: '',
    nik: '',
    gender: '',
    placeOfBirth: '',
    maritalStatus: '',
    religion: '',
    lastEducation: '',
    rankGolongan: '',
    employmentStatus: '',
    remainingLeaveDays: ''
  });

  const filteredUsers = useMemo(() => {
    return users.map(user => {
      const documents = allEmployeesDocuments.get(user.id) || [];
      return { ...user, documents };
    }).filter(u => u.role === UserRole.PEGAWAI && (
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id.includes(searchTerm)
    ));
  }, [users, searchTerm, allEmployeesDocuments]);

  useEffect(() => {
    // Untuk saat ini filter hanya bekerja pada halaman aktif (client-side)
    // Jika ingin full server-side search, perlu endpoint baru di backend.
  }, [searchTerm]);

  // Fixed: Use saveUser instead of saveUsers and refresh list after operation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let userToSave: Partial<User>;
    
    if (editingUser) {
      userToSave = { ...editingUser, ...formData };
      if (!formData.password) {
        userToSave.password = editingUser.password;
      }
      userToSave.remainingLeaveDays = formData.remainingLeaveDays
        ? parseInt(formData.remainingLeaveDays, 10)
        : editingUser.remainingLeaveDays;
    } else {
      userToSave = {
        username: formData.username,
        password: formData.password || 'user123',
        fullName: formData.fullName,
        role: UserRole.PEGAWAI,
        position: formData.position,
        department: formData.department,
        phone: formData.phone,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth || undefined,
        joinDate: formData.joinDate || undefined,
        remainingLeaveDays: formData.remainingLeaveDays
          ? parseInt(formData.remainingLeaveDays, 10)
          : undefined,
        status: 'Aktif' as const,
        documents: []
      };
    }
    
    await saveUser(userToSave);
    const refreshed = await getUsers(currentPage, pageSize);
    setUsers(refreshed.items);
    setTotalUsers(refreshed.totalElements);
    setTotalPages(refreshed.totalPages);
    closeModal();
  };

  // Fixed: Use deleteUser and refresh list
  const handleDelete = async (id: string) => {
    if (window.confirm('Hapus pegawai ini?')) {
      await deleteUser(id);
      const refreshed = await getUsers(currentPage, pageSize);
      setUsers(refreshed.items);
      setTotalUsers(refreshed.totalElements);
      setTotalPages(refreshed.totalPages);
    }
  };

  const openModal = (user: User | null = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        fullName: user.fullName,
        position: user.position || '',
        department: user.department || '',
        phone: user.phone || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth || '',
        joinDate: user.joinDate || '',
        password: '',
        nip: user.nip || '',
        nik: user.nik || '',
        gender: user.gender || '',
        placeOfBirth: user.placeOfBirth || '',
        maritalStatus: user.maritalStatus || '',
        religion: user.religion || '',
        lastEducation: user.lastEducation || '',
        rankGolongan: user.rankGolongan || '',
        employmentStatus: user.employmentStatus || '',
        remainingLeaveDays: user.remainingLeaveDays !== undefined && user.remainingLeaveDays !== null
          ? String(user.remainingLeaveDays)
          : ''
      });
    } else {
      setEditingUser(null);
      setFormData({ 
        username: '', 
        fullName: '', 
        position: '', 
        department: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        joinDate: '',
        password: '',
        nip: '',
        nik: '',
        gender: '',
        placeOfBirth: '',
        maritalStatus: '',
        religion: '',
        lastEducation: '',
        rankGolongan: '',
        employmentStatus: '',
        remainingLeaveDays: ''
      });
    }
    setIsModalOpen(true);
  };

  const openDocModal = async (user: User) => {
    setViewingUser(user);
    setIsDocModalOpen(true);
    setIsLoadingDocuments(true);
    setViewingUserDocuments([]);
    
    try {
      // Fetch all uploaded documents grouped by employee
      const groupedDocs = await DocumentApi.documentApi.listAllUploads();
      // Find documents for this specific employee
      const employeeGroup = groupedDocs.find(group => group.employeeId.toString() === user.id);
      if (employeeGroup) {
        const documents = employeeGroup.documents.map(mapEmployeeDocument);
        setViewingUserDocuments(documents);
        // Update cache
        setAllEmployeesDocuments(prev => {
          const newMap = new Map(prev);
          newMap.set(user.id, documents);
          return newMap;
        });
      }
    } catch (error: any) {
      console.error('Failed to load employee documents:', error);
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const handleExportEmployeePDF = async (user: User) => {
    if (!settings) {
      alert('Pengaturan belum dimuat. Silakan tunggu sebentar.');
      return;
    }

    try {
      const documents = allEmployeesDocuments.get(user.id) || [];
      await generateEmployeeDocumentPDF({
        employee: user,
        documents,
        documentTypes: docTypes
      }, settings);
    } catch (error: any) {
      console.error('Failed to generate PDF:', error);
      alert('Gagal membuat PDF: ' + error.message);
    }
  };

  const handleExportAllEmployeesPDF = async () => {
    if (!settings) {
      alert('Pengaturan belum dimuat. Silakan tunggu sebentar.');
      return;
    }

    try {
      const employeesData = users.map(user => ({
        employee: user,
        documents: allEmployeesDocuments.get(user.id) || []
      }));

      await generateAllEmployeesDocumentPDF({
        employees: employeesData,
        documentTypes: docTypes
      }, settings);
    } catch (error: any) {
      console.error('Failed to generate PDF:', error);
      alert('Gagal membuat PDF: ' + error.message);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsDocModalOpen(false);
    setEditingUser(null);
    setViewingUser(null);
    setViewingUserDocuments([]);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-black text-slate-900 mb-1">Manajemen Karyawan</h1>
          <p className="text-slate-500">Kelola data, kredensial login, dan verifikasi dokumen.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportAllEmployeesPDF}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-100 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Export PDF Semua
          </button>
          <button 
            onClick={() => openModal()}
            className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-teal-100 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            Tambah Pegawai
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
          <svg className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input 
            type="text" 
            placeholder="Cari Email atau Nama..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Form Edit/Tambah Pegawai (inline card, di atas tabel) */}
      {isModalOpen && (
        <div className="mb-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h2 className="text-xl font-black text-slate-800">
              {editingUser ? 'Edit Kredensial & Profil' : 'Daftarkan Pegawai Baru'}
            </h2>
            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email</label>
                  <input 
                    type="email" required
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    placeholder="contoh@puskesmas.id"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Password {editingUser ? '(Opsional)' : '(Wajib)'}</label>
                  <input 
                    type="password" 
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder={editingUser ? "Kosongkan jika tidak diganti" : "Minimal 8 karakter"}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" 
                  />
                </div>
              </div>
              
              <hr className="border-slate-50" />

              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Nama Lengkap</label>
                  <input 
                    type="text" required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Jabatan / Posisi</label>
                  <input 
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="Mis: Dokter, Perawat"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Departemen</label>
                  <input 
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Mis: Pelayanan, KIA"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">No. Telepon</label>
                  <input 
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="081234567890"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Tanggal Lahir</label>
                  <input 
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Tanggal Bergabung</label>
                  <input 
                    type="date"
                    value={formData.joinDate}
                    onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" 
                  />
                </div>

                {/* Biodata ASN */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">NIP</label>
                  <input
                    type="text"
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    placeholder="1987xxxxxxxxxxxx"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">NIK</label>
                  <input
                    type="text"
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    placeholder="3273xxxxxxxxxxxx"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Jenis Kelamin</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
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
                    value={formData.placeOfBirth}
                    onChange={(e) => setFormData({ ...formData, placeOfBirth: e.target.value })}
                    placeholder="Kota / Kabupaten"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Status Perkawinan</label>
                  <input
                    type="text"
                    value={formData.maritalStatus}
                    onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                    placeholder="Belum Kawin / Kawin / Duda / Janda"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Agama</label>
                  <input
                    type="text"
                    value={formData.religion}
                    onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                    placeholder="Islam / Kristen / dll"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Pendidikan Terakhir</label>
                  <input
                    type="text"
                    value={formData.lastEducation}
                    onChange={(e) => setFormData({ ...formData, lastEducation: e.target.value })}
                    placeholder="SMA / D3 / S1 / S2"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Pangkat / Golongan</label>
                  <input
                    type="text"
                    value={formData.rankGolongan}
                    onChange={(e) => setFormData({ ...formData, rankGolongan: e.target.value })}
                    placeholder="III/a, III/b, dst"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Status Kepegawaian</label>
                  <input
                    type="text"
                    value={formData.employmentStatus}
                    onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                    placeholder="PNS / Kontrak / Honorer"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Sisa Cuti (hari)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.remainingLeaveDays}
                    onChange={(e) => setFormData({ ...formData, remainingLeaveDays: e.target.value })}
                    placeholder="Mis: 12"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 px-8 pb-8 flex gap-4 border-t border-slate-100">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-4 bg-teal-500 text-white font-bold rounded-2xl shadow-lg shadow-teal-100 hover:bg-teal-600 transition-all"
              >
                {editingUser ? 'Simpan Perubahan' : 'Daftarkan Sekarang'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pegawai</th>
              <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</th>
              <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jabatan</th>
              <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Sisa Cuti</th>
              <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Berkas</th>
              <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            {user.profilePhotoUrl ? (
                              <img 
                                src={user.profilePhotoUrl} 
                                className="w-10 h-10 rounded-full object-cover" 
                                alt="avatar"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`;
                                }}
                              />
                            ) : (
                              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} className="w-10 h-10 rounded-full" alt="avatar" />
                            )}
                            <div>
                              <p className="font-bold text-slate-800">{user.fullName}</p>
                              <p className="text-xs text-slate-400 font-mono">@{user.username}</p>
                            </div>
                          </div>
                        </td>
                <td className="px-8 py-5 text-sm text-slate-600 font-mono">{user.username}</td>
                <td className="px-8 py-5 text-sm text-slate-600">{user.position}</td>
                <td className="px-8 py-5 text-sm text-slate-600 text-center">
                  {typeof user.remainingLeaveDays === 'number' ? `${user.remainingLeaveDays} hari` : '-'}
                </td>
                <td className="px-8 py-5">
                  <div className="flex flex-col items-center">
                    <button 
                      onClick={() => openDocModal(user)}
                      className="group flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-600 rounded-xl hover:bg-teal-500 hover:text-white transition-all border border-teal-100"
                    >
                      <span className="text-xs font-bold">{user.documents.length} Berkas</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    </button>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-100 text-green-700">
                    Aktif
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openDocModal(user)}
                      className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                      title="Lihat Detail Pegawai"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => openModal(user)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Data & Password"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus Pegawai"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="p-20 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-slate-400 font-medium">Tidak ada data ditemukan.</p>
          </div>
        )}
        {totalUsers > 0 && (
          <div className="px-8 py-4 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              {(() => {
                const start = (currentPage - 1) * pageSize + 1;
                const end = Math.min(totalUsers, currentPage * pageSize);
                return `Menampilkan ${start}-${end} dari ${totalUsers} pegawai`;
              })()}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const next = Math.max(1, currentPage - 1);
                  if (next !== currentPage) {
                    loadData(next);
                  }
                }}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-full border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>
              <span className="px-3 text-[11px] font-semibold text-slate-600">
                Hal {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => {
                  const next = Math.min(totalPages, currentPage + 1);
                  if (next !== currentPage) {
                    loadData(next);
                  }
                }}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-full border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Detail Pegawai + Dokumen */}
      {isDocModalOpen && viewingUser && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300">
             <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-teal-500 text-white">
               <div className="flex items-center gap-4">
                 {viewingUser.profilePhotoUrl ? (
                   <img 
                     src={viewingUser.profilePhotoUrl} 
                     className="w-12 h-12 rounded-2xl border-2 border-white/50 object-cover" 
                     alt="avatar"
                     onError={(e) => {
                       (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${viewingUser.id}`;
                     }}
                   />
                 ) : (
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${viewingUser.id}`} className="w-12 h-12 rounded-2xl border-2 border-white/50" alt="avatar" />
                 )}
                 <div>
                   <h2 className="text-xl font-black">{viewingUser.fullName}</h2>
                  <p className="text-xs text-teal-100 font-bold uppercase tracking-widest">{viewingUser.username}</p>
                  <div className="flex flex-wrap gap-2 mt-2 text-[10px] font-semibold">
                    {viewingUser.nip && (
                      <span className="px-2 py-1 rounded-full bg-white/10 border border-white/30">
                        NIP: {viewingUser.nip}
                      </span>
                    )}
                    {typeof viewingUser.remainingLeaveDays === 'number' && (
                      <span className="px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-300 text-emerald-50">
                        Sisa cuti: {viewingUser.remainingLeaveDays} hari
                      </span>
                    )}
                  </div>
                 </div>
               </div>
               <div className="flex items-center gap-2">
                 <button 
                   onClick={() => handleExportEmployeePDF(viewingUser)}
                   className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-all"
                 >
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                   Export PDF
                 </button>
                 <button onClick={closeModal} className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
               </div>
             </div>
             <div className="p-8 max-h-[60vh] overflow-auto space-y-6">
               {/* Informasi Pegawai (detail biodata) */}
               <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5">
                 <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Informasi Pegawai</h3>
                 <div className="grid md:grid-cols-2 gap-3 text-xs text-slate-700">
                   <div>
                     <p className="font-semibold text-slate-400 text-[10px] uppercase tracking-widest">Nama Lengkap</p>
                     <p className="font-semibold">{viewingUser.fullName || '-'}</p>
                   </div>
                   <div>
                     <p className="font-semibold text-slate-400 text-[10px] uppercase tracking-widest">Email</p>
                     <p className="font-mono">{viewingUser.username || '-'}</p>
                   </div>
                   <div>
                     <p className="font-semibold text-slate-400 text-[10px] uppercase tracking-widest">NIP</p>
                     <p className="font-mono">{viewingUser.nip || '-'}</p>
                   </div>
                   <div>
                     <p className="font-semibold text-slate-400 text-[10px] uppercase tracking-widest">NIK</p>
                     <p className="font-mono">{viewingUser.nik || '-'}</p>
                   </div>
                   <div>
                     <p className="font-semibold text-slate-400 text-[10px] uppercase tracking-widest">Jabatan</p>
                     <p>{viewingUser.position || '-'}</p>
                   </div>
                   <div>
                     <p className="font-semibold text-slate-400 text-[10px] uppercase tracking-widest">Departemen</p>
                     <p>{viewingUser.department || '-'}</p>
                   </div>
                   <div>
                     <p className="font-semibold text-slate-400 text-[10px] uppercase tracking-widest">Jenis Kelamin</p>
                     <p>{viewingUser.gender || '-'}</p>
                   </div>
                   <div>
                     <p className="font-semibold text-slate-400 text-[10px] uppercase tracking-widest">Tempat Lahir</p>
                     <p>{viewingUser.placeOfBirth || '-'}</p>
                   </div>
                   <div>
                     <p className="font-semibold text-slate-400 text-[10px] uppercase tracking-widest">Tanggal Lahir</p>
                     <p>
                       {viewingUser.dateOfBirth
                         ? new Date(viewingUser.dateOfBirth).toLocaleDateString('id-ID')
                         : '-'}
                     </p>
                   </div>
                   <div>
                     <p className="font-semibold text-slate-400 text-[10px] uppercase tracking-widest">Tanggal Bergabung</p>
                     <p>
                       {viewingUser.joinDate
                         ? new Date(viewingUser.joinDate).toLocaleDateString('id-ID')
                         : '-'}
                     </p>
                   </div>
                   <div>
                     <p className="font-semibold text-slate-400 text-[10px] uppercase tracking-widest">Status Perkawinan</p>
                     <p>{viewingUser.maritalStatus || '-'}</p>
                   </div>
                   <div>
                     <p className="font-semibold text-slate-400 text-[10px] uppercase tracking-widest">Agama</p>
                     <p>{viewingUser.religion || '-'}</p>
                   </div>
                   <div>
                     <p className="font-semibold text-slate-400 text-[10px] uppercase tracking-widest">Pendidikan Terakhir</p>
                     <p>{viewingUser.lastEducation || '-'}</p>
                   </div>
                   <div>
                     <p className="font-semibold text-slate-400 text-[10px] uppercase tracking-widest">Pangkat / Golongan</p>
                     <p>{viewingUser.rankGolongan || '-'}</p>
                   </div>
                   <div>
                     <p className="font-semibold text-slate-400 text-[10px] uppercase tracking-widest">Status Kepegawaian</p>
                     <p>{viewingUser.employmentStatus || '-'}</p>
                   </div>
                   <div>
                     <p className="font-semibold text-slate-400 text-[10px] uppercase tracking-widest">Sisa Cuti (hari)</p>
                     <p className="font-semibold text-emerald-600">
                       {typeof viewingUser.remainingLeaveDays === 'number'
                         ? `${viewingUser.remainingLeaveDays} hari`
                         : '-'}
                     </p>
                   </div>
                 </div>
               </div>

               {/* Checklist dokumen */}
               {isLoadingDocuments ? (
                 <div className="p-10 text-center">
                   <div className="animate-spin inline-block w-8 h-8 border-4 rounded-full border-t-teal-500 border-teal-200"></div>
                   <p className="text-slate-400 font-medium mt-4">Memuat dokumen...</p>
                 </div>
               ) : (
                 <div className="grid gap-4">
                   {docTypes.length === 0 ? (
                     <div className="p-10 text-center text-slate-400 italic">
                       Belum ada jenis dokumen yang dikonfigurasi.
                     </div>
                   ) : (
                     docTypes.map(type => {
                       const doc = viewingUserDocuments.find(d => d.documentTypeId === type.id);
                       return (
                         <div key={type.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-teal-200 transition-all group">
                           <div className="flex items-center gap-4">
                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${doc ? 'bg-teal-100 text-teal-600' : 'bg-slate-200 text-slate-400'}`}>
                               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                             </div>
                             <div>
                               <p className="font-bold text-slate-800">{type.name}</p>
                               <p className="text-[10px] font-black uppercase tracking-widest mt-0.5">
                                 {type.isRequired ? <span className="text-red-500">Wajib</span> : <span className="text-slate-400">Opsional</span>}
                               </p>
                             </div>
                           </div>
                           
                           <div className="flex items-center gap-3">
                             {doc ? (
                               <>
                                 <div className="text-right mr-2 hidden md:block">
                                   <p className="text-[10px] font-bold text-slate-400 uppercase">Diunggah pada</p>
                                   <p className="text-xs font-bold text-slate-600">{new Date(doc.uploadedAt).toLocaleDateString('id-ID')}</p>
                                 </div>
                                 <a 
                                   href={doc.fileUrl} 
                                   target="_blank" 
                                   rel="noreferrer"
                                   className="px-5 py-2.5 bg-teal-500 text-white text-xs font-bold rounded-xl hover:bg-teal-600 shadow-lg shadow-teal-100 transition-all flex items-center gap-2"
                                 >
                                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                   Lihat Berkas
                                 </a>
                               </>
                             ) : (
                               <span className="text-[10px] font-black text-slate-300 uppercase italic">Belum tersedia</span>
                             )}
                           </div>
                         </div>
                       );
                     })
                   )}
                 </div>
               )}
             </div>
             <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
                <button onClick={closeModal} className="px-8 py-3 bg-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-300 transition-colors">Tutup Jendela</button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MasterKaryawan;
