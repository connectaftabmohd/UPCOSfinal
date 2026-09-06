import React from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  RefreshCw, 
  UserPlus, 
  CalendarDays, 
  Briefcase, 
  FileCheck2, 
  HeartHandshake,
  ArrowRight,
  Flame
} from 'lucide-react';
import { PageView } from '../types';

interface ImportantUpdatesGridProps {
  onNavigate: (view: PageView) => void;
}

export const ImportantUpdatesGrid: React.FC<ImportantUpdatesGridProps> = ({ onNavigate }) => {
  const updateTopics = [
    {
      id: 'salary',
      title: 'वेतन / मानदेय',
      englishSubtitle: 'Salary & Minimum Wages',
      description: 'न्यूनतम वेतन दरें, डीबीटी भुगतान नियम, वेतन विसंगति और कटौती जांच।',
      icon: CreditCard,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200 group-hover:border-emerald-400',
      badge: 'अनिवार्य',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      action: () => onNavigate({ type: 'employee-hub', tab: 'वेतन' }),
    },
    {
      id: 'pf-esi',
      title: 'PF / ESI',
      englishSubtitle: 'EPFO & ESIC Medical',
      description: 'यूएएन पासबुक जांच, ईएसआई पहचान कार्ड, मुफ्त ओपीडी व दवाइयां।',
      icon: ShieldCheck,
      color: 'bg-blue-50 text-blue-700 border-blue-200 group-hover:border-blue-400',
      badge: 'सामाजिक सुरक्षा',
      badgeColor: 'bg-blue-100 text-blue-800',
      action: () => onNavigate({ type: 'employee-hub', tab: 'पीएफ' }),
    },
    {
      id: 'renewal',
      title: 'अनुबंध नवीनीकरण',
      englishSubtitle: 'Contract Extension',
      description: 'वित्तीय वर्ष समाप्ति पर सेवा विस्तार मानक व एजेंसी बदलाव प्रक्रिया।',
      icon: RefreshCw,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200 group-hover:border-indigo-400',
      badge: 'वार्षिक',
      badgeColor: 'bg-indigo-100 text-indigo-800',
      action: () => onNavigate({ type: 'employee-hub', tab: 'अनुबंध' }),
    },
    {
      id: 'deployment',
      title: 'नई तैनाती व भर्ती',
      englishSubtitle: 'New Deployment & GeM',
      description: 'जेम पोर्टल के जरिए मैनपावर निविदा, रिक्त पदों पर संविदा तैनाती।',
      icon: UserPlus,
      color: 'bg-amber-50 text-amber-700 border-amber-200 group-hover:border-amber-400',
      badge: 'जेम पोर्टल',
      badgeColor: 'bg-amber-100 text-amber-800',
      action: () => onNavigate({ type: 'news-list', category: 'भर्ती एवं तैनाती' }),
    },
    {
      id: 'leave',
      title: 'अवकाश नियमावली',
      englishSubtitle: 'Leave Rules & Rights',
      description: 'आकस्मिक अवकाश (CL), मातृत्व अवकाश व साप्ताहिक सवेतन विश्राम।',
      icon: CalendarDays,
      color: 'bg-rose-50 text-rose-700 border-rose-200 group-hover:border-rose-400',
      badge: 'विधिक अधिकार',
      badgeColor: 'bg-rose-100 text-rose-800',
      action: () => onNavigate({ type: 'employee-hub', tab: 'अवकाश' }),
    },
    {
      id: 'service-conditions',
      title: 'सेवा संबंधी जानकारी',
      englishSubtitle: 'Service Terms & Guidelines',
      description: 'कार्य अवधि, सेवा प्रदाता की जिम्मेदारी व मुख्य नियोक्ता के दायित्व।',
      icon: Briefcase,
      color: 'bg-cyan-50 text-cyan-700 border-cyan-200 group-hover:border-cyan-400',
      badge: 'दिशानिर्देश',
      badgeColor: 'bg-cyan-100 text-cyan-800',
      action: () => onNavigate({ type: 'employee-hub', tab: 'सेवा' }),
    },
    {
      id: 'gov-orders',
      title: 'महत्वपूर्ण शासनादेश',
      englishSubtitle: 'Government Orders',
      description: 'कार्मिक, वित्त, स्वास्थ्य व अन्य विभागों के आधिकारिक परिपत्र।',
      icon: FileCheck2,
      color: 'bg-slate-100 text-slate-800 border-slate-300 group-hover:border-slate-400',
      badge: 'सरकारी आदेश',
      badgeColor: 'bg-slate-200 text-slate-800',
      action: () => onNavigate({ type: 'gov-orders' }),
    },
    {
      id: 'welfare',
      title: 'कर्मचारी कल्याण',
      englishSubtitle: 'Employee Welfare & Relief',
      description: 'दुर्घटना बीमा, सीएम हेल्पलाइन 1076, अनुग्रह राशि व शिकायत निवारण।',
      icon: HeartHandshake,
      color: 'bg-purple-50 text-purple-700 border-purple-200 group-hover:border-purple-400',
      badge: 'कल्याणकारी योजनाएं',
      badgeColor: 'bg-purple-100 text-purple-800',
      action: () => onNavigate({ type: 'employee-hub', tab: 'शिकायत' }),
    },
  ];

  return (
    <section className="py-8 sm:py-10 bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                महत्वपूर्ण अपडेट
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                आउटसोर्सिंग कर्मियों से जुड़े प्रमुख विषय व नियम संग्रह
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-medium self-start sm:self-auto">
            शीघ्र नेविगेशन हेतु विषय चुनें
          </span>
        </div>

        {/* 8-Card Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
          {updateTopics.map((topic) => {
            const Icon = topic.icon;
            return (
              <div
                key={topic.id}
                onClick={topic.action}
                className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${topic.color} transition-transform group-hover:scale-105`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${topic.badgeColor}`}>
                      {topic.badge}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-900 transition leading-tight mb-1">
                    {topic.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium mb-2">
                    {topic.englishSubtitle}
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {topic.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700 group-hover:text-blue-900">
                  <span>जानकारी देखें</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
