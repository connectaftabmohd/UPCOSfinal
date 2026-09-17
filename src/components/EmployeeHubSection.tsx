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

interface EmployeeHubSectionProps {
  onNavigate: (view: PageView) => void;
  defaultActiveCategory?: string;
  faqs?: FAQItem[];
}

const guideIcons: Record<string, React.ElementType> = {
  Calculator,
  ShieldCheck,
  Stethoscope,
  FileText,
  AlertTriangle,
  Calendar,
};

export const EmployeeHubSection: React.FC<EmployeeHubSectionProps> = ({
  onNavigate,
  defaultActiveCategory = 'वेतन',
  faqs,
}) => {
  const [selectedCategory, setSelectedCategory] = useState(defaultActiveCategory);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

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
    { label: 'वेतन गणना', key: 'वेतन', icon: CreditCard },
    { label: 'ईपीएफ व यूएएन', key: 'पीएफ', icon: ShieldCheck },
    { label: 'ईएसआई इलाज', key: 'ईएसआई', icon: Stethoscope },
    { label: 'अनुबंध व जेम', key: 'अनुबंध', icon: FileText },
    { label: 'अवकाश नियम', key: 'अवकाश', icon: Calendar },
    { label: 'शिकायत व 1076', key: 'शिकायत', icon: AlertTriangle },
  ];

  return (
    <section className="py-8 sm:py-12 bg-slate-50/70 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold mb-2.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>अधिकार एवं नियमावली केंद्र</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
            आउटसोर्स कर्मचारी जानकारी केंद्र
          </h2>
          <p className="text-sm text-slate-600">
            आपके वेतन, पीएफ, ईएसआई, अवकाश और नियमों की सरल, विस्तृत व मार्गदर्शक चरणबद्ध जानकारी
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
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shrink-0 ${
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
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md mb-2 inline-block">
                  विषय: {currentGuide.category}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  {currentGuide.title}
                </h3>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-5 pb-4 border-b border-slate-100">
              {currentGuide.summary}
            </p>

            {/* Steps Checklist */}
            <div className="space-y-3 mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                कार्यविधि एवं प्रक्रिया (Step-by-Step Guide):
              </h4>
              {currentGuide.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-xs sm:text-sm text-slate-800 leading-relaxed"
                >
                  <span className="w-5 h-5 rounded-full bg-blue-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>

            {/* Important Notes Alert */}
            {currentGuide.importantNotes && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 text-xs text-amber-950">
                <span className="font-bold block mb-1">
                  ⚠️ विशेष ध्यान रखने योग्य बात:
                </span>
                <span>{currentGuide.importantNotes}</span>
              </div>
            )}

            {/* Official Portal Links */}
            {currentGuide.officialLinks && currentGuide.officialLinks.length > 0 && (
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-slate-700">
                  आधिकारिक लिंक:
                </span>
                {currentGuide.officialLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-blue-900 rounded-lg text-xs font-semibold border border-slate-200 transition"
                  >
                    <span>{link.label}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Mini Salary Calculator & Important Contact Numbers */}
          <div className="lg:col-span-4 space-y-6">
            {/* Salary Calculator Widget */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-bold text-sm text-slate-900">
                    मानदेय कैलकुलेटर (In-Hand Estimator)
                  </h4>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                  अनुमानित
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>मूल वेतन (मंथली बेसिक):</span>
                    <span className="font-bold text-slate-900">₹{basicPay.toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min="9000"
                    max="35000"
                    step="500"
                    value={basicPay}
                    onChange={(e) => setBasicPay(Number(e.target.value))}
                    className="w-full accent-blue-900 h-1.5 bg-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>उपस्थिति कार्यदिवस:</span>
                    <span className="font-bold text-slate-900">{workingDays} दिन</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="26"
                    step="1"
                    value={workingDays}
                    onChange={(e) => setWorkingDays(Number(e.target.value))}
                    className="w-full accent-blue-900 h-1.5 bg-slate-200 rounded-lg"
                  />
                </div>

                {/* Calculation Breakdown */}
                <div className="bg-slate-50 p-3 rounded-xl space-y-1.5 border border-slate-200/80 font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>ग्रॉस वेतन:</span>
                    <span>₹{grossPay.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>- ईपीएफ (12%):</span>
                    <span>-₹{epfDeduction.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-amber-700">
                    <span>- ईएसआई (0.75%):</span>
                    <span>-₹{esicDeduction.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-emerald-700 text-sm">
                    <span>शुद्ध इन-हैंड वेतन:</span>
                    <span>₹{inHandSalary.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400">
                  * यह गणना मानक श्रम नियमों पर आधारित है। वास्तविक वेतन उपस्थिति रजिस्टर व अनुबंध अनुसार निर्धारित होगा।
                </p>
              </div>
            </div>

            {/* Key Emergency Helplines */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <PhoneCall className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-sm">
                  महत्वपूर्ण हेल्पलाइन नंबर
                </h4>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="bg-slate-800/80 p-2.5 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-slate-300 block">सीएम हेल्पलाइन उत्तर प्रदेश</span>
                    <span className="text-amber-300 font-bold text-sm">1076</span>
                  </div>
                  <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded">टोल-फ्री</span>
                </div>

                <div className="bg-slate-800/80 p-2.5 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-slate-300 block">ईपीएफओ (EPFO) हेल्पडेस्क</span>
                    <span className="text-amber-300 font-bold text-sm">1800-118-005</span>
                  </div>
                  <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded">पीएफ जांच</span>
                </div>

                <div className="bg-slate-800/80 p-2.5 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-slate-300 block">ईएसआईसी (ESIC) मेडिकल सहायता</span>
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
                अक्सर पूछे जाने वाले प्रश्न (Frequently Asked Questions)
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              कर्मचारियों की आम शंकाएं
            </span>
          </div>

          <div className="divide-y divide-slate-100 space-y-1">
            {faqList.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className="pt-3 first:pt-0">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full py-2.5 flex items-center justify-between text-left gap-3 group"
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
