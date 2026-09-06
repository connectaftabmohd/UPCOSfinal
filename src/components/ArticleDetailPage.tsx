import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Share2, 
  Check, 
  Copy, 
  ChevronRight, 
  Building2, 
  Tag, 
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { NewsItem, GovernmentOrder, PageView } from '../types';
import { NewsSidebar } from './NewsSidebar';

interface ArticleDetailPageProps {
  article: NewsItem;
  allNews: NewsItem[];
  govOrders: GovernmentOrder[];
  onNavigate: (view: PageView) => void;
}

export const ArticleDetailPage: React.FC<ArticleDetailPageProps> = ({
  article,
  allNews,
  govOrders,
  onNavigate,
}) => {
  const [copied, setCopied] = useState(false);

  if (!article) {
    return null;
  }

  const safeAllNews = allNews || [];

  // Related articles (same category or department, excluding current)
  const relatedNews = safeAllNews
    .filter((item) => item.id !== article.id && (item.category === article.category || item.departmentId === article.departmentId))
    .slice(0, 3);

  // If none match specifically, fallback to other latest articles
  const finalRelated = relatedNews.length > 0 
    ? relatedNews 
    : safeAllNews.filter((item) => item.id !== article.id).slice(0, 3);

  const mostRead = safeAllNews.filter((item) => item.isMostRead || item.isFeatured);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareText = encodeURIComponent(`${article.title}\n\nUP Outsource Seva Nigam News & Information पर पढ़ें:\n`);
  const currentUrl = encodeURIComponent(window.location.href);

  return (
    <div className="py-6 sm:py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-5 overflow-x-auto whitespace-nowrap pb-1">
          <button
            onClick={() => onNavigate({ type: 'home' })}
            className="hover:text-blue-900 font-medium"
          >
            होम
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <button
            onClick={() => onNavigate({ type: 'news-list' })}
            className="hover:text-blue-900 font-medium"
          >
            ताज़ा खबरें
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <button
            onClick={() => onNavigate({ type: 'news-list', category: article.category })}
            className="hover:text-blue-900 font-medium"
          >
            {article.category}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-800 font-bold truncate max-w-[220px] sm:max-w-md">
            {article.title}
          </span>
        </nav>

        {/* Back Button */}
        <button
          onClick={() => onNavigate({ type: 'news-list' })}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 hover:text-blue-950 mb-4 px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-2xs transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>समाचार सूची पर वापस जाएं</span>
        </button>

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Article Main Column (8 cols) */}
          <article className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 sm:p-8 shadow-xs">
            {/* Category & Department Header */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider">
                {article.category}
              </span>
              <span className="bg-blue-50 text-blue-900 text-xs font-semibold px-3 py-1 rounded-md border border-blue-200">
                {article.department}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-4 tracking-tight">
              {article.title}
            </h1>

            {/* Author & Meta Line */}
            <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4 py-3 border-y border-slate-100 text-xs text-slate-500 mb-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <User className="w-3.5 h-3.5 text-blue-700" />
                  {article.author}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {article.publicationDate} • {article.publishedTime}
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  पढ़ने का समय: {article.readTime}
                </span>
              </div>

              <div className="text-slate-500 text-[11px] font-medium">
                स्रोत: <strong>{article.source}</strong>
              </div>
            </div>

            {/* Share Bar */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200/80 mb-6 text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-blue-900" />
                <span>खबर साझा करें:</span>
              </span>

              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* WhatsApp */}
                <a
                  href={`https://api.whatsapp.com/send?text=${shareText}${currentUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition flex items-center gap-1 text-[11px]"
                >
                  WhatsApp
                </a>

                {/* Facebook */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition text-[11px]"
                >
                  Facebook
                </a>

                {/* X */}
                <a
                  href={`https://twitter.com/intent/tweet?text=${shareText}&url=${currentUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold transition text-[11px]"
                >
                  X
                </a>

                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold transition flex items-center gap-1 text-[11px]"
                  title="लिंक कॉपी करें"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'कॉपी हुआ!' : 'लिंक'}</span>
                </button>
              </div>
            </div>

            {/* Featured Image */}
            <div className="rounded-xl overflow-hidden mb-6 border border-slate-200 shadow-2xs aspect-16/9 bg-slate-100">
              <img
                src={article.featuredImage}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Short Lead Summary */}
            <div className="text-base sm:text-lg font-semibold text-slate-800 leading-relaxed mb-6 pl-4 border-l-4 border-blue-900 italic">
              {article.shortDescription}
            </div>

            {/* Key Highlights Box (महत्वपूर्ण बिंदु) */}
            {article.keyHighlights && article.keyHighlights.length > 0 && (
              <div className="bg-gradient-to-br from-blue-50/90 to-indigo-50/70 border border-blue-200 rounded-xl p-5 mb-8 shadow-2xs">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-blue-900" />
                  <h3 className="font-bold text-sm sm:text-base text-blue-950">
                    खबर के मुख्य बिंदु (Key Highlights):
                  </h3>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-800">
                  {article.keyHighlights.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-700 mt-2 shrink-0" />
                      <span className="leading-relaxed font-medium">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Full Article Content */}
            <div className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed mb-8">
              {article.fullContent.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* Source / Official Reference Verification Note */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8 text-xs text-slate-600 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block mb-0.5">
                  प्रामाणिक स्रोत एवं संदर्भ:
                </span>
                <span>
                  यह जानकारी <strong>{article.source}</strong> एवं उत्तर प्रदेश शासन के सार्वजनिक दिशानिर्देशों पर आधारित है। अधिक जानकारी हेतु मूल विभागीय पोर्टल का अवलोकन करें।
                </span>
                {article.sourceUrl && (
                  <div className="mt-2">
                    <a
                      href={article.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-blue-800 hover:underline"
                    >
                      <span>स्रोतः {article.sourceUrl}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100 mb-8">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  टैग्स:
                </span>
                {article.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium cursor-pointer transition"
                    onClick={() => onNavigate({ type: 'search', query: tag })}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Related Articles Section ("यह भी पढ़ें") */}
            <div className="pt-6 border-t border-slate-200">
              <h3 className="text-base sm:text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-5 bg-blue-900 rounded-full" />
                <span>यह भी पढ़ें (Related News)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {finalRelated.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => {
                      onNavigate({ type: 'news-detail', id: rel.id });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-slate-50 hover:bg-blue-50/50 rounded-xl p-3 border border-slate-200 hover:border-blue-300 cursor-pointer transition flex flex-col justify-between group"
                  >
                    <img
                      src={rel.featuredImage}
                      alt={rel.title}
                      className="w-full h-24 object-cover rounded-lg mb-2"
                    />
                    <div>
                      <span className="text-[10px] font-bold text-blue-800 block mb-1">
                        {rel.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-900 transition line-clamp-2 leading-snug">
                        {rel.title}
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-2 block">
                      {rel.publicationDate}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </article>

          {/* Sidebar (4 cols) */}
          <div className="lg:col-span-4">
            <NewsSidebar
              latestNews={allNews}
              mostReadNews={mostRead}
              govOrders={govOrders}
              onNavigate={onNavigate}
              currentArticleId={article.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
