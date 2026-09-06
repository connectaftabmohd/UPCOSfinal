import React, { useState, useMemo } from 'react';
import {
  MessageSquareQuote,
  Heart,
  MessageCircle,
  Share2,
  PlusCircle,
  Send,
  Search,
  Check,
  AlertCircle,
  Pin,
  Trash2,
  User,
  ShieldCheck,
  Building2,
  MapPin,
  TrendingUp,
  Sparkles,
  HelpCircle,
  X,
  ThumbsUp,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { PageView, TalkPost, TalkComment } from '../types';
import {
  talkCornerStore,
  TALK_CATEGORIES,
} from '../data/talkCornerStore';

interface TalkCornerPageProps {
  onNavigate: (view: PageView) => void;
  initialCategory?: string;
}

export const TalkCornerPage: React.FC<TalkCornerPageProps> = ({
  onNavigate,
  initialCategory,
}) => {
  const [posts, setPosts] = useState<TalkPost[]>(() => talkCornerStore.getPosts());
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'सभी चर्चाएं');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'MOST_LIKED' | 'MOST_COMMENTS'>('NEWEST');

  // New Post Form state
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postAuthor, setPostAuthor] = useState('');
  const [postRole, setPostRole] = useState('');
  const [postDistrict, setPostDistrict] = useState('');
  const [postCategory, setPostCategory] = useState('वेतन एवं मानदेय');
  const [postDepartment, setPostDepartment] = useState('चिकित्सा एवं स्वास्थ्य');
  const [postTags, setPostTags] = useState('');
  const [formError, setFormError] = useState('');
  const [notification, setNotification] = useState('');

  // Expand / Active comments state per post
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({
    'post-1': true, // Keep first post comments open by default for engagement
  });

  // New comment input state per post
  const [commentInputs, setCommentInputs] = useState<Record<string, { author: string; role: string; text: string }>>({});

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  const refreshPosts = () => {
    setPosts(talkCornerStore.getPosts());
  };

  // Like a post
  const handleLikePost = (postId: string) => {
    talkCornerStore.toggleLikePost(postId);
    refreshPosts();
  };

  // Like a comment
  const handleLikeComment = (postId: string, commentId: string) => {
    talkCornerStore.toggleLikeComment(postId, commentId);
    refreshPosts();
  };

  // Toggle comments expand
  const toggleComments = (postId: string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  // Delete post
  const handleDeletePost = (postId: string) => {
    if (confirm('क्या आप अपनी यह पोस्ट हटाना चाहते हैं?')) {
      talkCornerStore.deletePost(postId);
      refreshPosts();
      showToast('पोस्ट सफलतापूर्वक हटा दी गई।');
    }
  };

  // Submit new post
  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) {
      setFormError('कृपया शीर्षक और अपनी बात (विवरण) अवश्य लिखें।');
      return;
    }

    const tagsArray = postTags
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter((t) => t.length > 0);

    talkCornerStore.addPost({
      title: postTitle.trim(),
      content: postContent.trim(),
      authorName: postAuthor.trim() || 'साथी कर्मचारी',
      authorRole: postRole.trim() || 'आउटसोर्स कर्मी',
      authorDistrict: postDistrict.trim() || 'उत्तर प्रदेश',
      category: postCategory,
      department: postDepartment,
      tags: tagsArray.length > 0 ? tagsArray : ['कर्मचारी संवाद'],
    });

    refreshPosts();
    setPostTitle('');
    setPostContent('');
    setPostTags('');
    setIsCreatingPost(false);
    setFormError('');
    showToast('आपकी चर्चा पोस्ट सफलतापूर्वक प्रकाशित हो गई!');
  };

  // Submit comment on a post
  const handleSubmitComment = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const input = commentInputs[postId] || { author: '', role: '', text: '' };
    if (!input.text || !input.text.trim()) return;

    talkCornerStore.addComment(postId, {
      authorName: input.author?.trim() || 'साथी आउटसोर्स कर्मी',
      authorRole: input.role?.trim() || 'कर्मचारी',
      authorDistrict: 'उप्र',
      content: input.text.trim(),
    });

    // Clear comment input
    setCommentInputs((prev) => ({
      ...prev,
      [postId]: { author: input.author || '', role: input.role || '', text: '' },
    }));

    // Ensure comments section is opened
    setExpandedComments((prev) => ({ ...prev, [postId]: true }));
    refreshPosts();
    showToast('आपकी टिप्पणी जुड़ गई!');
  };

  // Share post text / link
  const handleShare = (post: TalkPost) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `UPOSN टॉक कॉर्नर चर्चा:\n"${post.title}"\n${post.content}\n\n- ${post.authorName} (${post.authorRole})\nUP Outsource Seva Nigam News: https://uposn.in`
      );
      showToast('चर्चा लिंक व विवरण क्लिपबोर्ड पर कॉपी हो गया!');
    }
  };

  // Filtered and sorted posts
  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => {
        const matchesCategory =
          selectedCategory === 'सभी चर्चाएं' || post.category === selectedCategory;
        const matchesQuery =
          !searchQuery.trim() ||
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (post.tags && post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => {
        // Pinned posts always stay on top
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        if (sortBy === 'MOST_LIKED') {
          return b.likes - a.likes;
        }
        if (sortBy === 'MOST_COMMENTS') {
          return (b.comments?.length || 0) - (a.comments?.length || 0);
        }
        return 0; // default order in array is newest first
      });
  }, [posts, selectedCategory, searchQuery, sortBy]);

  const totalComments = useMemo(() => {
    return posts.reduce((acc, p) => acc + (p.comments?.length || 0), 0);
  }, [posts]);

  return (
    <div className="bg-slate-50 min-h-screen py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 space-y-6">
        {/* Toast Notification */}
        {notification && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs sm:text-sm font-semibold animate-bounce border border-slate-700">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Hero Header Banner */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
                <MessageSquareQuote className="w-4 h-4" />
                <span>कर्मचारी संवाद केंद्र (Open Community Forum)</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                टॉक कॉर्नर (Talk Corner)
              </h1>

              <p className="text-sm sm:text-base text-blue-100 leading-relaxed font-normal">
                उत्तर प्रदेश के समस्त आउटसोर्स व संविदा कर्मियों का स्वतंत्र विचार मंच। अपने विभाग की स्थिति बताएं, मानदेय व पीएफ पर सवाल पूछें, राय रखें और एक-दूसरे का सहयोग करें।
              </p>

              {/* Real-time Community Engagement Indicators */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-blue-200 pt-1">
                <div className="flex items-center gap-1.5 bg-blue-900/60 px-3 py-1 rounded-full border border-blue-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold text-white">160+ कार्मिक सक्रिय</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-amber-300">{posts.length}</span>
                  <span>सक्रिय चर्चाएं</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-amber-300">{totalComments}</span>
                  <span>जनपद संवाद टिप्पणियां</span>
                </div>
              </div>
            </div>

            {/* Action to create post */}
            <div className="shrink-0 flex flex-col gap-2">
              <button
                onClick={() => setIsCreatingPost(!isCreatingPost)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-2xl shadow-lg transition-transform active:scale-95"
              >
                {isCreatingPost ? (
                  <>
                    <X className="w-4 h-4" />
                    <span>प्रपत्र बंद करें</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>नया विषय / पोस्ट साझा करें</span>
                  </>
                )}
              </button>
              <span className="text-[11px] text-blue-200 text-center">
                पंजीकरण की आवश्यकता नहीं • तुरंत पोस्ट करें
              </span>
            </div>
          </div>
        </div>

        {/* Collapsible New Post Creation Form */}
        {isCreatingPost && (
          <div className="bg-white rounded-3xl border-2 border-blue-600/30 p-5 sm:p-8 shadow-lg transition-all animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    टॉक कॉर्नर में नया विषय जोड़ें
                  </h2>
                  <p className="text-xs text-slate-500">
                    अपना अनुभव, वेतन समस्या या सवाल अन्य कर्मचारियों के साथ साझा करें
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCreatingPost(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitPost} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    आपका नाम / उपनाम
                  </label>
                  <input
                    type="text"
                    value={postAuthor}
                    onChange={(e) => setPostAuthor(e.target.value)}
                    placeholder="उदा. राजेश कुमार (या खाली छोड़ें)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    पदनाम / कार्य
                  </label>
                  <input
                    type="text"
                    value={postRole}
                    onChange={(e) => setPostRole(e.target.value)}
                    placeholder="उदा. कंप्यूटर ऑपरेटर, स्टाफ नर्स, लाइनमैन"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    जनपद / कार्यालय
                  </label>
                  <input
                    type="text"
                    value={postDistrict}
                    onChange={(e) => setPostDistrict(e.target.value)}
                    placeholder="उदा. प्रयागराज, लखनऊ, कानपुर"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    चर्चा श्रेणी (Category)
                  </label>
                  <select
                    value={postCategory}
                    onChange={(e) => setPostCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-800"
                  >
                    {TALK_CATEGORIES.filter((c) => c !== 'सभी चर्चाएं').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    संबंधित विभाग
                  </label>
                  <input
                    type="text"
                    value={postDepartment}
                    onChange={(e) => setPostDepartment(e.target.value)}
                    placeholder="उदा. चिकित्सा एवं स्वास्थ्य, UPPCL, पंचायती राज"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  विषय का मुख्य शीर्षक <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="उदा. क्या आपके जिले में इस माह समय पर मानदेय मिला?"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  विस्तृत विचार / प्रश्न / अनुभव <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="अपनी पूरी बात, विभागीय समस्या या अनुभव यहां स्पष्ट रूप से लिखें ताकि अन्य साथी आपकी सहायता या राय दे सकें..."
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-800 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  टैग्स (कॉमा से अलग करें)
                </label>
                <input
                  type="text"
                  value={postTags}
                  onChange={(e) => setPostTags(e.target.value)}
                  placeholder="उदा. मानदेय, पीएफ, स्वास्थ्य, लाइनमैन"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-800"
                />
              </div>

              <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 flex items-start gap-2 text-xs text-blue-900">
                <ShieldCheck className="w-4 h-4 text-blue-800 shrink-0 mt-0.5" />
                <span>
                  <strong>चर्चा नियम:</strong> कृपया सभ्य भाषा का प्रयोग करें। किसी भी व्यक्ति का व्यक्तिगत मोबाइल नंबर, आधार या बैंक खाता विवरण साझा न करें।
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingPost(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition"
                >
                  <Send className="w-4 h-4" />
                  <span>प्रकाशित करें</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter and Search Navigation Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="विषय, पदनाम, जनपद या समस्या खोजें..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-800"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                >
                  साफ करें
                </button>
              )}
            </div>

            {/* Sort Filter */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-500 font-semibold">क्रम:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-800"
              >
                <option value="NEWEST">नवीनतम चर्चाएं</option>
                <option value="MOST_LIKED">सर्वाधिक पसंद (Most Liked)</option>
                <option value="MOST_COMMENTS">सर्वाधिक टिप्पणियां</option>
              </select>
            </div>
          </div>

          {/* Category Chips Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            {TALK_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
                    active
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Layout: Discussions Grid + Sidebar Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Posts Feed (8 cols on lg) */}
          <div className="lg:col-span-8 space-y-5">
            {filteredPosts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <HelpCircle className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-slate-800">
                  इस श्रेणी में अभी कोई चर्चा नहीं मिली
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  आप इस विषय पर पहली चर्चा शुरू कर सकते हैं और प्रदेश भर के अन्य आउटसोर्स कर्मियों के साथ विचार साझा कर सकते हैं।
                </p>
                <button
                  onClick={() => setIsCreatingPost(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>पहला पोस्ट लिखें</span>
                </button>
              </div>
            ) : (
              filteredPosts.map((post) => {
                const areCommentsOpen = !!expandedComments[post.id];
                const postCommentCount = post.comments?.length || 0;
                const currentCommentInput = commentInputs[post.id] || { author: '', role: '', text: '' };

                return (
                  <article
                    key={post.id}
                    className={`bg-white rounded-3xl border transition-all ${
                      post.isPinned
                        ? 'border-amber-300 shadow-sm ring-1 ring-amber-200'
                        : 'border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    {/* Post Card Header */}
                    <div className="p-5 sm:p-6 space-y-3">
                      {/* Pinned Marker */}
                      {post.isPinned && (
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-bold">
                          <Pin className="w-3 h-3 text-amber-700" />
                          <span>पिन की गई प्रमुख चर्चा</span>
                        </div>
                      )}

                      {/* Author Info & Meta */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-700 to-indigo-900 text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
                            {post.authorName ? post.authorName.charAt(0) : 'क'}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">
                                {post.authorName}
                              </span>
                              {post.isMyPost && (
                                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-900 text-[10px] font-bold rounded">
                                  आपकी पोस्ट
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                              <span>{post.authorRole}</span>
                              {post.authorDistrict && (
                                <>
                                  <span>•</span>
                                  <span className="inline-flex items-center gap-0.5">
                                    <MapPin className="w-3 h-3 text-slate-400" />
                                    {post.authorDistrict}
                                  </span>
                                </>
                              )}
                              <span>•</span>
                              <span>{post.createdAt}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-900 border border-blue-100 shrink-0">
                            {post.category}
                          </span>

                          {post.isMyPost && (
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="पोस्ट हटाएं"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Post Title & Content */}
                      <div className="space-y-2 pt-1">
                        <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                          {post.title}
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">
                          {post.content}
                        </p>
                      </div>

                      {/* Department & Tags */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {post.department && (
                          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium">
                            <Building2 className="w-3 h-3 text-slate-500" />
                            <span>{post.department}</span>
                          </div>
                        )}

                        {post.tags?.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => setSearchQuery(tag)}
                            className="text-[11px] text-blue-800 hover:underline font-medium"
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Post Interactions Bar */}
                    <div className="bg-slate-50/80 px-5 py-3 border-t border-slate-100 rounded-b-3xl flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        {/* Like Button */}
                        <button
                          onClick={() => handleLikePost(post.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
                            post.userLiked
                              ? 'bg-red-50 text-red-600 border border-red-200'
                              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              post.userLiked ? 'fill-red-600 text-red-600' : 'text-slate-400'
                            }`}
                          />
                          <span>{post.likes}</span>
                          <span className="hidden sm:inline">सहमति</span>
                        </button>

                        {/* Comments Toggle Button */}
                        <button
                          onClick={() => toggleComments(post.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
                            areCommentsOpen
                              ? 'bg-blue-900 text-white shadow-2xs'
                              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{postCommentCount}</span>
                          <span className="hidden sm:inline">टिप्पणियां</span>
                          {areCommentsOpen ? (
                            <ChevronUp className="w-3 h-3 ml-1" />
                          ) : (
                            <ChevronDown className="w-3 h-3 ml-1" />
                          )}
                        </button>
                      </div>

                      {/* Share Button */}
                      <button
                        onClick={() => handleShare(post)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition font-semibold"
                        title="चर्चा साझा करें"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">साझा करें</span>
                      </button>
                    </div>

                    {/* Expandable Comments & Replies Thread */}
                    {areCommentsOpen && (
                      <div className="bg-slate-50/60 p-4 sm:p-6 border-t border-slate-200/80 rounded-b-3xl space-y-4">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                          <span>साथी कर्मचारियों की टिप्पणियां ({postCommentCount}):</span>
                          <span className="text-slate-400 text-[11px]">खुला संवाद</span>
                        </div>

                        {/* Existing Comments List */}
                        {postCommentCount === 0 ? (
                          <div className="text-center py-4 bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
                            अभी तक कोई टिप्पणी नहीं है। पहली प्रतिक्रिया आप दें!
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {post.comments.map((comment) => (
                              <div
                                key={comment.id}
                                className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs shadow-2xs"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                                      {comment.authorName ? comment.authorName.charAt(0) : 'क'}
                                    </div>
                                    <span className="font-bold text-slate-900">
                                      {comment.authorName}
                                    </span>
                                    {comment.authorRole && (
                                      <span className="text-slate-400 text-[11px]">
                                        ({comment.authorRole})
                                      </span>
                                    )}
                                  </div>

                                  <span className="text-[10px] text-slate-400">
                                    {comment.createdAt}
                                  </span>
                                </div>

                                <p className="text-slate-700 text-xs leading-relaxed pl-8">
                                  {comment.content}
                                </p>

                                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                                  <button
                                    onClick={() => handleLikeComment(post.id, comment.id)}
                                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition ${
                                      comment.userLiked
                                        ? 'bg-blue-50 text-blue-800'
                                        : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                  >
                                    <ThumbsUp
                                      className={`w-3 h-3 ${
                                        comment.userLiked ? 'fill-blue-800 text-blue-800' : ''
                                      }`}
                                    />
                                    <span>{comment.likes}</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setCommentInputs((prev) => ({
                                        ...prev,
                                        [post.id]: {
                                          ...currentCommentInput,
                                          text: `@${comment.authorName} `,
                                        },
                                      }));
                                    }}
                                    className="text-[11px] text-blue-800 hover:underline font-semibold"
                                  >
                                    जवाब दें
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add Comment Input Form */}
                        <form
                          onSubmit={(e) => handleSubmitComment(post.id, e)}
                          className="bg-white p-3.5 rounded-2xl border border-slate-300 space-y-3 shadow-xs"
                        >
                          <span className="text-xs font-bold text-slate-800 block">
                            अपनी राय / उत्तर लिखें:
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={currentCommentInput.author}
                              onChange={(e) =>
                                setCommentInputs((prev) => ({
                                  ...prev,
                                  [post.id]: {
                                    ...currentCommentInput,
                                    author: e.target.value,
                                  },
                                }))
                              }
                              placeholder="आपका नाम (उदा. विनोद)"
                              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-800"
                            />
                            <input
                              type="text"
                              value={currentCommentInput.role}
                              onChange={(e) =>
                                setCommentInputs((prev) => ({
                                  ...prev,
                                  [post.id]: {
                                    ...currentCommentInput,
                                    role: e.target.value,
                                  },
                                }))
                              }
                              placeholder="पद / जनपद (उदा. वार्ड बॉय, आगरा)"
                              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-800"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              required
                              value={currentCommentInput.text}
                              onChange={(e) =>
                                setCommentInputs((prev) => ({
                                  ...prev,
                                  [post.id]: {
                                    ...currentCommentInput,
                                    text: e.target.value,
                                  },
                                }))
                              }
                              placeholder="अपनी टिप्पणी या अनुभव लिखें..."
                              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-800"
                            />
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1 px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold shrink-0 transition"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>भेजें</span>
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>

          {/* Right Sidebar Widgets (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Quick Action Box */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <MessageSquareQuote className="w-4 h-4 text-amber-600" />
                <span>टॉक कॉर्नर संवाद सुविधा</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                यह मंच सभी जनपदों के संविदा एवं आउटसोर्स कर्मचारियों को आपस में जोड़ने, मार्गदर्शन देने व समस्याओं पर मिलकर विचार करने हेतु बनाया गया है।
              </p>
              <button
                onClick={() => {
                  setIsCreatingPost(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                + अपनी बात रखें (नया पोस्ट)
              </button>
            </div>

            {/* Trending Topics Widget */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-900" />
                <span>आज के चर्चित विषय</span>
              </h3>
              <div className="space-y-2 text-xs">
                {[
                  { tag: '7तारीख', label: '7 तारीख मानदेय डीबीटी नियम' },
                  { tag: 'ईपीएफ', label: 'यूएएन में पीएफ अंशदान कटौती' },
                  { tag: 'नवीनीकरण', label: 'वित्तीय वर्ष 2026-27 अनुबंध' },
                  { tag: 'सुरक्षा', label: 'लाइनमैन सुरक्षा किट परिपत्र' },
                  { tag: 'मातृत्व अवकाश', label: '26 सप्ताह सवेतन अवकाश अधिकार' },
                ].map((item) => (
                  <button
                    key={item.tag}
                    onClick={() => setSearchQuery(item.tag)}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 transition flex items-center justify-between"
                  >
                    <span className="font-semibold text-slate-800">#{item.tag}</span>
                    <span className="text-[11px] text-slate-500 truncate max-w-[170px]">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Community Rules & Guidelines */}
            <div className="bg-amber-50/70 rounded-3xl border border-amber-200 p-5 space-y-3 text-xs text-amber-950">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <span>मंच शिष्टाचार एवं दिशानिर्देश</span>
              </div>
              <ul className="space-y-2 text-[11px] text-amber-900/90 list-disc pl-4 leading-relaxed">
                <li>आपसी संवाद में विनम्र, मर्यादित व सम्मानजनक भाषा रखें।</li>
                <li>व्यक्तिगत बैंक खाता, पासवर्ड, ओटीपी अथवा फोन नंबर सार्वजनिक न करें।</li>
                <li>अनधिकृत अथवा भ्रामक अफवाहें न फैलाएं।</li>
                <li>विधिक मामलों में अपने नोडल अधिकारी या श्रम न्यायालय से आधिकारिक पुष्टि अवश्य करें।</li>
              </ul>
            </div>

            {/* Emergency Helplines Reference */}
            <div className="bg-slate-900 text-white rounded-3xl p-5 space-y-3 text-xs shadow-md">
              <span className="font-bold tracking-wide uppercase text-slate-400 text-[10px] block">
                आपातकालीन सहायता संपर्क
              </span>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/80">
                  <span className="text-slate-300">सीएम हेल्पलाइन:</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">1076</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/80">
                  <span className="text-slate-300">ईपीएफओ ग्रीवेंस:</span>
                  <a
                    href="https://epfigms.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline font-semibold"
                  >
                    epfigms.gov.in
                  </a>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/80">
                  <span className="text-slate-300">शासनादेश पोर्टल:</span>
                  <a
                    href="https://shasanadesh.up.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline font-semibold"
                  >
                    shasanadesh.up.gov.in
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
