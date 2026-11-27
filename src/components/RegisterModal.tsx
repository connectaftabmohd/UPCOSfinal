import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  User,
  UserCheck
} from 'lucide-react';
import { authService, UP_DEPARTMENTS, UP_DISTRICTS } from '../services/authService';
import { UserProfile } from '../types';

interface RegisterModalProps {
  initialIdentifier?: string;
  supabaseAuthConfigured: boolean;
  onSuccess: (user: UserProfile) => void;
  onSwitchToLogin: (prefillId?: string) => void;
}

const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface RegisterFieldErrors {
  fullName?: string;
  mobile?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  initialIdentifier = '',
  supabaseAuthConfigured,
  onSuccess,
  onSwitchToLogin
}) => {
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [district, setDistrict] = useState(UP_DISTRICTS[0]);
  const [department, setDepartment] = useState(UP_DEPARTMENTS[0]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsNote, setShowTermsNote] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const clean = initialIdentifier.trim();
    if (!clean) return;
    const digits = clean.replace(/\D/g, '').slice(-10);
    if (INDIAN_MOBILE_REGEX.test(digits)) {
      setMobile(digits);
    } else if (EMAIL_REGEX.test(clean)) {
      setEmail(clean);
    }
  }, [initialIdentifier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const nextErrors: RegisterFieldErrors = {};
    const cleanName = fullName.trim();
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    const cleanEmail = email.trim().toLowerCase();
    const minPwdLen = supabaseAuthConfigured || cleanEmail ? 6 : 4;

    if (cleanName.length < 2) {
      nextErrors.fullName = 'Please enter your full name (at least 2 characters).';
    }
    if (!INDIAN_MOBILE_REGEX.test(cleanMobile)) {
      nextErrors.mobile = 'Enter a valid 10-digit Indian mobile number (starts with 6-9).';
    }
    if (!cleanEmail) {
      nextErrors.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(cleanEmail)) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!password.trim() || password.trim().length < minPwdLen) {
      nextErrors.password = `Password must be at least ${minPwdLen} characters.`;
    }
    if (!confirmPassword.trim()) {
      nextErrors.confirmPassword = 'Please confirm your password.';
    } else if (password.trim() !== confirmPassword.trim()) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }
    if (!acceptedTerms) {
      nextErrors.terms = 'You must accept the Terms & Conditions to register.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      const res = await authService.register({
        name: cleanName,
        mobile: cleanMobile,
        email: cleanEmail,
        district,
        department,
        designation: 'आउटसोर्सिंग कर्मचारी',
        password: password.trim()
      });

      if (res.success && res.user) {
        authService.saveCredentials(cleanEmail || cleanMobile, true);
        setSuccessMsg('Account created successfully! Entering your portal...');
        setTimeout(() => {
          onSuccess(res.user!);
        }, 500);
      } else if (res.requiresEmailConfirmation) {
        setLoading(false);
        authService.saveCredentials(cleanEmail, true);
        setSuccessMsg(
          res.error ||
            'Registration successful! Please verify the confirmation link sent to your email before logging in.'
        );
      } else {
        setLoading(false);
        setErrorMsg(res.error || 'Registration failed. Please check your details and try again.');
      }
    } catch {
      setLoading(false);
      setErrorMsg('Unable to reach registration server. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 id="auth-modal-title" className="text-2xl font-bold text-slate-900 tracking-tight">
          Create New Account
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Register to access UP outsourcing recruitment updates and candidate tools.
        </p>
      </div>

      {successMsg && (
        <div
          role="status"
          className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-start gap-2.5"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
        {/* Full Name */}
        <div>
          <label htmlFor="reg-fullname" className="block text-xs font-semibold text-slate-700 mb-1">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              id="reg-fullname"
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (fieldErrors.fullName) setFieldErrors((p) => ({ ...p, fullName: undefined }));
              }}
              autoComplete="name"
              placeholder="Enter your full name"
              className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50 focus:bg-white outline-none transition ${
                fieldErrors.fullName
                  ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                  : 'border-slate-200 focus:border-blue-800 focus:ring-2 focus:ring-blue-900/15'
              }`}
            />
          </div>
          {fieldErrors.fullName && (
            <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.fullName}</p>
          )}
        </div>

        {/* Mobile Number & Email Address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="reg-mobile" className="block text-xs font-semibold text-slate-700 mb-1">
              Mobile Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                id="reg-mobile"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={mobile}
                onChange={(e) => {
                  setMobile(e.target.value.replace(/\D/g, ''));
                  if (fieldErrors.mobile) setFieldErrors((p) => ({ ...p, mobile: undefined }));
                }}
                autoComplete="tel"
                placeholder="10-digit mobile"
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50 focus:bg-white outline-none transition ${
                  fieldErrors.mobile
                    ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                    : 'border-slate-200 focus:border-blue-800 focus:ring-2 focus:ring-blue-900/15'
                }`}
              />
            </div>
            {fieldErrors.mobile && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.mobile}</p>
            )}
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
                }}
                autoComplete="email"
                placeholder="name@example.com"
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50 focus:bg-white outline-none transition ${
                  fieldErrors.email
                    ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                    : 'border-slate-200 focus:border-blue-800 focus:ring-2 focus:ring-blue-900/15'
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.email}</p>
            )}
          </div>
        </div>

        {/* District & Department (compact optional selectors for UP profile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="reg-district" className="block text-xs font-semibold text-slate-700 mb-1">
              District (UP)
            </label>
            <select
              id="reg-district"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium text-slate-800 focus:border-blue-800 focus:ring-2 focus:ring-blue-900/15 outline-none transition"
            >
              {UP_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="reg-department" className="block text-xs font-semibold text-slate-700 mb-1">
              Preferred Department
            </label>
            <select
              id="reg-department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium text-slate-800 focus:border-blue-800 focus:ring-2 focus:ring-blue-900/15 outline-none transition"
            >
              {UP_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Create Password & Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-700 mb-1">
              Create Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
                }}
                autoComplete="new-password"
                placeholder="Min 6 characters"
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50 focus:bg-white outline-none transition ${
                  fieldErrors.password
                    ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                    : 'border-slate-200 focus:border-blue-800 focus:ring-2 focus:ring-blue-900/15'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="reg-confirm-password" className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="reg-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) {
                    setFieldErrors((p) => ({ ...p, confirmPassword: undefined }));
                  }
                }}
                autoComplete="new-password"
                placeholder="Re-enter password"
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50 focus:bg-white outline-none transition ${
                  fieldErrors.confirmPassword
                    ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                    : 'border-slate-200 focus:border-blue-800 focus:ring-2 focus:ring-blue-900/15'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* Terms & Conditions */}
        <div>
          <label htmlFor="reg-terms" className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              id="reg-terms"
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => {
                setAcceptedTerms(e.target.checked);
                if (fieldErrors.terms) setFieldErrors((p) => ({ ...p, terms: undefined }));
              }}
              className="w-4 h-4 mt-0.5 rounded border-slate-300 text-blue-900 focus:ring-blue-900 cursor-pointer accent-blue-900"
            />
            <span className="text-xs text-slate-600 leading-relaxed">
              I agree to the{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowTermsNote((prev) => !prev);
                }}
                className="text-blue-900 font-semibold hover:underline cursor-pointer"
              >
                Terms &amp; Conditions
              </button>{' '}
              and Privacy Policy of UP COS Portal.
            </span>
          </label>
          {fieldErrors.terms && (
            <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.terms}</p>
          )}
          {showTermsNote && (
            <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
              Your profile details are used strictly for UP COS Portal member access, community participation, and employment update preferences. We never sell or share your personal contact information with third-party marketers.
            </div>
          )}
        </div>

        {/* Register Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-blue-900 hover:bg-blue-950 active:scale-[0.99] text-white text-sm font-semibold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <UserCheck className="w-4 h-4" />
              <span>Register</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Already have an account */}
        <p className="text-center text-xs text-slate-600 pt-2 border-t border-slate-100">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => onSwitchToLogin(email.trim() || mobile.trim())}
            className="font-bold text-blue-900 hover:text-blue-700 hover:underline cursor-pointer ml-1"
          >
            Login
          </button>
        </p>
      </form>
    </div>
  );
};
