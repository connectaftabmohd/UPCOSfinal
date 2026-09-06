export type Category = 
  | 'ताजा खबर' 
  | 'शासनादेश' 
  | 'वेतन अपडेट' 
  | 'कर्मचारी समाचार' 
  | 'विभागीय सूचना' 
  | 'भर्ती एवं तैनाती' 
  | 'पीएफ एवं ईएसआई' 
  | 'अदालत व नियम';

export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  englishTitle?: string;
  category: Category;
  department: string;
  departmentId: string;
  featuredImage: string;
  shortDescription: string;
  fullContent: string[];
  keyHighlights: string[];
  source: string;
  sourceUrl?: string;
  publicationDate: string;
  publishedTime: string;
  author: string;
  tags: string[];
  isFeatured?: boolean;
  isBreaking?: boolean;
  isMostRead?: boolean;
  readTime: string;
}

export interface GovernmentOrder {
  id: string;
  slug: string;
  orderNumber: string; // e.g. "शासनादेश सं. 48/2026/894-कार्मिक-2"
  title: string;
  department: string;
  departmentId: string;
  date: string;
  year: number;
  category: string;
  summary: string;
  keyPoints: string[];
  officialSource: string;
  officialSourceUrl: string;
  pdfUrl?: string;
  fileSize: string;
  isImportant?: boolean;
}

export interface Department {
  id: string;
  name: string;
  englishName: string;
  iconName: string;
  description: string;
  estimatedEmployees: string;
  orderCount: number;
  newsCount: number;
  nodalPortal?: string;
}

export interface EmployeeGuide {
  id: string;
  title: string;
  category: 'वेतन' | 'पीएफ' | 'ईएसआई' | 'अनुबंध' | 'अवकाश' | 'शिकायत' | 'दस्तावेज';
  icon: string;
  summary: string;
  steps: string[];
  officialLinks: { label: string; url: string }[];
  importantNotes?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export interface TalkComment {
  id: string;
  authorName: string;
  authorRole?: string;
  authorDistrict?: string;
  content: string;
  createdAt: string;
  likes: number;
  userLiked?: boolean;
}

export interface TalkPost {
  id: string;
  authorName: string;
  authorRole?: string;
  authorDistrict?: string;
  category: string;
  department?: string;
  title: string;
  content: string;
  createdAt: string;
  likes: number;
  userLiked?: boolean;
  comments: TalkComment[];
  tags?: string[];
  isPinned?: boolean;
  isMyPost?: boolean;
}

export type PageView = 
  | { type: 'home' }
  | { type: 'news-list'; category?: string }
  | { type: 'news-detail'; id: string }
  | { type: 'gov-orders'; department?: string; year?: number }
  | { type: 'gov-order-detail'; id: string }
  | { type: 'departments' }
  | { type: 'department-detail'; id: string }
  | { type: 'talk-corner'; category?: string; postId?: string }
  | { type: 'employee-hub'; tab?: string }
  | { type: 'search'; query: string }
  | { type: 'about' }
  | { type: 'contact' }
  | { type: 'privacy' }
  | { type: 'disclaimer' }
  | { type: 'admin' };
