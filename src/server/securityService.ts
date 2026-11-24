/**
 * Server-Side Security, Authentication & OTP Verification Service
 * Shared between Node.js Express server and Netlify Functions.
 */

import crypto from 'crypto';
import { dbService } from './dbService';
import { supabaseService } from './supabaseService';

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

// Runtime session signing secret (reads process.env with a per-process CSPRNG fallback)
const SESSION_SIGNING_KEY =
  (process.env.SESSION_SECRET && process.env.SESSION_SECRET.trim()) ||
  crypto.randomBytes(32).toString('hex');

// In-memory rate limits, OTP attempts, and single-use revocation / replay guards
const activeOtps = new Map<string, OtpData>();
const rateLimits = new Map<string, RateLimitRecord>();
const revokedTokenIds = new Set<string>();
const consumedChallengeIds = new Set<string>();

// Security configurations
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_OTP_ATTEMPTS = 3;
const OTP_COOLDOWN_MS = 60 * 1000; // 60 seconds between requests

/**
 * Signed Stateless Token Helpers (HMAC-SHA256)
 */
function signTokenPayload<T extends object>(payload: T): string {
  const encoded = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
  const sig = crypto
    .createHmac('sha256', SESSION_SIGNING_KEY)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${sig}`;
}

function verifyTokenPayload<T>(token: string): T | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  if (!encoded || !sig) return null;

  const expectedSig = crypto
    .createHmac('sha256', SESSION_SIGNING_KEY)
    .update(encoded)
    .digest('base64url');

  const sigBuf = Buffer.from(sig, 'utf-8');
  const expectedBuf = Buffer.from(expectedSig, 'utf-8');
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8')) as T;
  } catch {
    return null;
  }
}

/**
 * Scrypt / PBKDF2 Password Hashing
 */
export function hashPassword(password: string, existingSalt?: string): { hash: string; salt: string } {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  if (!password || !storedHash || !salt) return false;
  // Support verifying both legacy 10k-iter hashes and 100k-iter hashes cleanly
  const derived100k = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  const storedBuf = Buffer.from(storedHash, 'hex');
  const buf100k = Buffer.from(derived100k, 'hex');
  if (buf100k.length === storedBuf.length && crypto.timingSafeEqual(buf100k, storedBuf)) {
    return true;
  }
  const derived10k = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  const buf10k = Buffer.from(derived10k, 'hex');
  return buf10k.length === storedBuf.length && crypto.timingSafeEqual(buf10k, storedBuf);
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
 * Admin Identifier Helper
 */
export function isAdminIdentifier(loginId: string): boolean {
  const cleanId = (loginId || '').trim().toLowerCase();
  const cleanDigits = cleanId.replace(/\D/g, '').slice(-10);
  const expectedAdminEmail = (process.env.ADMIN_EMAIL || 'aftab.mohd9@gmail.com').toLowerCase();
  const expectedAdminMobile = (process.env.ADMIN_MOBILE || '9876500000').replace(/\D/g, '').slice(-10);

  return (
    cleanId === expectedAdminEmail ||
    cleanId === 'admin' ||
    (cleanDigits.length === 10 && cleanDigits === expectedAdminMobile)
  );
}

async function resolveAdminCredential() {
  const local = dbService.getAdminCredential();
  if (local) return local;
  if (supabaseService.isConfigured()) {
    const remote = await supabaseService.getAdminCredential();
    if (remote) {
      dbService.setAdminCredential(remote);
      return remote;
    }
  }
  return undefined;
}

export async function isAdminSetupRequiredAsync(): Promise<boolean> {
  const envPass = process.env.ADMIN_PASSWORD?.trim();
  if (envPass) return false;
  const cred = await resolveAdminCredential();
  return !cred;
}

/**
 * Check if initial first-run admin password setup is needed (sync fallback)
 */
export function isAdminSetupRequired(): boolean {
  const envPass = process.env.ADMIN_PASSWORD?.trim();
  if (envPass) return false;
  const savedCred = dbService.getAdminCredential();
  return !savedCred;
}

/**
 * First-run atomic admin password claim (locks itself once claimed or when ADMIN_PASSWORD env is set)
 */
export async function setupInitialAdminPasswordAsync(
  loginId: string,
  passkey: string
): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdminSetupRequiredAsync())) {
    return {
      success: false,
      error: 'प्रशासक पासवर्ड पहले से सेट है। कृपया लॉगिन करें।'
    };
  }

  const cleanId = (loginId || 'admin').trim().toLowerCase();
  if (!isAdminIdentifier(cleanId)) {
    return { success: false, error: 'अमान्य व्यवस्थापक पहचानकर्ता (Login ID)।' };
  }

  const cleanPass = (passkey || '').trim();
  if (cleanPass.length < 6) {
    return {
      success: false,
      error: 'प्रशासक पासवर्ड कम से कम 6 अक्षरों/अंकों का होना अनिवार्य है।'
    };
  }

  const expectedAdminEmail = (process.env.ADMIN_EMAIL || 'aftab.mohd9@gmail.com').toLowerCase();
  const { hash, salt } = hashPassword(cleanPass);
  const record = {
    email: expectedAdminEmail,
    hash,
    salt,
    updatedAt: new Date().toISOString()
  };
  dbService.setAdminCredential(record);
  if (supabaseService.isConfigured()) {
    await supabaseService.setAdminCredential(record);
  }

  return { success: true };
}

export function setupInitialAdminPassword(
  loginId: string,
  passkey: string
): { success: boolean; error?: string } {
  if (!isAdminSetupRequired()) {
    return {
      success: false,
      error: 'प्रशासक पासवर्ड पहले से सेट है। कृपया लॉगिन करें।'
    };
  }

  const cleanId = (loginId || 'admin').trim().toLowerCase();
  if (!isAdminIdentifier(cleanId)) {
    return { success: false, error: 'अमान्य व्यवस्थापक पहचानकर्ता (Login ID)।' };
  }

  const cleanPass = (passkey || '').trim();
  if (cleanPass.length < 6) {
    return {
      success: false,
      error: 'प्रशासक पासवर्ड कम से कम 6 अक्षरों/अंकों का होना अनिवार्य है।'
    };
  }

  const expectedAdminEmail = (process.env.ADMIN_EMAIL || 'aftab.mohd9@gmail.com').toLowerCase();
  const { hash, salt } = hashPassword(cleanPass);
  dbService.setAdminCredential({
    email: expectedAdminEmail,
    hash,
    salt,
    updatedAt: new Date().toISOString()
  });

  return { success: true };
}

/**
 * Administrator Authentication (Async Supabase-aware + Sync)
 */
export async function verifyAdminCredentialsAsync(
  loginId: string,
  passkey: string
): Promise<{ success: boolean; needsSetup?: boolean; error?: string }> {
  const cleanId = (loginId || '').trim().toLowerCase();
  const cleanPass = (passkey || '').trim();

  if (!isAdminIdentifier(cleanId)) {
    return { success: false, error: 'अमान्य व्यवस्थापक पहचानकर्ता (Login ID)।' };
  }

  if (await isAdminSetupRequiredAsync()) {
    return {
      success: false,
      needsSetup: true,
      error: 'प्रशासक पासवर्ड अभी सेट नहीं है। कृपया पहले नया प्रशासक पासवर्ड सेट करें।'
    };
  }

  if (!cleanPass) {
    return { success: false, error: 'पासवर्ड दर्ज करना अनिवार्य है।' };
  }

  const rateLimitKey = `admin_login:${cleanId}`;
  if (!checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
    return {
      success: false,
      error: 'अत्यधिक असफल प्रयास! सुरक्षा कारणों से 15 मिनट के लिए लॉगिन अस्थायी रूप से अवरुद्ध है।'
    };
  }

  const envAdminPass = process.env.ADMIN_PASSWORD?.trim();
  if (envAdminPass) {
    const inputDigest = crypto.createHash('sha256').update(cleanPass).digest();
    const targetDigest = crypto.createHash('sha256').update(envAdminPass).digest();
    if (!crypto.timingSafeEqual(inputDigest, targetDigest)) {
      return { success: false, error: 'गलत पासवर्ड! कृपया सही प्रशासक पासवर्ड प्रविष्ट करें।' };
    }
    rateLimits.delete(rateLimitKey);
    return { success: true };
  }

  const savedCred = await resolveAdminCredential();
  if (!savedCred || !verifyPassword(cleanPass, savedCred.hash, savedCred.salt)) {
    return { success: false, error: 'गलत पासवर्ड! कृपया सही प्रशासक पासवर्ड प्रविष्ट करें।' };
  }

  rateLimits.delete(rateLimitKey);
  return { success: true };
}

export function verifyAdminCredentials(
  loginId: string,
  passkey: string
): { success: boolean; needsSetup?: boolean; error?: string } {
  const cleanId = (loginId || '').trim().toLowerCase();
  const cleanPass = (passkey || '').trim();

  if (!isAdminIdentifier(cleanId)) {
    return { success: false, error: 'अमान्य व्यवस्थापक पहचानकर्ता (Login ID)।' };
  }

  if (isAdminSetupRequired()) {
    return {
      success: false,
      needsSetup: true,
      error: 'प्रशासक पासवर्ड अभी सेट नहीं है। कृपया पहले नया प्रशासक पासवर्ड सेट करें।'
    };
  }

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

  // 1. Environment variable passcode always takes precedence when configured
  const envAdminPass = process.env.ADMIN_PASSWORD?.trim();
  if (envAdminPass) {
    const inputDigest = crypto.createHash('sha256').update(cleanPass).digest();
    const targetDigest = crypto.createHash('sha256').update(envAdminPass).digest();
    if (!crypto.timingSafeEqual(inputDigest, targetDigest)) {
      return { success: false, error: 'गलत पासवर्ड! कृपया सही प्रशासक पासवर्ड प्रविष्ट करें।' };
    }
    rateLimits.delete(rateLimitKey);
    return { success: true };
  }

  // 2. Otherwise verify against server-stored salted hash
  const savedCred = dbService.getAdminCredential();
  if (!savedCred || !verifyPassword(cleanPass, savedCred.hash, savedCred.salt)) {
    return { success: false, error: 'गलत पासवर्ड! कृपया सही प्रशासक पासवर्ड प्रविष्ट करें।' };
  }

  rateLimits.delete(rateLimitKey);
  return { success: true };
}

/**
 * Session Management (Stateless HMAC-SHA256 Signed Tokens + Revocation List)
 */
interface SignedSessionPayload {
  jti: string;
  userId: string;
  role: 'admin' | 'user';
  iat: number;
  exp: number;
}

export function createSessionToken(userId: string, role: 'admin' | 'user'): string {
  const now = Date.now();
  const payload: SignedSessionPayload = {
    jti: crypto.randomBytes(16).toString('hex'),
    userId,
    role,
    iat: now,
    exp: now + SESSION_TTL_MS
  };
  return signTokenPayload(payload);
}

export function validateSessionToken(token: string): { valid: boolean; userId?: string; role?: 'admin' | 'user' } {
  const payload = verifyTokenPayload<SignedSessionPayload>(token);
  if (!payload || !payload.userId || !payload.role || !payload.jti) {
    return { valid: false };
  }
  if (revokedTokenIds.has(payload.jti)) {
    return { valid: false };
  }
  if (Date.now() > payload.exp) {
    return { valid: false };
  }
  return { valid: true, userId: payload.userId, role: payload.role };
}

export function invalidateSessionToken(token: string): void {
  const payload = verifyTokenPayload<SignedSessionPayload>(token);
  if (payload?.jti) {
    revokedTokenIds.add(payload.jti);
  }
}

/**
 * Check if an SMS/OTP gateway is configured
 */
export function isOtpGatewayConfigured(): boolean {
  return Boolean(process.env.FAST2SMS_API_KEY && process.env.FAST2SMS_API_KEY.trim() !== '');
}

/**
 * Secure OTP Generation & Verification
 */
interface SignedOtpChallenge {
  jti: string;
  mobile: string;
  otpHash: string;
  salt: string;
  exp: number;
}

interface SignedVerificationToken {
  jti: string;
  mobile: string;
  purpose: 'otp_verified';
  exp: number;
}

export async function requestSecureOtp(mobile: string): Promise<{
  success: boolean;
  message: string;
  cooldownSeconds?: number;
  gatewayNotConfigured?: boolean;
  otpChallenge?: string;
  phoneMasked: string;
}> {
  const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
  if (!cleanMobile || cleanMobile.length !== 10) {
    return {
      success: false,
      message: 'कृपया 10 अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें।',
      phoneMasked: ''
    };
  }

  const masked = `${cleanMobile.slice(0, 2)}******${cleanMobile.slice(-2)}`;

  if (!isOtpGatewayConfigured()) {
    return {
      success: false,
      gatewayNotConfigured: true,
      message:
        'SMS OTP गेटवे (FAST2SMS_API_KEY) अभी सर्वर पर सक्रिय नहीं है। कृपया पासवर्ड से लॉगिन करें अथवा व्यवस्थापक से OTP सेवा सक्रिय करने को कहें।',
      phoneMasked: masked
    };
  }

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

  // Store hashed OTP in local cache & also produce a stateless signed challenge (contains NO plaintext OTP)
  activeOtps.set(cleanMobile, {
    mobile: cleanMobile,
    otpHash,
    salt,
    createdAt: now,
    expiresAt: now + OTP_TTL_MS,
    attempts: 0
  });

  const sent = await dispatchSms(cleanMobile, rawOtp);
  if (!sent) {
    activeOtps.delete(cleanMobile);
    return {
      success: false,
      message: 'SMS गेटवे से OTP भेजने में तकनीकी त्रुटि आई। कृपया थोड़ी देर बाद पुनः प्रयास करें।',
      phoneMasked: masked
    };
  }

  const otpChallenge = signTokenPayload<SignedOtpChallenge>({
    jti: crypto.randomBytes(16).toString('hex'),
    mobile: cleanMobile,
    otpHash,
    salt,
    exp: now + OTP_TTL_MS
  });

  return {
    success: true,
    otpChallenge,
    message: `6-अंकीय सत्यापन कोड आपके मोबाइल +91 ${masked} पर SMS द्वारा भेज दिया गया है। यह 10 मिनट के लिए मान्य है।`,
    phoneMasked: masked
  };
}

export function verifySecureOtp(
  mobile: string,
  userEnteredOtp: string,
  otpChallenge?: string
): {
  success: boolean;
  verificationToken?: string;
  error?: string;
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
  if (record) {
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
        error:
          'अधिकतम असफल प्रयास (3 बार) पूर्ण हो चुके हैं। सुरक्षा कारणों से यह OTP रद्द कर दिया गया है। कृपया नया OTP अनुरोध करें।'
      };
    }

    const computedHash = crypto.createHash('sha256').update(cleanOtp + record.salt).digest('hex');
    const a = Buffer.from(computedHash, 'hex');
    const b = Buffer.from(record.otpHash, 'hex');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      const remaining = MAX_OTP_ATTEMPTS - record.attempts;
      return {
        success: false,
        error: `गलत OTP दर्ज किया गया है। आपके पास ${remaining} प्रयास शेष हैं।`
      };
    }

    activeOtps.delete(cleanMobile);
  } else if (otpChallenge) {
    // Stateless serverless fallback using signed salted-hash challenge
    const challenge = verifyTokenPayload<SignedOtpChallenge>(otpChallenge);
    if (
      !challenge ||
      challenge.mobile !== cleanMobile ||
      Date.now() > challenge.exp ||
      consumedChallengeIds.has(challenge.jti)
    ) {
      return {
        success: false,
        error: 'कोई सक्रिय OTP नहीं मिला अथवा यह समाप्त हो चुका है। कृपया नया OTP अनुरोध करें।'
      };
    }

    if (!checkRateLimit(`otp_verify:${challenge.jti}`, MAX_OTP_ATTEMPTS, OTP_TTL_MS)) {
      consumedChallengeIds.add(challenge.jti);
      return {
        success: false,
        error:
          'अधिकतम असफल प्रयास पूर्ण हो चुके हैं। सुरक्षा कारणों से यह OTP रद्द कर दिया गया है। कृपया नया OTP अनुरोध करें।'
      };
    }

    const computedHash = crypto.createHash('sha256').update(cleanOtp + challenge.salt).digest('hex');
    const a = Buffer.from(computedHash, 'hex');
    const b = Buffer.from(challenge.otpHash, 'hex');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return {
        success: false,
        error: 'गलत OTP दर्ज किया गया है। कृपया सही 6-अंकीय कोड दर्ज करें।'
      };
    }

    consumedChallengeIds.add(challenge.jti);
  } else {
    return {
      success: false,
      error: 'कोई सक्रिय OTP नहीं मिला अथवा यह समाप्त हो चुका है। कृपया नया OTP अनुरोध करें।'
    };
  }

  // Generate a short-lived signed single-use verification token (valid for 10 min)
  const verificationToken = signTokenPayload<SignedVerificationToken>({
    jti: crypto.randomBytes(16).toString('hex'),
    mobile: cleanMobile,
    purpose: 'otp_verified',
    exp: Date.now() + 10 * 60 * 1000
  });

  return {
    success: true,
    verificationToken
  };
}

export function validateVerificationToken(token: string, mobile: string): boolean {
  if (!token) return false;
  const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
  const payload = verifyTokenPayload<SignedVerificationToken>(token);
  if (
    !payload ||
    payload.purpose !== 'otp_verified' ||
    payload.mobile !== cleanMobile ||
    Date.now() > payload.exp ||
    consumedChallengeIds.has(payload.jti)
  ) {
    return false;
  }

  consumedChallengeIds.add(payload.jti);
  return true;
}

/**
 * HTTP Auth Cookie & Bearer Extraction Helpers
 */
export function extractSessionToken(headers: Record<string, string | string[] | undefined>): string {
  const rawAuth = (headers['authorization'] || headers['Authorization'] || '') as string;
  if (typeof rawAuth === 'string' && /^Bearer\s+/i.test(rawAuth)) {
    return rawAuth.replace(/^Bearer\s+/i, '').trim();
  }

  const rawCookie = (headers['cookie'] || headers['Cookie'] || '') as string;
  if (typeof rawCookie === 'string' && rawCookie.length > 0) {
    for (const part of rawCookie.split(';')) {
      const idx = part.indexOf('=');
      if (idx > 0) {
        const key = part.slice(0, idx).trim();
        const val = part.slice(idx + 1).trim();
        if (key === 'uposn_session' && val) {
          return decodeURIComponent(val);
        }
      }
    }
  }

  return '';
}

export function buildSessionCookieHeader(token: string, isHttps: boolean): string {
  const maxAge = Math.floor(SESSION_TTL_MS / 1000);
  if (isHttps) {
    return `uposn_session=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${maxAge}; Secure; SameSite=None; Partitioned`;
  }
  return `uposn_session=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

export function clearSessionCookieHeader(isHttps: boolean): string {
  if (isHttps) {
    return 'uposn_session=; HttpOnly; Path=/; Max-Age=0; Secure; SameSite=None; Partitioned';
  }
  return 'uposn_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax';
}

export function isRequestOriginAllowed(headers: Record<string, string | string[] | undefined>): boolean {
  const rawAuth = (headers['authorization'] || headers['Authorization'] || '') as string;
  // Bearer-authenticated requests aren't CSRF-vulnerable via ambient cookies
  if (typeof rawAuth === 'string' && /^Bearer\s+\S+/i.test(rawAuth)) {
    return true;
  }
  const origin = (headers['origin'] || headers['Origin'] || '') as string;
  if (!origin) return true; // Same-origin/non-browser calls without Origin header
  const host = ((headers['x-forwarded-host'] || headers['host'] || headers['Host'] || '') as string)
    .split(',')[0]
    .trim()
    .toLowerCase();
  if (!host) return true;
  try {
    const parsedOrigin = new URL(origin);
    return parsedOrigin.host.toLowerCase() === host;
  } catch {
    return false;
  }
}

/**
 * Server SMS Dispatch Helper
 */
async function dispatchSms(cleanMobile: string, otpCode: string): Promise<boolean> {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return false;
  }

  try {
    const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        authorization: apiKey.trim(),
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
