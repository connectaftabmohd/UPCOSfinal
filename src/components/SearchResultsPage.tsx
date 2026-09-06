import React, { useState, useMemo } from 'react';
import { 
  Search, 
  FileText, 
  Newspaper, 
  Building2, 
  ArrowRight, 
  Calendar, 
  ArrowLeft,
  SlidersHorizontal
} from 'lucide-react';
import { NewsItem, GovernmentOrder, Department, PageView } from '../types';

interface SearchResultsPageProps {
  initialQuery: string;
  allNews: NewsItem[];
  allOrders: GovernmentOrder[];
  allDepartments: Department[];
  onNavigate: (view: PageView) => void;
}

export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({
  initialQuery,
  allNews,
  allOrders,
  allDepartments,
  onNavigate,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'ALL' | 'NEWS' | 'ORDERS' | 'DEPTS'>('ALL');

  const q = query.toLowerCase().trim();

  const matchingNews = useMemo(() => {
    if (!q) return [];
    return allNews.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.shortDescription.toLowerCase().includes(q) ||
        n.department.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q) ||
        n.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }, [allNews, q]);

  const matchingOrders = useMemo(() => {
    if (!q) return [];
    return allOrders.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.department.toLowerCase().includes(q) ||
        o.summary.toLowerCase().includes(q) ||
        o.category.toLowerCase().includes(q)
    );
  }, [allOrders, q]);

  const matchingDepartments = useMemo(() => {
    if (!q) return [];
    return allDepartments.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.englishName.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q)
    );
  }, [allDepartments, q]);

  const totalResults = matchingNews.length + matchingOrders.length + matchingDepartments.length;

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <button
          onClick={() => onNavigate({ type: 'home' })}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 hover:text-blue-950 mb-5 px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-2xs transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>मुख्य पृष्ठ पर वापस जाएं</span>
        </button>

        {/* Search Bar Container */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs mb-6">
          <div className="max-w-3xl">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
              सर्च परिणाम (Search Results)
            </h1>
            <p className="text-xs text-slate-500 mb-4">
              वेबसाइट पर प्रकाशित समाचार, शासनादेश और विभागीय जानकारी में खोजें
            </p>

            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="खोजें: मानदेय, शासनादेश संख्या, स्वास्थ्य विभाग, पीएफ..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-900 text-sm font-medium"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                activeTab === 'ALL'
                  ? 'bg-blue-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              सभी परिणाम ({totalResults})
            </button>
            <button
              onClick={() => setActiveTab('NEWS')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                activeTab === 'NEWS'
                  ? 'bg-blue-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              समाचार ({matchingNews.length})
            </button>
            <button
              onClick={() => setActiveTab('ORDERS')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                activeTab === 'ORDERS'
                  ? 'bg-blue-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              शासनादेश ({matchingOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('DEPTS')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                activeTab === 'DEPTS'
                  ? 'bg-blue-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              विभाग ({matchingDepartments.length})
            </button>
          </div>
        </div>

        {/* Results view */}
        {totalResults === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-base text-slate-800">
              “{query}” के लिए कोई परिणाम नहीं मिला।
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              सुझाव: वर्तनी की जांच करें या अधिक सामान्य शब्दों का प्रयोग करें, जैसे ‘वेतन’, ‘शासनादेश’, ‘स्वास्थ्य’ या ‘ईपीएफ’।
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 1. News results */}
            {(activeTab === 'ALL' || activeTab === 'NEWS') && matchingNews.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
                  <Newspaper className="w-4 h-4 text-blue-900" />
                  <h3 className="font-bold text-base text-slate-900">
                    समाचार परिणाम ({matchingNews.length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {matchingNews.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onNavigate({ type: 'news-detail', id: item.id })}
                      className="p-3 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50/30 transition cursor-pointer flex items-start justify-between gap-3 group"
                    >
                      <div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1">
                          <span className="font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                            {item.category}
                          </span>
                          <span>{item.department}</span>
                          <span>•</span>
                          <span>{item.publicationDate}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-900 transition">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-600 line-clamp-1 mt-1">
                          {item.shortDescription}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-900 group-hover:translate-x-1 transition shrink-0 mt-2" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Government Orders results */}
            {(activeTab === 'ALL' || activeTab === 'ORDERS') && matchingOrders.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
                  <FileText className="w-4 h-4 text-amber-800" />
                  <h3 className="font-bold text-base text-slate-900">
                    शासनादेश परिणाम ({matchingOrders.length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {matchingOrders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => onNavigate({ type: 'gov-order-detail', id: order.id })}
                      className="p-3 rounded-xl border border-slate-100 hover:border-amber-300 hover:bg-amber-50/30 transition cursor-pointer flex items-start justify-between gap-3 group"
                    >
                      <div>
                        <div className="flex items-center gap-2 text-[11px] mb-1">
                          <span className="font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                            {order.orderNumber}
                          </span>
                          <span className="text-slate-500">{order.department}</span>
                          <span className="text-slate-400">• {order.date}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-900 transition">
                          {order.title}
                        </h4>
                        <p className="text-xs text-slate-600 line-clamp-1 mt-1">
                          {order.summary}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-900 group-hover:translate-x-1 transition shrink-0 mt-2" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Department results */}
            {(activeTab === 'ALL' || activeTab === 'DEPTS') && matchingDepartments.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
                  <Building2 className="w-4 h-4 text-slate-700" />
                  <h3 className="font-bold text-base text-slate-900">
                    संबंधित विभाग ({matchingDepartments.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {matchingDepartments.map((dept) => (
                    <div
                      key={dept.id}
                      onClick={() => onNavigate({ type: 'department-detail', id: dept.id })}
                      className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between group"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-900">
                          {dept.name}
                        </h4>
                        <p className="text-xs text-slate-500">{dept.englishName}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-900 group-hover:translate-x-1 transition" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
