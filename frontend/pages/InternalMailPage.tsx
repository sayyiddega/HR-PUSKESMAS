import React, { useState, useEffect } from 'react';
import { User } from '../types';
import * as MessageApi from '../src/api/message';
import type { Employee } from '../src/api/employee';
import { showNotification } from '../src/utils/notification';

const InternalMailPage: React.FC<{ user: User, onUnreadCountChange?: () => void }> = ({ user, onUnreadCountChange }) => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'compose'>('inbox');
  const [inboxMessages, setInboxMessages] = useState<MessageApi.InternalMessage[]>([]);
  const [sentMessages, setSentMessages] = useState<MessageApi.InternalMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<MessageApi.InternalMessage | null>(null);
  const [threadMessages, setThreadMessages] = useState<MessageApi.InternalMessage[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [composeData, setComposeData] = useState({
    receiverIds: [] as string[],
    subject: '',
    body: '',
    replyToId: null as number | null
  });
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [recipientQuery, setRecipientQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadUnreadCount();
    }, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === 'inbox') {
      loadInbox();
    } else if (activeTab === 'sent') {
      loadSent();
    }
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadInbox(),
        loadSent(),
        loadEmployees(),
        loadUnreadCount()
      ]);
    } catch (err: any) {
      showNotification(`Gagal memuat data: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadInbox = async () => {
    const messages = await MessageApi.messageApi.getInbox();
    setInboxMessages(messages);
  };

  const loadSent = async () => {
    const messages = await MessageApi.messageApi.getSent();
    setSentMessages(messages);
    return messages;
  };

  const loadEmployees = async () => {
    try {
      const emps = await MessageApi.messageApi.getRecipients();
      // Filter out current user and include all employees for admin/employee
      setEmployees(emps.filter(e => e.id.toString() !== user.id));
    } catch (err: any) {
      showNotification(`Gagal memuat daftar pegawai: ${err.message}`, 'error');
      setEmployees([]);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await MessageApi.messageApi.getUnreadCount();
      setUnreadCount(count);
    } catch (err: any) {
      // Silently fail for unread count
      console.error('Failed to load unread count:', err);
      setUnreadCount(0);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (composeData.receiverIds.length === 0 || !composeData.subject || !composeData.body) {
      showNotification('Semua field harus diisi', 'error');
      return;
    }

    setIsSending(true);
    try {
      const sent = await MessageApi.messageApi.send({
        receiverIds: composeData.receiverIds.map(id => parseInt(id)),
        subject: composeData.subject,
        body: composeData.body,
        replyToId: composeData.replyToId
      }, attachmentFile || undefined);
      showNotification(`Pesan berhasil dikirim ke ${sent.length} penerima!`, 'success');
      setComposeData({ receiverIds: [], subject: '', body: '', replyToId: null });
      setAttachmentFile(null);
      setRecipientQuery('');
      setShowSuggestions(false);
      setActiveTab('sent');
      
      // Set selected message and load thread immediately
      const latest = sent[0];
      if (latest && latest.threadId) {
        setSelectedMessage(latest);
        setThreadMessages([latest]); // Show immediately
        try {
          const thread = await MessageApi.messageApi.getThreadByThreadId(latest.threadId);
          setThreadMessages(thread.length > 0 ? thread : [latest]);
        } catch (err: any) {
          console.error('Failed to load thread:', err);
          setThreadMessages([latest]);
        }
      } else if (latest) {
        setSelectedMessage(latest);
        setThreadMessages([latest]);
      }
      
      await loadSent();
      await loadUnreadCount();
      if (onUnreadCountChange) onUnreadCountChange();
    } catch (err: any) {
      showNotification(`Gagal mengirim pesan: ${err.message}`, 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleViewMessage = async (msg: MessageApi.InternalMessage) => {
    setSelectedMessage(msg);
    setThreadMessages([msg]); // Show immediately while loading
    try {
      if (msg.threadId) {
        const thread = await MessageApi.messageApi.getThreadByThreadId(msg.threadId);
        setThreadMessages(thread.length > 0 ? thread : [msg]);
      } else {
        // Fallback: try to get thread by message ID
        try {
          const thread = await MessageApi.messageApi.getThreadById(msg.id);
          setThreadMessages(thread.length > 0 ? thread : [msg]);
        } catch {
          setThreadMessages([msg]);
        }
      }
    } catch (err: any) {
      console.error('Failed to load thread:', err);
      setThreadMessages([msg]);
    }
    if (!msg.isRead && msg.receiverId.toString() === user.id) {
      try {
        await MessageApi.messageApi.markAsRead(msg.id);
        await loadInbox();
        await loadUnreadCount();
        if (onUnreadCountChange) onUnreadCountChange();
      } catch (err: any) {
        console.error('Failed to mark as read:', err);
      }
    }
  };

  const handleReply = () => {
    if (!selectedMessage) return;
    setActiveTab('compose');
    setComposeData({
      receiverIds: [selectedMessage.senderId.toString()],
      subject: normalizeSubject(selectedMessage.subject),
      body: '',
      replyToId: selectedMessage.id
    });
    setAttachmentFile(null);
    setRecipientQuery('');
    setShowSuggestions(false);
  };

  const addRecipient = (emp: Employee) => {
    const id = emp.id.toString();
    if (composeData.receiverIds.includes(id)) return;
    setComposeData({
      ...composeData,
      receiverIds: [...composeData.receiverIds, id]
    });
    setRecipientQuery('');
    setShowSuggestions(false);
  };

  const removeRecipient = (id: string) => {
    setComposeData({
      ...composeData,
      receiverIds: composeData.receiverIds.filter(rid => rid !== id)
    });
  };

  const filteredEmployees = employees.filter(emp => {
    const query = recipientQuery.trim().toLowerCase();
    if (!query) return true;
    const name = (emp.fullName || '').toLowerCase();
    const email = (emp.email || '').toLowerCase();
    const position = (emp.position || '').toLowerCase();
    return name.includes(query) || email.includes(query) || position.includes(query);
  }).filter(emp => !composeData.receiverIds.includes(emp.id.toString())).slice(0, 8);

  const normalizeSubject = (subject: string) => (subject || '').trim();

  const handleDelete = async (id: number) => {
    if (!window.confirm('Hapus pesan ini?')) return;
    try {
      await MessageApi.messageApi.delete(id);
      showNotification('Pesan berhasil dihapus', 'success');
      await loadInbox();
      await loadSent();
      setSelectedMessage(null);
    } catch (err: any) {
      showNotification(`Gagal menghapus pesan: ${err.message}`, 'error');
    }
  };

  const currentMessages = activeTab === 'inbox' ? inboxMessages : sentMessages;

  // Group by threadId and get latest message per thread
  const latestByThread = currentMessages.reduce((acc, msg) => {
    const threadId = msg.threadId || msg.id; // Use threadId if available, otherwise use message id
    const existing = acc[threadId];
    if (!existing || new Date(msg.createdAt).getTime() > new Date(existing.createdAt).getTime()) {
      acc[threadId] = msg;
    }
    return acc;
  }, {} as Record<number, MessageApi.InternalMessage>);

  const latestEntries = Object.values(latestByThread).sort((a, b) => {
    const aDate = new Date(a.createdAt).getTime();
    const bDate = new Date(b.createdAt).getTime();
    return bDate - aDate;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 mb-1">Surat Menyurat Internal</h1>
          <p className="text-slate-500">Kirim dan terima pesan internal antar pegawai</p>
        </div>
        <button
          onClick={() => { setActiveTab('compose'); setSelectedMessage(null); setThreadMessages([]); setComposeData({receiverIds: [], subject: '', body: '', replyToId: null}); setAttachmentFile(null); }}
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-amber-100 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
          Tulis Pesan
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6">
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => { setActiveTab('inbox'); setSelectedMessage(null); setThreadMessages([]); }}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                  activeTab === 'inbox' 
                    ? 'bg-amber-600 text-white shadow-lg' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Kotak Masuk {unreadCount > 0 && <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{unreadCount}</span>}
              </button>
              <button
                onClick={() => { setActiveTab('sent'); setSelectedMessage(null); setThreadMessages([]); }}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                  activeTab === 'sent' 
                    ? 'bg-amber-600 text-white shadow-lg' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Terkirim
              </button>
            </div>

            {activeTab === 'compose' ? (
              <form onSubmit={handleSend} className="space-y-4">
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Kepada</label>
                  <div className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus-within:ring-2 focus-within:ring-amber-500 outline-none">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {composeData.receiverIds.map(id => {
                        const emp = employees.find(e => e.id.toString() === id);
                        if (!emp) return null;
                        return (
                          <span key={id} className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                            {emp.fullName}
                            <button type="button" onClick={() => removeRecipient(id)} className="text-amber-700 hover:text-amber-900">×</button>
                          </span>
                        );
                      })}
                    </div>
                    <input
                      type="text"
                      value={recipientQuery}
                      onChange={(e) => { setRecipientQuery(e.target.value); setShowSuggestions(true); }}
                      onFocus={() => setShowSuggestions(true)}
                      placeholder="Ketik nama atau email..."
                      className="w-full bg-transparent outline-none text-sm"
                      required={composeData.receiverIds.length === 0}
                    />
                  </div>
                  {showSuggestions && filteredEmployees.length > 0 && (
                    <div className="absolute z-10 mt-2 w-full bg-white border border-slate-100 rounded-xl shadow-lg max-h-60 overflow-auto">
                      {filteredEmployees.map(emp => (
                        <button
                          type="button"
                          key={emp.id}
                          onClick={() => addRecipient(emp)}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors"
                        >
                          <p className="text-sm font-bold text-slate-800">{emp.fullName}</p>
                          <p className="text-xs text-slate-500">{emp.email || '-'} {emp.position ? `• ${emp.position}` : ''}</p>
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400 mt-2">Ketik nama untuk muncul saran, klik untuk pilih.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Subjek</label>
                  <input
                    type="text"
                    value={composeData.subject}
                    onChange={(e) => setComposeData({...composeData, subject: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-amber-600 outline-none"
                    placeholder="Subjek pesan"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Isi Pesan</label>
                  <textarea
                    value={composeData.body}
                    onChange={(e) => setComposeData({...composeData, body: e.target.value})}
                    rows={6}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-amber-600 outline-none"
                    placeholder="Tulis pesan Anda di sini..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Lampiran (Opsional)</label>
                  <input
                    type="file"
                    onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                  />
                  {attachmentFile && (
                    <p className="text-xs text-slate-500 mt-2">Terpilih: {attachmentFile.name}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('inbox'); setComposeData({receiverIds: [], subject: '', body: '', replyToId: null}); setAttachmentFile(null); }}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSending}
                    className="flex-1 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-all disabled:opacity-50"
                  >
                    {isSending ? 'Mengirim...' : 'Kirim'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {isLoading ? (
                  <div className="p-10 text-center">
                    <div className="animate-spin inline-block w-6 h-6 border-3 rounded-full border-t-amber-500 border-amber-200"></div>
                  </div>
                ) : currentMessages.length === 0 ? (
                  <div className="p-10 text-center text-slate-400">Tidak ada pesan</div>
                ) : (
                  latestEntries.map(msg => (
                    <div
                      key={msg.id}
                      onClick={() => handleViewMessage(msg)}
                      className={`p-4 rounded-xl cursor-pointer transition-all mb-3 ${
                        selectedMessage?.threadId === msg.threadId || selectedMessage?.id === msg.id
                          ? 'bg-amber-50 border-2 border-amber-500'
                          : msg.isRead || activeTab === 'sent'
                          ? 'bg-slate-50 hover:bg-slate-100 border border-slate-100'
                          : 'bg-blue-50 hover:bg-blue-100 border border-blue-100'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-bold text-slate-800 text-sm">
                          {activeTab === 'inbox' ? msg.senderName : msg.receiverName}
                        </p>
                        {!msg.isRead && activeTab === 'inbox' && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-600 truncate mb-1">{normalizeSubject(msg.subject)}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(msg.createdAt).toLocaleDateString('id-ID')} • {new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
              <div className="flex items-start justify-between mb-6 pb-6 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900 mb-2">{selectedMessage.subject}</h2>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-bold text-slate-400">Dari:</span> {selectedMessage.senderName} {selectedMessage.senderEmail && `(${selectedMessage.senderEmail})`}</p>
                    <p><span className="font-bold text-slate-400">Kepada:</span> {selectedMessage.receiverName} {selectedMessage.receiverEmail && `(${selectedMessage.receiverEmail})`}</p>
                    <p><span className="font-bold text-slate-400">Tanggal:</span> {new Date(selectedMessage.createdAt).toLocaleString('id-ID')}</p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={handleReply}
                      className="px-4 py-2 bg-amber-50 text-amber-700 text-sm font-bold rounded-xl hover:bg-amber-100 transition-all"
                    >
                      Balas
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(selectedMessage.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
              <div className="space-y-6">
                {threadMessages.length === 0 ? (
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{selectedMessage.body}</p>
                ) : (
                  threadMessages.map((msg, idx) => (
                    <div key={msg.id} className={`p-4 rounded-xl border ${idx === threadMessages.length - 1 ? 'border-amber-200 bg-amber-50/40' : 'border-slate-100 bg-white'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs text-slate-500">
                          <span className="font-bold text-slate-700">{msg.senderName}</span>{' '}
                          <span className="text-slate-400">→</span>{' '}
                          <span className="font-bold text-slate-700">{msg.receiverName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(msg.createdAt).toLocaleString('id-ID')}
                        </div>
                      </div>
                      <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {msg.body}
                      </div>
                      {msg.attachmentUrl && (
                        <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Lampiran</p>
                          <a
                            href={msg.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-amber-600 font-bold text-xs hover:underline"
                          >
                            {msg.attachmentName || 'Download Lampiran'}
                          </a>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-20 text-center">
              <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <p className="text-slate-400 font-medium">Pilih pesan untuk melihat detail</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InternalMailPage;
