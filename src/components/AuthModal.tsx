import React, { useState } from 'react';
import { 
  X, 
  User, 
  Lock, 
  Phone, 
  Mail, 
  MapPin, 
  Building2, 
  Briefcase, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  UserCheck, 
  KeyRound, 
  Key, 
  RefreshCw,
  Smartphone,
  MessageSquare,
  Send,
  ExternalLink,
  Zap
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
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isNotRegistered, setIsNotRegistered] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

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

  // WhatsApp-Only Forgot / Reset Password state
  const [forgotMobile, setForgotMobile] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [matchedUser, setMatchedUser] = useState<UserProfile | null>(null);
  const [waAlert, setWaAlert] = useState<{ show: boolean; mobile: string; code: string; waUrl: string } | null>(null);
  const [resendCountdown, setResendCountdown] = useState<number>(30);
  const [waUrl, setWaUrl] = useState<string>('');

  React.useEffect(() => {
    let timer: any;
    if (forgotStep === 2 && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [forgotStep, resendCountdown]);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setLoginError('');
      setRegError('');
      setIsNotRegistered(false);
      setForgotError('');
      setForgotSuccess('');
      setForgotStep(1);
      setWaAlert(null);
      setResendCountdown(30);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const isAdminSelected = 
    loginId.trim().toLowerCase() === 'aftab.mohd9@gmail.com' || 
    loginId.trim().toLowerCase() === 'admin' || 
    loginId.trim().replace(/\D/g, '') === '9876500000';

  const switchToRegisterWithId = () => {
    const clean = loginId.trim();
    if (/^\d{10}$/.test(clean.replace(/\D/g, ''))) {
      setRegMobile(clean.replace(/\D/g, ''));
    } else if (clean.includes('@')) {
      setRegEmail(clean);
    }
    setLoginError('');
    setIsNotRegistered(false);
    setActiveTab('register');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsNotRegistered(false);

    if (isAdminSelected && !loginPassword.trim()) {
      setLoginError('प्रशासक लॉगिन हेतु पासवर्ड दर्ज करना अनिवार्य है।');
      return;
    }

    setLoginLoading(true);

    setTimeout(() => {
      const res = authService.login(loginId, loginPassword);
      setLoginLoading(false);
      if (res.success && res.user) {
        if (onSuccess) onSuccess(res.user);
        onClose();
      } else {
        setLoginError(res.error || 'लॉगिन विफल रहा');
        if (res.notRegistered) {
          setIsNotRegistered(true);
        }
      }
    }, 350);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegLoading(true);

    setTimeout(() => {
      const res = authService.register({
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
        if (onSuccess) onSuccess(res.user);
        onClose();
      } else {
        setRegError(res.error || 'पंजीकरण विफल रहा');
      }
    }, 400);
  };

  const handleRequestReset = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    const cleanMobile = forgotMobile.trim().replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length !== 10) {
      setForgotError('कृपया 10-अंकीय पंजीकृत मोबाइल नंबर दर्ज करें (उदा. 9876543210)। पासवर्ड रीसेट केवल WhatsApp के माध्यम से उपलब्ध है।');
      return;
    }

    setForgotLoading(true);

    setTimeout(() => {
      setForgotLoading(false);
      const user = authService.findUserByIdentifier(cleanMobile);
      if (!user) {
        setForgotError(`मोबाइल नंबर +91 ${cleanMobile} पोर्टल पर पंजीकृत नहीं है। केवल पंजीकृत कर्मचारी ही WhatsApp पर पासवर्ड रीसेट कर सकते हैं।`);
        return;
      }

      const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
      const targetMobile = (user.mobile || cleanMobile).replace(/\D/g, '');
      const waText = encodeURIComponent(`नमस्ते ${user.name},\n\nउत्तर प्रदेश आउटसोर्सिंग कर्मचारी पोर्टल पासवर्ड रीसेट हेतु आपका सत्यापन कोड (OTP): *${randomOtp}*\n\nयह कोड 10 मिनट के लिए मान्य है। कृपया इसे किसी के साथ साझा न करें।\n\n— उ.प्र. आउटसोर्स एवं संविदा कर्मचारी मंच`);
      const targetWaUrl = `https://api.whatsapp.com/send?phone=91${targetMobile}&text=${waText}`;

      setGeneratedOtp(randomOtp);
      setMatchedUser(user);
      setForgotOtp('');
      setForgotNewPassword('');
      setForgotConfirmPassword('');
      setForgotStep(2);
      setResendCountdown(30);
      setWaUrl(targetWaUrl);
      setWaAlert({ show: true, mobile: targetMobile, code: randomOtp, waUrl: targetWaUrl });

      // Automatically launch WhatsApp with pre-filled OTP message
      try {
        window.open(targetWaUrl, '_blank', 'noopener,noreferrer');
      } catch {
        // Handled gracefully via button in UI
      }
    }, 350);
  };

  const handleResendWaOtp = () => {
    if (resendCountdown > 0) return;
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const cleanMobile = (matchedUser?.mobile || forgotMobile).replace(/\D/g, '');
    const waText = encodeURIComponent(`नमस्ते ${matchedUser?.name || 'साथी'},\n\nउत्तर प्रदेश आउटसोर्सिंग कर्मचारी पोर्टल पासवर्ड रीसेट हेतु आपका नया सत्यापन कोड (OTP): *${newOtp}*\n\nयह कोड 10 मिनट के लिए मान्य है।\n\n— उ.प्र. आउटसोर्स एवं संविदा कर्मचारी मंच`);
    const newWaUrl = `https://api.whatsapp.com/send?phone=91${cleanMobile}&text=${waText}`;

    setGeneratedOtp(newOtp);
    setForgotOtp('');
    setResendCountdown(30);
    setWaUrl(newWaUrl);
    setWaAlert({ show: true, mobile: cleanMobile, code: newOtp, waUrl: newWaUrl });

    try {
      window.open(newWaUrl, '_blank', 'noopener,noreferrer');
    } catch {
      // Handled via UI button
    }
  };

  const handleConfirmReset = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (forgotOtp.trim() !== generatedOtp.trim()) {
      setForgotError('अमान्य सत्यापन कोड (OTP)। कृपया WhatsApp पर भेजा गया 4-अंकीय कोड प्रविष्ट करें।');
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

    setTimeout(() => {
      const cleanMobile = (matchedUser?.mobile || forgotMobile).replace(/\D/g, '');
      const res = authService.resetPassword(cleanMobile, forgotNewPassword);
      setForgotLoading(false);

      if (res.success) {
        setForgotSuccess('पासवर्ड सफलतापूर्वक बदल दिया गया है!');
        setTimeout(() => {
          setLoginId(cleanMobile);
          setLoginPassword(forgotNewPassword);
          setActiveTab('login');
          setForgotSuccess('');
          setForgotStep(1);
        }, 1500);
      } else {
        setForgotError(res.error || 'पासवर्ड रीसेट विफल रहा');
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto"
        onClick={e => e.stopPropagation()}
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
              onClick={() => { setActiveTab('login'); setLoginError(''); }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer text-center ${
                activeTab === 'login'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              लॉगिन
            </button>
            <button
              onClick={() => { setActiveTab('register'); setRegError(''); }}
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
              <MessageSquare className="w-3.5 h-3.5 text-emerald-300" />
              <span>WhatsApp पासवर्ड रीसेट</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto">
          
          {/* 1. LOGIN TAB */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                    <span className="font-medium leading-relaxed">{loginError}</span>
                  </div>
                  {isNotRegistered && (
                    <div className="pt-2 border-t border-rose-200/60 dark:border-rose-800/60 flex items-center justify-between">
                      <span className="text-[11px] text-rose-700 dark:text-rose-300 font-medium">खाता नहीं मिला?</span>
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

              {isAdminSelected && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>मुख्य व्यवस्थापक खाता (Admin/Me) — लॉगिन हेतु पासवर्ड अनिवार्य है।</span>
                </div>
              )}

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                <span>केवल पूर्व-पंजीकृत कर्मचारी ही लॉगिन कर सकते हैं। नए साथी पहले पंजीकरण करें।</span>
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
                    onChange={e => setLoginId(e.target.value)}
                    placeholder="उदा. 9876543210 अथवा aftab.mohd9@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  पोर्टल पर लॉग इन करने हेतु अपना पंजीकृत मोबाइल अथवा ईमेल प्रविष्ट करें।
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isAdminSelected ? 'प्रशासक पासवर्ड (Admin Password)' : 'पासवर्ड / 4-अंकीय पिन'}
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
                      <MessageSquare className="w-3 h-3 text-emerald-500" />
                      <span>WhatsApp से पासवर्ड रीसेट करें</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      अनिवार्य (Required)
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder={isAdminSelected ? 'प्रशासक पासवर्ड दर्ज करें' : '••••••••'}
                    required={isAdminSelected}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition"
                  />
                </div>
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
                    <span>सुरक्षित लॉगिन करें</span>
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
                    onChange={e => setRegName(e.target.value)}
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
                      onChange={e => setRegMobile(e.target.value.replace(/\D/g, ''))}
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
                      onChange={e => setRegEmail(e.target.value)}
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
                    onChange={e => setRegDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    {UP_DISTRICTS.map(d => (
                      <option key={d} value={d}>{d}</option>
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
                      onChange={e => setRegDesignation(e.target.value)}
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
                  onChange={e => setRegDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-600 outline-none"
                >
                  {UP_DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  पासवर्ड बनाएं
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
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
                      setLoginPassword(forgotNewPassword);
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
                      {forgotError.includes('पंजीकृत नहीं') && (
                        <div className="pt-2 border-t border-rose-200/60 dark:border-rose-800/60 flex items-center justify-between">
                          <span className="text-[11px] text-rose-700 dark:text-rose-300 font-medium">खाता नहीं मिला?</span>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('register');
                              setRegMobile(forgotMobile.replace(/\D/g, ''));
                              setForgotError('');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-xs cursor-pointer flex items-center gap-1.5 transition active:scale-95"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>नया पंजीकरण करें</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 1: Request WhatsApp OTP through Mobile Number */}
                  {forgotStep === 1 && (
                    <form onSubmit={handleRequestReset} className="space-y-4">
                      <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs">
                          <MessageSquare className="w-4 h-4 fill-white" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-bold text-slate-900 dark:text-white">केवल WhatsApp द्वारा पासवर्ड रीसेट</p>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#25D366]/20 text-emerald-700 dark:text-emerald-300 border border-[#25D366]/30">WhatsApp Only</span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300">
                            पासवर्ड रीसेट सुरक्षा कोड (OTP) केवल आपके पंजीकृत मोबाइल नंबर के WhatsApp पर भेजा जाता है।
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
                            onChange={e => setForgotMobile(e.target.value.replace(/\D/g, ''))}
                            placeholder="उदा. 9876543210"
                            className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition font-mono tracking-wider"
                            required
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-[#25D366]" />
                          <span>सत्यापन OTP सीधे आपके इस WhatsApp नंबर पर भेजा जाएगा।</span>
                        </p>
                      </div>

                      <div className="space-y-2">
                        <button
                          type="submit"
                          disabled={forgotLoading}
                          className="w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1ea850] text-white text-xs font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                        >
                          {forgotLoading ? (
                            <span>सत्यापित किया जा रहा है...</span>
                          ) : (
                            <>
                              <MessageSquare className="w-4 h-4 fill-white" />
                              <span>WhatsApp पर OTP भेजें (Send WhatsApp OTP)</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>

                      <div className="pt-2 text-center">
                        <button
                          type="button"
                          onClick={() => { setActiveTab('login'); setForgotError(''); }}
                          className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium inline-flex items-center gap-1 cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>लॉगिन पर वापस जाएं</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Step 2: Verify WhatsApp OTP & Enter New Password */}
                  {forgotStep === 2 && (() => {
                    const rawMobile = (matchedUser?.mobile || forgotMobile).replace(/\D/g, '');
                    const maskedMobile = rawMobile && rawMobile.length >= 10
                      ? `${rawMobile.slice(0, 2)}******${rawMobile.slice(-2)}`
                      : (rawMobile || '98******10');

                    return (
                    <form onSubmit={handleConfirmReset} className="space-y-4">
                      {/* WhatsApp Dispatched Push Notification Toast */}
                      {waAlert?.show && (
                        <div className="p-3 rounded-2xl bg-slate-900 text-white border border-emerald-500/50 shadow-xl flex items-start justify-between gap-3 animate-in slide-in-from-top-2 duration-300">
                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                              <MessageSquare className="w-4 h-4 fill-white" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold tracking-wide uppercase text-emerald-400">WhatsApp संदेश प्रेषित (Sent)</span>
                                <span className="text-[10px] text-slate-400">• अभी</span>
                              </div>
                              <p className="text-xs font-semibold text-white mt-0.5 leading-snug">
                                पासवर्ड रीसेट सुरक्षा OTP आपके WhatsApp (+91 {maskedMobile}) पर भेज दिया गया है। कृपया अपना WhatsApp खोलकर कोड देखें।
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setWaAlert(null)}
                            className="text-slate-400 hover:text-white p-1 cursor-pointer transition shrink-0"
                            title="बंद करें"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* Identified User Card */}
                      {matchedUser && (
                        <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-slate-800/80 border border-emerald-200/80 dark:border-slate-700 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                              {matchedUser.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                                <span>{matchedUser.name}</span>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                {matchedUser.designation} • {matchedUser.district}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => { setForgotStep(1); setForgotError(''); }}
                            className="text-[10px] text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer font-bold"
                          >
                            मोबाइल बदलें
                          </button>
                        </div>
                      )}

                      {/* Registered Mobile WhatsApp Dispatch Card */}
                      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/60 to-emerald-50/30 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-850 border border-emerald-300 dark:border-emerald-700/60 shadow-xs space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-xs shrink-0">
                              <MessageSquare className="w-4 h-4 fill-white" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                  WhatsApp सत्यापन कोड (OTP)
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
                                  केवल WhatsApp
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                                WhatsApp नंबर: <strong className="font-mono text-slate-900 dark:text-white font-bold">+91 {maskedMobile}</strong>
                              </p>
                            </div>
                          </div>
                          <div className="px-2.5 py-1.5 rounded-xl bg-emerald-100/90 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 font-bold text-[10px] flex items-center gap-1.5 shrink-0 shadow-2xs">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>सुरक्षित कोड (Encrypted)</span>
                          </div>
                        </div>

                        {/* WhatsApp Message Preview Bubble & Direct Link */}
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-900/90 border border-emerald-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 shadow-2xs space-y-2.5">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                            <span className="font-bold text-[#25D366] flex items-center gap-1">
                              <MessageSquare className="w-3 h-3 fill-[#25D366]" />
                              <span>WhatsApp संदेश • UP Outsource Portal</span>
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              प्रेषित (Sent)
                            </span>
                          </div>
                          <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-slate-800 dark:text-slate-200">
                                प्रिय <strong>{matchedUser?.name || 'कर्मचारी साथी'}</strong>, पासवर्ड रीसेट कोड:
                              </p>
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-700">
                                <Lock className="w-2.5 h-2.5 text-emerald-600" />
                                केवल WhatsApp पर उपलब्ध
                              </span>
                            </div>
                            <div className="text-center py-2.5 bg-white dark:bg-slate-800/90 rounded-lg border border-emerald-200/80 dark:border-slate-700/80 shadow-2xs space-y-1">
                              <div className="flex items-center justify-center gap-2 py-0.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse delay-100" />
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse delay-200" />
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse delay-300" />
                              </div>
                              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-1.5 pt-0.5">
                                <MessageSquare className="w-3.5 h-3.5 fill-[#25D366] text-[#25D366]" />
                                <span>सत्यापन कोड केवल आपके WhatsApp पर भेजा गया है</span>
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                (गोपनीयता हेतु कोड स्क्रीन पर नहीं दर्शाया जाता। कृपया नीचे बटन दबाकर WhatsApp खोलें)
                              </p>
                            </div>
                          </div>

                          {/* Direct WhatsApp Open Link */}
                          {rawMobile && (
                            <a
                              href={waUrl || `https://api.whatsapp.com/send?phone=91${rawMobile}&text=${encodeURIComponent(`नमस्ते ${matchedUser?.name || 'साथी'}, उ.प्र. आउटसोर्सिंग कर्मचारी पोर्टल पासवर्ड रीसेट कोड (OTP): ${generatedOtp} है।`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1ea850] text-white font-bold text-xs shadow-xs transition active:scale-98"
                            >
                              <MessageSquare className="w-4 h-4 fill-white" />
                              <span>WhatsApp खोलें एवं कोड देखें (Open WhatsApp)</span>
                              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                            </a>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          WhatsApp पर प्राप्त 4-अंकीय कोड (OTP) *
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={forgotOtp}
                          onChange={e => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="उदा. 4829"
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
                              value={forgotNewPassword}
                              onChange={e => setForgotNewPassword(e.target.value)}
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
                              value={forgotConfirmPassword}
                              onChange={e => setForgotConfirmPassword(e.target.value)}
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
                          onClick={() => { setForgotStep(1); setForgotError(''); }}
                          className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium inline-flex items-center gap-1 cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>वापस</span>
                        </button>
                        <button
                          type="button"
                          disabled={resendCountdown > 0}
                          onClick={handleResendWaOtp}
                          className={`font-bold inline-flex items-center gap-1.5 transition text-xs ${
                            resendCountdown > 0
                              ? 'text-slate-400 cursor-not-allowed'
                              : 'text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer'
                          }`}
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${resendCountdown > 0 ? 'opacity-40' : ''}`} />
                          <span>
                            {resendCountdown > 0
                              ? `WhatsApp पर पुनः OTP (${resendCountdown}s)`
                              : 'WhatsApp पर पुनः OTP भेजें'
                            }
                          </span>
                        </button>
                      </div>
                    </form>
                    );
                  })()}
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
