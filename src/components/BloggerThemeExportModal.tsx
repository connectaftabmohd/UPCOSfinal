import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  FileCode, 
  ExternalLink, 
  Upload, 
  HelpCircle, 
  Layers, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { generateBloggerThemeXml } from '../utils/bloggerThemeGenerator';

interface BloggerThemeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BloggerThemeExportModal: React.FC<BloggerThemeExportModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'guide' | 'code'>('guide');

  if (!isOpen) return null;

  const xmlCode = generateBloggerThemeXml();

  const handleDownload = () => {
    const blob = new Blob([xmlCode], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'uposn-blogger-theme.xml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(xmlCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-linear-to-r from-blue-900 via-blue-950 to-slate-900 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg shadow-sm">
              B
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg">Blogger.com थीम एक्सपोर्टर</h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Ready (.XML)
                </span>
              </div>
              <p className="text-xs text-blue-200">
                UP Outsource Seva Nigam पोर्टल को सीधे अपने Blogger / Blogspot ब्लॉग पर इंस्टॉल करें
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'guide'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>इंस्टॉलेशन गाइड (Setup Guide)</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'code'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>XML कोड देखें (View XML)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">कॉपी हुआ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>कोड कॉपी करें</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-extrabold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>.XML फाइल डाउनलोड करें</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 text-slate-800 text-sm">
          {activeTab === 'guide' ? (
            <div className="space-y-5">
              {/* Highlight Banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                  <strong>पूर्ण ब्लॉगर अनुकूलित थीम:</strong> यह थीम ब्लॉगर (Blogspot) के आधिकारिक XML प्रारूप में निर्मित है। इसमें हिंदी देवनागरी फॉन्ट (Noto Sans Devanagari), उत्तर प्रदेश शासन समाचार पोर्टल स्टाइल, ब्रेकिंग न्यूज़ टिकर, सोशल शेयरिंग बटन और मोबाइल रिस्पॉन्सिव मेनू पहले से शामिल हैं।
                </div>
              </div>

              {/* 4 Simple Steps */}
              <div>
                <h4 className="font-extrabold text-slate-900 text-base mb-3 flex items-center gap-2">
                  <span>ब्लॉगर पर थीम लगाने के 4 आसान चरण (How to Install on Blogger):</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      1
                    </span>
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs mb-1">थीम डाउनलोड करें</h5>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        ऊपर दिए गए <strong>".XML फाइल डाउनलोड करें"</strong> बटन पर क्लिक करें। <code className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded text-[11px]">uposn-blogger-theme.xml</code> आपके कंप्यूटर या फोन में सेव हो जाएगी।
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      2
                    </span>
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs mb-1">Blogger.com पर लॉगिन करें</h5>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        <a href="https://www.blogger.com" target="_blank" rel="noopener noreferrer" className="text-blue-700 font-semibold underline inline-flex items-center gap-1">
                          Blogger.com <ExternalLink className="w-3 h-3" />
                        </a> पर जाएं और अपने ब्लॉग के डैशबोर्ड में लॉगिन करें।
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      3
                    </span>
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs mb-1">Theme &gt; Restore चुनें</h5>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        बाएँ मेनू में <strong>Theme (थीम)</strong> पर क्लिक करें। मुख्य स्क्रीन पर <strong>Customize (अनुकूलित करें)</strong> के बगल में स्थित ड्रॉपडाउन (▾) पर क्लिक करके <strong>Restore (पुनर्स्थापित करें)</strong> चुनें।
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      4
                    </span>
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs mb-1">Upload पर क्लिक करें</h5>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        <strong>Upload (अपलोड)</strong> पर क्लिक करें और डाउनलोड की गई <code className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded text-[11px]">uposn-blogger-theme.xml</code> फाइल चुनें। कुछ ही सेकंड में आपकी पूरी वेबसाइट ब्लॉगर पर लाइव हो जाएगी!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Categorization & Labels tip */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4">
                <h5 className="font-bold text-blue-950 text-xs mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-700" />
                  <span>ब्लॉगर पोस्ट में लेबल (Labels / श्रेणियाँ) का उपयोग:</span>
                </h5>
                <p className="text-xs text-blue-900 leading-relaxed">
                  इस थीम के मेनू लिंक स्वचालित रूप से निम्नलिखित लेबल्स से जुड़े हैं:
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['ताज़ा खबरें', 'शासनादेश', 'विभाग', 'कर्मचारी-केंद्र', 'टॉक-कॉर्नर', 'स्वास्थ्य-विभाग', 'ऊर्जा-विभाग'].map((label) => (
                    <span key={label} className="bg-white border border-blue-200 text-blue-800 px-2 py-0.5 rounded text-xs font-mono font-medium">
                      {label}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-blue-700 mt-2">
                  * जब आप ब्लॉगर पर नई पोस्ट लिखें, तो दायीं ओर <strong>Labels</strong> में इनमें से कोई भी नाम लिखें। वह पोस्ट अपने आप सही मेनू और श्रेणी में दिखाई देगी।
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                <span>फ़ाइल नाम: <strong>uposn-blogger-theme.xml</strong> ({xmlCode.split('\n').length} पंक्तियाँ)</span>
                <span>Blogger Layout Version 3 &bull; UTF-8</span>
              </div>
              <div className="relative">
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-[50vh] leading-relaxed select-all">
                  {xmlCode}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-5 py-3 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            थीम फाइल साइज: <strong>~22 KB</strong> &bull; 100% नि:शुल्क एवं खुला स्रोत
          </span>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
          >
            बंद करें (Close)
          </button>
        </div>

      </div>
    </div>
  );
};
