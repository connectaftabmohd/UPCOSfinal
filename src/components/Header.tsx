import React, { useState } from 'react';
import { 
  Search, 
  Menu, 
  X, 
  Globe, 
  Settings, 
  FileText, 
  Building, 
  HelpCircle, 
  Newspaper, 
  Home, 
  ShieldCheck, 
  Info,
  Layers,
  MessageSquareQuote
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { PageView } from '../types';

interface HeaderProps {
  currentView: PageView;
  onNavigate: (view: PageView) => void;
  onOpenSearch: () => void;
  lang: 'hi' | 'en';
  onToggleLang: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenSearch,
  lang,
  onToggleLang,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: lang === 'hi' ? 'होम' : 'Home', view: { type: 'home' } as PageView, icon: Home },
    { label: lang === 'hi' ? 'ताज़ा खबरें' : 'Latest News', view: { type: 'news-list' } as PageView, icon: Newspaper },
    { label: lang === 'hi' ? 'शासनादेश' : 'Gov Orders', view: { type: 'gov-orders' } as PageView, icon: FileText },
    { label: lang === 'hi' ? 'विभाग' : 'Departments', view: { type: 'departments' } as PageView, icon: Building },
    { label: lang === 'hi' ? 'कर्मचारी केंद्र' : 'Employee Hub', view: { type: 'employee-hub' } as PageView, icon: HelpCircle },
    { label: lang === 'hi' ? 'टॉक कॉर्नर' : 'Talk Corner', view: { type: 'talk-corner' } as PageView, icon: MessageSquareQuote },
    { label: lang === 'hi' ? 'हमारे बारे में' : 'About', view: { type: 'about' } as PageView, icon: Info },
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
      {/* Top micro-bar: Non-Gov disclaimer & quick portal badge */}
      <div className="bg-slate-100 text-slate-600 text-[11px] border-b border-slate-200/80 px-3 sm:px-6 py-1">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
              <span>स्वतंत्र सूचना मंच:</span>
            </span>
            <span className="truncate text-slate-500">
              उत्तर प्रदेश शासन के आउटसोर्स कर्मचारियों हेतु समाचार एवं शासनादेश निर्देशिका
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://upcos.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:text-blue-900 font-medium hover:underline hidden sm:inline"
            >
              UPCOS संदर्भ
            </a>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <button
              onClick={() => handleNavClick({ type: 'admin' })}
              className="flex items-center gap-1 text-slate-600 hover:text-blue-700 font-medium cursor-pointer"
              title="संपादक / एडमिन पैनल"
            >
              <Settings className="w-3 h-3" />
              <span className="hidden md:inline">कंटेंट प्रबंधन</span>
            </button>
          </div>
        </div>
      </div>

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

        {/* Right Action Icons: Search & Lang Switcher */}
        <div className="flex items-center gap-2">
          {/* Quick Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-600 text-xs sm:text-sm font-medium border border-slate-200 transition"
            title="खोजें (Search)"
            aria-label="Search"
          >
            <Search className="w-4 h-4 text-slate-500" />
            <span className="hidden md:inline text-slate-500">खोजें...</span>
            <kbd className="hidden md:inline-block text-[10px] bg-white text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs font-mono">
              /
            </kbd>
          </button>

          {/* Hindi / English Switcher */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold transition border border-blue-200"
            title="भाषा बदलें (Switch Language)"
          >
            <Globe className="w-3.5 h-3.5 text-blue-700" />
            <span>{lang === 'hi' ? 'HI / EN' : 'EN / HI'}</span>
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
