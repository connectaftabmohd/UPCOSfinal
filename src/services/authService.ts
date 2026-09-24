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

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'u1',
    name: 'राजीव कुमार शर्मा',
    mobile: '9876543210',
    email: 'rajeev.sharma@up.gov.in',
    district: 'लखनऊ (Lucknow)',
    department: 'चिकित्सा स्वास्थ्य एवं परिवार कल्याण (Health Dept)',
    designation: 'वरिष्ठ कंप्यूटर ऑपरेटर (Senior DEO)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
    joinedDate: 'जनवरी 2024',
    savedPostIds: ['post-1'],
    savedOrderIds: ['order-1', 'order-3'],
    savedNewsIds: ['news-1']
  },
  {
    id: 'u2',
    name: 'प्रिया यादव',
    mobile: '9811223344',
    email: 'priya.yadav@up.gov.in',
    district: 'वाराणसी (Varanasi)',
    department: 'बेसिक शिक्षा परिषद (Basic Education)',
    designation: 'डाटा एंट्री ऑपरेटर (DEO)',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
    joinedDate: 'मार्च 2024',
    savedPostIds: ['post-2'],
    savedOrderIds: ['order-2'],
    savedNewsIds: ['news-2']
  },
  {
    id: 'u3',
    name: 'मोहम्मद आरिफ सिद्दीकी',
    mobile: '9722334455',
    email: 'arif.siddiqui@up.gov.in',
    district: 'कानपुर नगर (Kanpur Nagar)',
    department: 'नगर विकास एवं स्थानीय निकाय (Urban Local Bodies)',
    designation: 'जलकल सुपरवाइजर (Supervisor)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
    joinedDate: 'मई 2024',
    savedPostIds: [],
    savedOrderIds: ['order-4'],
    savedNewsIds: []
  },
  {
    id: 'u4',
    name: 'सुरेश चंद्रा',
    mobile: '9455667788',
    email: 'suresh.chandra@up.gov.in',
    district: 'गोरखपुर (Gorakhpur)',
    department: 'राजस्व एवं चकबंदी विभाग (Revenue Dept)',
    designation: 'कनिष्ठ सहायक (Junior Assistant)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    isVerified: false,
    joinedDate: 'अगस्त 2024',
    savedPostIds: [],
    savedOrderIds: [],
    savedNewsIds: []
  }
];

const STORAGE_KEY_USER = 'up_portal_current_user';
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

  getDemoUsers(): UserProfile[] {
    return [];
  },

  getCurrentUser(): UserProfile | null {
    try {
      const loggedOutFlag = localStorage.getItem('up_portal_user_logged_out');
      if (loggedOutFlag === 'true') {
        return null;
      }

      const stored = localStorage.getItem(STORAGE_KEY_USER);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Clear out old demo accounts if any were stored
        if (parsed?.id && ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7'].includes(parsed.id)) {
          localStorage.removeItem(STORAGE_KEY_USER);
          return null;
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error reading auth state:', e);
    }
    return null;
  },

  login(identifier: string, password?: string): { success: boolean; user?: UserProfile; error?: string; notRegistered?: boolean } {
    const cleanId = identifier.trim().toLowerCase();
    if (!cleanId) {
      return { success: false, error: 'कृपया पंजीकृत मोबाइल नंबर या ईमेल दर्ज करें।' };
    }

    const cleanPass = (password || '').trim();
    const isAdminIdentifier = cleanId === 'aftab.mohd9@gmail.com' || cleanId === 'admin';

    // If identifier is Admin, password is strictly mandatory!
    if (isAdminIdentifier) {
      if (!cleanPass) {
        return { 
          success: false, 
          error: 'प्रशासक लॉगिन हेतु पासवर्ड दर्ज करना अनिवार्य है।' 
        };
      }
      const validPasswords = ['1076', 'admin', 'uposn2026'];
      if (!validPasswords.includes(cleanPass.toLowerCase())) {
        return { 
          success: false, 
          error: 'अमान्य पासवर्ड! कृपया सही व्यवस्थापक पासवर्ड दर्ज करें।' 
        };
      }
      const admin = this.loginAsAdmin();
      return { success: true, user: admin };
    }

    // Check strictly in registered users
    const allUsers = this.getAllUsers();
    const cleanMobile = cleanId.replace(/\D/g, '');
    
    const found = allUsers.find(u => {
      const userMobile = (u.mobile || '').replace(/\D/g, '');
      if (cleanMobile.length === 10 && userMobile === cleanMobile) {
        return true;
      }
      if (u.email && u.email.toLowerCase() === cleanId) {
        return true;
      }
      return false;
    });

    if (found) {
      // Check Admin credentials if applicable
      if (found.email?.toLowerCase() === 'aftab.mohd9@gmail.com' || found.isAdmin) {
        if (!cleanPass) {
          return { success: false, error: 'प्रशासक लॉगिन हेतु पासवर्ड दर्ज करना अनिवार्य है।' };
        }
        if (!['1076', 'admin', 'uposn2026'].includes(cleanPass.toLowerCase())) {
          return { success: false, error: 'अमान्य पासवर्ड! कृपया सही व्यवस्थापक पासवर्ड दर्ज करें।' };
        }
        found.isAdmin = true;
        found.role = 'admin';
        sessionStorage.setItem('uposn_editor_auth', 'true');
        localStorage.setItem('uposn_admin_mode', 'true');
      } else if (found.password) {
        // If user configured a password during registration, verify it
        if (!cleanPass) {
          return { 
            success: false, 
            error: 'कृपया इस पंजीकृत खाते का पासवर्ड दर्ज करें।' 
          };
        }
        if (cleanPass !== found.password) {
          return { 
            success: false, 
            error: 'अमान्य पासवर्ड! कृपया सही पासवर्ड प्रविष्ट करें।' 
          };
        }
      }

      localStorage.removeItem('up_portal_user_logged_out');
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(found));
      notifyListeners(found);
      return { success: true, user: found };
    }

    // ONLY REGISTERED USERS CAN LOGIN:
    // Reject unregistered users and direct them to register first!
    return { 
      success: false, 
      notRegistered: true,
      error: 'यह मोबाइल नंबर / ईमेल पंजीकृत नहीं है। केवल पंजीकृत कर्मचारी ही लॉगिन कर सकते हैं। कृपया पहले नया पंजीकरण (Register) करें।' 
    };
  },

  isAdminUser(user?: UserProfile | null): boolean {
    if (sessionStorage.getItem('uposn_editor_auth') === 'true' || localStorage.getItem('uposn_admin_mode') === 'true') {
      return true;
    }
    if (!user) return false;
    if (user.isAdmin === true || user.role === 'admin') return true;
    if (user.email && user.email.toLowerCase() === 'aftab.mohd9@gmail.com') return true;
    return false;
  },

  verifyAdminPasskey(passkey: string): { success: boolean; user?: UserProfile; error?: string } {
    const clean = passkey.trim().toLowerCase();
    if (clean === '1076' || clean === 'admin' || clean === 'uposn2026' || clean === 'aftab.mohd9@gmail.com') {
      const admin = this.loginAsAdmin();
      return { success: true, user: admin };
    }
    return { 
      success: false, 
      error: 'गलत पासवर्ड! कृपया सही प्रशासक पासवर्ड प्रविष्ट करें।' 
    };
  },

  getAdminUser(): UserProfile {
    return {
      id: 'admin-aftab',
      name: 'आफताब मोहम्मद (Admin/Me)',
      mobile: '9876500000',
      email: 'aftab.mohd9@gmail.com',
      district: 'लखनऊ (Lucknow)',
      department: 'प्रशासनिक व संपादकीय सेल (UPOSN)',
      designation: 'मुख्य प्रशासक (Super Admin)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isVerified: true,
      isAdmin: true,
      role: 'admin',
      joinedDate: 'जनवरी 2024',
      savedPostIds: [],
      savedOrderIds: [],
      savedNewsIds: []
    };
  },

  loginAsAdmin(): UserProfile {
    const admin = this.getAdminUser();
    sessionStorage.setItem('uposn_editor_auth', 'true');
    localStorage.setItem('uposn_admin_mode', 'true');
    localStorage.removeItem('up_portal_user_logged_out');
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(admin));
    notifyListeners(admin);
    return admin;
  },

  quickLogin(userId: string): UserProfile {
    const allUsers = this.getAllUsers();
    const user = allUsers.find(u => u.id === userId) || this.getAdminUser();
    localStorage.removeItem('up_portal_user_logged_out');
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    notifyListeners(user);
    return user;
  },

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
      return { success: false, error: 'कृपया वैध 10 अंकों का मोबाइल नंबर दर्ज करें।' };
    }

    // Check if this mobile number or email is already registered
    const allUsers = this.getAllUsers();
    const existing = allUsers.find(u => {
      const userMobile = (u.mobile || '').replace(/\D/g, '');
      if (userMobile === cleanMobile) return true;
      if (userData.email && u.email && u.email.toLowerCase() === userData.email.trim().toLowerCase()) return true;
      return false;
    });

    if (existing) {
      return { 
        success: false, 
        error: 'यह मोबाइल नंबर या ईमेल पहले से पंजीकृत है। कृपया लॉगिन (Sign In) करें।' 
      };
    }

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: userData.name.trim(),
      mobile: cleanMobile,
      email: userData.email?.trim() || undefined,
      password: userData.password?.trim() || undefined,
      district: userData.district || 'लखनऊ (Lucknow)',
      department: userData.department || 'चिकित्सा स्वास्थ्य एवं परिवार कल्याण (Health Dept)',
      designation: userData.designation.trim() || 'डाटा एंट्री ऑपरेटर',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      isVerified: false,
      joinedDate: 'हाल ही में',
      savedPostIds: [],
      savedOrderIds: [],
      savedNewsIds: []
    };

    this.saveRegisteredUser(newUser);
    localStorage.removeItem('up_portal_user_logged_out');
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
    notifyListeners(newUser);
    return { success: true, user: newUser };
  },

  updateProfile(updates: Partial<UserProfile>): UserProfile | null {
    const current = this.getCurrentUser();
    if (!current) return null;

    const updated: UserProfile = {
      ...current,
      ...updates
    };

    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
    this.saveRegisteredUser(updated);
    notifyListeners(updated);
    return updated;
  },

  findUserByIdentifier(identifier: string): UserProfile | null {
    const cleanId = identifier.trim().toLowerCase();
    if (!cleanId) return null;
    const cleanMobile = cleanId.replace(/\D/g, '');
    const allUsers = this.getAllUsers();
    return allUsers.find(u => {
      const userMobile = (u.mobile || '').replace(/\D/g, '');
      if (cleanMobile.length === 10 && userMobile === cleanMobile) return true;
      if (u.email && u.email.toLowerCase() === cleanId) return true;
      return false;
    }) || null;
  },

  resetPassword(identifier: string, newPassword: string): { success: boolean; error?: string } {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = newPassword.trim();
    if (!cleanPass || cleanPass.length < 4) {
      return { success: false, error: 'पासवर्ड में कम से कम 4 अक्षर या अंक होने चाहिए।' };
    }

    const user = this.findUserByIdentifier(cleanId);
    if (!user) {
      return { 
        success: false, 
        error: 'यह मोबाइल नंबर / ईमेल पंजीकृत नहीं है। केवल पंजीकृत कर्मचारी ही पासवर्ड रीसेट कर सकते हैं।' 
      };
    }

    user.password = cleanPass;
    this.saveRegisteredUser(user);

    const current = this.getCurrentUser();
    if (current && current.id === user.id) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      notifyListeners(user);
    }

    return { success: true };
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem('uposn_admin_mode');
    sessionStorage.removeItem('uposn_editor_auth');
    localStorage.setItem('up_portal_user_logged_out', 'true');
    notifyListeners(null);
  },

  getAllUsers(): UserProfile[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ALL_USERS);
      if (stored) {
        const parsed: UserProfile[] = JSON.parse(stored);
        return parsed.filter(u => !['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7'].includes(u.id));
      }
    } catch (e) {
      console.error('Error reading all users:', e);
    }
    return [];
  },

  saveRegisteredUser(user: UserProfile) {
    try {
      const currentList = this.getAllUsers();
      const filtered = currentList.filter(u => u.id !== user.id);
      filtered.unshift(user);
      localStorage.setItem(STORAGE_KEY_ALL_USERS, JSON.stringify(filtered));
    } catch (e) {
      console.error('Error saving user:', e);
    }
  },

  toggleBookmark(type: 'post' | 'order' | 'news', id: string): boolean {
    const current = this.getCurrentUser();
    if (!current) return false;

    let savedList: string[] = [];
    if (type === 'post') {
      savedList = current.savedPostIds || [];
      const exists = savedList.includes(id);
      current.savedPostIds = exists ? savedList.filter(x => x !== id) : [...savedList, id];
    } else if (type === 'order') {
      savedList = current.savedOrderIds || [];
      const exists = savedList.includes(id);
      current.savedOrderIds = exists ? savedList.filter(x => x !== id) : [...savedList, id];
    } else if (type === 'news') {
      savedList = current.savedNewsIds || [];
      const exists = savedList.includes(id);
      current.savedNewsIds = exists ? savedList.filter(x => x !== id) : [...savedList, id];
    }

    this.updateProfile(current);
    return true;
  },

  subscribe(listener: AuthListener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }
};
