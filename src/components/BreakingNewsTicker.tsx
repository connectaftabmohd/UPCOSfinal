import React, { useState, useEffect } from 'react';
import { Megaphone, X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { BREAKING_NEWS_ITEMS } from '../data/mockData';
import { contentStore } from '../data/contentStore';
import { PageView } from '../types';

interface BreakingNewsTickerProps {
  onNavigate: (view: PageView) => void;
  items?: string[];
}

export const BreakingNewsTicker: React.FC<BreakingNewsTickerProps> = ({ onNavigate, items }) => {
  const tickerList = items && items.length > 0 ? items : contentStore.getTickerItems() || BREAKING_NEWS_ITEMS;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (tickerList.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tickerList.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [tickerList.length]);

  if (!isVisible) return null;

  return (
    <div 
      id="breaking-news-bar" 
      className="w-full bg-[#d95300] text-white select-none border-b border-[#c2410c] shadow-2xs"
    >
      <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between py-1.5 sm:py-2 gap-2 text-xs sm:text-sm">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {/* Megaphone Icon matching image.png */}
          <Megaphone className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white/95 shrink-0" />

          {/* URGENT NOTICE Badge matching image.png */}
          <span className="bg-[#7c2d12] text-amber-100 font-extrabold text-[10px] sm:text-[11px] px-2 py-0.5 rounded tracking-wide shrink-0 shadow-2xs">
            URGENT NOTICE
          </span>

          {/* Headline Display */}
          <div 
            className="flex-1 truncate cursor-pointer hover:underline flex items-center gap-1.5"
            onClick={() => onNavigate({ type: 'news-list', category: 'ताजा खबर' })}
            title="क्लिक करके पूरा आदेश पढ़ें"
          >
            <span className="font-semibold text-white truncate text-xs sm:text-sm">
              {tickerList[currentIndex] ? `Important: ${tickerList[currentIndex]}` : 'Important: Revised Minimum Wages Notification Released for UP Outsource Workers'}
            </span>
          </div>
        </div>

        {/* Right Dismiss X Button matching image.png */}
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 rounded hover:bg-black/15 text-white/85 hover:text-white transition cursor-pointer shrink-0"
          title="बंद करें"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
