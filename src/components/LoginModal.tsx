import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
  Phone,
  ShieldCheck,
  UserPlus
} from 'lucide-react';
import { authService } from '../services/authService';
import { UserProfile } from '../types';

interface LoginModalProps {
  initialIdentifier?: string;
  needsAdminSetup: boolean;
  onNeedsAdminSetup: (needsSetup: boolean) => void;
  otpConfigured: boolean;
  supabaseAuthConfigured: boolean;
  onSuccess: (user: UserProfile) => void;
  onSwitchToRegister: (prefillId?: string) => void;
  onSwitchToForgot: (prefillId?: string) => void;
}

const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function normalizeIdentifier(raw: string): string {
  const trimmed = raw.trim();
  if (/^\+?91[\s-]?\d{10}$/.test(trimmed)) {
    return trimmed.replace(/\D/g, '').slice(-10);
  }
  return trimmed;
}

function isValidLoginIdentifier(value: string): boolean {
  const normalized = normalizeIdentifier(value);
  if (normalized.toLowerCase() === 'admin') return true;
  if (/^\d+$/.test(normalized)) {
    return INDIAN_MOBILE_REGEX.test(normalized);
  }
  return EMAIL_REGEX.test(normalized);
}

export const LoginModal: React.FC<LoginModalProps> = ({
  initialIdentifier = '',
  needsAdminSetup,
  onNeedsAdminSetup,
  otpConfigured,
  supabaseAuthConfigured,
  onSuccess,
  onSwitchToRegister,
  onSwitchToForgot
}) => {
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');
  const [otpChannel, setOtpChannel] = useState<'email' | 'mobile'>('email');

  const [loginId, setLoginId] = useState(initialIdentifier);
  const [password, setPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminConfirm, setShowAdminConfirm] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [fieldErrors, setFieldErrors] = useState<{ loginId?: string; password?: string; adminConfirm?: string }>({});
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isNotRegistered, setIsNotRegistered] = useState(false);
  const [loading, setLoading] = useState(false);

  // OTP Login state
  const [otpEmail, setOtpEmail] = useState('');
  const [otpMobile, setOtpMobile] = useState('');
  const [otpStep, setOtpStep] = useState<1 | 2>(1);
  const [otpCode, setOtpCode] = useState('');
  const [otpChallenge, setOtpChallenge] = useState('');
  const [otpInfo, setOtpInfo] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (initialIdentifier) {
      setLoginId(initialIdentifier);
    } else {
      const saved = authService.getSavedCredentials();
      if (saved?.remember && saved.loginId) {
        setLoginId(saved.loginId);
        setRememberMe(true);
      }
    }
  }, [initialIdentifier]);

  useEffect(() => {
    if (otpConfigured && !supabaseAuthConfigured) {
      setOtpChannel('mobile');
    } else {
      setOtpChannel('email');
    }
  }, [otpConfigured, supabaseAuthConfigured]);

  useEffect(() => {
    if (otpStep !== 2 || resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpStep, resendCountdown]);

  const normalizedId = normalizeIdentifier(loginId);
  const isAdminSelected =
    normalizedId.toLowerCase() === 'aftab.mohd9@gmail.com' ||
    normalizedId.toLowerCase() === 'admin' ||
    normalizedId.replace(/\D/g, '').slice(-10) === '9876500000';

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsNotRegistered(false);

    const nextErrors: { loginId?: string; password?: string; adminConfirm?: string } = {};
    const trimmedId = normalizeIdentifier(loginId);

    if (!trimmedId) {
      nextErrors.loginId = 'Mobile number or email address is required.';
    } else if (!isValidLoginIdentifier(trimmedId)) {
      nextErrors.loginId = 'Enter a valid 10-digit Indian mobile number or email address.';
    }

    if (!password.trim()) {
      nextErrors.password = isAdminSelected ? 'Admin password is required.' : 'Password is required.';
    } else if (isAdminSelected && needsAdminSetup && password.trim().length < 6) {
      nextErrors.password = 'Admin password must be at least 6 characters.';
    }

    if (isAdminSelected && needsAdminSetup && password.trim() !== adminConfirmPassword.trim()) {
      nextErrors.adminConfirm = 'Admin passwords do not match.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      const res = isAdminSelected
        ? needsAdminSetup
          ? await authService.setupAdminPassword(trimmedId, password)
          : await authService.loginAdmin(trimmedId, password)
        : await authService.login(trimmedId, password);

      if (res.success && res.user) {
        if (rememberMe) {
          authService.saveCredentials(trimmedId, true);
        } else {
          authService.clearSavedCredentials();
        }
        setSuccessMsg('Login successful! Redirecting to your portal...');
        setTimeout(() => {
          onSuccess(res.user!);
        }, 450);
      } else {
        setLoading(false);
        if ('needsSetup' in res && res.needsSetup) {
          onNeedsAdminSetup(true);
        }
        if ('notRegistered' in res && res.notRegistered) {
          setIsNotRegistered(true);
        }
        setErrorMsg(res.error || 'Invalid credentials. Please try again.');
      }
    } catch {
      setLoading(false);
      setErrorMsg('Unable to reach authentication server. Please try again.');
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setOtpInfo('');

    if (otpChannel === 'email') {
      const cleanEmail = otpEmail.trim().toLowerCase();
      if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
        setErrorMsg('Please enter a valid email address.');
        return;
      }
      setLoading(true);
      const res = await authService.requestEmailOtp(cleanEmail);
      setLoading(false);
      if (res.success) {
        setOtpCode('');
        setOtpStep(2);
        setResendCountdown(60);
        setOtpInfo(res.message);
      } else {
        setErrorMsg(res.message || 'Unable to send email OTP.');
      }
      return;
    }

    const cleanMobile = otpMobile.trim().replace(/\D/g, '').slice(-10);
    if (!INDIAN_MOBILE_REGEX.test(cleanMobile)) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setLoading(true);
    const res = await authService.requestOtp(cleanMobile);
    setLoading(false);
    if (res.success) {
      setOtpChallenge(res.otpChallenge || '');
      setOtpCode('');
      setOtpStep(2);
      setResendCountdown(60);
      setOtpInfo(res.message);
    } else {
      setErrorMsg(res.message || 'Unable to send SMS OTP.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanOtp = otpCode.trim().replace(/\D/g, '');
    if (cleanOtp.length !== 6) {
      setErrorMsg('Please enter the 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      if (otpChannel === 'email') {
        const cleanEmail = otpEmail.trim().toLowerCase();
        const res = await authService.verifyEmailOtp(cleanEmail, cleanOtp);
        if (res.success && res.user) {
          if (rememberMe) authService.saveCredentials(cleanEmail, true);
          setSuccessMsg('Verification successful! Signing you in...');
          setTimeout(() => onSuccess(res.user!), 450);
          return;
        }
        setLoading(false);
        setErrorMsg(res.error || 'Invalid or expired Email OTP.');
        return;
      }

      const cleanMobile = otpMobile.trim().replace(/\D/g, '').slice(-10);
      const res = await authService.loginWithOtp(cleanMobile, cleanOtp, otpChallenge);
      if (res.success && res.user) {
        if (rememberMe) authService.saveCredentials(cleanMobile, true);
        setSuccessMsg('Verification successful! Signing you in...');
        setTimeout(() => onSuccess(res.user!), 450);
        return;
      }
      setLoading(false);
      setErrorMsg(res.error || 'Invalid or expired SMS OTP.');
    } catch {
      setLoading(false);
      setErrorMsg('Unable to verify OTP. Please try again.');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 id="auth-modal-title" className="text-2xl font-bold text-slate-900 tracking-tight">
          Login to Your Account
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Enter your credentials to continue.
        </p>
      </div>

      {/* Status Alerts */}
      {successMsg && (
        <div
          role="status"
          className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2.5"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2.5"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{errorMsg}</span>
          </div>
          {isNotRegistered && (
            <div className="pt-2 border-t border-rose-200/70 flex items-center justify-between gap-2">
              <span className="text-rose-700 font-medium">New to UP COS Portal?</span>
              <button
                type="button"
                onClick={() => onSwitchToRegister(loginId.trim())}
                className="px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs inline-flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create New Account</span>
              </button>
            </div>
          )}
        </div>
      )}

      {loginMode === 'password' ? (
        <form onSubmit={handlePasswordLogin} noValidate className="space-y-4">
          {isAdminSelected && (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-800 shrink-0" />
              <span>
                {needsAdminSetup
                  ? 'First-time Portal Admin setup — create a secure admin password (min 6 characters).'
                  : 'Portal Administrator account detected — enter your admin password.'}
              </span>
            </div>
          )}

          {/* 1. Mobile Number / Email Address */}
          <div>
            <label htmlFor="login-identifier" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Mobile Number / Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                {/^\d+$/.test(normalizedId) && normalizedId.length > 0 ? (
                  <Phone className="w-4 h-4" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
              </div>
              <input
                id="login-identifier"
                type="text"
                value={loginId}
                onChange={(e) => {
                  setLoginId(e.target.value);
                  if (fieldErrors.loginId) setFieldErrors((prev) => ({ ...prev, loginId: undefined }));
                }}
                autoComplete="username"
                placeholder="e.g. 9876543210 or name@example.com"
                aria-invalid={Boolean(fieldErrors.loginId)}
                aria-describedby={fieldErrors.loginId ? 'login-identifier-error' : undefined}
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50 focus:bg-white outline-none transition ${
                  fieldErrors.loginId
                    ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                    : 'border-slate-200 focus:border-blue-800 focus:ring-2 focus:ring-blue-900/15'
                }`}
              />
            </div>
            {fieldErrors.loginId && (
              <p id="login-identifier-error" className="text-xs text-rose-600 mt-1 font-medium">
                {fieldErrors.loginId}
              </p>
            )}
          </div>

          {/* 2. Password with Show/Hide */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700">
                {isAdminSelected && needsAdminSetup ? 'Create Admin Password' : 'Password'}
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }}
                autoComplete={isAdminSelected && needsAdminSetup ? 'new-password' : 'current-password'}
                placeholder="Enter your password"
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
                className={`w-full pl-10 pr-11 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50 focus:bg-white outline-none transition ${
                  fieldErrors.password
                    ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                    : 'border-slate-200 focus:border-blue-800 focus:ring-2 focus:ring-blue-900/15'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 px-3.5 flex items-center text-slate-400 hover:text-slate-700 transition cursor-pointer focus-visible:outline-none focus-visible:text-blue-900"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p id="login-password-error" className="text-xs text-rose-600 mt-1 font-medium">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Admin first-time confirm password */}
          {isAdminSelected && needsAdminSetup && (
            <div>
              <label htmlFor="admin-confirm-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Confirm Admin Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="admin-confirm-password"
                  type={showAdminConfirm ? 'text' : 'password'}
                  value={adminConfirmPassword}
                  onChange={(e) => {
                    setAdminConfirmPassword(e.target.value);
                    if (fieldErrors.adminConfirm) setFieldErrors((prev) => ({ ...prev, adminConfirm: undefined }));
                  }}
                  autoComplete="new-password"
                  placeholder="Re-enter admin password"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50 focus:bg-white focus:border-blue-800 focus:ring-2 focus:ring-blue-900/15 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminConfirm((prev) => !prev)}
                  aria-label={showAdminConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute inset-y-0 right-0 px-3.5 flex items-center text-slate-400 hover:text-slate-700 transition cursor-pointer"
                >
                  {showAdminConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.adminConfirm && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.adminConfirm}</p>
              )}
            </div>
          )}

          {/* 4 & 5. Remember Me + Forgot Password */}
          <div className="flex items-center justify-between gap-3 pt-0.5">
            <label htmlFor="remember-me" className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-900 focus:ring-blue-900 cursor-pointer accent-blue-900"
              />
              <span className="text-xs font-medium text-slate-600">Remember Me</span>
            </label>

            {!isAdminSelected && (
              <button
                type="button"
                onClick={() => onSwitchToForgot(loginId.trim())}
                className="text-xs font-semibold text-blue-800 hover:text-blue-950 hover:underline cursor-pointer whitespace-nowrap"
              >
                Forgot Password?
              </button>
            )}
          </div>

          {/* 6. Primary Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-blue-900 hover:bg-blue-950 active:scale-[0.99] text-white text-sm font-semibold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>
                  {isAdminSelected && needsAdminSetup ? 'Set Password & Login' : 'Login'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* 7. Divider with OR */}
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">OR</span>
            </div>
          </div>

          {/* Secondary OTP Login Option + Create New Account */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => {
                setErrorMsg('');
                setLoginMode('otp');
                const digits = loginId.replace(/\D/g, '').slice(-10);
                if (INDIAN_MOBILE_REGEX.test(digits) && !otpMobile) {
                  setOtpMobile(digits);
                } else if (EMAIL_REGEX.test(loginId.trim()) && !otpEmail) {
                  setOtpEmail(loginId.trim());
                }
              }}
              className="w-full min-h-[42px] py-2 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-blue-800" />
              <span>Login with Email / SMS OTP</span>
            </button>

            <p className="text-center text-xs text-slate-600 pt-1">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => onSwitchToRegister(loginId.trim())}
                className="font-bold text-blue-900 hover:text-blue-700 hover:underline cursor-pointer ml-1"
              >
                Create New Account
              </button>
            </p>
          </div>
        </form>
      ) : (
        /* OTP Login View */
        <div className="space-y-4">
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold gap-1">
            <button
              type="button"
              onClick={() => {
                setOtpChannel('email');
                setOtpStep(1);
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                otpChannel === 'email' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email OTP</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setOtpChannel('mobile');
                setOtpStep(1);
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                otpChannel === 'mobile' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Mobile SMS OTP</span>
            </button>
          </div>

          {otpChannel === 'mobile' && !otpConfigured && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
              SMS OTP gateway requires server SMS configuration. Use Email OTP or Password login if SMS delivery is unavailable.
            </div>
          )}

          {otpStep === 1 ? (
            <form onSubmit={handleRequestOtp} noValidate className="space-y-4">
              {otpChannel === 'email' ? (
                <div>
                  <label htmlFor="otp-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="otp-email"
                      type="email"
                      value={otpEmail}
                      onChange={(e) => setOtpEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm text-slate-900 focus:border-blue-800 focus:ring-2 focus:ring-blue-900/15 outline-none transition"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label htmlFor="otp-mobile" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    10-Digit Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 text-xs font-bold">
                      +91
                    </div>
                    <input
                      id="otp-mobile"
                      type="tel"
                      maxLength={10}
                      value={otpMobile}
                      onChange={(e) => setOtpMobile(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm font-mono text-slate-900 focus:border-blue-800 focus:ring-2 focus:ring-blue-900/15 outline-none transition"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-sm font-semibold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Send 6-Digit OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} noValidate className="space-y-4">
              {otpInfo && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                  {otpInfo}
                </div>
              )}

              <div>
                <label htmlFor="otp-code" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Enter 6-Digit OTP
                </label>
                <input
                  id="otp-code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="6-digit code"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm font-bold font-mono tracking-widest text-center text-slate-900 focus:border-blue-800 focus:ring-2 focus:ring-blue-900/15 outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-sm font-semibold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying OTP...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify &amp; Login</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setOtpStep(1)}
                  className="text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change {otpChannel === 'email' ? 'Email' : 'Mobile'}</span>
                </button>
                {resendCountdown > 0 && (
                  <span className="text-slate-400 font-medium">Resend in {resendCountdown}s</span>
                )}
              </div>
            </form>
          )}

          <div className="pt-2 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => {
                setLoginMode('password');
                setErrorMsg('');
              }}
              className="text-xs font-semibold text-blue-900 hover:underline inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Password Login</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
