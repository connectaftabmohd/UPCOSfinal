import React from 'react';
import { TrendingUp, Clock, FileText, ChevronRight, Sparkles, ExternalLink } from 'lucide-react';
import { NewsItem, GovernmentOrder, PageView } from '../types';

interface NewsSidebarProps {
  latestNews: NewsItem[];
  mostReadNews: NewsItem[];
  govOrders: GovernmentOrder[];
  onNavigate: (view: PageView) => void;
  currentArticleId?: string;
}

export const NewsSidebar: React.FC<NewsSidebarProps> = ({
  latestNews,
  mostReadNews,
  govOrders,
  onNavigate,
  currentArticleId,
}) => {
  const categories = [
    { label: 'शासनादेश', count: 18 },
    { label: 'वेतन अपडेट', count: 24 },
    { label: 'पीएफ एवं ईएसआई', count: 15 },
    { label: 'कर्मचारी समाचार', count: 32 },
    { label: 'भर्ती एवं तैनाती', count: 12 },
    { label: 'विभागीय सूचना', count: 29 },
  ];

  return (
    <aside className="space-y-6">
      {/* Most Read Stories */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
          <TrendingUp className="w-4 h-4 text-red-600" />
          <h3 className="font-bold text-sm sm:text-base text-slate-900">
            सर्वाधिक पढ़े गए (Most Read)
          </h3>
        </div>

        <div className="divide-y divide-slate-100 space-y-3">
          {(mostReadNews || [])
            .filter((n) => n.id !== currentArticleId)
            .slice(0, 4)
            .map((item, idx) => (
              <div
                key={item.id}
                onClick={() => onNavigate({ type: 'news-detail', id: item.id })}
                className="pt-3 first:pt-0 cursor-pointer group flex items-start gap-3"
              >
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-900 group-hover:text-white transition">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-900 transition line-clamp-2 leading-snug">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                    <span>{item.department.split(',')[0]}</span>
                    <span>•</span>
                    <span>{item.readTime}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Latest Government Orders Box */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-amber-200/60">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-800" />
            <h3 className="font-bold text-sm sm:text-base text-amber-950">
              नवीनतम शासनादेश
            </h3>
          </div>
          <button
            onClick={() => onNavigate({ type: 'gov-orders' })}
            className="text-xs font-bold text-amber-800 hover:underline"
          >
            सभी →
          </button>
        </div>

        <div className="space-y-3">
          {(govOrders || []).slice(0, 3).map((order) => (
            <div
              key={order.id}
              onClick={() => onNavigate({ type: 'gov-order-detail', id: order.id })}
              className="bg-white p-3 rounded-xl border border-amber-200/60 hover:border-amber-400 cursor-pointer transition group"
            >
              <span className="text-[10px] font-mono font-semibold text-amber-900 block truncate">
                {order.orderNumber}
              </span>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-900 transition line-clamp-2 leading-snug mt-1">
                {order.title}
              </h4>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
                <span>{order.department}</span>
                <span>{order.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Categories */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <h3 className="font-bold text-sm sm:text-base text-slate-900 pb-3 mb-3 border-b border-slate-100">
          लोकप्रिय श्रेणियां (Categories)
        </h3>
        <div className="space-y-1.5">
          {categories.map((cat, i) => (
            <button
              key={i}
              onClick={() => onNavigate({ type: 'news-list', category: cat.label })}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-blue-900 transition"
            >
              <div className="flex items-center gap-2">
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span>{cat.label}</span>
              </div>
              <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[10px]">
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* UPCOS Reference Callout */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs text-xs space-y-2.5">
        <div className="flex items-center gap-2 text-amber-400 font-bold">
          <Sparkles className="w-4 h-4" />
          <span>UPCOS सूचना सहयोग</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          उत्तर प्रदेश आउटसोर्सिंग कार्मिकों से जुड़े मूल प्रपत्रों एवं शासकीय पत्राचार के लिए आधिकारिक संदर्भ पोर्टल upcos.org का अवलोकन करें।
        </p>
        <a
          href="https://upcos.org"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-amber-300 hover:underline font-bold pt-1"
        >
          <span>UPCOS पोर्टल पर जाएं</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </aside>
  );
};
