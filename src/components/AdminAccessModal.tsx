import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  AlertCircle, 
  Command
} from 'lucide-react';
import { authService } from '../services/authService';
import { UserProfile, PageView } from '../types';

interface AdminAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (adminUser: UserProfile) => void;
  onNavigate: (view: PageView) => void;
}

export const AdminAccessModal: React.FC<AdminAccessModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onNavigate
}) => {
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handlePasskeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passkey.trim()) {
      setError('प्रशासक लॉगिन हेतु पासवर्ड दर्ज करना अनिवार्य है।');
      return;
    }
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const res = authService.verifyAdminPasskey(passkey);
      setIsLoading(false);
      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
        onNavigate({ type: 'admin' });
      } else {
        setError(res.error || 'गलत पासवर्ड! कृपया सही व्यवस्थापक पासवर्ड प्रविष्ट करें।');
      }
    }, 300);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-5 sm:p-6 relative border-b border-amber-500/30">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase">
                SECURITY ACCESS
              </span>
              <h3 className="font-bold text-base sm:text-lg text-white">
                प्रशासक पोर्टल प्रवेश (Admin / Me)
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            यह अनुभाग केवल मुख्य पोर्टल व्यवस्थापक एवं संपादकीय नियंत्रण हेतु आरक्षित है।
          </p>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Admin Identity Box */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                मुख्य व्यवस्थापक पहचान (Admin / Me)
              </span>
              <span className="text-[10px] bg-amber-200/70 text-amber-900 font-mono font-bold px-1.5 py-0.5 rounded">
                aftab.mohd9@gmail.com
              </span>
            </div>
            <p className="text-xs text-amber-950">
              आफताब मोहम्मद (Admin/Me) — व्यवस्थापक पोर्टल अनलॉक करने के लिए अपना पासवर्ड दर्ज करें।
            </p>
          </div>

          {/* Password Input Form */}
          <form onSubmit={handlePasskeySubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                व्यवस्थापक पासवर्ड (Admin Password)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={passkey}
                  onChange={e => setPasskey(e.target.value)}
                  placeholder="प्रशासक पासवर्ड प्रविष्ट करें"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>{isLoading ? 'सत्यापित किया जा रहा है...' : 'पासवर्ड सत्यापित करें व एडमिन पोर्टल खोलें'}</span>
            </button>
          </form>

          {/* Quick Access Info / Shortcuts */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
            <p className="font-bold text-slate-800 flex items-center gap-1.5">
              <Command className="w-3.5 h-3.5 text-blue-600" />
              एडमिन पोर्टल एक्सेस के अन्य त्वरित तरीके:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
              <li>
                कीबोर्ड शॉर्टकट: <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-mono font-bold text-slate-800">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-mono font-bold text-slate-800">Shift</kbd> + <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-mono font-bold text-slate-800">A</kbd> (मैक पर <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-mono font-bold text-slate-800">Cmd</kbd> + <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-mono font-bold text-slate-800">Shift</kbd> + <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-mono font-bold text-slate-800">A</kbd>)
              </li>
              <li>
                वेबसाइट फुटर (निचला भाग) में <span className="font-bold text-slate-800">"प्रशासक प्रवेश"</span> लॉक आइकन पर क्लिक करें।
              </li>
              <li>
                ब्राउज़र एड्रेस बार में URL के अंत में <span className="font-mono text-blue-700 font-bold">#admin</span> जोड़कर एंटर दबाएं।
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
