/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PageView, NewsItem, GovernmentOrder, Department } from './types';
import { contentStore } from './data/contentStore';
import { DEPARTMENTS_DATA } from './data/mockData';

// Core UI Components
import { Header } from './components/Header';
import { BreakingNewsTicker } from './components/BreakingNewsTicker';
import { HomeHero } from './components/HomeHero';
import { LatestNewsGrid } from './components/LatestNewsGrid';
import { ImportantUpdatesGrid } from './components/ImportantUpdatesGrid';
import { GovOrdersSection } from './components/GovOrdersSection';
import { DepartmentsSection } from './components/DepartmentsSection';
import { EmployeeHubSection } from './components/EmployeeHubSection';
import { GovDevelopments } from './components/GovDevelopments';
import { SourceReferenceBox } from './components/SourceReferenceBox';
import { Footer } from './components/Footer';

// Pages & Modals
import { SearchModal } from './components/SearchModal';
import { ArticleDetailPage } from './components/ArticleDetailPage';
import { GovOrderDetailPage } from './components/GovOrderDetailPage';
import { DepartmentDetailPage } from './components/DepartmentDetailPage';
import { NewsListPage } from './components/NewsListPage';
import { SearchResultsPage } from './components/SearchResultsPage';
import { StaticPages } from './components/StaticPages';
import { AdminCMS } from './components/AdminCMS';
import { TalkCornerPage } from './components/TalkCornerPage';

export default function App() {
  const [currentView, setCurrentView] = useState<PageView>({ type: 'home' });
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [language, setLanguage] = useState<'HI' | 'EN'>('HI');

  // Load data from contentStore (localStorage enabled)
  const [news, setNews] = useState<NewsItem[]>(() => contentStore.getNews());
  const [orders, setOrders] = useState<GovernmentOrder[]>(() => contentStore.getOrders());
  const departments: Department[] = DEPARTMENTS_DATA;

  const refreshData = () => {
    setNews(contentStore.getNews());
    setOrders(contentStore.getOrders());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleNavigate = (view: PageView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const breakingTickers = contentStore.getBreakingTickerNews();
  const featuredNews = contentStore.getFeaturedNews() || news[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/60 font-['Noto_Sans_Devanagari','Plus_Jakarta_Sans',sans-serif] text-slate-900 selection:bg-amber-200 selection:text-slate-900">
      {/* Global Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        language={language}
        onToggleLanguage={() => setLanguage((l) => (l === 'HI' ? 'EN' : 'HI'))}
      />

      {/* Breaking News Ticker (visible on all pages for immediate alerts) */}
      <BreakingNewsTicker
        items={breakingTickers}
        onNavigate={handleNavigate}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* 1. HOME VIEW */}
        {currentView.type === 'home' && (
          <div>
            {/* Hero Section */}
            <HomeHero
              featuredNews={featuredNews}
              sidebarNews={(news || []).filter((n) => n.id !== featuredNews?.id)}
              allNews={news}
              onNavigate={handleNavigate}
            />

            {/* Latest News Grid */}
            <LatestNewsGrid
              news={(news || []).slice(0, 6)}
              onNavigate={handleNavigate}
              title="ताज़ा खबरें"
              showViewAll={true}
            />

            {/* Important Updates Hub (Salary, PF, ESI, Renewal, etc.) */}
            <ImportantUpdatesGrid
              onNavigate={handleNavigate}
            />

            {/* Government Orders Section with Search/Filter */}
            <GovOrdersSection
              orders={orders}
              onNavigate={handleNavigate}
              limit={4}
              showFilters={false}
            />

            {/* Department-wise Information */}
            <DepartmentsSection
              onNavigate={handleNavigate}
              showAll={false}
            />

            {/* Employee Information Hub with Interactive In-Hand Estimator & FAQs */}
            <EmployeeHubSection
              onNavigate={handleNavigate}
            />

            {/* Government Decisions & Initiatives */}
            <GovDevelopments
              onNavigate={handleNavigate}
            />

            {/* Sources & Official Reference Box (UPCOS reference & compliance) */}
            <SourceReferenceBox />
          </div>
        )}

        {/* 2. NEWS LIST VIEW */}
        {currentView.type === 'news-list' && (
          <NewsListPage
            news={news}
            initialCategory={currentView.category}
            initialDepartment={currentView.department}
            onNavigate={handleNavigate}
          />
        )}

        {/* 3. NEWS DETAIL VIEW */}
        {currentView.type === 'news-detail' && (() => {
          const article = news.find((n) => n.id === currentView.id) || news[0];
          return (
            <ArticleDetailPage
              article={article}
              allNews={news}
              govOrders={orders}
              onNavigate={handleNavigate}
            />
          );
        })()}

        {/* 4. GOVERNMENT ORDERS FULL LIST */}
        {currentView.type === 'gov-orders' && (
          <div className="py-6 bg-slate-50 min-h-screen">
            <GovOrdersSection
              orders={orders}
              onNavigate={handleNavigate}
              showFilters={true}
            />
          </div>
        )}

        {/* 5. GOVERNMENT ORDER DETAIL VIEW */}
        {currentView.type === 'gov-order-detail' && (() => {
          const order = orders.find((o) => o.id === currentView.id) || orders[0];
          return (
            <GovOrderDetailPage
              order={order}
              onNavigate={handleNavigate}
            />
          );
        })()}

        {/* 6. DEPARTMENTS LIST VIEW */}
        {currentView.type === 'departments' && (
          <div className="py-6 bg-white min-h-screen">
            <DepartmentsSection
              onNavigate={handleNavigate}
              showAll={true}
            />
          </div>
        )}

        {/* 7. DEPARTMENT DETAIL VIEW */}
        {currentView.type === 'department-detail' && (() => {
          const dept = departments.find((d) => d.id === currentView.id) || departments[0];
          const deptNews = news.filter((n) => n.departmentId === dept.id || n.department.includes(dept.name.substring(0, 4)));
          const deptOrders = orders.filter((o) => o.departmentId === dept.id || o.department.includes(dept.name.substring(0, 4)));

          return (
            <DepartmentDetailPage
              department={dept}
              deptNews={deptNews}
              deptOrders={deptOrders}
              onNavigate={handleNavigate}
            />
          );
        })()}

        {/* 8. TALK CORNER VIEW (Community Forum) */}
        {currentView.type === 'talk-corner' && (
          <TalkCornerPage
            onNavigate={handleNavigate}
            initialCategory={currentView.category}
          />
        )}

        {/* 9. EMPLOYEE INFORMATION HUB VIEW */}
        {currentView.type === 'employee-hub' && (
          <div className="py-4 bg-slate-50 min-h-screen">
            <EmployeeHubSection
              onNavigate={handleNavigate}
              defaultActiveCategory={currentView.tab || 'वेतन'}
            />
          </div>
        )}

        {/* 9. FULL SEARCH RESULTS VIEW */}
        {currentView.type === 'search' && (
          <SearchResultsPage
            initialQuery={currentView.query || ''}
            allNews={news}
            allOrders={orders}
            allDepartments={departments}
            onNavigate={handleNavigate}
          />
        )}

        {/* 10. STATIC PAGES (About, Contact, Privacy, Disclaimer) */}
        {(currentView.type === 'about' ||
          currentView.type === 'contact' ||
          currentView.type === 'privacy' ||
          currentView.type === 'disclaimer') && (
          <StaticPages
            type={currentView.type}
            onNavigate={handleNavigate}
          />
        )}

        {/* 11. EDITORIAL CMS PORTAL */}
        {currentView.type === 'admin' && (
          <AdminCMS
            news={news}
            orders={orders}
            onRefresh={refreshData}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Quick Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        news={news}
        orders={orders}
        departments={departments}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
