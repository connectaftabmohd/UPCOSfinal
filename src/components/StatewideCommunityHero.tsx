import React from 'react';
import { ArrowRight, CreditCard, CheckCircle2 } from 'lucide-react';
import { PageView } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface StatewideCommunityHeroProps {
  onNavigate: (view: PageView) => void;
  onOpenDigitalId: () => void;
  registeredCount?: string;
  districtsCount?: string;
  departmentsCount?: string;
  verifiedCount?: string;
}

export const StatewideCommunityHero: React.FC<StatewideCommunityHeroProps> = ({
  onNavigate,
  onOpenDigitalId,
  registeredCount = '12,555+',
  districtsCount = '75',
  departmentsCount = '18+',
  verifiedCount = '9,039+'
}) => {
  let isEnglish = false;
  let t = (k: string, fb?: string) => fb || k;
  try {
    const langCtx = useLanguage();
    isEnglish = langCtx.isEnglish;
    t = langCtx.t;
  } catch {}

  return (
    <section className="w-full relative overflow-hidden bg-gradient-to-b from-[#fbf7ee] via-[#faf5eb] to-[#f8fafc]/50 pt-8 sm:pt-12 md:pt-16 lg:pt-20 pb-10 sm:pb-14 md:pb-18 border-b border-amber-100/70">
      {/* Subtle warm ambient lighting glow */}
      <div 
        aria-hidden="true" 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-80 sm:h-96 bg-gradient-to-b from-amber-200/30 via-orange-100/20 to-transparent pointer-events-none blur-3xl -z-10" 
      />

      <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* 1. Official Network Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#fdf8ed] border border-[#ecd29b] text-[#874e14] text-xs sm:text-[13px] font-semibold shadow-2xs mb-5 sm:mb-7">
          <span className="w-2.5 h-2.5 rounded-full bg-[#d97706] shrink-0 animate-pulse" />
          <span className="truncate">{t('hero.badge', isEnglish ? 'Official Statewide Outsource Employee Network' : 'आधिकारिक राज्य स्तरीय आउटसोर्स कर्मचारी नेटवर्क')}</span>
        </div>

        {/* 2. Main Title */}
        <h1 className="max-w-4xl 2xl:max-w-5xl mx-auto text-2xl sm:text-4xl md:text-5xl lg:text-[54px] 2xl:text-[60px] font-bold font-['Newsreader','Playfair_Display',Georgia,serif] tracking-tight leading-[1.15] sm:leading-[1.12] text-[#0f172a] text-balance">
          {t('hero.titleLine1', isEnglish ? 'The Statewide Community' : 'उत्तर प्रदेश के सभी आउटसोर्स कर्मचारियों का')}
          <span className="block mt-1 sm:mt-2 text-[#b85419]">
            {t('hero.titleLine2', isEnglish ? 'for UP Outsource Employees' : 'एकमात्र संगठित महामंच')}
          </span>
        </h1>

        {/* 3. Subtitle Description */}
        <p className="max-w-2xl sm:max-w-3xl 2xl:max-w-4xl mx-auto mt-4 sm:mt-6 text-sm sm:text-base md:text-[17px] text-[#4b5563] leading-relaxed font-normal px-2 sm:px-0">
          {t('hero.subtitle', isEnglish
            ? 'Connect with your district, department, and colleagues. Share vital workplace updates, engage in discussions, build your professional network, and claim your digital identity.'
            : 'अपने जनपद, विभाग और साथियों से जुड़ें। सेवा संबंधी जरूरी अपडेट साझा करें, चर्चा में भाग लें और अपनी डिजिटल पहचान (ID Card) प्राप्त करें।')}
        </p>

        {/* 4. Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8 max-w-md sm:max-w-none mx-auto">
          <button
            onClick={() => onNavigate({ type: 'talk-corner' })}
            className="min-h-[44px] px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-[#ea580c] to-[#d97706] hover:from-[#d97706] hover:to-[#ea580c] active:scale-[0.98] text-white font-bold text-sm sm:text-base shadow-[0_10px_25px_-5px_rgba(234,88,12,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t('hero.btnCommunity', isEnglish ? 'Go to Community Feed' : 'कम्युनिटी फीड देखें')}</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>

          <button
            onClick={onOpenDigitalId}
            className="min-h-[44px] px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-[#fffbf2] hover:bg-[#fef5df] active:scale-[0.98] border border-[#edd5a4] text-[#78350f] font-bold text-sm sm:text-base shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CreditCard className="w-4 h-4 text-[#b45309] shrink-0" />
            <span>{t('hero.btnDigitalId', isEnglish ? 'Get Digital ID Card' : 'डिजिटल आईडी कार्ड')}</span>
          </button>
        </div>

        {/* 5. Trust Checkmarks Row */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 md:gap-10 mt-8 sm:mt-11 text-xs sm:text-sm font-medium text-[#374151] px-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
            <span>{isEnglish ? 'Dedicated to 75 Districts' : 'उत्तर प्रदेश के 75 जनपद'}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
            <span>{isEnglish ? 'Privacy & Safety Protected' : 'पूर्ण गोपनीयता व सुरक्षा'}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
            <span>{isEnglish ? 'Admin-Verified Badges' : 'सत्यापित पहचान पत्र'}</span>
          </div>
        </div>

        {/* 6. Quantitative Stat Numbers Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 max-w-4xl mx-auto mt-10 sm:mt-14 pt-8 sm:pt-10 border-t border-amber-200/50">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/70 backdrop-blur-xs border border-amber-100 shadow-2xs">
            <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#9a3412] font-['Plus_Jakarta_Sans']">
              {registeredCount}
            </div>
            <div className="text-[11px] sm:text-xs text-[#6b7280] font-semibold mt-1">
              {t('hero.statRegistered', isEnglish ? 'Registered Outsource Employees' : 'पंजीकृत आउटसोर्स कर्मचारी')}
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/70 backdrop-blur-xs border border-amber-100 shadow-2xs">
            <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#9a3412] font-['Plus_Jakarta_Sans']">
              {districtsCount}
            </div>
            <div className="text-[11px] sm:text-xs text-[#6b7280] font-semibold mt-1">
              {t('hero.statDistricts', isEnglish ? 'Districts Across UP' : 'कवर किए गए जनपद')}
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/70 backdrop-blur-xs border border-amber-100 shadow-2xs">
            <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#9a3412] font-['Plus_Jakarta_Sans']">
              {departmentsCount}
            </div>
            <div className="text-[11px] sm:text-xs text-[#6b7280] font-semibold mt-1">
              {t('hero.statDepts', isEnglish ? 'Government Departments' : 'संबद्ध सरकारी विभाग')}
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/70 backdrop-blur-xs border border-amber-100 shadow-2xs">
            <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#9a3412] font-['Plus_Jakarta_Sans']">
              {verifiedCount}
            </div>
            <div className="text-[11px] sm:text-xs text-[#6b7280] font-semibold mt-1">
              {t('hero.statVerified', isEnglish ? 'Verified Digital Members' : 'सत्यापित डिजिटल सदस्य')}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
