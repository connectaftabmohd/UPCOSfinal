import React from 'react';
import { Landmark, Calendar, Building, ArrowRight, CheckCircle2 } from 'lucide-react';
import { GOV_DEVELOPMENTS } from '../data/mockData';
import { PageView } from '../types';

interface GovDevelopmentsProps {
  onNavigate: (view: PageView) => void;
}

export const GovDevelopments: React.FC<GovDevelopmentsProps> = ({ onNavigate }) => {
  return (
    <section className="py-8 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-900 flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                सरकारी निर्णय एवं नई पहल
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                आउटसोर्सिंग कार्मिकों के कल्याण हेतु शासन स्तर पर लिए गए हालिया नीतिगत निर्णय
              </p>
            </div>
          </div>
        </div>

        {/* 4 Cards Grid / Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {GOV_DEVELOPMENTS.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-50/70 border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between hover:bg-slate-100/70 transition duration-200 group"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                  <span className="flex items-center gap-1 font-medium text-slate-600">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {item.date}
                  </span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-semibold text-slate-700">
                    {item.department}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-900 transition leading-snug mb-2">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {item.summary}
                </p>
              </div>

              <div className="pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 truncate max-w-[130px]">
                  {item.source}
                </span>
                <button
                  onClick={() => onNavigate({ type: 'news-list', category: 'शासनादेश' })}
                  className="font-bold text-blue-800 hover:text-blue-950 flex items-center gap-0.5 group-hover:translate-x-0.5 transition"
                >
                  <span>विस्तार</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
