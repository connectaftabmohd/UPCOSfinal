import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle2, 
  FileText, 
  ArrowLeft,
  ExternalLink,
  BookOpen,
  Scale,
  CheckSquare,
  History,
  Copyright,
  Megaphone,
  AlertCircle
} from 'lucide-react';
import { PageView } from '../types';
import { BrandLogo } from './BrandLogo';

export type PolicyPageType = 
  | 'about' 
  | 'contact' 
  | 'privacy' 
  | 'disclaimer'
  | 'terms'
  | 'editorial-policy'
  | 'fact-checking'
  | 'corrections-policy'
  | 'copyright-policy'
  | 'advertise';

interface StaticPageProps {
  type: PolicyPageType;
  onNavigate: (view: PageView) => void;
}

export const StaticPages: React.FC<StaticPageProps> = ({ type, onNavigate }) => {
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    district: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: `[${formData.district}] ${formData.subject}`,
          message: formData.message,
          honeypot
        })
      });

      const data = await res.json();
      setIsSubmitting(false);
      if (res.ok && data.success) {
        setContactSubmitted(true);
        setFormData({ name: '', department: '', district: '', phone: '', email: '', subject: '', message: '' });
      } else {
        setSubmitError(data.error || 'संदेश प्रेषित नहीं हो सका। कृपया पुनः प्रयास करें।');
      }
    } catch (err) {
      setIsSubmitting(false);
      setSubmitError('सर्वर से संपर्क विफल रहा। कृपया बाद में प्रयास करें।');
    }
  };

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-3 sm:px-6">
        <button
          onClick={() => onNavigate({ type: 'home' })}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 hover:text-blue-950 mb-5 px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-2xs transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>मुख्य पृष्ठ (Home) पर वापस जाएं</span>
        </button>

        {/* 1. ABOUT US PAGE */}
        {type === 'about' && (
          <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
              <BrandLogo size={52} showText={false} />
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  हमारे बारे में (About Us)
                </h1>
                <p className="text-xs sm:text-sm text-blue-900 font-semibold mt-0.5">
                  UPCOS – UP Outsource Seva Nigam • स्वतंत्र सूचना एवं जन-जागरूकता पोर्टल
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed">
              <p>
                <strong>UPCOS (UP Outsource Seva Nigam News & Information)</strong> उत्तर प्रदेश राज्य के विभिन्न राजकीय विभागों, निदेशालयों, परिषदों, स्वायत्त निकायों एवं सार्वजनिक उपक्रमों में आउटसोर्सिंग व संविदा पर सेवारत लाखों कार्मिकों तथा रोजगार के इच्छुक युवाओं को समर्पित एक <em>स्वतंत्र, निष्पक्ष एवं गैर-सरकारी सूचना मंच</em> है।
              </p>

              <h2 className="text-lg sm:text-xl font-bold text-slate-900 pt-2">
                1. हमारा विजन एवं मिशन (Our Mission & Vision)
              </h2>
              <p>
                हमारा प्राथमिक उद्देश्य <strong>“आउटसोर्स कर्मचारियों की हर जरूरी खबर, एक जगह”</strong> के संकल्प को साकार करना है। प्रदेश भर के दूरदराज जनपदों में स्वास्थ्य, बेसिक व माध्यमिक शिक्षा, पंचायती राज, नगर विकास, ऊर्जा (UPPCL), समाज कल्याण, महिला एवं बाल विकास (ICDS), परिवहन और पुलिस विभाग में तैनात कर्मचारियों को अक्सर महत्वपूर्ण शासनादेशों, मानदेय संशोधन व ईपीएफ-ईएसआई अधिकारों की प्रामाणिक जानकारी समय पर नहीं मिल पाती। UPCOS इस डिजिटल खाई को पाटने का कार्य करता है।
              </p>

              <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-5 my-4 space-y-2">
                <h3 className="font-bold text-blue-950 text-base">
                  मंच द्वारा प्रदान की जाने वाली मुख्य सुविधाएं:
                </h3>
                <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-slate-800">
                  <li>सत्यापित शासनादेशों (Shasanadesh) का सरल हिंदी भाषा में सार-संक्षेप।</li>
                  <li>न्यूनतम पारिश्रमिक, वेतन दरें तथा इन-हैंड सैलरी गणना टूल्स (Take-Home Calculator)।</li>
                  <li>ईपीएफ (EPF) 12% व ईएसआई (ESI) 0.75% + 3.25% नियोक्ता अंशदान के नियम व पासबुक जांच गाइड।</li>
                  <li>सेवायोजन पोर्टल (sewayojan.up.nic.in) व जेम (GeM) पोर्टल आउटसोर्सिंग भर्ती विज्ञप्तियां।</li>
                  <li>अनुबंध नवीनीकरण, सवेतन साप्ताहिक अवकाश, मातृत्व अवकाश व शिकायत निवारण (CM Helpline 1076) प्रक्रिया।</li>
                </ul>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-slate-900 pt-2">
                2. प्रामाणिक स्रोत एवं गैर-सरकारी पहचान (Independent Identity)
              </h2>
              <p>
                UPCOS किसी भी सरकारी विभाग, मंत्रालय अथवा आउटसोर्सिंग एजेंसी का आधिकारिक प्रवक्ता या भर्ती प्राधिकारी नहीं है। हमारी समस्त सूचनाएं केवल सार्वजनिक डोमेन में जारी आधिकारिक सरकारी गजट (shasanadesh.up.gov.in), सेवायोजन पोर्टल, ईपीएफओ, ईएसआईसी तथा प्रतिष्ठित समाचार पत्रों (अमर उजाला, दैनिक जागरण आदि) के आधार पर गहन शोध उपरांत प्रकाशित की जाती हैं।
              </p>
            </div>

            <div className="pt-6 border-t border-slate-100 bg-slate-50 p-4 rounded-xl text-xs text-slate-600 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">महत्वपूर्ण अस्वीकरण (Mandatory Notice):</span>
                यह पोर्टल पूर्णतः स्वतंत्र है। किसी भी विधिक, प्रशासनिक या वित्तीय कार्यवाही से पूर्व कृपया संबंधित विभाग के मूल सरकारी आदेश (shasanadesh.up.gov.in) का अवलोकन अवश्य करें।
              </div>
            </div>
          </article>
        )}

        {/* 2. CONTACT US PAGE */}
        {type === 'contact' && (
          <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                संपर्क एवं सुझाव (Contact Us)
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                यदि आपके पास आउटसोर्स कर्मचारियों से जुड़ी कोई खबर, शासनादेश, त्रुटि सुधार या सुझाव है, तो सीधे हमारी संपादकीय टीम से संपर्क करें।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-blue-800" />
                    ईमेल संपर्क:
                  </span>
                  <p className="text-slate-600 break-all font-mono text-[11px]">
                    contact@uposn.in
                  </p>
                  <p className="text-[10px] text-slate-400">
                    संपादकीय व सामान्य पूछताछ हेतु 24–48 घंटे में उत्तर दिया जाता है।
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    संपादकीय कार्यालय:
                  </span>
                  <p className="text-slate-600">
                    लखनऊ, उत्तर प्रदेश (स्वतंत्र डिजिटल सूचना डेस्क)
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    सरकारी हेल्पलाइन संदर्भ:
                  </span>
                  <p className="text-slate-600">
                    मुख्यमंत्री हेल्पलाइन: <strong>1076</strong><br />
                    श्रम शिकायत हेल्पलाइन: <strong>155214</strong>
                  </p>
                </div>
              </div>

              {/* Functional Contact Form */}
              <div className="md:col-span-2">
                {contactSubmitted ? (
                  <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 animate-in fade-in duration-200">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                    <h3 className="font-bold text-emerald-950 text-base">
                      आपका संदेश सफलतापूर्वक प्राप्त हुआ!
                    </h3>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      UPCOS संपादकीय टीम से संपर्क करने के लिए धन्यवाद। आपके द्वारा भेजे गए सुझाव अथवा सूचना की समीक्षा की जाएगी।
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          आपका नाम (Full Name) *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="उदा. राहुल शर्मा"
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-900 transition"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          मोबाइल नंबर (Phone) *
                        </label>
                        <input
                          type="tel"
                          required
                          pattern="[0-9]{10}"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="10 अंकों का मोबाइल नंबर"
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-900 transition"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          ईमेल पता (Email)
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="your.email@example.com"
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-900 transition"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          जनपद (District) *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.district}
                          onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                          placeholder="उदा. लखनऊ / प्रयागराज / कानपुर"
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-900 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        विषय (Subject) *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="उदा. वेतन विसंगति / शासनादेश संदर्भ / त्रुटि सुधार"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-900 transition"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        संदेश या समस्या का विवरण (Message) *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="अपनी समस्या, खबर या सुझाव का पूर्ण विवरण यहां लिखें..."
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-900 transition"
                      />
                    </div>

                    <input
                      type="text"
                      name="website_trap"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      style={{ display: 'none' }}
                      tabIndex={-1}
                      autoComplete="off"
                    />

                    {submitError && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                        {submitError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSubmitting ? 'संदेश भेजा जा रहा है...' : 'संदेश भेजें (Submit Message)'}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </article>
        )}

        {/* 3. PRIVACY POLICY PAGE */}
        {type === 'privacy' && (
          <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <ShieldCheck className="w-8 h-8 text-blue-900 shrink-0" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  गोपनीयता नीति (Privacy Policy)
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  पारदर्शिता, डेटा सुरक्षा एवं Google AdSense अनुपालन • अद्यतन: वर्ष 2026
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
              <p>
                <strong>UPCOS (UP Outsource Seva Nigam News & Information)</strong> अपने पाठकों एवं उपयोगकर्ताओं की निजता का पूर्ण सम्मान करता है। यह नीति स्पष्ट करती है कि हमारी वेबसाइट पर विज़िट के दौरान कौन सी सूचनाएं एकत्रित की जाती हैं और उनका उपयोग किस प्रकार किया जाता है।
              </p>

              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                1. सूचना संकलन एवं उपयोग (Information Collection)
              </h2>
              <p>
                हम उपयोगकर्ताओं से कभी भी कोई गोपनीय पासवर्ड, बैंक विवरण, आधार बायोमेट्रिक अथवा ईपीएफओ पासवर्ड नहीं मांगते। संपर्क फॉर्म के माध्यम से स्वेच्छा से भेजा गया नाम, मोबाइल नंबर अथवा ईमेल केवल आपके प्रश्नों का उत्तर देने एवं संवाद हेतु प्रयुक्त होता है।
              </p>

              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                2. कुकीज़ एवं विज्ञापन नीति (Google AdSense & Advertising Cookies)
              </h2>
              <p>
                यह वेबसाइट वेबसाइट के संचालन एवं मुद्रीकरण हेतु <strong>Google AdSense</strong> का उपयोग करती है। गूगल एक तृतीय-पक्ष विक्रेता (Third-Party Vendor) के रूप में हमारी वेबसाइट पर प्रासंगिक विज्ञापन दिखाने के लिए कुकीज़ (Cookies & DART Cookies) का उपयोग करता है:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600 text-xs sm:text-sm">
                <li>गूगल द्वारा विज्ञापन कुकीज़ के उपयोग से वह तथा उसके साझेदार इंटरनेट पर मौजूद अन्य वेबसाइटों पर आपके पिछले विज़िट के आधार पर आपको उपयुक्त एवं प्रासंगिक विज्ञापन दिखा सकते हैं।</li>
                <li>उपयोगकर्ता वैयक्तिकृत विज्ञापनों (Personalized Ads) से बाहर निकलने के लिए <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-700 font-bold hover:underline">Google Ads Settings</a> पर जा सकते हैं।</li>
                <li>वैकल्पिक रूप से, आप <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-blue-700 font-bold hover:underline">aboutads.info</a> पर जाकर तृतीय-पक्ष कुकीज़ को ऑप्ट-आउट कर सकते हैं।</li>
              </ul>

              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                3. वेब एनालिटिक्स एवं सर्वर लॉग्स
              </h2>
              <p>
                वेबसाइट के प्रदर्शन, पेज लोड स्पीड और लोकप्रिय समाचारों का विश्लेषण करने के लिए सामान्य ब्राउज़र लॉग्स (IP एड्रेस, ब्राउज़र प्रकार, विज़िट समय और देखे गए पेजों की संख्या) का गैर-पहचान योग्य रूप में विश्लेषण किया जाता है।
              </p>

              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                4. तृतीय-पक्ष आधिकारिक लिंक
              </h2>
              <p>
                हमारी वेबसाइट में कर्मचारियों की सुविधा हेतु सरकारी पोर्टलों (जैसे shasanadesh.up.gov.in, upcos.org, sewayojan.up.nic.in, epfindia.gov.in) के सीधे लिंक दिए गए हैं। उन बाह्य वेबसाइटों की गोपनीयता नीतियों के लिए वे संबंधित विभाग स्वयं उत्तरदायी हैं।
              </p>
            </div>
          </article>
        )}

        {/* 4. DISCLAIMER PAGE */}
        {type === 'disclaimer' && (
          <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <ShieldAlert className="w-8 h-8 text-amber-600 shrink-0" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  अस्वीकरण नीति (Legal Disclaimer & Transparency)
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  गैर-सरकारी स्पष्टीकरण, अनधिकृत सूचना निषेध एवं दायित्व सीमा
                </p>
              </div>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-600 p-4 rounded-r-xl text-sm sm:text-base text-amber-950 font-semibold leading-relaxed">
              “UPCOS (UP Outsource Seva Nigam News & Information) एक स्वतंत्र समाचार एवं सूचना मंच है। यह उत्तर प्रदेश सरकार, किसी सरकारी विभाग, आयोग अथवा निगम का आधिकारिक निकाय नहीं है।”
            </div>

            <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                1. सूचना का शैक्षिक व मार्गदर्शक स्वरूप:
              </h2>
              <p>
                इस वेबसाइट पर प्रदर्शित समस्त समाचार, शासनादेश विवरण, ईपीएफ-ईएसआई नियम, वेतन दरें एवं भर्ती सूचनाएं केवल जन-जागरूकता और कर्मचारी मार्गदर्शन के उद्देश्य से उपलब्ध कराई जाती हैं।
              </p>

              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                2. भर्ती या रोजगार की कोई गारंटी नहीं:
              </h2>
              <p>
                UPCOS किसी भी पद पर नौकरी, भर्ती या चयन की कोई गारंटी अथवा दावा नहीं करता। आउटसोर्सिंग भर्तियां सेवायोजन पोर्टल (sewayojan.up.nic.in) व अधिकृत सेवा प्रदाता एजेंसियों के माध्यम से शासन के नियमों के तहत ही संपन्न होती हैं। किसी भी बिचौलिये को भर्ती के नाम पर कोई धनराशि न दें।
              </p>

              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                3. मूल सरकारी अभिलेख सर्वोपरि:
              </h2>
              <p>
                यद्यपि हम प्रत्येक शासनादेश और समाचार के तथ्यों का गहन सत्यापन करते हैं, फिर भी किसी भी विसंगति, टाइपिंग त्रुटि या विवाद की स्थिति में संबंधित विभाग द्वारा जारी मूल हस्ताक्षरित सरकारी आदेश (shasanadesh.up.gov.in) ही अंतिम एवं वैधानिक रूप से मान्य होगा।
              </p>
            </div>
          </article>
        )}

        {/* 5. TERMS AND CONDITIONS */}
        {type === 'terms' && (
          <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <Scale className="w-8 h-8 text-blue-900 shrink-0" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  नियम एवं शर्तें (Terms and Conditions)
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  वेबसाइट उपयोग की सामान्य शर्तें एवं दिशानिर्देश
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
              <p>
                इस वेबसाइट का उपयोग करने पर आप निम्नलिखित नियमों एवं शर्तों से पूर्णतः सहमत माने जाएंगे:
              </p>

              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                1. उपयोग की अनुमति:
              </h2>
              <p>
                आप इस पोर्टल पर उपलब्ध सूचनाओं का उपयोग केवल व्यक्तिगत, गैर-व्यावसायिक तथा सूचनात्मक उद्देश्य से कर सकते हैं। किसी भी प्रकार के अनधिकृत स्क्रैपिंग, बॉट संचालन अथवा दुर्भावनापूर्ण साइबर गतिविधि की अनुमति नहीं है।
              </p>

              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                2. बौद्धिक संपदा अधिकार:
              </h2>
              <p>
                वेबसाइट का लेआउट, ब्रांड पहचान, व्याख्यात्मक सारांश तथा डेटा संरचना UPCOS की बौद्धिक संपदा है। सार्वजनिक सरकारी आदेशों को छोड़कर मूल आलेखों का पूर्ण पुनरुत्पादन स्रोत के श्रेय (Attribution) के बिना करना वर्जित है।
              </p>

              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                3. उपयोगकर्ता टिप्पणियां एवं फोरम आचरण:
              </h2>
              <p>
                कम्युनिटी फोरम अथवा कमेंट्स में किसी भी प्रकार की अभद्र भाषा, भ्रामक अफवाह, जातिगत-धार्मिक विद्वेष अथवा अवैध सामग्री पोस्ट करना पूर्णतः प्रतिबंधित है। उल्लंघन की स्थिति में संबंधित उपयोगकर्ता का खाता बिना पूर्व सूचना के निलंबित किया जा सकता है।
              </p>
            </div>
          </article>
        )}

        {/* 6. EDITORIAL POLICY */}
        {type === 'editorial-policy' && (
          <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <FileText className="w-8 h-8 text-emerald-700 shrink-0" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  संपादकीय नीति (Editorial Policy)
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  स्वतंत्रता, सत्यनिष्ठा, वस्तुनिष्ठता एवं पत्रकारिता मूल्य
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
              <p>
                UPCOS कर्मचारी कल्याण, श्रम अधिकार एवं शासकीय पारिश्रमिक के क्षेत्र में निष्पक्ष एवं उत्तरदायी पत्रकारिता के उच्च मानकों का पालन करता है:
              </p>

              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                1. संपादकीय स्वतंत्रता (Editorial Independence):
              </h2>
              <p>
                हमारी संपादकीय टीम किसी भी राजनीतिक दल, सेवा प्रदाता एजेंसी अथवा दबाव समूह के प्रभाव से सर्वथा मुक्त होकर कार्य करती है। प्रकाशित सामग्री का एकमात्र पैमाना कर्मचारियों के विधिक अधिकार एवं वास्तविक सूचना है।
              </p>

              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                2. स्रोत की स्पष्टता (Attribution):
              </h2>
              <p>
                प्रत्येक समाचार व रिपोर्ट में उसके मूल स्रोत (जैसे शासनादेश संख्या, जारीकर्ता अधिकारी, तारीख एवं संदर्भ पोर्टल) का स्पष्ट उल्लेख किया जाता है ताकि पाठक सीधे स्रोत का सत्यापन कर सकें।
              </p>

              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                3. सनसनीखेज शीर्षकों से परहेज:
              </h2>
              <p>
                हम क्लिक-बेट अथवा भ्रामक दावों का सख्त विरोध करते हैं। शीर्षक और विवरण केवल वही होते हैं जो मूल सरकारी परिपत्र में स्पष्ट रूप से उल्लेखित हैं।
              </p>
            </div>
          </article>
        )}

        {/* 7. FACT-CHECKING POLICY */}
        {type === 'fact-checking' && (
          <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <CheckSquare className="w-8 h-8 text-blue-800 shrink-0" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  तथ्य-जांच नीति (Fact-Checking Policy)
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  सत्यापन प्रोटोकॉल, प्राथमिक स्रोत जांच एवं भ्रामक सूचना रोकथाम
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
              <p>
                सोशल मीडिया पर आउटसोर्सिंग एवं संविदा कर्मचारियों के मानदेय तथा नियमितीकरण को लेकर अक्सर फर्जी व भ्रामक परिपत्र प्रसारित होते रहते हैं। UPCOS की तथ्य-जांच प्रणाली इन चरणों का पालन करती है:
              </p>

              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                1. प्राथमिक सरकारी स्रोत से मिलान:
              </h2>
              <p>
                किसी भी शासनादेश को तब तक प्रकाशित नहीं किया जाता जब तक कि उसे उत्तर प्रदेश शासन के आधिकारिक शासनादेश पोर्टल (shasanadesh.up.gov.in) पर डिजिटल हस्ताक्षर अथवा क्यूआर कोड के माध्यम से सत्यापित न कर लिया जाए।
              </p>

              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                2. आधिकारिक सत्यापन:
              </h2>
              <p>
                संबंधित विभाग के नोडल अधिकारी अथवा सार्वजनिक प्रेस विज्ञप्ति के माध्यम से तथ्य की पुष्टि की जाती है।
              </p>

              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                3. भ्रामक खबरों का खंडन:
              </h2>
              <p>
                यदि कोई जाली (Fake) आदेश कर्मचारियों के बीच भ्रम फैला रहा होता है, तो हम तत्काल उसका खंडन एवं सत्यता अपने पोर्टल पर प्रमुखता से जारी करते हैं।
              </p>
            </div>
          </article>
        )}

        {/* 8. CORRECTION AND UPDATE POLICY */}
        {type === 'corrections-policy' && (
          <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <History className="w-8 h-8 text-amber-600 shrink-0" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  संशोधन एवं अद्यतन नीति (Corrections Policy)
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  पारदर्शी त्रुटि सुधार, संपादन समय एवं पाठक प्रतिक्रिया तंत्र
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
              <p>
                UPCOS अपनी गलतियों को तुरंत एवं पारदर्शी रूप से स्वीकार करने तथा सुधारने के लिए प्रतिबद्ध है:
              </p>

              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                1. त्वरित त्रुटि सुधार:
              </h2>
              <p>
                यदि किसी प्रकाशित आलेख, वेतन दर अथवा पद संख्या में तथ्यात्मक भूल पाई जाती है, तो हमारी टीम 24 घंटे के भीतर उसे संशोधित करती है और आलेख के शीर्ष पर "अद्यतन / सुधार नोट" प्रदर्शित करती है।
              </p>

              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                2. पाठक द्वारा त्रुटि की सूचना:
              </h2>
              <p>
                यदि किसी पाठक को किसी लेख में कोई त्रुटि मिलती है, तो वे हमारे <strong>Contact Us</strong> फॉर्म के माध्यम से सीधे सुधार का अनुरोध भेज सकते हैं।
              </p>
            </div>
          </article>
        )}

        {/* 9. COPYRIGHT POLICY */}
        {type === 'copyright-policy' && (
          <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <Copyright className="w-8 h-8 text-slate-700 shrink-0" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  कॉपीराइट एवं बौद्धिक संपदा नीति (Copyright Policy)
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  उचित उपयोग (Fair Use), सार्वजनिक दस्तावेज एवं सामग्री संरक्षण
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
              <p>
                उत्तर प्रदेश सरकार द्वारा जारी शासनादेश एवं गजट सार्वजनिक अभिलेख (Public Records) के अंतर्गत आते हैं। UPCOS उन आदेशों के विश्लेषण, व्याख्यात्मक सार तथा कर्मचारी मार्गदर्शन का सृजन करता है।
              </p>

              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                1. उचित उपयोग (Fair Use):
              </h2>
              <p>
                हमारे द्वारा तैयार की गई मार्गदर्शिकाओं और तालिकाओं को गैर-व्यावसायिक जन-जागरूकता हेतु साझा किया जा सकता है, बशर्ते मूल स्रोत के रूप में UPCOS का लिंक अवश्य दिया जाए।
              </p>

              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                2. कॉपीराइट उल्लंघन सूचना (DMCA / Takedown):
              </h2>
              <p>
                यदि किसी प्रतिलिप्याधिकार धारक को लगता है कि उनकी सामग्री का अनधिकृत उपयोग हुआ है, तो कृपया contact@uposn.in पर लिखित विवरण भेजें। हम त्वरित सत्यापन उपरांत यथोचित कार्यवाही करेंगे।
              </p>
            </div>
          </article>
        )}

        {/* 10. ADVERTISE WITH US */}
        {type === 'advertise' && (
          <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <Megaphone className="w-8 h-8 text-blue-900 shrink-0" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  विज्ञापन दिशानिर्देश (Advertise With Us)
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  नैतिक विज्ञापन, कर्मचारी हित एवं Google AdSense मानक
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
              <p>
                UPCOS उत्तर प्रदेश के 15 लाख से अधिक आउटसोर्सिंग व संविदा कार्मिकों का विश्वसनीय डिजिटल केंद्र है। हम केवल उन्हीं विज्ञापनों को स्वीकार करते हैं जो कर्मचारियों के हितों के अनुकूल हों:
              </p>

              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs sm:text-sm space-y-1">
                <span className="font-bold block text-rose-950 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  सख्त वर्जित विज्ञापन (Strictly Prohibited Ads):
                </span>
                <p>
                  नौकरी दिलाने के नाम पर पैसे मांगने वाली फर्जी एजेंसियां, सट्टेबाजी, भ्रामक वित्तीय योजनाएं अथवा अनधिकृत उत्पाद विज्ञापन पूर्णतः प्रतिबंधित हैं।
                </p>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                स्वीकृत विज्ञापन श्रेणियां:
              </h2>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li>कौशल विकास, कंप्यूटर एवं व्यावसायिक प्रशिक्षण संस्थान।</li>
                <li>प्रतियोगी परीक्षा पुस्तकें, डिजिटल लाइब्रेरी व शैक्षिक सामग्री।</li>
                <li>कर्मचारी बीमा, स्वास्थ्य सुरक्षा व वित्तीय साक्षरता कार्यक्रम।</li>
              </ul>

              <p className="text-xs text-slate-500 pt-2">
                विज्ञापन संबंधी पूछताछ हेतु संपर्क करें: <span className="font-mono text-blue-800 font-bold">contact@uposn.in</span>
              </p>
            </div>
          </article>
        )}
      </div>
    </div>
  );
};
