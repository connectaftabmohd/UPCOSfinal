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

const STORAGE_KEY_USER = 'up_portal_current_user';
const STORAGE_KEY_SAVED_CREDS = 'uposn_saved_login_credentials';
const LEGACY_TOKEN_KEY = 'uposn_auth_token';
const LEGACY_USERS_KEY = 'up_portal_registered_users';

// Hold Bearer token strictly in JS memory (never localStorage/sessionStorage)
let inMemoryAuthToken: string | null = null;

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
  listeners.forEach(fn => {
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

export const authService = {
  getDistricts(): string[] {
    return UP_DISTRICTS;
  },

  getDepartments(): string[] {
    return UP_DEPARTMENTS;
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

  async getAdminStatus(): Promise<{ needsSetup: boolean; otpConfigured: boolean; supabaseAuthConfigured: boolean }> {
    try {
      const res = await fetch('/api/admin/status', { credentials: 'include' });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return { needsSetup: false, otpConfigured: false, supabaseAuthConfigured: false };
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
    const token = this.getAuthToken();
    const cachedUser = this.getCurrentUser();

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
  }): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
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
    try {
      const res = await fetch('/api/auth/email-otp/request', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
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
    try {
      const res = await fetch('/api/auth/email-otp/verify', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
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

  async updateProfile(updates: Partial<UserProfile>): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
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
      if (!res.ok || !data.success || !data.user) {
        return { success: false, error: data.error || 'प्रोफ़ाइल अपडेट विफल रहा।' };
      }
      saveUserProfile(data.user);
      notifyListeners(data.user);
      return { success: true, user: data.user };
    } catch {
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
