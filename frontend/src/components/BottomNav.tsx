import React from 'react';
import { PlayCircle, UserCheck, Award, Megaphone, FileText } from 'lucide-react';

export type NavTab = 'sesi' | 'absensi' | 'penilaian' | 'pengumuman' | 'jurnal';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'sesi' as NavTab, label: 'Sesi', icon: PlayCircle },
    { id: 'absensi' as NavTab, label: 'Absen', icon: UserCheck },
    { id: 'penilaian' as NavTab, label: 'Nilai', icon: Award },
    { id: 'pengumuman' as NavTab, label: 'Pengumuman', icon: Megaphone, badge: 'Wali' },
    { id: 'jurnal' as NavTab, label: 'Jurnal', icon: FileText }
  ];

  return (
    <nav className="sticky bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-2 flex items-center justify-around z-40 shadow-[0_-4px_20px_rgba(15,23,42,0.6)]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 cursor-pointer relative ${
              isActive
                ? 'text-indigo-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200 font-medium'
            }`}
          >
            {/* Active Pill Indicator */}
            {isActive && (
              <span className="absolute -top-2 w-8 h-1 bg-indigo-500 rounded-full shadow-sm shadow-indigo-500/50"></span>
            )}

            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-indigo-400' : ''}`} />
              {tab.badge && (
                <span className="absolute -top-1.5 -right-3 text-[9px] bg-indigo-600 text-white font-bold px-1 rounded-full border border-slate-900 leading-tight">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
