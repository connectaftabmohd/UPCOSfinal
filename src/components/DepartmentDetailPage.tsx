import React from 'react';
import { 
  Building2, 
  ArrowLeft, 
  Users, 
  FileText, 
  Newspaper, 
  ExternalLink, 
  ShieldCheck,
  Calendar,
  Eye,
  ArrowRight
} from 'lucide-react';
import { Department, NewsItem, GovernmentOrder, PageView } from '../types';

interface DepartmentDetailPageProps {
  department: Department;
  deptNews: NewsItem[];
  deptOrders: GovernmentOrder[];
  onNavigate: (view: PageView) => void;
}

export const DepartmentDetailPage: React.FC<DepartmentDetailPageProps> = ({
  department,
  deptNews,
  deptOrders,
  onNavigate,
}) => {
  return (
    <div className="w-full py-6 sm:py-8 bg-slate-50 min-h-screen">
      <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
        {/* Back navigation */}
        <button
          onClick={() => onNavigate({ type: 'departments' })}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 hover:text-blue-950 mb-4 px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-2xs transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>विभाग सूची पर वापस जाएं</span>
        </button>

        {/* Department Hero Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-blue-800 bg-blue-50 px-3 py-1 rounded-md mb-2 inline-block">
                उत्तर प्रदेश शासन • {department.englishName}
              </span>
              <h1 className="text-xl sm:text-3xl font-black text-slate-900 leading-tight">
                {department.name}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-blue-900 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs">
                <Users className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="text-[10px] text-slate-300 block uppercase font-medium">अनुमानित आउटसोर्स कर्मी</span>
                  <span className="text-sm sm:text-base font-extrabold">{department.estimatedEmployees}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h3 className="text-sm font-bold text-slate-900 mb-2">
                विभागीय आउटसोर्सिंग कार्यक्षेत्र एवं पद:
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {department.description}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <span className="font-bold text-slate-700 block">आधिकारिक पोर्टल संदर्भ:</span>
              {department.nodalPortal && (
                <a
                  href={department.nodalPortal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-bold text-blue-800 hover:underline"
                >
                  <span>{department.nodalPortal}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <p className="text-[11px] text-slate-400">
                शासनादेशों व निविदाओं के सत्यापन हेतु विभागीय वेबसाइट देखें।
              </p>
            </div>
          </div>
        </div>

        {/* 2 Tabs/Columns: Department News & Department Government Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Department News (6 cols) */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-blue-900" />
                <h2 className="font-black text-slate-900 text-base sm:text-lg">
                  विभागीय ताज़ा खबरें ({deptNews.length})
                </h2>
              </div>
            </div>

            {deptNews.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                इस विभाग से संबंधित कोई समाचार अभी उपलब्ध नहीं है।
              </p>
            ) : (
              <div className="space-y-4">
                {deptNews.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onNavigate({ type: 'news-detail', id: item.id })}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-slate-50 cursor-pointer transition flex items-start gap-3.5 group"
                  >
                    <img
                      src={item.featuredImage}
                      alt={item.title}
                      className="w-20 h-20 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded mr-2">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-slate-400">{item.publicationDate}</span>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-900 transition line-clamp-2 leading-snug mt-1">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">
                        {item.shortDescription}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Department Orders (6 cols) */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-800" />
                <h2 className="font-black text-slate-900 text-base sm:text-lg">
                  विभागीय शासनादेश व परिपत्र ({deptOrders.length})
                </h2>
              </div>
            </div>

            {deptOrders.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                इस विभाग के लिए अलग से कोई शासनादेश अपलोड नहीं है। सामान्य प्रशासन शासनादेश देखें।
              </p>
            ) : (
              <div className="space-y-3.5">
                {deptOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => onNavigate({ type: 'gov-order-detail', id: order.id })}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 cursor-pointer transition group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded truncate max-w-[200px]">
                        {order.orderNumber}
                      </span>
                      <span className="text-[10px] text-slate-400">{order.date}</span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-amber-900 transition line-clamp-2 leading-snug">
                      {order.title}
                    </h3>
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400">साइज: {order.fileSize}</span>
                      <span className="font-bold text-amber-800 flex items-center gap-1">
                        विवरण देखें <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
