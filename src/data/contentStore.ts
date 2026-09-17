import { useState, useEffect } from 'react';
import { NewsItem, GovernmentOrder, Department, FAQItem } from '../types';
import { NEWS_DATA, GOV_ORDERS_DATA, DEPARTMENTS_DATA, BREAKING_NEWS_ITEMS, FAQS_DATA } from './mockData';

const NEWS_STORAGE_KEY = 'uposn_news_data_v2';
const GOV_ORDERS_STORAGE_KEY = 'uposn_gov_orders_v1';
const DEPARTMENTS_STORAGE_KEY = 'uposn_departments_v1';
const TICKER_STORAGE_KEY = 'uposn_ticker_v1';
const FAQS_STORAGE_KEY = 'uposn_faqs_v1';

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

export function getStoredDepartments(): Department[] {
  try {
    const raw = localStorage.getItem(DEPARTMENTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading stored departments', e);
  }
  return DEPARTMENTS_DATA;
}

export function saveStoredDepartments(departments: Department[]) {
  try {
    localStorage.setItem(DEPARTMENTS_STORAGE_KEY, JSON.stringify(departments));
  } catch (e) {
    console.error('Error saving departments', e);
  }
}

export function getStoredTicker(): string[] {
  try {
    const raw = localStorage.getItem(TICKER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading stored ticker', e);
  }
  return BREAKING_NEWS_ITEMS;
}

export function saveStoredTicker(items: string[]) {
  try {
    localStorage.setItem(TICKER_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving ticker', e);
  }
}

export function getStoredFaqs(): FAQItem[] {
  try {
    const raw = localStorage.getItem(FAQS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading stored FAQs', e);
  }
  return FAQS_DATA;
}

export function saveStoredFaqs(faqs: FAQItem[]) {
  try {
    localStorage.setItem(FAQS_STORAGE_KEY, JSON.stringify(faqs));
  } catch (e) {
    console.error('Error saving FAQs', e);
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
  updateNews: (id: string, updatedFields: Partial<NewsItem>) => {
    const current = getStoredNews();
    const updated = current.map((item) =>
      item.id === id ? { ...item, ...updatedFields } : item
    );
    saveStoredNews(updated);
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
  updateOrder: (id: string, updatedFields: Partial<GovernmentOrder>) => {
    const current = getStoredGovOrders();
    const updated = current.map((item) =>
      item.id === id ? { ...item, ...updatedFields } : item
    );
    saveStoredGovOrders(updated);
  },
  deleteOrder: (id: string) => {
    const current = getStoredGovOrders();
    saveStoredGovOrders(current.filter((item) => item.id !== id));
  },

  // Department Management
  getDepartments: (): Department[] => getStoredDepartments(),
  saveDepartments: (departments: Department[]) => saveStoredDepartments(departments),
  addDepartment: (dept: Department) => {
    const current = getStoredDepartments();
    saveStoredDepartments([...current, dept]);
  },
  updateDepartment: (id: string, fields: Partial<Department>) => {
    const current = getStoredDepartments();
    const updated = current.map((d) => (d.id === id ? { ...d, ...fields } : d));
    saveStoredDepartments(updated);
  },
  deleteDepartment: (id: string) => {
    const current = getStoredDepartments();
    saveStoredDepartments(current.filter((d) => d.id !== id));
  },

  // Breaking Ticker Management
  getTickerItems: (): string[] => getStoredTicker(),
  saveTickerItems: (items: string[]) => saveStoredTicker(items),
  addTickerItem: (item: string) => {
    const current = getStoredTicker();
    saveStoredTicker([item, ...current]);
  },
  updateTickerItem: (index: number, newItem: string) => {
    const current = getStoredTicker();
    const updated = [...current];
    if (index >= 0 && index < updated.length) {
      updated[index] = newItem;
      saveStoredTicker(updated);
    }
  },
  deleteTickerItem: (index: number) => {
    const current = getStoredTicker();
    saveStoredTicker(current.filter((_, i) => i !== index));
  },

  // FAQs Management
  getFaqs: (): FAQItem[] => getStoredFaqs(),
  saveFaqs: (faqs: FAQItem[]) => saveStoredFaqs(faqs),
  addFaq: (faq: FAQItem) => {
    const current = getStoredFaqs();
    saveStoredFaqs([...current, faq]);
  },
  updateFaq: (index: number, faq: FAQItem) => {
    const current = getStoredFaqs();
    const updated = [...current];
    if (index >= 0 && index < updated.length) {
      updated[index] = faq;
      saveStoredFaqs(updated);
    }
  },
  deleteFaq: (index: number) => {
    const current = getStoredFaqs();
    saveStoredFaqs(current.filter((_, i) => i !== index));
  },

  getBreakingTickerNews: (): string[] => {
    const news = getStoredNews();
    return (news || []).slice(0, 6).map((n) => n.title);
  },
  getFeaturedNews: (): NewsItem | undefined => {
    const news = getStoredNews();
    return (news || []).find((n) => n.isFeatured) || (news && news[0]);
  },

  // Full Portal Backup & Restore
  exportFullBackup: (): string => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      news: getStoredNews(),
      orders: getStoredGovOrders(),
      departments: getStoredDepartments(),
      ticker: getStoredTicker(),
      faqs: getStoredFaqs(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importFullBackup: (jsonStr: string): { success: boolean; message: string } => {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data.news)) saveStoredNews(data.news);
      if (Array.isArray(data.orders)) saveStoredGovOrders(data.orders);
      if (Array.isArray(data.departments)) saveStoredDepartments(data.departments);
      if (Array.isArray(data.ticker)) saveStoredTicker(data.ticker);
      if (Array.isArray(data.faqs)) saveStoredFaqs(data.faqs);
      return { success: true, message: 'डेटा सफलतापूर्वक बैकअप से रीस्टोर हो गया है!' };
    } catch (err) {
      return { success: false, message: 'अमान्य बैकअप फ़ाइल (Invalid JSON): ' + String(err) };
    }
  },

  resetToDefaults: () => {
    saveStoredNews(NEWS_DATA);
    saveStoredGovOrders(GOV_ORDERS_DATA);
    saveStoredDepartments(DEPARTMENTS_DATA);
    saveStoredTicker(BREAKING_NEWS_ITEMS);
    saveStoredFaqs(FAQS_DATA);
  },

  purgeUnauthorizedContent: () => {
    localStorage.removeItem(NEWS_STORAGE_KEY);
    localStorage.removeItem(GOV_ORDERS_STORAGE_KEY);
    localStorage.removeItem(DEPARTMENTS_STORAGE_KEY);
    localStorage.removeItem(TICKER_STORAGE_KEY);
    localStorage.removeItem(FAQS_STORAGE_KEY);
    saveStoredNews(NEWS_DATA);
    saveStoredGovOrders(GOV_ORDERS_DATA);
    saveStoredDepartments(DEPARTMENTS_DATA);
    saveStoredTicker(BREAKING_NEWS_ITEMS);
    saveStoredFaqs(FAQS_DATA);
  },
};

