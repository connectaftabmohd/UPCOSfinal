import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Filter, 
  Calendar, 
  Building2, 
  ShieldCheck, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { GovernmentOrder, PageView } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface GovOrdersSectionProps {
  orders: GovernmentOrder[];
  onNavigate: (view: PageView) => void;
  showFilters?: boolean;
  limit?: number;
}

export const GovOrdersSection: React.FC<GovOrdersSectionProps> = ({
  orders = [],
  onNavigate,
  showFilters = true,
  limit,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortOrder, setSortOrder] = useState<'LATEST' | 'OLDEST'>('LATEST');

  let isEnglish = false;
  let t = (k: string, fb?: string) => fb || k;
  try {
    const langCtx = useLanguage();
    isEnglish = langCtx.isEnglish;
    t = langCtx.t;
  } catch {}

  const safeOrders = orders || [];

  // Extract unique departments, years, and categories
  const departments = useMemo(() => {
    return Array.from(new Set(safeOrders.map((o) => o.department)));
  }, [safeOrders]);

  const years = useMemo(() => {
    return Array.from(new Set(safeOrders.map((o) => Number(o.year)))).sort((a: number, b: number) => b - a);
  }, [safeOrders]);

  const categories = useMemo(() => {
    return Array.from(new Set(safeOrders.map((o) => o.category)));
  }, [safeOrders]);

  // Filtered and sorted orders
  const filteredOrders = useMemo(() => {
    let result = [...safeOrders];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.orderNumber.toLowerCase().includes(q) ||
          o.department.toLowerCase().includes(q) ||
          o.summary.toLowerCase().includes(q)
      );
    }

    if (selectedDept !== 'ALL') {
      result = result.filter((o) => o.department === selectedDept);
    }

    if (selectedYear !== 'ALL') {
      result = result.filter((o) => o.year === Number(selectedYear));
    }

    if (selectedCategory !== 'ALL') {
      result = result.filter((o) => o.category === selectedCategory);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'LATEST' ? dateB - dateA : dateA - dateB;
    });

    if (limit) {
      return result.slice(0, limit);
    }

    return result;
  }, [safeOrders, searchQuery, selectedDept, selectedYear, selectedCategory, sortOrder, limit]);

  const handleDownload = (order: GovernmentOrder, e: React.MouseEvent) => {
    e.stopPropagation();
    // Simulate authentic text download
    const blob = new Blob(
      [
        `उत्तर प्रदेश शासन - शासनादेश संदर्भ\n\n` +
        `शासनादेश संख्या: ${order.orderNumber}\n` +
        `विभाग: ${order.department}\n` +
        `दिनांक: ${order.date}\n\n` +
        `विषय: ${order.title}\n\n` +
        `सारांश:\n${order.summary}\n\n` +
        `मुख्य बिंदु:\n${order.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\n` +
        `आधिकारिक स्रोत: ${order.officialSource} (${order.officialSourceUrl})\n\n` +
        `---\nयह प्रति UP Outsource Seva Nigam News & Information द्वारा जनहित में उपलब्ध कराई गई है।`
      ],
      { type: 'text/plain;charset=utf-8' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${order.orderNumber.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="w-full py-8 sm:py-10 bg-slate-50/60 border-b border-slate-200">
      <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {t('orders.sectionTitle', isEnglish ? 'Government Orders & Circulars' : 'शासनादेश एवं महत्वपूर्ण सूचनाएं')}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {t('orders.sectionSub', isEnglish ? 'Official government orders and notifications issued by UP departments' : 'उत्तर प्रदेश शासन एवं विभागों द्वारा निर्गत आधिकारिक शासनादेश व अधिसूचनाएं')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              {isEnglish ? 'Verified from Official Sources' : 'आधिकारिक स्रोत से सत्यापित'}
            </span>
            {limit && orders.length > limit && (
              <button
                onClick={() => onNavigate({ type: 'gov-orders' })}
                className="text-xs font-bold text-blue-800 hover:text-blue-950 flex items-center gap-1 group cursor-pointer"
              >
                <span>{isEnglish ? `View All ${orders.length} Orders` : `सभी ${orders.length} शासनादेश देखें`}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar (if enabled) */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-2xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search Box */}
              <div className="lg:col-span-2 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('orders.searchPlaceholder', isEnglish ? 'Search by order number or subject...' : 'शासनादेश सं. या विषय खोजें...')}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-700 focus:bg-white transition"
                />
              </div>

              {/* Department Dropdown */}
              <div>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full py-2 px-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-700 text-slate-700"
                >
                  <option value="ALL">{isEnglish ? 'All Departments' : 'सभी विभाग'}</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Dropdown */}
              <div>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full py-2 px-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-700 text-slate-700"
                >
                  <option value="ALL">{isEnglish ? 'All Years' : 'सभी वर्ष'}</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {isEnglish ? `Year ${y}` : `वर्ष ${y}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Dropdown */}
              <div>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'LATEST' | 'OLDEST')}
                  className="w-full py-2 px-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-700 text-slate-700"
                >
                  <option value="LATEST">{isEnglish ? 'Latest First' : 'नवीनतम पहले'}</option>
                  <option value="OLDEST">{isEnglish ? 'Oldest First' : 'पुराने पहले'}</option>
                </select>
              </div>
            </div>

            {/* Active filters status */}
            {(selectedDept !== 'ALL' || selectedYear !== 'ALL' || searchQuery) && (
              <div className="flex items-center justify-between pt-2 text-xs text-slate-500 border-t border-slate-100">
                <span>
                  {isEnglish ? 'Orders found: ' : 'परिणाम मिले: '}
                  <strong>{filteredOrders.length}</strong> {isEnglish ? 'orders' : 'शासनादेश'}
                </span>
                <button
                  onClick={() => {
                    setSelectedDept('ALL');
                    setSelectedYear('ALL');
                    setSearchQuery('');
                  }}
                  className="text-blue-700 hover:underline font-semibold cursor-pointer"
                >
                  {isEnglish ? 'Clear Filters' : 'फिल्टर हटाएं'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Orders List Grid */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-slate-200">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 font-medium">
                {isEnglish ? 'No government orders found matching your search criteria.' : 'आपके खोजे गए मापदंडों के अनुसार कोई शासनादेश नहीं मिला।'}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => onNavigate({ type: 'gov-order-detail', id: order.id })}
                className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all duration-200 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                      <Building2 className="w-3 h-3 text-slate-500" />
                      {order.department}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 ml-auto md:ml-0">
                      <Calendar className="w-3 h-3" />
                      {order.date}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-900 transition leading-snug mb-1.5">
                    {order.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-3">
                    {order.summary}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="bg-amber-50 text-amber-900 font-medium px-2 py-0.5 rounded">
                      {order.category}
                    </span>
                    <span>
                      {isEnglish ? 'Source:' : 'स्रोत:'} <strong className="text-slate-700">{order.officialSource}</strong>
                    </span>
                    <span>{order.fileSize}</span>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 w-full md:w-auto justify-end">
                  <button
                    onClick={(e) => handleDownload(order, e)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition border border-slate-300 cursor-pointer"
                    title={isEnglish ? 'Download Summary Text' : 'शासनादेश विवरण डाउनलोड करें'}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isEnglish ? 'Download' : 'डाउनलोड'}</span>
                  </button>

                  <button
                    onClick={() => onNavigate({ type: 'gov-order-detail', id: order.id })}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold transition shadow-2xs cursor-pointer group-hover:translate-x-0.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isEnglish ? 'View Order' : 'आदेश देखें'}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
