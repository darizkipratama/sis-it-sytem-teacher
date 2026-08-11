import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { Check, X, RotateCcw, AlertTriangle, ShieldAlert, Sparkles, CheckCircle2, Share2, ThumbsUp } from 'lucide-react';
import { Student, AttendanceStatus, ClassSession } from '../types';

interface AbsensiTinderModeProps {
  students: Student[];
  session: ClassSession;
  records: Record<string, AttendanceStatus>;
  onStatusChange: (studentId: string, status: AttendanceStatus) => void;
  onSaveAttendance: () => void;
}

export const AbsensiTinderMode: React.FC<AbsensiTinderModeProps> = ({
  students,
  session,
  records,
  onStatusChange,
  onSaveAttendance
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState<{ id: string; status: AttendanceStatus }[]>([]);
  const [lastActionToast, setLastActionToast] = useState<string | null>(null);

  // Current student on top of stack
  const currentStudent = students[currentIndex];

  const handleSwipe = (direction: 'left' | 'right' | 'up' | 'down', statusOverride?: AttendanceStatus) => {
    if (!currentStudent) return;

    let status: AttendanceStatus = 'Hadir';
    if (statusOverride) {
      status = statusOverride;
    } else if (direction === 'right') {
      status = 'Hadir';
    } else if (direction === 'left') {
      status = 'Alpa';
    } else if (direction === 'up') {
      status = 'Izin';
    } else if (direction === 'down') {
      status = 'Sakit';
    }

    onStatusChange(currentStudent.id, status);
    setHistory((prev) => [...prev, { id: currentStudent.id, status }]);
    setLastActionToast(`${currentStudent.name} -> ${status}`);
    setTimeout(() => setLastActionToast(null), 1800);

    setCurrentIndex((prev) => prev + 1);
  };

  const handleUndo = () => {
    if (currentIndex <= 0 || history.length === 0) return;
    const last = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setCurrentIndex((prev) => prev - 1);
  };

  // Stats calculation
  const totalStudents = students.length;
  const isFinished = currentIndex >= totalStudents;

  const countStatus = (st: AttendanceStatus) =>
    students.filter((s) => (records[s.id] || 'Hadir') === st).length;

  return (
    <div className="flex flex-col items-center justify-between min-h-[500px] py-2 relative select-none">
      {/* Step Progress Header */}
      <div className="w-full bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-xs font-bold text-slate-800">Mode Swipe Absensi (Tinder)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
            {Math.min(currentIndex + 1, totalStudents)} / {totalStudents} Siswa
          </span>
          <button
            onClick={handleUndo}
            disabled={currentIndex === 0}
            className={`p-1.5 rounded-xl border transition cursor-pointer ${
              currentIndex > 0
                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                : 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
            }`}
            title="Urungkan Swipe Terakhir"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Action Toast Overlay */}
      {lastActionToast && (
        <div className="absolute top-14 z-30 bg-slate-900/90 text-emerald-300 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg border border-teal-500/40 backdrop-blur-md animate-bounce">
          {lastActionToast}
        </div>
      )}

      {/* Card Stack Area */}
      <div className="w-full max-w-sm h-[380px] relative flex items-center justify-center my-auto">
        {!isFinished && currentStudent ? (
          <AnimatePresence mode="popLayout">
            <SwipableCard
              key={currentStudent.id}
              student={currentStudent}
              onSwipe={handleSwipe}
              index={currentIndex}
              total={totalStudents}
            />
          </AnimatePresence>
        ) : (
          /* Completion Summary Card */
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 text-center flex flex-col justify-between h-full"
          >
            <div>
              <div className="w-14 h-14 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-indigo-500/40">
                <CheckCircle2 className="w-8 h-8 text-indigo-400 animate-bounce" />
              </div>
              <h3 className="text-lg font-extrabold text-white">Selesai Absensi!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Seluruh {totalStudents} siswa pada kelas {session.classId} telah tercatat.
              </p>
            </div>

            {/* Breakdown Stats Grid */}
            <div className="grid grid-cols-2 gap-2 my-4">
              <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-indigo-400 uppercase font-bold block">HADIR</span>
                <span className="text-lg font-black text-indigo-200">{countStatus('Hadir')}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-amber-400 uppercase font-bold block">SAKIT</span>
                <span className="text-lg font-black text-amber-200">{countStatus('Sakit')}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-sky-400 uppercase font-bold block">IZIN</span>
                <span className="text-lg font-black text-sky-200">{countStatus('Izin')}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-rose-400 uppercase font-bold block">ALPA</span>
                <span className="text-lg font-black text-rose-200">{countStatus('Alpa')}</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={onSaveAttendance}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-3 rounded-2xl text-xs shadow-lg shadow-indigo-950/50 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Simpan & Sync Realtime Engine</span>
              </button>
              <button
                onClick={() => setCurrentIndex(0)}
                className="text-xs text-indigo-400 underline font-semibold hover:text-white"
              >
                Ulangi Absensi dari Awal
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Swipe Action Control Buttons */}
      {!isFinished && (
        <div className="w-full max-w-xs flex items-center justify-around gap-2 pt-2">
          {/* Alpa / Swipe Left */}
          <button
            onClick={() => handleSwipe('left')}
            className="w-13 h-13 rounded-full bg-rose-50 border-2 border-rose-200 text-rose-600 flex items-center justify-center shadow-md hover:bg-rose-100 hover:scale-110 active:scale-95 transition cursor-pointer"
            title="Tidak Hadir / Alpa (Slide Kiri)"
          >
            <X className="w-6 h-6 stroke-[3]" />
          </button>

          {/* Sakit Button */}
          <button
            onClick={() => handleSwipe('down', 'Sakit')}
            className="px-3 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold shadow-xs hover:bg-amber-100 active:scale-95 transition cursor-pointer"
          >
            Sakit
          </button>

          {/* Izin Button */}
          <button
            onClick={() => handleSwipe('up', 'Izin')}
            className="px-3 py-2 rounded-2xl bg-sky-50 border border-sky-200 text-sky-800 text-[11px] font-bold shadow-xs hover:bg-sky-100 active:scale-95 transition cursor-pointer"
          >
            Izin
          </button>

          {/* Hadir / Swipe Right */}
          <button
            onClick={() => handleSwipe('right')}
            className="w-13 h-13 rounded-full bg-emerald-500 border-2 border-emerald-400 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 hover:bg-emerald-600 hover:scale-110 active:scale-95 transition cursor-pointer"
            title="Hadir (Slide Kanan)"
          >
            <Check className="w-7 h-7 stroke-[3]" />
          </button>
        </div>
      )}
    </div>
  );
};

// Individual Swipable Card
const SwipableCard: React.FC<{
  student: Student;
  onSwipe: (dir: 'left' | 'right' | 'up' | 'down') => void;
  index: number;
  total: number;
}> = ({ student, onSwipe, index, total }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.4, 1, 1, 1, 0.4]);

  // Overlays
  const hadirOpacity = useTransform(x, [10, 100], [0, 1]);
  const alpaOpacity = useTransform(x, [-10, -100], [0, 1]);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100) {
      onSwipe('right');
    } else if (info.offset.x < -100) {
      onSwipe('left');
    }
  };

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
      className="absolute w-full h-full bg-white rounded-3xl p-5 border border-slate-200 shadow-xl flex flex-col justify-between cursor-grab touch-none overflow-hidden"
    >
      {/* Swipe Badges Overlay */}
      <motion.div
        style={{ opacity: hadirOpacity }}
        className="absolute top-6 left-6 border-4 border-emerald-500 text-emerald-600 font-black text-2xl px-3 py-1 rounded-2xl transform -rotate-12 z-20 bg-white/90 shadow-md"
      >
        HADIR
      </motion.div>

      <motion.div
        style={{ opacity: alpaOpacity }}
        className="absolute top-6 right-6 border-4 border-rose-500 text-rose-600 font-black text-2xl px-3 py-1 rounded-2xl transform rotate-12 z-20 bg-white/90 shadow-md"
      >
        ALPA
      </motion.div>

      {/* Card Header & Student Photo */}
      <div className="flex flex-col items-center text-center mt-2">
        <div className="relative mb-3">
          <img
            src={student.avatar}
            alt={student.name}
            className="w-28 h-28 rounded-3xl object-cover border-4 border-emerald-100 shadow-md"
          />
          <span className="absolute -bottom-2 bg-emerald-800 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
            {student.gender === 'L' ? 'Siswa (L)' : 'Siswi (P)'}
          </span>
        </div>

        <h3 className="text-base font-extrabold text-slate-900 leading-tight mb-0.5">
          {student.name}
        </h3>
        <p className="text-xs font-mono text-slate-500">NIS: {student.nis}</p>
      </div>

      {/* Parent Info & Historical Rate */}
      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 space-y-1.5 text-xs">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-slate-500 font-medium">Orang Tua / Wali:</span>
          <span className="font-bold text-slate-800 truncate max-w-[150px]">
            {student.parentName}
          </span>
        </div>
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-slate-500 font-medium">Kehadiran Kumulatif:</span>
          <span className="font-extrabold text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded-md">
            {student.attendanceHistoryRate}%
          </span>
        </div>
      </div>

      {/* Swipe Direction Hint Footer */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
        <span className="flex items-center gap-1 text-rose-500 font-medium">
          ← Geser Kiri (Alpa)
        </span>
        <span className="flex items-center gap-1 text-emerald-600 font-medium">
          Geser Kanan (Hadir) →
        </span>
      </div>
    </motion.div>
  );
};
