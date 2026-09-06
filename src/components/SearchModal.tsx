import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, FileText, Newspaper, Building, HelpCircle, ArrowRight, MessageSquareQuote } from 'lucide-react';
import { PageView, NewsItem, GovernmentOrder } from '../types';
import { DEPARTMENTS_DATA, EMPLOYEE_GUIDES_DATA } from '../data/mockData';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: PageView) => void;
  news?: NewsItem[];
  govOrders?: GovernmentOrder[];
  orders?: GovernmentOrder[];
  departments?: any[];
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  news = [],
  govOrders,
  orders,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const safeGovOrders = govOrders || orders || [];
  const safeNews = news || [];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const searchResults = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query || query.length < 2) {
      return { news: [], orders: [], departments: [], guides: [] };
    }

    const matchedNews = safeNews.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.shortDescription.toLowerCase().includes(query) ||
        item.tags.some((t) => t.toLowerCase().includes(query)) ||
        (item.englishTitle && item.englishTitle.toLowerCase().includes(query))
    ).slice(0, 4);

    const matchedOrders = safeGovOrders.filter(
      (order) =>
        order.title.toLowerCase().includes(query) ||
        order.orderNumber.toLowerCase().includes(query) ||
        order.department.toLowerCase().includes(query) ||
        order.summary.toLowerCase().includes(query)
    ).slice(0, 4);

    const matchedDepartments = DEPARTMENTS_DATA.filter(
      (dept) =>
        dept.name.toLowerCase().includes(query) ||
        dept.englishName.toLowerCase().includes(query) ||
        dept.description.toLowerCase().includes(query)
    ).slice(0, 3);

    const matchedGuides = EMPLOYEE_GUIDES_DATA.filter(
      (guide) =>
        guide.title.toLowerCase().includes(query) ||
        guide.summary.toLowerCase().includes(query) ||
        guide.category.toLowerCase().includes(query)
    ).slice(0, 3);

    return {
      news: matchedNews,
      orders: matchedOrders,
      departments: matchedDepartments,
      guides: matchedGuides,
    };
  }, [searchTerm, news, govOrders]);

  if (!isOpen) return null;

  const totalFound =
    searchResults.news.length +
    searchResults.orders.length +
    searchResults.departments.length +
    searchResults.guides.length;

  const quickTags = ['वेतन', 'मानदेय', 'ईपीएफ', 'ईएसआई', 'शासनादेश', 'स्वास्थ्य विभाग', 'अनुबंध', 'अवकाश'];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / Input Box */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/70">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="खबर, शासनादेश, विभाग या कर्मचारी जानकारी खोजें..."
            className="flex-1 bg-transparent border-none text-slate-900 placeholder:text-slate-400 text-base sm:text-lg focus:outline-none focus:ring-0"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-200/70 hover:bg-slate-300 rounded-md transition"
          >
            ESC
          </button>
        </div>

        {/* Quick Tag suggestions */}
        {!searchTerm && (
          <div className="p-5 overflow-y-auto">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
              लोकप्रिय खोज (Popular Searches)
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {quickTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchTerm(tag)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-full text-xs font-medium transition border border-slate-200/70"
                >
                  #{tag}
                </button>
              ))}
            </div>

            <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3.5 text-xs text-blue-900 flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-blue-600 shrink-0" />
              <span>
                यहाँ आप उत्तर प्रदेश के समस्त 75 जनपदों के आउटसोर्सिंग आदेश, शासनादेश संख्या, मानदेय नियम और विभागीय सूचनाएं आसानी से खोज सकते हैं।
              </span>
            </div>
          </div>
        )}

        {/* Results Container */}
        {searchTerm && (
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 divide-y divide-slate-100">
            {totalFound === 0 ? (
              <div className="text-center py-10">
                <p className="text-slate-500 text-sm mb-2 font-medium">
                  "{searchTerm}" के लिए कोई परिणाम नहीं मिला।
                </p>
                <p className="text-xs text-slate-400">
                  कृपया कीवर्ड बदलें अथवा कोई अन्य विभाग या विषय खोजें।
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* News matches */}
                {searchResults.news.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 mb-2">
                      <Newspaper className="w-3.5 h-3.5" />
                      <span>समाचार ({searchResults.news.length})</span>
                    </div>
                    <div className="space-y-1.5">
                      {searchResults.news.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            onNavigate({ type: 'news-detail', id: item.id });
                            onClose();
                          }}
                          className="p-2.5 rounded-lg hover:bg-slate-100 cursor-pointer transition flex items-start justify-between gap-3 group"
                        >
                          <div>
                            <span className="inline-block text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded mr-1.5">
                              {item.category}
                            </span>
                            <span className="text-xs sm:text-sm font-medium text-slate-900 group-hover:text-blue-700">
                              {item.title}
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 shrink-0 mt-1" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Government Orders matches */}
                {searchResults.orders.length > 0 && (
                  <div className="pt-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-2">
                      <FileText className="w-3.5 h-3.5" />
                      <span>शासनादेश व आदेश ({searchResults.orders.length})</span>
                    </div>
                    <div className="space-y-1.5">
                      {searchResults.orders.map((order) => (
                        <div
                          key={order.id}
                          onClick={() => {
                            onNavigate({ type: 'gov-order-detail', id: order.id });
                            onClose();
                          }}
                          className="p-2.5 rounded-lg hover:bg-amber-50/60 cursor-pointer transition flex items-start justify-between gap-3 group"
                        >
                          <div>
                            <p className="text-[11px] font-mono font-medium text-amber-800">
                              {order.orderNumber}
                            </p>
                            <p className="text-xs sm:text-sm font-medium text-slate-900 group-hover:text-amber-800">
                              {order.title}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-700 shrink-0 mt-1" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Departments matches */}
                {searchResults.departments.length > 0 && (
                  <div className="pt-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 mb-2">
                      <Building className="w-3.5 h-3.5" />
                      <span>विभाग ({searchResults.departments.length})</span>
                    </div>
                    <div className="space-y-1.5">
                      {searchResults.departments.map((dept) => (
                        <div
                          key={dept.id}
                          onClick={() => {
                            onNavigate({ type: 'department-detail', id: dept.id });
                            onClose();
                          }}
                          className="p-2.5 rounded-lg hover:bg-emerald-50/60 cursor-pointer transition flex items-center justify-between group"
                        >
                          <div>
                            <p className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-emerald-800">
                              {dept.name}
                            </p>
                            <p className="text-[11px] text-slate-500">{dept.englishName}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-700 shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Guides matches */}
                {searchResults.guides.length > 0 && (
                  <div className="pt-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 mb-2">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>कर्मचारी गाइड ({searchResults.guides.length})</span>
                    </div>
                    <div className="space-y-1.5">
                      {searchResults.guides.map((guide) => (
                        <div
                          key={guide.id}
                          onClick={() => {
                            onNavigate({ type: 'employee-hub', tab: guide.category });
                            onClose();
                          }}
                          className="p-2.5 rounded-lg hover:bg-purple-50/60 cursor-pointer transition flex items-center justify-between group"
                        >
                          <span className="text-xs sm:text-sm font-medium text-slate-900 group-hover:text-purple-800">
                            {guide.title}
                          </span>
                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-700 shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Talk Corner quick jump */}
                <div
                  onClick={() => {
                    onNavigate({ type: 'talk-corner' });
                    onClose();
                  }}
                  className="mt-3 p-3 bg-blue-50/80 hover:bg-blue-100 rounded-xl cursor-pointer transition flex items-center justify-between text-xs font-bold text-blue-900 border border-blue-100"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquareQuote className="w-4 h-4 text-blue-800 shrink-0" />
                    <span>टॉक कॉर्नर: अन्य कर्मचारियों के साथ अपनी बात साझा करें या उत्तर पूछें</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-blue-800 shrink-0" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 px-4">
          <span>स्वतंत्र सूचना मंच • निष्पक्ष एवं प्रामाणिक</span>
          <span>UP Outsource Seva Nigam News &amp; Information</span>
        </div>
      </div>
    </div>
  );
};
