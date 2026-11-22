import React from 'react';
import {
  ArrowLeft,
  Newspaper,
  FileText,
  Building2,
  ShieldCheck,
  Compass,
  ExternalLink,
  Calendar,
  Map
} from 'lucide-react';
import { NewsItem, GovernmentOrder, Department, PageView } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface SitemapPageProps {
  news: NewsItem[];
  orders: GovernmentOrder[];
  departments: Department[];
  onNavigate: (view: PageView) => void;
}

export const SitemapPage: React.FC<SitemapPageProps> = ({
  news,
  orders,
  departments,
  onNavigate
}) => {
  let isEnglish = false;
  try {
    const langCtx = useLanguage();
    isEnglish = langCtx.isEnglish;
  } catch {}

  const hubLinks: { label: string; path: string; view: PageView }[] = [
    { label: isEnglish ? 'Home Page' : 'मुख्य पृष्ठ (Home)', path: '/', view: { type: 'home' } },
    { label: isEnglish ? 'Latest News & Recruitment' : 'ताज़ा समाचार एवं भर्ती अपडेट (News)', path: '/news', view: { type: 'news-list' } },
    { label: isEnglish ? 'Government Orders (Shasanadesh)' : 'शासनादेश एवं परिपत्र (Shasanadesh)', path: '/shasanadesh', view: { type: 'gov-orders' } },
    { label: isEnglish ? 'Departments Directory' : 'विभागवार सूचना केंद्र (Departments)', path: '/departments', view: { type: 'departments' } },
    { label: isEnglish ? 'Employee Hub & Salary Calculator' : 'कर्मचारी हब एवं वेतन कैलकुलेटर (Employee Hub)', path: '/employee-hub', view: { type: 'employee-hub' } },
    { label: isEnglish ? 'Employee Community Forum' : 'कर्मचारी संवाद मंच (Community Forum)', path: '/employee-community', view: { type: 'talk-corner' } }
  ];

  const policyLinks: { label: string; path: string; view: PageView }[] = [
    { label: isEnglish ? 'About Us' : 'हमारे बारे में (About Us)', path: '/about-us', view: { type: 'about' } },
    { label: isEnglish ? 'Contact Us' : 'संपर्क सूत्र (Contact Us)', path: '/contact-us', view: { type: 'contact' } },
    { label: isEnglish ? 'Privacy Policy' : 'गोपनीयता नीति (Privacy Policy)', path: '/privacy-policy', view: { type: 'privacy' } },
    { label: isEnglish ? 'Disclaimer' : 'अस्वीकरण (Disclaimer)', path: '/disclaimer', view: { type: 'disclaimer' } },
    { label: isEnglish ? 'Terms & Conditions' : 'नियम एवं शर्तें (Terms & Conditions)', path: '/terms-and-conditions', view: { type: 'terms' } },
    { label: isEnglish ? 'Editorial Policy' : 'संपादकीय नीति (Editorial Policy)', path: '/editorial-policy', view: { type: 'editorial-policy' } },
    { label: isEnglish ? 'Fact-Checking Policy' : 'तथ्य-जांच नीति (Fact-Checking Policy)', path: '/fact-checking-policy', view: { type: 'fact-checking' } },
    { label: isEnglish ? 'Corrections Policy' : 'संशोधन नीति (Corrections Policy)', path: '/correction-policy', view: { type: 'corrections-policy' } },
    { label: isEnglish ? 'Copyright Policy' : 'कॉपीराइट नीति (Copyright Policy)', path: '/copyright-policy', view: { type: 'copyright-policy' } },
    { label: isEnglish ? 'Advertise With Us' : 'विज्ञापन नीति (Advertise With Us)', path: '/advertise', view: { type: 'advertise' } }
  ];

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 space-y-6">
        <button
          onClick={() => onNavigate({ type: 'home' })}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 hover:text-blue-950 px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-2xs transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isEnglish ? 'Back to Home' : 'मुख्य पृष्ठ (Home) पर वापस जाएं'}</span>
        </button>

        {/* Header Card */}
        <header className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-950 text-amber-400 flex items-center justify-center shrink-0">
                <Map className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {isEnglish ? 'UPCOS Website Sitemap' : 'UPCOS वेबसाइट साइटमैप (Sitemap)'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  {isEnglish
                    ? 'Complete index of all news articles, recruitment notifications, government orders, departments, and policy pages.'
                    : 'सभी ताज़ा समाचार, सेवायोजन भर्ती सूचनाएं, शासनादेश, विभाग और नीति पृष्ठों की संपूर्ण सूची।'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
              >
                <span>XML Sitemap</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href="/news-sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 text-xs font-semibold hover:bg-blue-100 transition"
              >
                <span>Google News Sitemap</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </header>

        {/* Grid: Primary Hubs + Legal Pages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900 pb-3 mb-4 border-b border-slate-100">
              <Compass className="w-5 h-5 text-blue-900" />
              <span>{isEnglish ? 'Primary Portal Sections' : 'मुख्य पोर्टल अनुभाग (Hubs)'}</span>
            </h2>
            <ul className="space-y-2.5 text-sm">
              {hubLinks.map((item) => (
                <li key={item.path}>
                  <a
                    href={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(item.view);
                    }}
                    className="text-blue-900 hover:text-red-700 hover:underline font-medium flex items-center justify-between gap-2"
                  >
                    <span>{item.label}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{item.path}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900 pb-3 mb-4 border-b border-slate-100">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <span>{isEnglish ? 'Information & Compliance Pages' : 'नीति, नियम एवं संपर्क पृष्ठ'}</span>
            </h2>
            <ul className="space-y-2.5 text-sm">
              {policyLinks.map((item) => (
                <li key={item.path}>
                  <a
                    href={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(item.view);
                    }}
                    className="text-blue-900 hover:text-red-700 hover:underline font-medium flex items-center justify-between gap-2"
                  >
                    <span>{item.label}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{item.path}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Latest News & Recruitment Articles */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900 pb-3 mb-4 border-b border-slate-100">
            <Newspaper className="w-5 h-5 text-red-700" />
            <span>
              {isEnglish
                ? `News & Recruitment Articles (${news.length})`
                : `ताज़ा समाचार एवं भर्ती लेख (${news.length})`}
            </span>
          </h2>
          <ul className="divide-y divide-slate-100 text-sm">
            {news.map((article) => (
              <li key={article.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                <a
                  href={`/news/${article.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate({ type: 'news-detail', id: article.slug || article.id });
                  }}
                  className="text-slate-800 hover:text-blue-900 hover:underline font-semibold leading-snug"
                >
                  {article.title}
                </a>
                <span className="inline-flex items-center gap-1 text-xs text-slate-500 shrink-0">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{article.publicationDate}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Government Orders + Departments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900 pb-3 mb-4 border-b border-slate-100">
              <FileText className="w-5 h-5 text-amber-600" />
              <span>
                {isEnglish
                  ? `Government Orders (${orders.length})`
                  : `प्रमुख शासनादेश व परिपत्र (${orders.length})`}
              </span>
            </h2>
            <ul className="space-y-3 text-sm">
              {orders.map((order) => (
                <li key={order.id} className="border-b border-slate-100 pb-2.5 last:border-b-0 last:pb-0">
                  <a
                    href={`/shasanadesh/${order.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate({ type: 'gov-order-detail', id: order.slug || order.id });
                    }}
                    className="text-slate-800 hover:text-blue-900 hover:underline font-semibold block leading-snug"
                  >
                    {order.orderNumber}: {order.title}
                  </a>
                  <span className="text-xs text-slate-500">{order.date}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900 pb-3 mb-4 border-b border-slate-100">
              <Building2 className="w-5 h-5 text-indigo-700" />
              <span>
                {isEnglish
                  ? `Government Departments (${departments.length})`
                  : `विभागवार सूचना केंद्र (${departments.length})`}
              </span>
            </h2>
            <ul className="space-y-2.5 text-sm">
              {departments.map((dept) => (
                <li key={dept.id}>
                  <a
                    href={`/departments/${dept.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate({ type: 'department-detail', id: dept.id });
                    }}
                    className="text-blue-900 hover:text-red-700 hover:underline font-semibold block"
                  >
                    {dept.name} ({dept.englishName})
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};
