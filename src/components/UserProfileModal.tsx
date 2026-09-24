import React, { useState } from 'react';
import { 
  X, 
  User, 
  MapPin, 
  Building2, 
  Briefcase, 
  ShieldCheck, 
  CheckCircle2, 
  Bookmark, 
  LogOut, 
  Edit3, 
  Save, 
  FileText, 
  Newspaper, 
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  Lock,
  KeyRound
} from 'lucide-react';
import { authService, UP_DISTRICTS, UP_DEPARTMENTS } from '../services/authService';
import { UserProfile, PageView } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onLogout: () => void;
  onNavigate?: (view: PageView) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  onNavigate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [district, setDistrict] = useState(user?.district || UP_DISTRICTS[0]);
  const [department, setDepartment] = useState(user?.department || UP_DEPARTMENTS[0]);
  const [designation, setDesignation] = useState(user?.designation || '');
  const [newPassword, setNewPassword] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'saved'>('profile');

  if (!isOpen || !user) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    authService.updateProfile({
      name,
      district,
      department,
      designation,
      ...(newPassword.trim() ? { password: newPassword.trim() } : {})
    });
    setNewPassword('');
    setIsEditing(false);
  };

  const savedPostsCount = user.savedPostIds?.length || 0;
  const savedOrdersCount = user.savedOrderIds?.length || 0;
  const savedNewsCount = user.savedNewsIds?.length || 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Top Banner (Identity Card Header) */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
              />
              {user.isVerified && (
                <span 
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs"
                  title="सत्यापित कर्मचारी (Verified Employee)"
                >
                  ✓
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold truncate">
                  {user.name}
                </h3>
                {user.isVerified ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-bold shrink-0">
                    सत्यापित
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold shrink-0">
                    कर्मचारी
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-200 mt-0.5 truncate">
                {user.designation}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-blue-300 mt-1 truncate">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{user.district}</span>
              </div>
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="flex rounded-xl bg-blue-900/60 p-1 mt-5 border border-blue-800/60 text-xs font-semibold">
            <button
              onClick={() => setActiveSubTab('profile')}
              className={`flex-1 py-1.5 rounded-lg transition text-center cursor-pointer ${
                activeSubTab === 'profile'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              कर्मचारी विवरण
            </button>
            <button
              onClick={() => setActiveSubTab('saved')}
              className={`flex-1 py-1.5 rounded-lg transition text-center cursor-pointer flex items-center justify-center gap-1 ${
                activeSubTab === 'saved'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>सहेजी गई सामग्री ({savedPostsCount + savedOrdersCount + savedNewsCount})</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[60vh] overflow-y-auto">
          
          {/* PROFILE TAB */}
          {activeSubTab === 'profile' && (
            <div className="space-y-4">
              {!isEditing ? (
                <>
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-700">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                        <span>पदनाम (Designation):</span>
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">{user.designation}</span>
                    </div>

                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-700">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>विभाग (Department):</span>
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white truncate max-w-[220px]">{user.department}</span>
                    </div>

                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-700">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        <span>कार्यरत जनपद (District):</span>
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">{user.district}</span>
                    </div>

                    {user.mobile && (
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-700">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-blue-600" />
                          <span>मोबाइल नंबर:</span>
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">{user.mobile}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        <span>पंजीकरण तिथि:</span>
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{user.joinedDate || 'सक्रिय'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4 text-blue-600" />
                      <span>विवरण संपादित करें</span>
                    </button>

                    <button
                      onClick={() => {
                        onLogout();
                        onClose();
                      }}
                      className="py-2.5 px-4 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>लॉगआउट</span>
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">पूरा नाम</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">पदनाम (Designation)</label>
                    <input
                      type="text"
                      value={designation}
                      onChange={e => setDesignation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">कार्यरत जनपद (District)</label>
                    <select
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    >
                      {UP_DISTRICTS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">विभाग (Department)</label>
                    <select
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    >
                      {UP_DEPARTMENTS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      नया पासवर्ड बदलें (वैकल्पिक)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="यदि पासवर्ड बदलना हो तभी भरें (कम से कम 4 अक्षर)"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                    >
                      रद्द करें
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Save className="w-4 h-4" />
                      <span>सुरक्षित करें</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* SAVED ITEMS TAB */}
          {activeSubTab === 'saved' && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="block text-base font-bold text-blue-900 dark:text-blue-400">{savedPostsCount}</span>
                  <span className="text-[11px] text-slate-500">फोरम पोस्ट्स</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="block text-base font-bold text-amber-600">{savedOrdersCount}</span>
                  <span className="text-[11px] text-slate-500">शासनादेश</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="block text-base font-bold text-emerald-600">{savedNewsCount}</span>
                  <span className="text-[11px] text-slate-500">ताज़ा खबरें</span>
                </div>
              </div>

              <div className="pt-2 text-xs space-y-2">
                <p className="font-bold text-slate-800 dark:text-slate-200">त्वरित पहुंच:</p>
                
                <button
                  onClick={() => {
                    onClose();
                    if (onNavigate) onNavigate({ type: 'talk-corner' });
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-600" />
                    <span>कम्युनिटी फोरम में मेरी पोस्ट्स व बुकमार्क देखें</span>
                  </span>
                  <span className="text-slate-400">→</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    if (onNavigate) onNavigate({ type: 'gov-orders' });
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>सभी महत्वपूर्ण शासनादेश व परिपत्र</span>
                  </span>
                  <span className="text-slate-400">→</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    if (onNavigate) onNavigate({ type: 'news-list' });
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Newspaper className="w-4 h-4 text-emerald-600" />
                    <span>कर्मचारी ताज़ा खबरें एवं मानदेय अपडेट</span>
                  </span>
                  <span className="text-slate-400">→</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">उत्तर प्रदेश आउटसोर्सिंग सेवा मंच</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold transition cursor-pointer"
          >
            बंद करें
          </button>
        </div>
      </div>
    </div>
  );
};
