import React, { useState, useEffect } from 'react';
import { Megaphone, X } from 'lucide-react';
import { BREAKING_NEWS_ITEMS } from '../data/mockData';
import { contentStore } from '../data/contentStore';
import { NewsItem, PageView } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface BreakingNewsTickerProps {
  onNavigate: (view: PageView) => void;
  items?: string[];
  news?: NewsItem[];
}

function findMatchingNewsArticle(tickerText: string, newsList: NewsItem[]): NewsItem | null {
  if (!tickerText || !newsList || newsList.length === 0) return null;

  const clean = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const normalizedTicker = clean(tickerText);
  const tokens = normalizedTicker.split(' ').filter((w) => w.length >= 3);

  let bestMatch: NewsItem | null = null;
  let bestScore = 0;

  for (const item of newsList) {
    const titleHaystack = clean(`${item.title} ${item.englishTitle || ''}`);
    const metaHaystack = clean(
      `${item.department} ${item.shortDescription} ${(item.tags || []).join(' ')}`
    );
    let score = 0;
    for (const token of tokens) {
      if (titleHaystack.includes(token)) {
        score += 2;
      } else if (metaHaystack.includes(token)) {
        score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  return bestScore >= 2 ? bestMatch : null;
}

export const BreakingNewsTicker: React.FC<BreakingNewsTickerProps> = ({
  onNavigate,
  items,
  news,
}) => {
  const tickerList =
    items && items.length > 0 ? items : contentStore.getTickerItems() || BREAKING_NEWS_ITEMS;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  let isEnglish = false;
  let t = (k: string, fb?: string) => fb || k;
  try {
    const langCtx = useLanguage();
    isEnglish = langCtx.isEnglish;
    t = langCtx.t;
  } catch {}

  useEffect(() => {
    if (tickerList.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tickerList.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [tickerList.length]);

  if (!isVisible) return null;

  const currentItem = tickerList[currentIndex] || '';

  const handleTickerClick = () => {
    const sourceNews = news && news.length > 0 ? news : contentStore.getNews();
    const matched = findMatchingNewsArticle(currentItem, sourceNews);
    if (matched) {
      onNavigate({ type: 'news-detail', id: matched.id });
    } else {
      onNavigate({ type: 'news-list' });
    }
  };

  return (
    <div
      id="breaking-news-bar"
      className="w-full bg-[#d95300] text-white select-none border-b border-[#c2410c] shadow-2xs"
    >
      <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between py-1.5 sm:py-2 gap-2 text-xs sm:text-sm">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {/* Megaphone Icon */}
          <Megaphone className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white/95 shrink-0" />

          {/* URGENT NOTICE Badge */}
          <span className="bg-[#7c2d12] text-amber-100 font-extrabold text-[10px] sm:text-[11px] px-2 py-0.5 rounded tracking-wide shrink-0 shadow-2xs">
            {t('ticker.urgent', isEnglish ? 'URGENT NOTICE' : 'अति आवश्यक सूचना')}
          </span>

          {/* Headline Display */}
          <button
            type="button"
            className="flex-1 min-w-0 text-left truncate cursor-pointer hover:underline flex items-center gap-1.5"
            onClick={handleTickerClick}
            title={t(
              'ticker.readMore',
              isEnglish ? 'Click to read full details' : 'क्लिक करके पूरी खबर पढ़ें'
            )}
          >
            <span className="font-semibold text-white truncate text-xs sm:text-sm">
              {currentItem
                ? `${isEnglish ? 'Alert: ' : 'सूचना: '}${currentItem}`
                : 'Important: Revised Minimum Wages Notification Released for UP Outsource Workers'}
            </span>
          </button>
        </div>

        {/* Right Dismiss X Button */}
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          className="p-1 rounded hover:bg-black/15 text-white/85 hover:text-white transition cursor-pointer shrink-0"
          title={isEnglish ? 'Dismiss' : 'बंद करें'}
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
