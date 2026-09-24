import React from 'react';
import { Home, MapPin, Plus, CreditCard, User } from 'lucide-react';
import { PageView, UserProfile } from '../types';

interface MobileBottomNavProps {
  currentView: PageView;
  onNavigate: (view: PageView) => void;
  onOpenDigitalId: () => void;
  onOpenProfileModal: () => void;
  onOpenAuthModal: () => void;
  currentUser?: UserProfile | null;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onNavigate,
  onOpenDigitalId,
  onOpenProfileModal,
  onOpenAuthModal,
  currentUser
}) => {
  const isFeedActive = currentView.type === 'home' || currentView.type === 'talk-corner';
  const isDistrictsActive = currentView.type === 'departments' || currentView.type === 'department-detail';

  return (
    <nav 
      id="mobile-bottom-nav" 
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-3 py-1.5"
    >
      <div className="max-w-md mx-auto flex items-center justify-between relative">
        {/* 1. Feed */}
        <button
          onClick={() => {
            onNavigate({ type: 'home' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex flex-col items-center justify-center min-w-[56px] py-0.5 cursor-pointer active:scale-95 transition-transform"
        >
          <div className={`px-3 py-1 rounded-xl transition-all ${
            isFeedActive 
              ? 'border border-amber-400/90 bg-amber-50/80 text-[#ea580c] shadow-2xs' 
              : 'text-slate-500 hover:text-slate-800'
          }`}>
            <Home className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className={`text-[11px] font-bold mt-0.5 ${
            isFeedActive ? 'text-[#ea580c]' : 'text-slate-500'
          }`}>
            Feed
          </span>
        </button>

        {/* 2. Districts */}
        <button
          onClick={() => {
            onNavigate({ type: 'departments' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex flex-col items-center justify-center min-w-[56px] py-0.5 cursor-pointer active:scale-95 transition-transform"
        >
          <div className={`p-1 transition-colors ${
            isDistrictsActive ? 'text-[#ea580c]' : 'text-slate-600 hover:text-slate-900'
          }`}>
            <MapPin className="w-5 h-5 stroke-[2]" />
          </div>
          <span className={`text-[11px] font-medium mt-0.5 ${
            isDistrictsActive ? 'text-[#ea580c] font-bold' : 'text-slate-600'
          }`}>
            Districts
          </span>
        </button>

        {/* 3. Post (Elevated Center Action Button) */}
        <div className="flex flex-col items-center -mt-6">
          <button
            onClick={() => {
              onNavigate({ type: 'talk-corner' });
              // Scroll to talk corner post creator
              setTimeout(() => {
                const composer = document.getElementById('post-creator-box') || document.getElementById('community-feed-page');
                if (composer) {
                  composer.scrollIntoView({ behavior: 'smooth' });
                }
              }, 150);
            }}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#ea580c] to-[#f97316] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(234,88,12,0.45)] hover:scale-105 active:scale-95 transition-all ring-4 ring-white cursor-pointer"
            aria-label="Create New Post"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
          <span className="text-[11px] font-bold text-[#ea580c] mt-1">
            Post
          </span>
        </div>

        {/* 4. ID Card */}
        <button
          onClick={onOpenDigitalId}
          className="flex flex-col items-center justify-center min-w-[56px] py-0.5 cursor-pointer active:scale-95 transition-transform"
        >
          <div className="relative p-1 text-slate-600 hover:text-slate-900">
            <CreditCard className="w-5 h-5 stroke-[2]" />
            <span className="absolute -top-1 -right-2 bg-[#ea580c] text-white font-extrabold text-[8px] px-1 py-0.2 rounded leading-none shadow-2xs">
              ID
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-600 mt-0.5">
            ID Card
          </span>
        </button>

        {/* 5. Profile / Login */}
        <button
          onClick={() => {
            if (currentUser) {
              onOpenProfileModal();
            } else {
              onOpenAuthModal();
            }
          }}
          className="flex flex-col items-center justify-center min-w-[56px] py-0.5 cursor-pointer active:scale-95 transition-transform"
        >
          {currentUser ? (
            <div className="relative p-0.5">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover border border-amber-400"
              />
              {currentUser.unreadCount && currentUser.unreadCount > 0 ? (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center shadow-xs">
                  {currentUser.unreadCount}
                </span>
              ) : null}
            </div>
          ) : (
            <div className="p-1 text-slate-600 hover:text-slate-900">
              <User className="w-5 h-5 stroke-[2]" />
            </div>
          )}
          <span className="text-[11px] font-medium text-slate-600 mt-0.5">
            {currentUser ? 'Profile' : 'Login'}
          </span>
        </button>
      </div>
    </nav>
  );
};
