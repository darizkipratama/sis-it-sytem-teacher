import React, { useState } from 'react';
import { Search, CheckCircle2, AlertCircle, Clock, CheckCheck, UserCheck } from 'lucide-react';
import { Student, AttendanceStatus, AttendanceRecord, ClassSession } from '../types';

interface AbsensiTableModeProps {
  students: Student[];
  session: ClassSession;
  records: Record<string, AttendanceStatus>;
  onStatusChange: (studentId: string, status: AttendanceStatus) => void;
  onMarkAllHadir: () => void;
}

export const AbsensiTableMode: React.FC<AbsensiTableModeProps> = ({
  students,
  session,
  records,
  onStatusChange,
  onMarkAllHadir
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.nis.includes(searchTerm);
    if (!matchesSearch) return false;
    if (filterStatus === 'ALL') return true;
    const current = records[s.id] || 'Hadir';
    return current === filterStatus;
  });

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'Hadir':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Sakit':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Izin':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'Alpa':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Terlambat':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const statusOptions: AttendanceStatus[] = ['Hadir', 'Sakit', 'Izin', 'Alpa', 'Terlambat'];

  return (
    <div className="space-y-3">
      {/* Search & Bulk Action Header */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama atau NIS siswa..."
            className="w-full bg-white text-xs text-slate-800 pl-9 pr-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-teal-500 shadow-sm"
          />
        </div>
        <button
          onClick={onMarkAllHadir}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <CheckCheck className="w-4 h-4 text-indigo-200" />
          <span>Hadir Semua</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] no-scrollbar">
        {['ALL', 'Hadir', 'Sakit', 'Izin', 'Alpa', 'Terlambat'].map((f) => (
          <button
            key={f}
            onClick={() => setFilterStatus(f)}
            className={`px-3 py-1 rounded-full font-semibold transition cursor-pointer whitespace-nowrap ${
              filterStatus === f
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {f === 'ALL' ? 'Semua Siswa' : f}
          </button>
        ))}
      </div>

      {/* Students List Table Cards */}
      <div className="space-y-2">
        {filteredStudents.map((s, index) => {
          const currentStatus = records[s.id] || 'Hadir';
          return (
            <div
              key={s.id}
              className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-sm flex items-center justify-between gap-2 hover:border-teal-300 transition"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-[10px] font-mono text-slate-400 w-4 text-center">
                  {index + 1}
                </span>
                <img
                  src={s.avatar}
                  alt={s.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs flex-shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{s.name}</h4>
                  <p className="text-[10px] text-slate-500 font-mono">NIS: {s.nis}</p>
                </div>
              </div>

              {/* Status Select Buttons */}
              <div className="flex items-center gap-1">
                {statusOptions.map((st) => {
                  const isSelected = currentStatus === st;
                  const shortLabel = st === 'Terlambat' ? 'T' : st[0];
                  return (
                    <button
                      key={st}
                      onClick={() => onStatusChange(s.id, st)}
                      title={st}
                      className={`w-7 h-7 rounded-lg text-[11px] font-extrabold flex items-center justify-center transition cursor-pointer ${
                        isSelected
                          ? st === 'Hadir'
                            ? 'bg-emerald-600 text-white shadow-sm scale-110'
                            : st === 'Sakit'
                            ? 'bg-amber-500 text-white shadow-sm scale-110'
                            : st === 'Izin'
                            ? 'bg-sky-500 text-white shadow-sm scale-110'
                            : st === 'Alpa'
                            ? 'bg-rose-600 text-white shadow-sm scale-110'
                            : 'bg-purple-600 text-white shadow-sm scale-110'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {shortLabel}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filteredStudents.length === 0 && (
          <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400 text-xs">
            Tidak ada data siswa ditemukan untuk kata kunci ini.
          </div>
        )}
      </div>
    </div>
  );
};
