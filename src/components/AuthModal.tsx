import React, { useState } from 'react';
import {
  X,
  User,
  Lock,
  Phone,
  Mail,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  UserCheck,
  KeyRound,
  RefreshCw,
  MessageSquare
} from 'lucide-react';
import { authService, UP_DISTRICTS, UP_DEPARTMENTS } from '../services/authService';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: UserProfile) => void;
  initialTab?: 'login' | 'register' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialTab = 'login'
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>(initialTab);

  // Login form state
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');
  const [otpChannel, setOtpChannel] = useState<'email' | 'mobile'>('email');
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [needsAdminSetup, setNeedsAdminSetup] = useState(false);
  const [otpConfigured, setOtpConfigured] = useState(false);
  const [supabaseAuthConfigured, setSupabaseAuthConfigured] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isNotRegistered, setIsNotRegistered] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [rememberCredentials, setRememberCredentials] = useState(true);

  // OTP Login state
  const [otpLoginEmail, setOtpLoginEmail] = useState('');
  const [otpLoginMobile, setOtpLoginMobile] = useState('');
  const [otpLoginStep, setOtpLoginStep] = useState<1 | 2>(1);
  const [otpLoginCode, setOtpLoginCode] = useState('');
  const [otpLoginChallenge, setOtpLoginChallenge] = useState('');
  const [otpLoginInfo, setOtpLoginInfo] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDistrict, setRegDistrict] = useState(UP_DISTRICTS[0]);
  const [regDepartment, setRegDepartment] = useState(UP_DEPARTMENTS[0]);
  const [regDesignation, setRegDesignation] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  // Forgot / Reset Password state (SMS OTP)
  const [forgotMobile, setForgotMobile] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotOtpChallenge, setForgotOtpChallenge] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState<number>(0);

  React.useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if ((forgotStep === 2 || otpLoginStep === 2) && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [forgotStep, otpLoginStep, resendCountdown]);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setLoginMode('password');
      setLoginError('');
      setLoginPassword('');
      setAdminConfirmPassword('');
      setRegError('');
      setIsNotRegistered(false);
      setForgotError('');
      setForgotSuccess('');
      setForgotStep(1);
      setOtpLoginStep(1);
      setOtpLoginCode('');
      setOtpLoginChallenge('');
      setOtpLoginInfo('');
      setForgotOtp('');
      setForgotOtpChallenge('');
      setResendCountdown(0);

      authService.getAdminStatus().then((status) => {
        setNeedsAdminSetup(Boolean(status.needsSetup));
        setOtpConfigured(Boolean(status.otpConfigured));
        setSupabaseAuthConfigured(Boolean(status.supabaseAuthConfigured));
        if (status.otpConfigured && !status.supabaseAuthConfigured) {
          setOtpChannel('mobile');
        } else {
          setOtpChannel('email');
        }
      });

      const saved = authService.getSavedCredentials();
      if (saved && saved.remember && saved.loginId) {
        setLoginId(saved.loginId);
        setRememberCredentials(true);
      }
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const isAdminSelected =
    loginId.trim().toLowerCase() === 'aftab.mohd9@gmail.com' ||
    loginId.trim().toLowerCase() === 'admin' ||
    loginId.trim().replace(/\D/g, '').slice(-10) === '9876500000';

  const switchToRegisterWithId = () => {
    const clean = loginId.trim();
    const digits = clean.replace(/\D/g, '');
    if (digits.length === 10) {
      setRegMobile(digits);
    } else if (clean.includes('@')) {
      setRegEmail(clean);
    }
    setLoginError('');
    setIsNotRegistered(false);
    setActiveTab('register');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsNotRegistered(false);

    if (!loginId.trim()) {
      setLoginError('कृपया पंजीकृत मोबाइल नंबर या ईमेल दर्ज करें।');
      return;
    }

    if (!loginPassword.trim()) {
      setLoginError(
        isAdminSelected
          ? 'प्रशासक लॉगिन हेतु पासवर्ड दर्ज करना अनिवार्य है।'
          : 'कृपया अपना पासवर्ड दर्ज करें।'
      );
      return;
    }

    if (isAdminSelected && needsAdminSetup) {
      if (loginPassword.trim().length < 6) {
        setLoginError('प्रशासक पासवर्ड कम से कम 6 अक्षरों/अंकों का होना चाहिए।');
        return;
      }
      if (loginPassword.trim() !== adminConfirmPassword.trim()) {
        setLoginError('दोनों प्रशासक पासवर्ड मेल नहीं खाते।');
        return;
      }
    }

    setLoginLoading(true);
    try {
      const res = isAdminSelected
        ? needsAdminSetup
          ? await authService.setupAdminPassword(loginId, loginPassword)
          : await authService.loginAdmin(loginId, loginPassword)
        : await authService.login(loginId, loginPassword);

      setLoginLoading(false);
      if (res.success && res.user) {
        if (rememberCredentials) {
          authService.saveCredentials(loginId, true);
        } else {
          authService.clearSavedCredentials();
        }
        if (onSuccess) onSuccess(res.user);
        onClose();
      } else {
        if ('needsSetup' in res && res.needsSetup) {
          setNeedsAdminSetup(true);
        }
        if ('notRegistered' in res && res.notRegistered) {
          setIsNotRegistered(true);
        }
        setLoginError(res.error || 'लॉगिन विफल रहा');
      }
    } catch {
      setLoginLoading(false);
      setLoginError('प्रमाणीकरण सर्वर से संपर्क नहीं हो सका।');
    }
  };

  const handleRequestOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setOtpLoginInfo('');

    if (otpChannel === 'email') {
      const cleanEmail = otpLoginEmail.trim().toLowerCase();
      if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        setLoginError('कृपया मान्य ईमेल पता दर्ज करें।');
        return;
      }
      setLoginLoading(true);
      const res = await authService.requestEmailOtp(cleanEmail);
      setLoginLoading(false);
      if (res.success) {
        setOtpLoginCode('');
        setOtpLoginStep(2);
        setResendCountdown(60);
        setOtpLoginInfo(res.message);
      } else {
        setLoginError(res.message || 'ईमेल OTP भेजने में त्रुटि हुई।');
      }
      return;
    }

    const cleanMobile = otpLoginMobile.trim().replace(/\D/g, '').slice(-10);
    if (cleanMobile.length !== 10) {
      setLoginError('कृपया 10-अंकीय मान्य मोबाइल नंबर दर्ज करें।');
      return;
    }

    setLoginLoading(true);
    const res = await authService.requestOtp(cleanMobile);
    setLoginLoading(false);

    if (res.success) {
      setOtpLoginChallenge(res.otpChallenge || '');
      setOtpLoginCode('');
      setOtpLoginStep(2);
      setResendCountdown(60);
      setOtpLoginInfo(res.message);
    } else {
      setLoginError(res.message || 'OTP भेजने में त्रुटि हुई।');
    }
  };

  const handleVerifyOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const cleanOtp = otpLoginCode.trim().replace(/\D/g, '');
    if (cleanOtp.length !== 6) {
      setLoginError('कृपया 6-अंकीय मान्य OTP दर्ज करें।');
      return;
    }

    if (otpChannel === 'email') {
      const cleanEmail = otpLoginEmail.trim().toLowerCase();
      setLoginLoading(true);
      const res = await authService.verifyEmailOtp(cleanEmail, cleanOtp);
      setLoginLoading(false);
      if (res.success && res.user) {
        if (rememberCredentials) {
          authService.saveCredentials(cleanEmail, true);
        }
        if (onSuccess) onSuccess(res.user);
        onClose();
      } else {
        setLoginError(res.error || 'Email OTP सत्यापन विफल रहा।');
      }
      return;
    }

    const cleanMobile = otpLoginMobile.trim().replace(/\D/g, '').slice(-10);
    setLoginLoading(true);
    const res = await authService.loginWithOtp(cleanMobile, cleanOtp, otpLoginChallenge);
    setLoginLoading(false);

    if (res.success && res.user) {
      if (rememberCredentials) {
        authService.saveCredentials(cleanMobile, true);
      }
      if (onSuccess) onSuccess(res.user);
      onClose();
    } else {
      setLoginError(res.error || 'OTP सत्यापन विफल रहा।');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regPassword.trim() || regPassword.trim().length < 4) {
      setRegError('कृपया कम से कम 4 अक्षरों/अंकों का पासवर्ड बनाएं।');
      return;
    }

    setRegLoading(true);
    try {
      const res = await authService.register({
        name: regName,
        mobile: regMobile,
        email: regEmail,
        district: regDistrict,
        department: regDepartment,
        designation: regDesignation,
        password: regPassword
      });
      setRegLoading(false);
      if (res.success && res.user) {
        if (rememberCredentials) {
          authService.saveCredentials(regMobile || regEmail, true);
        }
        if (onSuccess) onSuccess(res.user);
        onClose();
      } else {
        setRegError(res.error || 'पंजीकरण विफल रहा');
      }
    } catch {
      setRegLoading(false);
      setRegError('पंजीकरण सर्वर से संपर्क नहीं हो सका।');
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    const cleanMobile = forgotMobile.trim().replace(/\D/g, '').slice(-10);
    if (cleanMobile.length !== 10) {
      setForgotError('कृपया 10-अंकीय वैध मोबाइल नंबर दर्ज करें (उदा. 9876543210)।');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await authService.requestOtp(cleanMobile);
      setForgotLoading(false);
      if (res.success) {
        setForgotOtpChallenge(res.otpChallenge || '');
        setForgotOtp('');
        setForgotNewPassword('');
        setForgotConfirmPassword('');
        setForgotStep(2);
        setResendCountdown(60);
        setForgotError('');
      } else {
        setForgotError(res.message || 'OTP भेजने में त्रुटि हुई।');
      }
    } catch {
      setForgotLoading(false);
      setForgotError('सत्यापन सर्वर से संपर्क नहीं हो सका।');
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    const cleanMobile = forgotMobile.trim().replace(/\D/g, '').slice(-10);
    setForgotLoading(true);
    setForgotError('');

    try {
      const res = await authService.requestOtp(cleanMobile);
      setForgotLoading(false);
      if (res.success) {
        setForgotOtpChallenge(res.otpChallenge || '');
        setResendCountdown(60);
      } else {
        setForgotError(res.message || 'OTP पुनः भेजने में त्रुटि हुई।');
      }
    } catch {
      setForgotLoading(false);
      setForgotError('सत्यापन सर्वर से संपर्क नहीं हो सका।');
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    const cleanOtp = forgotOtp.trim().replace(/\D/g, '');
    if (cleanOtp.length !== 6) {
      setForgotError('कृपया 6-अंकीय मान्य सत्यापन कोड (OTP) दर्ज करें।');
      return;
    }

    if (!forgotNewPassword.trim() || forgotNewPassword.trim().length < 4) {
      setForgotError('पासवर्ड में कम से कम 4 अक्षर या अंक होने चाहिए।');
      return;
    }

    if (forgotNewPassword.trim() !== forgotConfirmPassword.trim()) {
      setForgotError('दोनों पासवर्ड मेल नहीं खाते। कृपया पुनः जांचें।');
      return;
    }

    setForgotLoading(true);
    try {
      const cleanMobile = forgotMobile.trim().replace(/\D/g, '').slice(-10);
      const verifyRes = await authService.verifyOtp(cleanMobile, cleanOtp, forgotOtpChallenge);

      if (!verifyRes.success || !verifyRes.verificationToken) {
        setForgotLoading(false);
        setForgotError(verifyRes.error || 'अमान्य अथवा समाप्त हो चुका OTP।');
        return;
      }

      const resetRes = await authService.resetPasswordWithOtp(
        cleanMobile,
        verifyRes.verificationToken,
        forgotNewPassword.trim()
      );
      setForgotLoading(false);

      if (!resetRes.success) {
        setForgotError(resetRes.error || 'पासवर्ड अपडेट करने में त्रुटि आई।');
        return;
      }

      setForgotSuccess('सत्यापन सफल! पासवर्ड सफलतापूर्वक अपडेट किया गया।');
      setTimeout(() => {
        setLoginId(cleanMobile);
        setLoginPassword('');
        setActiveTab('login');
        setLoginMode('password');
        setForgotSuccess('');
        setForgotStep(1);
      }, 1500);
    } catch {
      setForgotLoading(false);
      setForgotError('सत्यापन सर्वर से संपर्क विफल रहा।');
    }
  };

  const maskedForgotMobile =
    forgotMobile.replace(/\D/g, '').length === 10
      ? `${forgotMobile.slice(0, 2)}******${forgotMobile.slice(-2)}`
      : forgotMobile;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight">
                कर्मचारी पोर्टल लॉगिन
              </h3>
              <p className="text-xs text-blue-200">
                उत्तर प्रदेश आउटसोर्स एवं संविदा कार्मिक मंच
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex rounded-xl bg-blue-900/60 p-1 mt-4 border border-blue-800/60 text-xs font-semibold gap-1">
            <button
              onClick={() => {
                setActiveTab('login');
                setLoginError('');
              }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer text-center ${
                activeTab === 'login'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              लॉगिन
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setRegError('');
              }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer text-center ${
                activeTab === 'register'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              नया पंजीकरण
            </button>
            <button
              onClick={() => {
                setActiveTab('forgot');
                setForgotError('');
                setForgotSuccess('');
                if (loginId) {
                  const digits = loginId.replace(/\D/g, '');
                  if (digits.length === 10) setForgotMobile(digits);
                }
              }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                activeTab === 'forgot'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-300" />
              <span>पासवर्ड रीसेट</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto">
          {/* 1. LOGIN TAB */}
          {activeTab === 'login' && (
            <div className="space-y-4">
              {/* Login Method Switcher (Password vs OTP) */}
              <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 text-xs font-bold gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode('password');
                    setLoginError('');
                  }}
                  className={`flex-1 py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    loginMode === 'password'
                      ? 'bg-white dark:bg-slate-900 text-blue-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>पासवर्ड से लॉगिन</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode('otp');
                    setLoginError('');
                    const digits = loginId.replace(/\D/g, '');
                    if (digits.length === 10 && !otpLoginMobile) setOtpLoginMobile(digits);
                  }}
                  className={`flex-1 py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    loginMode === 'otp'
                      ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>मोबाइल OTP लॉगिन</span>
                </button>
              </div>

              {loginError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                    <span className="font-medium leading-relaxed">{loginError}</span>
                  </div>
                  {isNotRegistered && (
                    <div className="pt-2 border-t border-rose-200/60 dark:border-rose-800/60 flex items-center justify-between">
                      <span className="text-[11px] text-rose-700 dark:text-rose-300 font-medium">
                        खाता नहीं मिला?
                      </span>
                      <button
                        type="button"
                        onClick={switchToRegisterWithId}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-xs cursor-pointer flex items-center gap-1.5 transition active:scale-95"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>अभी नया पंजीकरण करें</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {loginMode === 'password' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  {isAdminSelected && (
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        {needsAdminSetup
                          ? 'प्रथम बार प्रशासक सेटअप — कृपया नया सुरक्षित प्रशासक पासवर्ड सेट करें।'
                          : 'मुख्य व्यवस्थापक खाता (Admin/Me) — लॉगिन हेतु पासवर्ड अनिवार्य है।'}
                      </span>
                    </div>
                  )}

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                    <span>
                      पंजीकृत कर्मचारी मोबाइल नंबर/ईमेल और पासवर्ड से लॉगिन करें। नए साथी पहले पंजीकरण करें।
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      पंजीकृत मोबाइल नंबर या ईमेल
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        autoComplete="username"
                        placeholder="उदा. 9876543210 अथवा name@example.com"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {isAdminSelected
                          ? needsAdminSetup
                            ? 'नया प्रशासक पासवर्ड बनाएं (कम से कम 6 अक्षर)'
                            : 'प्रशासक पासवर्ड (Admin Password)'
                          : 'पासवर्ड'}
                      </label>
                      {!isAdminSelected ? (
                        <button
                          type="button"
                          onClick={() => {
                            const digits = loginId.replace(/\D/g, '');
                            if (digits.length === 10) setForgotMobile(digits);
                            setActiveTab('forgot');
                            setForgotStep(1);
                            setForgotError('');
                            setForgotSuccess('');
                          }}
                          className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <KeyRound className="w-3 h-3 text-emerald-500" />
                          <span>पासवर्ड भूल गए?</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">अनिवार्य (Required)</span>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        autoComplete={isAdminSelected && needsAdminSetup ? 'new-password' : 'current-password'}
                        placeholder={isAdminSelected ? 'प्रशासक पासवर्ड दर्ज करें' : '••••••••'}
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition"
                      />
                    </div>
                  </div>

                  {isAdminSelected && needsAdminSetup && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        प्रशासक पासवर्ड की पुष्टि करें *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <input
                          type="password"
                          value={adminConfirmPassword}
                          onChange={(e) => setAdminConfirmPassword(e.target.value)}
                          autoComplete="new-password"
                          placeholder="वही पासवर्ड दोबारा दर्ज करें"
                          required
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition"
                        />
                      </div>
                    </div>
                  )}

                  {/* Remember Login ID Option */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 transition hover:bg-slate-100/60 dark:hover:bg-slate-800">
                    <label className="flex items-start gap-3 cursor-pointer select-none w-full">
                      <input
                        type="checkbox"
                        checked={rememberCredentials}
                        onChange={(e) => setRememberCredentials(e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 cursor-pointer accent-blue-600"
                      />
                      <div className="flex-1">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                          <span>अगली बार के लिए मोबाइल/ईमेल याद रखें</span>
                          {rememberCredentials && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                              सक्रिय
                            </span>
                          )}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 leading-snug">
                          अगली बार आपका लॉगिन आईडी स्वतः भरा रहेगा।
                        </span>
                      </div>
                    </label>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      लॉगिन करने के बाद आप कम्युनिटी फोरम में पोस्ट, सवाल, ईपीएफ शिकायत व प्रतिक्रिया दर्ज कर सकेंगे।
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full py-3 rounded-xl bg-blue-900 hover:bg-blue-950 active:bg-blue-900 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {loginLoading ? (
                      <span>सत्यापित किया जा रहा है...</span>
                    ) : (
                      <>
                        <span>
                          {isAdminSelected && needsAdminSetup
                            ? 'प्रशासक पासवर्ड सेट करें व लॉगिन करें'
                            : 'सुरक्षित लॉगिन करें'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginId('aftab.mohd9@gmail.com');
                        setLoginPassword('');
                        setAdminConfirmPassword('');
                        setLoginError('');
                      }}
                      className="text-xs text-slate-600 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 font-medium hover:underline inline-flex items-center justify-center gap-1.5 mx-auto transition cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                      <span>प्रशासक लॉगिन (Admin / Me - पासवर्ड आवश्यक)</span>
                    </button>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      पोर्टल पर खाता नहीं है?{' '}
                      <button
                        type="button"
                        onClick={switchToRegisterWithId}
                        className="text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer ml-1 inline-flex items-center gap-1"
                      >
                        <span>नया पंजीकरण करें (Register)</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </p>
                  </div>
                </form>
              ) : (
                /* OTP-Only Employee Login Flow (Free Email OTP via Supabase + Mobile SMS OTP) */
                <div className="space-y-4">
                  <div className="flex rounded-xl bg-emerald-50/70 dark:bg-slate-800 p-1 border border-emerald-200 dark:border-slate-700 text-[11px] font-bold gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setOtpChannel('email');
                        setOtpLoginStep(1);
                        setLoginError('');
                      }}
                      className={`flex-1 py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
                        otpChannel === 'email'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>ईमेल OTP (Free)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpChannel('mobile');
                        setOtpLoginStep(1);
                        setLoginError('');
                      }}
                      className={`flex-1 py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
                        otpChannel === 'mobile'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>मोबाइल SMS OTP</span>
                    </button>
                  </div>

                  {otpChannel === 'email' && !supabaseAuthConfigured && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                      सूचना: इस सर्वर एनवायरनमेंट में Supabase ईमेल OTP कॉन्फ़िगर होने पर ईमेल इनबॉक्स में तुरंत 6-अंकीय OTP प्राप्त होता है।
                    </div>
                  )}

                  {otpChannel === 'mobile' && !otpConfigured && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                      सूचना: मोबाइल SMS OTP के लिए FAST2SMS_API_KEY आवश्यक है। निःशुल्क OTP लॉगिन के लिए "ईमेल OTP (Free)" या "पासवर्ड से लॉगिन" का उपयोग करें।
                    </div>
                  )}

                  {otpLoginStep === 1 ? (
                    <form onSubmit={handleRequestOtpLogin} className="space-y-4">
                      {otpChannel === 'email' ? (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                            अपना ईमेल पता दर्ज करें *
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                              <Mail className="w-4 h-4" />
                            </div>
                            <input
                              type="email"
                              value={otpLoginEmail}
                              onChange={(e) => setOtpLoginEmail(e.target.value)}
                              placeholder="उदा. yourname@gmail.com"
                              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                              required
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                            10-अंकीय मोबाइल नंबर *
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <span className="text-xs font-bold text-slate-500 font-mono">+91</span>
                            </div>
                            <input
                              type="tel"
                              maxLength={10}
                              value={otpLoginMobile}
                              onChange={(e) => setOtpLoginMobile(e.target.value.replace(/\D/g, ''))}
                              placeholder="उदा. 9876543210"
                              className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono tracking-wider"
                              required
                            />
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loginLoading}
                        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                      >
                        <span>
                          {loginLoading
                            ? 'OTP भेजा जा रहा है...'
                            : otpChannel === 'email'
                            ? 'ईमेल पर 6-अंकीय OTP भेजें'
                            : 'मोबाइल पर 6-अंकीय OTP भेजें'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtpLogin} className="space-y-4">
                      {otpLoginInfo && (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                          {otpLoginInfo}
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          प्राप्त 6-अंकीय OTP दर्ज करें *
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={otpLoginCode}
                          onChange={(e) => setOtpLoginCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="6 अंकों का कोड (उदा. 482916)"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono tracking-widest text-center"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loginLoading}
                        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                      >
                        <span>{loginLoading ? 'सत्यापित किया जा रहा है...' : 'OTP सत्यापित करें व लॉगिन करें'}</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <button
                          type="button"
                          onClick={() => setOtpLoginStep(1)}
                          className="text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1 cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>{otpChannel === 'email' ? 'ईमेल बदलें' : 'नंबर बदलें'}</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 2. REGISTER TAB */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              {regError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{regError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  पूरा नाम *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="उदा. अमित कुमार वर्मा"
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    मोबाइल नंबर *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      maxLength={10}
                      value={regMobile}
                      onChange={(e) => setRegMobile(e.target.value.replace(/\D/g, ''))}
                      placeholder="10-अंकीय नंबर"
                      className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ईमेल (वैकल्पिक)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    कार्यरत जनपद (District) *
                  </label>
                  <select
                    value={regDistrict}
                    onChange={(e) => setRegDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    {UP_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    पदनाम (Designation) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={regDesignation}
                      onChange={(e) => setRegDesignation(e.target.value)}
                      placeholder="उदा. कंप्यूटर ऑपरेटर, वार्ड बॉय"
                      className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  सरकारी विभाग (Department) *
                </label>
                <select
                  value={regDepartment}
                  onChange={(e) => setRegDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-600 outline-none"
                >
                  {UP_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  पासवर्ड बनाएं *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    minLength={4}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="कम से कम 4 अक्षर या अंक"
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-600 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-60"
              >
                {regLoading ? (
                  <span>खाता बनाया जा रहा है...</span>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>कर्मचारी खाता बनाएं</span>
                  </>
                )}
              </button>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  पहले से पंजीकृत हैं?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setRegError('');
                    }}
                    className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer ml-1 inline-flex items-center gap-1"
                  >
                    <span>यहाँ लॉगिन करें (Sign In)</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* 3. FORGOT / RESET PASSWORD TAB */}
          {activeTab === 'forgot' && (
            <div className="space-y-4">
              {forgotSuccess ? (
                <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-center space-y-3 animate-in fade-in">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base">पासवर्ड सफलतापूर्वक बदल दिया गया!</h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                      आपका नया पासवर्ड सुरक्षित रूप से अपडेट हो गया है। कृपया नए पासवर्ड के साथ लॉगिन करें।
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginId(forgotMobile);
                      setLoginPassword('');
                      setActiveTab('login');
                      setForgotSuccess('');
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>लॉगिन पेज पर जाएं</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  {forgotError && (
                    <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs space-y-2">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                        <span className="font-medium leading-relaxed">{forgotError}</span>
                      </div>
                    </div>
                  )}

                  {forgotStep === 1 && (
                    <form onSubmit={handleRequestReset} className="space-y-4">
                      <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <KeyRound className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 dark:text-white">
                            SMS OTP द्वारा पासवर्ड रीसेट
                          </p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300">
                            पासवर्ड रीसेट सुरक्षा कोड (6-अंकीय OTP) आपके पंजीकृत मोबाइल नंबर पर SMS द्वारा भेजा जाता है।
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          पंजीकृत 10-अंकीय मोबाइल नंबर *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <span className="text-xs font-bold text-slate-500 font-mono">+91</span>
                          </div>
                          <input
                            type="tel"
                            maxLength={10}
                            value={forgotMobile}
                            onChange={(e) => setForgotMobile(e.target.value.replace(/\D/g, ''))}
                            placeholder="उदा. 9876543210"
                            className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition font-mono tracking-wider"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={forgotLoading}
                        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                      >
                        {forgotLoading ? (
                          <span>सत्यापित किया जा रहा है...</span>
                        ) : (
                          <>
                            <MessageSquare className="w-4 h-4" />
                            <span>मोबाइल पर OTP भेजें (Send OTP)</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <div className="pt-2 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('login');
                            setForgotError('');
                          }}
                          className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium inline-flex items-center gap-1 cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>लॉगिन पर वापस जाएं</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {forgotStep === 2 && (
                    <form onSubmit={handleConfirmReset} className="space-y-4">
                      <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-slate-800 border border-emerald-200 dark:border-emerald-700/60 text-xs text-slate-700 dark:text-slate-300">
                        6-अंकीय सत्यापन कोड मोबाइल नंबर <strong className="font-mono">+91 {maskedForgotMobile}</strong> पर भेजा गया है (10 मिनट के लिए मान्य)।
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          SMS पर प्राप्त 6-अंकीय कोड (OTP) *
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={forgotOtp}
                          onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="उदा. 482916"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono tracking-widest text-center"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            नया पासवर्ड *
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                              <Lock className="w-3.5 h-3.5" />
                            </div>
                            <input
                              type="password"
                              minLength={4}
                              value={forgotNewPassword}
                              onChange={(e) => setForgotNewPassword(e.target.value)}
                              placeholder="कम से कम 4 अक्षर"
                              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            पासवर्ड पुनः पुष्टि करें *
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                              <Lock className="w-3.5 h-3.5" />
                            </div>
                            <input
                              type="password"
                              minLength={4}
                              value={forgotConfirmPassword}
                              onChange={(e) => setForgotConfirmPassword(e.target.value)}
                              placeholder="वही पासवर्ड दोबारा दर्ज करें"
                              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={forgotLoading}
                        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-600 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                      >
                        {forgotLoading ? (
                          <span>पासवर्ड अपडेट किया जा रहा है...</span>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>पासवर्ड रीसेट एवं सुरक्षित करें</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center justify-between pt-2 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setForgotStep(1);
                            setForgotError('');
                          }}
                          className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium inline-flex items-center gap-1 cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>वापस</span>
                        </button>
                        <button
                          type="button"
                          disabled={resendCountdown > 0}
                          onClick={handleResendOtp}
                          className={`font-bold inline-flex items-center gap-1.5 transition text-xs ${
                            resendCountdown > 0
                              ? 'text-slate-400 cursor-not-allowed'
                              : 'text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer'
                          }`}
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${resendCountdown > 0 ? 'opacity-40' : ''}`} />
                          <span>
                            {resendCountdown > 0
                              ? `पुनः OTP भेजें (${resendCountdown}s)`
                              : 'पुनः OTP भेजें'}
                          </span>
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Note */}
        <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>सुरक्षित डेटा व गोपनीयता सुरक्षा</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">उत्तर प्रदेश आउटसोर्सिंग कर्मचारी</span>
        </div>
      </div>
    </div>
  );
};
