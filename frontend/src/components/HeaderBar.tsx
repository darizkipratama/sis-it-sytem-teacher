import React, { useState, useEffect } from 'react';
import { Bell, BookOpen, GraduationCap, ChevronDown, CheckCircle2, CloudLightning, LogOut, Loader2 } from 'lucide-react';
import { UserSession, TeacherAssignment } from '../types';
import { useAuth } from '../context/AuthContext';
import { AssignmentService } from '../services/assignmentService';
import { useAppStore } from '../store/useAppStore';

interface HeaderBarProps {
  user?: UserSession | null;
  onOpenIntegrationDrawer: () => void;
  onLogout?: () => void;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const HeaderBar: React.FC<HeaderBarProps> = ({
  user: propUser,
  onOpenIntegrationDrawer,
  onLogout: propOnLogout
}) => {
  const auth = useAuth();
  const currentUser = propUser || auth.user;
  const handleLogout = propOnLogout || auth.logout;

  const selectedClassId = useAppStore((state) => state.selectedClassId);
  const selectedAssignment = useAppStore((state) => state.selectedAssignment);
  const setSelectedAssignment = useAppStore((state) => state.setSelectedAssignment);

  const [classOptions, setClassOptions] = useState<TeacherAssignment[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);

  const currentDayOfWeek = DAY_NAMES[new Date().getDay()];

  const loadTodayClasses = async () => {
    if (!currentUser?.id) return;

    setIsLoadingClasses(true);
    try {
      const response = await AssignmentService.getAssignmentsByTeacherAndDay(currentUser.id, currentDayOfWeek);
      if (response.success && response.data && response.data.length > 0) {
        setClassOptions(response.data);
      } else {
        const allResponse = await AssignmentService.getAssignmentsByTeacher(currentUser.id);
        if (allResponse.success && allResponse.data) {
          setClassOptions(allResponse.data);
        }
      }
    } catch (err) {
      console.error('Failed to load class assignments:', err);
    } finally {
      setIsLoadingClasses(false);
    }
  };

  useEffect(() => {
    loadTodayClasses();
  }, [currentUser?.id]);

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const classId = e.target.value;
    const assignment = classOptions.find((a) => a.classId === classId) || null;
    setSelectedAssignment(assignment);
  };

  const selectedClassName = selectedAssignment?.class?.code || selectedAssignment?.class?.name || selectedClassId;

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
            <p className="text-[11px] text-slate-400 font-medium">{currentUser?.name || 'Pak Ihsan Cloud, S.Pd'}</p>
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

          {/* Logout Button */}
          {handleLogout && (
            <button
              onClick={handleLogout}
              className="w-9 h-9 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 hover:text-rose-300 transition cursor-pointer shadow-sm"
              title="Keluar / Logout"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
            </button>
          )}
        </div>
      </div>

      {/* Class Selector & Wali Kelas Status Pill */}
      <div className="flex items-center justify-between gap-2 bg-slate-950/80 p-2 rounded-2xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          {/* <BookOpen className="w-4 h-4 text-indigo-400" /> */}
          <span className="text-slate-400 font-medium text-[11px]">Kelas Aktif:</span>
          <div className="relative">
            {isLoadingClasses ? (
              <div className="flex items-center gap-1.5 bg-slate-800 text-slate-400 text-xs pl-2.5 pr-7 py-1 rounded-xl">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                <span>Memuat...</span>
              </div>
            ) : (
              <>
                <select
                  value={selectedClassId}
                  onChange={handleClassChange}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs pl-2.5 pr-7 py-1 rounded-xl appearance-none outline-none border border-slate-700 cursor-pointer shadow-sm transition"
                >
                  {classOptions.length === 0 ? (
                    <option value="">Tidak ada jadwal hari ini</option>
                  ) : (
                    classOptions.map((assignment) => {
                      const classLabel = assignment.class?.code || assignment.class?.name || assignment.classId;
                      const subjectLabel = assignment.subject?.name || '';
                      return (
                        <option key={assignment.id} value={assignment.classId}>
                          {classLabel}{subjectLabel ? ` - ${subjectLabel}` : ''} ({assignment.dayOfWeek} {assignment.startTime}-{assignment.endTime})
                        </option>
                      );
                    })
                  )}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-indigo-400 absolute right-2 top-2 pointer-events-none" />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
