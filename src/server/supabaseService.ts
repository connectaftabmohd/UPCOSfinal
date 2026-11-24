/**
 * Server-Side Supabase Adapter & Auth Service
 * Uses SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY when configured.
 * Gracefully falls back to local dbService if Supabase env vars or custom tables are absent.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { AdminCredentialRecord, ContactMessage, StoredUserRecord } from './dbService';

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
  }> {
    const client = getAuthClient();
    if (!client) return { success: false };

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });
      if (error || !data?.user) return { success: false };
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
    if (updates.district !== undefined) patch.district = updates.district;
    if (updates.department !== undefined) patch.department = updates.department;
    if (updates.designation !== undefined) patch.designation = updates.designation;
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
  }
};
