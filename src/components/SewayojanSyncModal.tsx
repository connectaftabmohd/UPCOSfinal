import React, { useState, useEffect } from 'react';
import {
  X,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Clock,
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  AlertCircle,
  Sliders,
  Sparkles,
  Zap
} from 'lucide-react';
import {
  SewayojanJob,
  fetchSewayojanJobs,
  syncSewayojanJobsToNewsBlog,
  getSewayojanSyncSettings,
  saveSewayojanSyncSettings,
  SewayojanSyncSettings,
  SyncResult
} from '../services/sewayojanSyncService';
import { getStoredNews } from '../data/contentStore';

interface SewayojanSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncSuccess?: (result: SyncResult) => void;
}

export const SewayojanSyncModal: React.FC<SewayojanSyncModalProps> = ({
  isOpen,
  onClose,
  onSyncSuccess,
}) => {
  const [jobs, setJobs] = useState<SewayojanJob[]>([]);
  const [settings, setSettings] = useState<SewayojanSyncSettings>(getSewayojanSyncSettings);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [publishedJobCodes, setPublishedJobCodes] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    const fetchedJobs = await fetchSewayojanJobs();
    setJobs(fetchedJobs);

    const currentNews = getStoredNews();
    const publishedCodes = fetchedJobs
      .filter((job) =>
        currentNews.some(
          (n) =>
            n.id === `sewayojan-news-${job.jobId}` ||
            n.title.includes(job.jobCode) ||
            n.title.includes(job.postName)
        )
      )
      .map((j) => j.jobCode);

    setPublishedJobCodes(publishedCodes);
    setSettings(getSewayojanSyncSettings());
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);

    try {
      const result = await syncSewayojanJobsToNewsBlog();
      await loadData();

      if (result.newPostsCount > 0) {
        setSyncMessage(`सफलता: सेवायोजन पोर्टल से ${result.newPostsCount} नई भर्तियां ताज़ा खबरें ब्लॉग में सफलतापूर्वक जोड़ी गईं!`);
      } else {
        setSyncMessage('सभी उपलब्ध सेवायोजन जॉब्स पहले से ही ताज़ा खबरें ब्लॉग में अद्यतित (अप-टू-डेट) हैं।');
      }

      if (onSyncSuccess) {
        onSyncSuccess(result);
      }
    } catch {
      setSyncMessage('सिंक करने में समस्या आई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleToggleAutoSync = () => {
    const updated = saveSewayojanSyncSettings({
      autoSyncEnabled: !settings.autoSyncEnabled,
    });
    setSettings(updated);
  };

  const handleIntervalChange = (mins: number) => {
    const updated = saveSewayojanSyncSettings({
      syncIntervalMinutes: mins,
    });
    setSettings(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-6 flex items-start justify-between gap-3 border-b border-blue-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
              <Zap className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Live Sync Engine
                </span>
                <span className="text-blue-300 text-xs flex items-center gap-1 font-mono">
                  sewayojan.up.nic.in/jobs.aspx
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-extrabold text-white mt-0.5">
                सेवायोजन पोर्टल ऑटो-अपडेट तकनीक
              </h2>
              <p className="text-xs text-blue-200 mt-1 max-w-2xl leading-relaxed">
                उत्तर प्रदेश रोजगार संगम / सेवायोजन पोर्टल पर प्रकाशित आउटसोर्स और संविदा नौकरियों को स्वतः स्कैन कर 'ताज़ा खबरें' ब्लॉग में संपूर्ण विवरण के साथ पोस्ट करने का इंजन।
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition"
            title="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Controls & Info Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">ऑटो-सिंक स्थिति:</span>
              <button
                onClick={handleToggleAutoSync}
                className={`px-2.5 py-1 rounded-full text-[11px] font-black flex items-center gap-1.5 transition ${
                  settings.autoSyncEnabled
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-200 text-slate-700 border border-slate-300'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    settings.autoSyncEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                  }`}
                />
                {settings.autoSyncEnabled ? 'सक्रिय (Active)' : 'निष्क्रिय (Paused)'}
              </button>
            </div>

            <div className="text-slate-600 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>अंतिम सिंक: <strong>{settings.lastSyncTime || 'अभी तक नहीं'}</strong></span>
            </div>

            <div className="flex items-center gap-1 text-slate-600">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span>अवधि:</span>
              <select
                value={settings.syncIntervalMinutes}
                onChange={(e) => handleIntervalChange(Number(e.target.value))}
                className="bg-white border border-slate-300 text-slate-800 rounded-md text-xs py-0.5 px-1.5 font-medium"
              >
                <option value={15}>15 मिनट</option>
                <option value={30}>30 मिनट</option>
                <option value={60}>1 घंटा</option>
                <option value={360}>6 घंटे</option>
                <option value={1440}>24 घंटे</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'सिंक हो रहा है...' : 'अभी सिंक करें (Sync Now)'}</span>
            </button>

            <a
              href="https://sewayojan.up.nic.in/jobs.aspx"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition"
              title="सरकारी सेवायोजन पोर्टल खोलें"
            >
              <span>पोर्टल देखें</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Sync message if present */}
        {syncMessage && (
          <div className="px-4 sm:px-6 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncMessage}</span>
          </div>
        )}

        {/* Job List Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-600 font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-blue-900" />
              <span>
                सेवायोजन पोर्टल पर सक्रिय आउटसोर्सिंग रिक्तियां ({jobs.length})
              </span>
            </span>
            <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
              {publishedJobCodes.length} ब्लॉग में प्रकाशित / {jobs.length - publishedJobCodes.length} नए
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {jobs.map((job) => {
              const isPublished = publishedJobCodes.includes(job.jobCode);

              return (
                <div
                  key={job.jobId}
                  className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                    isPublished
                      ? 'bg-white border-slate-200 shadow-2xs'
                      : 'bg-amber-50/50 border-amber-300 shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        {job.jobCode}
                      </span>
                      {isPublished ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          ब्लॉग में लाइव
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-800 bg-amber-200 px-2 py-0.5 rounded-full">
                          <Sparkles className="w-3 h-3" />
                          सिंक के लिए तैयार
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                      {job.postName} ({job.totalVacancies} पद)
                    </h3>

                    <div className="mt-2.5 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{job.department}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{job.district}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>अंतिम तिथि: <strong>{job.lastDate}</strong></span>
                      </div>
                      <div className="text-[11px] text-slate-500 bg-slate-100 p-1.5 rounded-md">
                        <strong>मानदेय:</strong> {job.monthlySalary} | <strong>सेवाप्रदाता:</strong> {job.agencyName}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <a
                      href={job.directApplyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:text-blue-900 font-semibold inline-flex items-center gap-1 text-[11px]"
                    >
                      <span>sewayojan.up.nic.in लिंक</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <span className="text-[10px] text-slate-400">
                      पोस्ट तिथि: {job.postedDate}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Technical Explainer Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-slate-700 mt-4">
            <h4 className="font-extrabold text-blue-950 flex items-center gap-1.5 mb-1 text-sm">
              <AlertCircle className="w-4 h-4 text-blue-700 shrink-0" />
              <span>यह ऑटोमेशन तकनीक कैसे काम करती है?</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-blue-900/90 pl-1 leading-relaxed">
              <li>
                <strong>सोर्स वेरिफिकेशन:</strong> इंजन सीधे उत्तर प्रदेश सरकार के पोर्टल{' '}
                <code className="bg-blue-100 px-1 py-0.2 rounded font-mono text-[11px]">https://sewayojan.up.nic.in/jobs.aspx</code>{' '}
                के आउटसोर्सिंग व संविदा भर्ती डेटा को मॉनिटर करता है।
              </li>
              <li>
                <strong>स्मार्ट ऑटो-कन्वर्जन:</strong> जैसे ही कोई नया जॉब कोड जारी होता है, यह स्वतः हिंदी में पूर्ण ब्लॉग आर्टिकल (पद, योग्यता, मानदेय, सेवाप्रदाता, आवेदन विधि) तैयार करता है।
              </li>
              <li>
                <strong>ऑटो-पब्लिशिंग:</strong> तैयार पोस्ट तत्काल आपके 'ताज़ा खबरें' ब्लॉग व ब्रेकिंग न्यूज़ टिकर में जुड़ जाती है।
              </li>
              <li>
                <strong>डुप्लीकेशन रोक:</strong> पूर्व में प्रकाशित पदों के जॉब कोड को ट्रैक कर दोबारा पब्लिश होने से रोकता है।
              </li>
            </ol>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <span className="text-slate-500 text-[11px]">
            डेटा स्रोत: रोजगार संगम एवं सेवायोजन विभाग, उत्तर प्रदेश शासन
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>सभी नए पद ब्लॉग में जोड़ें</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-300 transition"
            >
              बंद करें
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
