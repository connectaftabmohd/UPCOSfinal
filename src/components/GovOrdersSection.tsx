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
  }, [orders, searchQuery, selectedDept, selectedYear, selectedCategory, sortOrder, limit]);

  const handleDownload = (order: GovernmentOrder, e: React.MouseEvent) => {
    e.stopPropagation();
    // Simulate authentic PDF download
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
    <section className="py-8 sm:py-10 bg-slate-50/60 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                शासनादेश एवं महत्वपूर्ण सूचनाएं
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                उत्तर प्रदेश शासन एवं विभागों द्वारा निर्गत आधिकारिक शासनादेश व अधिसूचनाएं
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              आधिकारिक स्रोत से सत्यापित
            </span>
            {limit && orders.length > limit && (
              <button
                onClick={() => onNavigate({ type: 'gov-orders' })}
                className="text-xs font-bold text-blue-800 hover:text-blue-950 flex items-center gap-1 group"
              >
                <span>सभी {orders.length} शासनादेश देखें</span>
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
                  placeholder="शासनादेश सं. या विषय खोजें..."
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
                  <option value="ALL">सभी विभाग (All)</option>
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
                  <option value="ALL">सभी वर्ष (All Years)</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      वर्ष {y}
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
                  <option value="LATEST">नवीनतम पहले (Latest)</option>
                  <option value="OLDEST">पुराने पहले (Oldest)</option>
                </select>
              </div>
            </div>

            {/* Active filters status */}
            {(selectedDept !== 'ALL' || selectedYear !== 'ALL' || searchQuery) && (
              <div className="flex items-center justify-between pt-2 text-xs text-slate-500 border-t border-slate-100">
                <span>
                  परिणाम मिले: <strong>{filteredOrders.length}</strong> शासनादेश
                </span>
                <button
                  onClick={() => {
                    setSelectedDept('ALL');
                    setSelectedYear('ALL');
                    setSearchQuery('');
                  }}
                  className="text-blue-700 hover:underline font-semibold"
                >
                  फिल्टर हटाएं (Reset)
                </button>
              </div>
            )}
          </div>
        )}

        {/* Document Cards List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-slate-200 text-slate-500">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-sm">चयनित मापदंडों के अनुसार कोई शासनादेश नहीं मिला।</p>
            <p className="text-xs text-slate-400 mt-1">कृपया सर्च कीवर्ड या विभाग फिल्टर बदलकर पुनः प्रयास करें।</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => onNavigate({ type: 'gov-order-detail', id: order.id })}
                className="bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all duration-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group"
              >
                {/* Left Document Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="bg-blue-50 text-blue-900 border border-blue-200 font-mono text-[11px] font-bold px-2.5 py-0.5 rounded">
                      {order.orderNumber}
                    </span>
                    <span className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded">
                      {order.category}
                    </span>
                    {order.isImportant && (
                      <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        महत्वपूर्ण
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-900 transition leading-snug mb-1.5">
                    {order.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                    {order.summary}
                  </p>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {order.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      दिनांक: {order.date}
                    </span>
                    <span className="text-slate-400">
                      साइज: {order.fileSize}
                    </span>
                  </div>
                </div>

                {/* Right Actions: View & Download Buttons */}
                <div className="flex items-center gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate({ type: 'gov-order-detail', id: order.id });
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold rounded-lg transition border border-blue-200"
                    title="शासनादेश विस्तार से देखें"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>विवरण देखें</span>
                  </button>

                  <button
                    onClick={(e) => handleDownload(order, e)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition shadow-2xs"
                    title="शासनादेश डाउनलोड करें"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>डाउनलोड (PDF)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
