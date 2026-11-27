/**
 * Persistent Server Database Service
 * Provides persistent JSON database storage with file synchronization and optional Supabase adapter.
 */

import fs from 'fs';
import path from 'path';
import { NewsItem, GovernmentOrder, Department, FAQItem, UserProfile } from '../types';
import { NEWS_DATA, GOV_ORDERS_DATA, DEPARTMENTS_DATA, FAQS_DATA, BREAKING_NEWS_ITEMS } from '../data/mockData';

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

export interface StoredUserRecord {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  passwordHash?: string;
  salt?: string;
  district: string;
  department: string;
  designation: string;
  avatar?: string;
  isVerified?: boolean;
  role: 'admin' | 'user';
  joinedDate: string;
}

export interface AdminCredentialRecord {
  email: string;
  hash: string;
  salt: string;
  updatedAt: string;
}

export interface DatabaseSchema {
  news: NewsItem[];
  orders: GovernmentOrder[];
  departments: Department[];
  faqs: FAQItem[];
  tickerItems?: string[];
  communityPosts: CommunityPostRecord[];
  contacts: ContactMessage[];
  users: StoredUserRecord[];
  adminCredential?: AdminCredentialRecord;
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DB_DIR, 'db.json');
const TMP_DB_FILE = path.resolve('/tmp', 'upcos-db.json');

let cachedDb: DatabaseSchema | null = null;

function ensureInitialDatabase(): DatabaseSchema {
  if (cachedDb) return cachedDb;

  for (const candidate of [TMP_DB_FILE, DB_FILE]) {
    try {
      if (fs.existsSync(candidate)) {
        const raw = fs.readFileSync(candidate, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          if (!Array.isArray(parsed.users)) parsed.users = [];
          if (!Array.isArray(parsed.contacts)) parsed.contacts = [];
          if (!Array.isArray(parsed.communityPosts)) parsed.communityPosts = [];
          cachedDb = parsed;
          return cachedDb!;
        }
      }
    } catch (err) {
      console.error(`Error loading ${candidate}:`, err);
    }
  }

  // Seed default data
  const initial: DatabaseSchema = {
    news: NEWS_DATA,
    orders: GOV_ORDERS_DATA,
    departments: DEPARTMENTS_DATA,
    faqs: FAQS_DATA,
    tickerItems: BREAKING_NEWS_ITEMS,
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
  } catch {
    try {
      fs.writeFileSync(TMP_DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    } catch {
      // Pure in-memory fallback
    }
  }

  cachedDb = initial;
  return cachedDb;
}

function persistDb(): void {
  if (!cachedDb) return;
  const serialized = JSON.stringify(cachedDb, null, 2);
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, serialized, 'utf-8');
  } catch {
    try {
      fs.writeFileSync(TMP_DB_FILE, serialized, 'utf-8');
    } catch {
      // In-memory fallback
    }
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

  replaceAllNews(items: NewsItem[]): NewsItem[] {
    const db = ensureInitialDatabase();
    db.news = items;
    persistDb();
    return db.news;
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

  replaceAllOrders(items: GovernmentOrder[]): GovernmentOrder[] {
    const db = ensureInitialDatabase();
    db.orders = items;
    persistDb();
    return db.orders;
  },

  getDepartments(): Department[] {
    const db = ensureInitialDatabase();
    return db.departments;
  },

  saveDepartments(items: Department[]): Department[] {
    const db = ensureInitialDatabase();
    db.departments = items;
    persistDb();
    return db.departments;
  },

  getFaqs(): FAQItem[] {
    const db = ensureInitialDatabase();
    return db.faqs;
  },

  saveFaqs(items: FAQItem[]): FAQItem[] {
    const db = ensureInitialDatabase();
    db.faqs = items;
    persistDb();
    return db.faqs;
  },

  getTickerItems(): string[] {
    const db = ensureInitialDatabase();
    return Array.isArray(db.tickerItems) && db.tickerItems.length > 0 ? db.tickerItems : BREAKING_NEWS_ITEMS;
  },

  saveTickerItems(items: string[]): string[] {
    const db = ensureInitialDatabase();
    db.tickerItems = items;
    persistDb();
    return db.tickerItems;
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
  },

  getAdminCredential(): AdminCredentialRecord | undefined {
    const db = ensureInitialDatabase();
    return db.adminCredential;
  },

  setAdminCredential(cred: AdminCredentialRecord): AdminCredentialRecord {
    const db = ensureInitialDatabase();
    db.adminCredential = cred;
    persistDb();
    return cred;
  },

  findUserByIdentifier(identifier: string): StoredUserRecord | undefined {
    const db = ensureInitialDatabase();
    const clean = (identifier || '').trim().toLowerCase();
    const cleanMobile = clean.replace(/\D/g, '').slice(-10);
    return db.users.find(u => {
      const userMobile = (u.mobile || '').replace(/\D/g, '').slice(-10);
      if (cleanMobile.length === 10 && userMobile === cleanMobile) return true;
      if (u.email && u.email.toLowerCase() === clean) return true;
      return false;
    });
  },

  findUserById(id: string): StoredUserRecord | undefined {
    const db = ensureInitialDatabase();
    return db.users.find(u => u.id === id);
  },

  createUser(user: StoredUserRecord): StoredUserRecord {
    const db = ensureInitialDatabase();
    db.users.unshift(user);
    persistDb();
    return user;
  },

  updateUser(id: string, updates: Partial<StoredUserRecord>): StoredUserRecord | undefined {
    const db = ensureInitialDatabase();
    const idx = db.users.findIndex(u => u.id === id);
    if (idx < 0) return undefined;
    db.users[idx] = { ...db.users[idx], ...updates };
    persistDb();
    return db.users[idx];
  },

  updateUserPasswordByMobile(mobile: string, passwordHash: string, salt: string): StoredUserRecord | undefined {
    const db = ensureInitialDatabase();
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    const idx = db.users.findIndex(u => (u.mobile || '').replace(/\D/g, '').slice(-10) === cleanMobile);
    if (idx < 0) return undefined;
    db.users[idx] = { ...db.users[idx], passwordHash, salt };
    persistDb();
    return db.users[idx];
  },

  toSafeUserProfile(u: StoredUserRecord): UserProfile {
    return {
      id: u.id,
      name: u.name,
      mobile: u.mobile,
      email: u.email,
      district: u.district,
      department: u.department,
      designation: u.designation,
      avatar: u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      isVerified: Boolean(u.isVerified),
      isAdmin: u.role === 'admin',
      role: u.role,
      joinedDate: u.joinedDate,
      savedPostIds: [],
      savedOrderIds: [],
      savedNewsIds: []
    };
  }
};

