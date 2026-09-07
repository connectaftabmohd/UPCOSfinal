import React from 'react';
import { 
  ShieldAlert, 
  Heart, 
  Send, 
  Share2, 
  ExternalLink,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Download,
  Facebook,
  Youtube,
  Twitter,
  Instagram,
  MessageCircle
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { Newsletter } from './Newsletter';
import { PageView } from '../types';

interface FooterProps {
  onNavigate: (view: PageView) => void;
  onOpenBloggerExport?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenBloggerExport }) => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Weekly Newsletter Section */}
        <Newsletter className="mb-10" />

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 border-b border-slate-800">
          {/* Brand & Purpose (Col 1-4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <BrandLogo size={50} showText={false} />
              <div>
                <div className="text-white font-extrabold text-xl tracking-tight font-['Plus_Jakarta_Sans']">
                  UP Outsource <span className="text-red-500">Seva Nigam</span>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mt-0.5">News &amp; Information</span>
                </div>
                <div className="text-xs text-amber-400 font-medium">
                  आउटसोर्स कर्मचारियों की हर जरूरी खबर, एक जगह
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              उत्तर प्रदेश राज्य सरकार के विभिन्न विभागों, निदेशालयों, परिषदों एवं निगमों में सेवा प्रदाता (मैनपावर एजेंसी) के माध्यम से कार्यरत समस्त आउटसोर्स कार्मिकों के लिए समर्पित स्वतंत्र समाचार, शासनादेश एवं सेवा सूचना मंच।
            </p>

            {/* Social Media Links */}
            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-400 block mb-2.5">
                सोशल मीडिया पर जुड़ें (Follow Us):
              </span>
              <div className="flex items-center gap-2">
                {[
                  { 
                    name: 'Facebook', 
                    icon: Facebook, 
                    color: 'hover:bg-[#1877F2] hover:border-[#1877F2] text-slate-300 hover:text-white', 
                    url: 'https://www.facebook.com/people/UP-outsource-Seva-Nigam-News-and-Information/61580301641301/',
                    ariaLabel: 'Facebook - UP Outsource Seva Nigam News and Information'
                  },
                  { 
                    name: 'WhatsApp', 
                    icon: MessageCircle, 
                    color: 'hover:bg-[#25D366] hover:border-[#25D366] text-slate-300 hover:text-white', 
                    url: 'https://whatsapp.com',
                    ariaLabel: 'WhatsApp चैनल व कम्युनिटी'
                  },
                  { 
                    name: 'YouTube', 
                    icon: Youtube, 
                    color: 'hover:bg-[#FF0000] hover:border-[#FF0000] text-slate-300 hover:text-white', 
                    url: 'https://youtube.com',
                    ariaLabel: 'YouTube आधिकारिक चैनल'
                  },
                  { 
                    name: 'X (Twitter)', 
                    icon: Twitter, 
                    color: 'hover:bg-slate-700 hover:border-slate-600 text-slate-300 hover:text-white', 
                    url: 'https://x.com',
                    ariaLabel: 'X (Twitter) आधिकारिक हैंडल'
                  },
                  { 
                    name: 'Instagram', 
                    icon: Instagram, 
                    color: 'hover:bg-pink-600 hover:border-pink-500 text-slate-300 hover:text-white', 
                    url: 'https://instagram.com',
                    ariaLabel: 'Instagram आधिकारिक पेज'
                  },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={s.name}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={s.name}
                      aria-label={s.ariaLabel}
                      className={`w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-110 ${s.color}`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Navigation Links (Col 5-7) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide uppercase">
              त्वरित लिंक (Quick Links)
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate({ type: 'home' })}
                  className="hover:text-amber-400 transition flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>मुख्य पृष्ठ (Home)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate({ type: 'news-list' })}
                  className="hover:text-amber-400 transition flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>ताज़ा समाचार (Latest News)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate({ type: 'gov-orders' })}
                  className="hover:text-amber-400 transition flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>शासनादेश व परिपत्र (Gov Orders)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate({ type: 'departments' })}
                  className="hover:text-amber-400 transition flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>विभागवार सूची (Departments)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate({ type: 'employee-hub' })}
                  className="hover:text-amber-400 transition flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>कर्मचारी जानकारी केंद्र (Employee Hub)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate({ type: 'talk-corner' })}
                  className="hover:text-amber-400 transition flex items-center gap-1.5 font-bold text-amber-300/95"
                >
                  <ChevronRight className="w-3 h-3 text-amber-400" />
                  <span>टॉक कॉर्नर (Talk Corner - संवाद मंच)</span>
                </button>
              </li>
              <li>
                <a
                  href="https://upcos.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 transition flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>UPCOS संदर्भ पोर्टल (upcos.org)</span>
                </a>
              </li>
              {onOpenBloggerExport && (
                <li className="pt-1">
                  <button
                    onClick={onOpenBloggerExport}
                    className="text-amber-400 hover:text-amber-300 transition flex items-center gap-1.5 font-bold cursor-pointer bg-amber-500/10 px-2 py-1 rounded border border-amber-500/30 text-[11px]"
                  >
                    <Download className="w-3 h-3 text-amber-400" />
                    <span>ब्लॉगर थीम डाउनलोड (.XML Theme)</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Legal, Policy & About (Col 8-10) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide uppercase">
              नीति एवं सूचना (Legal & Info)
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate({ type: 'about' })}
                  className="hover:text-amber-400 transition flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>हमारे बारे में (About Us)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate({ type: 'contact' })}
                  className="hover:text-amber-400 transition flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>संपर्क एवं सुझाव (Contact Us)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate({ type: 'disclaimer' })}
                  className="hover:text-amber-400 transition flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>अस्वीकरण (Disclaimer)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate({ type: 'privacy' })}
                  className="hover:text-amber-400 transition flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>गोपनीयता नीति (Privacy Policy)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate({ type: 'admin' })}
                  className="hover:text-amber-400 transition flex items-center gap-1.5 text-slate-400"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>संपादकीय सीएमएस (Editorial CMS)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Helpline Contact Box (Col 11-12) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide uppercase">
              हेल्पलाइन सहायता
            </h4>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>सीएम हेल्पलाइन: 1076</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">contact@uposn.in</span>
              </div>
              <div className="flex items-start gap-2 text-slate-400 text-[11px] pt-1 border-t border-slate-800">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span>लखनऊ, उत्तर प्रदेश (स्वतंत्र सूचना मंच)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mandatory Prominent Non-Government Disclaimer */}
        <div className="my-6 p-4 rounded-xl bg-slate-900/90 border border-amber-900/40 text-xs text-slate-300 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <ShieldAlert className="w-4 h-4" />
            <span>महत्वपूर्ण अस्वीकरण (Mandatory Non-Government Disclaimer):</span>
          </div>
          <p className="leading-relaxed text-slate-300">
            “UP Outsource Seva Nigam News & Information एक स्वतंत्र समाचार एवं सूचना मंच है। यह उत्तर प्रदेश सरकार अथवा किसी सरकारी विभाग की आधिकारिक वेबसाइट नहीं है। यहाँ प्रकाशित सामग्री केवल जन-जागरूकता, कर्मचारियों के कल्याण एवं विधिक जानकारी के उद्देश्य से उपलब्ध कराई जाती है। इस पोर्टल पर किसी भी प्रकार की अनधिकृत, अपुष्ट अथवा गोपनीय सूचना का प्रकाशन पूर्णतः वर्जित है। किसी भी आधिकारिक निर्णय या विधिक कार्यवाही से पूर्व कृपया संबंधित विभाग के मूल शासनादेश (shasanadesh.up.gov.in) अथवा आधिकारिक पोर्टल का अवलोकन अवश्य करें।”
          </p>
        </div>

        {/* Bottom Bar: Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 pt-2">
          <div>
            © 2026 UP Outsource Seva Nigam News &amp; Information. All Rights Reserved.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>डिजिटल सशक्तिकरण • निष्पक्ष सूचना</span>
            <span>Made for UP Outsourced Employees</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
