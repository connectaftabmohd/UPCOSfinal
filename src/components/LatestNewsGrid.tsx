import React from 'react';
import { ArrowRight, Calendar, Clock, Newspaper, ArrowUpRight } from 'lucide-react';
import { NewsItem, PageView } from '../types';

interface LatestNewsGridProps {
  news: NewsItem[];
  onNavigate: (view: PageView) => void;
  title?: string;
  showViewAll?: boolean;
  onOpenSewayojanSync?: () => void;
}

export const LatestNewsGrid: React.FC<LatestNewsGridProps> = ({
  news = [],
  onNavigate,
  title = 'ताज़ा खबरें',
  showViewAll = true,
  onOpenSewayojanSync,
}) => {
  return (
    <section className="py-8 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center">
              <Newspaper className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {title}
                </h2>
                {onOpenSewayojanSync && (
                  <button
                    onClick={onOpenSewayojanSync}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-[11px] font-bold transition cursor-pointer"
                    title="उत्तर प्रदेश सेवायोजन पोर्टल (sewayojan.up.nic.in/jobs.aspx) ऑटो-अपडेट"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>सेवायोजन ऑटो-सिंक</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                प्रदेश भर के संविदा एवं आउटसोर्स कार्मिकों से जुड़ी अद्यतन सूचनाएं व सेवायोजन भर्तियां
              </p>
            </div>
          </div>

          {showViewAll && (
            <button
              onClick={() => onNavigate({ type: 'news-list' })}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-800 hover:text-blue-950 group"
            >
              <span>सभी खबरें देखें</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
            </button>
          )}
        </div>

        {/* 3-Column Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(news || []).map((item) => (
            <article
              key={item.id}
              className="bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col group"
            >
              {/* Thumbnail */}
              <div 
                className="relative overflow-hidden aspect-16/10 bg-slate-100 cursor-pointer"
                onClick={() => onNavigate({ type: 'news-detail', id: item.id })}
              >
                <img
                  src={item.featuredImage}
                  alt={item.title}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80';
                  }}
                  className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="bg-blue-900/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-0.5 rounded shadow-2xs">
                    {item.category}
                  </span>
                </div>
                <div className="absolute bottom-2 right-2 bg-slate-950/70 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                  {item.readTime}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                    <span className="truncate max-w-[170px] font-medium text-slate-600">
                      {item.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {item.publicationDate}
                    </span>
                  </div>

                  <h3
                    onClick={() => onNavigate({ type: 'news-detail', id: item.id })}
                    className="text-base font-bold text-slate-900 group-hover:text-blue-800 transition line-clamp-2 leading-snug cursor-pointer mb-2"
                  >
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {item.shortDescription}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    स्रोत: {item.source.split(',')[0]}
                  </span>
                  <button
                    onClick={() => onNavigate({ type: 'news-detail', id: item.id })}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 group-hover:underline"
                  >
                    <span>विस्तार से पढ़ें</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Mobile View All Button */}
        {showViewAll && (
          <div className="mt-6 text-center sm:hidden">
            <button
              onClick={() => onNavigate({ type: 'news-list' })}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-xl transition flex items-center justify-center gap-2"
            >
              <span>और ताज़ा खबरें देखें</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
