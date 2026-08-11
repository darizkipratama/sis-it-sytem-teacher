import React, { useState } from 'react';
import { Layers, ListFilter, Sparkles, CheckCircle2, RotateCcw, Send } from 'lucide-react';
import { Student, AttendanceStatus, ClassSession } from '../types';
import { AbsensiTableMode } from './AbsensiTableMode';
import { AbsensiTinderMode } from './AbsensiTinderMode';
import { saveAttendanceRecords } from '../utils/storage';

interface AbsensiSectionProps {
  students: Student[];
  session: ClassSession;
  onRefreshData: () => void;
}

export const AbsensiSection: React.FC<AbsensiSectionProps> = ({
  students,
  session,
  onRefreshData
}) => {
  const [mode, setMode] = useState<'tabel' | 'tinder'>('tinder');
  const [records, setRecords] = useState<Record<string, AttendanceStatus>>(() => {
    const initial: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      initial[s.id] = 'Hadir';
    });
    return initial;
  });
  const [savedNotification, setSavedNotification] = useState<boolean>(false);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setRecords((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAllHadir = () => {
    const updated: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      updated[s.id] = 'Hadir';
    });
    setRecords(updated);
  };

  const handleSave = () => {
    const list = students.map((s) => ({
      studentId: s.id,
      date: new Date().toISOString().split('T')[0],
      sessionId: session.id,
      status: records[s.id] || 'Hadir',
      recordedAt: new Date().toISOString()
    }));

    saveAttendanceRecords(list);
    setSavedNotification(true);
    onRefreshData();
    setTimeout(() => setSavedNotification(false), 3000);
  };

  const counts = {
    Hadir: students.filter((s) => (records[s.id] || 'Hadir') === 'Hadir').length,
    Sakit: students.filter((s) => records[s.id] === 'Sakit').length,
    Izin: students.filter((s) => records[s.id] === 'Izin').length,
    Alpa: students.filter((s) => records[s.id] === 'Alpa').length,
    Terlambat: students.filter((s) => records[s.id] === 'Terlambat').length
  };

  return (
    <div className="p-4 space-y-3 pb-24">
      {/* Mode Switcher Header Card */}
      <div className="bg-white p-3 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xs font-extrabold text-slate-900">Absensi Kelas {session.classId}</h2>
          <p className="text-[10px] text-slate-500">Pilih mode pengisian presensi siswa</p>
        </div>

        {/* Toggle Switch */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setMode('tinder')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${
              mode === 'tinder'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Mode Tinder</span>
          </button>
          <button
            onClick={() => setMode('tabel')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${
              mode === 'tabel'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Mode Tabel</span>
          </button>
        </div>
      </div>

      {/* Summary Chips */}
      <div className="grid grid-cols-5 gap-1 text-center text-[10px] font-bold">
        <div className="bg-emerald-50 text-emerald-800 p-1.5 rounded-xl border border-emerald-200">
          Hadir: {counts.Hadir}
        </div>
        <div className="bg-amber-50 text-amber-800 p-1.5 rounded-xl border border-amber-200">
          Sakit: {counts.Sakit}
        </div>
        <div className="bg-sky-50 text-sky-800 p-1.5 rounded-xl border border-sky-200">
          Izin: {counts.Izin}
        </div>
        <div className="bg-rose-50 text-rose-800 p-1.5 rounded-xl border border-rose-200">
          Alpa: {counts.Alpa}
        </div>
        <div className="bg-purple-50 text-purple-800 p-1.5 rounded-xl border border-purple-200">
          Telat: {counts.Terlambat}
        </div>
      </div>

      {savedNotification && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between shadow-lg animate-fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            Data Absensi Terkirim ke Gateway Realtime
          </span>
          <span className="text-[10px] bg-emerald-800 px-2 py-0.5 rounded-md font-mono">
            RabbitMQ OK
          </span>
        </div>
      )}

      {/* Active Mode View */}
      {mode === 'tinder' ? (
        <AbsensiTinderMode
          students={students}
          session={session}
          records={records}
          onStatusChange={handleStatusChange}
          onSaveAttendance={handleSave}
        />
      ) : (
        <AbsensiTableMode
          students={students}
          session={session}
          records={records}
          onStatusChange={handleStatusChange}
          onMarkAllHadir={handleMarkAllHadir}
        />
      )}

      {/* Save Button for Table Mode */}
      {mode === 'tabel' && (
        <button
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-emerald-800 to-teal-700 hover:from-emerald-700 hover:to-teal-600 text-white font-extrabold py-3.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 cursor-pointer active:scale-98 transition"
        >
          <Send className="w-4 h-4 text-emerald-300" />
          <span>Simpan & Broadcast Presensi Realtime</span>
        </button>
      )}
    </div>
  );
};
