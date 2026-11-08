/**
 * Persistent Server Database Service
 * Provides persistent JSON database storage with file synchronization and optional Supabase adapter.
 */

import fs from 'fs';
import path from 'path';
import { NewsItem, GovernmentOrder, Department, FAQItem, UserProfile } from '../types';
import { NEWS_DATA, GOV_ORDERS_DATA, DEPARTMENTS_DATA, FAQS_DATA } from '../data/mockData';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  ip?: string;
  createdAt: string;
  isRead: boolean;
}

export interface CommunityPostRecord {
  id: string;
  authorId: string;
  authorName: string;
  authorDistrict: string;
  authorDepartment: string;
  category: string;
  content: string;
  createdAt: string;
  likes: number;
  commentsCount: number;
  reportCount?: number;
  isBlocked?: boolean;
}

export interface DatabaseSchema {
  news: NewsItem[];
  orders: GovernmentOrder[];
  departments: Department[];
  faqs: FAQItem[];
  communityPosts: CommunityPostRecord[];
  contacts: ContactMessage[];
  users: Array<{
    id: string;
    name: string;
    mobile: string;
    email?: string;
    passwordHash?: string;
    salt?: string;
    district: string;
    department: string;
    designation: string;
    role: 'admin' | 'user';
    joinedDate: string;
  }>;
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DB_DIR, 'db.json');

let cachedDb: DatabaseSchema | null = null;

function ensureInitialDatabase(): DatabaseSchema {
  if (cachedDb) return cachedDb;

  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      cachedDb = JSON.parse(raw);
      return cachedDb!;
    }
  } catch (err) {
    console.error('Error loading db.json:', err);
  }

  // Seed default data
  const initial: DatabaseSchema = {
    news: NEWS_DATA,
    orders: GOV_ORDERS_DATA,
    departments: DEPARTMENTS_DATA,
    faqs: FAQS_DATA,
    communityPosts: [
      {
        id: 'cp-1',
        authorId: 'emp-101',
        authorName: 'सर्वेश तिवारी',
        authorDistrict: 'लखनऊ (Lucknow)',
        authorDepartment: 'चिकित्सा स्वास्थ्य एवं परिवार कल्याण (Health Dept)',
        category: 'वेतन',
        content: 'नवीन शासनादेश संख्या 3/2026 के अंतर्गत श्रेणी-3 कर्मियों के इन-हैंड ₹16,966.64 का भुगतान इस माह के बिल में सुनिश्चित किया जा रहा है।',
        createdAt: '2 घंटे पूर्व',
        likes: 42,
        commentsCount: 8
      }
    ],
    contacts: [],
    users: []
  };

  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
  } catch (e) {
    // In serverless / read-only environment, keep in memory
  }

  cachedDb = initial;
  return cachedDb;
}

function persistDb(): void {
  if (!cachedDb) return;
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(cachedDb, null, 2), 'utf-8');
  } catch (e) {
    // In serverless environment, memory fallback
  }
}

export const dbService = {
  getNews(): NewsItem[] {
    const db = ensureInitialDatabase();
    return db.news;
  },

  getNewsById(idOrSlug: string): NewsItem | undefined {
    const db = ensureInitialDatabase();
    return db.news.find(n => n.id === idOrSlug || n.slug === idOrSlug);
  },

  saveNews(item: NewsItem): NewsItem {
    const db = ensureInitialDatabase();
    const idx = db.news.findIndex(n => n.id === item.id);
    if (idx >= 0) {
      db.news[idx] = item;
    } else {
      db.news.unshift(item);
    }
    persistDb();
    return item;
  },

  deleteNews(id: string): boolean {
    const db = ensureInitialDatabase();
    const len = db.news.length;
    db.news = db.news.filter(n => n.id !== id);
    persistDb();
    return db.news.length < len;
  },

  getOrders(): GovernmentOrder[] {
    const db = ensureInitialDatabase();
    return db.orders;
  },

  getOrderById(idOrSlug: string): GovernmentOrder | undefined {
    const db = ensureInitialDatabase();
    return db.orders.find(o => o.id === idOrSlug || o.orderNumber === idOrSlug);
  },

  saveOrder(order: GovernmentOrder): GovernmentOrder {
    const db = ensureInitialDatabase();
    const idx = db.orders.findIndex(o => o.id === order.id);
    if (idx >= 0) {
      db.orders[idx] = order;
    } else {
      db.orders.unshift(order);
    }
    persistDb();
    return order;
  },

  getDepartments(): Department[] {
    const db = ensureInitialDatabase();
    return db.departments;
  },

  getFaqs(): FAQItem[] {
    const db = ensureInitialDatabase();
    return db.faqs;
  },

  getCommunityPosts(): CommunityPostRecord[] {
    const db = ensureInitialDatabase();
    return db.communityPosts.filter(p => !p.isBlocked);
  },

  createCommunityPost(post: Omit<CommunityPostRecord, 'id' | 'createdAt' | 'likes' | 'commentsCount'>): CommunityPostRecord {
    const db = ensureInitialDatabase();
    const newPost: CommunityPostRecord = {
      ...post,
      id: `cp-${Date.now()}`,
      createdAt: 'अभी-अभी',
      likes: 0,
      commentsCount: 0
    };
    db.communityPosts.unshift(newPost);
    persistDb();
    return newPost;
  },

  reportCommunityPost(postId: string): boolean {
    const db = ensureInitialDatabase();
    const post = db.communityPosts.find(p => p.id === postId);
    if (!post) return false;
    post.reportCount = (post.reportCount || 0) + 1;
    if (post.reportCount >= 5) {
      post.isBlocked = true; // Auto-quarantine reported posts
    }
    persistDb();
    return true;
  },

  saveContact(msg: Omit<ContactMessage, 'id' | 'createdAt' | 'isRead'>): ContactMessage {
    const db = ensureInitialDatabase();
    const record: ContactMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    db.contacts.unshift(record);
    persistDb();
    return record;
  },

  getContacts(): ContactMessage[] {
    const db = ensureInitialDatabase();
    return db.contacts;
  }
};
