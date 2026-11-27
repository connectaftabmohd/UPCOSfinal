import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { authService } from '../services/authService';
import { UserProfile } from '../types';
import { BrandLogo } from './BrandLogo';
import { ForgotPassword } from './ForgotPassword';
import { LoginModal } from './LoginModal';
import { RegisterModal } from './RegisterModal';

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
  const [activeView, setActiveView] = useState<'login' | 'register' | 'forgot'>(initialTab);
  const [sharedIdentifier, setSharedIdentifier] = useState('');
  const [needsAdminSetup, setNeedsAdminSetup] = useState(false);
  const [otpConfigured, setOtpConfigured] = useState(false);
  const [supabaseAuthConfigured, setSupabaseAuthConfigured] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    setActiveView(initialTab);

    authService
      .getAdminStatus()
      .then((status) => {
        setNeedsAdminSetup(Boolean(status.needsSetup));
        setOtpConfigured(Boolean(status.otpConfigured));
        setSupabaseAuthConfigured(Boolean(status.supabaseAuthConfigured));
      })
      .catch(() => {
        // Ignored
      });

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const focusTimer = setTimeout(() => {
      const firstInput = dialogRef.current?.querySelector<HTMLElement>(
        'input:not([disabled]), button:not([disabled]), select:not([disabled])'
      );
      if (firstInput) {
        firstInput.focus();
      } else {
        dialogRef.current?.focus();
      }
    }, 30);

    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocusedRef.current?.focus?.();
    };
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleAuthSuccess = (user: UserProfile) => {
    if (onSuccess) onSuccess(user);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-modal-fade"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        tabIndex={-1}
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden my-auto grid grid-cols-1 md:grid-cols-12 animate-modal-slide outline-none"
      >
        {/* Top-Right Close (X) Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-3.5 right-3.5 z-20 w-10 h-10 rounded-full flex items-center justify-center bg-white/10 text-white/85 hover:text-white hover:bg-white/20 md:bg-transparent md:text-slate-400 md:hover:text-slate-800 md:hover:bg-slate-100 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT SECTION - Branding */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-950 via-blue-950 to-blue-900 text-white p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3 pr-10 md:pr-0">
              <BrandLogo size={46} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                  UP COS Portal
                </p>
                <p className="text-sm font-bold text-white leading-tight">
                  UP Outsource Seva Nigam
                </p>
              </div>
            </div>

            <div className="pt-1 md:pt-3 space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Welcome Back!
              </h3>
              <p className="text-sm font-semibold text-blue-200">
                Your Career Journey Starts Here.
              </p>
              <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed hidden sm:block">
                Access your account to explore the latest outsourcing jobs, recruitment updates and employment opportunities in Uttar Pradesh.
              </p>
            </div>
          </div>

          {/* Minimal Geometric Recruitment Portal Illustration (Desktop & Tablet) */}
          <div className="relative z-10 mt-6 hidden md:block" aria-hidden="true">
            <svg
              viewBox="0 0 300 160"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto rounded-xl border border-white/10 bg-white/5 p-3"
            >
              {/* Outer Recruitment Dashboard Card */}
              <rect x="12" y="14" width="276" height="132" rx="10" fill="#0F172A" fillOpacity="0.65" stroke="#60A5FA" strokeOpacity="0.28" />
              {/* Candidate Avatar Badge */}
              <circle cx="46" cy="52" r="16" fill="#1E3A8A" stroke="#93C5FD" strokeOpacity="0.6" strokeWidth="1.5" />
              <circle cx="46" cy="48" r="5" fill="#DBEAFE" />
              <path d="M36 61C38.5 56.5 42 55 46 55C50 55 53.5 56.5 56 61" stroke="#DBEAFE" strokeWidth="1.8" strokeLinecap="round" />
              {/* Profile Lines */}
              <rect x="74" y="40" width="110" height="8" rx="4" fill="#E2E8F0" fillOpacity="0.85" />
              <rect x="74" y="55" width="76" height="6" rx="3" fill="#93C5FD" fillOpacity="0.55" />
              {/* Verified Portal Seal */}
              <rect x="210" y="38" width="60" height="22" rx="6" fill="#1D4ED8" fillOpacity="0.55" stroke="#93C5FD" strokeOpacity="0.45" />
              <path d="M222 49L226 53L234 45" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="240" y="46" width="20" height="6" rx="3" fill="#DBEAFE" fillOpacity="0.8" />
              {/* Divider */}
              <line x1="28" y1="82" x2="272" y2="82" stroke="#94A3B8" strokeOpacity="0.2" />
              {/* Job & Recruitment Opportunity Rows */}
              <rect x="28" y="96" width="142" height="10" rx="5" fill="#3B82F6" fillOpacity="0.35" />
              <rect x="28" y="114" width="108" height="7" rx="3.5" fill="#CBD5E1" fillOpacity="0.4" />
              <rect x="196" y="96" width="76" height="26" rx="7" fill="#2563EB" fillOpacity="0.45" stroke="#60A5FA" strokeOpacity="0.4" />
              <rect x="212" y="106" width="44" height="6" rx="3" fill="#EFF6FF" fillOpacity="0.85" />
            </svg>
          </div>

          {/* Trust Footer Note */}
          <div className="relative z-10 mt-5 pt-4 border-t border-white/10 hidden md:flex items-center gap-2 text-[11px] text-blue-200/90">
            <ShieldCheck className="w-4 h-4 text-blue-300 shrink-0" />
            <span>Encrypted Session • Official UP Outsourcing Updates</span>
          </div>
        </div>

        {/* RIGHT SECTION - Form Panel */}
        <div className="md:col-span-7 bg-white p-6 sm:p-8 max-h-[85vh] md:max-h-[90vh] overflow-y-auto">
          {activeView === 'login' && (
            <LoginModal
              initialIdentifier={sharedIdentifier}
              needsAdminSetup={needsAdminSetup}
              onNeedsAdminSetup={setNeedsAdminSetup}
              otpConfigured={otpConfigured}
              supabaseAuthConfigured={supabaseAuthConfigured}
              onSuccess={handleAuthSuccess}
              onSwitchToRegister={(prefill) => {
                if (prefill !== undefined) setSharedIdentifier(prefill);
                setActiveView('register');
              }}
              onSwitchToForgot={(prefill) => {
                if (prefill !== undefined) setSharedIdentifier(prefill);
                setActiveView('forgot');
              }}
            />
          )}

          {activeView === 'register' && (
            <RegisterModal
              initialIdentifier={sharedIdentifier}
              supabaseAuthConfigured={supabaseAuthConfigured}
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={(prefill) => {
                if (prefill !== undefined) setSharedIdentifier(prefill);
                setActiveView('login');
              }}
            />
          )}

          {activeView === 'forgot' && (
            <ForgotPassword
              initialIdentifier={sharedIdentifier}
              onBackToLogin={(prefill) => {
                if (prefill !== undefined) setSharedIdentifier(prefill);
                setActiveView('login');
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
