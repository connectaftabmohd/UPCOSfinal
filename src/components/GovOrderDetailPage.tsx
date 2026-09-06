import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  ArrowLeft, 
  Building2, 
  Calendar, 
  ExternalLink, 
  ShieldCheck, 
  Share2, 
  Printer, 
  Check, 
  FileCode,
  Sparkles
} from 'lucide-react';
import { GovernmentOrder, PageView } from '../types';

interface GovOrderDetailPageProps {
  order: GovernmentOrder;
  onNavigate: (view: PageView) => void;
}

export const GovOrderDetailPage: React.FC<GovOrderDetailPageProps> = ({
  order,
  onNavigate,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownload = () => {
    const textContent = 
      `========================================================\n` +
      `शासनादेश सूचना सारांश (Government Order Information Summary)\n` +
      `========================================================\n\n` +
      `शासनादेश संख्या : ${order.orderNumber}\n` +
      `विभाग : ${order.department}\n` +
      `जारी दिनांक : ${order.date}\n` +
      `श्रेणी : ${order.category}\n` +
      `आधिकारिक संदर्भ स्रोत : ${order.officialSource} (${order.officialSourceUrl})\n\n` +
      `विषय : ${order.title}\n\n` +
      `--------------------------------------------------------\n` +
      `शासनादेश का विस्तृत सारांश:\n` +
      `${order.summary}\n\n` +
      `मुख्य विधिक प्रावधान एवं निर्देश:\n` +
      `${order.keyPoints.map((p, i) => `[${i + 1}] ${p}`).join('\n')}\n\n` +
      `--------------------------------------------------------\n` +
      `महत्वपूर्ण अस्वीकरण (Disclaimer):\n` +
      `यह प्रतिलिपि केवल जन-जागरूकता एवं सूचनात्मक संदर्भ हेतु तैयार की गई है।\n` +
      `यह कोई आधिकारिक या विधिक प्रमाण-पत्र नहीं है।\n` +
      `मूल एवं प्रामाणिक हस्ताक्षरित प्रति हेतु कृपया उत्तर प्रदेश शासन के पोर्टल\n` +
      `shasanadesh.up.gov.in का अवलोकन करें।\n` +
      `========================================================`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Shasanadesh_${order.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="py-6 sm:py-8 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-3 sm:px-6">
        {/* Top Breadcrumb & Actions */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={() => onNavigate({ type: 'gov-orders' })}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 hover:text-blue-950 px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-2xs transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>शासनादेश सूची पर लौटें</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition hidden sm:inline-flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रिंट (Print)</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold rounded-lg shadow-xs transition inline-flex items-center gap-1.5"
            >
              {downloadSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
              <span>{downloadSuccess ? 'डाउनलोड संपन्न!' : 'डाउनलोड करें (PDF/Text)'}</span>
            </button>
          </div>
        </div>

        {/* Main Document Container (Stylized Official Government Order Sheet) */}
        <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden mb-8">
          {/* Header Strip */}
          <div className="bg-slate-900 text-white p-5 sm:p-6 border-b border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="bg-amber-400 text-slate-950 text-xs font-extrabold px-3 py-0.5 rounded font-mono">
                {order.orderNumber}
              </span>
              <span className="text-xs text-slate-300 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                दिनांक: {order.date} (वर्ष {order.year})
              </span>
            </div>

            <h1 className="text-lg sm:text-2xl font-black text-white leading-snug tracking-tight">
              {order.title}
            </h1>
          </div>

          {/* Department Meta bar */}
          <div className="bg-slate-50 px-5 sm:px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Building2 className="w-4 h-4 text-blue-900" />
              <span className="font-bold">संबद्ध विभाग:</span>
              <span>{order.department}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded font-medium">
                श्रेणी: {order.category}
              </span>
              <span className="text-slate-400 font-mono">
                साइज: {order.fileSize}
              </span>
            </div>
          </div>

          {/* Document Content Body */}
          <div className="p-5 sm:p-8 space-y-6">
            {/* Verification Watermark Card */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">
                  मूल शासकीय संदर्भ स्रोत (Public Source Reference):
                </span>
                <span>
                  यह शासनादेश विवरण <strong>{order.officialSource}</strong> के सार्वजनिक रिकॉर्ड पर आधारित है। इसका मूल संदर्भ पोर्टल{' '}
                  <a
                    href={order.officialSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold underline hover:text-emerald-700"
                  >
                    {order.officialSourceUrl}
                  </a>{' '}
                  पर देखा जा सकता है।
                </span>
              </div>
            </div>

            {/* Summary Section */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">
                शासनादेश का विस्तृत सारांश (Executive Summary):
              </h3>
              <p className="text-sm sm:text-base text-slate-800 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                {order.summary}
              </p>
            </div>

            {/* Key Clauses & Directives (मुख्य प्रावधान) */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-900" />
                <span>शासनादेश के मुख्य विधिक बिंदु व अनुपालन निर्देश:</span>
              </h3>
              <div className="space-y-3">
                {order.keyPoints.map((point, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-start gap-3 text-xs sm:text-sm text-slate-800 leading-relaxed shadow-2xs"
                  >
                    <span className="w-6 h-6 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      {idx + 1}
                    </span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Authentic Source Reference & Verification Disclaimer */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-600 space-y-1 text-center sm:text-left">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-blue-800 shrink-0" />
                  <span>प्रामाणिक संदर्भ विवरण (Public Information Record):</span>
                </div>
                <p>विभाग: {order.department}</p>
                <p className="text-[11px] text-slate-500">
                  निर्गत तिथि: {order.date} • स्रोत: {order.officialSource}
                </p>
              </div>

              <div className="rounded-xl p-3 bg-blue-50/80 border border-blue-200/80 text-center sm:text-right w-full sm:w-auto">
                <span className="text-[10px] uppercase tracking-wider text-blue-900 font-bold block mb-1">
                  मूल शासनादेश सत्यापन
                </span>
                <a
                  href={order.officialSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-900 hover:text-blue-950 underline"
                >
                  <span>shasanadesh.up.gov.in पर देखें</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <a
              href={order.officialSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-800 hover:text-blue-950"
            >
              <span>मूल सरकारी पोर्टल लिंक खोलें</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>यह आदेश डाउनलोड करें ({order.fileSize})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
