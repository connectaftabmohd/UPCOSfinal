import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  SlidersHorizontal,
  ChevronRight,
  Briefcase
} from 'lucide-react';
import { 
  syncSewayojanJobsToNewsBlog, 
  getSewayojanSyncSettings,
  SyncResult 
} from '../services/sewayojanSyncService';

interface SewayojanSyncBannerProps {
  onSyncComplete?: (result: SyncResult) => void;
  onOpenModal: () => void;
  compact?: boolean;
}

export const SewayojanSyncBanner: React.FC<SewayojanSyncBannerProps> = ({
  onSyncComplete,
  onOpenModal,
  compact = false,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncText, setLastSyncText] = useState<string>('आज, 10:30 AM');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const settings = getSewayojanSyncSettings();
    if (settings.lastSyncTime) {
      setLastSyncText(settings.lastSyncTime);
    }
  }, []);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setToastMessage(null);
    try {
      const result = await syncSewayojanJobsToNewsBlog();
      const settings = getSewayojanSyncSettings();
      if (settings.lastSyncTime) {
        setLastSyncText(settings.lastSyncTime);
      }

      if (result.newPostsCount > 0) {
        setToastMessage(`🎉 सेवायोजन से ${result.newPostsCount} नए पद ताज़ा खबरें ब्लॉग में जुड़ गए!`);
      } else {
        setToastMessage('✅ ब्लॉग अद्यतित (Up to date) है। कोई नया पद शेष नहीं है।');
      }

      if (onSyncComplete) {
        onSyncComplete(result);
      }

      setTimeout(() => {
        setToastMessage(null);
      }, 5000);
    } catch {
      setToastMessage('सिंक में त्रुटि हुई। कृपया दोबारा प्रयास करें।');
    } finally {
      setIsSyncing(false);
    }
  };

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white rounded-xl p-3 shadow-sm border border-blue-800 flex flex-wrap items-center justify-between gap-3 text-xs mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-xs">सेवायोजन ऑटो-पोस्ट तकनीक</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-300 font-bold">LIVE SYNC</span>
            </div>
            <p className="text-[11px] text-blue-200">
              सोर्स: <span className="font-mono text-amber-300">sewayojan.up.nic.in/jobs.aspx</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-lg transition text-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'सिंक हो रहा है...' : 'अभी सिंक करें'}</span>
          </button>

          <button
            onClick={onOpenModal}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition text-xs font-medium"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>कंट्रोल</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 shadow-md border border-blue-900/80 mb-8 relative overflow-hidden">
      {/* Background glow decoration */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left info */}
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
            <Zap className="w-6 h-6 text-slate-950" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                ऑटो-अपडेट तकनीक
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                सक्रिय (Auto-Sync Active)
              </span>
              <span className="text-[11px] text-blue-300 flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-400" />
                अंतिम सिंक: <strong className="text-white">{lastSyncText}</strong>
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>सेवायोजन पोर्टल आउटसोर्स जॉब्स ऑटो-सिंक</span>
            </h3>

            <p className="text-xs text-blue-200 mt-0.5 max-w-2xl leading-relaxed">
              यह मॉड्यूल आधिकारिक उत्तर प्रदेश सरकारी पोर्टल{' '}
              <a
                href="https://sewayojan.up.nic.in/jobs.aspx"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-300 underline font-mono hover:text-amber-200 inline-flex items-center gap-0.5"
              >
                <span>sewayojan.up.nic.in/jobs.aspx</span>
                <ExternalLink className="w-2.5 h-2.5 inline" />
              </a>{' '}
              से संविदा व आउटसोर्स पदों को स्वतः ट्रैक कर 'ताज़ा खबरें' ब्लॉग में संपूर्ण विवरण (मानदेय, पद, एजेंसी, अंतिम तिथि) के साथ प्रकाशित करता है।
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
            title="सेवायोजन पोर्टल से नए जॉब्स अभी सिंक करें"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'सिंक हो रहा है...' : 'अभी सिंक करें (Sync Now)'}</span>
          </button>

          <button
            onClick={onOpenModal}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/15 transition cursor-pointer"
          >
            <Briefcase className="w-3.5 h-3.5 text-blue-300" />
            <span>जॉब लिस्ट व सेटिंग्स</span>
          </button>
        </div>
      </div>

      {/* Dynamic Toast feedback */}
      {toastMessage && (
        <div className="mt-3 pt-3 border-t border-blue-900/60 flex items-center justify-between text-xs font-medium text-amber-200 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-blue-300 hover:text-white text-[11px]"
          >
            हटाएं
          </button>
        </div>
      )}
    </div>
  );
};
