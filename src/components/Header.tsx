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
  ShieldCheck,
  User,
  LogOut,
  ChevronDown,
  UserCheck,
  Bookmark,
  Bell
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { PageView, UserProfile } from '../types';
import { authService } from '../services/authService';

interface HeaderProps {
  currentView: PageView;
  onNavigate: (view: PageView) => void;
  onOpenSearch?: () => void;
  onOpenBloggerExport?: () => void;
  onOpenSewayojanSync?: () => void;
  onOpenDigitalId?: () => void;
  lang?: 'hi' | 'en';
  language?: 'HI' | 'EN';
  onToggleLang?: () => void;
  onToggleLanguage?: () => void;
  currentUser?: UserProfile | null;
  onOpenAuthModal?: () => void;
  onOpenProfileModal?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenSearch,
  onOpenBloggerExport,
  onOpenSewayojanSync,
  onOpenDigitalId,
  lang = 'hi',
  language,
  onToggleLang,
  onToggleLanguage,
  currentUser,
  onOpenAuthModal,
  onOpenProfileModal,
  onLogout
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const currentLang = language ? (language.toLowerCase() as 'hi' | 'en') : lang;
  const handleToggle = onToggleLanguage || onToggleLang;
  const isAdmin = authService.isAdminUser(currentUser);

  const navLinks = [
    { label: currentLang === 'hi' ? 'होम' : 'Home', view: { type: 'home' } as PageView, icon: Home },
    { label: currentLang === 'hi' ? 'ताज़ा खबरें' : 'Latest News', view: { type: 'news-list' } as PageView, icon: Newspaper },
    { label: currentLang === 'hi' ? 'विभाग' : 'Departments', view: { type: 'departments' } as PageView, icon: Building },
    { label: currentLang === 'hi' ? 'कर्मचारी केंद्र' : 'Employee Hub', view: { type: 'employee-hub' } as PageView, icon: HelpCircle },
    { label: currentLang === 'hi' ? 'कम्युनिटी फोरम' : 'Community Forum', view: { type: 'talk-corner' } as PageView, icon: MessageSquareQuote },
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all w-full">
      {/* Main Navigation Bar */}
      <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-4">
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

        {/* Desktop Right Action Icons: Lang Switcher, Admin Portal, User Login/Profile */}
        <div className="hidden lg:flex items-center gap-2">
          {/* User Account Login / Profile */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-300/80 transition cursor-pointer text-left shadow-2xs"
                title="कर्मचारी प्रोफाइल"
              >
                <div className="relative">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-amber-500"
                  />
                  {currentUser.isVerified && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[7px] font-bold">
                      ✓
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[110px]">
                    {currentUser.name.split(' ')[0]}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium leading-none truncate max-w-[110px]">
                    {currentUser.district.split(' ')[0]}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in duration-100"
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/50">
                    <p className="font-bold text-slate-900 truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.designation}</p>
                    <p className="text-[10px] text-amber-700 font-semibold truncate mt-0.5">{currentUser.department.split('(')[0]}</p>
                  </div>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      if (onOpenProfileModal) onOpenProfileModal();
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-4 h-4 text-blue-600" />
                    <span>मेरी प्रोफाइल व आईडी</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      handleNavClick({ type: 'talk-corner' });
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <MessageSquareQuote className="w-4 h-4 text-amber-600" />
                    <span>कम्युनिटी फोरम चर्चाएं</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      if (onOpenProfileModal) onOpenProfileModal();
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <Bookmark className="w-4 h-4 text-emerald-600" />
                    <span>सहेजी गई सामग्री</span>
                  </button>

                  <div className="border-t border-slate-100 my-1" />

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      if (onLogout) onLogout();
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-rose-50 text-rose-600 font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>लॉगआउट करें</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-500 text-slate-950 font-bold text-xs transition border border-amber-600/30 cursor-pointer shadow-2xs select-none"
              title="कर्मचारी लॉगिन / पंजीकरण"
            >
              <User className="w-3.5 h-3.5 text-slate-950" />
              <span>लॉगिन</span>
            </button>
          )}

          {/* Admin Portal Quick Link - Rendered ONLY for admin/me */}
          {isAdmin && (
            <button
              onClick={() => handleNavClick({ type: 'admin' })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition border cursor-pointer shadow-xs select-none ${
                isActive({ type: 'admin' })
                  ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md ring-2 ring-amber-400/40'
                  : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-amber-500/40 hover:border-amber-400'
              }`}
              title="प्रशासनिक पोर्टल (Backend Admin Portal) - केवल व्यवस्थापक (Admin/Me)"
              aria-label="Admin Portal"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>एडमिन पोर्टल</span>
              <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1 py-0.5 rounded font-mono font-bold leading-none uppercase">
                Admin
              </span>
            </button>
          )}

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
        </div>

        {/* Mobile Hamburger Button on the far right of Top Row (matching image.png) */}
        <div className="lg:hidden flex items-center shrink-0">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-800 hover:text-slate-950 hover:bg-slate-100 transition cursor-pointer active:scale-95"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-slate-900" />
            ) : (
              <Menu className="w-6 h-6 text-slate-800 stroke-[2.2]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile-Only Utility Bar Directly Below Header Bar (matching image.png) */}
      <div 
        id="mobile-header-actions-bar" 
        className="lg:hidden w-full border-t border-slate-200/90 bg-[#fafafa] px-3 sm:px-4 py-1.5 flex items-center justify-between gap-2 shadow-2xs"
      >
        {/* Left: Segmented Hindi / English Language Switcher */}
        <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg border border-slate-300/80 text-xs select-none">
          <button
            onClick={() => {
              if (currentLang !== 'hi') {
                if (onToggleLanguage) onToggleLanguage();
                else if (onToggleLang) onToggleLang();
              }
            }}
            className={`px-2.5 sm:px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
              currentLang === 'hi'
                ? 'bg-[#ea580c] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            हिन्दी
          </button>
          <button
            onClick={() => {
              if (currentLang !== 'en') {
                if (onToggleLanguage) onToggleLanguage();
                else if (onToggleLang) onToggleLang();
              }
            }}
            className={`px-2.5 sm:px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
              currentLang === 'en'
                ? 'bg-[#ea580c] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            English
          </button>
        </div>

        {/* Right: Bell with badge 2, ID Card button, User Profile Avatar with green check */}
        <div className="flex items-center gap-2">
          {/* Notification Bell with red badge 2 */}
          <button
            onClick={() => handleNavClick({ type: 'news-list', category: 'ताजा खबर' })}
            className="relative p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
            title="सूचनाएं / Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-slate-700" />
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-extrabold rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
              2
            </span>
          </button>

          {/* ID Card button */}
          <button
            onClick={onOpenDigitalId || onOpenProfileModal || onOpenAuthModal}
            className="px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-50/80 hover:bg-amber-100 text-amber-900 font-bold text-xs transition cursor-pointer shadow-2xs active:scale-95 select-none"
            title="डिजिटल आईडी कार्ड"
          >
            ID Card
          </button>

          {/* User Profile Avatar with green check (or Login icon when logged out) */}
          {currentUser ? (
            <div
              onClick={() => {
                if (onOpenProfileModal) onOpenProfileModal();
              }}
              className="relative cursor-pointer select-none active:scale-95"
              title={currentUser.name}
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-amber-500 shadow-2xs"
              />
              {currentUser.isVerified && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[7px] font-bold ring-1 ring-white">
                  ✓
                </span>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                if (onOpenAuthModal) onOpenAuthModal();
              }}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs active:scale-95 flex items-center justify-center"
              title="कर्मचारी लॉगिन"
              aria-label="Login"
            >
              <User className="w-4 h-4 text-slate-700" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="p-4 space-y-1.5">
            {/* Mobile User Profile Header */}
            {currentUser ? (
              <div 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onOpenProfileModal) onOpenProfileModal();
                }}
                className="mb-3 p-3 rounded-2xl bg-gradient-to-r from-blue-950 to-indigo-900 text-white flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-amber-400"
                    />
                    {currentUser.isVerified && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[8px] font-bold">
                        ✓
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs">{currentUser.name}</h4>
                    <p className="text-[10px] text-blue-200 truncate">{currentUser.designation}</p>
                    <p className="text-[10px] text-amber-300 font-semibold">{currentUser.district}</p>
                  </div>
                </div>
                <span className="text-xs text-amber-400 font-bold">प्रोफाइल →</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onOpenAuthModal) onOpenAuthModal();
                }}
                className="w-full mb-3 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <User className="w-4 h-4" />
                <span>कर्मचारी लॉगिन / नया पंजीकरण</span>
              </button>
            )}

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
              {isAdmin ? (
                <button
                  onClick={() => handleNavClick({ type: 'admin' })}
                  className="flex items-center gap-1.5 text-amber-700 hover:text-amber-800 font-bold bg-amber-50 hover:bg-amber-100 px-2.5 py-1.5 rounded-lg border border-amber-200 transition cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>एडमिन सीएमएस (व्यवस्थापक)</span>
                </button>
              ) : (
                <span className="text-slate-400 text-[11px]">उत्तर प्रदेश आउटसोर्स संविदा मंच</span>
              )}
              <span className="text-[11px] text-slate-400">v1.0 • UPOSN</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
