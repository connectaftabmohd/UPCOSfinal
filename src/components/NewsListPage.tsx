import React, { useState, useMemo, useEffect } from 'react';
import {
  Newspaper,
  Calendar,
  ChevronRight,
  ArrowUpRight,
  X
} from 'lucide-react';
import { NewsItem, PageView } from '../types';
import { NewsThumbnail } from './NewsThumbnail';

interface NewsListPageProps {
  news: NewsItem[];
  initialCategory?: string;
  initialDepartment?: string;
  onNavigate: (view: PageView) => void;
  onRefresh?: () => void;
}

export const NewsListPage: React.FC<NewsListPageProps> = ({
  news = [],
  initialCategory,
  initialDepartment,
  onNavigate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'ALL');
  const [selectedDept, setSelectedDept] = useState(initialDepartment || 'ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    setSelectedCategory(initialCategory || 'ALL');
    setSelectedDept(initialDepartment || 'ALL');
    setCurrentPage(1);
  }, [initialCategory, initialDepartment]);

  const safeNews = news || [];

  const categories = useMemo(() => {
    const unique = Array.from(new Set(safeNews.map((item) => item.category).filter(Boolean)));
    return ['ALL', ...unique];
  }, [safeNews]);

  // Filtered list
  const filtered = useMemo(() => {
    return safeNews.filter((item) => {
      const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchDept = selectedDept === 'ALL' || item.department === selectedDept;
      return matchCat && matchDept;
    });
  }, [safeNews, selectedCategory, selectedDept]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
    onNavigate(cat === 'ALL' ? { type: 'news-list' } : { type: 'news-list', category: cat });
  };

  return (
    <div className="w-full py-8 bg-slate-50 min-h-screen">
      <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-5">
          <button
            onClick={() => onNavigate({ type: 'home' })}
            className="hover:text-blue-900 font-medium cursor-pointer"
          >
            होम
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-bold">
            समस्त समाचार व अपडेट्स
          </span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shrink-0">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                आउटसोर्स समाचार एवं अपडेट्स
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                कुल {filtered.length} समाचार उपलब्ध
              </p>
            </div>
          </div>

          {selectedDept !== 'ALL' && (
            <button
              onClick={() => {
                setSelectedDept('ALL');
                setCurrentPage(1);
              }}
              className="inline-flex items-center gap-1.5 self-start md:self-auto px-3 py-1.5 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold hover:bg-blue-100 transition cursor-pointer"
            >
              <span>विभाग: {selectedDept}</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition cursor-pointer border ${
                  isActive
                    ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {cat === 'ALL' ? 'सभी समाचार' : cat}
              </button>
            );
          })}
        </div>

        {/* News Grid */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <Newspaper className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-base text-slate-700">कोई समाचार नहीं मिला।</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">कृपया अन्य श्रेणी चुनें या सभी समाचार देखें।</p>
            <button
              onClick={() => handleCategoryChange('ALL')}
              className="px-4 py-2 rounded-lg bg-blue-900 text-white text-xs font-bold hover:bg-blue-950 transition cursor-pointer"
            >
              सभी समाचार देखें
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paginatedItems.map((item) => (
              <article
                key={item.id}
                className="bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col group"
              >
                <NewsThumbnail
                  src={item.featuredImage}
                  alt={item.title}
                  containerClassName="relative overflow-hidden aspect-16/10 bg-slate-100 cursor-pointer"
                  portraitContainerClassName="relative overflow-hidden aspect-16/10 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-1.5 cursor-pointer"
                  onClick={() => onNavigate({ type: 'news-detail', id: item.id })}
                >
                  <div className="absolute top-3 left-3">
                    <span className="bg-blue-900/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-0.5 rounded shadow-2xs">
                      {item.category}
                    </span>
                  </div>
                </NewsThumbnail>

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

                    <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-800 transition line-clamp-2 leading-snug mb-2">
                      <a
                        href={`/news/${item.slug}`}
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigate({ type: 'news-detail', id: item.id });
                        }}
                      >
                        {item.title}
                      </a>
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
                      {item.shortDescription}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {item.readTime}
                    </span>
                    <a
                      href={`/news/${item.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate({ type: 'news-detail', id: item.id });
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
                    >
                      <span>विस्तार से पढ़ें</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => {
                setCurrentPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              पिछला
            </button>
            <span className="text-xs font-semibold text-slate-500 px-3">
              पेज {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => {
                setCurrentPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              अगला
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
