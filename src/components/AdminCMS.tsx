import React, { useState } from 'react';
import { 
  PlusCircle, 
  Trash2, 
  FileText, 
  Newspaper, 
  ArrowLeft, 
  Check, 
  RotateCcw,
  Sparkles,
  Building2,
  Lock,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Download,
  Zap,
  RefreshCw
} from 'lucide-react';
import { NewsItem, GovernmentOrder, PageView } from '../types';
import { contentStore } from '../data/contentStore';
import { DEPARTMENTS_DATA } from '../data/mockData';
import { syncSewayojanJobsToNewsBlog } from '../services/sewayojanSyncService';

interface AdminCMSProps {
  news: NewsItem[];
  orders: GovernmentOrder[];
  onRefresh: () => void;
  onNavigate: (view: PageView) => void;
  onOpenBloggerExport?: () => void;
  onOpenSewayojanSync?: () => void;
}

export const AdminCMS: React.FC<AdminCMSProps> = ({
  news,
  orders,
  onRefresh,
  onNavigate,
  onOpenBloggerExport,
  onOpenSewayojanSync,
}) => {
  const [isAuthorized, setIsAuthorized] = useState(() => {
    return sessionStorage.getItem('uposn_editor_auth') === 'true';
  });
  const [passkeyInput, setPasskeyInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<'NEWS' | 'ORDERS'>('NEWS');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSewayojanSyncing, setIsSewayojanSyncing] = useState(false);

  const handleSewayojanAdminSync = async () => {
    setIsSewayojanSyncing(true);
    setSuccessMsg('');
    try {
      const result = await syncSewayojanJobsToNewsBlog();
      onRefresh();
      if (result.newPostsCount > 0) {
        setSuccessMsg(`सेवायोजन पोर्टल से ${result.newPostsCount} नई आउटसोर्स भर्तियां सफलतापूर्वक ब्लॉग में जोड़ी गईं!`);
      } else {
        setSuccessMsg('सेवायोजन पोर्टल की सभी उपलब्ध भर्तियां पहले से ही अद्यतित (Up-to-date) हैं।');
      }
    } catch {
      setSuccessMsg('सिंक करने में त्रुटि आई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsSewayojanSyncing(false);
    }
  };

  // New News form state
  const [newsTitle, setNewsTitle] = useState('');
  const [newsCategory, setNewsCategory] = useState('शासनादेश');
  const [newsDept, setNewsDept] = useState('कार्मिक विभाग, उप्र');
  const [newsDesc, setNewsDesc] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsSource, setNewsSource] = useState('सार्वजनिक शासनादेश पोर्टल / UPCOS');
  const [newsSourceUrl, setNewsSourceUrl] = useState('https://upcos.org');
  const [newsIsFeatured, setNewsIsFeatured] = useState(false);

  // New Order form state
  const [orderNumber, setOrderNumber] = useState('');
  const [orderTitle, setOrderTitle] = useState('');
  const [orderDept, setOrderDept] = useState('कार्मिक अनुभाग-2, उत्तर प्रदेश शासन');
  const [orderCategory, setOrderCategory] = useState('वेतन एवं मानदेय');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [orderYear, setOrderYear] = useState(2026);
  const [orderSummary, setOrderSummary] = useState('');
  const [orderKeyPoints, setOrderKeyPoints] = useState('');
  const [orderSourceUrl, setOrderSourceUrl] = useState('https://shasanadesh.up.gov.in');

  const handleAuthorize = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      passkeyInput.trim() === '1076' || 
      passkeyInput.trim() === 'admin' || 
      passkeyInput.trim().toLowerCase() === 'uposn2026'
    ) {
      sessionStorage.setItem('uposn_editor_auth', 'true');
      setIsAuthorized(true);
      setAuthError('');
    } else {
      setAuthError('अमान्य ऑथराइजेशन कोड। कृपया सही संपादक पासकी (उदा. 1076 या uposn2026) दर्ज करें।');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('uposn_editor_auth');
    setIsAuthorized(false);
  };

  const handlePurgeUnauthorized = () => {
    if (confirm('क्या आप पोर्टल से सभी अनधिकृत, असत्यापित व कस्टम प्रविष्टियां हटाकर प्रामाणिक आधार डेटा पुनर्स्थापित करना चाहते हैं?')) {
      contentStore.purgeUnauthorizedContent();
      onRefresh();
      setSuccessMsg('पोर्टल से समस्त अनधिकृत एवं असत्यापित सामग्री सफलतापूर्वक हटा दी गई!');
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const handleCreateNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim() || !newsDesc.trim()) return;

    const newItem: NewsItem = {
      id: `news-custom-${Date.now()}`,
      slug: newsTitle.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-'),
      departmentId: 'dept-other',
      title: newsTitle,
      shortDescription: newsDesc,
      fullContent: newsContent ? newsContent.split('\n\n') : [newsDesc],
      category: newsCategory,
      department: newsDept,
      publicationDate: new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      publishedTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      author: 'संपादकीय ब्यूरो',
      source: newsSource,
      sourceUrl: newsSourceUrl,
      featuredImage: 'https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?auto=format&fit=crop&q=80&w=800',
      isFeatured: newsIsFeatured,
      readTime: '3 मिनट',
      keyHighlights: ['नया प्रकाशित समाचार', 'नियमों के अनुसार संपादित'],
      tags: ['आउटसोर्सिंग', newsCategory, 'उत्तर प्रदेश'],
    };

    contentStore.addNews(newItem);
    onRefresh();
    setSuccessMsg('नया समाचार सफलतापूर्वक प्रकाशित हुआ!');
    setTimeout(() => setSuccessMsg(''), 3000);

    // Reset fields
    setNewsTitle('');
    setNewsDesc('');
    setNewsContent('');
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !orderTitle.trim()) return;

    const newOrder: GovernmentOrder = {
      id: `order-custom-${Date.now()}`,
      slug: orderNumber.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-'),
      departmentId: 'dept-other',
      orderNumber,
      title: orderTitle,
      department: orderDept,
      category: orderCategory,
      date: orderDate,
      year: Number(orderYear),
      summary: orderSummary,
      keyPoints: orderKeyPoints
        ? orderKeyPoints.split('\n').filter((p) => p.trim().length > 0)
        : ['शासनादेश का विधिवत पालन सुनिश्चित किया जाए।'],
      fileSize: '1.2 MB',
      officialSource: 'उप्र शासन शासनादेश पोर्टल',
      officialSourceUrl: orderSourceUrl,
      isImportant: true,
    };

    contentStore.addOrder(newOrder);
    onRefresh();
    setSuccessMsg('नया शासनादेश सफलतापूर्वक जोड़ा गया!');
    setTimeout(() => setSuccessMsg(''), 3000);

    setOrderNumber('');
    setOrderTitle('');
    setOrderSummary('');
    setOrderKeyPoints('');
  };

  const handleDeleteNews = (id: string) => {
    if (confirm('क्या आप इस समाचार को हटाना चाहते हैं?')) {
      contentStore.deleteNews(id);
      onRefresh();
    }
  };

  const handleDeleteOrder = (id: string) => {
    if (confirm('क्या आप इस शासनादेश को हटाना चाहते हैं?')) {
      contentStore.deleteOrder(id);
      onRefresh();
    }
  };

  const handleReset = () => {
    if (confirm('क्या आप सभी डेटा को डिफ़ॉल्ट स्थिति पर रीसेट करना चाहते हैं?')) {
      contentStore.resetToDefaults();
      onRefresh();
      setSuccessMsg('डेटा सफलतापूर्वक रीसेट हो गया।');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="py-12 bg-slate-50 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-md space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              संपादकीय प्रमाणीकरण आवश्यक
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              अनधिकृत सामग्री के प्रकाशन, संशोधन अथवा पोर्टल पर गलत सूचनाएं अपलोड होने से रोकने हेतु यह सुरक्षा स्तर लागू है। केवल अधिकृत संपादक ही लॉगिन कर सकते हैं।
            </p>
          </div>

          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuthorize} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                संपादक एक्सेस पासकी (Passkey)
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passkeyInput}
                  onChange={(e) => setPasskeyInput(e.target.value)}
                  placeholder="पासकी दर्ज करें (उदा. 1076 या uposn2026)"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-800"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition"
            >
              सत्यापित कर प्रवेश करें
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center">
            <button
              onClick={() => onNavigate({ type: 'home' })}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>पोर्टल के मुख्य पृष्ठ पर लौटें</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <button
              onClick={() => onNavigate({ type: 'home' })}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 hover:text-blue-950 mb-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-2xs transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>मुख्य पृष्ठ पर वापस जाएं</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              संपादकीय सीएमएस (Editorial CMS Portal)
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              समाचार प्रकाशन, शासनादेश प्रबंधन एवं स्थानीय डेटा नियंत्रण
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenBloggerExport && (
              <button
                onClick={onOpenBloggerExport}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl shadow-xs transition cursor-pointer"
                title="ब्लॉगर.कॉम (Blogger.com) थीम XML कोड डाउनलोड करें"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ब्लॉगर थीम (.XML)</span>
              </button>
            )}

            <button
              onClick={handlePurgeUnauthorized}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
              title="पोर्टल से सभी असत्यापित व अनधिकृत प्रविष्टियां हटाएं"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>अनधिकृत सामग्री हटाएं</span>
            </button>

            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition"
              title="डिफ़ॉल्ट डेटा पुनर्स्थापित करें"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>डिफ़ॉल्ट रीसेट</span>
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition"
              title="लॉगआउट"
            >
              <span>लॉगआउट</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded-xl mb-6 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Sewayojan Live Auto-Post Card */}
        <div className="bg-linear-to-r from-emerald-950 via-slate-900 to-blue-950 text-white p-4.5 rounded-2xl mb-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-emerald-800/80">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg shrink-0 shadow-md">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Automated Jobs Scraper
                </span>
                <span className="text-emerald-300 font-mono text-xs">
                  sewayojan.up.nic.in/jobs.aspx
                </span>
              </div>
              <h4 className="font-black text-sm sm:text-base text-white mt-0.5">
                सेवायोजन पोर्टल से ताज़ा खबरें ब्लॉग में आटोमैटिक पोस्टिंग
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                उत्तर प्रदेश रोजगार संगम पोर्टल पर आने वाली संविदा व आउटसोर्सिंग नौकरियों को सीधे स्कैन कर ताज़ा खबरें ब्लॉग में जोड़ने की तकनीक सक्रिय है।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSewayojanAdminSync}
              disabled={isSewayojanSyncing}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSewayojanSyncing ? 'animate-spin' : ''}`} />
              <span>{isSewayojanSyncing ? 'सिंक हो रहा है...' : 'अभी सिंक करें (Sync Now)'}</span>
            </button>

            {onOpenSewayojanSync && (
              <button
                onClick={onOpenSewayojanSync}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/15 transition cursor-pointer"
              >
                <span>कंट्रोल व जॉब्स</span>
              </button>
            )}
          </div>
        </div>

        {/* Blogger Deployment Banner */}
        {onOpenBloggerExport && (
          <div className="bg-linear-to-r from-blue-900 to-slate-900 text-white p-4 rounded-2xl mb-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-blue-800">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg shrink-0">
                B
              </div>
              <div>
                <h4 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                  <span>Blogger.com पर इस पोर्टल को परिनियोजित करें</span>
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                    Theme Code Ready
                  </span>
                </h4>
                <p className="text-xs text-blue-200 mt-0.5">
                  इस पूरे UP Outsource Seva Nigam पोर्टल का ब्लॉगर XML कोड तैयार है। आप सीधे Blogger पर Restore करके अपनी वेबसाइट लाइव कर सकते हैं।
                </p>
              </div>
            </div>

            <button
              onClick={onOpenBloggerExport}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-xs transition cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>ब्लॉगर थीम डाउनलोड व गाइड</span>
            </button>
          </div>
        )}

        {/* Tabs: News vs Government Orders */}
        <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('NEWS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'NEWS'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            <span>समाचार प्रबंधन ({news.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'ORDERS'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>शासनादेश प्रबंधन ({orders.length})</span>
          </button>
        </div>

        {/* 1. NEWS CMS */}
        {activeTab === 'NEWS' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Create Form (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
              <h2 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-blue-900" />
                <span>नया समाचार प्रकाशित करें</span>
              </h2>

              <form onSubmit={handleCreateNews} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    समाचार का शीर्षक (Headline) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newsTitle}
                    onChange={(e) => setNewsTitle(e.target.value)}
                    placeholder="उदा. स्वास्थ्य विभाग में संविदा कर्मियों का मानदेय जारी..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      श्रेणी (Category)
                    </label>
                    <select
                      value={newsCategory}
                      onChange={(e) => setNewsCategory(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                    >
                      <option value="शासनादेश">शासनादेश</option>
                      <option value="वेतन अपडेट">वेतन अपडेट</option>
                      <option value="पीएफ एवं ईएसआई">पीएफ एवं ईएसआई</option>
                      <option value="कर्मचारी समाचार">कर्मचारी समाचार</option>
                      <option value="भर्ती एवं तैनाती">भर्ती एवं तैनाती</option>
                      <option value="विभागीय सूचना">विभागीय सूचना</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      विभाग (Department)
                    </label>
                    <input
                      type="text"
                      value={newsDept}
                      onChange={(e) => setNewsDept(e.target.value)}
                      placeholder="उदा. स्वास्थ्य विभाग"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    संक्षिप्त विवरण (Short Summary) *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={newsDesc}
                    onChange={(e) => setNewsDesc(e.target.value)}
                    placeholder="2 पंक्तियों में समाचार का सारांश..."
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    विस्तृत समाचार (Full Content)
                  </label>
                  <textarea
                    rows={4}
                    value={newsContent}
                    onChange={(e) => setNewsContent(e.target.value)}
                    placeholder="पैराग्राफ अलग करने हेतु दो बार Enter दबाएं..."
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="featuredNews"
                    checked={newsIsFeatured}
                    onChange={(e) => setNewsIsFeatured(e.target.checked)}
                    className="rounded accent-blue-900"
                  />
                  <label htmlFor="featuredNews" className="font-semibold text-slate-700">
                    मुख्य पृष्ठ पर फीचर्ड (Top Headline) बनाएं
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl transition shadow-xs"
                >
                  प्रकाशित करें (Publish)
                </button>
              </form>
            </div>

            {/* List of current news (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
              <h2 className="font-bold text-base text-slate-900 mb-4">
                वर्तमान प्रकाशित समाचार ({news.length})
              </h2>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {news.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-1">
                        <span className="font-bold text-blue-900 bg-blue-100 px-1.5 py-0.2 rounded">
                          {item.category}
                        </span>
                        <span>{item.department}</span>
                        <span>•</span>
                        <span>{item.publicationDate}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-slate-500 line-clamp-1 mt-0.5">
                        {item.shortDescription}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteNews(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition shrink-0"
                      title="हटाएं"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. ORDERS CMS */}
        {activeTab === 'ORDERS' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Create Order Form (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
              <h2 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-amber-800" />
                <span>नया शासनादेश प्रविष्ट करें</span>
              </h2>

              <form onSubmit={handleCreateOrder} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    शासनादेश संख्या (Order Number) *
                  </label>
                  <input
                    type="text"
                    required
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="उदा. 45/2026/1-4-कार्मिक-2"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    शासनादेश का विषय (Title) *
                  </label>
                  <input
                    type="text"
                    required
                    value={orderTitle}
                    onChange={(e) => setOrderTitle(e.target.value)}
                    placeholder="उदा. आउटसोर्स कर्मियों के मानदेय में संशोधन संबंधी..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      विभाग (Department)
                    </label>
                    <input
                      type="text"
                      value={orderDept}
                      onChange={(e) => setOrderDept(e.target.value)}
                      placeholder="उदा. कार्मिक विभाग"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      श्रेणी
                    </label>
                    <select
                      value={orderCategory}
                      onChange={(e) => setOrderCategory(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                    >
                      <option value="वेतन एवं मानदेय">वेतन एवं मानदेय</option>
                      <option value="सेवा शर्तें व सुरक्षा">सेवा शर्तें व सुरक्षा</option>
                      <option value="पीएफ एवं ईएसआई">पीएफ एवं ईएसआई</option>
                      <option value="जेम एवं संविदा">जेम एवं संविदा</option>
                      <option value="अवकाश एवं मातृत्व हितलाभ">अवकाश एवं मातृत्व</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      दिनांक
                    </label>
                    <input
                      type="date"
                      value={orderDate}
                      onChange={(e) => setOrderDate(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      वर्ष
                    </label>
                    <input
                      type="number"
                      value={orderYear}
                      onChange={(e) => setOrderYear(Number(e.target.value))}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    शासनादेश सारांश
                  </label>
                  <textarea
                    rows={2}
                    value={orderSummary}
                    onChange={(e) => setOrderSummary(e.target.value)}
                    placeholder="शासनादेश का संक्षिप्त विवरण..."
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    मुख्य विधिक बिंदु (प्रति पंक्ति एक बिंदु)
                  </label>
                  <textarea
                    rows={3}
                    value={orderKeyPoints}
                    onChange={(e) => setOrderKeyPoints(e.target.value)}
                    placeholder="1. समस्त सेवा प्रदाता ईपीएफ अंशदान जमा करेंगे&#10;2. प्रति माह 7 तारीख तक वेतन भुगतान अनिवार्य"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded-xl transition shadow-xs"
                >
                  शासनादेश सुरक्षित करें
                </button>
              </form>
            </div>

            {/* List of current orders (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
              <h2 className="font-bold text-base text-slate-900 mb-4">
                वर्तमान प्रविष्ट शासनादेश ({orders.length})
              </h2>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-1">
                        <span className="font-mono font-bold text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded">
                          {order.orderNumber}
                        </span>
                        <span>{order.department}</span>
                        <span>•</span>
                        <span>{order.date}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 line-clamp-1">
                        {order.title}
                      </h4>
                      <p className="text-slate-500 line-clamp-1 mt-0.5">
                        {order.summary}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition shrink-0"
                      title="हटाएं"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
