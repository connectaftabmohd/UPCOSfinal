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
  Phone,
  RefreshCw
} from 'lucide-react';
import { authService } from '../services/authService';

interface ForgotPasswordProps {
  initialIdentifier?: string;
  onBackToLogin: (prefillId?: string) => void;
}

const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({
  initialIdentifier = '',
  onBackToLogin
}) => {
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [step, setStep] = useState<'identify' | 'otp' | 'email-sent' | 'done'>('identify');
  const [otp, setOtp] = useState('');
  const [otpChallenge, setOtpChallenge] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (initialIdentifier) {
      setIdentifier(initialIdentifier);
    }
  }, [initialIdentifier]);

  useEffect(() => {
    if (step !== 'otp' || resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [step, resendCountdown]);

  const cleanDigits = identifier.trim().replace(/\D/g, '').slice(-10);
  const isMobileInput = /^\d+$/.test(identifier.trim()) || /^\+?91[\s-]?\d{10}$/.test(identifier.trim());
  const maskedMobile =
    cleanDigits.length === 10 ? `${cleanDigits.slice(0, 2)}******${cleanDigits.slice(-2)}` : identifier;

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const raw = identifier.trim();
    if (!raw) {
      setErrorMsg('Please enter your registered mobile number or email address.');
      return;
    }

    if (isMobileInput) {
      if (!INDIAN_MOBILE_REGEX.test(cleanDigits)) {
        setErrorMsg('Please enter a valid 10-digit Indian mobile number.');
        return;
      }

      setLoading(true);
      try {
        const res = await authService.requestOtp(cleanDigits);
        setLoading(false);
        if (res.success) {
          setOtpChallenge(res.otpChallenge || '');
          setOtp('');
          setNewPassword('');
          setConfirmPassword('');
          setStep('otp');
          setResendCountdown(60);
        } else {
          setErrorMsg(res.message || 'Unable to send OTP to this mobile number.');
        }
      } catch {
        setLoading(false);
        setErrorMsg('Unable to reach verification server. Please try again.');
      }
      return;
    }

    const cleanEmail = raw.toLowerCase();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      setErrorMsg('Please enter a valid 10-digit mobile number or email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.requestPasswordResetEmail(cleanEmail);
      setLoading(false);
      if (res.success) {
        setSuccessMsg(res.message || `Password reset link sent to ${cleanEmail}.`);
        setStep('email-sent');
      } else {
        setErrorMsg(res.message || 'Unable to send password reset email.');
      }
    } catch {
      setLoading(false);
      setErrorMsg('Unable to reach password reset service. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await authService.requestOtp(cleanDigits);
      setLoading(false);
      if (res.success) {
        setOtpChallenge(res.otpChallenge || '');
        setResendCountdown(60);
      } else {
        setErrorMsg(res.message || 'Unable to resend OTP.');
      }
    } catch {
      setLoading(false);
      setErrorMsg('Unable to reach verification server.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanOtp = otp.trim().replace(/\D/g, '');
    if (cleanOtp.length !== 6) {
      setErrorMsg('Please enter the 6-digit OTP sent to your mobile.');
      return;
    }
    if (!newPassword.trim() || newPassword.trim().length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }
    if (newPassword.trim() !== confirmPassword.trim()) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const verifyRes = await authService.verifyOtp(cleanDigits, cleanOtp, otpChallenge);
      if (!verifyRes.success || !verifyRes.verificationToken) {
        setLoading(false);
        setErrorMsg(verifyRes.error || 'Invalid or expired OTP.');
        return;
      }

      const resetRes = await authService.resetPasswordWithOtp(
        cleanDigits,
        verifyRes.verificationToken,
        newPassword.trim()
      );
      setLoading(false);

      if (!resetRes.success) {
        setErrorMsg(resetRes.error || 'Unable to reset password.');
        return;
      }

      setSuccessMsg('Password updated successfully! You can now log in with your new password.');
      setStep('done');
    } catch {
      setLoading(false);
      setErrorMsg('Unable to reset password. Please try again.');
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 id="auth-modal-title" className="text-2xl font-bold text-slate-900 tracking-tight">
          Forgot Password
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Enter your registered mobile number or email address to recover access.
        </p>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMsg}</span>
        </div>
      )}

      {step === 'identify' && (
        <form onSubmit={handleContinue} noValidate className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
            <KeyRound className="w-4 h-4 text-blue-800 shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              Enter your email to receive a password reset link, or your 10-digit mobile number for SMS OTP verification.
            </span>
          </div>

          <div>
            <label htmlFor="forgot-identifier" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Registered Mobile Number / Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                {isMobileInput && identifier.trim().length > 0 ? (
                  <Phone className="w-4 h-4" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
              </div>
              <input
                id="forgot-identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. 9876543210 or name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-800 focus:ring-2 focus:ring-blue-900/15 outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-blue-900 hover:bg-blue-950 active:scale-[0.99] text-white text-sm font-semibold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={handleResetPassword} noValidate className="space-y-4">
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950">
            A 6-digit verification code has been sent to <strong className="font-mono">+91 {maskedMobile}</strong>.
          </div>

          <div>
            <label htmlFor="forgot-otp" className="block text-xs font-semibold text-slate-700 mb-1.5">
              6-Digit Verification Code (OTP)
            </label>
            <input
              id="forgot-otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit OTP"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm font-bold font-mono tracking-widest text-center text-slate-900 focus:border-blue-800 focus:ring-2 focus:ring-blue-900/15 outline-none transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="forgot-new-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="forgot-new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Min 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm text-slate-900 focus:border-blue-800 focus:ring-2 focus:ring-blue-900/15 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((p) => !p)}
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="forgot-confirm-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="forgot-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm text-slate-900 focus:border-blue-800 focus:ring-2 focus:ring-blue-900/15 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-sm font-semibold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Reset Password</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={() => {
                setStep('identify');
                setErrorMsg('');
              }}
              className="text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change Number</span>
            </button>
            <button
              type="button"
              disabled={resendCountdown > 0 || loading}
              onClick={handleResendOtp}
              className={`font-semibold inline-flex items-center gap-1.5 ${
                resendCountdown > 0
                  ? 'text-slate-400 cursor-not-allowed'
                  : 'text-blue-900 hover:underline cursor-pointer'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{resendCountdown > 0 ? `Resend OTP (${resendCountdown}s)` : 'Resend OTP'}</span>
            </button>
          </div>
        </form>
      )}

      {(step === 'email-sent' || step === 'done') && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center space-y-3">
          <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-slate-900">
              {step === 'email-sent' ? 'Password Reset Link Sent' : 'Password Reset Complete'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">{successMsg}</p>
          </div>
          <button
            type="button"
            onClick={() => onBackToLogin(identifier.trim())}
            className="w-full min-h-[42px] py-2.5 px-4 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold transition inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Back to Login</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Back to Login Footer Link */}
      {step !== 'email-sent' && step !== 'done' && (
        <div className="pt-3 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={() => onBackToLogin(identifier.trim())}
            className="text-xs font-semibold text-blue-900 hover:text-blue-700 hover:underline inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </button>
        </div>
      )}
    </div>
  );
};
