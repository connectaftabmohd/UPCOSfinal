/**
 * Server-Side Supabase Adapter & Auth Service
 * Uses SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY when configured.
 * Gracefully falls back to local dbService if Supabase env vars or custom tables are absent.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  AdminCredentialRecord,
  CommunityPostRecord,
  ContactMessage,
  StoredUserRecord
} from './dbService';
import type { Department, FAQItem, GovernmentOrder, NewsItem } from '../types';

let cachedAuthClient: SupabaseClient | null = null;
let cachedDbClient: SupabaseClient | null = null;

function getSupabaseEnv() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const anonKey = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  return { url, anonKey, serviceKey };
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey, serviceKey } = getSupabaseEnv();
  return Boolean(url && (anonKey || serviceKey));
}

function getAuthClient(): SupabaseClient | null {
  if (cachedAuthClient) return cachedAuthClient;
  const { url, anonKey, serviceKey } = getSupabaseEnv();
  const key = anonKey || serviceKey;
  if (!url || !key) return null;

  cachedAuthClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
  return cachedAuthClient;
}

function getDbClient(): SupabaseClient | null {
  if (cachedDbClient) return cachedDbClient;
  const { url, anonKey, serviceKey } = getSupabaseEnv();
  const key = serviceKey || anonKey;
  if (!url || !key) return null;

  cachedDbClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
  return cachedDbClient;
}

function isSchemaMissingOrRlsError(error: any): boolean {
  if (!error) return false;
  const code = String(error.code || '');
  const msg = String(error.message || '');
  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    code === '42501' ||
    msg.includes('Could not find the table') ||
    msg.includes('does not exist')
  );
}

function mapRowToStoredUser(row: any): StoredUserRecord {
  return {
    id: row.id,
    name: row.name,
    mobile: row.mobile || '',
    email: row.email || undefined,
    passwordHash: row.password_hash || undefined,
    salt: row.salt || undefined,
    district: row.district || 'लखनऊ (Lucknow)',
    department: row.department || 'चिकित्सा स्वास्थ्य एवं परिवार कल्याण (Health Dept)',
    designation: row.designation || 'आउटसोर्सिंग कर्मचारी',
    avatar: row.avatar || undefined,
    isVerified: Boolean(row.is_verified),
    role: row.role === 'admin' ? 'admin' : 'user',
    joinedDate: row.joined_date || 'हाल ही में'
  };
}

export const supabaseService = {
  isConfigured(): boolean {
    return isSupabaseConfigured();
  },

  getPublicClientConfig(): { url: string; anonKey: string } | null {
    const { url, anonKey } = getSupabaseEnv();
    if (!url || !anonKey) return null;
    return { url, anonKey };
  },

  async getUserFromAccessToken(accessToken: string): Promise<{
    supabaseUserId: string;
    email?: string;
    phone?: string;
    emailConfirmed: boolean;
    userMetadata: Record<string, any>;
  } | null> {
    const client = getAuthClient();
    if (!client || !accessToken) return null;

    try {
      const { data, error } = await client.auth.getUser(accessToken);
      if (error || !data?.user) return null;
      return {
        supabaseUserId: data.user.id,
        email: data.user.email || undefined,
        phone: data.user.phone || undefined,
        emailConfirmed: Boolean(data.user.email_confirmed_at),
        userMetadata: (data.user.user_metadata || {}) as Record<string, any>
      };
    } catch {
      return null;
    }
  },

  async updateAuthUserById(
    supabaseUserId: string,
    updates: { password?: string; userMetadata?: Record<string, any> }
  ): Promise<boolean> {
    const { url, serviceKey } = getSupabaseEnv();
    if (!url || !serviceKey || !supabaseUserId) return false;
    const dbClient = getDbClient();
    if (!dbClient) return false;

    try {
      const cleanId = supabaseUserId.replace(/^sb-/, '');
      const payload: { password?: string; user_metadata?: Record<string, any> } = {};
      if (updates.password) payload.password = updates.password;
      if (updates.userMetadata) payload.user_metadata = updates.userMetadata;
      const { error } = await dbClient.auth.admin.updateUserById(cleanId, payload);
      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Free Email OTP via Supabase Built-in Auth (zero custom tables required)
   */
  async sendEmailOtp(email: string): Promise<{ success: boolean; message: string }> {
    const client = getAuthClient();
    if (!client) {
      return {
        success: false,
        message: 'Supabase सर्वर पर कॉन्फ़िगर नहीं है।'
      };
    }

    const cleanEmail = email.trim().toLowerCase();
    try {
      const { error } = await client.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true
        }
      });

      if (error) {
        if (error.message?.toLowerCase().includes('rate')) {
          return {
            success: false,
            message: 'कृपया नया OTP मांगने से पहले कुछ सेकंड प्रतीक्षा करें।'
          };
        }
        return {
          success: false,
          message: 'ईमेल OTP भेजने में त्रुटि आई। कृपया अपना ईमेल जांचें या थोड़ी देर बाद पुनः प्रयास करें।'
        };
      }

      return {
        success: true,
        message: `6-अंकीय सत्यापन OTP कोड आपके ईमेल (${cleanEmail}) पर भेज दिया गया है। कृपया अपना इनबॉक्स व स्पैम फ़ोल्डर जांचें।`
      };
    } catch {
      return {
        success: false,
        message: 'Supabase OTP सेवा से संपर्क नहीं हो सका।'
      };
    }
  },

  async verifyEmailOtp(
    email: string,
    token: string
  ): Promise<{
    success: boolean;
    supabaseUserId?: string;
    email?: string;
    userMetadata?: Record<string, any>;
    error?: string;
  }> {
    const client = getAuthClient();
    if (!client) {
      return { success: false, error: 'Supabase कॉन्फ़िगर नहीं है।' };
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanToken = token.trim().replace(/\D/g, '');

    try {
      const { data, error } = await client.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'email'
      });

      if (error || !data?.user) {
        return {
          success: false,
          error: 'अमान्य अथवा समाप्त हो चुका Email OTP। कृपया पुनः प्रयास करें।'
        };
      }

      return {
        success: true,
        supabaseUserId: data.user.id,
        email: data.user.email || cleanEmail,
        userMetadata: (data.user.user_metadata || {}) as Record<string, any>
      };
    } catch {
      return {
        success: false,
        error: 'Email OTP सत्यापन विफल रहा।'
      };
    }
  },

  async signUpWithEmailPassword(
    email: string,
    password: string,
    metadata: Record<string, any>
  ): Promise<{ success: boolean; supabaseUserId?: string }> {
    const client = getAuthClient();
    if (!client) return { success: false };

    try {
      const { data, error } = await client.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { data: metadata }
      });
      if (error || !data?.user) return { success: false };
      return { success: true, supabaseUserId: data.user.id };
    } catch {
      return { success: false };
    }
  },

  async signInWithEmailPassword(
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    supabaseUserId?: string;
    email?: string;
    userMetadata?: Record<string, any>;
    emailNotConfirmed?: boolean;
    error?: string;
  }> {
    const client = getAuthClient();
    if (!client) return { success: false };

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });
      if (error || !data?.user) {
        const msg = (error?.message || '').toLowerCase();
        return {
          success: false,
          emailNotConfirmed: msg.includes('email not confirmed'),
          error: error?.message
        };
      }
      return {
        success: true,
        supabaseUserId: data.user.id,
        email: data.user.email || email.trim().toLowerCase(),
        userMetadata: (data.user.user_metadata || {}) as Record<string, any>
      };
    } catch {
      return { success: false };
    }
  },

  /**
   * Relational Table Persistence (portal_admin_config, portal_users, portal_contacts)
   */
  async getAdminCredential(): Promise<AdminCredentialRecord | null> {
    const client = getDbClient();
    if (!client) return null;

    try {
      const { data, error } = await client
        .from('portal_admin_config')
        .select('email, password_hash, salt, updated_at')
        .eq('id', 'primary-admin')
        .maybeSingle();

      if (error) {
        if (!isSchemaMissingOrRlsError(error)) {
          console.error('Supabase getAdminCredential error:', error.message);
        }
        return null;
      }

      if (!data) return null;
      return {
        email: data.email,
        hash: data.password_hash,
        salt: data.salt,
        updatedAt: data.updated_at
      };
    } catch {
      return null;
    }
  },

  async setAdminCredential(cred: AdminCredentialRecord): Promise<boolean> {
    const client = getDbClient();
    if (!client) return false;

    try {
      const { error } = await client.from('portal_admin_config').upsert(
        {
          id: 'primary-admin',
          email: cred.email,
          password_hash: cred.hash,
          salt: cred.salt,
          updated_at: cred.updatedAt
        },
        { onConflict: 'id' }
      );
      if (error) {
        if (!isSchemaMissingOrRlsError(error)) {
          console.error('Supabase setAdminCredential error:', error.message);
        }
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  async findUserByIdentifier(identifier: string): Promise<StoredUserRecord | null> {
    const client = getDbClient();
    if (!client) return null;

    const clean = (identifier || '').trim().toLowerCase();
    const cleanMobile = clean.replace(/\D/g, '').slice(-10);

    try {
      if (cleanMobile.length === 10 && !clean.includes('@')) {
        const { data, error } = await client
          .from('portal_users')
          .select('*')
          .eq('mobile', cleanMobile)
          .limit(1)
          .maybeSingle();
        if (error) return null;
        return data ? mapRowToStoredUser(data) : null;
      }

      const { data, error } = await client
        .from('portal_users')
        .select('*')
        .ilike('email', clean)
        .limit(1)
        .maybeSingle();
      if (error) return null;
      return data ? mapRowToStoredUser(data) : null;
    } catch {
      return null;
    }
  },

  async findUserById(id: string): Promise<StoredUserRecord | null> {
    const client = getDbClient();
    if (!client) return null;

    try {
      const { data, error } = await client
        .from('portal_users')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error || !data) return null;
      return mapRowToStoredUser(data);
    } catch {
      return null;
    }
  },

  async createUser(user: StoredUserRecord): Promise<boolean> {
    const client = getDbClient();
    if (!client) return false;

    try {
      const { error } = await client.from('portal_users').upsert(
        {
          id: user.id,
          name: user.name,
          mobile: user.mobile || '',
          email: user.email || null,
          password_hash: user.passwordHash || null,
          salt: user.salt || null,
          district: user.district,
          department: user.department,
          designation: user.designation,
          avatar: user.avatar || null,
          is_verified: Boolean(user.isVerified),
          role: user.role,
          joined_date: user.joinedDate
        },
        { onConflict: 'id' }
      );
      if (error) {
        if (!isSchemaMissingOrRlsError(error)) {
          console.error('Supabase createUser error:', error.message);
        }
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  async updateUser(id: string, updates: Partial<StoredUserRecord>): Promise<StoredUserRecord | null> {
    const client = getDbClient();
    if (!client) return null;

    const patch: Record<string, any> = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) patch.name = updates.name;
    if (updates.mobile !== undefined) patch.mobile = updates.mobile;
    if (updates.email !== undefined) patch.email = updates.email;
    if (updates.district !== undefined) patch.district = updates.district;
    if (updates.department !== undefined) patch.department = updates.department;
    if (updates.designation !== undefined) patch.designation = updates.designation;
    if (updates.avatar !== undefined) patch.avatar = updates.avatar;
    if (updates.isVerified !== undefined) patch.is_verified = updates.isVerified;
    if (updates.passwordHash !== undefined) patch.password_hash = updates.passwordHash;
    if (updates.salt !== undefined) patch.salt = updates.salt;

    try {
      const { data, error } = await client
        .from('portal_users')
        .update(patch)
        .eq('id', id)
        .select('*')
        .maybeSingle();
      if (error || !data) return null;
      return mapRowToStoredUser(data);
    } catch {
      return null;
    }
  },

  async updateUserPasswordByMobile(
    mobile: string,
    passwordHash: string,
    salt: string
  ): Promise<StoredUserRecord | null> {
    const client = getDbClient();
    if (!client) return null;

    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    try {
      const { data, error } = await client
        .from('portal_users')
        .update({
          password_hash: passwordHash,
          salt,
          updated_at: new Date().toISOString()
        })
        .eq('mobile', cleanMobile)
        .select('*')
        .maybeSingle();
      if (error || !data) return null;
      return mapRowToStoredUser(data);
    } catch {
      return null;
    }
  },

  async saveContact(record: ContactMessage): Promise<boolean> {
    const client = getDbClient();
    if (!client) return false;

    try {
      const { error } = await client.from('portal_contacts').insert({
        id: record.id,
        name: record.name,
        email: record.email,
        phone: record.phone || null,
        subject: record.subject,
        message: record.message,
        is_read: false,
        created_at: record.createdAt
      });
      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Website Database Health & Table Diagnostics
   */
  async getWebsiteDatabaseStatus(): Promise<{
    configured: boolean;
    hasUrl: boolean;
    hasAnonKey: boolean;
    hasServiceRoleKey: boolean;
    schemaReady: boolean;
    tables: Record<string, { exists: boolean; count: number | null }>;
  }> {
    const { url, anonKey, serviceKey } = getSupabaseEnv();
    const configured = isSupabaseConfigured();
    const tableNames = [
      'portal_news',
      'portal_orders',
      'portal_departments',
      'portal_faqs',
      'portal_site_config',
      'portal_community_posts',
      'portal_users',
      'portal_contacts'
    ];

    const tables: Record<string, { exists: boolean; count: number | null }> = {};
    for (const name of tableNames) {
      tables[name] = { exists: false, count: null };
    }

    const client = getDbClient();
    if (!configured || !client) {
      return {
        configured: false,
        hasUrl: Boolean(url),
        hasAnonKey: Boolean(anonKey),
        hasServiceRoleKey: Boolean(serviceKey),
        schemaReady: false,
        tables
      };
    }

    await Promise.all(
      tableNames.map(async (table) => {
        try {
          const { count, error, status } = await client
            .from(table)
            .select('*', { count: 'exact' })
            .limit(1);
          if (!error && status >= 200 && status < 300) {
            tables[table] = { exists: true, count: typeof count === 'number' ? count : 0 };
          } else {
            tables[table] = { exists: false, count: null };
          }
        } catch {
          tables[table] = { exists: false, count: null };
        }
      })
    );

    const requiredContentTables = ['portal_news', 'portal_orders', 'portal_departments', 'portal_faqs', 'portal_site_config'];
    const schemaReady = requiredContentTables.every((t) => tables[t]?.exists);

    return {
      configured,
      hasUrl: Boolean(url),
      hasAnonKey: Boolean(anonKey),
      hasServiceRoleKey: Boolean(serviceKey),
      schemaReady,
      tables
    };
  },

  /**
   * Website News (portal_news)
   */
  async getNews(): Promise<NewsItem[] | null> {
    const client = getDbClient();
    if (!client) return null;

    try {
      const { data, error } = await client
        .from('portal_news')
        .select('data')
        .order('sort_order', { ascending: true });
      if (error) {
        if (!isSchemaMissingOrRlsError(error)) {
          console.error('Supabase getNews error:', error.message);
        }
        return null;
      }
      return (data || []).map((row: any) => row.data as NewsItem).filter(Boolean);
    } catch {
      return null;
    }
  },

  async syncNews(items: NewsItem[]): Promise<boolean> {
    const client = getDbClient();
    if (!client) return false;

    try {
      const now = new Date().toISOString();
      const rows = items.map((item, idx) => ({
        id: item.id,
        slug: item.slug || item.id,
        title: item.title,
        category: item.category,
        department: item.department,
        publication_date: item.publicationDate || null,
        is_featured: Boolean(item.isFeatured),
        sort_order: idx,
        data: item,
        updated_at: now
      }));

      if (rows.length > 0) {
        const { error } = await client.from('portal_news').upsert(rows, { onConflict: 'id' });
        if (error) {
          if (!isSchemaMissingOrRlsError(error)) console.error('Supabase syncNews error:', error.message);
          return false;
        }
      }

      const { data: existingRows } = await client.from('portal_news').select('id');
      if (existingRows) {
        const keepIds = new Set(items.map((i) => i.id));
        const toDelete = existingRows.map((r: any) => r.id).filter((id: string) => !keepIds.has(id));
        if (toDelete.length > 0) {
          await client.from('portal_news').delete().in('id', toDelete);
        }
      }
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Government Orders (portal_orders)
   */
  async getOrders(): Promise<GovernmentOrder[] | null> {
    const client = getDbClient();
    if (!client) return null;

    try {
      const { data, error } = await client
        .from('portal_orders')
        .select('data')
        .order('sort_order', { ascending: true });
      if (error) {
        if (!isSchemaMissingOrRlsError(error)) console.error('Supabase getOrders error:', error.message);
        return null;
      }
      return (data || []).map((row: any) => row.data as GovernmentOrder).filter(Boolean);
    } catch {
      return null;
    }
  },

  async syncOrders(items: GovernmentOrder[]): Promise<boolean> {
    const client = getDbClient();
    if (!client) return false;

    try {
      const now = new Date().toISOString();
      const rows = items.map((order, idx) => ({
        id: order.id,
        slug: order.slug || order.id,
        order_number: order.orderNumber || order.id,
        title: order.title,
        department: order.department,
        year: Number(order.year) || 2026,
        date: order.date || null,
        sort_order: idx,
        data: order,
        updated_at: now
      }));

      if (rows.length > 0) {
        const { error } = await client.from('portal_orders').upsert(rows, { onConflict: 'id' });
        if (error) {
          if (!isSchemaMissingOrRlsError(error)) console.error('Supabase syncOrders error:', error.message);
          return false;
        }
      }

      const { data: existingRows } = await client.from('portal_orders').select('id');
      if (existingRows) {
        const keepIds = new Set(items.map((o) => o.id));
        const toDelete = existingRows.map((r: any) => r.id).filter((id: string) => !keepIds.has(id));
        if (toDelete.length > 0) {
          await client.from('portal_orders').delete().in('id', toDelete);
        }
      }
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Departments (portal_departments)
   */
  async getDepartments(): Promise<Department[] | null> {
    const client = getDbClient();
    if (!client) return null;

    try {
      const { data, error } = await client
        .from('portal_departments')
        .select('data')
        .order('sort_order', { ascending: true });
      if (error) return null;
      return (data || []).map((row: any) => row.data as Department).filter(Boolean);
    } catch {
      return null;
    }
  },

  async syncDepartments(items: Department[]): Promise<boolean> {
    const client = getDbClient();
    if (!client) return false;

    try {
      const now = new Date().toISOString();
      const rows = items.map((dept, idx) => ({
        id: dept.id,
        name: dept.name,
        english_name: dept.englishName || dept.name,
        sort_order: idx,
        data: dept,
        updated_at: now
      }));

      if (rows.length > 0) {
        const { error } = await client.from('portal_departments').upsert(rows, { onConflict: 'id' });
        if (error) return false;
      }

      const { data: existingRows } = await client.from('portal_departments').select('id');
      if (existingRows) {
        const keepIds = new Set(items.map((d) => d.id));
        const toDelete = existingRows.map((r: any) => r.id).filter((id: string) => !keepIds.has(id));
        if (toDelete.length > 0) {
          await client.from('portal_departments').delete().in('id', toDelete);
        }
      }
      return true;
    } catch {
      return false;
    }
  },

  /**
   * FAQs (portal_faqs)
   */
  async getFaqs(): Promise<FAQItem[] | null> {
    const client = getDbClient();
    if (!client) return null;

    try {
      const { data, error } = await client
        .from('portal_faqs')
        .select('category, question, answer')
        .order('sort_order', { ascending: true });
      if (error) return null;
      return (data || []).map((row: any) => ({
        category: row.category || 'सामान्य',
        question: row.question,
        answer: row.answer
      }));
    } catch {
      return null;
    }
  },

  async syncFaqs(items: FAQItem[]): Promise<boolean> {
    const client = getDbClient();
    if (!client) return false;

    try {
      const now = new Date().toISOString();
      const rows = items.map((faq, idx) => ({
        id: `faq-${idx + 1}`,
        category: faq.category || 'सामान्य',
        question: faq.question,
        answer: faq.answer,
        sort_order: idx,
        updated_at: now
      }));

      if (rows.length > 0) {
        const { error } = await client.from('portal_faqs').upsert(rows, { onConflict: 'id' });
        if (error) return false;
      }

      const { data: existingRows } = await client.from('portal_faqs').select('id');
      if (existingRows) {
        const keepIds = new Set(rows.map((r) => r.id));
        const toDelete = existingRows.map((r: any) => r.id).filter((id: string) => !keepIds.has(id));
        if (toDelete.length > 0) {
          await client.from('portal_faqs').delete().in('id', toDelete);
        }
      }
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Ticker / Site Config (portal_site_config)
   */
  async getTickerItems(): Promise<string[] | null> {
    const client = getDbClient();
    if (!client) return null;

    try {
      const { data, error } = await client
        .from('portal_site_config')
        .select('value')
        .eq('key', 'ticker_items')
        .maybeSingle();
      if (error || !data) return null;
      return Array.isArray(data.value) ? (data.value as string[]) : null;
    } catch {
      return null;
    }
  },

  async syncTickerItems(items: string[]): Promise<boolean> {
    const client = getDbClient();
    if (!client) return false;

    try {
      const { error } = await client.from('portal_site_config').upsert(
        {
          key: 'ticker_items',
          value: items,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'key' }
      );
      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Community Posts (portal_community_posts)
   */
  async getCommunityPosts(): Promise<CommunityPostRecord[] | null> {
    const client = getDbClient();
    if (!client) return null;

    try {
      const { data, error } = await client
        .from('portal_community_posts')
        .select('*')
        .eq('is_blocked', false)
        .order('created_at', { ascending: false });
      if (error) return null;
      return (data || []).map((row: any) => ({
        id: row.id,
        authorId: row.author_id,
        authorName: row.author_name,
        authorDistrict: row.author_district,
        authorDepartment: row.author_department,
        category: row.category || 'सामान्य',
        content: row.content,
        createdAt: row.created_at_label || 'अभी-अभी',
        likes: Number(row.likes || 0),
        commentsCount: Number(row.comments_count || 0),
        reportCount: Number(row.report_count || 0),
        isBlocked: Boolean(row.is_blocked)
      }));
    } catch {
      return null;
    }
  },

  async createCommunityPost(post: CommunityPostRecord): Promise<boolean> {
    const client = getDbClient();
    if (!client) return false;

    try {
      const { error } = await client.from('portal_community_posts').insert({
        id: post.id,
        author_id: post.authorId,
        author_name: post.authorName,
        author_district: post.authorDistrict,
        author_department: post.authorDepartment,
        category: post.category,
        content: post.content,
        created_at_label: post.createdAt,
        likes: post.likes || 0,
        comments_count: post.commentsCount || 0,
        report_count: post.reportCount || 0,
        is_blocked: false
      });
      return !error;
    } catch {
      return false;
    }
  },

  async reportCommunityPost(postId: string): Promise<boolean> {
    const client = getDbClient();
    if (!client || !postId) return false;

    try {
      const { data: existing } = await client
        .from('portal_community_posts')
        .select('report_count')
        .eq('id', postId)
        .maybeSingle();
      if (!existing) return false;

      const nextCount = Number(existing.report_count || 0) + 1;
      const { error } = await client
        .from('portal_community_posts')
        .update({
          report_count: nextCount,
          is_blocked: nextCount >= 5
        })
        .eq('id', postId);
      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Sync Full Website Dataset into Supabase
   */
  async syncAllWebsiteData(payload: {
    news?: NewsItem[];
    orders?: GovernmentOrder[];
    departments?: Department[];
    faqs?: FAQItem[];
    ticker?: string[];
  }): Promise<{ success: boolean; synced: Record<string, number> }> {
    const synced: Record<string, number> = {};
    if (!isSupabaseConfigured()) {
      return { success: false, synced };
    }

    let ok = true;
    if (Array.isArray(payload.news)) {
      const res = await this.syncNews(payload.news);
      if (res) synced.news = payload.news.length;
      else ok = false;
    }
    if (Array.isArray(payload.orders)) {
      const res = await this.syncOrders(payload.orders);
      if (res) synced.orders = payload.orders.length;
      else ok = false;
    }
    if (Array.isArray(payload.departments)) {
      const res = await this.syncDepartments(payload.departments);
      if (res) synced.departments = payload.departments.length;
      else ok = false;
    }
    if (Array.isArray(payload.faqs)) {
      const res = await this.syncFaqs(payload.faqs);
      if (res) synced.faqs = payload.faqs.length;
      else ok = false;
    }
    if (Array.isArray(payload.ticker)) {
      const res = await this.syncTickerItems(payload.ticker);
      if (res) synced.ticker = payload.ticker.length;
      else ok = false;
    }

    return { success: ok, synced };
  }
};
