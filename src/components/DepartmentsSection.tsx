import React, { useState } from 'react';
import { 
  Building2, 
  Activity, 
  GraduationCap, 
  Landmark, 
  Zap, 
  HeartHandshake, 
  Baby, 
  FileSpreadsheet, 
  ShieldAlert, 
  Bus,
  ArrowRight,
  Search,
  Users
} from 'lucide-react';
import { DEPARTMENTS_DATA } from '../data/mockData';
import { PageView } from '../types';

interface DepartmentsSectionProps {
  onNavigate: (view: PageView) => void;
  showAll?: boolean;
}

const iconMap: Record<string, React.ElementType> = {
  Activity,
  GraduationCap,
  Landmark,
  Building2,
  Zap,
  HeartHandshake,
  Baby,
  FileSpreadsheet,
  ShieldAlert,
  Bus,
};

export const DepartmentsSection: React.FC<DepartmentsSectionProps> = ({
  onNavigate,
  showAll = false,
}) => {
  const [deptSearch, setDeptSearch] = useState('');
  const [isExpanded, setIsExpanded] = useState(showAll);

  const filtered = DEPARTMENTS_DATA.filter(
    (d) =>
      d.name.toLowerCase().includes(deptSearch.toLowerCase()) ||
      d.englishName.toLowerCase().includes(deptSearch.toLowerCase()) ||
      d.description.toLowerCase().includes(deptSearch.toLowerCase())
  );

  const displayList = isExpanded ? filtered : filtered.slice(0, 6);

  return (
    <section className="py-8 sm:py-10 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                विभागवार जानकारी
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                उत्तर प्रदेश शासन के प्रमुख विभागों में आउटसोर्सिंग कार्मिकों की स्थिति व आदेश
              </p>
            </div>
          </div>

          {/* Quick Department Search */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={deptSearch}
              onChange={(e) => setDeptSearch(e.target.value)}
              placeholder="विभाग का नाम खोजें..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-700"
            />
          </div>
        </div>

        {/* 3-Column Department Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayList.map((dept) => {
            const Icon = iconMap[dept.iconName] || Building2;
            return (
              <div
                key={dept.id}
                onClick={() => onNavigate({ type: 'department-detail', id: dept.id })}
                className="bg-slate-50/70 hover:bg-blue-50/50 rounded-xl p-5 border border-slate-200 hover:border-blue-300 transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-2xs hover:shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-900 group-hover:bg-blue-900 group-hover:text-white transition-colors shrink-0 shadow-2xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      {dept.estimatedEmployees}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-900 transition leading-snug mb-1">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mb-2.5">
                    {dept.englishName}
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {dept.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">
                      {dept.orderCount} शासनादेश
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">
                      {dept.newsCount} समाचार
                    </span>
                  </div>
                  <span className="font-bold text-blue-700 group-hover:text-blue-900 flex items-center gap-1">
                    देखें <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Expand/Collapse or View All departments */}
        {!showAll && filtered.length > 6 && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs sm:text-sm rounded-xl transition shadow-2xs inline-flex items-center gap-2"
            >
              <span>{isExpanded ? 'कम विभाग दिखाएं' : `सभी ${filtered.length} विभाग देखें`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
