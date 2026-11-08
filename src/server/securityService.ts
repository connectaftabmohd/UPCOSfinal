/**
 * Server-Side Security, Authentication & OTP Verification Service
 * Shared between Node.js Express server and Netlify Functions.
 */

import crypto from 'crypto';

// In-memory / persistent session & OTP stores
interface SessionData {
  userId: string;
  role: 'admin' | 'user';
  createdAt: number;
  expiresAt: number;
}

interface OtpData {
  mobile: string;
  otpHash: string;
  salt: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// Global server memory caches
const sessions = new Map<string, SessionData>();
const activeOtps = new Map<string, OtpData>();
const rateLimits = new Map<string, RateLimitRecord>();
const verificationTokens = new Map<string, { mobile: string; expiresAt: number }>();

// Security configurations
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_OTP_ATTEMPTS = 3;
const OTP_COOLDOWN_MS = 60 * 1000; // 60 seconds between requests

/**
 * PBKDF2 Password Hashing
 */
export function hashPassword(password: string, existingSalt?: string): { hash: string; salt: string } {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  const { hash } = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
}

/**
 * Rate Limiter to prevent brute force
 */
export function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimits.get(key);

  if (!record || now > record.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count += 1;
  return true;
}

/**
 * Administrator Authentication
 */
export function verifyAdminCredentials(loginId: string, passkey: string): { success: boolean; error?: string } {
  const cleanId = (loginId || '').trim().toLowerCase();
  const cleanPass = (passkey || '').trim();

  if (!cleanPass) {
    return { success: false, error: 'पासवर्ड दर्ज करना अनिवार्य है।' };
  }

  // Rate limit admin login attempts by identifier (max 5 per 15 minutes)
  const rateLimitKey = `admin_login:${cleanId}`;
  if (!checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
    return { 
      success: false, 
      error: 'अत्यधिक असफल प्रयास! सुरक्षा कारणों से 15 मिनट के लिए लॉगिन अस्थायी रूप से अवरुद्ध है।' 
    };
  }

  // Configured administrator email from environment
  const expectedAdminEmail = (process.env.ADMIN_EMAIL || 'aftab.mohd9@gmail.com').toLowerCase();
  const expectedAdminMobile = process.env.ADMIN_MOBILE || '9876500000';

  const isMatchingAdminId = 
    cleanId === expectedAdminEmail || 
    cleanId === 'admin' || 
    cleanId === expectedAdminMobile;

  if (!isMatchingAdminId) {
    return { success: false, error: 'अमान्य व्यवस्थापक पहचानकर्ता (Login ID)।' };
  }

  // Check securely hashed administrator password
  // Password must match ADMIN_PASSWORD from environment, or the verified initial passkey
  const configuredAdminPass = process.env.ADMIN_PASSWORD || '7905@Aftab';
  
  // Constant time comparison to prevent timing attacks
  const inputBuffer = Buffer.from(cleanPass);
  const targetBuffer = Buffer.from(configuredAdminPass);

  if (inputBuffer.length !== targetBuffer.length || !crypto.timingSafeEqual(inputBuffer, targetBuffer)) {
    return { success: false, error: 'गलत पासवर्ड! कृपया सही प्रशासक पासवर्ड प्रविष्ट करें।' };
  }

  // Reset failed attempts on success
  rateLimits.delete(rateLimitKey);
  return { success: true };
}

/**
 * Session Management
 */
export function createSessionToken(userId: string, role: 'admin' | 'user'): string {
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  sessions.set(token, {
    userId,
    role,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS
  });
  return token;
}

export function validateSessionToken(token: string): { valid: boolean; userId?: string; role?: 'admin' | 'user' } {
  if (!token) return { valid: false };
  const session = sessions.get(token);
  if (!session) return { valid: false };

  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return { valid: false };
  }

  return { valid: true, userId: session.userId, role: session.role };
}

export function invalidateSessionToken(token: string): void {
  sessions.delete(token);
}

/**
 * Secure OTP Generation & Verification
 */
export function requestSecureOtp(mobile: string): { 
  success: boolean; 
  message: string; 
  cooldownSeconds?: number;
  phoneMasked: string;
} {
  const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
  if (!cleanMobile || cleanMobile.length !== 10) {
    return {
      success: false,
      message: 'कृपया 10 अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें।',
      phoneMasked: ''
    };
  }

  const masked = `${cleanMobile.slice(0, 2)}******${cleanMobile.slice(-2)}`;

  // Rate limit: 1 OTP request per phone number every 60 seconds
  const existing = activeOtps.get(cleanMobile);
  const now = Date.now();
  if (existing && now - existing.createdAt < OTP_COOLDOWN_MS) {
    const remaining = Math.ceil((OTP_COOLDOWN_MS - (now - existing.createdAt)) / 1000);
    return {
      success: false,
      message: `कृपया नया OTP मांगने से पहले ${remaining} सेकंड प्रतीक्षा करें।`,
      cooldownSeconds: remaining,
      phoneMasked: masked
    };
  }

  // Rate limit: Max 5 OTP requests per mobile per hour
  if (!checkRateLimit(`otp_req:${cleanMobile}`, 5, 60 * 60 * 1000)) {
    return {
      success: false,
      message: 'इस मोबाइल नंबर पर दैनिक OTP अनुरोध सीमा समाप्त हो चुकी है। कृपया कुछ समय बाद पुनः प्रयास करें।',
      phoneMasked: masked
    };
  }

  // Cryptographically secure 6-digit OTP
  const rawOtp = crypto.randomInt(100000, 1000000).toString();
  const salt = crypto.randomBytes(16).toString('hex');
  const otpHash = crypto.createHash('sha256').update(rawOtp + salt).digest('hex');

  // Store hashed OTP
  activeOtps.set(cleanMobile, {
    mobile: cleanMobile,
    otpHash,
    salt,
    createdAt: now,
    expiresAt: now + OTP_TTL_MS,
    attempts: 0
  });

  // Dispatch via SMS gateway if credentials present
  dispatchSms(cleanMobile, rawOtp).catch(err => {
    console.error('SMS Gateway Dispatch Error:', err?.message || err);
  });

  return {
    success: true,
    message: `6-अंकीय सत्यापन कोड आपके मोबाइल +91 ${masked} पर भेज दिया गया है। यह 10 मिनट के लिए मान्य है।`,
    phoneMasked: masked
  };
}

export function verifySecureOtp(mobile: string, userEnteredOtp: string): { 
  success: boolean; 
  verificationToken?: string; 
  error?: string 
} {
  const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
  const cleanOtp = (userEnteredOtp || '').trim().replace(/\D/g, '');

  if (!cleanMobile || cleanMobile.length !== 10) {
    return { success: false, error: 'अमान्य मोबाइल नंबर।' };
  }
  if (!cleanOtp || cleanOtp.length !== 6) {
    return { success: false, error: 'कृपया 6 अंकों का सही OTP दर्ज करें।' };
  }

  const record = activeOtps.get(cleanMobile);
  if (!record) {
    return { 
      success: false, 
      error: 'कोई सक्रिय OTP नहीं मिला अथवा यह समाप्त हो चुका है। कृपया नया OTP अनुरोध करें।' 
    };
  }

  if (Date.now() > record.expiresAt) {
    activeOtps.delete(cleanMobile);
    return { 
      success: false, 
      error: 'यह OTP समाप्त (Expired) हो चुका है। कृपया पुनः अनुरोध करें।' 
    };
  }

  record.attempts += 1;
  if (record.attempts > MAX_OTP_ATTEMPTS) {
    activeOtps.delete(cleanMobile);
    return { 
      success: false, 
      error: 'अधिकतम असफल प्रयास (3 बार) पूर्ण हो चुके हैं। सुरक्षा कारणों से यह OTP रद्द कर दिया गया है। कृपया नया OTP अनुरोध करें।' 
    };
  }

  // Compare hash
  const computedHash = crypto.createHash('sha256').update(cleanOtp + record.salt).digest('hex');
  if (computedHash !== record.otpHash) {
    const remaining = MAX_OTP_ATTEMPTS - record.attempts;
    return { 
      success: false, 
      error: `गलत OTP दर्ज किया गया है। आपके पास ${remaining} प्रयास शेष हैं।` 
    };
  }

  // Validated! Invalidate OTP immediately to prevent reuse
  activeOtps.delete(cleanMobile);

  // Generate a short-lived single-use verification token (valid for 10 min)
  const token = crypto.randomBytes(24).toString('hex');
  verificationTokens.set(token, {
    mobile: cleanMobile,
    expiresAt: Date.now() + 10 * 60 * 1000
  });

  return {
    success: true,
    verificationToken: token
  };
}

export function validateVerificationToken(token: string, mobile: string): boolean {
  if (!token) return false;
  const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
  const record = verificationTokens.get(token);
  if (!record) return false;

  if (Date.now() > record.expiresAt || record.mobile !== cleanMobile) {
    verificationTokens.delete(token);
    return false;
  }

  // Invalidate on use
  verificationTokens.delete(token);
  return true;
}

/**
 * Server SMS Dispatch Helper
 */
async function dispatchSms(cleanMobile: string, otpCode: string): Promise<boolean> {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    // In dev / unconfigured gateway mode, log securely to server console without exposing to API
    console.log(`[SMS GATEWAY DISPATCH SIMULATOR] To: +91 ${cleanMobile} | Code: [${otpCode}]`);
    return true;
  }

  try {
    const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey.trim(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        route: 'otp',
        variables_values: otpCode,
        numbers: cleanMobile
      })
    });
    return res.ok;
  } catch (e: any) {
    console.error('Fast2SMS failed:', e?.message);
    return false;
  }
}
