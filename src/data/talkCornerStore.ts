import { TalkPost, TalkComment } from '../types';

export const TALK_CATEGORIES = [
  'सभी चर्चाएं',
  'वेतन एवं मानदेय',
  'ईपीएफ व ईएसआई',
  'अनुबंध एवं नवीनीकरण',
  'विभागीय वार्ता',
  'विधिक अधिकार व अवकाश',
  'सामान्य अनुभव साझा',
] as const;

export const SEED_TALK_POSTS: TalkPost[] = [
  {
    id: 'post-1',
    title: 'क्या आपके जनपद में 7 तारीख तक बैंक खाते में मानदेय आ गया?',
    authorName: 'राजेश कुमार',
    authorRole: 'कंप्यूटर ऑपरेटर',
    authorDistrict: 'प्रयागराज (स्वास्थ्य विभाग)',
    category: 'वेतन एवं मानदेय',
    department: 'चिकित्सा एवं स्वास्थ्य',
    content: 'साथियों, इस माह हमारे जिला अस्पताल में एजेंसी ने समय से बिल प्रस्तुत किया था और 6 तारीख को ही खाते में मानदेय क्रेडिट हो गया। क्या अन्य जनपदों में भी 7 तारीख की समयसीमा का कड़ाई से पालन हो रहा है या अभी भी विलंब हो रहा है? अपने जनपद की स्थिति बताएं।',
    createdAt: 'आज, 10:45 AM',
    likes: 48,
    userLiked: false,
    tags: ['मानदेय', 'डीबीटी', '7तारीख', 'स्वास्थ्य'],
    isPinned: true,
    comments: [
      {
        id: 'c-1-1',
        authorName: 'अनिल सिंह',
        authorRole: 'वार्ड बॉय',
        authorDistrict: 'मेरठ',
        content: 'हमारे यहां आज 7 तारीख को शाम 4:15 बजे बैंक से क्रेडिट का एसएमएस आया है। बहुत राहत मिली।',
        createdAt: '2 घंटे पहले',
        likes: 14,
        userLiked: false,
      },
      {
        id: 'c-1-2',
        authorName: 'सुरेश वर्मा',
        authorRole: 'लैब तकनीशियन',
        authorDistrict: 'गोरखपुर',
        content: 'हमारे अस्पताल में एजेंसी कह रही है कि बजट री-अलोकेशन के कारण 2-3 दिन और लगेंगे। हमने नोडल अधिकारी को प्रार्थना पत्र दिया है।',
        createdAt: '1 घंटे पहले',
        likes: 9,
        userLiked: false,
      },
      {
        id: 'c-1-3',
        authorName: 'प्रमोद यादव',
        authorRole: 'डीईओ',
        authorDistrict: 'वाराणसी',
        content: 'शासनादेश संख्या 14/2026 के अनुसार यदि 7 तारीख तक मानदेय नहीं आता है तो एजेंसी पर पेनल्टी का प्रावधान है। आप सीएमओ साहब को शासनादेश की प्रति संलग्न कर ज्ञापन दें।',
        createdAt: '35 मिनट पहले',
        likes: 22,
        userLiked: false,
      },
    ],
  },
  {
    id: 'post-2',
    title: 'ईपीएफ यूएएन पासबुक में एजेंसी ने 2 माह का अंशदान जमा नहीं किया - क्या करें?',
    authorName: 'सुमन मौर्या',
    authorRole: 'पंचायत सहायक',
    authorDistrict: 'अयोध्या',
    category: 'ईपीएफ व ईएसआई',
    department: 'पंचायती राज विभाग',
    content: 'उमंग ऐप पर पासबुक चेक करने पर पता चला कि एजेंसी ने वेतन से पीएफ तो काटा है लेकिन ईसीआर चालान में पिछले दो माह का अंशदान अभी तक नहीं दर्शाया गया। इसके समाधान का सबसे प्रभावी व सुरक्षित तरीका क्या है?',
    createdAt: 'आज, 09:15 AM',
    likes: 63,
    userLiked: false,
    tags: ['ईपीएफ', 'पासबुक', 'यूएएन', 'पंचायती राज'],
    comments: [
      {
        id: 'c-2-1',
        authorName: 'दिनेश चंद्र',
        authorRole: 'सीनियर ऑपरेटर',
        authorDistrict: 'लखनऊ',
        content: 'पहले अपने आहरण-वितरण अधिकारी (DDO) को लिखित शिकायत दें। इसके बाद ईपीएफओ के ऑनलाइन ग्रीवेंस पोर्टल (epfigms.gov.in) पर शिकायत दर्ज करें। वहां 72 घंटे में नोडल अधिकारी को जवाब देना पड़ता है।',
        createdAt: '3 घंटे पहले',
        likes: 31,
        userLiked: false,
      },
      {
        id: 'c-2-2',
        authorName: 'सुमन मौर्या',
        authorRole: 'पंचायत सहायक',
        authorDistrict: 'अयोध्या',
        content: 'धन्यवाद दिनेश भाई! मैंने epfigms पर टोकन नंबर प्राप्त कर लिया है।',
        createdAt: '1 घंटे पहले',
        likes: 12,
        userLiked: false,
      },
      {
        id: 'c-2-3',
        authorName: 'विकास पांडे',
        authorRole: 'अकाउंटेंट',
        authorDistrict: 'कानपुर',
        content: 'साथ ही वेतन पर्ची (Salary Slip) अवश्य संभाल कर रखें। वह प्राथमिक विधिक साक्ष्य है कि आपके वेतन से अंशदान की कटौती हुई है।',
        createdAt: '25 मिनट पहले',
        likes: 17,
        userLiked: false,
      },
    ],
  },
  {
    id: 'post-3',
    title: 'ऊर्जा विभाग (UPPCL) आउटसोर्स लाइनमैन साथियों के लिए सुरक्षा किट व बीमा चर्चा',
    authorName: 'विक्रम चौहान',
    authorRole: 'आउटसोर्स लाइनमैन',
    authorDistrict: 'आगरा (दक्षिणांचल)',
    category: 'विभागीय वार्ता',
    department: 'ऊर्जा विभाग',
    content: 'साथियों, हाल ही में जारी सुरक्षा परिपत्र के अनुसार प्रत्येक 33/11 केवी उपकेंद्र पर इंसुलेटेड ग्लव्स, सेफ्टी बेल्ट, हेलमेट और अर्थिंग रॉड अनिवार्य है। हमारे डिवीजन में वितरण शुरू हो गया है। आप सभी अपने जेई व एसडीओ साहब से संपर्क कर अपनी सुरक्षा सामग्री अवश्य प्राप्त करें। जीवन अनमोल है!',
    createdAt: 'कल, 06:30 PM',
    likes: 87,
    userLiked: false,
    tags: ['UPPCL', 'लाइनमैन', 'सुरक्षा', 'दुर्घटना बीमा'],
    isPinned: true,
    comments: [
      {
        id: 'c-3-1',
        authorName: 'अमित पाल',
        authorRole: 'लाइनमैन',
        authorDistrict: 'अलीगढ़',
        content: 'बिल्कुल सही बात है विक्रम भाई। बिना सेफ्टी किट और परमिट-टू-वर्क (PTW) के किसी भी पोल या ट्रांसफार्मर पर नहीं चढ़ना चाहिए।',
        createdAt: 'कल',
        likes: 25,
        userLiked: false,
      },
      {
        id: 'c-3-2',
        authorName: 'राघवेंद्र सिंह',
        authorRole: 'सबस्टेशन ऑपरेटर',
        authorDistrict: 'झांसी',
        content: 'हमारे उपकेंद्र पर भी कल नई किट उपलब्ध कराई गई। सभी साथी इसका उपयोग सुनिश्चित करें।',
        createdAt: 'कल',
        likes: 16,
        userLiked: false,
      },
    ],
  },
  {
    id: 'post-4',
    title: '31 मार्च को संविदा/आउटसोर्स अनुबंध नवीनीकरण की प्रक्रिया पर अनुभव साझा करें',
    authorName: 'नीरज श्रीवास्तव',
    authorRole: 'डाटा एंट्री ऑपरेटर',
    authorDistrict: 'कानपुर कलेक्ट्रेट',
    category: 'अनुबंध एवं नवीनीकरण',
    department: 'राजस्व एवं सामान्य प्रशासन',
    content: 'वित्तीय वर्ष 2026-27 के लिए नवीनीकरण हेतु क्या किसी विभाग में नए शपथ पत्र अथवा पुलिस सत्यापन की मांग की जा रही है? कृपया अपने कार्यालय की स्थिति बताएं ताकि अन्य साथियों को भ्रम न रहे।',
    createdAt: 'कल, 03:20 PM',
    likes: 41,
    userLiked: false,
    tags: ['नवीनीकरण', 'अनुबंध', 'कलेक्ट्रेट', 'नियम'],
    comments: [
      {
        id: 'c-4-1',
        authorName: 'मोहित शर्मा',
        authorRole: 'कंप्यूटर ऑपरेटर',
        authorDistrict: 'बरेली',
        content: 'हमारे यहां केवल संतोषजनक कार्य प्रमाणपत्र (Satisfactory Performance Certificate) मांगा गया है, पुलिस सत्यापन पुराना ही चल रहा है।',
        createdAt: 'कल',
        likes: 19,
        userLiked: false,
      },
      {
        id: 'c-4-2',
        authorName: 'संजय गुप्ता',
        authorRole: 'सहायक',
        authorDistrict: 'उन्नाव',
        content: 'जी हां, यदि सेवा प्रदाता एजेंसी वही है तो अनुबंध विस्तार स्वतः प्रशासनिक अनुमोदन से हो जाता है।',
        createdAt: 'कल',
        likes: 11,
        userLiked: false,
      },
    ],
  },
  {
    id: 'post-5',
    title: 'मातृत्व अवकाश (Maternity Leave) के संबंध में महिला आउटसोर्स कर्मियों के विधिक अधिकार',
    authorName: 'पूजा त्रिपाठी',
    authorRole: 'स्टाफ नर्स',
    authorDistrict: 'सीतापुर',
    category: 'विधिक अधिकार व अवकाश',
    department: 'चिकित्सा एवं स्वास्थ्य',
    content: 'महिला आउटसोर्स कर्मियों को मातृत्व लाभ अधिनियम 1961 व माननीय उच्च न्यायालय के आदेशों के तहत 26 सप्ताह का सवेतन अवकाश प्राप्त करने का पूरा विधिक अधिकार है। यदि कोई सेवा प्रदाता एजेंसी इसमें कटौती करने का प्रयास करे तो सीधे मुख्य चिकित्सा अधिकारी या उप श्रमायुक्त को आवेदन दें। जागरूक रहें!',
    createdAt: '2 दिन पहले',
    likes: 95,
    userLiked: false,
    tags: ['मातृत्व अवकाश', 'महिला कर्मचारी', 'विधिक अधिकार'],
    comments: [
      {
        id: 'c-5-1',
        authorName: 'रीता देवी',
        authorRole: 'आशा संगिनी',
        authorDistrict: 'लखीमपुर',
        content: 'बहुत ही उपयोगी जानकारी साझा की आपने दीदी! बहुत सी बहनों को इस अधिकार की जानकारी नहीं थी।',
        createdAt: '2 दिन पहले',
        likes: 29,
        userLiked: false,
      },
      {
        id: 'c-5-2',
        authorName: 'अधिवक्ता अनुराग सिंह',
        authorRole: 'विधिक सलाहकार',
        authorDistrict: 'लखनऊ',
        content: 'माननीय उच्च न्यायालय इलाहाबाद की लखनऊ खंडपीठ ने स्पष्ट आदेश दिया है कि मातृत्व अवकाश से किसी भी संविदा अथवा आउटसोर्स महिला कार्मिक को वंचित नहीं किया जा सकता।',
        createdAt: '1 दिन पहले',
        likes: 43,
        userLiked: false,
      },
    ],
  },
];

const TALK_STORAGE_KEY = 'uposn_talk_corner_posts_v2';

export const talkCornerStore = {
  getPosts: (): TalkPost[] => {
    try {
      const stored = localStorage.getItem(TALK_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(TALK_STORAGE_KEY, JSON.stringify(SEED_TALK_POSTS));
        return SEED_TALK_POSTS;
      }
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(TALK_STORAGE_KEY, JSON.stringify(SEED_TALK_POSTS));
        return SEED_TALK_POSTS;
      }
      return parsed;
    } catch {
      return SEED_TALK_POSTS;
    }
  },

  savePosts: (posts: TalkPost[]): void => {
    try {
      localStorage.setItem(TALK_STORAGE_KEY, JSON.stringify(posts));
    } catch (e) {
      console.error('Failed to save talk posts', e);
    }
  },

  addPost: (postData: {
    authorName: string;
    authorRole?: string;
    authorDistrict?: string;
    category: string;
    department?: string;
    title: string;
    content: string;
    tags?: string[];
  }): TalkPost => {
    const current = talkCornerStore.getPosts();
    const newPost: TalkPost = {
      id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      authorName: postData.authorName.trim(),
      authorRole: postData.authorRole?.trim() || 'आउटसोर्स कर्मचारी',
      authorDistrict: postData.authorDistrict?.trim() || 'उत्तर प्रदेश',
      category: postData.category || 'सामान्य अनुभव साझा',
      department: postData.department?.trim() || 'सामान्य',
      title: postData.title.trim(),
      content: postData.content.trim(),
      createdAt: 'अभी-अभी',
      likes: 1,
      userLiked: true,
      comments: [],
      tags: postData.tags && postData.tags.length > 0 ? postData.tags : ['कर्मचारी संवाद'],
      isMyPost: true,
    };

    const updated = [newPost, ...current];
    talkCornerStore.savePosts(updated);
    return newPost;
  },

  toggleLikePost: (postId: string): { likes: number; userLiked: boolean } => {
    const current = talkCornerStore.getPosts();
    let result = { likes: 0, userLiked: false };

    const updated = current.map((p) => {
      if (p.id === postId) {
        const userLiked = !p.userLiked;
        const likes = userLiked ? p.likes + 1 : Math.max(0, p.likes - 1);
        result = { likes, userLiked };
        return { ...p, likes, userLiked };
      }
      return p;
    });

    talkCornerStore.savePosts(updated);
    return result;
  },

  addComment: (
    postId: string,
    commentData: {
      authorName: string;
      authorRole?: string;
      authorDistrict?: string;
      content: string;
    }
  ): TalkComment | null => {
    const current = talkCornerStore.getPosts();
    let newComment: TalkComment | null = null;

    const updated = current.map((p) => {
      if (p.id === postId) {
        newComment = {
          id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          authorName: commentData.authorName.trim(),
          authorRole: commentData.authorRole?.trim() || 'आउटसोर्स कर्मी',
          authorDistrict: commentData.authorDistrict?.trim() || 'उप्र',
          content: commentData.content.trim(),
          createdAt: 'अभी',
          likes: 1,
          userLiked: true,
        };
        return {
          ...p,
          comments: [...(p.comments || []), newComment],
        };
      }
      return p;
    });

    talkCornerStore.savePosts(updated);
    return newComment;
  },

  toggleLikeComment: (postId: string, commentId: string): { likes: number; userLiked: boolean } => {
    const current = talkCornerStore.getPosts();
    let result = { likes: 0, userLiked: false };

    const updated = current.map((p) => {
      if (p.id === postId) {
        const updatedComments = (p.comments || []).map((c) => {
          if (c.id === commentId) {
            const userLiked = !c.userLiked;
            const likes = userLiked ? c.likes + 1 : Math.max(0, c.likes - 1);
            result = { likes, userLiked };
            return { ...c, likes, userLiked };
          }
          return c;
        });
        return { ...p, comments: updatedComments };
      }
      return p;
    });

    talkCornerStore.savePosts(updated);
    return result;
  },

  deletePost: (postId: string): void => {
    const current = talkCornerStore.getPosts();
    const updated = current.filter((p) => p.id !== postId);
    talkCornerStore.savePosts(updated);
  },

  resetToDefaultPosts: (): void => {
    localStorage.removeItem(TALK_STORAGE_KEY);
    localStorage.setItem(TALK_STORAGE_KEY, JSON.stringify(SEED_TALK_POSTS));
  },
};
