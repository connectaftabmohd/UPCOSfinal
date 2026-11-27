import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { UserProfile } from '../types';

export const UP_DISTRICTS = [
  'लखनऊ (Lucknow)',
  'प्रयागराज (Prayagraj)',
  'वाराणसी (Varanasi)',
  'कानपुर नगर (Kanpur Nagar)',
  'गोरखपुर (Gorakhpur)',
  'आगरा (Agra)',
  'मेरठ (Meerut)',
  'बरेली (Bareilly)',
  'अलीगढ़ (Aligarh)',
  'मुरादाबाद (Moradabad)',
  'गाजियाबाद (Ghaziabad)',
  'गौतम बुद्ध नगर / नोएडा (Noida)',
  'अयोध्या (Ayodhya)',
  'झांसी (Jhansi)',
  'सहारनपुर (Saharanpur)',
  'मिर्जापुर (Mirzapur)',
  'बस्ती (Basti)',
  'आजमगढ़ (Azamgarh)',
  'गोंडा (Gonda)',
  'सीतापुर (Sitapur)',
  'उन्नाव (Unnao)',
  'हरदोई (Hardoi)',
  'रायबरेली (Raebareli)',
  'सुलतानपुर (Sultanpur)',
  'बुलंदशहर (Bulandshahr)',
  'मथुरा (Mathura)',
  'फिरोजाबाद (Firozabad)',
  'मुजफ्फरनगर (Muzaffarnagar)',
  'बिजनौर (Bijnor)',
  'रामपुर (Rampur)',
  'जौनपुर (Jaunpur)',
  'गाजीपुर (Ghazipur)',
  'बलिया (Ballia)',
  'देवरिया (Deoria)',
  'कुशीनगर (Kushinagar)',
  'लखीमपुर खीरी (Lakhimpur Kheri)',
  'बहराइच (Bahraich)',
  'श्रावस्ती (Shravasti)',
  'बलरामपुर (Balrampur)',
  'सिद्धार्थनगर (Siddharthnagar)',
  'अम्बेडकर नगर (Ambedkar Nagar)',
  'अमेठी (Amethi)',
  'बाराबंकी (Barabanki)',
  'फतेहपुर (Fatehpur)',
  'कौशाम्बी (Kaushambi)',
  'प्रतापगढ़ (Pratapgarh)',
  'बांदा (Banda)',
  'चित्रकूट (Chitrakoot)',
  'हमीरपुर (Hamirpur)',
  'महोबा (Mahoba)',
  'ललितपुर (Lalitpur)',
  'जालौन (Jalaun)',
  'इटावा (Etawah)',
  'औरैया (Auraiya)',
  'फर्रुखाबाद (Farrukhabad)',
  'कन्नौज (Kannauj)',
  'मैनपुरी (Mainpuri)',
  'कासगंज (Kasganj)',
  'एटा (Etah)',
  'हाथरस (Hathras)',
  'शाहजहांपुर (Shahjahanpur)',
  'पीलीभीत (Pilibhit)',
  'बदायूं (Budaun)',
  'संभल (Sambhal)',
  'अमरोहा (Amroha)',
  'हापुड़ (Hapur)',
  'बागपत (Baghpat)',
  'शामली (Shamli)',
  'चंदौली (Chandauli)',
  'सोनभद्र (Sonbhadra)',
  'भदोही (Bhadohi)',
  'मऊ (Mau)',
  'महाराजगंज (Maharajganj)',
  'संत कबीर नगर (Sant Kabir Nagar)'
];

export const UP_DEPARTMENTS = [
  'चिकित्सा स्वास्थ्य एवं परिवार कल्याण (Health Dept)',
  'बेसिक शिक्षा परिषद (Basic Education)',
  'माध्यमिक एवं उच्च शिक्षा विभाग (Higher Education)',
  'नगर विकास एवं स्थानीय निकाय (Urban Local Bodies)',
  'राजस्व एवं चकबंदी विभाग (Revenue Dept)',
  'ऊर्जा एवं यूपीपीसीएल (Energy / UPPCL)',
  'परिवहन एवं रोडवेज (UPSRTC / Transport)',
  'पंचायती राज एवं ग्राम्य विकास (Rural Development)',
  'महिला एवं बाल विकास (ICDS)',
  'पुलिस एवं गृह विभाग (Police & Home)',
  'कृषि एवं किसान कल्याण विभाग (Agriculture)',
  'लोक निर्माण विभाग (PWD)',
  'सिंचाई एवं जल संसाधन विभाग (Irrigation)',
  'श्रम एवं रोजगार विभाग (Labour / Sewayojan)',
  'समाज कल्याण एवं पिछड़ा वर्ग कल्याण (Social Welfare)',
  'खाद्य एवं रसद विभाग (Food & Civil Supplies)'
];

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

const STORAGE_KEY_USER = 'up_portal_current_user';
const STORAGE_KEY_SAVED_CREDS = 'uposn_saved_login_credentials';
const LEGACY_TOKEN_KEY = 'uposn_auth_token';
const LEGACY_USERS_KEY = 'up_portal_registered_users';

// Hold Bearer / Supabase access token strictly in JS memory (never localStorage/sessionStorage)
let inMemoryAuthToken: string | null = null;

// In-memory storage adapter for @supabase/supabase-js so JWTs never touch localStorage/sessionStorage
const supabaseMemoryStore = new Map<string, string>();
const memoryStorageAdapter = {
  getItem: (key: string): string | null => supabaseMemoryStore.get(key) ?? null,
  setItem: (key: string, value: string): void => {
    supabaseMemoryStore.set(key, value);
  },
  removeItem: (key: string): void => {
    supabaseMemoryStore.delete(key);
  }
};

let supabaseClient: SupabaseClient | null = null;
let supabaseConfigCache: { url: string; anonKey: string } | null = null;
let authStateListenerBound = false;

// Clean up any legacy insecure storage keys on module init
try {
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  sessionStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(LEGACY_USERS_KEY);
} catch {
  // Ignored
}

type AuthListener = (user: UserProfile | null) => void;
const listeners: Set<AuthListener> = new Set();

function notifyListeners(user: UserProfile | null) {
  listeners.forEach((fn) => {
    try {
      fn(user);
    } catch (e) {
      console.error('Auth listener error:', e);
    }
  });
}

function saveUserProfile(user: UserProfile | null) {
  try {
    if (user) {
      const { password: _omitted, ...safeProfile } = user;
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(safeProfile));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  } catch {
    // Ignored
  }
}

function getBuildTimeSupabaseConfig(): { url: string; anonKey: string } | null {
  const viteEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  const url = (viteEnv?.VITE_SUPABASE_URL || '').trim();
  const anonKey = (viteEnv?.VITE_SUPABASE_ANON_KEY || '').trim();
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

function mapSupabaseUserToProfile(sbUser: SupabaseUser, fallback?: Partial<UserProfile> | null): UserProfile {
  const meta = (sbUser.user_metadata || {}) as Record<string, any>;
  const email = sbUser.email || fallback?.email || undefined;
  const rawMobile = (meta.mobile || sbUser.phone || fallback?.mobile || '').toString().replace(/\D/g, '').slice(-10);

  return {
    id: `sb-${sbUser.id}`,
    name: (meta.name || fallback?.name || (email ? email.split('@')[0] : 'कर्मचारी साथी')).toString(),
    mobile: rawMobile || undefined,
    email,
    district: (meta.district || fallback?.district || UP_DISTRICTS[0]).toString(),
    department: (meta.department || fallback?.department || UP_DEPARTMENTS[0]).toString(),
    designation: (meta.designation || fallback?.designation || 'आउटसोर्सिंग कर्मचारी').toString(),
    avatar: (meta.avatar || fallback?.avatar || DEFAULT_AVATAR).toString(),
    isVerified: Boolean(sbUser.email_confirmed_at || sbUser.phone_confirmed_at || meta.isVerified || fallback?.isVerified),
    isAdmin: false,
    role: 'user',
    joinedDate: (meta.joinedDate || fallback?.joinedDate || 'हाल ही में').toString(),
    savedPostIds: Array.isArray(meta.savedPostIds) ? meta.savedPostIds : fallback?.savedPostIds || [],
    savedOrderIds: Array.isArray(meta.savedOrderIds) ? meta.savedOrderIds : fallback?.savedOrderIds || [],
    savedNewsIds: Array.isArray(meta.savedNewsIds) ? meta.savedNewsIds : fallback?.savedNewsIds || []
  };
}

function initSupabaseClientFromConfig(config: { url: string; anonKey: string } | null): SupabaseClient | null {
  if (!config?.url || !config?.anonKey) return null;
  if (supabaseClient) return supabaseClient;

  supabaseClient = createClient(config.url, config.anonKey, {
    auth: {
      storage: memoryStorageAdapter,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: typeof window !== 'undefined'
    }
  });

  if (!authStateListenerBound) {
    authStateListenerBound = true;
    supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        const current = authService.getCurrentUser();
        if (current && !current.isAdmin) {
          authService.setAuthToken(null);
          saveUserProfile(null);
          notifyListeners(null);
        }
        return;
      }

      if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED')) {
        authService.setAuthToken(session.access_token);
        const current = authService.getCurrentUser();
        const mapped = mapSupabaseUserToProfile(session.user, current);
        saveUserProfile(mapped);
        notifyListeners(mapped);
      }
    });
  }

  return supabaseClient;
}

async function ensureSupabaseClient(): Promise<SupabaseClient | null> {
  if (supabaseClient) return supabaseClient;

  const buildCfg = getBuildTimeSupabaseConfig();
  if (buildCfg) {
    supabaseConfigCache = buildCfg;
    return initSupabaseClientFromConfig(buildCfg);
  }

  if (supabaseConfigCache) {
    return initSupabaseClientFromConfig(supabaseConfigCache);
  }

  try {
    const status = await authService.getAdminStatus();
    if (status.supabaseConfig?.url && status.supabaseConfig?.anonKey) {
      supabaseConfigCache = status.supabaseConfig;
      return initSupabaseClientFromConfig(supabaseConfigCache);
    }
  } catch {
    // Fallback to server endpoints
  }

  return null;
}

async function fetchRelationalProfile(client: SupabaseClient, sbUser: SupabaseUser): Promise<Partial<UserProfile> | null> {
  try {
    const sbId = `sb-${sbUser.id}`;
    const { data, error } = await client
      .from('portal_users')
      .select('id, name, mobile, email, district, department, designation, avatar, is_verified, joined_date')
      .or(`id.eq.${sbId},id.eq.${sbUser.id}`)
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return {
      name: data.name || undefined,
      mobile: data.mobile || undefined,
      email: data.email || undefined,
      district: data.district || undefined,
      department: data.department || undefined,
      designation: data.designation || undefined,
      avatar: data.avatar || undefined,
      isVerified: Boolean(data.is_verified),
      joinedDate: data.joined_date || undefined
    };
  } catch {
    return null;
  }
}

async function upsertRelationalProfile(client: SupabaseClient, profile: UserProfile): Promise<void> {
  try {
    await client.from('portal_users').upsert(
      {
        id: profile.id,
        name: profile.name,
        mobile: profile.mobile || '',
        email: profile.email || null,
        district: profile.district,
        department: profile.department,
        designation: profile.designation,
        avatar: profile.avatar || DEFAULT_AVATAR,
        is_verified: Boolean(profile.isVerified),
        role: 'user',
        joined_date: profile.joinedDate || 'हाल ही में',
        updated_at: new Date().toISOString()
      },
      { onConflict: 'id' }
    );
  } catch {
    // Table or RLS may not be initialized yet; Supabase user_metadata + server sync handle persistence
  }
}

async function syncSupabaseSessionWithServer(accessToken: string): Promise<UserProfile | null> {
  try {
    const res = await fetch('/api/auth/supabase-session', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({})
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.success && data.user) {
      return data.user as UserProfile;
    }
  } catch {
    // Graceful degradation when server sync is unreachable
  }
  return null;
}

function mapSupabaseAuthError(message: string): string {
  const lower = (message || '').toLowerCase();
  if (lower.includes('invalid login credentials')) {
    return 'अमान्य ईमेल या पासवर्ड! कृपया सही विवरण दर्ज करें।';
  }
  if (lower.includes('email not confirmed')) {
    return 'आपका ईमेल अभी सत्यापित नहीं हुआ है। कृपया अपने इनबॉक्स में भेजे गए लिंक या ईमेल OTP से सत्यापन करें।';
  }
  if (lower.includes('already registered') || lower.includes('already been registered')) {
    return 'यह ईमेल पहले से पंजीकृत है। कृपया लॉगिन करें।';
  }
  if (lower.includes('password should be at least')) {
    return 'पासवर्ड कम से कम 6 अक्षरों/अंकों का होना चाहिए।';
  }
  if (lower.includes('rate limit') || lower.includes('too many requests') || lower.includes('security purposes')) {
    return 'सुरक्षा कारणों से कृपया कुछ सेकंड प्रतीक्षा करके पुनः प्रयास करें।';
  }
  return message || 'प्रमाणीकरण विफल रहा।';
}

export const authService = {
  getDistricts(): string[] {
    return UP_DISTRICTS;
  },

  getDepartments(): string[] {
    return UP_DEPARTMENTS;
  },

  getSupabaseClient(): SupabaseClient | null {
    return initSupabaseClientFromConfig(getBuildTimeSupabaseConfig() || supabaseConfigCache);
  },

  getCurrentUser(): UserProfile | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading auth state:', e);
    }
    return null;
  },

  getAuthToken(): string | null {
    return inMemoryAuthToken;
  },

  setAuthToken(token: string | null): void {
    inMemoryAuthToken = token;
  },

  async getAdminStatus(): Promise<{
    needsSetup: boolean;
    otpConfigured: boolean;
    supabaseAuthConfigured: boolean;
    supabaseConfig?: { url: string; anonKey: string } | null;
  }> {
    try {
      const res = await fetch('/api/admin/status', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.supabaseConfig?.url && data.supabaseConfig?.anonKey) {
          supabaseConfigCache = data.supabaseConfig;
        }
        return data;
      }
    } catch {
      // Fallback
    }
    const buildCfg = getBuildTimeSupabaseConfig();
    return {
      needsSetup: false,
      otpConfigured: false,
      supabaseAuthConfigured: Boolean(buildCfg),
      supabaseConfig: buildCfg
    };
  },

  async setupAdminPassword(
    loginId: string,
    passkey: string
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId, passkey })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'प्रशासक पासवर्ड सेट करने में त्रुटि।' };
      }
      this.setAuthToken(data.token || null);
      saveUserProfile(data.user);
      notifyListeners(data.user);
      return { success: true, user: data.user };
    } catch {
      return { success: false, error: 'प्रमाणीकरण सर्वर से संपर्क नहीं हो सका।' };
    }
  },

  async verifyServerSession(): Promise<UserProfile | null> {
    const cachedUser = this.getCurrentUser();
    const client = await ensureSupabaseClient();

    // 1. Check active Supabase Auth session (including magic-link / confirmation URL callbacks)
    if (client) {
      try {
        const {
          data: { session }
        } = await client.auth.getSession();
        if (session?.user && session.access_token) {
          const {
            data: { user: verifiedSbUser }
          } = await client.auth.getUser(session.access_token);
          if (verifiedSbUser) {
            this.setAuthToken(session.access_token);
            const relProfile = await fetchRelationalProfile(client, verifiedSbUser);
            const serverProfile = await syncSupabaseSessionWithServer(session.access_token);
            const merged = mapSupabaseUserToProfile(verifiedSbUser, {
              ...cachedUser,
              ...relProfile,
              ...serverProfile
            });
            saveUserProfile(merged);
            notifyListeners(merged);
            return merged;
          }
        }
      } catch (e) {
        console.error('Supabase session verification error:', e);
      }
    }

    // 2. Verify server HttpOnly cookie / in-memory Bearer token
    const token = this.getAuthToken();
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const res = await fetch('/api/auth/verify', {
        credentials: 'include',
        headers
      });
      if (res.ok) {
        const data = await res.json();
        if (data.valid) {
          if (data.token) {
            this.setAuthToken(data.token);
          }
          if (data.user) {
            saveUserProfile(data.user);
            notifyListeners(data.user);
            return data.user;
          }
          if (cachedUser && data.userId === cachedUser.id) {
            notifyListeners(cachedUser);
            return cachedUser;
          }
        }
      }
    } catch (e) {
      console.error('Session verification error:', e);
      return cachedUser;
    }

    // Session invalid or expired: clear local auth state cleanly
    if (token || cachedUser) {
      this.setAuthToken(null);
      saveUserProfile(null);
      notifyListeners(null);
    }
    return null;
  },

  async loginAdmin(
    loginId: string,
    passkey: string
  ): Promise<{ success: boolean; user?: UserProfile; needsSetup?: boolean; error?: string }> {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId, passkey })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          needsSetup: Boolean(data.needsSetup),
          error: data.error || 'अमान्य प्रशासक क्रेडेंशियल्स।'
        };
      }

      this.setAuthToken(data.token || null);
      saveUserProfile(data.user);
      notifyListeners(data.user);
      return { success: true, user: data.user };
    } catch {
      return { success: false, error: 'प्रमाणीकरण सर्वर से संपर्क नहीं हो सका।' };
    }
  },

  isAdminUser(user?: UserProfile | null): boolean {
    const u = user || this.getCurrentUser();
    if (!u) return false;
    return Boolean(u.isAdmin && u.role === 'admin' && this.getAuthToken());
  },

  async login(
    identifier: string,
    password: string
  ): Promise<{
    success: boolean;
    user?: UserProfile;
    error?: string;
    notRegistered?: boolean;
    needsSetup?: boolean;
  }> {
    const cleanId = identifier.trim();
    if (!cleanId) {
      return { success: false, error: 'कृपया पंजीकृत मोबाइल नंबर या ईमेल दर्ज करें।' };
    }

    // Primary Supabase Auth flow for email + password user login
    if (cleanId.includes('@')) {
      const client = await ensureSupabaseClient();
      if (client) {
        try {
          const cleanEmail = cleanId.toLowerCase();
          const { data, error } = await client.auth.signInWithPassword({
            email: cleanEmail,
            password: password || ''
          });

          if (!error && data?.user && data?.session) {
            this.setAuthToken(data.session.access_token);
            const relProfile = await fetchRelationalProfile(client, data.user);
            const serverProfile = await syncSupabaseSessionWithServer(data.session.access_token);
            const userProfile = mapSupabaseUserToProfile(data.user, {
              ...relProfile,
              ...serverProfile
            });
            await upsertRelationalProfile(client, userProfile);
            saveUserProfile(userProfile);
            notifyListeners(userProfile);
            return { success: true, user: userProfile };
          }

          if (error && !error.message.toLowerCase().includes('invalid login credentials')) {
            return {
              success: false,
              error: mapSupabaseAuthError(error.message)
            };
          }
        } catch {
          // Fall through to server auth endpoint for fallback check
        }
      }
    }

    // Fallback / Mobile-number login via backend API (which also supports Supabase Auth fallback)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanId, password: password || '' })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          notRegistered: Boolean(data.notRegistered),
          needsSetup: Boolean(data.needsSetup),
          error: data.error || 'लॉगिन विफल रहा।'
        };
      }

      this.setAuthToken(data.token || null);
      saveUserProfile(data.user);
      notifyListeners(data.user);
      return { success: true, user: data.user };
    } catch {
      return { success: false, error: 'प्रमाणीकरण सर्वर से संपर्क नहीं हो सका।' };
    }
  },

  async register(userData: {
    name: string;
    mobile: string;
    email?: string;
    district: string;
    department: string;
    designation: string;
    password: string;
  }): Promise<{
    success: boolean;
    user?: UserProfile;
    error?: string;
    requiresEmailConfirmation?: boolean;
  }> {
    const cleanEmail = userData.email?.trim().toLowerCase();
    const cleanMobile = userData.mobile.replace(/\D/g, '').slice(-10);
    const cleanPassword = userData.password.trim();

    if (cleanEmail) {
      const client = await ensureSupabaseClient();
      if (client) {
        if (cleanPassword.length < 6) {
          return {
            success: false,
            error: 'Supabase खाते के लिए पासवर्ड कम से कम 6 अक्षरों/अंकों का होना चाहिए।'
          };
        }

        try {
          const metadata = {
            name: userData.name.trim(),
            mobile: cleanMobile,
            district: userData.district || UP_DISTRICTS[0],
            department: userData.department || UP_DEPARTMENTS[0],
            designation: userData.designation.trim() || 'डाटा एंट्री ऑपरेटर',
            avatar: DEFAULT_AVATAR,
            role: 'user' as const,
            joinedDate: 'हाल ही में'
          };

          const { data, error } = await client.auth.signUp({
            email: cleanEmail,
            password: cleanPassword,
            options: { data: metadata }
          });

          if (error) {
            return { success: false, error: mapSupabaseAuthError(error.message) };
          }

          // When Confirm Email is enabled, Supabase returns identities: [] for already-registered emails
          if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
            return {
              success: false,
              error: 'यह ईमेल पहले से पंजीकृत है। कृपया लॉगिन करें।'
            };
          }

          if (data?.user) {
            // Persist hashed mobile+email credentials into portal_users / backend store for future mobile+password login
            try {
              await fetch('/api/auth/register', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...userData,
                  supabaseUserId: data.user.id,
                  skipSupabaseSignUp: true,
                  requiresEmailConfirmation: !data.session
                })
              });
            } catch {
              // Non-fatal; Supabase Auth user is created
            }
          }

          if (data?.user && data?.session) {
            this.setAuthToken(data.session.access_token);
            const userProfile = mapSupabaseUserToProfile(data.user, metadata);
            await upsertRelationalProfile(client, userProfile);
            const serverProfile = await syncSupabaseSessionWithServer(data.session.access_token);
            const finalProfile = serverProfile ? { ...userProfile, ...serverProfile } : userProfile;
            saveUserProfile(finalProfile);
            notifyListeners(finalProfile);
            return { success: true, user: finalProfile };
          }

          if (data?.user && !data?.session) {
            return {
              success: false,
              requiresEmailConfirmation: true,
              error:
                'पंजीकरण सफल रहा! कृपया अपने ईमेल इनबॉक्स में भेजे गए सत्यापन लिंक की पुष्टि करें और फिर लॉगिन करें।'
            };
          }
        } catch {
          return { success: false, error: 'Supabase पंजीकरण सेवा से संपर्क नहीं हो सका।' };
        }
      }
    }

    // Fallback for mobile-only registration or environments without client Supabase config
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'पंजीकरण विफल रहा।' };
      }

      this.setAuthToken(data.token || null);
      saveUserProfile(data.user);
      notifyListeners(data.user);
      return { success: true, user: data.user };
    } catch {
      return { success: false, error: 'पंजीकरण सर्वर से संपर्क नहीं हो सका।' };
    }
  },

  async loginWithOtp(
    mobile: string,
    otp: string,
    otpChallenge?: string
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    try {
      const res = await fetch('/api/auth/otp-login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp, otpChallenge })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'OTP लॉगिन विफल रहा।' };
      }

      this.setAuthToken(data.token || null);
      saveUserProfile(data.user);
      notifyListeners(data.user);
      return { success: true, user: data.user };
    } catch {
      return { success: false, error: 'सत्यापन सर्वर से संपर्क विफल रहा।' };
    }
  },

  async requestEmailOtp(email: string): Promise<{
    success: boolean;
    message: string;
    gatewayNotConfigured?: boolean;
  }> {
    const cleanEmail = email.trim().toLowerCase();
    const client = await ensureSupabaseClient();

    if (client) {
      try {
        const { error } = await client.auth.signInWithOtp({
          email: cleanEmail,
          options: { shouldCreateUser: true }
        });
        if (error) {
          return {
            success: false,
            message: mapSupabaseAuthError(error.message)
          };
        }
        return {
          success: true,
          message: `6-अंकीय सत्यापन OTP कोड आपके ईमेल (${cleanEmail}) पर भेज दिया गया है। कृपया अपना इनबॉक्स व स्पैम फ़ोल्डर जांचें।`
        };
      } catch {
        return { success: false, message: 'Supabase OTP सेवा से संपर्क नहीं हो सका।' };
      }
    }

    try {
      const res = await fetch('/api/auth/email-otp/request', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      });
      const data = await res.json();
      return {
        success: Boolean(data.success),
        message: data.message || 'ईमेल OTP अनुरोध प्रेषित किया गया।',
        gatewayNotConfigured: Boolean(data.gatewayNotConfigured)
      };
    } catch {
      return { success: false, message: 'सर्वर से संपर्क विफल रहा।' };
    }
  },

  async verifyEmailOtp(
    email: string,
    otp: string
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanToken = otp.trim().replace(/\D/g, '');
    const client = await ensureSupabaseClient();

    if (client) {
      try {
        const { data, error } = await client.auth.verifyOtp({
          email: cleanEmail,
          token: cleanToken,
          type: 'email'
        });

        if (error || !data?.user || !data?.session) {
          return {
            success: false,
            error: error ? mapSupabaseAuthError(error.message) : 'अमान्य अथवा समाप्त हो चुका Email OTP।'
          };
        }

        this.setAuthToken(data.session.access_token);
        const relProfile = await fetchRelationalProfile(client, data.user);
        const serverProfile = await syncSupabaseSessionWithServer(data.session.access_token);
        const userProfile = mapSupabaseUserToProfile(data.user, {
          ...relProfile,
          ...serverProfile,
          isVerified: true
        });
        await upsertRelationalProfile(client, userProfile);
        saveUserProfile(userProfile);
        notifyListeners(userProfile);
        return { success: true, user: userProfile };
      } catch {
        return { success: false, error: 'Email OTP सत्यापन विफल रहा।' };
      }
    }

    try {
      const res = await fetch('/api/auth/email-otp/verify', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, otp: cleanToken })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Email OTP लॉगिन विफल रहा।' };
      }

      this.setAuthToken(data.token || null);
      saveUserProfile(data.user);
      notifyListeners(data.user);
      return { success: true, user: data.user };
    } catch {
      return { success: false, error: 'सत्यापन सर्वर से संपर्क विफल रहा।' };
    }
  },

  async requestPasswordResetEmail(email: string): Promise<{ success: boolean; message: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const client = await ensureSupabaseClient();
    if (!client) {
      return {
        success: false,
        message: 'Supabase ईमेल पासवर्ड रीसेट अभी सक्रिय नहीं है।'
      };
    }

    try {
      const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
      const { error } = await client.auth.resetPasswordForEmail(cleanEmail, { redirectTo });
      if (error) {
        return { success: false, message: mapSupabaseAuthError(error.message) };
      }
      return {
        success: true,
        message: `पासवर्ड रीसेट लिंक आपके ईमेल (${cleanEmail}) पर भेज दिया गया है।`
      };
    } catch {
      return { success: false, message: 'पासवर्ड रीसेट अनुरोध विफल रहा।' };
    }
  },

  async resetPasswordWithOtp(
    mobile: string,
    verificationToken: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, verificationToken, newPassword })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'पासवर्ड अपडेट विफल रहा।' };
      }
      return { success: true };
    } catch {
      return { success: false, error: 'सर्वर से संपर्क विफल रहा।' };
    }
  },

  async getProfile(): Promise<UserProfile | null> {
    const client = await ensureSupabaseClient();
    const current = this.getCurrentUser();

    if (client) {
      try {
        const {
          data: { session }
        } = await client.auth.getSession();
        if (session?.user) {
          const relProfile = await fetchRelationalProfile(client, session.user);
          const merged = mapSupabaseUserToProfile(session.user, { ...current, ...relProfile });
          saveUserProfile(merged);
          notifyListeners(merged);
          return merged;
        }
      } catch {
        // Fall through to server session check
      }
    }

    return this.verifyServerSession();
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    const current = this.getCurrentUser();
    const client = await ensureSupabaseClient();
    let updatedViaSupabase = false;
    let supabaseProfile: UserProfile | null = null;

    if (client) {
      try {
        const {
          data: { session }
        } = await client.auth.getSession();

        if (session?.user) {
          if (updates.password && updates.password.trim().length < 6) {
            return {
              success: false,
              error: 'Supabase खाते के लिए नया पासवर्ड कम से कम 6 अक्षरों/अंकों का होना चाहिए।'
            };
          }

          const existingMeta = (session.user.user_metadata || {}) as Record<string, any>;
          const nextMeta: Record<string, any> = {
            ...existingMeta,
            name: updates.name?.trim() || existingMeta.name || current?.name,
            district: updates.district?.trim() || existingMeta.district || current?.district,
            department: updates.department?.trim() || existingMeta.department || current?.department,
            designation: updates.designation?.trim() || existingMeta.designation || current?.designation,
            mobile: updates.mobile !== undefined ? updates.mobile : existingMeta.mobile ?? current?.mobile,
            avatar: updates.avatar || existingMeta.avatar || current?.avatar,
            savedPostIds: updates.savedPostIds ?? existingMeta.savedPostIds ?? current?.savedPostIds,
            savedOrderIds: updates.savedOrderIds ?? existingMeta.savedOrderIds ?? current?.savedOrderIds,
            savedNewsIds: updates.savedNewsIds ?? existingMeta.savedNewsIds ?? current?.savedNewsIds
          };

          const authPatch: { data: Record<string, any>; password?: string } = { data: nextMeta };
          if (updates.password && updates.password.trim()) {
            authPatch.password = updates.password.trim();
          }

          const { data, error } = await client.auth.updateUser(authPatch);
          if (error) {
            return { success: false, error: mapSupabaseAuthError(error.message) };
          }

          if (data?.user) {
            updatedViaSupabase = true;
            supabaseProfile = mapSupabaseUserToProfile(data.user, current);
            await upsertRelationalProfile(client, supabaseProfile);
          }
        }
      } catch {
        return { success: false, error: 'Supabase प्रोफ़ाइल अपडेट विफल रहा।' };
      }
    }

    // Sync profile updates with backend server (handles HttpOnly cookie sessions & relational DB sync)
    const token = this.getAuthToken();
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        const mergedUser: UserProfile = {
          ...(supabaseProfile || {}),
          ...data.user,
          savedPostIds: updates.savedPostIds ?? supabaseProfile?.savedPostIds ?? data.user.savedPostIds,
          savedOrderIds: updates.savedOrderIds ?? supabaseProfile?.savedOrderIds ?? data.user.savedOrderIds,
          savedNewsIds: updates.savedNewsIds ?? supabaseProfile?.savedNewsIds ?? data.user.savedNewsIds
        };
        saveUserProfile(mergedUser);
        notifyListeners(mergedUser);
        return { success: true, user: mergedUser };
      }

      if (updatedViaSupabase && supabaseProfile) {
        saveUserProfile(supabaseProfile);
        notifyListeners(supabaseProfile);
        return { success: true, user: supabaseProfile };
      }

      return { success: false, error: data.error || 'प्रोफ़ाइल अपडेट विफल रहा।' };
    } catch {
      if (updatedViaSupabase && supabaseProfile) {
        saveUserProfile(supabaseProfile);
        notifyListeners(supabaseProfile);
        return { success: true, user: supabaseProfile };
      }
      return { success: false, error: 'सर्वर से संपर्क विफल रहा।' };
    }
  },

  getSavedCredentials(): { loginId: string; remember: boolean } | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SAVED_CREDS);
      if (!data) return null;
      const parsed = JSON.parse(data);
      // Never retain any legacy saved password field
      if (parsed && typeof parsed === 'object') {
        return { loginId: parsed.loginId || '', remember: Boolean(parsed.remember) };
      }
      return null;
    } catch {
      return null;
    }
  },

  saveCredentials(loginId: string, remember: boolean = true): void {
    try {
      if (remember && loginId.trim()) {
        localStorage.setItem(
          STORAGE_KEY_SAVED_CREDS,
          JSON.stringify({
            loginId: loginId.trim(),
            remember: true
          })
        );
      } else {
        localStorage.removeItem(STORAGE_KEY_SAVED_CREDS);
      }
    } catch {
      // Ignored
    }
  },

  clearSavedCredentials(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_SAVED_CREDS);
    } catch {
      // Ignored
    }
  },

  async requestOtp(mobile: string): Promise<{
    success: boolean;
    message: string;
    phoneMasked?: string;
    otpChallenge?: string;
    gatewayNotConfigured?: boolean;
  }> {
    try {
      const res = await fetch('/api/request-otp', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile })
      });
      const data = await res.json();
      return {
        success: Boolean(data.success),
        message: data.message || 'OTP अनुरोध प्रेषित किया गया।',
        phoneMasked: data.phoneMasked,
        otpChallenge: data.otpChallenge,
        gatewayNotConfigured: Boolean(data.gatewayNotConfigured)
      };
    } catch {
      return { success: false, message: 'OTP गेटवे से संपर्क विफल रहा।' };
    }
  },

  async verifyOtp(
    mobile: string,
    otp: string,
    otpChallenge?: string
  ): Promise<{ success: boolean; verificationToken?: string; error?: string }> {
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp, otpChallenge })
      });
      return await res.json();
    } catch {
      return { success: false, error: 'सत्यापन सर्वर से संपर्क विफल रहा।' };
    }
  },

  async logout(): Promise<void> {
    const client = await ensureSupabaseClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch {
        // Ignored
      }
    }

    const token = this.getAuthToken();
    try {
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers
      });
    } catch {
      // Silently caught
    }

    this.setAuthToken(null);
    saveUserProfile(null);
    notifyListeners(null);
  },

  subscribe(listener: AuthListener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }
};
