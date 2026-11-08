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
const STORAGE_KEY_TOKEN = 'uposn_auth_token';

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
    try {
      return sessionStorage.getItem(STORAGE_KEY_TOKEN) || localStorage.getItem(STORAGE_KEY_TOKEN);
    } catch (e) {
      return null;
    }
  },

  setAuthToken(token: string, persist: boolean = false): void {
    try {
      sessionStorage.setItem(STORAGE_KEY_TOKEN, token);
      if (persist) {
        localStorage.setItem(STORAGE_KEY_TOKEN, token);
      }
    } catch (e) {
      // Ignored
    }
  },

  async verifyServerSession(): Promise<UserProfile | null> {
    const token = this.getAuthToken();
    if (!token) return null;

    try {
      const res = await fetch('/api/admin/verify', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.valid && data.user) {
          const user: UserProfile = {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: 'admin',
            isAdmin: true,
            isVerified: true,
            district: 'लखनऊ (Lucknow)',
            department: 'प्रशासनिक व संपादकीय सेल (UPOSN)',
            designation: 'मुख्य प्रशासक (Super Admin)',
            joinedDate: 'जनवरी 2024'
          };
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
          notifyListeners(user);
          return user;
        }
      }
    } catch (e) {
      console.error('Session verification error:', e);
    }

    // Token invalid or expired
    this.logout();
    return null;
  },

  async loginAdmin(loginId: string, passkey: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId, passkey })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'अमान्य प्रशासक क्रेडेंशियल्स।' };
      }

      this.setAuthToken(data.token, true);
      const adminUser: UserProfile = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: 'admin',
        isAdmin: true,
        isVerified: true,
        district: 'लखनऊ (Lucknow)',
        department: 'प्रशासनिक व संपादकीय सेल (UPOSN)',
        designation: 'मुख्य प्रशासक (Super Admin)',
        joinedDate: 'जनवरी 2024'
      };

      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(adminUser));
      notifyListeners(adminUser);
      return { success: true, user: adminUser };
    } catch (err: any) {
      return { success: false, error: 'प्रमाणीकरण सर्वर से संपर्क नहीं हो सका।' };
    }
  },

  isAdminUser(user?: UserProfile | null): boolean {
    if (!user) {
      user = this.getCurrentUser();
    }
    if (!user) return false;
    // Server token must exist for admin actions
    const hasToken = Boolean(this.getAuthToken());
    return Boolean(user.isAdmin && user.role === 'admin' && hasToken);
  },

  async requestOtp(mobile: string): Promise<{ success: boolean; message: string; phoneMasked?: string }> {
    try {
      const res = await fetch('/api/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile })
      });
      const data = await res.json();
      return {
        success: data.success,
        message: data.message || 'OTP अनुरोध प्रेषित किया गया।',
        phoneMasked: data.phoneMasked
      };
    } catch (e) {
      return { success: false, message: 'OTP गेटवे से संपर्क विफल रहा।' };
    }
  },

  async verifyOtp(mobile: string, otp: string): Promise<{ success: boolean; verificationToken?: string; error?: string }> {
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp })
      });
      const data = await res.json();
      return data;
    } catch (e) {
      return { success: false, error: 'सत्यापन सर्वर से संपर्क विफल रहा।' };
    }
  },

  async logout(): Promise<void> {
    const token = this.getAuthToken();
    if (token) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {
        // Silently caught
      }
    }
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    sessionStorage.removeItem(STORAGE_KEY_TOKEN);
    notifyListeners(null);
  },

  subscribe(listener: AuthListener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }
};
