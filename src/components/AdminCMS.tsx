import React, { useState, useMemo } from 'react';
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
  ShieldCheck,
  AlertTriangle,
  Download,
  Upload,
  Zap,
  RefreshCw,
  Edit3,
  Eye,
  Star,
  Search,
  X,
  Megaphone,
  HelpCircle,
  FolderArchive,
  Globe,
  ExternalLink,
  Save,
  Database,
  LayoutDashboard,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { NewsItem, GovernmentOrder, Department, FAQItem, PageView, Category } from '../types';
import { contentStore } from '../data/contentStore';
import { DEPARTMENTS_DATA } from '../data/mockData';
import { syncSewayojanJobsToNewsBlog } from '../services/sewayojanSyncService';

interface AdminCMSProps {
  news: NewsItem[];
  orders: GovernmentOrder[];
  departments?: Department[];
  tickerItems?: string[];
  faqs?: FAQItem[];
  onRefresh: () => void;
  onNavigate: (view: PageView) => void;
  onOpenBloggerExport?: () => void;
  onOpenSewayojanSync?: () => void;
}

type AdminTab = 'DASHBOARD' | 'NEWS' | 'ORDERS' | 'DEPARTMENTS' | 'TICKER' | 'FAQS' | 'BACKUP';

export const AdminCMS: React.FC<AdminCMSProps> = ({
  news,
  orders,
  departments: propDepartments,
  tickerItems: propTickerItems,
  faqs: propFaqs,
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

  const [activeTab, setActiveTab] = useState<AdminTab>('DASHBOARD');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSewayojanSyncing, setIsSewayojanSyncing] = useState(false);

  // Active data fallback
  const departments = propDepartments || contentStore.getDepartments();
  const tickerItems = propTickerItems || contentStore.getTickerItems();
  const faqs = propFaqs || contentStore.getFaqs();

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4500);
  };

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
      showNotification('प्रशासक पोर्टल में स्वागत है! आप सभी अनुभागों को संपादित कर सकते हैं।');
    } else {
      setAuthError('गलत पासवर्ड! कृपया सही व्यवस्थापक पासवर्ड दर्ज करें।');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('uposn_editor_auth');
    setIsAuthorized(false);
  };

  // -------------------------------------------------------------
  // SEWAYOJAN SYNC HANDLER
  // -------------------------------------------------------------
  const handleSewayojanAdminSync = async () => {
    setIsSewayojanSyncing(true);
    try {
      const result = await syncSewayojanJobsToNewsBlog();
      onRefresh();
      if (result.newPostsCount > 0) {
        showNotification(`सेवायोजन पोर्टल से ${result.newPostsCount} नई आउटसोर्स भर्तियां सफलतापूर्वक पोर्टल में जोड़ी गईं!`);
      } else {
        showNotification('सेवायोजन पोर्टल की सभी उपलब्ध भर्तियां पहले से ही अद्यतित (Up-to-date) हैं।');
      }
    } catch {
      showNotification('सिंक करने में त्रुटि आई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsSewayojanSyncing(false);
    }
  };

  // -------------------------------------------------------------
  // 1. NEWS STATE & CRUD
  // -------------------------------------------------------------
  const [newsSearch, setNewsSearch] = useState('');
  const [newsFilterCat, setNewsFilterCat] = useState('ALL');
  const [isAddNewsOpen, setIsAddNewsOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);

  // New News form state
  const [newsTitle, setNewsTitle] = useState('');
  const [newsCategory, setNewsCategory] = useState<Category>('शासनादेश');
  const [newsDept, setNewsDept] = useState('कार्मिक विभाग, उप्र');
  const [newsDesc, setNewsDesc] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsSource, setNewsSource] = useState('सार्वजनिक शासनादेश पोर्टल / UPCOS');
  const [newsSourceUrl, setNewsSourceUrl] = useState('https://shasanadesh.up.gov.in');
  const [newsIsFeatured, setNewsIsFeatured] = useState(false);
  const [newsImage, setNewsImage] = useState('https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80');

  const filteredNews = useMemo(() => {
    return news.filter((n) => {
      const matchesSearch = n.title.toLowerCase().includes(newsSearch.toLowerCase()) ||
        n.department.toLowerCase().includes(newsSearch.toLowerCase());
      const matchesCat = newsFilterCat === 'ALL' || n.category === newsFilterCat;
      return matchesSearch && matchesCat;
    });
  }, [news, newsSearch, newsFilterCat]);

  const handleCreateNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim() || !newsDesc.trim()) {
      alert('कृपया समाचार का शीर्षक और संक्षिप्त विवरण अवश्य भरें।');
      return;
    }

    const newItem: NewsItem = {
      id: `news-${Date.now()}`,
      slug: `news-${Date.now()}`,
      title: newsTitle.trim(),
      category: newsCategory,
      department: newsDept,
      departmentId: 'general',
      featuredImage: newsImage,
      shortDescription: newsDesc.trim(),
      fullContent: newsContent.trim() ? newsContent.split('\n\n') : [newsDesc.trim()],
      keyHighlights: [
        'उत्तर प्रदेश आउटसोर्सिंग सेवा निगम पोर्टल पर प्रकाशित आधिकारिक विवरण',
        'संबंधित विभाग एवं संविदा कर्मचारियों के लिए महत्वपूर्ण',
      ],
      source: newsSource.trim() || 'UP Outsource Seva Nigam News',
      sourceUrl: newsSourceUrl.trim() || 'https://shasanadesh.up.gov.in',
      publicationDate: new Date().toLocaleDateString('hi-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      publishedTime: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
      author: 'प्रशासनिक संपादक',
      tags: ['उत्तर प्रदेश', 'आउटसोर्सिंग', newsCategory, 'शासनादेश'],
      isFeatured: newsIsFeatured,
      readTime: '3 मिनट',
    };

    contentStore.addNews(newItem);
    onRefresh();
    showNotification('नया समाचार सफलतापूर्वक प्रकाशित किया गया!');
    setIsAddNewsOpen(false);
    // Reset
    setNewsTitle('');
    setNewsDesc('');
    setNewsContent('');
  };

  const handleUpdateNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNews) return;

    contentStore.updateNews(editingNews.id, {
      title: editingNews.title,
      category: editingNews.category,
      department: editingNews.department,
      shortDescription: editingNews.shortDescription,
      source: editingNews.source,
      sourceUrl: editingNews.sourceUrl,
      featuredImage: editingNews.featuredImage,
      isFeatured: editingNews.isFeatured,
      fullContent: Array.isArray(editingNews.fullContent) ? editingNews.fullContent : [editingNews.shortDescription],
    });

    onRefresh();
    setEditingNews(null);
    showNotification('समाचार सफलतापूर्वक अद्यतित (Update) कर दिया गया!');
  };

  const handleDeleteNews = (id: string, title: string) => {
    if (confirm(`क्या आप इस समाचार को हटाना चाहते हैं?\n"${title}"`)) {
      contentStore.deleteNews(id);
      onRefresh();
      showNotification('समाचार पोर्टल से हटा दिया गया।');
    }
  };

  const handleToggleFeaturedNews = (item: NewsItem) => {
    contentStore.updateNews(item.id, { isFeatured: !item.isFeatured });
    onRefresh();
    showNotification(item.isFeatured ? 'मुख्य समाचार से हटाया गया।' : 'मुख्य समाचार (Featured) के रूप में सेट किया गया!');
  };

  // -------------------------------------------------------------
  // 2. ORDERS STATE & CRUD
  // -------------------------------------------------------------
  const [ordersSearch, setOrdersSearch] = useState('');
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<GovernmentOrder | null>(null);

  // New Order Form state
  const [orderNumber, setOrderNumber] = useState('');
  const [orderTitle, setOrderTitle] = useState('');
  const [orderDept, setOrderDept] = useState('कार्मिक अनुभाग-2, उत्तर प्रदेश शासन');
  const [orderCategory, setOrderCategory] = useState('वेतन एवं मानदेय');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [orderYear, setOrderYear] = useState(2026);
  const [orderSummary, setOrderSummary] = useState('');
  const [orderKeyPoints, setOrderKeyPoints] = useState('');
  const [orderSourceUrl, setOrderSourceUrl] = useState('https://shasanadesh.up.gov.in');

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = ordersSearch.toLowerCase();
      return (
        o.title.toLowerCase().includes(q) ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.department.toLowerCase().includes(q)
      );
    });
  }, [orders, ordersSearch]);

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !orderTitle.trim()) {
      alert('कृपया शासनादेश संख्या एवं विषय अवश्य भरें।');
      return;
    }

    const points = orderKeyPoints
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const newOrder: GovernmentOrder = {
      id: `order-${Date.now()}`,
      slug: `order-${Date.now()}`,
      orderNumber: orderNumber.trim(),
      title: orderTitle.trim(),
      department: orderDept,
      departmentId: 'general',
      date: orderDate,
      year: Number(orderYear) || 2026,
      category: orderCategory,
      summary: orderSummary.trim() || orderTitle.trim(),
      keyPoints: points.length > 0 ? points : [
        'आउटसोर्सिंग सेवा प्रदाता एवं विभागों द्वारा अनिवार्य अनुपालन',
        'मानदेय एवं विधिक लाभों के संदर्भ में विशेष निर्देश',
      ],
      officialSource: 'शासनादेश पोर्टल (shasanadesh.up.gov.in)',
      officialSourceUrl: orderSourceUrl.trim() || 'https://shasanadesh.up.gov.in',
      fileSize: '420 KB',
      isImportant: true,
    };

    contentStore.addOrder(newOrder);
    onRefresh();
    showNotification('नया शासनादेश सफलतापूर्वक जोड़ दिया गया!');
    setIsAddOrderOpen(false);
    // Reset
    setOrderNumber('');
    setOrderTitle('');
    setOrderSummary('');
    setOrderKeyPoints('');
  };

  const handleUpdateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    contentStore.updateOrder(editingOrder.id, {
      orderNumber: editingOrder.orderNumber,
      title: editingOrder.title,
      department: editingOrder.department,
      date: editingOrder.date,
      year: editingOrder.year,
      category: editingOrder.category,
      summary: editingOrder.summary,
      officialSourceUrl: editingOrder.officialSourceUrl,
      keyPoints: editingOrder.keyPoints,
    });

    onRefresh();
    setEditingOrder(null);
    showNotification('शासनादेश सफलतापूर्वक अद्यतित कर दिया गया!');
  };

  const handleDeleteOrder = (id: string, num: string) => {
    if (confirm(`क्या आप इस शासनादेश को हटाना चाहते हैं?\n"${num}"`)) {
      contentStore.deleteOrder(id);
      onRefresh();
      showNotification('शासनादेश हटा दिया गया।');
    }
  };

  // -------------------------------------------------------------
  // 3. DEPARTMENTS STATE & CRUD
  // -------------------------------------------------------------
  const [deptSearch, setDeptSearch] = useState('');
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptEngName, setNewDeptEngName] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');
  const [newDeptEmployees, setNewDeptEmployees] = useState('25,000+');
  const [newDeptPortal, setNewDeptPortal] = useState('http://up.gov.in');

  const filteredDepts = useMemo(() => {
    return departments.filter(
      (d) =>
        d.name.toLowerCase().includes(deptSearch.toLowerCase()) ||
        d.englishName.toLowerCase().includes(deptSearch.toLowerCase())
    );
  }, [departments, deptSearch]);

  const handleCreateDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) {
      alert('कृपया विभाग का नाम दर्ज करें।');
      return;
    }

    const newDept: Department = {
      id: `dept-${Date.now()}`,
      name: newDeptName.trim(),
      englishName: newDeptEngName.trim() || newDeptName.trim(),
      iconName: 'Building2',
      description: newDeptDesc.trim() || 'उत्तर प्रदेश शासन के अधीन आउटसोर्सिंग कार्मिकों से संबंधित विभाग।',
      estimatedEmployees: newDeptEmployees.trim() || '10,000+',
      orderCount: 5,
      newsCount: 8,
      nodalPortal: newDeptPortal.trim() || 'http://up.gov.in',
    };

    contentStore.addDepartment(newDept);
    onRefresh();
    showNotification('नया विभाग सफलतापूर्वक जोड़ दिया गया!');
    setIsAddDeptOpen(false);
    setNewDeptName('');
    setNewDeptEngName('');
    setNewDeptDesc('');
  };

  const handleUpdateDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;

    contentStore.updateDepartment(editingDept.id, {
      name: editingDept.name,
      englishName: editingDept.englishName,
      description: editingDept.description,
      estimatedEmployees: editingDept.estimatedEmployees,
      nodalPortal: editingDept.nodalPortal,
    });

    onRefresh();
    setEditingDept(null);
    showNotification('विभाग की जानकारी सफलतापूर्वक अद्यतित कर दी गई!');
  };

  const handleDeleteDept = (id: string, name: string) => {
    if (confirm(`क्या आप इस विभाग को सूची से हटाना चाहते हैं?\n"${name}"`)) {
      contentStore.deleteDepartment(id);
      onRefresh();
      showNotification('विभाग हटा दिया गया।');
    }
  };

  // -------------------------------------------------------------
  // 4. TICKER STATE & CRUD
  // -------------------------------------------------------------
  const [newTickerText, setNewTickerText] = useState('');
  const [editingTickerIdx, setEditingTickerIdx] = useState<number | null>(null);
  const [editingTickerText, setEditingTickerText] = useState('');

  const handleAddTicker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTickerText.trim()) return;
    contentStore.addTickerItem(newTickerText.trim());
    onRefresh();
    setNewTickerText('');
    showNotification('नया ब्रेकिंग टिकर अलर्ट जोड़ दिया गया!');
  };

  const handleSaveTickerEdit = (index: number) => {
    if (!editingTickerText.trim()) return;
    contentStore.updateTickerItem(index, editingTickerText.trim());
    onRefresh();
    setEditingTickerIdx(null);
    showNotification('टिकर संदेश अपडेट कर दिया गया!');
  };

  const handleDeleteTicker = (index: number) => {
    if (confirm('क्या आप इस टिकर संदेश को हटाना चाहते हैं?')) {
      contentStore.deleteTickerItem(index);
      onRefresh();
      showNotification('टिकर संदेश हटा दिया गया।');
    }
  };

  // -------------------------------------------------------------
  // 5. FAQS STATE & CRUD
  // -------------------------------------------------------------
  const [faqCategoryFilter, setFaqCategoryFilter] = useState('ALL');
  const [isAddFaqOpen, setIsAddFaqOpen] = useState(false);
  const [editingFaqIdx, setEditingFaqIdx] = useState<number | null>(null);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);

  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');
  const [newFaqCat, setNewFaqCat] = useState('वेतन');

  const filteredFaqs = useMemo(() => {
    return faqs.filter((f) => {
      return faqCategoryFilter === 'ALL' || f.category === faqCategoryFilter;
    });
  }, [faqs, faqCategoryFilter]);

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQ.trim() || !newFaqA.trim()) {
      alert('कृपया प्रश्न और उत्तर दोनों भरें।');
      return;
    }
    contentStore.addFaq({
      question: newFaqQ.trim(),
      answer: newFaqA.trim(),
      category: newFaqCat,
    });
    onRefresh();
    showNotification('नया FAQ जोड़ दिया गया!');
    setIsAddFaqOpen(false);
    setNewFaqQ('');
    setNewFaqA('');
  };

  const handleSaveFaqEdit = () => {
    if (editingFaqIdx === null || !editingFaq) return;
    contentStore.updateFaq(editingFaqIdx, editingFaq);
    onRefresh();
    setEditingFaqIdx(null);
    setEditingFaq(null);
    showNotification('FAQ सफलतापूर्वक अद्यतित कर दिया गया!');
  };

  const handleDeleteFaq = (index: number) => {
    if (confirm('क्या आप इस FAQ को हटाना चाहते हैं?')) {
      contentStore.deleteFaq(index);
      onRefresh();
      showNotification('FAQ हटा दिया गया।');
    }
  };

  // -------------------------------------------------------------
  // 6. BACKUP & RESTORE
  // -------------------------------------------------------------
  const handleExportBackup = () => {
    const jsonStr = contentStore.exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uposn_portal_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('पोर्टल का सम्पूर्ण बैकअप (JSON File) डाउनलोड हो गया है!');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = contentStore.importFullBackup(content);
        if (res.success) {
          onRefresh();
          showNotification(res.message);
        } else {
          alert(res.message);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetDefaults = () => {
    if (confirm('⚠️ चेतावनी: क्या आप पोर्टल की समस्त सामग्री को मूल प्रामाणिक डिफ़ॉल्ट डेटा में रीसेट करना चाहते हैं? आपकी कस्टम प्रविष्टियां मिट सकती हैं।')) {
      contentStore.resetToDefaults();
      onRefresh();
      showNotification('पोर्टल का समस्त डेटा मूल प्रामाणिक स्थिति में पुनर्स्थापित हो गया!');
    }
  };

  // -------------------------------------------------------------
  // AUTHENTICATION GUARD SCREEN
  // -------------------------------------------------------------
  if (!isAuthorized) {
    return (
      <div className="min-h-[85vh] bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-700/30">
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white text-center relative">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-4 backdrop-blur-xs shadow-inner">
              <Lock className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className="text-xl font-black tracking-tight">
              प्रशासनिक पोर्टल (Admin Portal)
            </h2>
            <p className="text-xs text-blue-200/90 mt-1">
              उत्तर प्रदेश आउटसोर्सिंग सेवा निगम पोर्टल प्रबंधन
            </p>
          </div>

          <form onSubmit={handleAuthorize} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-blue-700" />
                <span>व्यवस्थापक पासवर्ड (Admin Password)</span>
              </label>
              <input
                type="password"
                value={passkeyInput}
                onChange={(e) => setPasskeyInput(e.target.value)}
                placeholder="प्रशासक पासवर्ड दर्ज करें"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-900 focus:outline-hidden font-mono tracking-widest text-center"
                autoFocus
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-900 hover:bg-blue-800 active:bg-blue-950 text-white font-bold text-sm rounded-xl transition shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>प्रशासनिक पोर्टल में प्रवेश करें</span>
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => onNavigate({ type: 'home' })}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>मुख्य वेबसाइट पर वापस जाएं</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHORIZED ADMIN PORTAL INTERFACE
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-100/70 pb-16">
      {/* Top Admin Header Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate({ type: 'home' })}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="मुख्य वेबसाइट पर जाएं"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-xs">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-black tracking-tight leading-tight flex items-center gap-2">
                  <span>उत्तर प्रदेश आउटसोर्सिंग सेवा निगम</span>
                  <span className="text-[10px] bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                    प्रशासनिक पोर्टल (Backend Admin)
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400">
                  समस्त समाचार, शासनादेश, विभाग, टिकर व पोर्टल डेटा प्रबंधन
                </p>
              </div>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2">
            {onOpenSewayojanSync && (
              <button
                onClick={handleSewayojanAdminSync}
                disabled={isSewayojanSyncing}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-60"
                title="सेवायोजन पोर्टल (sewayojan.up.nic.in/jobs.aspx) ऑटो-सिंक"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSewayojanSyncing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">सेवायोजन सिंक</span>
              </button>
            )}

            {onOpenBloggerExport && (
              <button
                onClick={onOpenBloggerExport}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition shadow-2xs cursor-pointer"
                title="ब्लॉगर थीम XML डाउनलोड करें"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ब्लॉगर थीम</span>
              </button>
            )}

            <button
              onClick={() => onNavigate({ type: 'home' })}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden md:inline">वेबसाइट देखें</span>
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-700/60 text-red-200 text-xs font-bold transition cursor-pointer"
              title="लॉगआउट करें"
            >
              <span>लॉगआउट</span>
            </button>
          </div>
        </div>
      </header>

      {/* Global Notification Banner */}
      {successMsg && (
        <div className="bg-emerald-600 text-white text-xs sm:text-sm font-bold py-2.5 px-4 text-center shadow-md animate-in slide-in-from-top duration-200 flex items-center justify-center gap-2 sticky top-[57px] z-20">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="ml-3 text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Admin Content Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-6">
        {/* Navigation Tabs */}
        <div className="flex items-center overflow-x-auto gap-1.5 pb-3 border-b border-slate-300 no-scrollbar mb-6">
          <button
            onClick={() => setActiveTab('DASHBOARD')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition shrink-0 cursor-pointer shadow-2xs ${
              activeTab === 'DASHBOARD'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>डैशबोर्ड (Overview)</span>
          </button>

          <button
            onClick={() => setActiveTab('NEWS')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition shrink-0 cursor-pointer shadow-2xs ${
              activeTab === 'NEWS'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            <span>समाचार एवं लेख ({news.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition shrink-0 cursor-pointer shadow-2xs ${
              activeTab === 'ORDERS'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>शासनादेश ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('DEPARTMENTS')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition shrink-0 cursor-pointer shadow-2xs ${
              activeTab === 'DEPARTMENTS'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>विभाग निर्देशिका ({departments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('TICKER')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition shrink-0 cursor-pointer shadow-2xs ${
              activeTab === 'TICKER'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>ब्रेकिंग टिकर ({tickerItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('FAQS')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition shrink-0 cursor-pointer shadow-2xs ${
              activeTab === 'FAQS'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>कर्मचारी FAQs ({faqs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('BACKUP')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition shrink-0 cursor-pointer shadow-2xs ${
              activeTab === 'BACKUP'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <FolderArchive className="w-4 h-4" />
            <span>बैकअप एवं सेटिंग्स</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {/* ========================================================================= */}
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-6">
            {/* Quick KPI Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
              <div 
                onClick={() => setActiveTab('NEWS')}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center mb-2">
                  <Newspaper className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">{news.length}</div>
                <div className="text-xs text-slate-500 font-bold">समाचार व लेख</div>
              </div>

              <div 
                onClick={() => setActiveTab('ORDERS')}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-400 hover:shadow-md transition cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-900 flex items-center justify-center mb-2">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">{orders.length}</div>
                <div className="text-xs text-slate-500 font-bold">शासनादेश प्रविष्टियां</div>
              </div>

              <div 
                onClick={() => setActiveTab('DEPARTMENTS')}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-900 flex items-center justify-center mb-2">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">{departments.length}</div>
                <div className="text-xs text-slate-500 font-bold">पंजीकृत विभाग</div>
              </div>

              <div 
                onClick={() => setActiveTab('TICKER')}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-md transition cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center mb-2">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">{tickerItems.length}</div>
                <div className="text-xs text-slate-500 font-bold">ब्रेकिंग टिकर अलर्ट्स</div>
              </div>

              <div 
                onClick={() => setActiveTab('FAQS')}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-400 hover:shadow-md transition cursor-pointer col-span-2 md:col-span-1"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-900 flex items-center justify-center mb-2">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">{faqs.length}</div>
                <div className="text-xs text-slate-500 font-bold">अक्सर पूछे जाने वाले सवाल</div>
              </div>
            </div>

            {/* Admin Quick Launchpad */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h2 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>त्वरित प्रशासनिक क्रियाएं (Quick Launchpad)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => {
                    setActiveTab('NEWS');
                    setIsAddNewsOpen(true);
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-900 hover:bg-blue-50/50 transition text-left cursor-pointer group"
                >
                  <div className="font-bold text-sm text-slate-900 group-hover:text-blue-900 flex items-center justify-between">
                    <span>नया समाचार लिखें</span>
                    <PlusCircle className="w-4 h-4 text-blue-700" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">पोर्टल पर नई सूचना या भर्ती प्रकाशित करें</p>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('ORDERS');
                    setIsAddOrderOpen(true);
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-900 hover:bg-indigo-50/50 transition text-left cursor-pointer group"
                >
                  <div className="font-bold text-sm text-slate-900 group-hover:text-indigo-900 flex items-center justify-between">
                    <span>नया शासनादेश जोड़ें</span>
                    <PlusCircle className="w-4 h-4 text-indigo-700" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">नंबर, तिथि व मुख्य बिंदुओं सहित परिपत्र दर्ज करें</p>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('TICKER');
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-amber-900 hover:bg-amber-50/50 transition text-left cursor-pointer group"
                >
                  <div className="font-bold text-sm text-slate-900 group-hover:text-amber-900 flex items-center justify-between">
                    <span>टिकर अलर्ट अपडेट करें</span>
                    <Megaphone className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">शीर्ष लाल ब्रेकिंग पट्टी का संदेश बदलें</p>
                </button>

                <button
                  onClick={handleExportBackup}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-900 hover:bg-emerald-50/50 transition text-left cursor-pointer group"
                >
                  <div className="font-bold text-sm text-slate-900 group-hover:text-emerald-900 flex items-center justify-between">
                    <span>बैकअप डाउनलोड करें</span>
                    <Download className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">1-क्लिक में सम्पूर्ण पोर्टल का JSON बैकअप लें</p>
                </button>
              </div>
            </div>

            {/* System Status & Recent Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>सिस्टम स्थिति एवं डेटाबेस स्वास्थ्य</span>
                </h3>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">डेटाबेस स्थिति:</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">सक्रिय (Persistent LocalStorage Store)</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">सेवायोजन ऑटो-सिंक इंजन:</span>
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">सक्रिय (Realtime Sync Ready)</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">प्रशासक सत्र:</span>
                    <span className="font-bold text-slate-900">सुपर एडमिन (सत्यापित सत्र)</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-500">ब्लॉगर थीम जनरेटर:</span>
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">v2.4 XML Ready</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-700" />
                  <span>हालिया प्रकाशित समाचार</span>
                </h3>
                <div className="space-y-2">
                  {news.slice(0, 4).map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 hover:bg-slate-100/80 transition">
                      <div className="truncate text-xs font-semibold text-slate-800">
                        {item.title}
                      </div>
                      <span className="text-[10px] bg-blue-100 text-blue-900 px-2 py-0.5 rounded font-bold shrink-0">
                        {item.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: NEWS & ARTICLES MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'NEWS' && (
          <div className="space-y-6">
            {/* Action & Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={newsSearch}
                    onChange={(e) => setNewsSearch(e.target.value)}
                    placeholder="समाचार खोजें..."
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                  />
                </div>
                <select
                  value={newsFilterCat}
                  onChange={(e) => setNewsFilterCat(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                >
                  <option value="ALL">सभी श्रेणियां</option>
                  <option value="शासनादेश">शासनादेश</option>
                  <option value="वेतन अपडेट">वेतन अपडेट</option>
                  <option value="भर्ती एवं तैनाती">भर्ती एवं तैनाती</option>
                  <option value="कर्मचारी समाचार">कर्मचारी समाचार</option>
                  <option value="विभागीय सूचना">विभागीय सूचना</option>
                  <option value="पीएफ एवं ईएसआई">पीएफ एवं ईएसआई</option>
                </select>
              </div>

              <button
                onClick={() => setIsAddNewsOpen(!isAddNewsOpen)}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>नया समाचार जोड़ें</span>
              </button>
            </div>

            {/* Add News Form Accordion / Card */}
            {isAddNewsOpen && (
              <form onSubmit={handleCreateNews} className="bg-white p-6 rounded-2xl border border-blue-200 shadow-md space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-black text-blue-900 flex items-center gap-2">
                    <PlusCircle className="w-4 h-4" />
                    <span>नया समाचार अथवा लेख प्रकाशित करें</span>
                  </h3>
                  <button type="button" onClick={() => setIsAddNewsOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">समाचार का शीर्षक (Title) *</label>
                    <input
                      type="text"
                      required
                      value={newsTitle}
                      onChange={(e) => setNewsTitle(e.target.value)}
                      placeholder="उदा. उत्तर प्रदेश आउटसोर्स कर्मचारियों के मानदेय में वृद्धि का आदेश..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">श्रेणी (Category) *</label>
                    <select
                      value={newsCategory}
                      onChange={(e) => setNewsCategory(e.target.value as Category)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                    >
                      <option value="शासनादेश">शासनादेश</option>
                      <option value="वेतन अपडेट">वेतन अपडेट</option>
                      <option value="भर्ती एवं तैनाती">भर्ती एवं तैनाती</option>
                      <option value="कर्मचारी समाचार">कर्मचारी समाचार</option>
                      <option value="विभागीय सूचना">विभागीय सूचना</option>
                      <option value="पीएफ एवं ईएसआई">पीएफ एवं ईएसआई</option>
                      <option value="ताजा खबर">ताजा खबर</option>
                      <option value="अदालत व नियम">अदालत व नियम</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">संबंधित विभाग (Department)</label>
                    <input
                      type="text"
                      value={newsDept}
                      onChange={(e) => setNewsDept(e.target.value)}
                      placeholder="उदा. कार्मिक विभाग / चिकित्सा स्वास्थ्य विभाग"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">आधिकारिक स्रोत (Source Name)</label>
                    <input
                      type="text"
                      value={newsSource}
                      onChange={(e) => setNewsSource(e.target.value)}
                      placeholder="उदा. शासन परिपत्र / shasanadesh.up.gov.in"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">संक्षिप्त विवरण (Short Description) *</label>
                  <textarea
                    required
                    rows={2}
                    value={newsDesc}
                    onChange={(e) => setNewsDesc(e.target.value)}
                    placeholder="1-2 वाक्यों में संक्षिप्त सारांश..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">विस्तृत समाचार सामग्री (Full Content - पैराग्राफ्स)</label>
                  <textarea
                    rows={4}
                    value={newsContent}
                    onChange={(e) => setNewsContent(e.target.value)}
                    placeholder="पैराग्राफ्स अलग करने के लिए दो बार Enter दबाएं..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newsIsFeatured}
                      onChange={(e) => setNewsIsFeatured(e.target.checked)}
                      className="w-4 h-4 text-blue-900 rounded"
                    />
                    <span>मुख्य समाचार बनाएं (Featured in Hero)</span>
                  </label>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>प्रकाशित करें</span>
                  </button>
                </div>
              </form>
            )}

            {/* News List Table / Cards */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                <span>कुल उपलब्ध समाचार: {filteredNews.length}</span>
                <span>क्रियाएं (Actions)</span>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredNews.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      {item.featuredImage && (
                        <img
                          src={item.featuredImage}
                          alt={item.title}
                          className="w-16 h-12 rounded-lg object-cover border border-slate-200 shrink-0 hidden sm:block"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                            {item.category}
                          </span>
                          {item.isFeatured && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              मुख्य खबर
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400 font-medium">
                            {item.publicationDate}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {item.shortDescription}
                        </p>
                      </div>
                    </div>

                    {/* News Actions */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleToggleFeaturedNews(item)}
                        className={`p-2 rounded-lg transition text-xs font-bold flex items-center gap-1 cursor-pointer ${
                          item.isFeatured ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                        title={item.isFeatured ? 'मुख्य खबर से हटाएं' : 'मुख्य खबर बनाएं'}
                      >
                        <Star className={`w-3.5 h-3.5 ${item.isFeatured ? 'fill-amber-500 text-amber-500' : ''}`} />
                      </button>

                      <button
                        onClick={() => setEditingNews({ ...item })}
                        className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 transition text-xs font-bold flex items-center gap-1 cursor-pointer"
                        title="संपादित करें"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">संपादित करें</span>
                      </button>

                      <button
                        onClick={() => onNavigate({ type: 'news-detail', id: item.id })}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition text-xs font-bold flex items-center gap-1 cursor-pointer"
                        title="वेबसाइट पर देखें"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteNews(item.id, item.title)}
                        className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 transition text-xs font-bold cursor-pointer"
                        title="हटाएं"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: GOVERNMENT ORDERS MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'ORDERS' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={ordersSearch}
                  onChange={(e) => setOrdersSearch(e.target.value)}
                  placeholder="शासनादेश संख्या या विषय खोजें..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                />
              </div>

              <button
                onClick={() => setIsAddOrderOpen(!isAddOrderOpen)}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>नया शासनादेश जोड़ें</span>
              </button>
            </div>

            {/* Add Order Form */}
            {isAddOrderOpen && (
              <form onSubmit={handleCreateOrder} className="bg-white p-6 rounded-2xl border border-blue-200 shadow-md space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-black text-blue-900 flex items-center gap-2">
                    <PlusCircle className="w-4 h-4" />
                    <span>नया सरकारी शासनादेश / परिपत्र प्रविष्ट करें</span>
                  </h3>
                  <button type="button" onClick={() => setIsAddOrderOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">शासनादेश संख्या (Order Number) *</label>
                    <input
                      type="text"
                      required
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      placeholder="उदा. शासनादेश सं. 54/2026/1102-कार्मिक-2"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">विभाग (Department)</label>
                    <input
                      type="text"
                      value={orderDept}
                      onChange={(e) => setOrderDept(e.target.value)}
                      placeholder="उदा. कार्मिक अनुभाग-2, उत्तर प्रदेश शासन"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">विषय (Title / Subject) *</label>
                  <input
                    type="text"
                    required
                    value={orderTitle}
                    onChange={(e) => setOrderTitle(e.target.value)}
                    placeholder="उदा. आउटसोर्सिंग कार्मिकों के मानदेय का समयबद्ध भुगतान सुनिश्चित किए जाने विषयक..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">दिनांक (Date)</label>
                    <input
                      type="text"
                      value={orderDate}
                      onChange={(e) => setOrderDate(e.target.value)}
                      placeholder="उदा. 12 मार्च 2026"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">श्रेणी (Category)</label>
                    <input
                      type="text"
                      value={orderCategory}
                      onChange={(e) => setOrderCategory(e.target.value)}
                      placeholder="उदा. वेतन एवं मानदेय"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">वर्ष (Year)</label>
                    <input
                      type="number"
                      value={orderYear}
                      onChange={(e) => setOrderYear(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">आदेश सारांश (Summary)</label>
                  <textarea
                    rows={2}
                    value={orderSummary}
                    onChange={(e) => setOrderSummary(e.target.value)}
                    placeholder="शासनादेश का मुख्य सार..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">मुख्य बिंदु (Key Points - प्रति पंक्ति एक बिंदु)</label>
                  <textarea
                    rows={3}
                    value={orderKeyPoints}
                    onChange={(e) => setOrderKeyPoints(e.target.value)}
                    placeholder="प्रत्येक बिंदु नई पंक्ति में लिखें..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>शासनादेश सुरक्षित करें</span>
                  </button>
                </div>
              </form>
            )}

            {/* Orders List */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                <span>कुल शासनादेश: {filteredOrders.length}</span>
                <span>प्रबंधन (Actions)</span>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="p-4 hover:bg-slate-50 transition flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold bg-slate-100 border border-slate-300 px-2 py-0.5 rounded text-slate-800">
                          {order.orderNumber}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                          {order.category}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {order.date}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {order.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {order.department}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => setEditingOrder({ ...order })}
                        className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 transition text-xs font-bold flex items-center gap-1 cursor-pointer"
                        title="संपादित करें"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">संपादित करें</span>
                      </button>

                      <button
                        onClick={() => onNavigate({ type: 'gov-order-detail', id: order.id })}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition text-xs font-bold flex items-center gap-1 cursor-pointer"
                        title="देखें"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteOrder(order.id, order.orderNumber)}
                        className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 transition text-xs font-bold cursor-pointer"
                        title="हटाएं"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: DEPARTMENTS MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'DEPARTMENTS' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={deptSearch}
                  onChange={(e) => setDeptSearch(e.target.value)}
                  placeholder="विभाग खोजें..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                />
              </div>

              <button
                onClick={() => setIsAddDeptOpen(!isAddDeptOpen)}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>नया विभाग जोड़ें</span>
              </button>
            </div>

            {/* Add Department Form */}
            {isAddDeptOpen && (
              <form onSubmit={handleCreateDept} className="bg-white p-6 rounded-2xl border border-blue-200 shadow-md space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-black text-blue-900 flex items-center gap-2">
                    <PlusCircle className="w-4 h-4" />
                    <span>नया सरकारी विभाग जोड़ें</span>
                  </h3>
                  <button type="button" onClick={() => setIsAddDeptOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">विभाग का नाम (हिन्दी) *</label>
                    <input
                      type="text"
                      required
                      value={newDeptName}
                      onChange={(e) => setNewDeptName(e.target.value)}
                      placeholder="उदा. परिवहन निगम / जल निगम"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">विभाग का नाम (अंग्रेजी / English)</label>
                    <input
                      type="text"
                      value={newDeptEngName}
                      onChange={(e) => setNewDeptEngName(e.target.value)}
                      placeholder="उदा. Transport Department"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">संक्षिप्त विवरण (Description)</label>
                  <textarea
                    rows={2}
                    value={newDeptDesc}
                    onChange={(e) => setNewDeptDesc(e.target.value)}
                    placeholder="विभाग में कार्यरत आउटसोर्सिंग पदों और कार्य का विवरण..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">अनुमानित कार्मिक संख्या (Estimated Employees)</label>
                    <input
                      type="text"
                      value={newDeptEmployees}
                      onChange={(e) => setNewDeptEmployees(e.target.value)}
                      placeholder="उदा. 35,000+"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">आधिकारिक नोडल पोर्टल (Nodal Website URL)</label>
                    <input
                      type="text"
                      value={newDeptPortal}
                      onChange={(e) => setNewDeptPortal(e.target.value)}
                      placeholder="http://..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>विभाग सहेजें</span>
                  </button>
                </div>
              </form>
            )}

            {/* Departments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDepts.map((dept) => (
                <div key={dept.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-xs">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{dept.name}</h4>
                          <span className="text-[11px] text-slate-500 font-medium">{dept.englishName}</span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">
                        {dept.estimatedEmployees}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                      {dept.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                    {dept.nodalPortal ? (
                      <a
                        href={dept.nodalPortal}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-blue-700 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>नोडल पोर्टल</span>
                      </a>
                    ) : <span />}

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setEditingDept({ ...dept })}
                        className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 transition text-xs font-bold cursor-pointer"
                        title="संपादित करें"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDept(dept.id, dept.name)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 transition text-xs font-bold cursor-pointer"
                        title="हटाएं"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: BREAKING TICKER MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'TICKER' && (
          <div className="space-y-6">
            {/* Live Ticker Preview */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-white shadow-md">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-amber-400">
                <Megaphone className="w-4 h-4 animate-pulse" />
                <span>लाइव टिकर पूर्वावलोकन (Live Homepage Preview)</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-xs sm:text-sm font-medium text-slate-100 truncate">
                {tickerItems[0] || 'कोई सक्रिय टिकर संदेश नहीं है।'}
              </div>
            </div>

            {/* Add Ticker Input Form */}
            <form onSubmit={handleAddTicker} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4 text-blue-900" />
                <span>नया ब्रेकिंग टिकर अलर्ट जोड़ें</span>
              </h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newTickerText}
                  onChange={(e) => setNewTickerText(e.target.value)}
                  placeholder="उदा. उत्तर प्रदेश शासन: मानदेय भुगतान की 7 तारीख अनिवार्य करने का कड़ा निर्देश..."
                  className="flex-1 px-3 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>टिकर में जोड़ें</span>
                </button>
              </div>
            </form>

            {/* Ticker Items List */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                <span>सक्रिय टिकर संदेश ({tickerItems.length})</span>
                <span>क्रियाएं</span>
              </div>

              <div className="divide-y divide-slate-100">
                {tickerItems.map((text, idx) => (
                  <div key={idx} className="p-3.5 hover:bg-slate-50 transition flex items-center justify-between gap-3">
                    {editingTickerIdx === idx ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editingTickerText}
                          onChange={(e) => setEditingTickerText(e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-blue-400 rounded-lg text-xs font-medium focus:outline-hidden"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveTickerEdit(idx)}
                          className="p-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                          title="सहेजें"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingTickerIdx(null)}
                          className="p-1.5 rounded-lg bg-slate-200 text-slate-700 text-xs"
                          title="रद्द करें"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[11px] font-mono font-bold shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-xs sm:text-sm text-slate-800 font-medium truncate">
                            {text}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              setEditingTickerIdx(idx);
                              setEditingTickerText(text);
                            }}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 transition text-xs font-bold cursor-pointer"
                            title="संपादित करें"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTicker(idx)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 transition text-xs font-bold cursor-pointer"
                            title="हटाएं"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: FAQS MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'FAQS' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">श्रेणी फ़िल्टर:</span>
                <select
                  value={faqCategoryFilter}
                  onChange={(e) => setFaqCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden"
                >
                  <option value="ALL">सभी श्रेणियां</option>
                  <option value="वेतन">वेतन</option>
                  <option value="पीएफ">पीएफ</option>
                  <option value="ईएसआई">ईएसआई</option>
                  <option value="भर्ती">भर्ती</option>
                  <option value="सामान्य">सामान्य</option>
                </select>
              </div>

              <button
                onClick={() => setIsAddFaqOpen(!isAddFaqOpen)}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>नया FAQ जोड़ें</span>
              </button>
            </div>

            {/* Add FAQ Form */}
            {isAddFaqOpen && (
              <form onSubmit={handleAddFaq} className="bg-white p-6 rounded-2xl border border-blue-200 shadow-md space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-black text-blue-900 flex items-center gap-2">
                    <PlusCircle className="w-4 h-4" />
                    <span>नया प्रश्न एवं उत्तर प्रविष्ट करें</span>
                  </h3>
                  <button type="button" onClick={() => setIsAddFaqOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">प्रश्न (Question) *</label>
                    <input
                      type="text"
                      required
                      value={newFaqQ}
                      onChange={(e) => setNewFaqQ(e.target.value)}
                      placeholder="उदा. क्या आउटसोर्स कर्मचारियों को अवकाश का अधिकार है?"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">श्रेणी (Category)</label>
                    <select
                      value={newFaqCat}
                      onChange={(e) => setNewFaqCat(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold focus:outline-hidden"
                    >
                      <option value="वेतन">वेतन</option>
                      <option value="पीएफ">पीएफ</option>
                      <option value="ईएसआई">ईएसआई</option>
                      <option value="भर्ती">भर्ती</option>
                      <option value="सामान्य">सामान्य</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">उत्तर (Answer) *</label>
                  <textarea
                    required
                    rows={3}
                    value={newFaqA}
                    onChange={(e) => setNewFaqA(e.target.value)}
                    placeholder="सरल एवं मार्गदर्शक उत्तर लिखें..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>FAQ सुरक्षित करें</span>
                  </button>
                </div>
              </form>
            )}

            {/* FAQs List */}
            <div className="space-y-3">
              {filteredFaqs.map((faq, index) => (
                <div key={index} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between gap-2">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-900">
                        {faq.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingFaqIdx(index);
                            setEditingFaq({ ...faq });
                          }}
                          className="p-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs cursor-pointer"
                          title="संपादित करें"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteFaq(index)}
                          className="p-1 rounded bg-red-50 hover:bg-red-100 text-red-700 text-xs cursor-pointer"
                          title="हटाएं"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      {faq.question}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: BACKUP, RESTORE & MIGRATION */}
        {/* ========================================================================= */}
        {activeTab === 'BACKUP' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-base font-black text-slate-900 mb-2 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-900" />
                <span>सम्पूर्ण पोर्टल डेटा बैकअप एवं माइग्रेशन (Data Backup & Restore)</span>
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                वेबसाइट के समस्त समाचार, शासनादेश, विभाग, टिकर और FAQs का सम्पूर्ण 1-क्लिक JSON बैकअप लें अथवा नई मशीन/ब्राउज़र में रीस्टोर करें।
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Export Card */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                      <Download className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">सम्पूर्ण बैकअप डाउनलोड करें (Export JSON)</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      एक क्लिक में सम्पूर्ण पोर्टल डेटा (News, Orders, Departments, Ticker, FAQs) की संरचित JSON फ़ाइल डाउनलोड करें।
                    </p>
                  </div>
                  <button
                    onClick={handleExportBackup}
                    className="mt-4 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>JSON बैकअप फ़ाइल डाउनलोड करें</span>
                  </button>
                </div>

                {/* Import Card */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-3">
                      <Upload className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">बैकअप फ़ाइल रीस्टोर करें (Import JSON)</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      पूर्व में डाउनलोड की गई JSON बैकअप फ़ाइल अपलोड करके सभी सामग्री को तुरंत बहाल (Restore) करें।
                    </p>
                  </div>
                  <label className="mt-4 w-full py-2.5 px-4 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer flex items-center justify-center gap-2 text-center">
                    <Upload className="w-4 h-4" />
                    <span>JSON फ़ाइल चुनें एवं रीस्टोर करें</span>
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleImportBackup}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Danger Zone: Reset to Defaults */}
              <div className="mt-8 pt-6 border-t border-slate-200">
                <h4 className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>खतरा क्षेत्र / सिस्टम रीसेट (Danger Zone)</span>
                </h4>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-red-50/60 border border-red-200/80">
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-red-900">
                      पोर्टल को डिफ़ॉल्ट आधिकारिक स्थिति में रीसेट करें
                    </h5>
                    <p className="text-xs text-red-700 mt-0.5">
                      यह सभी कस्टम संशोधन हटाकर आधिकारिक आधार डेटा पुनर्स्थापित करेगा।
                    </p>
                  </div>
                  <button
                    onClick={handleResetDefaults}
                    className="py-2 px-4 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs transition shadow-xs cursor-pointer shrink-0"
                  >
                    डिफ़ॉल्ट स्थिति में रीसेट करें
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT NEWS MODAL */}
      {/* ========================================================================= */}
      {editingNews && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-black text-blue-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                <span>समाचार संपादित करें (Edit News Article)</span>
              </h3>
              <button onClick={() => setEditingNews(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateNews} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">शीर्षक (Title)</label>
                <input
                  type="text"
                  required
                  value={editingNews.title}
                  onChange={(e) => setEditingNews({ ...editingNews, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">श्रेणी (Category)</label>
                  <select
                    value={editingNews.category}
                    onChange={(e) => setEditingNews({ ...editingNews, category: e.target.value as Category })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold focus:outline-hidden"
                  >
                    <option value="शासनादेश">शासनादेश</option>
                    <option value="वेतन अपडेट">वेतन अपडेट</option>
                    <option value="भर्ती एवं तैनाती">भर्ती एवं तैनाती</option>
                    <option value="कर्मचारी समाचार">कर्मचारी समाचार</option>
                    <option value="विभागीय सूचना">विभागीय सूचना</option>
                    <option value="पीएफ एवं ईएसआई">पीएफ एवं ईएसआई</option>
                    <option value="ताजा खबर">ताजा खबर</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">विभाग (Department)</label>
                  <input
                    type="text"
                    value={editingNews.department}
                    onChange={(e) => setEditingNews({ ...editingNews, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">संक्षिप्त विवरण (Short Description)</label>
                <textarea
                  rows={2}
                  required
                  value={editingNews.shortDescription}
                  onChange={(e) => setEditingNews({ ...editingNews, shortDescription: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">आधिकारिक स्रोत (Source Name)</label>
                <input
                  type="text"
                  value={editingNews.source}
                  onChange={(e) => setEditingNews({ ...editingNews, source: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingNews.isFeatured || false}
                    onChange={(e) => setEditingNews({ ...editingNews, isFeatured: e.target.checked })}
                    className="w-4 h-4 text-blue-900 rounded"
                  />
                  <span>मुख्य समाचार बनाएं (Featured in Hero)</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingNews(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                  >
                    रद्द करें
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>अपडेट सुरक्षित करें</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT ORDER MODAL */}
      {/* ========================================================================= */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-black text-blue-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                <span>शासनादेश संपादित करें (Edit Government Order)</span>
              </h3>
              <button onClick={() => setEditingOrder(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateOrder} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">शासनादेश संख्या</label>
                  <input
                    type="text"
                    required
                    value={editingOrder.orderNumber}
                    onChange={(e) => setEditingOrder({ ...editingOrder, orderNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">विभाग</label>
                  <input
                    type="text"
                    value={editingOrder.department}
                    onChange={(e) => setEditingOrder({ ...editingOrder, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">विषय (Title / Subject)</label>
                <input
                  type="text"
                  required
                  value={editingOrder.title}
                  onChange={(e) => setEditingOrder({ ...editingOrder, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">दिनांक</label>
                  <input
                    type="text"
                    value={editingOrder.date}
                    onChange={(e) => setEditingOrder({ ...editingOrder, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">श्रेणी</label>
                  <input
                    type="text"
                    value={editingOrder.category}
                    onChange={(e) => setEditingOrder({ ...editingOrder, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">वर्ष</label>
                  <input
                    type="number"
                    value={editingOrder.year}
                    onChange={(e) => setEditingOrder({ ...editingOrder, year: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">सारांश (Summary)</label>
                <textarea
                  rows={3}
                  value={editingOrder.summary}
                  onChange={(e) => setEditingOrder({ ...editingOrder, summary: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>अपडेट सुरक्षित करें</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EDIT DEPARTMENT MODAL */}
      {/* ========================================================================= */}
      {editingDept && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-black text-blue-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                <span>विभाग संपादित करें</span>
              </h3>
              <button onClick={() => setEditingDept(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateDept} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">विभाग का नाम (हिन्दी)</label>
                <input
                  type="text"
                  required
                  value={editingDept.name}
                  onChange={(e) => setEditingDept({ ...editingDept, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">विभाग का नाम (अंग्रेजी)</label>
                <input
                  type="text"
                  value={editingDept.englishName}
                  onChange={(e) => setEditingDept({ ...editingDept, englishName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">विवरण</label>
                <textarea
                  rows={2}
                  value={editingDept.description}
                  onChange={(e) => setEditingDept({ ...editingDept, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">अनुमानित कार्मिक</label>
                  <input
                    type="text"
                    value={editingDept.estimatedEmployees}
                    onChange={(e) => setEditingDept({ ...editingDept, estimatedEmployees: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">नोडल पोर्टल लिंक</label>
                  <input
                    type="text"
                    value={editingDept.nodalPortal || ''}
                    onChange={(e) => setEditingDept({ ...editingDept, nodalPortal: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingDept(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>अपडेट करें</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: EDIT FAQ MODAL */}
      {/* ========================================================================= */}
      {editingFaq && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-black text-blue-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                <span>FAQ प्रश्न एवं उत्तर संपादित करें</span>
              </h3>
              <button onClick={() => setEditingFaq(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">प्रश्न (Question)</label>
                <input
                  type="text"
                  value={editingFaq.question}
                  onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">श्रेणी (Category)</label>
                <select
                  value={editingFaq.category}
                  onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold focus:outline-hidden"
                >
                  <option value="वेतन">वेतन</option>
                  <option value="पीएफ">पीएफ</option>
                  <option value="ईएसआई">ईएसआई</option>
                  <option value="भर्ती">भर्ती</option>
                  <option value="सामान्य">सामान्य</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">उत्तर (Answer)</label>
                <textarea
                  rows={3}
                  value={editingFaq.answer}
                  onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingFaq(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  onClick={handleSaveFaqEdit}
                  className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>अपडेट करें</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
