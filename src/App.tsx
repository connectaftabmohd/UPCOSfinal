/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PageView, NewsItem, GovernmentOrder, Department, FAQItem } from './types';
import { contentStore } from './data/contentStore';
import { DEPARTMENTS_DATA } from './data/mockData';

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

// Pages & Modals
import { SearchModal } from './components/SearchModal';
import { ArticleDetailPage } from './components/ArticleDetailPage';
import { GovOrderDetailPage } from './components/GovOrderDetailPage';
import { DepartmentDetailPage } from './components/DepartmentDetailPage';
import { NewsListPage } from './components/NewsListPage';
import { SearchResultsPage } from './components/SearchResultsPage';
import { StaticPages } from './components/StaticPages';
import { AdminCMS } from './components/AdminCMS';
import { CommunityFeedPage } from './components/CommunityFeedPage';
import { BloggerThemeExportModal } from './components/BloggerThemeExportModal';
import { SewayojanSyncModal } from './components/SewayojanSyncModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AdminAccessModal } from './components/AdminAccessModal';
import { initializeAutoSyncEngine } from './services/sewayojanSyncService';
import { authService } from './services/authService';
import { UserProfile } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<PageView>({ type: 'home' });
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isBloggerModalOpen, setIsBloggerModalOpen] = useState(false);
  const [isSewayojanModalOpen, setIsSewayojanModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAdminAccessModalOpen, setIsAdminAccessModalOpen] = useState(false);
  const [language, setLanguage] = useState<'HI' | 'EN'>('HI');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => authService.getCurrentUser());

  // Load data from contentStore (localStorage enabled)
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

  const handleNavigate = (view: PageView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    refreshData();

    // Start background auto-sync for Sewayojan jobs (https://sewayojan.up.nic.in/jobs.aspx)
    const cleanup = initializeAutoSyncEngine(() => {
      refreshData();
    });

    // Listen to user authentication changes
    const unsubAuth = authService.subscribe((u) => {
      setCurrentUser(u);
    });

    // Keyboard shortcut for Admin Access: Ctrl+Shift+A or Cmd+Shift+A or Alt+A
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.ctrlKey || e.metaKey;
      if (
        (isCmdOrCtrl && e.shiftKey && (e.key === 'a' || e.key === 'A')) ||
        (e.altKey && (e.key === 'a' || e.key === 'A'))
      ) {
        e.preventDefault();
        if (authService.isAdminUser(currentUser)) {
          handleNavigate({ type: 'admin' });
        } else {
          setIsAdminAccessModalOpen(true);
        }
      }
    };

    // URL Hash listener for #admin or ?admin=true
    const checkAdminHash = () => {
      if (window.location.hash === '#admin' || window.location.search.includes('admin=true')) {
        if (authService.isAdminUser(currentUser)) {
          handleNavigate({ type: 'admin' });
        } else {
          setIsAdminAccessModalOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('hashchange', checkAdminHash);
    checkAdminHash();

    return () => {
      cleanup();
      unsubAuth();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', checkAdminHash);
    };
  }, [currentUser]);

  const breakingTickers = contentStore.getBreakingTickerNews();
  const featuredNews = contentStore.getFeaturedNews() || news[0];

  return (
    <div className="w-full min-h-screen flex flex-col bg-slate-100/60 font-['Noto_Sans_Devanagari','Plus_Jakarta_Sans',sans-serif] text-slate-900 selection:bg-amber-200 selection:text-slate-900 overflow-x-hidden">
      {/* 1. Urgent Notice / Breaking News Ticker (at the very top, matching image.png) */}
      <BreakingNewsTicker
        items={tickerItems}
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
        onToggleLanguage={() => setLanguage((l) => (l === 'HI' ? 'EN' : 'HI'))}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onLogout={() => authService.logout()}
      />

      {/* Main Content Area */}
      <main className="w-full flex-1 overflow-x-hidden pb-16 lg:pb-0">
        {/* 1. HOME VIEW */}
        {currentView.type === 'home' && (
          <div>
            {/* Statewide Community Hero Banner */}
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

            {/* Daily Bulletins & Featured News Section */}
            <HomeHero
              featuredNews={featuredNews}
              sidebarNews={(news || []).filter((n) => n.id !== featuredNews?.id)}
              allNews={news}
              onNavigate={handleNavigate}
            />

            {/* Department-wise Information */}
            <DepartmentsSection
              onNavigate={handleNavigate}
              departments={departments}
              showAll={false}
            />

            {/* Employee Information Hub with Interactive In-Hand Estimator & FAQs */}
            <EmployeeHubSection
              onNavigate={handleNavigate}
              faqs={faqs}
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
            onRefresh={refreshData}
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
              departments={departments}
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

        {/* 8. COMMUNITY FEED / TALK CORNER VIEW */}
        {currentView.type === 'talk-corner' && (
          <div className="w-full">
            <CommunityFeedPage
              onNavigate={handleNavigate}
              initialCategory={currentView.category}
              currentUser={currentUser}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
            />
          </div>
        )}

        {/* 9. EMPLOYEE INFORMATION HUB VIEW */}
        {currentView.type === 'employee-hub' && (
          <div className="py-4 bg-slate-50 min-h-screen">
            <EmployeeHubSection
              onNavigate={handleNavigate}
              defaultActiveCategory={currentView.tab || 'वेतन'}
              faqs={faqs}
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
            departments={departments}
            tickerItems={tickerItems}
            faqs={faqs}
            onRefresh={refreshData}
            onNavigate={handleNavigate}
            onOpenBloggerExport={() => setIsBloggerModalOpen(true)}
            onOpenSewayojanSync={() => setIsSewayojanModalOpen(true)}
          />
        )}
      </main>

      {/* Why Join UP Outsource Seva Nigam Section - Positioned right above Footer */}
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

      {/* Admin Access Modal (alternative secure way to access admin portal) */}
      <AdminAccessModal
        isOpen={isAdminAccessModalOpen}
        onClose={() => setIsAdminAccessModalOpen(false)}
        onSuccess={(adminUser) => {
          setCurrentUser(adminUser);
        }}
        onNavigate={handleNavigate}
      />

      {/* Quick Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        news={news}
        orders={orders}
        departments={departments}
        onNavigate={handleNavigate}
      />

      {/* Blogger.com XML Theme Export Modal */}
      <BloggerThemeExportModal
        isOpen={isBloggerModalOpen}
        onClose={() => setIsBloggerModalOpen(false)}
      />

      {/* Sewayojan Jobs Live Auto-Sync Modal */}
      <SewayojanSyncModal
        isOpen={isSewayojanModalOpen}
        onClose={() => setIsSewayojanModalOpen(false)}
        onSyncSuccess={refreshData}
      />

      {/* Employee Login & Registration Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
        }}
      />

      {/* Employee Profile & Saved Items Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={currentUser}
        onLogout={() => {
          authService.logout();
        }}
        onNavigate={handleNavigate}
      />

      {/* Fixed Mobile Bottom Navigation Bar (Feed, Districts, Post, ID Card, Profile - matching image.png) */}
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
