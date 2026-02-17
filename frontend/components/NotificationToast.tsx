
import React, { useEffect } from 'react';

interface Props {
  content: string;
  onClose: () => void;
}

const NotificationToast: React.FC<Props> = ({ content, onClose }) => {
  if (!content) return null;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [content, onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-[200] w-72 bg-white rounded-2xl shadow-lg border-l-4 border-amber-500 overflow-hidden animate-in slide-in-from-right duration-300">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notifikasi</span>
        </div>
        <div className="text-sm text-slate-700 font-medium whitespace-pre-line max-h-40 overflow-auto">
          {content}
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;
