import React, { useState, useEffect } from 'react';
import { Megaphone, ChevronRight, ChevronLeft, Pause, Play, Sparkles } from 'lucide-react';
import { BREAKING_NEWS_ITEMS } from '../data/mockData';
import { PageView } from '../types';

interface BreakingNewsTickerProps {
  onNavigate: (view: PageView) => void;
}

export const BreakingNewsTicker: React.FC<BreakingNewsTickerProps> = ({ onNavigate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BREAKING_NEWS_ITEMS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % BREAKING_NEWS_ITEMS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + BREAKING_NEWS_ITEMS.length) % BREAKING_NEWS_ITEMS.length);
  };

  return (
    <div id="breaking-news-bar" className="bg-slate-900 border-b border-slate-800 text-white select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center py-2 gap-3 text-xs sm:text-sm">
        {/* Badge */}
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold px-2.5 py-1 rounded shadow-sm shrink-0 uppercase tracking-wider text-[11px] sm:text-xs">
          <Megaphone className="w-3.5 h-3.5 animate-pulse" />
          <span>BREAKING</span>
          <span className="hidden md:inline">NEWS</span>
        </div>

        {/* Current headline display */}
        <div 
          className="flex-1 truncate cursor-pointer hover:text-amber-300 transition-colors flex items-center gap-2"
          onClick={() => onNavigate({ type: 'news-list', category: 'ताजा खबर' })}
          title="ताज़ा खबरें देखने के लिए क्लिक करें"
        >
          <Sparkles className="w-3 h-3 text-amber-400 shrink-0 hidden sm:inline" />
          <span className="font-medium text-slate-100 truncate">
            {BREAKING_NEWS_ITEMS[currentIndex]}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 hover:text-white rounded hover:bg-slate-800 transition"
            title={isPlaying ? 'रोकें' : 'चलाएं'}
            aria-label="Pause or play ticker"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handlePrev}
            className="p-1 hover:text-white rounded hover:bg-slate-800 transition"
            title="पिछला समाचार"
            aria-label="Previous news"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-slate-500 font-mono px-1">
            {currentIndex + 1}/{BREAKING_NEWS_ITEMS.length}
          </span>
          <button
            onClick={handleNext}
            className="p-1 hover:text-white rounded hover:bg-slate-800 transition"
            title="अगला समाचार"
            aria-label="Next news"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
