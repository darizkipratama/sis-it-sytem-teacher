import React, { useState } from 'react';
import {
  FileText,
  BookOpen,
  Award,
  Sparkles,
  Layers
} from 'lucide-react';
import { ClassJournal, ClassSession, ClassId } from '../types';
import { BeritaAcaraTab } from './BeritaAcaraTab';
import { RencanaAjarTab } from './RencanaAjarTab';

interface JurnalSilabusSectionProps {
  journals: ClassJournal[];
  session: ClassSession;
  selectedClass: ClassId;
  onRefreshData: () => void;
}

export const JurnalSilabusSection: React.FC<JurnalSilabusSectionProps> = ({
  journals,
  session,
  selectedClass,
  onRefreshData
}) => {
  const [activeMainTab, setActiveMainTab] = useState<'beritaAcara' | 'rencanaAjar'>('beritaAcara');

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Top Banner Identity Header */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            {activeMainTab === 'beritaAcara' ? (
              <FileText className="w-5 h-5 text-indigo-600" />
            ) : (
              <BookOpen className="w-5 h-5 text-indigo-600" />
            )}
          </div>
          <div>
            <h2 className="text-xs font-extrabold text-slate-900">
              {activeMainTab === 'beritaAcara'
                ? 'Jurnal & Berita Acara Kelas'
                : 'Silabus & Rencana Pelaksanaan Ajar'}
            </h2>
            <p className="text-[10px] text-slate-500">
              {session.subject} - Kelas {selectedClass}
            </p>
          </div>
        </div>
        <span className="text-[10px] bg-indigo-50 text-indigo-700 font-extrabold px-2.5 py-1 rounded-full border border-indigo-200">
          Modul Guru
        </span>
      </div>

      {/* Primary Section Switcher */}
      <div className="flex items-center bg-slate-900 p-1.5 rounded-2xl text-xs gap-1 shadow-md">
        <button
          onClick={() => setActiveMainTab('beritaAcara')}
          className={`flex-1 py-2 px-3 rounded-xl font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeMainTab === 'beritaAcara'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Berita Acara Pengajaran</span>
        </button>

        <button
          onClick={() => setActiveMainTab('rencanaAjar')}
          className={`flex-1 py-2 px-3 rounded-xl font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeMainTab === 'rencanaAjar'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Input Rencana Ajar</span>
        </button>
      </div>

      {/* Main Tab Content */}
      {activeMainTab === 'beritaAcara' ? (
        <BeritaAcaraTab
          session={session}
          selectedClass={selectedClass}
          onRefreshData={onRefreshData}
        />
      ) : (
        <RencanaAjarTab
          selectedClass={selectedClass}
          onRefreshData={onRefreshData}
        />
      )}
    </div>
  );
};
