import React from 'react';
import { Bell, BookOpen, GraduationCap, ChevronDown, CheckCircle2, CloudLightning } from 'lucide-react';
import { ClassId } from '../types';

interface HeaderBarProps {
  selectedClass: ClassId;
  onClassChange: (cls: ClassId) => void;
  onOpenIntegrationDrawer: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  selectedClass,
  onClassChange,
  onOpenIntegrationDrawer
}) => {
  return (
    <header className="bg-slate-900 text-slate-100 px-4 pt-4 pb-4 shadow-xl relative border-b border-slate-800/80">
      {/* Top Identity Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 p-0.5 shadow-md shadow-indigo-950/50 flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold tracking-tight text-white">
                SEKOLAH IHSAN CLOUD
              </h1>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded-md font-semibold">
                Portal Guru
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Pak Ihsan Cloud, S.Pd</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Realtime Event Monitor Button */}
          <button
            onClick={onOpenIntegrationDrawer}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 flex items-center justify-center text-indigo-400 hover:text-white transition cursor-pointer relative shadow-sm"
            title="Integrasi RabbitMQ & Supabase Engine"
          >
            <CloudLightning className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-slate-900"></span>
          </button>

          {/* Notifications */}
          <div className="w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-400 rounded-full"></span>
          </div>
        </div>
      </div>

      {/* Class Selector & Wali Kelas Status Pill */}
      <div className="flex items-center justify-between gap-2 bg-slate-950/80 p-2 rounded-2xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span className="text-slate-400 font-medium text-[11px]">Kelas Aktif:</span>
          <div className="relative">
            <select
              value={selectedClass}
              onChange={(e) => onClassChange(e.target.value as ClassId)}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs pl-2.5 pr-7 py-1 rounded-xl appearance-none outline-none border border-slate-700 cursor-pointer shadow-sm transition"
            >
              <option value="10-IPA-1">10 IPA 1 (Matematika)</option>
              <option value="10-IPA-2">10 IPA 2 (Matematika)</option>
              <option value="11-MIPA-3">11 MIPA 3 (Fisika)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-indigo-400 absolute right-2 top-2 pointer-events-none" />
          </div>
        </div>

        {selectedClass === '10-IPA-1' && (
          <span className="flex items-center gap-1 bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap">
            <CheckCircle2 className="w-3 h-3 text-indigo-400" /> Wali Kelas
          </span>
        )}
      </div>
    </header>
  );
};
