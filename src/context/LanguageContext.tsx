import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'HI' | 'EN';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  isHindi: boolean;
  isEnglish: boolean;
  t: (key: string, fallback?: string) => string;
  getText: (hiText: string, enText?: string) => string;
}

const DICTIONARY: Record<Language, Record<string, string>> = {
  HI: {
    // Navigation & Header
    'nav.home': 'होम',
    'nav.news': 'ताज़ा खबरें',
    'nav.departments': 'विभाग',
    'nav.govOrders': 'शासनादेश',
    'nav.employeeHub': 'कर्मचारी केंद्र',
    'nav.talkCorner': 'कम्युनिटी फोरम',
    'nav.login': 'लॉगिन',
    'nav.adminPortal': 'एडमिन पोर्टल',
    'nav.search': 'सर्च',
    'nav.idCard': 'डिजिटल आईडी',
    'nav.profile': 'मेरी प्रोफाइल व आईडी',
    'nav.saved': 'सहेजी गई सामग्री',
    'nav.logout': 'लॉगआउट करें',
    'header.badge': 'उत्तर प्रदेश आउटसोर्स संविदा मंच',
    'header.tagline': 'आउटसोर्स कर्मचारियों की हर जरूरी खबर, एक जगह',

    // Ticker
    'ticker.urgent': 'अति आवश्यक सूचना',
    'ticker.readMore': 'क्लिक करके पूरा आदेश पढ़ें',

    // Statewide Hero
    'hero.badge': 'आधिकारिक राज्य स्तरीय आउटसोर्स कर्मचारी नेटवर्क',
    'hero.titleLine1': 'उत्तर प्रदेश के सभी आउटसोर्स कर्मचारियों का',
    'hero.titleLine2': 'एकमात्र संगठित महामंच',
    'hero.subtitle': 'अपने जनपद, विभाग और साथियों से जुड़ें। सेवा संबंधी जरूरी अपडेट साझा करें, चर्चा में भाग लें और अपनी डिजिटल पहचान (ID Card) प्राप्त करें।',
    'hero.btnCommunity': 'कम्युनिटी फीड देखें',
    'hero.btnDigitalId': 'डिजिटल आईडी कार्ड प्राप्त करें',
    'hero.statRegistered': 'पंजीकृत आउटसोर्स कर्मचारी',
    'hero.statDistricts': 'कवर किए गए जनपद',
    'hero.statDepts': 'संबद्ध सरकारी विभाग',
    'hero.statVerified': 'सत्यापित डिजिटल सदस्य',

    // Home Sections
    'home.featuredTitle': 'प्रमुख समाचार एवं मुख्य अपडेट',
    'home.bulletin': 'दैनिक प्रामाणिक बुलेटिन',
    'home.talkCornerBannerTitle': 'टॉक कॉर्नर (Talk Corner) में प्रदेश भर के आउटसोर्स साथियों से जुड़ें',
    'home.talkCornerBannerSub': 'मानदेय, पीएफ, अनुबंध और विभागीय समस्याओं पर विचार रखें, सवाल पूछें, लाइक व कमेंट करें।',
    'home.talkCornerBannerBtn': 'संवाद मंच खोलें',
    'home.readMore': 'पूरा विवरण पढ़ें',
    'home.readTime': 'मिनट का समय',
    'home.views': 'बार देखा गया',

    // Departments Section
    'dept.sectionTitle': 'विभाग-वार आउटसोर्स सूचना एवं शासनादेश',
    'dept.sectionSub': 'उत्तर प्रदेश के प्रमुख विभागों में संविदा व आउटसोर्स पदों के नियम, स्वीकृत पद एवं आदेश',
    'dept.searchPlaceholder': 'विभाग का नाम या पद खोजें (उदा. स्वास्थ्य, ऊर्जा, शिक्षा)...',
    'dept.viewDetails': 'आदेश व पद देखें',
    'dept.employees': 'अनुमानित कर्मचारी',
    'dept.orders': 'शासनादेश उपलब्ध',
    'dept.showMore': 'सभी विभाग देखें',
    'dept.showLess': 'कम विभाग दिखाएं',

    // Employee Hub
    'hub.sectionTitle': 'आउटसोर्स कर्मचारी सेवा केंद्र (Employee Hub)',
    'hub.sectionSub': 'वेतन मानदेय गणना, ईपीएफ-ईएसआई नियम, अवकाश अधिकार और कानूनी शिकायत प्रक्रिया',
    'hub.tabSalary': 'वेतन व इन-हैंड कैलकुलेटर',
    'hub.tabEpf': 'ईपीएफ (PF) नियम',
    'hub.tabEsic': 'ईएसआई स्वास्थ्य लाभ',
    'hub.tabRules': 'शासनादेश व नियम',
    'hub.tabFaq': 'अक्सर पूछे जाने वाले सवाल (FAQ)',
    'hub.calcTitle': 'मासिक इन-हैंड वेतन अनुमानक',
    'hub.calcBasic': 'मासिक मूल मानदेय (Basic Pay ₹)',
    'hub.calcDays': 'महीने में कार्य दिवस (Working Days)',
    'hub.calcGross': 'सकल वेतन (Gross Pay)',
    'hub.calcEpf': 'कर्मचारी ईपीएफ (12%)',
    'hub.calcEsic': 'ईएसआई कटौती (0.75%)',
    'hub.calcInHand': 'खाते में शुद्ध वेतन (Net In-Hand)',
    'hub.faqsTitle': 'आउटसोर्स कर्मचारियों के महत्वपूर्ण सवाल-जवाब',

    // Gov Orders
    'orders.sectionTitle': 'आधिकारिक शासनादेश एवं परिपत्र संग्रह',
    'orders.sectionSub': 'उत्तर प्रदेश शासन द्वारा जारी सत्यापित आउटसोर्सिंग व संविदा संबंधी आदेश',
    'orders.searchPlaceholder': 'शासनादेश संख्या, विषय या विभाग से खोजें...',
    'orders.filterDept': 'सभी विभाग',
    'orders.filterYear': 'सभी वर्ष',
    'orders.downloadPdf': 'आधिकारिक पीडीएफ डाउनलोड',
    'orders.viewDetail': 'पूर्ण विवरण व नियम पढ़ें',

    // Article Detail
    'article.backToHome': 'होम पर वापस जाएँ',
    'article.publishedOn': 'प्रकाशित',
    'article.author': 'स्रोत / लेखक',
    'article.keyHighlights': 'मुख्य बिंदु एवं जरूरी तथ्य',
    'article.copyTable': 'तालिका डेटा कॉपी करें',
    'article.copied': 'कॉपी हो गया!',
    'article.printPdf': 'प्रिंट / PDF सेव करें',
    'article.applyNow': 'आधिकारिक सेवायोजन पोर्टल पर सीधे आवेदन करें',
    'article.shareTitle': 'साथी कर्मचारियों के साथ साझा करें:',
    'article.relatedTitle': 'संबंधित महत्वपूर्ण समाचार एवं शासनादेश',

    // Mobile Bottom Nav
    'mobNav.feed': 'होम',
    'mobNav.departments': 'विभाग',
    'mobNav.talk': 'संवाद',
    'mobNav.orders': 'शासनादेश',
    'mobNav.profile': 'प्रोफाइल',

    // Footer
    'footer.aboutTitle': 'उत्तर प्रदेश आउटसोर्स संविदा मंच',
    'footer.aboutDesc': 'उत्तर प्रदेश राज्य सरकार के विभिन्न विभागों में कार्यरत आउटसोर्स कर्मचारियों के लिए समाचार, शासनादेश, वेतन अपडेट और सेवा संबंधी जानकारी का स्वतंत्र जनमंच।',
    'footer.quickLinks': 'त्वरित लिंक',
    'footer.govPortals': 'आधिकारिक सरकारी पोर्टल',
    'footer.disclaimer': 'डिस्क्लेमर: यह पोर्टल कर्मचारियों की सूचना एवं जन-जागरूकता हेतु संचालित एक स्वतंत्र सूचना मंच है। आधिकारिक संदर्भ हेतु संबंधित विभाग के मूल शासनादेश व सेवायोजन पोर्टल का अवलोकन करें।',
    'footer.copyright': '© 2026 UP Outsource Seva Nigam. सर्वाधिकार सुरक्षित।'
  },
  EN: {
    // Navigation & Header
    'nav.home': 'Home',
    'nav.news': 'Latest News',
    'nav.departments': 'Departments',
    'nav.govOrders': 'Gov Orders',
    'nav.employeeHub': 'Employee Hub',
    'nav.talkCorner': 'Community Forum',
    'nav.login': 'Login',
    'nav.adminPortal': 'Admin Portal',
    'nav.search': 'Search',
    'nav.idCard': 'Digital ID',
    'nav.profile': 'My Profile & ID',
    'nav.saved': 'Saved Items',
    'nav.logout': 'Logout',
    'header.badge': 'UP Outsource & Contractual Network',
    'header.tagline': 'Every vital update for UP outsource employees in one place',

    // Ticker
    'ticker.urgent': 'URGENT NOTICE',
    'ticker.readMore': 'Click to read full government order',

    // Statewide Hero
    'hero.badge': 'Official Statewide Outsource Employee Network',
    'hero.titleLine1': 'The Statewide Community',
    'hero.titleLine2': 'for UP Outsource Employees',
    'hero.subtitle': 'Connect with your district, department, and colleagues. Share vital workplace updates, engage in discussions, and claim your verified digital identity.',
    'hero.btnCommunity': 'Go to Community Feed',
    'hero.btnDigitalId': 'Get Digital ID Card',
    'hero.statRegistered': 'Registered Outsource Employees',
    'hero.statDistricts': 'Districts Across UP',
    'hero.statDepts': 'Government Departments',
    'hero.statVerified': 'Verified Digital Members',

    // Home Sections
    'home.featuredTitle': 'Featured News & Vital Updates',
    'home.bulletin': 'Daily Verified Bulletin',
    'home.talkCornerBannerTitle': 'Connect with Outsource Colleagues in Talk Corner',
    'home.talkCornerBannerSub': 'Discuss wages, EPF, contracts, and departmental policies. Ask questions and share advice.',
    'home.talkCornerBannerBtn': 'Open Forum',
    'home.readMore': 'Read Full Article',
    'home.readTime': 'min read',
    'home.views': 'views',

    // Departments Section
    'dept.sectionTitle': 'Department-Wise Orders & Information',
    'dept.sectionSub': 'Regulations, approved positions, and orders for contractual & outsource employees across UP departments',
    'dept.searchPlaceholder': 'Search department name or designation (e.g., Health, Energy, Education)...',
    'dept.viewDetails': 'View Orders & Posts',
    'dept.employees': 'Estimated Employees',
    'dept.orders': 'Orders Available',
    'dept.showMore': 'View All Departments',
    'dept.showLess': 'Show Fewer',

    // Employee Hub
    'hub.sectionTitle': 'Employee Service Hub',
    'hub.sectionSub': 'Salary calculator, EPF & ESIC norms, leave entitlements, and legal grievance procedures',
    'hub.tabSalary': 'Salary & In-Hand Estimator',
    'hub.tabEpf': 'EPF (PF) Rules',
    'hub.tabEsic': 'ESIC Health Benefits',
    'hub.tabRules': 'Government Orders & Rules',
    'hub.tabFaq': 'Frequently Asked Questions (FAQ)',
    'hub.calcTitle': 'Monthly In-Hand Salary Estimator',
    'hub.calcBasic': 'Monthly Basic Pay (₹)',
    'hub.calcDays': 'Working Days in Month',
    'hub.calcGross': 'Gross Pay',
    'hub.calcEpf': 'Employee EPF (12%)',
    'hub.calcEsic': 'ESIC Deduction (0.75%)',
    'hub.calcInHand': 'Net Take-Home Pay',
    'hub.faqsTitle': 'Important FAQs for Outsource Workers',

    // Gov Orders
    'orders.sectionTitle': 'Official Government Orders & Circulars',
    'orders.sectionSub': 'Verified government orders on outsourcing, minimum wages, and contractual policies in Uttar Pradesh',
    'orders.searchPlaceholder': 'Search by order number, title, or department...',
    'orders.filterDept': 'All Departments',
    'orders.filterYear': 'All Years',
    'orders.downloadPdf': 'Download Official PDF',
    'orders.viewDetail': 'Read Full Order & Rules',

    // Article Detail
    'article.backToHome': 'Back to Home',
    'article.publishedOn': 'Published',
    'article.author': 'Source / Author',
    'article.keyHighlights': 'Key Highlights & Vital Facts',
    'article.copyTable': 'Copy Table Data',
    'article.copied': 'Copied to Clipboard!',
    'article.printPdf': 'Print / Save as PDF',
    'article.applyNow': 'Apply Directly on Official Sewayojan Portal',
    'article.shareTitle': 'Share with Colleagues:',
    'article.relatedTitle': 'Related News & Government Orders',

    // Mobile Bottom Nav
    'mobNav.feed': 'Home',
    'mobNav.departments': 'Depts',
    'mobNav.talk': 'Forum',
    'mobNav.orders': 'Orders',
    'mobNav.profile': 'Profile',

    // Footer
    'footer.aboutTitle': 'UP Outsource Seva Nigam Network',
    'footer.aboutDesc': 'An independent news and information network for outsourced and contractual workers across Uttar Pradesh government departments.',
    'footer.quickLinks': 'Quick Links',
    'footer.govPortals': 'Official Government Portals',
    'footer.disclaimer': 'Disclaimer: This portal is an independent employee informational network. For official administrative orders, please visit shasanadesh.up.gov.in and sewayojan.up.nic.in.',
    'footer.copyright': '© 2026 UP Outsource Seva Nigam. All rights reserved.'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('uposn_language');
    if (saved === 'EN' || saved === 'HI') return saved;
    return 'HI';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('uposn_language', lang);
    document.documentElement.lang = lang === 'HI' ? 'hi' : 'en';
  };

  const toggleLanguage = () => {
    setLanguage(language === 'HI' ? 'EN' : 'HI');
  };

  useEffect(() => {
    document.documentElement.lang = language === 'HI' ? 'hi' : 'en';
  }, [language]);

  const t = (key: string, fallback?: string): string => {
    const langDict = DICTIONARY[language] || DICTIONARY.HI;
    if (langDict[key]) {
      return langDict[key];
    }
    const hiDict = DICTIONARY.HI;
    if (hiDict[key]) {
      return hiDict[key];
    }
    return fallback || key;
  };

  const getText = (hiText: string, enText?: string): string => {
    if (language === 'EN' && enText) {
      return enText;
    }
    return hiText;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        isHindi: language === 'HI',
        isEnglish: language === 'EN',
        t,
        getText
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
