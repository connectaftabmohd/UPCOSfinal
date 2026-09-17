import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  Globe, 
  Settings, 
  Building, 
  HelpCircle, 
  Newspaper, 
  Home, 
  MessageSquareQuote,
  ShieldCheck
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { PageView } from '../types';

interface HeaderProps {
  currentView: PageView;
  onNavigate: (view: PageView) => void;
  onOpenSearch?: () => void;
  onOpenBloggerExport?: () => void;
  onOpenSewayojanSync?: () => void;
  lang?: 'hi' | 'en';
  language?: 'HI' | 'EN';
  onToggleLang?: () => void;
  onToggleLanguage?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenSearch,
  onOpenBloggerExport,
  onOpenSewayojanSync,
  lang = 'hi',
  language,
  onToggleLang,
  onToggleLanguage,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const currentLang = language ? (language.toLowerCase() as 'hi' | 'en') : lang;
  const handleToggle = onToggleLanguage || onToggleLang;

  const navLinks = [
    { label: currentLang === 'hi' ? 'होम' : 'Home', view: { type: 'home' } as PageView, icon: Home },
    { label: currentLang === 'hi' ? 'ताज़ा खबरें' : 'Latest News', view: { type: 'news-list' } as PageView, icon: Newspaper },
    { label: currentLang === 'hi' ? 'विभाग' : 'Departments', view: { type: 'departments' } as PageView, icon: Building },
    { label: currentLang === 'hi' ? 'कर्मचारी केंद्र' : 'Employee Hub', view: { type: 'employee-hub' } as PageView, icon: HelpCircle },
    { label: currentLang === 'hi' ? 'टॉक कॉर्नर' : 'Talk Corner', view: { type: 'talk-corner' } as PageView, icon: MessageSquareQuote },
  ];

  const isActive = (view: PageView) => {
    if (view.type === 'home' && currentView.type === 'home') return true;
    if (view.type === 'news-list' && currentView.type === 'news-list') return true;
    if (view.type === 'gov-orders' && (currentView.type === 'gov-orders' || currentView.type === 'gov-order-detail')) return true;
    if (view.type === 'departments' && (currentView.type === 'departments' || currentView.type === 'department-detail')) return true;
    if (view.type === 'employee-hub' && currentView.type === 'employee-hub') return true;
    if (view.type === 'talk-corner' && currentView.type === 'talk-corner') return true;
    if (view.type === 'about' && currentView.type === 'about') return true;
    return false;
  };

  const handleNavClick = (view: PageView) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div 
          onClick={() => handleNavClick({ type: 'home' })}
          className="cursor-pointer group flex items-center shrink-0"
        >
          <BrandLogo size={46} showText={true} />
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((item, idx) => {
            const active = isActive(item.view);
            return (
              <button
                key={idx}
                onClick={() => handleNavClick(item.view)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  active
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-700 hover:text-blue-900 hover:bg-slate-100'
                }`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action Icons: Lang Switcher, Admin Portal & Mobile Menu */}
        <div className="flex items-center gap-2">
          {/* Admin Portal Quick Link */}
          <button
            onClick={() => handleNavClick({ type: 'admin' })}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border cursor-pointer shadow-2xs select-none ${
              isActive({ type: 'admin' })
                ? 'bg-blue-900 text-white border-blue-900'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
            title="प्रशासनिक पोर्टल (Backend Admin Portal)"
            aria-label="Admin Portal"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            <span>एडमिन पोर्टल</span>
          </button>

          {/* Hindi / English Switcher */}
          <button
            onClick={handleToggle}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-900 text-xs font-bold transition border border-blue-200 cursor-pointer shadow-2xs select-none"
            title={currentLang === 'hi' ? 'Switch to English' : 'हिन्दी में बदलें'}
            aria-label="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-blue-700 shrink-0" />
            <span className="font-extrabold tracking-wide">
              {currentLang === 'hi' ? 'HI' : 'EN'}
            </span>
            <span className="text-blue-300 text-[10px]">/</span>
            <span className="text-blue-600/75 font-semibold text-[11px]">
              {currentLang === 'hi' ? 'EN' : 'HI'}
            </span>
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-700 hover:text-blue-900 hover:bg-slate-100 transition"
            aria-label="Open navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="p-4 space-y-1.5">
            {navLinks.map((item, idx) => {
              const active = isActive(item.view);
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleNavClick(item.view)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-sm font-semibold transition ${
                    active
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pt-2">
              <button
                onClick={() => {
                  if (handleToggle) handleToggle();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-sm border border-blue-200 transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-700" />
                  <span>भाषा (Language): {currentLang === 'hi' ? 'हिन्दी (Hindi)' : 'English'}</span>
                </span>
                <span className="text-xs bg-blue-900 text-white px-2 py-0.5 rounded-md font-extrabold">
                  {currentLang === 'hi' ? 'Switch to EN' : 'Switch to HI'}
                </span>
              </button>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 px-1">
              <button
                onClick={() => handleNavClick({ type: 'admin' })}
                className="flex items-center gap-1.5 text-blue-800 font-semibold"
              >
                <Settings className="w-4 h-4" />
                <span>एडमिन सीएमएस (CMS Panel)</span>
              </button>
              <span className="text-[11px] text-slate-400">v1.0 • UPOSN</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
