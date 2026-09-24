import React from 'react';
import { 
  Users, 
  Building2, 
  MapPin, 
  HelpCircle, 
  Briefcase, 
  FileText, 
  CreditCard, 
  Bell, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { PageView } from '../types';

interface WhyJoinSectionProps {
  onNavigate: (view: PageView) => void;
  onOpenDigitalId: () => void;
}

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  action: (props: WhyJoinSectionProps) => void;
}

const scrollToFeedOrNavigate = (props: WhyJoinSectionProps, category?: 'general' | 'official_order' | 'issue' | 'salary' | 'guidance') => {
  props.onNavigate({ type: 'talk-corner', category });
  setTimeout(() => {
    const el = document.getElementById('community-feed-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, 60);
};

const features: FeatureCard[] = [
  {
    id: 'colleagues',
    title: 'Connect with Colleagues',
    description: 'Communicate directly with contractual and outsourced staff across government offices and departments.',
    icon: Users,
    iconBg: 'bg-blue-600',
    action: (props) => scrollToFeedOrNavigate(props, 'general')
  },
  {
    id: 'departments',
    title: 'Share Departmental Updates',
    description: 'Stay updated with department-specific notices, roster rules and circulars instantly.',
    icon: Building2,
    iconBg: 'bg-[#ea580c]',
    action: (props) => props.onNavigate({ type: 'departments' })
  },
  {
    id: 'districts',
    title: '75 District Communities',
    description: 'Dedicated district forums from Lucknow, Kanpur, Prayagraj, Varanasi to Ballia.',
    icon: MapPin,
    iconBg: 'bg-teal-600',
    action: (props) => scrollToFeedOrNavigate(props)
  },
  {
    id: 'qa',
    title: 'Ask Questions & Get Answers',
    description: 'Get peer advice on delayed salary, EPF/ESI queries, leave rules and agency grievances.',
    icon: HelpCircle,
    iconBg: 'bg-[#a21caf]', // magenta/fuchsia
    action: (props) => scrollToFeedOrNavigate(props, 'issue')
  },
  {
    id: 'jobs',
    title: 'Jobs & Opportunities',
    description: 'Track new outsourcing openings, skill certifications, and verified career resources.',
    icon: Briefcase,
    iconBg: 'bg-rose-600',
    action: (props) => props.onNavigate({ type: 'employee-hub' })
  },
  {
    id: 'documents',
    title: 'Documents & Circulars',
    description: 'Download official Govt Orders, grievance application templates, and court judgments.',
    icon: FileText,
    iconBg: 'bg-sky-600',
    action: (props) => props.onNavigate({ type: 'gov-orders' })
  },
  {
    id: 'digital-id',
    title: 'Digital Employee Community ID',
    description: 'Generate a sleek digital community ID card with photo, department, and live QR verification.',
    icon: CreditCard,
    iconBg: 'bg-amber-500',
    action: (props) => props.onOpenDigitalId()
  },
  {
    id: 'alerts',
    title: 'Timely Alerts & Notices',
    description: 'Never miss government notifications on minimum wages, holiday calendars, and bonuses.',
    icon: Bell,
    iconBg: 'bg-emerald-600',
    action: (props) => props.onNavigate({ type: 'news-list' })
  },
  {
    id: 'network',
    title: 'Statewide Employee Network',
    description: 'Full privacy controls ensure your phone number and private documents stay confidential.',
    icon: ShieldCheck,
    iconBg: 'bg-indigo-600',
    action: (props) => scrollToFeedOrNavigate(props)
  }
];

export const WhyJoinSection: React.FC<WhyJoinSectionProps> = (props) => {
  return (
    <section 
      id="why-join-uposn" 
      className="w-full py-5 sm:py-7 bg-slate-50/70 border-b border-slate-200/80"
    >
      <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl md:text-[42px] font-bold font-['Newsreader','Playfair_Display',Georgia,serif] text-slate-900 tracking-tight leading-tight text-balance">
            Why Join <span className="text-[#b85419]">Community</span> of UP Outsource Employees
          </h2>
          <p className="mt-2 text-xs sm:text-[13px] text-slate-500 leading-relaxed font-normal">
            A secure, dedicated ecosystem built to address identity, queries, and advocacy for outsourcing employees.
          </p>
        </div>

        {/* Feature Cards Grid - Small Compact Size */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5 sm:gap-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                id={`feature-card-${feature.id}`}
                onClick={() => feature.action(props)}
                className="bg-white rounded-xl border border-slate-200/90 p-3 sm:p-3.5 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all duration-150 flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    {/* Compact Colored Icon Badge */}
                    <div 
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-white shadow-2xs shrink-0 group-hover:scale-105 transition-transform duration-150 ${feature.iconBg}`}
                    >
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>

                    {/* Feature Title */}
                    <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 leading-snug group-hover:text-amber-800 transition-colors">
                      {feature.title}
                    </h3>
                  </div>

                  {/* Feature Description */}
                  <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {feature.description}
                  </p>
                </div>

                {/* Subtle Interactive Action cue */}
                <div className="mt-2.5 pt-1.5 border-t border-slate-100/80 flex items-center justify-between text-[10px] sm:text-[11px] font-semibold text-slate-400 group-hover:text-amber-700 transition-colors">
                  <span>Explore</span>
                  <ArrowRight className="w-3 h-3 -translate-x-0.5 group-hover:translate-x-0 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
