import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, ShieldCheck, BellRing } from 'lucide-react';

interface NewsletterProps {
  className?: string;
}

export const Newsletter: React.FC<NewsletterProps> = ({ className = '' }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  // Local state storing newsletter signups as requested
  const [subscribers, setSubscribers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('uposn_newsletter_subscribers');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  // Mock signup function storing entries in local state
  const handleMockSignup = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setStatus('error');
      setErrorMessage('कृपया अपना ईमेल पता दर्ज करें।');
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setStatus('error');
      setErrorMessage('कृपया एक वैध ईमेल पता दर्ज करें (उदा. rahul@example.com)।');
      return;
    }

    if (subscribers.includes(cleanEmail)) {
      setStatus('error');
      setErrorMessage('यह ईमेल पहले से ही साप्ताहिक अपडेट हेतु पंजीकृत है।');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    // Simulate network latency for realistic mock signup
    setTimeout(() => {
      const updated = [cleanEmail, ...subscribers];
      setSubscribers(updated);
      try {
        localStorage.setItem('uposn_newsletter_subscribers', JSON.stringify(updated));
      } catch {
        // Local state fallback
      }
      setStatus('success');
      setEmail('');
    }, 500);
  };

  const handleReset = () => {
    setStatus('idle');
    setErrorMessage('');
  };

  return (
    <div 
      id="newsletter-footer-box"
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/80 border border-slate-800 p-6 sm:p-8 shadow-xl ${className}`}
    >
      {/* Decorative subtle background elements */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Section: Information */}
        <div className="max-w-xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
            <BellRing className="w-3.5 h-3.5 shrink-0" />
            <span>साप्ताहिक न्यूज़लेटर (Weekly Digest)</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight font-['Plus_Jakarta_Sans']">
            आउटसोर्सिंग की हर बड़ी खबर सीधे अपने इनबॉक्स में पाएं
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            नए शासनादेश, न्यूनतम वेतन संशोधन, ईपीएफ/ईएसआई विधिक प्रावधान एवं संविदा कर्मियों से जुड़े महत्वपूर्ण फैसलों का हर हफ्ते प्रामाणिक बुलेटिन।
          </p>

          <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              100% नि:शुल्क एवं सुरक्षित
            </span>
            <span>•</span>
            <span>कोई स्पैम नहीं, कभी भी अनसब्सक्राइब करें</span>
          </div>
        </div>

        {/* Right Section: Form & State */}
        <div className="w-full lg:max-w-md">
          {status === 'success' ? (
            <div className="bg-emerald-950/60 border border-emerald-800/80 rounded-xl p-4 sm:p-5 flex flex-col gap-2.5 text-emerald-200">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-sm">
                    सफलतापूर्वक पंजीकृत! (Subscribed)
                  </h4>
                  <p className="text-xs text-emerald-300 mt-1 leading-relaxed">
                    धन्यवाद! आपको आउटसोर्स कर्मचारियों से संबंधित नवीनतम शासनादेश और महत्वपूर्ण समाचारों का साप्ताहिक बुलेटिन प्राप्त होगा।
                  </p>
                </div>
              </div>
              
              <div className="pt-2 flex items-center justify-between border-t border-emerald-900/60 text-xs">
                <span className="text-emerald-400/80 text-[11px]">
                  स्थानीय पंजीकरण: {subscribers.length} कुल सदस्य
                </span>
                <button
                  onClick={handleReset}
                  className="text-white hover:underline text-xs font-semibold cursor-pointer"
                >
                  अन्य ईमेल जोड़ें
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleMockSignup} className="space-y-2.5">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="newsletter-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === 'error') setStatus('idle');
                    }}
                    placeholder="अपना ईमेल पता दर्ज करें (Enter email)"
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500/60 focus:border-red-500 transition"
                    disabled={status === 'loading'}
                  />
                </div>

                <button
                  id="newsletter-subscribe-btn"
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-bold tracking-wide transition shadow-md flex items-center justify-center gap-2 shrink-0 disabled:opacity-60 cursor-pointer"
                >
                  {status === 'loading' ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>जोड़ रहे हैं...</span>
                    </>
                  ) : (
                    <>
                      <span>सदस्य बनें</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Error state */}
              {status === 'error' && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 pl-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {subscribers.length > 0 && (
                <div className="text-[11px] text-slate-400 pl-1">
                  अब तक <strong className="text-slate-200">{subscribers.length}</strong> आउटसोर्स कर्मचारी पंजीकृत हो चुके हैं।
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
