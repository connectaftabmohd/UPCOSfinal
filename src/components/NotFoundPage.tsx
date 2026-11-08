import React from 'react';
import { AlertCircle, Home, ArrowLeft, Search } from 'lucide-react';
import { PageView } from '../types';

interface NotFoundPageProps {
  onNavigate: (view: PageView) => void;
  message?: string;
  itemType?: 'article' | 'order' | 'page';
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  onNavigate,
  message,
  itemType = 'page'
}) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-16 px-4 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center space-y-5">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-mono font-bold text-amber-600 uppercase tracking-widest block mb-1">
            404 • पृष्ठ उपलब्ध नहीं
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {itemType === 'article' && 'समाचार आलेख नहीं मिला'}
            {itemType === 'order' && 'शासनादेश प्रपत्र नहीं मिला'}
            {itemType === 'page' && 'यह पृष्ठ मौजूद नहीं है'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            {message || 'आप जिस लिंक या यूआरएल को खोज रहे हैं, वह या तो हटा दिया गया है, उसका पता बदल गया है या यह अमान्य है।'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate({ type: 'home' })}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition"
          >
            <Home className="w-4 h-4" />
            <span>मुख्य पृष्ठ (Home)</span>
          </button>
          <button
            onClick={() => onNavigate({ type: 'news-list' })}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ताज़ा खबरें देखें</span>
          </button>
        </div>
      </div>
    </div>
  );
};
