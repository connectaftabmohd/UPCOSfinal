import React, { useState, useEffect } from 'react';
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
  Sparkles,
  Printer,
  Table as TableIcon,
  AlertTriangle,
  FileText,
  BadgeCheck
} from 'lucide-react';
import { NewsItem, GovernmentOrder, PageView } from '../types';
import { NewsSidebar } from './NewsSidebar';

interface ArticleDetailPageProps {
  article: NewsItem;
  allNews: NewsItem[];
  govOrders: GovernmentOrder[];
  onNavigate: (view: PageView) => void;
}

// Helper to format inline markdown like **bold** and [link](url)
function renderFormattedInline(text: string): React.ReactNode {
  if (!text) return null;

  // Split by bold (**bold**) and links [text](url)
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*.*?\*\*|\[.*?\]\(.*?\))/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      const boldText = token.slice(2, -2);
      parts.push(
        <strong key={match.index} className="font-bold text-slate-900">
          {boldText}
        </strong>
      );
    } else if (token.startsWith('[') && token.includes('](') && token.endsWith(')')) {
      const closeBracket = token.indexOf('](');
      const linkLabel = token.slice(1, closeBracket);
      const linkUrl = token.slice(closeBracket + 2, -1);
      parts.push(
        <a
          key={match.index}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-bold text-blue-700 hover:text-blue-900 hover:underline"
        >
          {linkLabel}
          <ExternalLink className="w-3 h-3 inline shrink-0" />
        </a>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

interface ParsedBlock {
  type: 'table' | 'heading2' | 'heading3' | 'callout' | 'paragraph';
  content?: string;
  tableData?: {
    headers: string[];
    alignments: ('left' | 'center' | 'right')[];
    rows: string[][];
  };
}

// Content parser that turns raw markdown lines into structured blocks
function parseArticleBlocks(fullContent: string[]): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  let currentTableLines: string[] = [];

  const flushTable = () => {
    if (currentTableLines.length < 2) {
      currentTableLines.forEach((line) => {
        blocks.push({ type: 'paragraph', content: line });
      });
      currentTableLines = [];
      return;
    }

    // Process table
    const headerLine = currentTableLines[0];
    const rawHeaders = headerLine
      .split('|')
      .map((c) => c.trim())
      .filter((c, i, arr) => (i === 0 && c === '' ? false : i === arr.length - 1 && c === '' ? false : true));

    // Alignments line
    const alignLine = currentTableLines[1] || '';
    const rawAligns = alignLine
      .split('|')
      .map((c) => c.trim())
      .filter((c, i, arr) => (i === 0 && c === '' ? false : i === arr.length - 1 && c === '' ? false : true));

    const alignments: ('left' | 'center' | 'right')[] = rawAligns.map((a) => {
      if (a.startsWith(':') && a.endsWith(':')) return 'center';
      if (a.endsWith(':')) return 'right';
      return 'left';
    });

    // Rows
    const rows: string[][] = [];
    for (let i = 2; i < currentTableLines.length; i++) {
      const line = currentTableLines[i];
      if (!line.trim()) continue;
      const cells = line
        .split('|')
        .map((c) => c.trim())
        .filter((c, idx, arr) => (idx === 0 && c === '' ? false : idx === arr.length - 1 && c === '' ? false : true));
      rows.push(cells);
    }

    blocks.push({
      type: 'table',
      tableData: {
        headers: rawHeaders,
        alignments,
        rows
      }
    });

    currentTableLines = [];
  };

  for (const line of fullContent) {
    const trimmed = line.trim();

    if (trimmed.startsWith('|')) {
      currentTableLines.push(trimmed);
      continue;
    }

    if (currentTableLines.length > 0) {
      flushTable();
    }

    if (!trimmed) {
      continue;
    }

    if (trimmed.startsWith('### ')) {
      blocks.push({ type: 'heading3', content: trimmed.replace(/^###\s+/, '') });
    } else if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'heading2', content: trimmed.replace(/^##\s+/, '') });
    } else if (trimmed.startsWith('> ')) {
      blocks.push({ type: 'callout', content: trimmed.replace(/^>\s+/, '') });
    } else {
      blocks.push({ type: 'paragraph', content: trimmed });
    }
  }

  if (currentTableLines.length > 0) {
    flushTable();
  }

  return blocks;
}

export const ArticleDetailPage: React.FC<ArticleDetailPageProps> = ({
  article,
  allNews,
  govOrders,
  onNavigate,
}) => {
  const [copied, setCopied] = useState(false);
  const [tableCopied, setTableCopied] = useState(false);

  // SEO & Social Tags Integration (applet-seo skill)
  useEffect(() => {
    if (!article) return;

    // Document title
    const prevTitle = document.title;
    document.title = `${article.title} | UP Outsource Seva Nigam`;

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc ? metaDesc.getAttribute('content') : null;
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', article.shortDescription);

    // Helper for Meta tags
    const setMetaTag = (attrName: string, attrVal: string, contentVal: string) => {
      let tag = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attrName, attrVal);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', contentVal);
    };

    // OpenGraph
    setMetaTag('property', 'og:title', article.title);
    setMetaTag('property', 'og:description', article.shortDescription);
    setMetaTag('property', 'og:image', article.featuredImage);
    setMetaTag('property', 'og:type', 'article');
    setMetaTag('property', 'og:site_name', 'UP Outsource Seva Nigam');
    setMetaTag('property', 'og:url', window.location.href);

    // Twitter Card
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', article.title);
    setMetaTag('name', 'twitter:description', article.shortDescription);
    setMetaTag('name', 'twitter:image', article.featuredImage);

    // Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.origin + window.location.pathname);

    // Schema.org Structured Data
    const isRecruitment = article.category === 'भर्ती एवं तैनाती' || article.tags?.some(t => t.includes('भर्ती') || t.includes('Nurse'));
    const schemaData = isRecruitment
      ? {
          '@context': 'https://schema.org',
          '@type': 'JobPosting',
          title: article.title,
          description: article.shortDescription,
          identifier: {
            '@type': 'PropertyValue',
            name: 'UP Sewayojan Outsource',
            value: article.id
          },
          datePosted: article.publicationDate,
          validThrough: '2026-09-27T23:59:59+05:30',
          employmentType: 'CONTRACTOR',
          hiringOrganization: {
            '@type': 'Organization',
            name: 'महिला कल्याण विभाग (उत्तर प्रदेश शासन) / SB ENTERPRISES',
            sameAs: 'https://sewayojan.up.nic.in'
          },
          jobLocation: {
            '@type': 'Place',
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Prayagraj',
              addressRegion: 'Uttar Pradesh',
              addressCountry: 'IN'
            }
          },
          baseSalary: {
            '@type': 'MonetaryAmount',
            currency: 'INR',
            value: {
              '@type': 'QuantitativeValue',
              value: 27000,
              unitText: 'MONTH'
            }
          }
        }
      : {
          '@context': 'https://schema.org',
          '@type': 'NewsArticle',
          headline: article.title,
          image: [article.featuredImage],
          datePublished: article.publicationDate,
          dateModified: article.publicationDate,
          author: [{ '@type': 'Person', name: article.author }],
          publisher: {
            '@type': 'Organization',
            name: 'UP Outsource Seva Nigam',
            logo: { '@type': 'ImageObject', url: window.location.origin + '/logo.png' }
          },
          description: article.shortDescription
        };

    let scriptTag = document.getElementById('jsonld-article-schema');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'jsonld-article-schema';
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(schemaData);

    return () => {
      document.title = prevTitle;
      if (prevDesc && metaDesc) metaDesc.setAttribute('content', prevDesc);
      const tag = document.getElementById('jsonld-article-schema');
      if (tag) tag.remove();
    };
  }, [article]);

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

  const handlePrint = () => {
    window.print();
  };

  const handleCopyAllTables = () => {
    const textToCopy = article.fullContent
      .filter(l => l.startsWith('|') || l.startsWith('###'))
      .join('\n');
    navigator.clipboard.writeText(textToCopy || article.fullContent.join('\n\n'));
    setTableCopied(true);
    setTimeout(() => setTableCopied(false), 2500);
  };

  const shareText = encodeURIComponent(`${article.title}\n\nUP Outsource Seva Nigam पोर्टल पर संपूर्ण विवरण पढ़ें:\n`);
  const currentUrl = encodeURIComponent(window.location.href);

  // Parse markdown content into structured blocks (tables, headings, callouts, paragraphs)
  const contentBlocks = parseArticleBlocks(article.fullContent);

  return (
    <div className="w-full py-6 sm:py-8 bg-slate-50 min-h-screen">
      <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
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

        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <button
            onClick={() => onNavigate({ type: 'news-list' })}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 hover:text-blue-950 px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-2xs transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>समाचार सूची पर वापस जाएं</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 shadow-2xs transition"
              title="पोस्ट प्रिंट अथवा PDF सेव करें"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">प्रिंट / PDF</span>
            </button>

            <button
              onClick={handleCopyAllTables}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 shadow-2xs transition"
              title="रिक्ति विवरण तालिका कॉपी करें"
            >
              {tableCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">तालिका कॉपी हुई!</span>
                </>
              ) : (
                <>
                  <TableIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline">तालिका डेटा कॉपी करें</span>
                </>
              )}
            </button>
          </div>
        </div>

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
              {article.isBreaking && (
                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  नवीनतम विज्ञप्ति
                </span>
              )}
            </div>

            {/* Headline (SEO Optimized, Clean and High-CTR) */}
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

            {/* Share & Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80 mb-6 text-xs">
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
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80';
                }}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Short Lead Summary */}
            <div className="text-base sm:text-lg font-semibold text-slate-800 leading-relaxed mb-6 pl-4 border-l-4 border-blue-900 italic bg-blue-50/30 p-3 rounded-r-xl">
              {article.shortDescription}
            </div>

            {/* Key Highlights Box (महत्वपूर्ण बिंदु) */}
            {article.keyHighlights && article.keyHighlights.length > 0 && (
              <div className="bg-gradient-to-br from-blue-50/90 to-indigo-50/70 border border-blue-200 rounded-xl p-5 mb-8 shadow-2xs">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-blue-900" />
                  <h3 className="font-bold text-sm sm:text-base text-blue-950">
                    रिक्ति के मुख्य बिंदु व त्वरित सारांश (Key Highlights):
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-slate-800">
                  {article.keyHighlights.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-white/70 p-2.5 rounded-lg border border-blue-100 shadow-3xs">
                      <BadgeCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                      <span className="leading-snug font-medium text-slate-800">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Direct Portal Application Callout Banner */}
            {article.sourceUrl && (
              <div className="mb-8 p-4 bg-gradient-to-r from-blue-900 via-blue-950 to-slate-900 rounded-xl text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div>
                  <h4 className="font-bold text-sm sm:text-base mb-1 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>उत्तर प्रदेश सेवायोजन आधिकारिक पोर्टल लिंक</span>
                  </h4>
                  <p className="text-xs text-blue-100 leading-relaxed">
                    यह भर्ती आधिकारिक पोर्टल पर लाइव है। पात्रता अनुसार अपना ऑनलाइन आवेदन सीधे दर्ज करें।
                  </p>
                </div>
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-xs sm:text-sm transition flex items-center gap-1.5 shrink-0 shadow-sm"
                >
                  <span>पोर्टल पर आवेदन करें</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

            {/* Structured Content & Rich Tabular Presentation */}
            <div className="space-y-6 text-sm sm:text-base text-slate-700 leading-relaxed mb-8">
              {contentBlocks.map((block, bIdx) => {
                if (block.type === 'heading2') {
                  return (
                    <h2
                      key={bIdx}
                      className="text-lg sm:text-xl font-black text-slate-900 mt-8 mb-4 pb-2 border-b border-blue-200 flex items-center gap-2"
                    >
                      <span className="w-1.5 h-6 bg-blue-900 rounded-sm" />
                      <span>{renderFormattedInline(block.content || '')}</span>
                    </h2>
                  );
                }

                if (block.type === 'heading3') {
                  return (
                    <div
                      key={bIdx}
                      className="mt-8 mb-3 flex items-center gap-2.5 pt-4 border-t border-slate-100"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-700 shrink-0" />
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                        {renderFormattedInline(block.content || '')}
                      </h3>
                    </div>
                  );
                }

                if (block.type === 'callout') {
                  return (
                    <div
                      key={bIdx}
                      className="my-5 p-4 rounded-xl bg-amber-50 border-l-4 border-amber-500 text-amber-950 text-xs sm:text-sm flex items-start gap-3 shadow-2xs"
                    >
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="leading-relaxed font-medium">
                        {renderFormattedInline(block.content || '')}
                      </div>
                    </div>
                  );
                }

                if (block.type === 'table' && block.tableData) {
                  const { headers, alignments, rows } = block.tableData;
                  return (
                    <div
                      key={bIdx}
                      className="my-6 overflow-hidden rounded-xl border border-slate-200 shadow-2xs bg-white"
                    >
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[500px]">
                          <thead>
                            <tr className="bg-slate-100/90 text-slate-900 border-b-2 border-slate-300">
                              {headers.map((h, hIdx) => {
                                const align = alignments[hIdx] || 'left';
                                const alignClass =
                                  align === 'center'
                                    ? 'text-center'
                                    : align === 'right'
                                    ? 'text-right'
                                    : 'text-left';
                                return (
                                  <th
                                    key={hIdx}
                                    className={`px-3.5 py-3 font-bold tracking-tight text-slate-800 ${alignClass}`}
                                  >
                                    {renderFormattedInline(h)}
                                  </th>
                                );
                              })}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {rows.map((row, rIdx) => (
                              <tr
                                key={rIdx}
                                className="hover:bg-blue-50/40 even:bg-slate-50/50 transition-colors"
                              >
                                {row.map((cell, cIdx) => {
                                  const align = alignments[cIdx] || 'left';
                                  const alignClass =
                                    align === 'center'
                                      ? 'text-center'
                                      : align === 'right'
                                      ? 'text-right'
                                      : 'text-left';
                                  return (
                                    <td
                                      key={cIdx}
                                      className={`px-3.5 py-3 text-slate-700 leading-relaxed font-normal ${alignClass}`}
                                    >
                                      {renderFormattedInline(cell)}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                }

                return (
                  <p key={bIdx} className="leading-relaxed">
                    {renderFormattedInline(block.content || '')}
                  </p>
                );
              })}
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
