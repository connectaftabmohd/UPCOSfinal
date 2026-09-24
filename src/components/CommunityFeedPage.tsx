import React, { useState } from 'react';
import { 
  Sparkles, Image, FileText, BarChart2, Plus, 
  MapPin, Building2, CreditCard, Bookmark, Users, 
  ShieldCheck, ArrowRight, Flame, HelpCircle, UserCheck, AlertCircle,
  User, LogIn, Heart, ThumbsUp, Share2, Flag, MoreHorizontal, 
  MessageSquare, CheckCircle2, Download, CornerDownRight, 
  Trash2, Copy, Check, Pin, X, Send
} from 'lucide-react';
import { PageView, UserProfile } from '../types';

// ================= TYPES =================
export type ReactionType = 'like' | 'helpful' | 'support' | 'important';

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorDistrict: string;
  authorDepartment?: string;
  content: string;
  createdAt: string;
  parentId?: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorDistrict: string;
  authorDepartment: string;
  authorDesignation?: string;
  isVerified?: boolean;
  content: string;
  category: 'general' | 'official_order' | 'issue' | 'salary' | 'guidance';
  imageUrl?: string;
  documentName?: string;
  documentSize?: string;
  isOfficial?: boolean;
  isPinned?: boolean;
  createdAt: string;
  reactions: Record<ReactionType, number>;
  userReactions?: Record<string, ReactionType>;
  comments: Comment[];
  poll?: {
    question: string;
    options: PollOption[];
    totalVotes: number;
    userVotedOptionId?: string;
  };
}

// ================= DUMMY / INITIAL DATA =================
const INITIAL_USER = {
  id: 'u1',
  name: 'राजीव कुमार शर्मा (Rajeev Sharma)',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  district: 'लखनऊ (Lucknow)',
  department: 'चिकित्सा एवं स्वास्थ्य (Health Dept)',
  designation: 'वरिष्ठ कंप्यूटर ऑपरेटर (Senior DEO)',
  isVerified: true,
};

const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    authorId: 'u-admin',
    authorName: 'उत्तर प्रदेश आउटसोर्स सेवा निगम (UPOSN)',
    authorAvatar: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=150&auto=format&fit=crop&q=80',
    authorDistrict: 'लखनऊ (Lucknow)',
    authorDepartment: 'समस्त सरकारी विभाग (All UP Govt Depts)',
    authorDesignation: 'आधिकारिक पोर्टल (Official Portal)',
    isVerified: true,
    isOfficial: true,
    isPinned: true,
    category: 'official_order',
    content: 'समस्त आउटसोर्सिंग कर्मियों हेतु ईपीएफ (EPF) एवं ईएसआई (ESIC) कटौती का पारदर्शी सत्यापन डिजिटल पोर्टल के माध्यम से अनिवार्य किया जा रहा है। सभी कर्मचारी अपनी मासिक वेतन पर्ची व अंशदान यूएएन (UAN) पोर्टल पर अवश्य सत्यापित करें।',
    documentName: 'EPF_ESIC_Verification_Advisory_2026.pdf',
    documentSize: '1.4 MB',
    createdAt: '2 घंटे पहले',
    reactions: { like: 142, helpful: 89, support: 54, important: 110 },
    comments: [
      {
        id: 'c1',
        authorId: 'u2',
        authorName: 'अमित वर्मा',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        authorDistrict: 'कानपुर नगर',
        content: 'बहुत ही सराहनीय कदम! कई एजेंसियों द्वारा ईपीएफ कटौती के बाद भी पोर्टल पर जमा नहीं किया जा रहा था।',
        createdAt: '1 घंटा पहले'
      }
    ]
  },
  {
    id: 'post-2',
    authorId: 'u3',
    authorName: 'सुनील कुमार यादव',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    authorDistrict: 'वाराणसी (Varanasi)',
    authorDepartment: 'माध्यमिक शिक्षा विभाग',
    authorDesignation: 'डाटा एंट्री ऑपरेटर',
    isVerified: true,
    category: 'issue',
    content: 'क्या वाराणसी एवं आसपास के जनपदों में फरवरी माह का मानदेय आ चुका है? हमारे ब्लॉक में अभी तक बिल पास होने की कोई सूचना नहीं मिली है। कृपया साथी अपडेट दें।',
    createdAt: '4 घंटे पहले',
    reactions: { like: 28, helpful: 14, support: 32, important: 6 },
    comments: [],
    poll: {
      question: 'क्या आपके जिले में फरवरी का मानदेय प्राप्त हो गया है?',
      options: [
        { id: 'opt-1', text: 'हाँ, प्राप्त हो गया', votes: 45 },
        { id: 'opt-2', text: 'नहीं, अभी तक लंबित है', votes: 128 },
        { id: 'opt-3', text: 'आंशिक भुगतान हुआ', votes: 19 }
      ],
      totalVotes: 192
    }
  }
];

export interface CommunityFeedPageProps {
  currentUser?: UserProfile | null;
  onOpenAuthModal?: () => void;
  onNavigate?: (view: PageView) => void;
  initialCategory?: string;
}

// ================= MAIN COMPONENT =================
export const CommunityFeedPage: React.FC<CommunityFeedPageProps> = ({
  currentUser: propUser,
  onOpenAuthModal,
  onNavigate,
  initialCategory
}) => {
  const [currentUser, setCurrentUser] = useState<typeof INITIAL_USER | UserProfile | null>(
    propUser !== undefined ? propUser : INITIAL_USER
  );

  // Sync if propUser changes
  React.useEffect(() => {
    if (propUser !== undefined) {
      setCurrentUser(propUser);
    }
  }, [propUser]);

  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [activeTab, setActiveTab] = useState<'all' | 'district' | 'department' | 'official' | 'trending'>('all');
  
  // Post Creation State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<Post['category']>('general');
  const [newPostImage, setNewPostImage] = useState('');

  // Comment State
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');

  // Bookmarks & Reactions
  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);
  const [userReactions, setUserReactions] = useState<Record<string, ReactionType>>({});

  // Filter Logic
  const filteredPosts = posts.filter(post => {
    if (activeTab === 'district') {
      return currentUser && post.authorDistrict.includes(currentUser.district.split(' ')[0]);
    }
    if (activeTab === 'department') {
      return currentUser && post.authorDepartment.includes(currentUser.department.split(' ')[0]);
    }
    if (activeTab === 'official') {
      return post.isOfficial || post.category === 'official_order';
    }
    if (activeTab === 'trending') {
      const total = (Object.values(post.reactions) as number[]).reduce((a, b) => a + b, 0);
      return total > 50 || post.comments.length > 0;
    }
    return true;
  });

  const checkAuthOrExecute = (action: () => void) => {
    if (!currentUser) {
      if (onOpenAuthModal) {
        onOpenAuthModal();
        return;
      }
    }
    action();
  };

  // Reactions Handler
  const handleReaction = (postId: string, type: ReactionType) => {
    if (!currentUser) {
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }
    setUserReactions(prev => {
      const existing = prev[postId];
      const next = { ...prev };
      if (existing === type) {
        delete next[postId];
        // Decrement
        setPosts(pList => pList.map(p => p.id === postId ? {
          ...p,
          reactions: { ...p.reactions, [type]: Math.max(0, p.reactions[type] - 1) }
        } : p));
      } else {
        next[postId] = type;
        // Increment new, decrement old if existed
        setPosts(pList => pList.map(p => {
          if (p.id !== postId) return p;
          const updatedReactions = { ...p.reactions, [type]: p.reactions[type] + 1 };
          if (existing) {
            updatedReactions[existing] = Math.max(0, updatedReactions[existing] - 1);
          }
          return { ...p, reactions: updatedReactions };
        }));
      }
      return next;
    });
  };

  // Add Comment Handler
  const handleAddComment = (postId: string) => {
    if (!commentInput.trim()) return;
    if (!currentUser) {
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      authorDistrict: currentUser.district,
      content: commentInput.trim(),
      createdAt: 'अभी-अभी'
    };
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p));
    setCommentInput('');
  };

  // Toggle Save Post
  const handleToggleSave = (postId: string) => {
    if (!currentUser) {
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }
    setSavedPostIds(prev => prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]);
  };

  // Create Post
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    if (!currentUser) {
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }

    const created: Post = {
      id: `post-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      authorDistrict: currentUser.district,
      authorDepartment: currentUser.department,
      authorDesignation: currentUser.designation,
      isVerified: currentUser.isVerified,
      content: newPostContent.trim(),
      category: newPostCategory,
      imageUrl: newPostImage.trim() || undefined,
      createdAt: 'अभी-अभी',
      reactions: { like: 0, helpful: 0, support: 0, important: 0 },
      comments: []
    };

    setPosts([created, ...posts]);
    setNewPostContent('');
    setNewPostImage('');
    setIsCreateModalOpen(false);
  };

  return (
    <div id="community-feed-section" className="w-full max-w-[1440px] mx-auto px-2 sm:px-4 lg:px-6 py-4">
      
      {/* Grid: Left Sidebar + Center Feed + Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 space-y-4 sticky top-20">
          {currentUser && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs">
              <div className="text-center pb-3 border-b border-slate-100 dark:border-slate-700">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-16 h-16 rounded-full object-cover mx-auto mb-2 border-2 border-amber-500 shadow-xs"
                />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {currentUser.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {currentUser.designation}
                </p>
                <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300">
                  <MapPin className="w-3 h-3" />
                  <span>{currentUser.district}</span>
                </div>
              </div>

              <div className="pt-3 space-y-2 text-xs font-medium">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700/40 flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>मेरी कुल पोस्ट्स</span>
                  <span className="font-bold text-slate-900 dark:text-white">{posts.filter(p => p.authorId === currentUser.id).length}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700/40 flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>सहेजी गई पोस्ट्स</span>
                  <span className="font-bold text-slate-900 dark:text-white">{savedPostIds.length}</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>कम्युनिटी दिशानिर्देश</span>
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              यह मंच कर्मचारियों के आपसी सहयोग व मार्गदर्शन हेतु है। किसी भी प्रकार की भ्रामक या असत्यापित सूचना साझा करना प्रतिबंधित है।
            </p>
          </div>
        </aside>

        {/* Center Feed */}
        <main className="lg:col-span-6 space-y-4">
          
          {/* Create Post Prompt Box */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 sm:p-4 border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="flex items-center gap-3">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt="Avatar"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-amber-500/30 shrink-0"
              />
              <button
                onClick={() => checkAuthOrExecute(() => setIsCreateModalOpen(true))}
                className="flex-1 text-left px-4 py-2.5 rounded-full bg-slate-100 dark:bg-slate-700 text-xs sm:text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
              >
                सहकर्मियों से कुछ साझा करें या सवाल पूछें...
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1 pt-3 mt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs">
              <button
                onClick={() => checkAuthOrExecute(() => setIsCreateModalOpen(true))}
                className="flex items-center justify-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-amber-600 font-semibold py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <Image className="w-4 h-4 text-emerald-600" />
                <span>फोटो</span>
              </button>
              <button
                onClick={() => checkAuthOrExecute(() => setIsCreateModalOpen(true))}
                className="flex items-center justify-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-amber-600 font-semibold py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-red-600" />
                <span>दस्तावेज़</span>
              </button>
              <button
                onClick={() => checkAuthOrExecute(() => setIsCreateModalOpen(true))}
                className="flex items-center justify-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-amber-600 font-semibold py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <BarChart2 className="w-4 h-4 text-blue-600" />
                <span>पोल / राय</span>
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none">
            {[
              { id: 'all', label: 'सभी अपडेट' },
              { id: 'district', label: 'मेरा जिला' },
              { id: 'department', label: 'मेरा विभाग' },
              { id: 'official', label: 'शासनादेश (Official)' },
              { id: 'trending', label: 'ट्रेंडिंग 🔥' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {filteredPosts.length > 0 ? (
              filteredPosts.map(post => {
                const totalReactions = (Object.values(post.reactions) as number[]).reduce((a, b) => a + b, 0);
                const currentReaction = userReactions[post.id];
                const isSaved = savedPostIds.includes(post.id);
                const isCommentsOpen = activeCommentPostId === post.id;

                return (
                  <article key={post.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs overflow-hidden">
                    
                    {/* Official Banner */}
                    {post.isOfficial && (
                      <div className="bg-amber-500/10 dark:bg-amber-500/20 border-b border-amber-200 dark:border-amber-800/60 px-4 py-1.5 flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-300">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>आधिकारिक सूचना / शासनादेश</span>
                        </div>
                        {post.isPinned && (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                            <Pin className="w-3 h-3" />
                            <span>पिन किया गया</span>
                          </span>
                        )}
                      </div>
                    )}

                    <div className="p-4 sm:p-5">
                      {/* Author Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={post.authorAvatar}
                            alt={post.authorName}
                            className="w-10 h-10 rounded-full object-cover border border-amber-500/30"
                          />
                          <div>
                            <div className="flex items-center gap-1">
                              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                                {post.authorName}
                              </h4>
                              {post.isVerified && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500">
                              {post.authorDistrict} • {post.authorDepartment}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleSave(post.id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isSaved ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                          title="Save Post"
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-600' : ''}`} />
                        </button>
                      </div>

                      {/* Post Content */}
                      <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line mb-3">
                        {post.content}
                      </p>

                      {/* Image Attachment */}
                      {post.imageUrl && (
                        <div className="mb-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-96">
                          <img src={post.imageUrl} alt="Post Attachment" className="w-full h-full object-cover" />
                        </div>
                      )}

                      {/* Document Attachment */}
                      {post.documentName && (
                        <div className="mb-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <FileText className="w-5 h-5 text-red-600 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{post.documentName}</p>
                              <p className="text-[10px] text-slate-500">{post.documentSize || 'PDF Document'}</p>
                            </div>
                          </div>
                          <button className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 cursor-pointer">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* Poll Section */}
                      {post.poll && (
                        <div className="mb-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700 space-y-2">
                          <p className="text-xs font-bold text-slate-900 dark:text-white mb-2">{post.poll.question}</p>
                          {post.poll.options.map(opt => {
                            const pct = post.poll!.totalVotes > 0 ? Math.round((opt.votes / post.poll!.totalVotes) * 100) : 0;
                            return (
                              <div key={opt.id} className="relative overflow-hidden border border-slate-200 dark:border-slate-600 rounded-lg p-2 text-xs">
                                <div className="absolute inset-0 bg-amber-500/15" style={{ width: `${pct}%` }} />
                                <div className="relative flex justify-between font-semibold">
                                  <span>{opt.text}</span>
                                  <span>{pct}% ({opt.votes})</span>
                                </div>
                              </div>
                            );
                          })}
                          <p className="text-[10px] text-slate-400 text-right">कुल मत: {post.poll.totalVotes}</p>
                        </div>
                      )}

                      {/* Reaction and Comments Bar */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleReaction(post.id, 'like')}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                              currentReaction === 'like' ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            <ThumbsUp className={`w-4 h-4 ${currentReaction === 'like' ? 'fill-amber-600' : ''}`} />
                            <span>{post.reactions.like}</span>
                          </button>

                          <button
                            onClick={() => handleReaction(post.id, 'support')}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                              currentReaction === 'support' ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${currentReaction === 'support' ? 'fill-rose-600' : ''}`} />
                            <span>{post.reactions.support}</span>
                          </button>
                        </div>

                        <button
                          onClick={() => setActiveCommentPostId(isCommentsOpen ? null : post.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>{post.comments.length} टिप्पणियां</span>
                        </button>
                      </div>

                      {/* Comments Dropdown */}
                      {isCommentsOpen && (
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 space-y-3">
                          <div className="space-y-2.5 max-h-60 overflow-y-auto">
                            {post.comments.map(c => (
                              <div key={c.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/40 text-xs">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-bold text-slate-900 dark:text-white">{c.authorName}</span>
                                  <span className="text-[10px] text-slate-400">{c.createdAt}</span>
                                </div>
                                <p className="text-slate-700 dark:text-slate-300">{c.content}</p>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={commentInput}
                              onChange={e => setCommentInput(e.target.value)}
                              placeholder="अपनी टिप्पणी लिखें..."
                              className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-700 border-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
                              onKeyDown={e => e.key === 'Enter' && handleAddComment(post.id)}
                            />
                            <button
                              onClick={() => handleAddComment(post.id)}
                              className="p-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  </article>
                );
              })
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-700">
                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2 opacity-80" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  इस श्रेणी में अभी कोई पोस्ट नहीं है
                </h4>
                <p className="text-xs text-slate-500 mb-4">आप पहली पोस्ट बनाकर चर्चा शुरू कर सकते हैं।</p>
                <button
                  onClick={() => checkAuthOrExecute(() => setIsCreateModalOpen(true))}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer"
                >
                  नई पोस्ट बनाएं
                </button>
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 space-y-4 sticky top-20">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs">
            <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>ट्रेंडिंग चर्चाएं</span>
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/60 cursor-pointer">
                <p className="font-semibold text-slate-800 dark:text-slate-200">#वेतन_विलंब_समस्या</p>
                <p className="text-[10px] text-slate-400">142 चर्चाएं • समस्त 75 जिले</p>
              </div>
              <div className="p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/60 cursor-pointer">
                <p className="font-semibold text-slate-800 dark:text-slate-200">#ईपीएफ_पासबुक_वेरिफिकेशन</p>
                <p className="text-[10px] text-slate-400">89 चर्चाएं • शासनादेश</p>
              </div>
            </div>
          </div>
        </aside>

      </div>

      {/* Personalized Greeting / Forum Welcome Banner - Shifted to Bottom above Footer */}
      {currentUser ? (
        <div className="mt-8 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200 dark:border-amber-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-amber-500 shadow-xs"
              />
              {currentUser.isVerified && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold">
                  ✓
                </span>
              )}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                नमस्ते, {currentUser.name.split(' ')[0]} 👋
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {currentUser.designation} • {currentUser.district}
              </p>
            </div>
          </div>

          <button
            onClick={() => checkAuthOrExecute(() => setIsCreateModalOpen(true))}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>नई पोस्ट बनाएं</span>
          </button>
        </div>
      ) : (
        <div className="mt-8 p-4 rounded-2xl bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md border border-blue-800/60">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                कम्युनिटी फोरम में आपका स्वागत है
              </h3>
              <p className="text-xs text-blue-200 mt-0.5 leading-relaxed">
                उत्तर प्रदेश के साथी आउटसोर्स कार्मिकों से जुड़ने, प्रश्न पूछने और विचार साझा करने के लिए लॉगिन करें।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenAuthModal}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>लॉगिन / साइन अप करें</span>
            </button>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">कम्युनिटी में पोस्ट साझा करें</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">श्रेणी चुनें</label>
                <select
                  value={newPostCategory}
                  onChange={e => setNewPostCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="general">सामान्य चर्चा (General Discussion)</option>
                  <option value="issue">समस्या व शिकायत (Issue / Grievance)</option>
                  <option value="salary">वेतन व मानदेय (Salary & EPF)</option>
                  <option value="official_order">शासनादेश (Official Order)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">संदेश / विवरण</label>
                <textarea
                  rows={4}
                  value={newPostContent}
                  onChange={e => setNewPostContent(e.target.value)}
                  placeholder="अपने विचार, समस्या या जानकारी यहाँ लिखें..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">फोटो लिंक (वैकल्पिक Image URL)</label>
                <input
                  type="url"
                  value={newPostImage}
                  onChange={e => setNewPostImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  पोस्ट प्रकाशित करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
