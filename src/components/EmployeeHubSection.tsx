import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  CreditCard, 
  ShieldCheck, 
  Stethoscope, 
  FileText, 
  AlertTriangle, 
  Calendar, 
  PhoneCall, 
  ExternalLink,
  BookOpen,
  Calculator,
  ArrowRight
} from 'lucide-react';
import { EMPLOYEE_GUIDES_DATA, FAQS_DATA } from '../data/mockData';
import { contentStore } from '../data/contentStore';
import { PageView, FAQItem } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface EmployeeHubSectionProps {
  onNavigate: (view: PageView) => void;
  defaultActiveCategory?: string;
  faqs?: FAQItem[];
}

export const EmployeeHubSection: React.FC<EmployeeHubSectionProps> = ({
  onNavigate,
  defaultActiveCategory = 'वेतन',
  faqs,
}) => {
  const [selectedCategory, setSelectedCategory] = useState(defaultActiveCategory);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  let isEnglish = false;
  let t = (k: string, fb?: string) => fb || k;
  try {
    const langCtx = useLanguage();
    isEnglish = langCtx.isEnglish;
    t = langCtx.t;
  } catch {}

  const faqList = faqs && faqs.length > 0 ? faqs : contentStore.getFaqs() || FAQS_DATA;

  // Quick salary calculator interactive widget for employees!
  const [basicPay, setBasicPay] = useState<number>(12500);
  const [workingDays, setWorkingDays] = useState<number>(26);

  // EPF (12%), ESIC (0.75% if gross <= 21000)
  const grossPay = Math.round((basicPay / 26) * workingDays);
  const epfDeduction = Math.round(grossPay * 0.12);
  const esicDeduction = grossPay <= 21000 ? Math.round(grossPay * 0.0075) : 0;
  const inHandSalary = grossPay - epfDeduction - esicDeduction;

  const currentGuide = EMPLOYEE_GUIDES_DATA.find((g) => g.category === selectedCategory) || EMPLOYEE_GUIDES_DATA[0];

  const categories = [
    { label: isEnglish ? 'Salary Estimator' : 'वेतन गणना', key: 'वेतन', icon: CreditCard },
    { label: isEnglish ? 'EPF & UAN' : 'ईपीएफ व यूएएन', key: 'पीएफ', icon: ShieldCheck },
    { label: isEnglish ? 'ESIC Medical' : 'ईएसआई इलाज', key: 'ईएसआई', icon: Stethoscope },
    { label: isEnglish ? 'Contracts & GeM' : 'अनुबंध व जेम', key: 'अनुबंध', icon: FileText },
    { label: isEnglish ? 'Leave Rules' : 'अवकाश नियम', key: 'अवकाश', icon: Calendar },
    { label: isEnglish ? 'Grievance & 1076' : 'शिकायत व 1076', key: 'शिकायत', icon: AlertTriangle },
  ];

  return (
    <section className="w-full py-8 sm:py-12 bg-slate-50/70 border-b border-slate-200">
      <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold mb-2.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isEnglish ? 'Rights & Regulations Portal' : 'अधिकार एवं नियमावली केंद्र'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
            {t('hub.sectionTitle', isEnglish ? 'Outsource Employee Service Hub' : 'आउटसोर्स कर्मचारी जानकारी केंद्र')}
          </h2>
          <p className="text-sm text-slate-600">
            {t('hub.sectionSub', isEnglish ? 'Step-by-step guidance on salary, EPF, ESIC, leave entitlements, and service rules' : 'आपके वेतन, पीएफ, ईएसआई, अवकाश और नियमों की सरल, विस्तृत व मार्गदर्शक चरणबद्ध जानकारी')}
          </p>
        </div>

        {/* Interactive Category Selector Tabs */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const active = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  active
                    ? 'bg-blue-900 text-white shadow-xs scale-102'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* 2-Column Content Area: Active Guide on Left, Interactive Tool / Helplines on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
          {/* Main Selected Guide Card */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs">
            <div className="border-b border-slate-100 pb-4 mb-5">
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                {currentGuide.category} {isEnglish ? 'Guide' : 'मार्गदर्शिका'}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2.5">
                {currentGuide.title}
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                {currentGuide.summary}
              </p>
            </div>

            {/* Actionable Steps List */}
            <div className="space-y-4 mb-6">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-900" />
                {isEnglish ? 'Action Steps & Official Procedure:' : 'कार्यवाही के चरण व प्रक्रिया:'}
              </h4>
              <div className="space-y-2.5">
                {currentGuide.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 font-bold flex items-center justify-center shrink-0 text-xs mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Official Links & Important Notes */}
            {currentGuide.officialLinks && currentGuide.officialLinks.length > 0 && (
              <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2 items-center">
                <span className="text-xs font-bold text-slate-700 mr-2">
                  {isEnglish ? 'Official Portals:' : 'संबंधित आधिकारिक पोर्टल:'}
                </span>
                {currentGuide.officialLinks.map((link, lIdx) => (
                  <a
                    key={lIdx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-900 font-semibold text-xs hover:bg-blue-100 transition border border-blue-200"
                  >
                    <span>{link.label}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: In-Hand Salary Estimator + Helplines */}
          <div className="lg:col-span-4 space-y-6">
            {/* Interactive In-Hand Estimator */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-bold text-sm text-slate-900">
                    {t('hub.calcTitle', isEnglish ? 'In-Hand Salary Estimator' : 'मानदेय कैलकुलेटर (In-Hand Estimator)')}
                  </h4>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                  {isEnglish ? 'ESTIMATED' : 'अनुमानित'}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>{t('hub.calcBasic', isEnglish ? 'Monthly Basic Pay:' : 'मूल वेतन (मंथली बेसिक):')}</span>
                    <span className="font-bold text-slate-900">₹{basicPay.toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min="9000"
                    max="35000"
                    step="500"
                    value={basicPay}
                    onChange={(e) => setBasicPay(Number(e.target.value))}
                    className="w-full accent-blue-900 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>{t('hub.calcDays', isEnglish ? 'Working Days in Month:' : 'उपस्थिति कार्यदिवस:')}</span>
                    <span className="font-bold text-slate-900">{workingDays} {isEnglish ? 'Days' : 'दिन'}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="26"
                    step="1"
                    value={workingDays}
                    onChange={(e) => setWorkingDays(Number(e.target.value))}
                    className="w-full accent-blue-900 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Calculation Breakdown */}
                <div className="bg-slate-50 p-3 rounded-xl space-y-1.5 border border-slate-200/80 font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>{isEnglish ? 'Gross Pay:' : 'ग्रॉस वेतन:'}</span>
                    <span>₹{grossPay.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>- {isEnglish ? 'EPF (12%):' : 'ईपीएफ (12%):'}</span>
                    <span>-₹{epfDeduction.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-amber-700">
                    <span>- {isEnglish ? 'ESIC (0.75%):' : 'ईएसआई (0.75%):'}</span>
                    <span>-₹{esicDeduction.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-emerald-700 text-sm">
                    <span>{isEnglish ? 'Net In-Hand Salary:' : 'शुद्ध इन-हैंड वेतन:'}</span>
                    <span>₹{inHandSalary.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400">
                  {isEnglish
                    ? '* Based on standard statutory labor norms. Final in-hand depends on attendance and contract agreement.'
                    : '* यह गणना मानक श्रम नियमों पर आधारित है। वास्तविक वेतन उपस्थिति रजिस्टर व अनुबंध अनुसार निर्धारित होगा।'}
                </p>
              </div>
            </div>

            {/* Key Emergency Helplines */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <PhoneCall className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-sm">
                  {isEnglish ? 'Important Helpline Numbers' : 'महत्वपूर्ण हेल्पलाइन नंबर'}
                </h4>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="bg-slate-800/80 p-2.5 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-slate-300 block">{isEnglish ? 'CM Helpline Uttar Pradesh' : 'सीएम हेल्पलाइन उत्तर प्रदेश'}</span>
                    <span className="text-amber-300 font-bold text-sm">1076</span>
                  </div>
                  <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded">{isEnglish ? 'Toll Free' : 'टोल-फ्री'}</span>
                </div>

                <div className="bg-slate-800/80 p-2.5 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-slate-300 block">{isEnglish ? 'EPFO National Helpdesk' : 'ईपीएफओ (EPFO) हेल्पडेस्क'}</span>
                    <span className="text-amber-300 font-bold text-sm">1800-118-005</span>
                  </div>
                  <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded">{isEnglish ? 'EPF Help' : 'पीएफ जांच'}</span>
                </div>

                <div className="bg-slate-800/80 p-2.5 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-slate-300 block">{isEnglish ? 'ESIC Medical Assistance' : 'ईएसआईसी (ESIC) मेडिकल सहायता'}</span>
                    <span className="text-amber-300 font-bold text-sm">1800-112-526</span>
                  </div>
                  <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded">24x7</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-900" />
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                {t('hub.faqsTitle', isEnglish ? 'Frequently Asked Questions (FAQ)' : 'अक्सर पूछे जाने वाले प्रश्न (Frequently Asked Questions)')}
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {isEnglish ? 'Common Employee Queries' : 'कर्मचारियों की आम शंकाएं'}
            </span>
          </div>

          <div className="divide-y divide-slate-100 space-y-1">
            {faqList.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className="pt-3 first:pt-0">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full py-2.5 flex items-center justify-between text-left gap-3 group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-900 rounded shrink-0">
                        {faq.category}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-900 transition">
                        {faq.question}
                      </span>
                    </div>
                    <div className="p-1 rounded-full text-slate-400 group-hover:text-slate-600 shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="pb-3 text-xs sm:text-sm text-slate-600 leading-relaxed pl-2 sm:pl-4 border-l-2 border-blue-900 ml-1 mt-1 animate-in fade-in duration-200">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
