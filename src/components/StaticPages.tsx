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
  BookOpen
} from 'lucide-react';
import { PageView } from '../types';
import { BrandLogo } from './BrandLogo';

interface StaticPageProps {
  type: 'about' | 'contact' | 'privacy' | 'disclaimer';
  onNavigate: (view: PageView) => void;
}

export const StaticPages: React.FC<StaticPageProps> = ({ type, onNavigate }) => {
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    district: '',
    phone: '',
    message: '',
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setFormData({ name: '', department: '', district: '', phone: '', message: '' });
    }, 4000);
  };

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-3 sm:px-6">
        <button
          onClick={() => onNavigate({ type: 'home' })}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 hover:text-blue-950 mb-5 px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-2xs transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>मुख्य पृष्ठ (Home) पर वापस जाएं</span>
        </button>

        {/* 1. ABOUT US PAGE */}
        {type === 'about' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
              <BrandLogo size={52} showText={false} />
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                  हमारे बारे में (About Us)
                </h1>
                <p className="text-xs sm:text-sm text-blue-900 font-semibold">
                  UP Outsource Seva Nigam News &amp; Information • स्वतंत्र सूचना एवं समाचार मंच
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed">
              <p>
                <strong>UP Outsource Seva Nigam News &amp; Information</strong> उत्तर प्रदेश राज्य सरकार के समस्त विभागों, निदेशालयों, परिषदों एवं निगमों में सेवा प्रदाता (मैनपावर सर्विस प्रोवाइडर्स) के माध्यम से कार्यरत आउटसोर्सिंग कार्मिकों के हित में स्थापित एक <em>स्वतंत्र सूचना एवं समाचार मंच</em> है।
              </p>

              <p>
                हमारा मुख्य ध्येय <strong>“आउटसोर्स कर्मचारियों की हर जरूरी खबर, एक जगह”</strong> के संकल्प को साकार करना है। प्रदेश भर में लाखों कर्मचारी स्वास्थ्य विभाग, बेसिक व माध्यमिक शिक्षा, पंचायती राज, नगर विकास, ऊर्जा विभाग (UPPCL), समाज कल्याण, महिला एवं बाल विकास व अन्य सार्वजनिक उपक्रमों में महत्वपूर्ण दायित्व निभा रहे हैं।
              </p>

              <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-5 my-4 space-y-2">
                <h3 className="font-bold text-blue-950 text-base">
                  मंच के मुख्य उद्देश्य:
                </h3>
                <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-slate-800">
                  <li>नवीनतम शासकीय आदेशों एवं शासनादेशों को सरल हिंदी भाषा में उपलब्ध कराना।</li>
                  <li>मानदेय, न्यूनतम मजदूरी संशोधन एवं डीबीटी भुगतान नियमों की समयबद्ध जानकारी देना।</li>
                  <li>ईपीएफ (EPF) व ईएसआई (ESIC) के विधिक अधिकारों व लाभों के प्रति जागरूकता बढ़ाना।</li>
                  <li>जेम (GeM) पोर्टल नियमों, अनुबंध नवीनीकरण व सेवा शर्तों पर स्पष्ट मार्गदर्शन देना।</li>
                  <li>कर्मचारियों की समस्याओं के समाधान हेतु सीएम हेल्पलाइन 1076 व श्रम विभाग के संदर्भ सूत्र प्रदान करना।</li>
                </ul>
              </div>

              <p>
                हमारा प्राथमिक सूचना संदर्भ <strong>UPCOS (https://upcos.org/)</strong> तथा उत्तर प्रदेश शासन का आधिकारिक शासनादेश पोर्टल (shasanadesh.up.gov.in) है।
              </p>
            </div>

            <div className="pt-6 border-t border-slate-100 bg-slate-50 p-4 rounded-xl text-xs text-slate-600 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">गैर-सरकारी अस्वीकरण:</span>
                यह मंच एक स्वतंत्र सूचना माध्यम है और किसी भी सरकारी विभाग अथवा उत्तर प्रदेश सरकार का आधिकारिक निकाय होने का दावा नहीं करता है।
              </div>
            </div>
          </div>
        )}

        {/* 2. CONTACT US PAGE */}
        {type === 'contact' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                संपर्क एवं सुझाव (Contact Us)
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                यदि आपके पास आउटसोर्स कर्मचारियों से जुड़ी कोई खबर, शासनादेश या सुझाव है, तो हमें अवगत कराएं।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-blue-900" />
                    ई-मेल पता
                  </span>
                  <p className="text-slate-600">contact@uposn.in</p>
                  <p className="text-[11px] text-slate-400">सुझाव, संशोधन एवं सूचना अनुरोध हेतु</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-amber-600" />
                    हेल्पलाइन संदर्भ
                  </span>
                  <p className="text-slate-600">सीएम हेल्पलाइन: 1076</p>
                  <p className="text-slate-600">श्रमायुक्त कार्यालय, कानपुर</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-red-600" />
                    स्थान
                  </span>
                  <p className="text-slate-600">लखनऊ, उत्तर प्रदेश - 226001</p>
                </div>
              </div>

              {/* Form */}
              <div className="md:col-span-2 bg-slate-50/70 p-5 sm:p-6 rounded-2xl border border-slate-200">
                {contactSubmitted ? (
                  <div className="text-center py-10 space-y-3">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                    <h3 className="text-lg font-bold text-slate-900">
                      आपका संदेश सफलतापूर्वक प्राप्त हुआ!
                    </h3>
                    <p className="text-xs text-slate-600">
                      हमारी संपादकीय टीम आपके सुझाव/सूचना की समीक्षा करेगी। जनहित में सहयोग के लिए धन्यवाद।
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4 text-xs sm:text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          आपका नाम *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="जैसे: राहुल कुमार"
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-900"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          मोबाइल नंबर
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="10 अंकों का नंबर"
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          विभाग / कार्यालय
                        </label>
                        <input
                          type="text"
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          placeholder="उदा. स्वास्थ्य / शिक्षा / नगर निगम"
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-900"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          जनपद (District)
                        </label>
                        <input
                          type="text"
                          value={formData.district}
                          onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                          placeholder="उदा. लखनऊ / वाराणसी / कानपुर"
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        संदेश या समाचार का विवरण *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="अपनी समस्या, समाचार या शासनादेश का विवरण यहां लिखें..."
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-900"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>संदेश भेजें</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. DISCLAIMER PAGE */}
        {type === 'disclaimer' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <ShieldAlert className="w-8 h-8 text-amber-600 shrink-0" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                  अस्वीकरण एवं नीति (Legal Disclaimer & Transparency)
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  पारदर्शिता, अनधिकृत सूचना निषेध एवं विधिक स्पष्टीकरण
                </p>
              </div>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-600 p-4 rounded-r-xl text-sm sm:text-base text-amber-950 font-semibold leading-relaxed">
              “यह वेबसाइट आउटसोर्स कर्मचारियों के लिए समाचार एवं सूचना उपलब्ध कराने वाला स्वतंत्र सूचना मंच है। यह उत्तर प्रदेश सरकार या किसी सरकारी विभाग की आधिकारिक वेबसाइट नहीं है।”
            </div>

            <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
              <h3 className="font-bold text-slate-900 text-base">
                1. सूचना का स्वरूप:
              </h3>
              <p>
                इस वेबसाइट पर प्रदर्शित समस्त समाचार, शासनादेश विवरण, गाइड एवं वेतन गणना सूचनाएं केवल जन-जागरूकता और शैक्षणिक मार्गदर्शन हेतु उपलब्ध कराई जाती हैं। हम किसी भी प्रकार से उत्तर प्रदेश सरकार का आधिकारिक प्रतिनिधित्व नहीं करते।
              </p>

              <h3 className="font-bold text-slate-900 text-base">
                2. अनधिकृत एवं अपुष्ट सूचनाओं का पूर्ण निषेध (Strict Prohibition of Unauthorized Content):
              </h3>
              <p>
                इस पोर्टल पर किसी भी प्रकार की अनधिकृत, अपुष्ट, भ्रामक, मनगढ़ंत अथवा गोपनीय सरकारी सूचनाओं का प्रकाशन सख्त वर्जित है। सभी प्रकाशित संदर्भ केवल सार्वजनिक डोमेन में जारी आधिकारिक परिपत्रों (shasanadesh.up.gov.in) तथा सार्वजनिक प्रेस विज्ञप्तियों पर आधारित हैं। यदि कोई भी सामग्री अनधिकृत अथवा त्रुटिपूर्ण प्रतीत होती है, तो उसे तत्काल पोर्टल से हटाए जाने का प्रावधान है।
              </p>

              <h3 className="font-bold text-slate-900 text-base">
                3. विधिक सलाह नहीं:
              </h3>
              <p>
                यहाँ दी गई सामग्री को विधिक अथवा कानूनी परामर्श न माना जाए। किसी भी विभागीय विवाद, कानूनी वाद अथवा सेवा संबंधी औपचारिक निर्णय लेने से पूर्व संबंधित कर्मचारी अपने कार्यालय के आहरण-वितरण अधिकारी, श्रम न्यायालय अथवा सक्षम विधिक अधिवक्ता से परामर्श लें।
              </p>

              <h3 className="font-bold text-slate-900 text-base">
                4. मूल शासकीय स्रोतों से मिलान:
              </h3>
              <p>
                यद्यपि हम प्रत्येक शासनादेश और समाचार के संदर्भ की पूरी जांच करते हैं, फिर भी किसी भी त्रुटि या विसंगति के लिए मूल सरकारी गजट अथवा <strong>shasanadesh.up.gov.in</strong> पर उपलब्ध आधिकारिक शासनादेश ही अंतिम एवं सर्वोपरि माना जाएगा।
              </p>
            </div>
          </div>
        )}

        {/* 4. PRIVACY POLICY PAGE */}
        {type === 'privacy' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <ShieldCheck className="w-8 h-8 text-blue-900 shrink-0" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                  गोपनीयता नीति (Privacy Policy)
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  अंतिम अद्यतन: वर्ष 2026
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
              <p>
                <strong>UP Outsource Seva Nigam News &amp; Information</strong> उपयोगकर्ताओं की व्यक्तिगत गोपनीयता का पूर्ण सम्मान करता है। यह नीति स्पष्ट करती है कि हम आपकी जानकारी का संग्रह और उपयोग किस प्रकार करते हैं।
              </p>

              <h3 className="font-bold text-slate-900 text-base">
                1. डेटा संकलन:
              </h3>
              <p>
                हम उपयोगकर्ताओं से कोई भी संवेदनशील व्यक्तिगत डेटा (जैसे बैंक पासवर्ड, यूएएन पासवर्ड या आधार बायोमेट्रिक) कभी नहीं मांगते हैं। संपर्क फॉर्म के माध्यम से स्वेच्छा से भेजा गया नाम व मोबाइल नंबर केवल उत्तर देने हेतु प्रयोग किया जाता है।
              </p>

              <h3 className="font-bold text-slate-900 text-base">
                2. कुकीज़ एवं विश्लेषण:
              </h3>
              <p>
                वेबसाइट के प्रदर्शन एवं पाठकों के अनुभव को सुगम बनाने हेतु सामान्य ब्राउज़र कुकीज़ व वेब एनालिटिक्स का उपयोग किया जाता है।
              </p>

              <h3 className="font-bold text-slate-900 text-base">
                3. तृतीय-पक्ष लिंक:
              </h3>
              <p>
                हमारी वेबसाइट में सुविधा हेतु सरकारी पोर्टलों (shasanadesh.up.gov.in, upcos.org, uplabour.gov.in) के लिंक दिए गए हैं। उन बाहरी वेबसाइटों की गोपनीयता नीतियों के लिए वे स्वयं उत्तरदायी हैं।
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
