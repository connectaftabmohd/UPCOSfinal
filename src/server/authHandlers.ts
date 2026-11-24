/**
 * Shared Server Authentication & OTP Route Handlers
 * Used identically by Express (server.ts) and Netlify Functions (netlify/functions/api.ts).
 */

import { dbService, StoredUserRecord } from './dbService';
import { supabaseService } from './supabaseService';
import {
  buildSessionCookieHeader,
  checkRateLimit,
  clearSessionCookieHeader,
  createSessionToken,
  extractSessionToken,
  hashPassword,
  invalidateSessionToken,
  isAdminIdentifier,
  isAdminSetupRequiredAsync,
  isOtpGatewayConfigured,
  isRequestOriginAllowed,
  requestSecureOtp,
  setupInitialAdminPasswordAsync,
  validateSessionToken,
  validateVerificationToken,
  verifyAdminCredentialsAsync,
  verifyPassword,
  verifySecureOtp
} from './securityService';

export interface AuthRouteRequest {
  body: Record<string, any>;
  headers: Record<string, string | string[] | undefined>;
  isHttps: boolean;
}

export interface AuthRouteResponse {
  status: number;
  cookie?: string;
  body: Record<string, any>;
}

const ADMIN_PUBLIC_PROFILE = {
  id: 'admin-aftab',
  name: 'आफताब मोहम्मद (Admin)',
  email: process.env.ADMIN_EMAIL || 'aftab.mohd9@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'admin' as const,
  isAdmin: true,
  isVerified: true,
  district: 'लखनऊ (Lucknow)',
  department: 'प्रशासनिक व संपादकीय सेल (UPOSN)',
  designation: 'मुख्य प्रशासक (Super Admin)',
  joinedDate: 'जनवरी 2024'
};

async function findUserAnyStore(identifier: string): Promise<StoredUserRecord | undefined> {
  if (supabaseService.isConfigured()) {
    const remote = await supabaseService.findUserByIdentifier(identifier);
    if (remote) return remote;
  }
  return dbService.findUserByIdentifier(identifier);
}

async function findUserByIdAnyStore(id: string): Promise<StoredUserRecord | undefined> {
  if (supabaseService.isConfigured()) {
    const remote = await supabaseService.findUserById(id);
    if (remote) return remote;
  }
  return dbService.findUserById(id);
}

async function createUserAnyStore(user: StoredUserRecord): Promise<StoredUserRecord> {
  dbService.createUser(user);
  if (supabaseService.isConfigured()) {
    await supabaseService.createUser(user);
  }
  return user;
}

async function updateUserAnyStore(
  id: string,
  updates: Partial<StoredUserRecord>
): Promise<StoredUserRecord | undefined> {
  const localUpdated = dbService.updateUser(id, updates);
  if (supabaseService.isConfigured()) {
    const remoteUpdated = await supabaseService.updateUser(id, updates);
    if (remoteUpdated) return remoteUpdated;
  }
  return localUpdated;
}

export async function handleAdminStatus(): Promise<AuthRouteResponse> {
  return {
    status: 200,
    body: {
      needsSetup: await isAdminSetupRequiredAsync(),
      otpConfigured: isOtpGatewayConfigured(),
      supabaseAuthConfigured: supabaseService.isConfigured()
    }
  };
}

export async function handleAdminSetup(req: AuthRouteRequest): Promise<AuthRouteResponse> {
  if (!isRequestOriginAllowed(req.headers)) {
    return { status: 403, body: { success: false, error: 'Forbidden origin' } };
  }
  const { loginId, passkey } = req.body || {};
  const result = await setupInitialAdminPasswordAsync(loginId || 'admin', passkey || '');
  if (!result.success) {
    return { status: 400, body: { success: false, error: result.error } };
  }
  const token = createSessionToken('admin-aftab', 'admin');
  return {
    status: 200,
    cookie: buildSessionCookieHeader(token, req.isHttps),
    body: {
      success: true,
      token,
      user: ADMIN_PUBLIC_PROFILE
    }
  };
}

export async function handleAdminLogin(req: AuthRouteRequest): Promise<AuthRouteResponse> {
  if (!isRequestOriginAllowed(req.headers)) {
    return { status: 403, body: { success: false, error: 'Forbidden origin' } };
  }
  const { loginId, passkey } = req.body || {};
  const verifyRes = await verifyAdminCredentialsAsync(loginId || '', passkey || '');
  if (!verifyRes.success) {
    return {
      status: verifyRes.needsSetup ? 409 : 401,
      body: {
        success: false,
        needsSetup: Boolean(verifyRes.needsSetup),
        error: verifyRes.error
      }
    };
  }
  const token = createSessionToken('admin-aftab', 'admin');
  return {
    status: 200,
    cookie: buildSessionCookieHeader(token, req.isHttps),
    body: {
      success: true,
      token,
      user: ADMIN_PUBLIC_PROFILE
    }
  };
}

export function handleAdminVerify(req: AuthRouteRequest): AuthRouteResponse {
  const token = extractSessionToken(req.headers);
  const session = validateSessionToken(token);
  if (!session.valid || session.role !== 'admin') {
    return { status: 401, body: { valid: false, error: 'Unauthorized or expired session' } };
  }
  return {
    status: 200,
    body: {
      valid: true,
      token,
      user: ADMIN_PUBLIC_PROFILE
    }
  };
}

export async function handleAuthVerify(req: AuthRouteRequest): Promise<AuthRouteResponse> {
  const token = extractSessionToken(req.headers);
  const session = validateSessionToken(token);
  if (!session.valid || !session.userId || !session.role) {
    return { status: 401, body: { valid: false, error: 'Unauthorized or expired session' } };
  }

  if (session.role === 'admin') {
    return {
      status: 200,
      body: {
        valid: true,
        token,
        user: ADMIN_PUBLIC_PROFILE
      }
    };
  }

  const stored = await findUserByIdAnyStore(session.userId);
  if (!stored) {
    return {
      status: 200,
      body: {
        valid: true,
        token,
        userId: session.userId,
        role: session.role
      }
    };
  }

  return {
    status: 200,
    body: {
      valid: true,
      token,
      user: dbService.toSafeUserProfile(stored)
    }
  };
}

export function handleLogout(req: AuthRouteRequest): AuthRouteResponse {
  if (!isRequestOriginAllowed(req.headers)) {
    return { status: 403, body: { success: false, error: 'Forbidden origin' } };
  }
  const token = extractSessionToken(req.headers);
  if (token) {
    invalidateSessionToken(token);
  }
  return {
    status: 200,
    cookie: clearSessionCookieHeader(req.isHttps),
    body: { success: true }
  };
}

export async function handleAuthRegister(req: AuthRouteRequest): Promise<AuthRouteResponse> {
  if (!isRequestOriginAllowed(req.headers)) {
    return { status: 403, body: { success: false, error: 'Forbidden origin' } };
  }
  const { name, mobile, email, district, department, designation, password } = req.body || {};
  const cleanName = typeof name === 'string' ? name.trim() : '';
  const cleanMobile = typeof mobile === 'string' ? mobile.replace(/\D/g, '').slice(-10) : '';
  const cleanEmail = typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : undefined;
  const cleanPassword = typeof password === 'string' ? password.trim() : '';

  if (cleanName.length < 2) {
    return { status: 400, body: { success: false, error: 'कृपया पूरा नाम दर्ज करें।' } };
  }
  if (cleanMobile.length !== 10) {
    return { status: 400, body: { success: false, error: 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।' } };
  }
  if (cleanPassword.length < 4) {
    return { status: 400, body: { success: false, error: 'कृपया कम से कम 4 अक्षरों/अंकों का पासवर्ड बनाएं।' } };
  }
  if (isAdminIdentifier(cleanMobile) || (cleanEmail && isAdminIdentifier(cleanEmail))) {
    return { status: 400, body: { success: false, error: 'यह पहचानकर्ता आरक्षित है।' } };
  }

  if (await findUserAnyStore(cleanMobile)) {
    return { status: 409, body: { success: false, error: 'यह मोबाइल नंबर पहले से पंजीकृत है। कृपया लॉगिन करें।' } };
  }
  if (cleanEmail && (await findUserAnyStore(cleanEmail))) {
    return { status: 409, body: { success: false, error: 'यह ईमेल पहले से पंजीकृत है। कृपया लॉगिन करें।' } };
  }

  const { hash, salt } = hashPassword(cleanPassword);
  const newUser: StoredUserRecord = {
    id: `usr-${Date.now()}`,
    name: cleanName,
    mobile: cleanMobile,
    email: cleanEmail,
    passwordHash: hash,
    salt,
    district: typeof district === 'string' && district.trim() ? district.trim() : 'लखनऊ (Lucknow)',
    department:
      typeof department === 'string' && department.trim()
        ? department.trim()
        : 'चिकित्सा स्वास्थ्य एवं परिवार कल्याण (Health Dept)',
    designation: typeof designation === 'string' && designation.trim() ? designation.trim() : 'डाटा एंट्री ऑपरेटर',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    isVerified: false,
    role: 'user',
    joinedDate: 'हाल ही में'
  };

  await createUserAnyStore(newUser);

  // Sync optional email+password registration with Supabase Auth if configured
  if (cleanEmail && cleanPassword.length >= 6 && supabaseService.isConfigured()) {
    await supabaseService.signUpWithEmailPassword(cleanEmail, cleanPassword, {
      name: newUser.name,
      mobile: newUser.mobile,
      district: newUser.district,
      department: newUser.department,
      designation: newUser.designation
    });
  }

  const token = createSessionToken(newUser.id, 'user');
  return {
    status: 201,
    cookie: buildSessionCookieHeader(token, req.isHttps),
    body: {
      success: true,
      token,
      user: dbService.toSafeUserProfile(newUser)
    }
  };
}

export async function handleAuthLogin(req: AuthRouteRequest): Promise<AuthRouteResponse> {
  if (!isRequestOriginAllowed(req.headers)) {
    return { status: 403, body: { success: false, error: 'Forbidden origin' } };
  }
  const { identifier, password } = req.body || {};
  const cleanId = typeof identifier === 'string' ? identifier.trim().toLowerCase() : '';
  const cleanPass = typeof password === 'string' ? password.trim() : '';

  if (!cleanId) {
    return { status: 400, body: { success: false, error: 'कृपया पंजीकृत मोबाइल नंबर या ईमेल दर्ज करें।' } };
  }

  if (isAdminIdentifier(cleanId)) {
    return handleAdminLogin({
      body: { loginId: cleanId, passkey: cleanPass },
      headers: req.headers,
      isHttps: req.isHttps
    });
  }

  if (!checkRateLimit(`user_login:${cleanId}`, 10, 15 * 60 * 1000)) {
    return {
      status: 429,
      body: { success: false, error: 'अत्यधिक असफल प्रयास! कृपया कुछ मिनट बाद पुनः प्रयास करें।' }
    };
  }

  if (!cleanPass) {
    return {
      status: 400,
      body: { success: false, error: 'कृपया अपना पासवर्ड दर्ज करें।' }
    };
  }

  const found = await findUserAnyStore(cleanId);
  if (found) {
    if (!found.passwordHash || !found.salt || !verifyPassword(cleanPass, found.passwordHash, found.salt)) {
      return {
        status: 401,
        body: { success: false, error: 'अमान्य पासवर्ड! कृपया सही पासवर्ड दर्ज करें।' }
      };
    }

    const token = createSessionToken(found.id, found.role || 'user');
    return {
      status: 200,
      cookie: buildSessionCookieHeader(token, req.isHttps),
      body: {
        success: true,
        token,
        user: dbService.toSafeUserProfile(found)
      }
    };
  }

  // Fallback: check Supabase Auth directly if identifier is an email
  if (cleanId.includes('@') && supabaseService.isConfigured()) {
    const sbAuth = await supabaseService.signInWithEmailPassword(cleanId, cleanPass);
    if (sbAuth.success && sbAuth.supabaseUserId) {
      const meta = sbAuth.userMetadata || {};
      const syncedUser: StoredUserRecord = {
        id: `sb-${sbAuth.supabaseUserId}`,
        name: meta.name || cleanId.split('@')[0],
        mobile: meta.mobile || '',
        email: sbAuth.email || cleanId,
        district: meta.district || 'लखनऊ (Lucknow)',
        department: meta.department || 'चिकित्सा स्वास्थ्य एवं परिवार कल्याण (Health Dept)',
        designation: meta.designation || 'आउटसोर्सिंग कर्मचारी',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        isVerified: true,
        role: 'user',
        joinedDate: 'हाल ही में'
      };
      await createUserAnyStore(syncedUser);
      const token = createSessionToken(syncedUser.id, 'user');
      return {
        status: 200,
        cookie: buildSessionCookieHeader(token, req.isHttps),
        body: {
          success: true,
          token,
          user: dbService.toSafeUserProfile(syncedUser)
        }
      };
    }
  }

  return {
    status: 404,
    body: {
      success: false,
      notRegistered: true,
      error: 'यह खाता पंजीकृत नहीं है। कृपया पहले नया पंजीकरण करें।'
    }
  };
}

export async function handleEmailOtpRequest(req: AuthRouteRequest): Promise<AuthRouteResponse> {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      status: 400,
      body: { success: false, message: 'कृपया एक मान्य ईमेल पता दर्ज करें।' }
    };
  }
  if (isAdminIdentifier(email)) {
    return {
      status: 403,
      body: { success: false, message: 'प्रशासक खाता ईमेल OTP लॉगिन के लिए अनुमत नहीं है।' }
    };
  }
  if (!checkRateLimit(`email_otp_req:${email}`, 5, 60 * 60 * 1000)) {
    return {
      status: 429,
      body: { success: false, message: 'OTP अनुरोध सीमा समाप्त। कृपया थोड़ी देर बाद प्रयास करें।' }
    };
  }
  if (!supabaseService.isConfigured()) {
    return {
      status: 503,
      body: {
        success: false,
        gatewayNotConfigured: true,
        message: 'Supabase ईमेल OTP सेवा अभी कॉन्फ़िगर नहीं है।'
      }
    };
  }

  const res = await supabaseService.sendEmailOtp(email);
  return {
    status: res.success ? 200 : 400,
    body: res
  };
}

export async function handleEmailOtpVerify(req: AuthRouteRequest): Promise<AuthRouteResponse> {
  if (!isRequestOriginAllowed(req.headers)) {
    return { status: 403, body: { success: false, error: 'Forbidden origin' } };
  }
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const otp = typeof req.body?.otp === 'string' ? req.body.otp.trim().replace(/\D/g, '') : '';

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: 400, body: { success: false, error: 'अमान्य ईमेल पता।' } };
  }
  if (isAdminIdentifier(email)) {
    return { status: 403, body: { success: false, error: 'प्रशासक खाता OTP लॉगिन के लिए अनुमत नहीं है।' } };
  }
  if (otp.length !== 6) {
    return { status: 400, body: { success: false, error: 'कृपया 6 अंकों का सही Email OTP दर्ज करें।' } };
  }

  const verified = await supabaseService.verifyEmailOtp(email, otp);
  if (!verified.success) {
    return { status: 400, body: { success: false, error: verified.error || 'Email OTP सत्यापन विफल।' } };
  }

  let userRecord = await findUserAnyStore(email);
  if (!userRecord) {
    const meta = verified.userMetadata || {};
    userRecord = {
      id: verified.supabaseUserId ? `sb-${verified.supabaseUserId}` : `usr-${Date.now()}`,
      name: meta.name || email.split('@')[0],
      mobile: meta.mobile || '',
      email,
      district: meta.district || 'लखनऊ (Lucknow)',
      department: meta.department || 'चिकित्सा स्वास्थ्य एवं परिवार कल्याण (Health Dept)',
      designation: meta.designation || 'आउटसोर्सिंग कर्मचारी',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      isVerified: true,
      role: 'user',
      joinedDate: 'हाल ही में'
    };
    await createUserAnyStore(userRecord);
  } else if (!userRecord.isVerified) {
    userRecord = (await updateUserAnyStore(userRecord.id, { isVerified: true })) || userRecord;
  }

  const token = createSessionToken(userRecord.id, 'user');
  return {
    status: 200,
    cookie: buildSessionCookieHeader(token, req.isHttps),
    body: {
      success: true,
      token,
      user: dbService.toSafeUserProfile(userRecord)
    }
  };
}

export async function handleAuthOtpLogin(req: AuthRouteRequest): Promise<AuthRouteResponse> {
  if (!isRequestOriginAllowed(req.headers)) {
    return { status: 403, body: { success: false, error: 'Forbidden origin' } };
  }
  const { mobile, otp, otpChallenge } = req.body || {};
  const cleanMobile = typeof mobile === 'string' ? mobile.replace(/\D/g, '').slice(-10) : '';
  if (isAdminIdentifier(cleanMobile)) {
    return { status: 403, body: { success: false, error: 'प्रशासक खाता OTP लॉगिन के लिए अनुमत नहीं है।' } };
  }

  const verified = verifySecureOtp(cleanMobile, otp || '', otpChallenge);
  if (!verified.success || !verified.verificationToken) {
    return { status: 400, body: { success: false, error: verified.error || 'OTP सत्यापन विफल रहा।' } };
  }

  validateVerificationToken(verified.verificationToken, cleanMobile);

  let userRecord = await findUserAnyStore(cleanMobile);
  if (!userRecord) {
    userRecord = {
      id: `usr-${Date.now()}`,
      name: 'कर्मचारी साथी',
      mobile: cleanMobile,
      district: 'लखनऊ (Lucknow)',
      department: 'चिकित्सा स्वास्थ्य एवं परिवार कल्याण (Health Dept)',
      designation: 'आउटसोर्सिंग कर्मचारी',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      isVerified: true,
      role: 'user',
      joinedDate: 'हाल ही में'
    };
    await createUserAnyStore(userRecord);
  } else if (!userRecord.isVerified) {
    userRecord = (await updateUserAnyStore(userRecord.id, { isVerified: true })) || userRecord;
  }

  const token = createSessionToken(userRecord.id, 'user');
  return {
    status: 200,
    cookie: buildSessionCookieHeader(token, req.isHttps),
    body: {
      success: true,
      token,
      user: dbService.toSafeUserProfile(userRecord)
    }
  };
}

export async function handleAuthResetPassword(req: AuthRouteRequest): Promise<AuthRouteResponse> {
  if (!isRequestOriginAllowed(req.headers)) {
    return { status: 403, body: { success: false, error: 'Forbidden origin' } };
  }
  const { mobile, verificationToken, newPassword } = req.body || {};
  const cleanMobile = typeof mobile === 'string' ? mobile.replace(/\D/g, '').slice(-10) : '';
  const cleanPass = typeof newPassword === 'string' ? newPassword.trim() : '';

  if (cleanMobile.length !== 10) {
    return { status: 400, body: { success: false, error: 'अमान्य मोबाइल नंबर।' } };
  }
  if (cleanPass.length < 4) {
    return { status: 400, body: { success: false, error: 'नया पासवर्ड कम से कम 4 अक्षरों/अंकों का होना चाहिए।' } };
  }
  if (!validateVerificationToken(verificationToken || '', cleanMobile)) {
    return {
      status: 401,
      body: { success: false, error: 'सत्यापन टोकन अमान्य या समाप्त हो चुका है। कृपया पुनः OTP सत्यापित करें।' }
    };
  }

  const { hash, salt } = hashPassword(cleanPass);
  const localUpdated = dbService.updateUserPasswordByMobile(cleanMobile, hash, salt);
  const remoteUpdated = supabaseService.isConfigured()
    ? await supabaseService.updateUserPasswordByMobile(cleanMobile, hash, salt)
    : null;

  if (!localUpdated && !remoteUpdated) {
    return {
      status: 404,
      body: { success: false, error: 'इस मोबाइल नंबर से कोई पंजीकृत खाता नहीं मिला।' }
    };
  }

  return {
    status: 200,
    body: {
      success: true,
      message: 'पासवर्ड सफलतापूर्वक अपडेट कर दिया गया है।'
    }
  };
}

export async function handleAuthProfileUpdate(req: AuthRouteRequest): Promise<AuthRouteResponse> {
  if (!isRequestOriginAllowed(req.headers)) {
    return { status: 403, body: { success: false, error: 'Forbidden origin' } };
  }
  const token = extractSessionToken(req.headers);
  const session = validateSessionToken(token);
  if (!session.valid || !session.userId) {
    return { status: 401, body: { success: false, error: 'कृपया पहले लॉगिन करें।' } };
  }

  if (session.role === 'admin') {
    return { status: 403, body: { success: false, error: 'प्रशासक प्रोफ़ाइल यहाँ से संशोधित नहीं की जा सकती।' } };
  }

  const { name, district, department, designation, password } = req.body || {};
  const updates: Record<string, any> = {};
  if (typeof name === 'string' && name.trim().length >= 2) updates.name = name.trim();
  if (typeof district === 'string' && district.trim()) updates.district = district.trim();
  if (typeof department === 'string' && department.trim()) updates.department = department.trim();
  if (typeof designation === 'string' && designation.trim()) updates.designation = designation.trim();
  if (typeof password === 'string' && password.trim().length >= 4) {
    const { hash, salt } = hashPassword(password.trim());
    updates.passwordHash = hash;
    updates.salt = salt;
  }

  const updated = await updateUserAnyStore(session.userId, updates);
  if (!updated) {
    return { status: 404, body: { success: false, error: 'उपयोगकर्ता खाता नहीं मिला।' } };
  }

  return {
    status: 200,
    body: {
      success: true,
      user: dbService.toSafeUserProfile(updated)
    }
  };
}

export async function handleRequestOtp(req: AuthRouteRequest): Promise<AuthRouteResponse> {
  const { mobile } = req.body || {};
  const result = await requestSecureOtp(mobile || '');
  return {
    status: result.success ? 200 : result.gatewayNotConfigured ? 503 : 400,
    body: result
  };
}

export function handleVerifyOtp(req: AuthRouteRequest): AuthRouteResponse {
  const { mobile, otp, otpChallenge } = req.body || {};
  const result = verifySecureOtp(mobile || '', otp || '', otpChallenge);
  return {
    status: result.success ? 200 : 400,
    body: result
  };
}
