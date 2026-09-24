import React from 'react';
import { ExternalLink, ShieldCheck, Link2, Info } from 'lucide-react';

export const SourceReferenceBox: React.FC = () => {
  const sources = [
    {
      name: 'UPCOS (उप्र आउटसोर्सिंग संदर्भ पोर्टल)',
      url: 'https://upcos.org/',
      desc: 'प्राथमिक संदर्भ मंच व दिशानिर्देश',
      isPrimary: true,
    },
    {
      name: 'उप्र शासन शासनादेश पोर्टल',
      url: 'https://shasanadesh.up.gov.in',
      desc: 'समस्त आधिकारिक विभागीय शासनादेश व परिपत्र',
    },
    {
      name: 'उप्र श्रम विभाग (Labour Dept)',
      url: 'http://uplabour.gov.in',
      desc: 'न्यूनतम मजदूरी दरें व श्रम कानून विनियम',
    },
    {
      name: 'ईपीएफओ (EPFO)',
      url: 'https://www.epfindia.gov.in',
      desc: 'कर्मचारी भविष्य निधि व ई-सेवा पासबुक',
    },
    {
      name: 'ईएसआईसी (ESIC)',
      url: 'https://www.esic.gov.in',
      desc: 'चिकित्सा बीमा, डिस्पेंसरी व कैशलेस इलाज',
    },
    {
      name: 'गवर्नमेंट ई-मार्केटप्लेस (GeM)',
      url: 'https://gem.gov.in',
      desc: 'मैनपावर आउटसोर्सिंग निविदाएं व अनुबंध',
    },
  ];

  return (
    <section className="w-full py-8 bg-slate-100/80 border-b border-slate-200">
      <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-center shrink-0">
                <Link2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>सूचना का स्रोत एवं आधिकारिक संदर्भ (Sources of Information)</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  प्रामाणिकता, पारदर्शिता एवं कर्मचारियों के विश्वास हेतु आधिकारिक संदर्भ
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 self-start lg:self-auto font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>सत्यापित व सार्वजनिक स्रोतों से संकलित</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-6 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
            <strong>सार्वजनिक सूचना नीति:</strong> “आउटसोर्सिंग से संबंधित आधिकारिक सूचनाओं एवं दस्तावेजों के लिए संबंधित सरकारी/आधिकारिक स्रोतों को प्राथमिकता दी जाती है। यह वेबसाइट किसी भी कॉपीराइट सामग्री की अनाधिकृत नकल नहीं करती, बल्कि केवल कर्मचारियों के सूचनार्थ एवं विधिक मार्गदर्शन हेतु शासकीय परिपत्रों व सार्वजनिक नियमों का सार-संक्षेप प्रस्तुत करती है।”
          </p>

          {/* Grid of Sources */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {sources.map((src, i) => (
              <a
                key={i}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-3.5 rounded-xl border transition-all duration-200 flex items-start justify-between gap-3 group ${
                  src.isPrimary
                    ? 'bg-blue-50/70 border-blue-200 hover:border-blue-400'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    {src.isPrimary && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-900 text-white px-1.5 py-0.2 rounded">
                        प्राथमिक संदर्भ
                      </span>
                    )}
                    <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-900 transition">
                      {src.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {src.desc}
                  </p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-700 shrink-0 mt-0.5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
