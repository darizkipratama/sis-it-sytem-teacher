import React, { useState } from 'react';
import {
  Award,
  Plus,
  FileSpreadsheet,
  Save,
  CheckCircle2,
  BarChart2,
  ChevronRight,
  TrendingUp,
  SlidersHorizontal
} from 'lucide-react';
import {
  Student,
  AssessmentItem,
  StudentGrade,
  GradeType,
  ClassId
} from '../types';
import { saveGrades, createAssessment } from '../utils/storage';

interface PenilaianSectionProps {
  students: Student[];
  assessments: AssessmentItem[];
  grades: StudentGrade[];
  selectedClass: ClassId;
  onRefreshData: () => void;
}

export const PenilaianSection: React.FC<PenilaianSectionProps> = ({
  students,
  assessments,
  grades,
  selectedClass,
  onRefreshData
}) => {
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>(
    assessments[0]?.id || ''
  );
  const [localGrades, setLocalGrades] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    grades.forEach((g) => {
      initial[`${g.studentId}-${g.assessmentId}`] = g.score;
    });
    return initial;
  });

  const [isCreatingModal, setIsCreatingModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<GradeType>('Evaluasi Harian');
  const [newMaxScore, setNewMaxScore] = useState(100);
  const [newWeight, setNewWeight] = useState(20);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const filteredAssessments = assessments.filter((a) => {
    if (a.classId !== selectedClass) return false;
    if (selectedType === 'ALL') return true;
    return a.type === selectedType;
  });

  const activeAssessment = assessments.find((a) => a.id === selectedAssessmentId) || filteredAssessments[0];

  const handleScoreChange = (studentId: string, assessmentId: string, value: string) => {
    const score = Math.max(0, Math.min(100, Number(value) || 0));
    setLocalGrades((prev) => ({
      ...prev,
      [`${studentId}-${assessmentId}`]: score
    }));
  };

  const handleSaveGradesForAssessment = () => {
    if (!activeAssessment) return;
    const gradeList: StudentGrade[] = students.map((s) => ({
      studentId: s.id,
      assessmentId: activeAssessment.id,
      score: localGrades[`${s.id}-${activeAssessment.id}`] ?? 80
    }));

    saveGrades(activeAssessment.id, gradeList);
    onRefreshData();
    setToastMsg(`Nilai "${activeAssessment.title}" Berhasil Disimpan & Disinkronkan!`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCreateNewAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: AssessmentItem = {
      id: `ass-${Date.now()}`,
      title: newTitle,
      type: newType,
      classId: selectedClass,
      subject: 'Matematika Lanjut',
      date: new Date().toISOString().split('T')[0],
      maxScore: Number(newMaxScore) || 100,
      weight: Number(newWeight) || 20
    };

    createAssessment(newItem);
    setIsCreatingModal(false);
    setNewTitle('');
    onRefreshData();
    setSelectedAssessmentId(newItem.id);
    setToastMsg(`Penilaian Baru "${newItem.title}" Dibuat.`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Calculate Average
  const activeScores = students.map(
    (s) => localGrades[`${s.id}-${activeAssessment?.id}`] ?? 80
  );
  const activeAverage = Math.round(
    activeScores.reduce((a, b) => a + b, 0) / (students.length || 1)
  );

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Category Type Filter Pills */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] no-scrollbar">
          {['ALL', 'Ujian', 'Evaluasi Harian', 'Proyek', 'Kuis'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-2xl font-bold transition cursor-pointer whitespace-nowrap ${
                selectedType === type
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {type === 'ALL' ? 'Semua Tipe' : type}
            </button>
          ))}
        </div>

        {/* Create Assessment Button */}
        <button
          onClick={() => setIsCreatingModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold p-2 rounded-2xl flex items-center justify-center cursor-pointer shadow-xs transition"
          title="Tambah Penilaian Baru"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {toastMsg && (
        <div className="bg-indigo-900 text-white p-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md animate-fade-in border border-indigo-700/60">
          <CheckCircle2 className="w-4 h-4 text-indigo-300" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Assessment Selector Dropdown / Cards */}
      <div className="bg-white p-3.5 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Pilih Penilaian ({filteredAssessments.length})
          </span>
          {activeAssessment && (
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md">
              Bobot: {activeAssessment.weight}%
            </span>
          )}
        </div>

        <select
          value={activeAssessment?.id || ''}
          onChange={(e) => setSelectedAssessmentId(e.target.value)}
          className="w-full bg-slate-50 text-slate-900 font-bold text-xs p-2.5 rounded-2xl border border-slate-200 outline-none focus:border-indigo-600 cursor-pointer"
        >
          {filteredAssessments.map((a) => (
            <option key={a.id} value={a.id}>
              [{a.type}] {a.title} ({a.date})
            </option>
          ))}
        </select>
      </div>

      {/* Class Average Metric Banner */}
      {activeAssessment && (
        <div className="bg-slate-900 text-white p-4 rounded-3xl shadow-lg border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider block">
              Rata-Rata Kelas
            </span>
            <h3 className="text-xl font-black text-white">{activeAverage} / 100</h3>
            <p className="text-[10px] text-slate-400">Tipe: {activeAssessment.type}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-indigo-700/60 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-indigo-400" />
          </div>
        </div>
      )}

      {/* Students Grade Input List */}
      <div className="bg-white rounded-3xl p-3.5 border border-slate-200/90 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-800">Daftar Nilai Siswa</span>
          <span className="text-[10px] text-slate-400 font-mono">
            {students.length} Siswa Terdaftar
          </span>
        </div>

        <div className="space-y-2">
          {students.map((s) => {
            const currentScore =
              localGrades[`${s.id}-${activeAssessment?.id}`] ?? 80;
            return (
              <div
                key={s.id}
                className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 transition"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={s.avatar}
                    alt={s.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{s.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">NIS: {s.nis}</p>
                  </div>
                </div>

                {/* Score Input Box */}
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={currentScore}
                    onChange={(e) =>
                      activeAssessment &&
                      handleScoreChange(s.id, activeAssessment.id, e.target.value)
                    }
                    className="w-14 bg-white text-center font-extrabold text-xs text-slate-900 py-1.5 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-400 font-mono">/100</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Save Grades Button */}
        {activeAssessment && (
          <button
            onClick={handleSaveGradesForAssessment}
            className="w-full mt-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition active:scale-98"
          >
            <Save className="w-4 h-4 text-indigo-200" />
            <span>Simpan Nilai {activeAssessment.type}</span>
          </button>
        )}
      </div>

      {/* Create Assessment Modal */}
      {isCreatingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-200 animate-scale-in">
            <h3 className="text-sm font-extrabold text-slate-900 mb-3">
              Buat Evaluasi / Nilai Baru
            </h3>

            <form onSubmit={handleCreateNewAssessment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Judul Penilaian:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Evaluasi Harian 2 Vektor"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-teal-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Tipe Penilaian:
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as GradeType)}
                  className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-teal-600 font-bold"
                >
                  <option value="Evaluasi Harian">Evaluasi Harian</option>
                  <option value="Ujian">Ujian (UTS/UAS)</option>
                  <option value="Proyek">Proyek Kelompok</option>
                  <option value="Kuis">Kuis</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Skor Max:</label>
                  <input
                    type="number"
                    value={newMaxScore}
                    onChange={(e) => setNewMaxScore(Number(e.target.value))}
                    className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-teal-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Bobot (%):</label>
                  <input
                    type="number"
                    value={newWeight}
                    onChange={(e) => setNewWeight(Number(e.target.value))}
                    className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-teal-600 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-teal-800 hover:bg-teal-900 text-white font-bold py-2.5 rounded-xl shadow-md transition cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
