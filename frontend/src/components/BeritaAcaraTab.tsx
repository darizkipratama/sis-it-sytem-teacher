import React, { useState, useEffect } from 'react';
import {
  FileText,
  BookOpen,
  Save,
  CheckCircle2,
  Award,
  AlertCircle,
  Sparkles,
  Users,
  ShieldCheck,
  Plus,
  Clock,
  Printer
} from 'lucide-react';
import { ClassJournal, ClassSession, ClassId } from '../types';
import { JournalService } from '../services/journalService';

interface BeritaAcaraTabProps {
  session: ClassSession;
  selectedClass: ClassId;
  onRefreshData: () => void;
}

export const BeritaAcaraTab: React.FC<BeritaAcaraTabProps> = ({
  session,
  selectedClass,
  onRefreshData
}) => {
  const [journals, setJournals] = useState<ClassJournal[]>([]);
  const [activeTabMode, setActiveTabMode] = useState<'input' | 'riwayat'>('input');

  const [materialTaught, setMaterialTaught] = useState(
    'Konsep Vektor 3D, Dot Product & Sudut Orthogonal.'
  );
  const [achievements, setAchievements] = useState(
    '85% siswa menguasai perhitungan sudut vektor 3 dimensi.'
  );
  const [obstacles, setObstacles] = useState(
    '3 siswa membutuhkan bimbingan khusus pada pemahaman sumbu Z.'
  );
  const [behaviorNotes, setBehaviorNotes] = useState(
    'Sangat kondusif, siswa antusias berdiskusi dalam kelompok.'
  );
  const [incidentReport, setIncidentReport] = useState(
    'Kegiatan belajar berjalan lancar tanpa kendala kedisiplinan yang berarti.'
  );
  const [presentCount, setPresentCount] = useState<number>(26);
  const [absentCount, setAbsentCount] = useState<number>(2);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [selectedJournalForPreview, setSelectedJournalForPreview] = useState<ClassJournal | null>(null);

  const loadJournalData = async () => {
    const res = await JournalService.getJournals(selectedClass);
    if (res.success && res.data) {
      setJournals(res.data);
      const current = res.data.find((j) => j.sessionId === session.id) || res.data[0];
      if (current) {
        setMaterialTaught(current.materialTaught || '');
        setAchievements(current.achievements || '');
        setObstacles(current.obstaclesAndSolutions || '');
        setBehaviorNotes(current.studentBehaviorNotes || '');
        setIncidentReport(current.incidentReport || '');
        setPresentCount(current.presentCount || 26);
        setAbsentCount(current.absentCount || 2);
      }
    }
  };

  useEffect(() => {
    loadJournalData();
  }, [selectedClass, session.id]);

  const handleSaveBeritaAcara = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await JournalService.saveJournal({
      sessionId: session.id,
      classId: selectedClass,
      subjectId: session.subjectId || 'subj-1',
      teacherId: 'usr-teach-1',
      subject: session.subject,
      period: session.period,
      materialTaught,
      achievements,
      obstaclesAndSolutions: obstacles,
      studentBehaviorNotes: behaviorNotes,
      incidentReport,
      presentCount,
      absentCount,
      verificationStatus: 'Disahkan Headmaster',
      teacherName: 'Pak Ihsan Cloud, S.Pd'
    });

    if (res.success && res.data) {
      setToastMsg('Berita Acara Pengajaran Berhasil Disimpan & Disahkan!');
      loadJournalData();
      onRefreshData();
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Sub-navigation Switcher */}
      <div className="flex items-center gap-2 bg-slate-200/80 p-1 rounded-2xl text-xs">
        <button
          onClick={() => setActiveTabMode('input')}
          className={`flex-1 py-1.5 px-3 rounded-xl font-bold transition cursor-pointer ${
            activeTabMode === 'input'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Input Berita Acara Sesi
        </button>
        <button
          onClick={() => setActiveTabMode('riwayat')}
          className={`flex-1 py-1.5 px-3 rounded-xl font-bold transition cursor-pointer ${
            activeTabMode === 'riwayat'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Riwayat & Dokumen ({journals.length})
        </button>
      </div>

      {toastMsg && (
        <div className="bg-indigo-900 text-white p-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md animate-fade-in border border-indigo-700/60">
          <CheckCircle2 className="w-4 h-4 text-indigo-300" />
          <span>{toastMsg}</span>
        </div>
      )}

      {activeTabMode === 'input' ? (
        <form
          onSubmit={handleSaveBeritaAcara}
          className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-3.5 text-xs"
        >
          {/* Header Info */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                BERITA ACARA PENGAJARAN
              </span>
              <h4 className="font-extrabold text-slate-800">{session.subject}</h4>
              <p className="text-[11px] text-slate-500">Kelas: {selectedClass} • {session.period}</p>
            </div>
            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-indigo-200">
              Sesi Aktif
            </span>
          </div>

          {/* Attendance counts */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1 text-[11px]">
                <Users className="w-3.5 h-3.5 text-indigo-600" /> Jumlah Siswa Hadir:
              </label>
              <input
                type="number"
                value={presentCount}
                onChange={(e) => setPresentCount(Number(e.target.value))}
                className="w-full bg-slate-50 text-slate-900 p-2 rounded-xl border border-slate-200 font-bold text-center outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-amber-600" /> Tidak Hadir / Absen:
              </label>
              <input
                type="number"
                value={absentCount}
                onChange={(e) => setAbsentCount(Number(e.target.value))}
                className="w-full bg-slate-50 text-slate-900 p-2 rounded-xl border border-slate-200 font-bold text-center outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Material Taught */}
          <div>
            <label className="block text-slate-800 font-extrabold mb-1 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              Materi & Pokok Bahasan Yang Disampaikan:
            </label>
            <textarea
              rows={2}
              required
              value={materialTaught}
              onChange={(e) => setMaterialTaught(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-2xl border border-slate-200 outline-none focus:border-indigo-600 font-medium"
            ></textarea>
          </div>

          {/* Incident / Berita Acara Report */}
          <div>
            <label className="block text-slate-800 font-extrabold mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              Berita Acara Kejadian & Catatan Khusus Kelas:
            </label>
            <textarea
              rows={2}
              value={incidentReport}
              onChange={(e) => setIncidentReport(e.target.value)}
              placeholder="Catatan berita acara khusus kejadian di kelas..."
              className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-2xl border border-slate-200 outline-none focus:border-indigo-600 font-medium"
            ></textarea>
          </div>

          {/* Achievements */}
          <div>
            <label className="block text-slate-800 font-extrabold mb-1 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              Tingkat Pencapaian / Ketercapaian TP:
            </label>
            <input
              type="text"
              required
              value={achievements}
              onChange={(e) => setAchievements(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-600 font-medium"
            />
          </div>

          {/* Obstacles and Solutions */}
          <div>
            <label className="block text-slate-800 font-extrabold mb-1 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              Hambatan Belajar & Solusi Evaluasi:
            </label>
            <input
              type="text"
              value={obstacles}
              onChange={(e) => setObstacles(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-600 font-medium"
            />
          </div>

          {/* Behavior Notes */}
          <div>
            <label className="block text-slate-800 font-extrabold mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              Catatan Kedisiplinan & Sikap Siswa:
            </label>
            <input
              type="text"
              value={behaviorNotes}
              onChange={(e) => setBehaviorNotes(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-600 font-medium"
            />
          </div>

          {/* Teacher Signature Footer */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Guru Pengampu: <strong className="text-slate-800">Pak Ihsan Cloud, S.Pd</strong></span>
            <span className="font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md font-bold">
              ID: GURU-10092
            </span>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-3.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition active:scale-98"
          >
            <Save className="w-4 h-4 text-indigo-200" />
            <span>Simpan & Sahkan Berita Acara Sesi</span>
          </button>
        </form>
      ) : (
        <div className="space-y-3">
          {journals.map((j) => (
            <div
              key={j.id}
              className="bg-white p-3.5 rounded-3xl border border-slate-200/90 shadow-xs space-y-2 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase">
                    BERITA ACARA #{j.id.slice(-6)}
                  </span>
                   <h4 className="font-extrabold text-slate-900">{j.subject}</h4>
                  <p className="text-[10px] text-slate-500">{j.date} • {j.period}</p>
                </div>
                <span className="flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  <ShieldCheck className="w-3 h-3 text-indigo-600" /> {j.verificationStatus || 'Disahkan'}
                </span>
              </div>

              <div className="space-y-1 text-[11px]">
                <p className="text-slate-800">
                  <strong className="text-slate-900">Materi:</strong> {j.materialTaught}
                </p>
                {j.incidentReport && (
                  <p className="text-indigo-900 bg-indigo-50/60 p-2 rounded-xl border border-indigo-100">
                    <strong>Berita Acara Kejadian:</strong> {j.incidentReport}
                  </p>
                )}
                <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                  <span>Hadir: {j.presentCount ?? 26} Siswa</span>
                  <span>Absen: {j.absentCount ?? 2} Siswa</span>
                  <span>Guru: {j.teacherName}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedJournalForPreview(j)}
                className="w-full mt-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-1.5 rounded-xl text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>Cetak / Lihat Dokumen Berita Acara</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal for Printable Berita Acara */}
      {selectedJournalForPreview && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 border border-slate-200 shadow-2xl text-xs">
            <div className="border-b-2 border-slate-900 pb-2 text-center">
              <h3 className="font-black text-sm text-slate-900 uppercase">SEKOLAH IHSAN CLOUD</h3>
              <p className="text-[10px] text-slate-500">DOKUMEN BERITA ACARA PELAKSANAAN KELAS</p>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Mata Pelajaran:</span>
                 <span className="font-bold text-slate-900">{selectedJournalForPreview.subject}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Kelas & Sesi:</span>
                <span className="font-bold text-slate-900">{selectedJournalForPreview.classId} ({selectedJournalForPreview.period})</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Tanggal:</span>
                <span className="font-bold text-slate-900">{selectedJournalForPreview.date}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Materi Pembelajaran:</span>
                <p className="p-2 bg-slate-50 rounded-xl font-medium text-slate-800">{selectedJournalForPreview.materialTaught}</p>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Berita Acara / Laporan Kejadian:</span>
                <p className="p-2 bg-slate-50 rounded-xl font-medium text-slate-800">
                  {selectedJournalForPreview.incidentReport || 'Tidak ada kejadian khusus.'}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <div className="text-center">
                <span className="text-[9px] text-slate-400 block">Status Pengesahan</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  VERIFIED
                </span>
              </div>
              <button
                onClick={() => setSelectedJournalForPreview(null)}
                className="bg-slate-900 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
              >
                Tutup Dokumen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
