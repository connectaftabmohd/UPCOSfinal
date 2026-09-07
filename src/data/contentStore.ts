import { useState, useEffect } from 'react';
import { NewsItem, GovernmentOrder } from '../types';
import { NEWS_DATA, GOV_ORDERS_DATA } from './mockData';

const NEWS_STORAGE_KEY = 'uposn_news_data_v2';
const GOV_ORDERS_STORAGE_KEY = 'uposn_gov_orders_v1';

export function getStoredNews(): NewsItem[] {
  try {
    const raw = localStorage.getItem(NEWS_STORAGE_KEY) || localStorage.getItem('uposn_news_data_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Automatically replace any outdated or mismatched photo with the relevant secretariat meeting photo
        const sanitized = parsed.map((item: NewsItem) => {
          if (item.featuredImage && (item.featuredImage.includes('photo-1541872703-74c5e44368f9') || item.id === 'news-1' && item.featuredImage.includes('photo-1541872703'))) {
            return {
              ...item,
              featuredImage: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
            };
          }
          return item;
        });
        localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(sanitized));
        return sanitized;
      }
    }
  } catch (e) {
    console.error('Error reading stored news', e);
  }
  return NEWS_DATA;
}

export function saveStoredNews(news: NewsItem[]) {
  try {
    localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(news));
  } catch (e) {
    console.error('Error saving news', e);
  }
}

export function getStoredGovOrders(): GovernmentOrder[] {
  try {
    const raw = localStorage.getItem(GOV_ORDERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading stored orders', e);
  }
  return GOV_ORDERS_DATA;
}

export function saveStoredGovOrders(orders: GovernmentOrder[]) {
  try {
    localStorage.setItem(GOV_ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('Error saving gov orders', e);
  }
}

export function useContentStore() {
  const [news, setNews] = useState<NewsItem[]>(getStoredNews);
  const [govOrders, setGovOrders] = useState<GovernmentOrder[]>(getStoredGovOrders);
  const [lang, setLang] = useState<'hi' | 'en'>('hi');

  useEffect(() => {
    // Initial check
    const existing = localStorage.getItem(NEWS_STORAGE_KEY);
    if (!existing) {
      saveStoredNews(NEWS_DATA);
    }
    const existingOrders = localStorage.getItem(GOV_ORDERS_STORAGE_KEY);
    if (!existingOrders) {
      saveStoredGovOrders(GOV_ORDERS_DATA);
    }
  }, []);

  const addNews = (item: NewsItem) => {
    const updated = [item, ...news];
    setNews(updated);
    saveStoredNews(updated);
  };

  const updateNews = (id: string, updatedFields: Partial<NewsItem>) => {
    const updated = news.map((item) =>
      item.id === id ? { ...item, ...updatedFields } : item
    );
    setNews(updated);
    saveStoredNews(updated);
  };

  const deleteNews = (id: string) => {
    const updated = news.filter((item) => item.id !== id);
    setNews(updated);
    saveStoredNews(updated);
  };

  const addGovOrder = (order: GovernmentOrder) => {
    const updated = [order, ...govOrders];
    setGovOrders(updated);
    saveStoredGovOrders(updated);
  };

  const deleteGovOrder = (id: string) => {
    const updated = govOrders.filter((order) => order.id !== id);
    setGovOrders(updated);
    saveStoredGovOrders(updated);
  };

  const resetToDefault = () => {
    setNews(NEWS_DATA);
    setGovOrders(GOV_ORDERS_DATA);
    saveStoredNews(NEWS_DATA);
    saveStoredGovOrders(GOV_ORDERS_DATA);
  };

  return {
    news,
    govOrders,
    lang,
    setLang,
    addNews,
    updateNews,
    deleteNews,
    addGovOrder,
    deleteGovOrder,
    resetToDefault,
  };
}

export const contentStore = {
  getNews: (): NewsItem[] => getStoredNews(),
  saveNews: (news: NewsItem[]) => saveStoredNews(news),
  addNews: (item: NewsItem) => {
    const current = getStoredNews();
    saveStoredNews([item, ...current]);
  },
  deleteNews: (id: string) => {
    const current = getStoredNews();
    saveStoredNews(current.filter((item) => item.id !== id));
  },
  getOrders: (): GovernmentOrder[] => getStoredGovOrders(),
  saveOrders: (orders: GovernmentOrder[]) => saveStoredGovOrders(orders),
  addOrder: (order: GovernmentOrder) => {
    const current = getStoredGovOrders();
    saveStoredGovOrders([order, ...current]);
  },
  deleteOrder: (id: string) => {
    const current = getStoredGovOrders();
    saveStoredGovOrders(current.filter((item) => item.id !== id));
  },
  getBreakingTickerNews: (): string[] => {
    const news = getStoredNews();
    return (news || []).slice(0, 6).map((n) => n.title);
  },
  getFeaturedNews: (): NewsItem | undefined => {
    const news = getStoredNews();
    return (news || []).find((n) => n.isFeatured) || (news && news[0]);
  },
  resetToDefaults: () => {
    saveStoredNews(NEWS_DATA);
    saveStoredGovOrders(GOV_ORDERS_DATA);
  },
  purgeUnauthorizedContent: () => {
    // Purges any custom or unverified entries, resetting to authorized clean baseline
    localStorage.removeItem(NEWS_STORAGE_KEY);
    localStorage.removeItem(GOV_ORDERS_STORAGE_KEY);
    saveStoredNews(NEWS_DATA);
    saveStoredGovOrders(GOV_ORDERS_DATA);
  },
};

