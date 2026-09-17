import React from 'react';
import { Calendar, Clock, ArrowRight, TrendingUp, Sparkles, ShieldAlert, MessageSquareQuote } from 'lucide-react';
import { NewsItem, PageView } from '../types';

interface HomeHeroProps {
  featuredNews?: NewsItem;
  sidebarNews?: NewsItem[];
  allNews?: NewsItem[];
  onNavigate: (view: PageView) => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  featuredNews,
  sidebarNews,
  allNews,
  onNavigate,
}) => {
  const activeFeatured = featuredNews || (allNews && allNews[0]);
  const feedItems = sidebarNews || (allNews ? allNews.filter((n) => n.id !== activeFeatured?.id) : []);

  if (!activeFeatured) {
    return null;
  }
  return (
    <section className="py-6 sm:py-8 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Section Header with subtle styling */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-6 bg-blue-900 rounded-full" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              प्रमुख समाचार एवं मुख्य अपडेट
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline-flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            दैनिक प्रामाणिक बुलेटिन
          </span>
        </div>

        {/* Community Talk Corner Banner */}
        <div 
          onClick={() => onNavigate({ type: 'talk-corner' })}
          className="mb-5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:shadow-md transition group border border-blue-800/60"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-xs">
              <MessageSquareQuote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  खुला संवाद मंच
                </span>
                <h3 className="font-bold text-xs sm:text-sm text-white">
                  टॉक कॉर्नर (Talk Corner) में प्रदेश भर के आउटसोर्स साथियों से जुड़ें
                </h3>
              </div>
              <p className="text-[11px] sm:text-xs text-blue-200 mt-0.5">
                मानदेय, पीएफ, अनुबंध और विभागीय समस्याओं पर विचार रखें, सवाल पूछें, लाइक व कमेंट करें।
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 group-hover:translate-x-1 transition self-end sm:self-auto shrink-0 bg-white/10 px-3 py-1.5 rounded-xl">
            <span>संवाद शुरू करें</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* 2-Column Hero Grid: Left Featured Card (60%) + Right Vertical Feed (40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Featured Card */}
          <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition duration-300 flex flex-col">
            <div 
              className="relative overflow-hidden cursor-pointer aspect-16/9 sm:aspect-21/9 lg:aspect-16/9 bg-slate-200"
              onClick={() => onNavigate({ type: 'news-detail', id: activeFeatured.id })}
            >
              <img
                src={activeFeatured.featuredImage}
                alt={activeFeatured.title}
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80';
                }}
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              
              {/* Floating Badges */}
              <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-2">
                <span className="bg-red-600 text-white font-bold text-xs px-2.5 py-1 rounded-md shadow-sm uppercase tracking-wide">
                  {activeFeatured.category}
                </span>
                <span className="bg-blue-950/80 text-blue-200 backdrop-blur-xs text-xs px-2.5 py-1 rounded-md font-medium">
                  {activeFeatured.department}
                </span>
              </div>

              {/* Bottom Quick Meta */}
              <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-slate-200 text-xs">
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  {activeFeatured.publicationDate} • {activeFeatured.publishedTime}
                </span>
                <span className="flex items-center gap-1 text-slate-300">
                  <Clock className="w-3.5 h-3.5" />
                  {activeFeatured.readTime}
                </span>
              </div>
            </div>

            {/* Featured Content Body */}
            <div className="p-5 sm:p-6 flex-1">
              <div>
                <h3
                  onClick={() => onNavigate({ type: 'news-detail', id: activeFeatured.id })}
                  className="text-lg sm:text-2xl font-bold text-slate-900 group-hover:text-blue-900 transition-colors leading-snug cursor-pointer mb-3"
                >
                  {activeFeatured.title}
                </h3>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed line-clamp-3">
                  {activeFeatured.shortDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Right Vertical List of 4-5 items */}
          <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-red-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  महत्वपूर्ण शीर्ष समाचार
                </h3>
              </div>
              <button
                onClick={() => onNavigate({ type: 'news-list' })}
                className="text-xs font-semibold text-blue-700 hover:underline"
              >
                सभी देखें →
              </button>
            </div>

            <div className="divide-y divide-slate-100 space-y-3 pt-1">
              {(feedItems || []).slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  onClick={() => onNavigate({ type: 'news-detail', id: item.id })}
                  className="pt-3 first:pt-0 cursor-pointer group flex items-start gap-3.5 hover:bg-slate-50/60 p-2 rounded-xl transition"
                >
                  <img
                    src={item.featuredImage}
                    alt={item.title}
                    loading="lazy"
                    className="w-20 h-20 rounded-lg object-cover shrink-0 border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {item.publicationDate}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-800 transition line-clamp-2 leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                      <span className="truncate">{item.department}</span>
                      <span className="text-blue-600 font-semibold group-hover:translate-x-0.5 transition shrink-0 ml-1">
                        →
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* UPCOS reference banner at bottom of sidebar */}
            <div className="mt-4 pt-3 border-t border-slate-100 bg-amber-50/60 rounded-xl p-3 text-xs text-amber-950 border border-amber-200/60 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">सत्यापित सूचना संदर्भ:</span>
                <span>
                  आउटसोर्सिंग संबंधी विभागीय आदेश उत्तर प्रदेश शासन के आधिकारिक पोर्टल (UPCOS / shasanadesh.up.gov.in) द्वारा सत्यापित होते हैं।
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
