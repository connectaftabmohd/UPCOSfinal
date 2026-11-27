/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { 
  BrowserRouter, 
  Routes, 
  Route, 
  useNavigate, 
  useLocation, 
  useParams,
  useSearchParams 
} from 'react-router-dom';
import { PageView, NewsItem, GovernmentOrder, Department, FAQItem } from './types';
import { contentStore } from './data/contentStore';
import { DEPARTMENTS_DATA, FAQS_DATA } from './data/mockData';

// Core UI Components
import { Header } from './components/Header';
import { BreakingNewsTicker } from './components/BreakingNewsTicker';
import { StatewideCommunityHero } from './components/StatewideCommunityHero';
import { WhyJoinSection } from './components/WhyJoinSection';
import { HomeHero } from './components/HomeHero';
import { GovOrdersSection } from './components/GovOrdersSection';
import { DepartmentsSection } from './components/DepartmentsSection';
import { EmployeeHubSection } from './components/EmployeeHubSection';
import { SourceReferenceBox } from './components/SourceReferenceBox';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AdPlacement } from './components/AdPlacement';

// Pages & Modals (Lazy-loaded to reduce initial main-thread parse/FID)
const SearchModal = lazy(() => import('./components/SearchModal').then((m) => ({ default: m.SearchModal })));
const ArticleDetailPage = lazy(() => import('./components/ArticleDetailPage').then((m) => ({ default: m.ArticleDetailPage })));
const GovOrderDetailPage = lazy(() => import('./components/GovOrderDetailPage').then((m) => ({ default: m.GovOrderDetailPage })));
const DepartmentDetailPage = lazy(() => import('./components/DepartmentDetailPage').then((m) => ({ default: m.DepartmentDetailPage })));
const NewsListPage = lazy(() => import('./components/NewsListPage').then((m) => ({ default: m.NewsListPage })));
const SearchResultsPage = lazy(() => import('./components/SearchResultsPage').then((m) => ({ default: m.SearchResultsPage })));
const StaticPages = lazy(() => import('./components/StaticPages').then((m) => ({ default: m.StaticPages })));
const AdminCMS = lazy(() => import('./components/AdminCMS').then((m) => ({ default: m.AdminCMS })));
const CommunityFeedPage = lazy(() => import('./components/CommunityFeedPage').then((m) => ({ default: m.CommunityFeedPage })));
const BloggerThemeExportModal = lazy(() => import('./components/BloggerThemeExportModal').then((m) => ({ default: m.BloggerThemeExportModal })));
const SewayojanSyncModal = lazy(() => import('./components/SewayojanSyncModal').then((m) => ({ default: m.SewayojanSyncModal })));
const AuthModal = lazy(() => import('./components/AuthModal').then((m) => ({ default: m.AuthModal })));
const UserProfileModal = lazy(() => import('./components/UserProfileModal').then((m) => ({ default: m.UserProfileModal })));
const AdminAccessModal = lazy(() => import('./components/AdminAccessModal').then((m) => ({ default: m.AdminAccessModal })));
const NotFoundPage = lazy(() => import('./components/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));
const SitemapPage = lazy(() => import('./components/SitemapPage').then((m) => ({ default: m.SitemapPage })));
import { initializeAutoSyncEngine } from './services/sewayojanSyncService';
import { authService } from './services/authService';
import { UserProfile } from './types';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import {
  updatePageSEO,
  getCanonicalUrl,
  resolveAbsoluteImageUrl,
  buildJobPostingJsonLd
} from './utils/seo';

const buildArticleJobPostingNodes = (article: NewsItem) => {
  const fallbackPrayagrajJob =
    article.id === 'post-sb-staff-nurse-prayagraj'
      ? [
          {
            identifier: article.id,
            title: article.title,
            description: article.shortDescription,
            hiringOrganization: 'महिला कल्याण विभाग (उत्तर प्रदेश शासन) / SB ENTERPRISES',
            sameAs: 'https://sewayojan.up.nic.in',
            locality: 'Prayagraj',
            region: 'Uttar Pradesh',
            country: 'IN',
            salaryValue: 27000,
            salaryCurrency: 'INR',
            salaryUnit: 'MONTH' as const,
            datePosted: article.publicationDate,
            validThrough: '2026-09-27T23:59:59+05:30',
            employmentType: 'CONTRACTOR',
            qualifications: 'B.Sc. Nursing',
            experienceRequirements: '3 Years'
          }
        ]
      : [];

  const activeJobs =
    article.jobPostings && article.jobPostings.length > 0
      ? article.jobPostings
      : fallbackPrayagrajJob;

  return activeJobs.map((job, idx) =>
    buildJobPostingJsonLd(job, {
      articleId: article.id,
      articleSlug: article.slug,
      publicationDate: article.publicationDate,
      sourceUrl: article.sourceUrl,
      index: idx
    })
  );
};

const buildEmployeeHubFaqJsonLd = (faqsList: FAQItem[], pageUrl: string) => {
  const activeFaqs = faqsList && faqsList.length > 0 ? faqsList : FAQS_DATA;
  return {
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faq`,
    url: pageUrl,
    inLanguage: 'hi-IN',
    name: 'कर्मचारी सूचना हब – अक्सर पूछे जाने वाले प्रश्न (FAQ)',
    mainEntity: activeFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
};

// -------------------------------------------------------------
// Route Wrappers with parameter resolution & 404 validation
// -------------------------------------------------------------

function ArticleRouteWrapper({
  news,
  orders,
  onNavigate
}: {
  news: NewsItem[];
  orders: GovernmentOrder[];
  onNavigate: (view: PageView) => void;
}) {
  const { slug } = useParams<{ slug: string }>();
  const article = news.find((n) => n.slug === slug || n.id === slug);

  useEffect(() => {
    if (article) {
      const canonicalHref = getCanonicalUrl(`/news/${article.slug}`);
      const absoluteOgImage = resolveAbsoluteImageUrl(article.featuredImage);
      const jobPostingNodes = buildArticleJobPostingNodes(article);

      updatePageSEO({
        title: `${article.title} – UP Outsource Seva Nigam`,
        description: article.shortDescription,
        keywords: article.tags,
        canonicalUrl: canonicalHref,
        ogType: 'article',
        image: article.featuredImage,
        publishedTime: article.publicationDate,
        author: article.author,
        structuredData: {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'NewsArticle',
              mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': canonicalHref
              },
              headline: article.title,
              alternativeHeadline: article.englishTitle || article.title,
              image: [absoluteOgImage],
              datePublished: article.publicationDate,
              dateModified: article.publicationDate,
              inLanguage: 'hi-IN',
              isAccessibleForFree: true,
              articleSection: article.category,
              wordCount: (article.fullContent || []).join(' ').trim().split(/\s+/).filter(Boolean).length,
              keywords: article.tags?.join(', '),
              author: [{ '@type': 'Person', name: article.author, url: getCanonicalUrl('/about-us') }],
              publisher: {
                '@type': 'NewsMediaOrganization',
                name: 'UPCOS – UP Outsource Seva Nigam News & Information',
                url: 'https://upcos.netlify.app',
                logo: {
                  '@type': 'ImageObject',
                  url: getCanonicalUrl('/logo.png'),
                  width: 1024,
                  height: 1024
                }
              },
              description: article.shortDescription
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Home',
                  item: 'https://upcos.netlify.app/'
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'News',
                  item: 'https://upcos.netlify.app/news'
                },
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: article.title,
                  item: canonicalHref
                }
              ]
            },
            ...jobPostingNodes
          ]
        }
      });
    }
  }, [article]);

  if (!article) {
    return (
      <NotFoundPage 
        onNavigate={onNavigate} 
        itemType="article" 
        message={`"${slug}" से संबंधित कोई समाचार आलेख नहीं मिला।`} 
      />
    );
  }

  return (
    <ArticleDetailPage
      article={article}
      allNews={news}
      govOrders={orders}
      onNavigate={onNavigate}
    />
  );
}

function OrderRouteWrapper({
  orders,
  onNavigate
}: {
  orders: GovernmentOrder[];
  onNavigate: (view: PageView) => void;
}) {
  const { slug } = useParams<{ slug: string }>();
  const order = orders.find((o) => o.slug === slug || o.id === slug || o.orderNumber === slug);

  useEffect(() => {
    if (order) {
      const orderUrl = getCanonicalUrl(`/shasanadesh/${order.slug}`);
      updatePageSEO({
        title: `${order.orderNumber}: ${order.title} – UPCOS शासनादेश`,
        description: order.summary,
        canonicalUrl: orderUrl,
        ogType: 'article',
        structuredData: {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'DigitalDocument',
              '@id': `${orderUrl}#order`,
              name: order.title,
              identifier: order.orderNumber,
              datePublished: order.date,
              description: order.summary,
              inLanguage: 'hi-IN',
              url: orderUrl,
              publisher: {
                '@type': 'Organization',
                name: 'UP Outsource Seva Nigam',
                url: 'https://upcos.netlify.app'
              }
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://upcos.netlify.app/' },
                { '@type': 'ListItem', position: 2, name: 'Shasanadesh', item: 'https://upcos.netlify.app/shasanadesh' },
                { '@type': 'ListItem', position: 3, name: order.orderNumber, item: orderUrl }
              ]
            }
          ]
        }
      });
    }
  }, [order]);

  if (!order) {
    return (
      <NotFoundPage 
        onNavigate={onNavigate} 
        itemType="order" 
        message={`"${slug}" से संबंधित कोई शासकीय परिपत्र अथवा शासनादेश नहीं मिला।`} 
      />
    );
  }

  return (
    <GovOrderDetailPage
      order={order}
      onNavigate={onNavigate}
    />
  );
}

function DepartmentRouteWrapper({
  departments,
  news,
  orders,
  onNavigate
}: {
  departments: Department[];
  news: NewsItem[];
  orders: GovernmentOrder[];
  onNavigate: (view: PageView) => void;
}) {
  const { id } = useParams<{ id: string }>();
  const dept = departments.find((d) => d.id === id);

  const deptNews = useMemo(
    () => news.filter((n) => n.departmentId === dept?.id || n.department.includes(dept?.name.substring(0, 4) || '')),
    [news, dept]
  );
  const deptOrders = useMemo(
    () => orders.filter((o) => o.departmentId === dept?.id || o.department.includes(dept?.name.substring(0, 4) || '')),
    [orders, dept]
  );

  useEffect(() => {
    if (dept) {
      const deptUrl = getCanonicalUrl(`/departments/${dept.id}`);
      const deptJobPostings = deptNews.flatMap((article) => buildArticleJobPostingNodes(article));
      updatePageSEO({
        title: `${dept.name} (${dept.englishName}) – आउटसोर्स समाचार व शासनादेश | UPCOS`,
        description: dept.description,
        canonicalUrl: deptUrl,
        structuredData: {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'CollectionPage',
              '@id': `${deptUrl}#collection`,
              name: dept.name,
              description: dept.description,
              url: deptUrl,
              inLanguage: 'hi-IN'
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://upcos.netlify.app/' },
                { '@type': 'ListItem', position: 2, name: 'Departments', item: 'https://upcos.netlify.app/departments' },
                { '@type': 'ListItem', position: 3, name: dept.name, item: deptUrl }
              ]
            },
            ...deptJobPostings
          ]
        }
      });
    }
  }, [dept, deptNews]);

  if (!dept) {
    return (
      <NotFoundPage 
        onNavigate={onNavigate} 
        itemType="page" 
        message={`विभाग पहचानकर्ता "${id}" नहीं मिला।`} 
      />
    );
  }

  return (
    <DepartmentDetailPage
      department={dept}
      deptNews={deptNews}
      deptOrders={deptOrders}
      onNavigate={onNavigate}
    />
  );
}

function NewsListRouteWrapper({
  news,
  onNavigate,
  onRefresh
}: {
  news: NewsItem[];
  onNavigate: (view: PageView) => void;
  onRefresh: () => void;
}) {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || undefined;
  const department = searchParams.get('department') || undefined;

  return (
    <NewsListPage
      news={news}
      initialCategory={category}
      initialDepartment={department}
      onNavigate={onNavigate}
      onRefresh={onRefresh}
    />
  );
}

function SearchRouteWrapper({
  news,
  orders,
  departments,
  onNavigate
}: {
  news: NewsItem[];
  orders: GovernmentOrder[];
  departments: Department[];
  onNavigate: (view: PageView) => void;
}) {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  useEffect(() => {
    updatePageSEO({
      title: query ? `खोज परिणाम: "${query}" – UPCOS` : 'खोज पृष्ठ (Search) – UPCOS',
      description: 'UPCOS पोर्टल पर समाचार, शासनादेश और विभागीय सूचना खोजें।',
      canonicalUrl: getCanonicalUrl('/search'),
      noindex: true,
      robots: 'noindex, follow'
    });
  }, [query]);

  return (
    <SearchResultsPage
      initialQuery={query}
      allNews={news}
      allOrders={orders}
      allDepartments={departments}
      onNavigate={onNavigate}
    />
  );
}

function MainApp() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isBloggerModalOpen, setIsBloggerModalOpen] = useState(false);
  const [isSewayojanModalOpen, setIsSewayojanModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAdminAccessModalOpen, setIsAdminAccessModalOpen] = useState(false);
  const { language, toggleLanguage } = useLanguage();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => authService.getCurrentUser());

  // Load data from contentStore & server
  const [news, setNews] = useState<NewsItem[]>(() => contentStore.getNews());
  const [orders, setOrders] = useState<GovernmentOrder[]>(() => contentStore.getOrders());
  const [departments, setDepartments] = useState<Department[]>(() => contentStore.getDepartments());
  const [tickerItems, setTickerItems] = useState<string[]>(() => contentStore.getTickerItems());
  const [faqs, setFaqs] = useState<FAQItem[]>(() => contentStore.getFaqs());

  const refreshData = () => {
    setNews(contentStore.getNews());
    setOrders(contentStore.getOrders());
    setDepartments(contentStore.getDepartments());
    setTickerItems(contentStore.getTickerItems());
    setFaqs(contentStore.getFaqs());
  };

  // Convert PageView object into actual browser URL
  const handleNavigate = (view: PageView) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    switch (view.type) {
      case 'home':
        navigate('/');
        break;
      case 'news-list':
        navigate(view.category ? `/news?category=${encodeURIComponent(view.category)}` : '/news');
        break;
      case 'news-detail':
        const foundArticle = news.find((n) => n.id === view.id || n.slug === view.id);
        navigate(`/news/${foundArticle?.slug || view.id}`);
        break;
      case 'gov-orders':
        navigate('/shasanadesh');
        break;
      case 'gov-order-detail':
        const foundOrder = orders.find((o) => o.id === view.id || o.slug === view.id);
        navigate(`/shasanadesh/${foundOrder?.slug || view.id}`);
        break;
      case 'departments':
        navigate('/departments');
        break;
      case 'department-detail':
        navigate(`/departments/${view.id}`);
        break;
      case 'talk-corner':
        navigate('/employee-community');
        break;
      case 'employee-hub':
        navigate('/employee-hub');
        break;
      case 'search':
        navigate(`/search?q=${encodeURIComponent(view.query || '')}`);
        break;
      case 'about':
        navigate('/about-us');
        break;
      case 'contact':
        navigate('/contact-us');
        break;
      case 'privacy':
        navigate('/privacy-policy');
        break;
      case 'disclaimer':
        navigate('/disclaimer');
        break;
      case 'terms':
        navigate('/terms-and-conditions');
        break;
      case 'editorial-policy':
        navigate('/editorial-policy');
        break;
      case 'fact-checking':
        navigate('/fact-checking-policy');
        break;
      case 'corrections-policy':
        navigate('/correction-policy');
        break;
      case 'copyright-policy':
        navigate('/copyright-policy');
        break;
      case 'advertise':
        navigate('/advertise');
        break;
      case 'sitemap':
        navigate('/sitemap');
        break;
      case 'admin':
        navigate('/admin');
        break;
      default:
        navigate('/');
    }
  };

  // Support legacy query parameter URL redirects (e.g. ?view=about -> /about-us)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const viewParam = params.get('view');
    if (viewParam) {
      switch (viewParam) {
        case 'about':
          navigate('/about-us', { replace: true });
          break;
        case 'contact':
          navigate('/contact-us', { replace: true });
          break;
        case 'privacy':
          navigate('/privacy-policy', { replace: true });
          break;
        case 'disclaimer':
          navigate('/disclaimer', { replace: true });
          break;
        case 'terms':
          navigate('/terms-and-conditions', { replace: true });
          break;
        case 'editorial-policy':
          navigate('/editorial-policy', { replace: true });
          break;
        case 'fact-checking':
          navigate('/fact-checking-policy', { replace: true });
          break;
        case 'corrections-policy':
          navigate('/correction-policy', { replace: true });
          break;
        case 'copyright-policy':
          navigate('/copyright-policy', { replace: true });
          break;
        case 'advertise':
          navigate('/advertise', { replace: true });
          break;
        case 'news':
          navigate('/news', { replace: true });
          break;
        case 'gov-orders':
          navigate('/shasanadesh', { replace: true });
          break;
        case 'departments':
          navigate('/departments', { replace: true });
          break;
        case 'employee-hub':
          navigate('/employee-hub', { replace: true });
          break;
        case 'talk-corner':
          navigate('/employee-community', { replace: true });
          break;
        case 'news-detail':
          const nid = params.get('id');
          if (nid) {
            const a = news.find((n) => n.id === nid);
            navigate(`/news/${a?.slug || nid}`, { replace: true });
          }
          break;
        case 'gov-order-detail':
          const oid = params.get('id');
          if (oid) {
            const o = orders.find((ord) => ord.id === oid);
            navigate(`/shasanadesh/${o?.slug || oid}`, { replace: true });
          }
          break;
      }
    }
  }, [location.search]);

  // Compute currentView state from location pathname for active header tab highlighting
  const currentView: PageView = useMemo(() => {
    const p = location.pathname;
    if (p === '/' || p === '') return { type: 'home' };
    if (p.startsWith('/news/')) return { type: 'news-detail', id: p.replace('/news/', '') };
    if (p === '/news') return { type: 'news-list' };
    if (p.startsWith('/shasanadesh/')) return { type: 'gov-order-detail', id: p.replace('/shasanadesh/', '') };
    if (p === '/shasanadesh') return { type: 'gov-orders' };
    if (p.startsWith('/departments/')) return { type: 'department-detail', id: p.replace('/departments/', '') };
    if (p === '/departments') return { type: 'departments' };
    if (p === '/employee-hub') return { type: 'employee-hub' };
    if (p === '/employee-community') return { type: 'talk-corner' };
    if (p === '/search') return { type: 'search', query: '' };
    if (p === '/about-us') return { type: 'about' };
    if (p === '/contact-us') return { type: 'contact' };
    if (p === '/privacy-policy') return { type: 'privacy' };
    if (p === '/disclaimer') return { type: 'disclaimer' };
    if (p === '/terms-and-conditions') return { type: 'terms' };
    if (p === '/editorial-policy') return { type: 'editorial-policy' };
    if (p === '/fact-checking-policy') return { type: 'fact-checking' };
    if (p === '/correction-policy') return { type: 'corrections-policy' };
    if (p === '/copyright-policy') return { type: 'copyright-policy' };
    if (p === '/advertise') return { type: 'advertise' };
    if (p === '/sitemap') return { type: 'sitemap' };
    if (p === '/admin') return { type: 'admin' };
    return { type: 'home' };
  }, [location.pathname]);

  // Lifecycle listeners (deferred non-critical work to keep initial FID < 50ms)
  useEffect(() => {
    let cleanupSync: (() => void) | undefined;
    let idleId: number | undefined;
    let timerId: number | undefined;

    const runDeferredInit = () => {
      authService.verifyServerSession().then((u) => {
        if (u) setCurrentUser(u);
      });
      contentStore.fetchFromServer().then((updated) => {
        if (updated) refreshData();
      });
      cleanupSync = initializeAutoSyncEngine(() => {
        refreshData();
      });
    };

    const win = typeof window !== 'undefined' ? window : undefined;
    if (win && 'requestIdleCallback' in win) {
      idleId = (win as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(runDeferredInit, { timeout: 1500 });
    } else if (win) {
      timerId = win.setTimeout(runDeferredInit, 600);
    }

    const unsubAuth = authService.subscribe((u) => {
      setCurrentUser(u);
    });

    // Keyboard shortcut for Admin Access: Ctrl+Shift+A or Cmd+Shift+A
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.ctrlKey || e.metaKey;
      if (
        (isCmdOrCtrl && e.shiftKey && (e.key === 'a' || e.key === 'A')) ||
        (e.altKey && (e.key === 'a' || e.key === 'A'))
      ) {
        e.preventDefault();
        if (authService.isAdminUser()) {
          navigate('/admin');
        } else {
          setIsAdminAccessModalOpen(true);
        }
      }
    };

    const checkAdminHash = () => {
      if (window.location.hash === '#admin') {
        if (authService.isAdminUser()) {
          navigate('/admin');
        } else {
          setIsAdminAccessModalOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('hashchange', checkAdminHash);
    checkAdminHash();

    return () => {
      if (idleId && win && 'cancelIdleCallback' in win) {
        (win as Window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleId);
      }
      if (timerId && win) win.clearTimeout(timerId);
      if (cleanupSync) cleanupSync();
      unsubAuth();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', checkAdminHash);
    };
  }, []);

  // Update Dynamic SEO per pathname (scheduled via idle/micro-yield so hydration stays snappy)
  useEffect(() => {
    const applyRouteSeo = () => {
    const isEn = language === 'EN';
    const p = location.pathname;
    const makeBreadcrumbs = (label: string, pathStr: string) => ({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://upcos.netlify.app/' },
        { '@type': 'ListItem', position: 2, name: label, item: `https://upcos.netlify.app${pathStr}` }
      ]
    });

    const activeJobPostings = (news || []).slice(0, 6).flatMap((article) => buildArticleJobPostingNodes(article));

    if (p === '/') {
      const homeUrl = getCanonicalUrl('/');
      const homeFaqSchema = buildEmployeeHubFaqJsonLd(faqs, homeUrl);
      updatePageSEO({
        title: isEn
          ? 'UPCOS – UP Outsource Seva Nigam Portal | News, Shasanadesh & Jobs'
          : 'UPCOS – उत्तर प्रदेश आउटसोर्स सेवा मंच | समाचार, शासनादेश एवं सेवायोजन भर्ती',
        description: isEn
          ? 'Independent information and awareness portal for outsourced and contractual workers across Uttar Pradesh government departments.'
          : 'उत्तर प्रदेश राज्य सरकार के विभिन्न विभागों में कार्यरत आउटसोर्स एवं संविदा कर्मचारियों के लिए आधिकारिक समाचार, सेवायोजन भर्ती, शासनादेश, न्यूनतम वेतन और सेवा संबंधी जानकारी का प्रमुख स्वतंत्र मंच।',
        canonicalUrl: homeUrl,
        structuredData: {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'CollectionPage',
              name: 'UPCOS – UP Outsource Seva Nigam News & Job Updates',
              url: homeUrl,
              inLanguage: 'hi-IN'
            },
            homeFaqSchema,
            ...activeJobPostings
          ]
        }
      });
    } else if (p === '/news') {
      const url = getCanonicalUrl('/news');
      updatePageSEO({
        title: isEn ? 'Latest Outsource News & Updates – UPCOS' : 'ताज़ा खबरें एवं विभागीय समाचार – UPCOS',
        description: 'उत्तर प्रदेश आउटसोर्सिंग एवं संविदा कर्मचारियों से जुड़े नवीनतम समाचार, मानदेय वृद्धि एवं सेवायोजन भर्ती सूचनाएं।',
        canonicalUrl: url,
        structuredData: {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'CollectionPage',
              name: 'ताज़ा खबरें एवं विभागीय समाचार – UPCOS',
              url,
              inLanguage: 'hi-IN'
            },
            makeBreadcrumbs('News', '/news'),
            ...activeJobPostings
          ]
        }
      });
    } else if (p === '/shasanadesh') {
      const url = getCanonicalUrl('/shasanadesh');
      updatePageSEO({
        title: isEn ? 'Official Government Orders (Shasanadesh) – UPCOS' : 'शासनादेश एवं विधिक परिपत्र (Shasanadesh) – UPCOS',
        description: 'उत्तर प्रदेश शासन के कार्मिक, वित्त एवं अन्य विभागों द्वारा जारी आउटसोर्सिंग संबंधी आधिकारिक शासनादेश।',
        canonicalUrl: url,
        structuredData: {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'CollectionPage',
              name: 'उत्तर प्रदेश आउटसोर्सिंग शासनादेश संग्रह',
              url,
              inLanguage: 'hi-IN'
            },
            makeBreadcrumbs('Shasanadesh', '/shasanadesh')
          ]
        }
      });
    } else if (p === '/departments') {
      const url = getCanonicalUrl('/departments');
      updatePageSEO({
        title: isEn ? 'Departments Information Portal – UPCOS' : 'विभागीय मार्गदर्शिका एवं सूचना – UPCOS',
        description: 'स्वास्थ्य, शिक्षा, पंचायती राज, ऊर्जा समेत उ.प्र. के सभी प्रमुख सरकारी विभागों के आउटसोर्स कर्मचारी आदेश।',
        canonicalUrl: url,
        structuredData: {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'CollectionPage',
              name: 'उत्तर प्रदेश विभागीय आउटसोर्स सूचना केंद्र',
              url,
              inLanguage: 'hi-IN'
            },
            makeBreadcrumbs('Departments', '/departments')
          ]
        }
      });
    } else if (p === '/employee-hub') {
      const url = getCanonicalUrl('/employee-hub');
      updatePageSEO({
        title: isEn ? 'Employee Hub & Salary Calculator – UPCOS' : 'कर्मचारी सूचना हब एवं वेतन कैलकुलेटर – UPCOS',
        description: 'वेतन श्रेणियां, ईपीएफ-ईएसआई कैलकुलेटर, अवकाश नियम और कर्मचारी अधिकार संबंधी विस्तृत जानकारी।',
        canonicalUrl: url,
        structuredData: {
          '@context': 'https://schema.org',
          '@graph': [
            buildEmployeeHubFaqJsonLd(faqs, url),
            makeBreadcrumbs('Employee Hub', '/employee-hub')
          ]
        }
      });
    } else if (p === '/employee-community') {
      updatePageSEO({
        title: isEn ? 'Employee Community Forum – UPCOS' : 'कर्मचारी संवाद एवं विचार मंच – UPCOS',
        description: 'उत्तर प्रदेश के 75 जनपदों के आउटसोर्स कर्मचारियों का स्वतंत्र संवाद एवं सहायता मंच।',
        canonicalUrl: getCanonicalUrl('/employee-community'),
        structuredData: {
          '@context': 'https://schema.org',
          ...makeBreadcrumbs('Employee Community', '/employee-community')
        }
      });
    } else if (p === '/about-us') {
      const url = getCanonicalUrl('/about-us');
      updatePageSEO({
        title: isEn ? 'About Us – UPCOS Portal' : 'हमारे बारे में (About Us) – UPCOS',
        description: 'UPCOS का परिचय, उद्देश्य, स्वतंत्र पहचान और उत्तर प्रदेश आउटसोर्सिंग कर्मचारियों के सशक्तिकरण का मिशन।',
        canonicalUrl: url,
        structuredData: {
          '@context': 'https://schema.org',
          '@graph': [
            { '@type': 'AboutPage', name: 'About UPCOS', url, inLanguage: 'hi-IN' },
            makeBreadcrumbs('About Us', '/about-us')
          ]
        }
      });
    } else if (p === '/contact-us') {
      const url = getCanonicalUrl('/contact-us');
      updatePageSEO({
        title: isEn ? 'Contact Us – Editorial Grievance Desk – UPCOS' : 'संपर्क सूत्र एवं संपादकीय डेस्क (Contact Us) – UPCOS',
        description: 'संपादकीय टीम से संपर्क, शिकायत निवारण, सूचना सत्यापन एवं सुझाव प्रेषण प्रपत्र।',
        canonicalUrl: url,
        structuredData: {
          '@context': 'https://schema.org',
          '@graph': [
            { '@type': 'ContactPage', name: 'Contact UPCOS', url, inLanguage: 'hi-IN' },
            makeBreadcrumbs('Contact Us', '/contact-us')
          ]
        }
      });
    } else if (p === '/privacy-policy') {
      updatePageSEO({
        title: isEn ? 'Privacy Policy – Data & Cookie Standards – UPCOS' : 'गोपनीयता नीति (Privacy Policy) – UPCOS',
        description: 'डेटा गोपनीयता, कुकीज, Google AdSense अनुपालन एवं उपयोगकर्ता अधिकारों का संपूर्ण विवरण।',
        canonicalUrl: getCanonicalUrl('/privacy-policy'),
        structuredData: { '@context': 'https://schema.org', ...makeBreadcrumbs('Privacy Policy', '/privacy-policy') }
      });
    } else if (p === '/disclaimer') {
      updatePageSEO({
        title: isEn ? 'Disclaimer & Legal Notice – UPCOS' : 'अस्वीकरण एवं विधिक नीति (Disclaimer) – UPCOS',
        description: 'गैर-सरकारी स्पष्टीकरण, अनधिकृत सूचना निषेध एवं विधिक सूचना अस्वीकरण।',
        canonicalUrl: getCanonicalUrl('/disclaimer'),
        structuredData: { '@context': 'https://schema.org', ...makeBreadcrumbs('Disclaimer', '/disclaimer') }
      });
    } else if (p === '/terms-and-conditions') {
      updatePageSEO({
        title: isEn ? 'Terms & Conditions of Use – UPCOS' : 'नियम एवं शर्तें (Terms & Conditions) – UPCOS',
        description: 'UPCOS वेबसाइट उपयोग की सामान्य शर्तें, बौद्धिक संपदा अधिकार एवं आचरण नियम।',
        canonicalUrl: getCanonicalUrl('/terms-and-conditions'),
        structuredData: { '@context': 'https://schema.org', ...makeBreadcrumbs('Terms & Conditions', '/terms-and-conditions') }
      });
    } else if (p === '/editorial-policy') {
      updatePageSEO({
        title: isEn ? 'Editorial Policy & Standards – UPCOS' : 'संपादकीय नीति (Editorial Policy) – UPCOS',
        description: 'स्वतंत्रता, निष्पक्षता, स्रोत प्रमाणिकता एवं पत्रकारिता सत्यनिष्ठा के मानक।',
        canonicalUrl: getCanonicalUrl('/editorial-policy'),
        structuredData: { '@context': 'https://schema.org', ...makeBreadcrumbs('Editorial Policy', '/editorial-policy') }
      });
    } else if (p === '/fact-checking-policy') {
      updatePageSEO({
        title: isEn ? 'Fact-Checking Policy & Protocols – UPCOS' : 'तथ्य-जांच नीति (Fact-Checking Policy) – UPCOS',
        description: 'शासनादेशों एवं सरकारी परिपत्रों के सत्यापन की कठोर तथ्य-जांच प्रक्रिया।',
        canonicalUrl: getCanonicalUrl('/fact-checking-policy'),
        structuredData: { '@context': 'https://schema.org', ...makeBreadcrumbs('Fact-Checking Policy', '/fact-checking-policy') }
      });
    } else if (p === '/correction-policy') {
      updatePageSEO({
        title: isEn ? 'Corrections & Updates Policy – UPCOS' : 'संशोधन एवं अद्यतन नीति (Corrections Policy) – UPCOS',
        description: 'पारदर्शी त्रुटि सुधार, सुधार समय-सारिणी एवं पाठक फीडबैक तंत्र।',
        canonicalUrl: getCanonicalUrl('/correction-policy'),
        structuredData: { '@context': 'https://schema.org', ...makeBreadcrumbs('Corrections Policy', '/correction-policy') }
      });
    } else if (p === '/copyright-policy') {
      updatePageSEO({
        title: isEn ? 'Copyright Policy & Fair Use – UPCOS' : 'कॉपीराइट नीति (Copyright Policy) – UPCOS',
        description: 'सार्वजनिक शासकीय परिपत्र, उचित उपयोग (Fair Use) एवं कॉपीराइट सुरक्षा दिशानिर्देश।',
        canonicalUrl: getCanonicalUrl('/copyright-policy'),
        structuredData: { '@context': 'https://schema.org', ...makeBreadcrumbs('Copyright Policy', '/copyright-policy') }
      });
    } else if (p === '/advertise') {
      updatePageSEO({
        title: isEn ? 'Advertise With Us – Ethical Ads Policy – UPCOS' : 'विज्ञापन नीति (Advertise With Us) – UPCOS',
        description: 'कर्मचारी हितैषी विज्ञापन दिशानिर्देश एवं Google AdSense अनुपालन नीति।',
        canonicalUrl: getCanonicalUrl('/advertise'),
        structuredData: { '@context': 'https://schema.org', ...makeBreadcrumbs('Advertise', '/advertise') }
      });
    } else if (p === '/sitemap') {
      const url = getCanonicalUrl('/sitemap');
      updatePageSEO({
        title: isEn ? 'Website Sitemap – UPCOS' : 'साइटमैप (Sitemap) – UPCOS',
        description: 'UPCOS पोर्टल के सभी समाचार, शासनादेश, विभाग, भर्ती सूचनाएं एवं नीति पृष्ठों की संपूर्ण सूची।',
        canonicalUrl: url,
        structuredData: {
          '@context': 'https://schema.org',
          '@graph': [
            { '@type': 'CollectionPage', name: 'UPCOS Website Sitemap', url, inLanguage: 'hi-IN' },
            makeBreadcrumbs('Sitemap', '/sitemap')
          ]
        }
      });
    } else if (p === '/admin') {
      updatePageSEO({
        title: 'Admin CMS – UPCOS',
        description: 'संपादकीय प्रबंधन डैशबोर्ड',
        canonicalUrl: getCanonicalUrl('/admin'),
        noindex: true
      });
    }
    };

    let idleSeoId: number | undefined;
    let timerSeoId: number | undefined;
    const win = typeof window !== 'undefined' ? window : undefined;
    if (win && 'requestIdleCallback' in win) {
      idleSeoId = (win as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(applyRouteSeo, { timeout: 800 });
    } else if (win) {
      timerSeoId = win.setTimeout(applyRouteSeo, 50);
    }
    return () => {
      if (idleSeoId && win && 'cancelIdleCallback' in win) {
        (win as Window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleSeoId);
      }
      if (timerSeoId && win) win.clearTimeout(timerSeoId);
    };
  }, [location.pathname, language, faqs, news]);

  const featuredNews = useMemo(
    () => (news || []).find((n) => n.isFeatured) || (news && news[0]),
    [news]
  );

  const isAdEligible = useMemo(() => {
    const p = location.pathname.replace(/\/+$/, '') || '/';
    if (p === '/' || p === '/news' || p === '/shasanadesh' || p === '/departments' || p === '/employee-hub' || p === '/employee-community') {
      return true;
    }
    if (p.startsWith('/news/')) {
      const slug = p.replace('/news/', '');
      return news.some((n) => n.slug === slug || n.id === slug);
    }
    if (p.startsWith('/shasanadesh/')) {
      const slug = p.replace('/shasanadesh/', '');
      return orders.some((o) => o.slug === slug || o.id === slug || o.orderNumber === slug);
    }
    if (p.startsWith('/departments/')) {
      const id = p.replace('/departments/', '');
      return departments.some((d) => d.id === id);
    }
    return false;
  }, [location.pathname, news, orders, departments]);

  return (
    <div className="w-full min-h-screen flex flex-col bg-slate-100/60 font-['Noto_Sans_Devanagari','Plus_Jakarta_Sans',sans-serif] text-slate-900 selection:bg-amber-200 selection:text-slate-900 overflow-x-hidden">
      {/* 1. Urgent Notice / Breaking News Ticker */}
      <BreakingNewsTicker
        items={tickerItems}
        news={news}
        onNavigate={handleNavigate}
      />

      {/* 2. Global Header & Sub-Bar */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenBloggerExport={() => setIsBloggerModalOpen(true)}
        onOpenSewayojanSync={() => setIsSewayojanModalOpen(true)}
        onOpenDigitalId={() => {
          if (currentUser) {
            setIsProfileModalOpen(true);
          } else {
            setIsAuthModalOpen(true);
          }
        }}
        language={language}
        onToggleLanguage={toggleLanguage}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onLogout={() => authService.logout()}
      />

      {/* Google AdSense Top Leaderboard Slot (Only on verified editorial pages when real slot configured) */}
      {isAdEligible && (
        <div className="w-full max-w-7xl mx-auto px-4 pt-3 pb-1">
          <AdPlacement slotType="top-leaderboard" />
        </div>
      )}

      {/* Main Content Area - React Router Switch */}
      <main className="w-full flex-1 overflow-x-hidden">
        <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center text-sm text-slate-500">लोड हो रहा है...</div>}>
        <Routes>
          {/* 1. Home View */}
          <Route
            path="/"
            element={
              <div>
                <div id="statewide-community-hero-wrapper" className="w-full">
                  <StatewideCommunityHero
                    onNavigate={handleNavigate}
                    onOpenDigitalId={() => {
                      if (currentUser) {
                        setIsProfileModalOpen(true);
                      } else {
                        setIsAuthModalOpen(true);
                      }
                    }}
                  />
                </div>

                <HomeHero
                  featuredNews={featuredNews}
                  sidebarNews={(news || []).filter((n) => n.id !== featuredNews?.id)}
                  allNews={news}
                  onNavigate={handleNavigate}
                />

                <div className="w-full max-w-7xl mx-auto px-4 py-4">
                  <AdPlacement slotType="between-sections" />
                </div>

                <DepartmentsSection
                  onNavigate={handleNavigate}
                  departments={departments}
                  showAll={false}
                />

                <EmployeeHubSection
                  onNavigate={handleNavigate}
                  faqs={faqs}
                />

                <SourceReferenceBox />
              </div>
            }
          />

          {/* 2. News Views */}
          <Route
            path="/news"
            element={
              <NewsListRouteWrapper
                news={news}
                onNavigate={handleNavigate}
                onRefresh={refreshData}
              />
            }
          />
          <Route
            path="/news/:slug"
            element={
              <ArticleRouteWrapper
                news={news}
                orders={orders}
                onNavigate={handleNavigate}
              />
            }
          />

          {/* 3. Government Orders (Shasanadesh) */}
          <Route
            path="/shasanadesh"
            element={
              <div className="py-6 bg-slate-50 min-h-screen">
                <GovOrdersSection
                  orders={orders}
                  onNavigate={handleNavigate}
                  showFilters={true}
                />
              </div>
            }
          />
          <Route
            path="/shasanadesh/:slug"
            element={
              <OrderRouteWrapper
                orders={orders}
                onNavigate={handleNavigate}
              />
            }
          />

          {/* 4. Departments */}
          <Route
            path="/departments"
            element={
              <div className="py-6 bg-white min-h-screen">
                <DepartmentsSection
                  onNavigate={handleNavigate}
                  departments={departments}
                  showAll={true}
                />
              </div>
            }
          />
          <Route
            path="/departments/:id"
            element={
              <DepartmentRouteWrapper
                departments={departments}
                news={news}
                orders={orders}
                onNavigate={handleNavigate}
              />
            }
          />

          {/* 5. Employee Hub & Community */}
          <Route
            path="/employee-hub"
            element={
              <div className="py-4 bg-slate-50 min-h-screen">
                <EmployeeHubSection
                  onNavigate={handleNavigate}
                  defaultActiveCategory="वेतन"
                  faqs={faqs}
                />
              </div>
            }
          />
          <Route
            path="/employee-community"
            element={
              <div className="w-full">
                <CommunityFeedPage
                  onNavigate={handleNavigate}
                  currentUser={currentUser}
                  onOpenAuthModal={() => setIsAuthModalOpen(true)}
                />
              </div>
            }
          />

          {/* 6. Full Search */}
          <Route
            path="/search"
            element={
              <SearchRouteWrapper
                news={news}
                orders={orders}
                departments={departments}
                onNavigate={handleNavigate}
              />
            }
          />

          {/* 7. Essential Legal & Information Pages */}
          <Route path="/about-us" element={<StaticPages type="about" onNavigate={handleNavigate} />} />
          <Route path="/contact-us" element={<StaticPages type="contact" onNavigate={handleNavigate} />} />
          <Route path="/privacy-policy" element={<StaticPages type="privacy" onNavigate={handleNavigate} />} />
          <Route path="/disclaimer" element={<StaticPages type="disclaimer" onNavigate={handleNavigate} />} />
          <Route path="/terms-and-conditions" element={<StaticPages type="terms" onNavigate={handleNavigate} />} />
          <Route path="/editorial-policy" element={<StaticPages type="editorial-policy" onNavigate={handleNavigate} />} />
          <Route path="/fact-checking-policy" element={<StaticPages type="fact-checking" onNavigate={handleNavigate} />} />
          <Route path="/correction-policy" element={<StaticPages type="corrections-policy" onNavigate={handleNavigate} />} />
          <Route path="/copyright-policy" element={<StaticPages type="copyright-policy" onNavigate={handleNavigate} />} />
          <Route path="/advertise" element={<StaticPages type="advertise" onNavigate={handleNavigate} />} />
          <Route
            path="/sitemap"
            element={
              <SitemapPage
                news={news}
                orders={orders}
                departments={departments}
                onNavigate={handleNavigate}
              />
            }
          />

          {/* 8. Editorial CMS Admin */}
          <Route
            path="/admin"
            element={
              <AdminCMS
                news={news}
                orders={orders}
                departments={departments}
                tickerItems={tickerItems}
                faqs={faqs}
                onRefresh={refreshData}
                onNavigate={handleNavigate}
                onOpenBloggerExport={() => setIsBloggerModalOpen(true)}
                onOpenSewayojanSync={() => setIsSewayojanModalOpen(true)}
              />
            }
          />

          {/* 9. Catch-all 404 Route */}
          <Route
            path="*"
            element={
              <NotFoundPage 
                onNavigate={handleNavigate} 
                itemType="page" 
                message="यह पृष्ठ उपलब्ध नहीं है। कृपया मुख्य पृष्ठ अथवा ताज़ा समाचारों का अवलोकन करें।" 
              />
            }
          />
        </Routes>
        </Suspense>
      </main>

      {/* Why Join Section */}
      <WhyJoinSection
        onNavigate={handleNavigate}
        onOpenDigitalId={() => {
          if (currentUser) {
            setIsProfileModalOpen(true);
          } else {
            setIsAuthModalOpen(true);
          }
        }}
      />

      {/* Global Footer */}
      <Footer 
        onNavigate={handleNavigate} 
        onOpenBloggerExport={() => setIsBloggerModalOpen(true)}
        onOpenAdminAccess={() => setIsAdminAccessModalOpen(true)}
        currentUser={currentUser}
      />

      {/* Modals */}
      <Suspense fallback={null}>
      <AdminAccessModal
        isOpen={isAdminAccessModalOpen}
        onClose={() => setIsAdminAccessModalOpen(false)}
        onSuccess={(adminUser) => {
          setCurrentUser(adminUser);
        }}
        onNavigate={handleNavigate}
      />

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        news={news}
        orders={orders}
        departments={departments}
        onNavigate={handleNavigate}
      />

      <BloggerThemeExportModal
        isOpen={isBloggerModalOpen}
        onClose={() => setIsBloggerModalOpen(false)}
      />

      <SewayojanSyncModal
        isOpen={isSewayojanModalOpen}
        onClose={() => setIsSewayojanModalOpen(false)}
        onSyncSuccess={refreshData}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
        }}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={currentUser}
        onLogout={() => {
          authService.logout();
        }}
        onNavigate={handleNavigate}
      />
      </Suspense>

      <MobileBottomNav
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenDigitalId={() => {
          if (currentUser) {
            setIsProfileModalOpen(true);
          } else {
            setIsAuthModalOpen(true);
          }
        }}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        currentUser={currentUser}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <MainApp />
      </LanguageProvider>
    </BrowserRouter>
  );
}
