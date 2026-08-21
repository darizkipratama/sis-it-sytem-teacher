import React, { useState, useEffect } from 'react';
import {
  Clock,
  Play,
  CheckCircle,
  MapPin,
  BookOpen,
  Calendar,
  Layers,
  ArrowRight,
  UserCheck,
  FileSpreadsheet,
  Zap,
  Sparkles,
  Loader2
} from 'lucide-react';
import { SyllabusTopic, ClassId } from '../types';
import { useAppStore } from '../store/useAppStore';
import { SyllabusService } from '../services/syllabusService';
import { JournalService } from '../services/journalService';
import { pushAsyncEvent } from '../utils/storage';

interface SesiSectionProps {
  onNavigateTab: (tab: any) => void;
}

export const SesiSection: React.FC<SesiSectionProps> = ({
  onNavigateTab
}) => {
  const selectedClassId = useAppStore((state) => state.selectedClassId);
  const selectedAssignment = useAppStore((state) => state.selectedAssignment);

  const [sessionStatus, setSessionStatus] = useState<'Belum Dimulai' | 'Berlangsung' | 'Selesai'>('Berlangsung');
  const [subtopics, setSubtopics] = useState<SyllabusTopic['subTopics']>([]);
  const [syllabus, setSyllabus] = useState<SyllabusTopic | null>(null);
  const [latestJournal, setLatestJournal] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const subjectName = selectedAssignment?.subject?.name || 'Matematika Lanjut';
  const classLabel = selectedAssignment?.class?.code || selectedAssignment?.class?.name || selectedClassId;
  const startTime = selectedAssignment?.startTime || '07:30';
  const endTime = selectedAssignment?.endTime || '09:00';

  const loadSesiData = async () => {
    if (!selectedClassId) return;

    setIsLoading(true);
    try {
      const [syllabusRes, journalRes] = await Promise.all([
        SyllabusService.getSyllabus(selectedClassId),
        JournalService.getJournals(selectedClassId),
      ]);

      if (syllabusRes.success && syllabusRes.data && syllabusRes.data.length > 0) {
        const active = syllabusRes.data.find((s) => !s.classId || s.classId === selectedClassId) || syllabusRes.data[0];
        setSyllabus(active);
        setSubtopics(active.subTopics || []);
      } else {
        setSyllabus(null);
        setSubtopics([]);
      }

      if (journalRes.success && journalRes.data && journalRes.data.length > 0) {
        setLatestJournal(journalRes.data[0]);
      } else {
        setLatestJournal(null);
      }
    } catch (err) {
      console.error('Failed to load sesi data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSesiData();
  }, [selectedClassId]);

  const handleToggleSubtopic = (id: string) => {
    const updated = subtopics.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s));
    setSubtopics(updated);

    pushAsyncEvent('ihsancloud.syllabus.exchange', 'SYLLABUS_SUBTOPIC_UPDATED', {
      topicId: syllabus?.id || 'syl-1',
      subtopicId: id,
      completedStatus: !subtopics.find((s) => s.id === id)?.completed
    });
  };

  const handleChangeStatus = (newStatus: 'Belum Dimulai' | 'Berlangsung' | 'Selesai') => {
    setSessionStatus(newStatus);

    pushAsyncEvent('ihsancloud.session.exchange', 'CLASS_SESSION_STATUS_CHANGED', {
      sessionId: latestJournal?.id || 'ses-101',
      classId: selectedClassId,
      newStatus,
      timestamp: new Date().toISOString()
    });
  };

  const completedCount = subtopics.filter((s) => s.completed).length;
  const progressPercent = Math.round((completedCount / (subtopics.length || 1)) * 100);

  const period = latestJournal?.period || `Jam ${startTime} - ${endTime}`;
  const topic = latestJournal?.materialTaught || 'Belum ada materi yang diinput';
  const room = 'R.204 (Lab Saintek)';

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[200px]">
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          <span className="text-sm font-medium">Memuat data sesi...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-20">
      {/* Active Session Status Header Card */}
      <div className="bg-slate-900 rounded-3xl p-4 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-center justify-between mb-3">
          <span className="flex items-center gap-1.5 bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide">
            <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            {period}
          </span>
          <span
            className={`px-3 py-0.5 rounded-full text-xs font-bold ${
              sessionStatus === 'Berlangsung'
                ? 'bg-indigo-500 text-white animate-pulse'
                : sessionStatus === 'Selesai'
                ? 'bg-slate-800 text-slate-300 border border-slate-700'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
          >
            {sessionStatus}
          </span>
        </div>

        <h2 className="text-lg font-extrabold tracking-tight text-white mb-1">
          {subjectName} - {classLabel}
        </h2>
        <p className="text-xs text-slate-400 font-medium mb-3 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-indigo-400" />
          Ruang: <span className="font-semibold text-slate-200">{room}</span>
        </p>

        <div className="bg-slate-950/80 backdrop-blur-md rounded-2xl p-3 mb-4 border border-slate-800">
          <p className="text-[11px] text-indigo-400 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
            <BookOpen className="w-3 h-3" /> Topik Hari Ini
          </p>
          <p className="text-xs font-bold text-white">{topic}</p>
        </div>

        {/* Start / Finish Session Action Buttons */}
        <div className="flex items-center gap-2">
          {sessionStatus !== 'Berlangsung' && (
            <button
              onClick={() => handleChangeStatus('Berlangsung')}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-2.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/50 transition active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Mulai Sesi Kelas Sekarang</span>
            </button>
          )}

          {sessionStatus === 'Berlangsung' && (
            <button
              onClick={() => handleChangeStatus('Selesai')}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-2.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-95 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Selesaikan Sesi Ini</span>
            </button>
          )}

          <button
            onClick={() => onNavigateTab('absensi')}
            className="bg-slate-800 hover:bg-slate-700 text-indigo-400 font-bold p-2.5 rounded-2xl border border-slate-700 flex items-center justify-center cursor-pointer transition"
            title="Buka Absensi"
          >
            <UserCheck className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => onNavigateTab('absensi')}
          className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition text-left flex items-start justify-between cursor-pointer group"
        >
          <div>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 font-bold group-hover:scale-110 transition-transform">
              <UserCheck className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-xs font-bold text-slate-800">Absensi Siswa</p>
            <p className="text-[10px] text-slate-500">Dual Mode: Swipe & Tabel</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition" />
        </button>

        <button
          onClick={() => onNavigateTab('penilaian')}
          className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition text-left flex items-start justify-between cursor-pointer group"
        >
          <div>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2 font-bold group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-xs font-bold text-slate-800">Input Nilai</p>
            <p className="text-[10px] text-slate-500">Ujian, Evaluasi, Proyek, Kuis</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 transition" />
        </button>
      </div>

      {/* Syllabus Card Today */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">Silabus Pengajaran Hari Ini</h3>
              <p className="text-[10px] text-slate-500">{syllabus?.chapter || 'Belum ada silabus'}</p>
            </div>
          </div>
          <span className="text-[11px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
            {progressPercent}% Selesai
          </span>
        </div>

        {syllabus?.competencyTarget && (
          <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 mb-3 italic">
            "{syllabus.competencyTarget}"
          </p>
        )}

        {/* Subtopics Checklist */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Sub-materi Pertemuan:</p>
          {subtopics.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Belum ada sub-topik untuk kelas ini.</p>
          ) : (
            subtopics.map((st) => (
              <label
                key={st.id}
                onClick={() => handleToggleSubtopic(st.id)}
                className={`flex items-center justify-between p-2.5 rounded-2xl border transition cursor-pointer ${
                  st.completed
                    ? 'bg-indigo-50/80 border-indigo-200 text-indigo-950 font-medium'
                    : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={st.completed}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                  />
                  <span className={`text-xs ${st.completed ? 'line-through text-indigo-900' : ''}`}>
                    {st.title}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {st.recommendedDuration}
                </span>
              </label>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
