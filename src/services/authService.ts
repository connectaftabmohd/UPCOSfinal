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
const STORAGE_KEY_SAVED_CREDS = 'uposn_saved_login_credentials';
const STORAGE_KEY_ALL_USERS = 'up_portal_registered_users';

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
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
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
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
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
    const hasToken = Boolean(this.getAuthToken());
    return Boolean(user.isAdmin && user.role === 'admin' && hasToken);
  },

  // Normal Employee User Login
  login(identifier: string, password?: string): { success: boolean; user?: UserProfile; error?: string; notRegistered?: boolean } {
    const cleanId = identifier.trim().toLowerCase();
    if (!cleanId) {
      return { success: false, error: 'कृपया पंजीकृत मोबाइल नंबर या ईमेल दर्ज करें।' };
    }

    // Admin login requires server passkey check
    if (cleanId === 'admin' || cleanId === 'aftab.mohd9@gmail.com') {
      return { 
        success: false, 
        error: 'व्यवस्थापक लॉगिन हेतु "प्रशासक प्रवेश" (Admin Access) बटन का उपयोग करें।' 
      };
    }

    const allUsers = this.getAllRegisteredUsers();
    const cleanMobile = cleanId.replace(/\D/g, '');

    const found = allUsers.find(u => {
      const userMobile = (u.mobile || '').replace(/\D/g, '');
      if (cleanMobile.length === 10 && userMobile === cleanMobile) return true;
      if (u.email && u.email.toLowerCase() === cleanId) return true;
      return false;
    });

    if (found) {
      if (found.password && password && found.password !== password.trim()) {
        return { success: false, error: 'अमान्य पासवर्ड! कृपया सही पासवर्ड दर्ज करें।' };
      }
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(found));
      notifyListeners(found);
      return { success: true, user: found };
    }

    return {
      success: false,
      notRegistered: true,
      error: 'यह खाता पंजीकृत नहीं है। कृपया पहले नया पंजीकरण करें।'
    };
  },

  // Normal Employee Registration
  register(userData: {
    name: string;
    mobile: string;
    email?: string;
    district: string;
    department: string;
    designation: string;
    password?: string;
  }): { success: boolean; user?: UserProfile; error?: string } {
    if (!userData.name.trim()) {
      return { success: false, error: 'कृपया पूरा नाम दर्ज करें।' };
    }
    const cleanMobile = userData.mobile.trim().replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length !== 10) {
      return { success: false, error: 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।' };
    }

    const allUsers = this.getAllRegisteredUsers();
    const exists = allUsers.some(u => (u.mobile || '').replace(/\D/g, '') === cleanMobile);
    if (exists) {
      return { success: false, error: 'यह मोबाइल नंबर पहले से पंजीकृत है। कृपया लॉगिन करें।' };
    }

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: userData.name.trim(),
      mobile: cleanMobile,
      email: userData.email?.trim() || undefined,
      password: userData.password?.trim() || undefined,
      district: userData.district || 'लखनऊ (Lucknow)',
      department: userData.department || 'चिकित्सा स्वास्थ्य एवं परिवार कल्याण (Health Dept)',
      designation: userData.designation.trim() || 'डाटा एंट्री ऑपरेटर',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      isVerified: false,
      role: 'user',
      joinedDate: 'हाल ही में',
      savedPostIds: [],
      savedOrderIds: [],
      savedNewsIds: []
    };

    allUsers.unshift(newUser);
    localStorage.setItem(STORAGE_KEY_ALL_USERS, JSON.stringify(allUsers));
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
    notifyListeners(newUser);
    return { success: true, user: newUser };
  },

  updateProfile(updates: Partial<UserProfile>): UserProfile | null {
    const current = this.getCurrentUser();
    if (!current) return null;
    const updated: UserProfile = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));

    const allUsers = this.getAllRegisteredUsers().map(u => u.id === updated.id ? updated : u);
    localStorage.setItem(STORAGE_KEY_ALL_USERS, JSON.stringify(allUsers));
    notifyListeners(updated);
    return updated;
  },

  getAllRegisteredUsers(): UserProfile[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ALL_USERS);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  getSavedCredentials(): { loginId: string; password?: string; remember: boolean } | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SAVED_CREDS);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveCredentials(loginId: string, password?: string, remember: boolean = true): void {
    try {
      if (remember && loginId.trim()) {
        localStorage.setItem(STORAGE_KEY_SAVED_CREDS, JSON.stringify({
          loginId: loginId.trim(),
          password: password || '',
          remember: true
        }));
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
