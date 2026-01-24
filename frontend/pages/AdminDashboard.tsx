
import React, { useMemo, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import * as DashboardApi from '../src/api/dashboard';

const AdminDashboard: React.FC = () => {
  const [dashboardStats, setDashboardStats] = useState<DashboardApi.AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const stats = await DashboardApi.dashboardApi.getAdminStats();
      setDashboardStats(stats);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Stats
  const stats = useMemo(() => {
    if (!dashboardStats) return [];
    return [
      { label: 'Total Pegawai', value: dashboardStats.totalEmployees, color: 'bg-blue-500', icon: '👥' },
      { label: 'Pengajuan Cuti Pending', value: dashboardStats.pendingLeaves, color: 'bg-amber-500', icon: '⏳' },
      { label: 'Dokumen Perlu Review', value: dashboardStats.documentsNeedReview, color: 'bg-purple-500', icon: '📄' },
      { label: 'Pegawai Aktif', value: dashboardStats.totalEmployees, color: 'bg-teal-500', icon: '✅' },
    ];
  }, [dashboardStats]);

  // Chart Data: Status Dokumen
  const docStatusData = useMemo(() => {
    if (!dashboardStats) return [];
    return [
      { name: 'Lengkap', value: dashboardStats.employeesWithCompleteDocs, color: '#10b981' },
      { name: 'Belum Lengkap', value: dashboardStats.employeesWithIncompleteDocs, color: '#f59e0b' },
    ];
  }, [dashboardStats]);

  // Chart Data: Distribusi Posisi
  const positionData = useMemo(() => {
    if (!dashboardStats || !dashboardStats.positionDistribution) return [];
    return Object.entries(dashboardStats.positionDistribution).map(([name, count]) => ({ name, count }));
  }, [dashboardStats]);

  // Calculate completion percentage
  const completionPercent = useMemo(() => {
    if (!dashboardStats || dashboardStats.totalEmployees === 0) return 0;
    return Math.round((dashboardStats.employeesWithCompleteDocs / dashboardStats.totalEmployees) * 100);
  }, [dashboardStats]);

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
      <div className="mb-10">
        <h1 className="text-2xl font-black text-slate-900 mb-1">Analitik Kepegawaian</h1>
        <p className="text-slate-500">Ringkasan data dan performa administrasi hari ini.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 ${stat.color} text-white rounded-2xl flex items-center justify-center text-xl mb-4 shadow-lg shadow-current/20`}>
              {stat.icon}
            </div>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
            <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-8">Distribusi Jabatan Pegawai</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={positionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#0ea5e9" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Kelengkapan Berkas</h3>
          <p className="text-xs text-slate-400 mb-8">Berdasarkan total dokumen wajib</p>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={docStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {docStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
              <span className="text-2xl font-black text-slate-800">{completionPercent}%</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Lengkap</span>
            </div>
          </div>
          <div className="space-y-3 mt-6">
            {docStatusData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.color}}></div>
                  <span className="text-slate-600 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-800">{item.value} Org</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Section - Removed mock data, can be added later if needed */}
    </div>
  );
};

export default AdminDashboard;
