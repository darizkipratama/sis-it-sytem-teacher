import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Save,
  CheckCircle2,
  Layers,
  Sparkles,
  FileText,
  Clock,
  Trash2,
  BookmarkCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { SyllabusTopic, ClassId } from '../types';
import { SyllabusService } from '../services/syllabusService';

interface RencanaAjarTabProps {
  selectedClass: ClassId;
  onRefreshData: () => void;
}

export const RencanaAjarTab: React.FC<RencanaAjarTabProps> = ({
  selectedClass,
  onRefreshData
}) => {
  const [syllabusList, setSyllabusList] = useState<SyllabusTopic[]>([]);
  const [mode, setMode] = useState<'daftar' | 'input'>('daftar');

  // Form State for new Rencana Ajar
  const [title, setTitle] = useState('');
  const [chapter, setChapter] = useState('');
  const [subject, setSubject] = useState('Matematika Lanjut');
  const [gradeLevel, setGradeLevel] = useState('Kelas X Semester 2');
  const [competencyTarget, setCompetencyTarget] = useState('');
  const [learningObjective, setLearningObjective] = useState('');
  const [subTopicsInput, setSubTopicsInput] = useState<
    { title: string; duration: string }[]
  >([
    { title: 'Pengenalan Konsep & Teori Dasar', duration: '45 Menit' },
    { title: 'Latihan Soal & Diskusi Kelompok', duration: '45 Menit' }
  ]);
  const [referenceInput, setReferenceInput] = useState(
    'Buku Panduan Guru Kurikulum Merdeka - Ihsan Cloud Digital'
  );

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadSyllabus = async () => {
    const res = await SyllabusService.getSyllabus(selectedClass);
    if (res.success && res.data) {
      setSyllabusList(res.data);
    }
  };

  useEffect(() => {
    loadSyllabus();
  }, [selectedClass]);

  const handleAddSubTopicField = () => {
    setSubTopicsInput([
      ...subTopicsInput,
      { title: '', duration: '45 Menit' }
    ]);
  };

  const handleRemoveSubTopicField = (index: number) => {
    setSubTopicsInput(subTopicsInput.filter((_, i) => i !== index));
  };

  const handleSubTopicChange = (index: number, field: 'title' | 'duration', val: string) => {
    const updated = [...subTopicsInput];
    updated[index][field] = val;
    setSubTopicsInput(updated);
  };

  const handleCreateRencanaAjar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !competencyTarget) {
      alert('Mohon isi Judul Topik dan Target Kompetensi!');
      return;
    }

    const newPlan: Omit<SyllabusTopic, 'id'> = {
      classId: selectedClass,
      subject,
      gradeLevel,
      title,
      chapter: chapter || 'Bab Baru',
      competencyTarget,
      learningObjectives: learningObjective
        ? [learningObjective]
        : ['Memahami materi secara komprehensif'],
      subTopics: subTopicsInput
        .filter((s) => s.title.trim().length > 0)
        .map((s, idx) => ({
          id: `st-${Date.now()}-${idx}`,
          title: s.title,
          completed: false,
          recommendedDuration: s.duration || '45 Menit'
        })),
      referenceMaterials: [referenceInput]
    };

    const res = await SyllabusService.addLessonPlan(newPlan);
    if (res.success && res.data) {
      setToastMsg('Rencana Ajar / Silabus Berhasil Disimpan!');
      setTitle('');
      setCompetencyTarget('');
      setLearningObjective('');
      setMode('daftar');
      loadSyllabus();
      onRefreshData();
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  const handleToggleSubtopic = async (syllabusId: string, subTopicId: string) => {
    const res = await SyllabusService.toggleSubtopic(syllabusId, subTopicId);
    if (res.success) {
      loadSyllabus();
      onRefreshData();
    }
  };

  return (
    <div className="space-y-4">
      {/* Sub Mode Header */}
      <div className="flex items-center justify-between bg-slate-200/80 p-1 rounded-2xl text-xs">
        <button
          onClick={() => setMode('daftar')}
          className={`flex-1 py-1.5 px-3 rounded-xl font-bold transition cursor-pointer ${
            mode === 'daftar'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Silabus & Rencana Ajar ({syllabusList.length})
        </button>
        <button
          onClick={() => setMode('input')}
          className={`flex-1 py-1.5 px-3 rounded-xl font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
            mode === 'input'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Plus className="w-3.5 h-3.5" /> Input Rencana Ajar
        </button>
      </div>

      {toastMsg && (
        <div className="bg-indigo-900 text-white p-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md animate-fade-in border border-indigo-700/60">
          <CheckCircle2 className="w-4 h-4 text-indigo-300" />
          <span>{toastMsg}</span>
        </div>
      )}

      {mode === 'input' ? (
        <form
          onSubmit={handleCreateRencanaAjar}
          className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-3.5 text-xs"
        >
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                INPUT RENCANA AJAR (SILABUS)
              </span>
              <h4 className="font-extrabold text-slate-800">Kelas: {selectedClass}</h4>
            </div>
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Mata Pelajaran:</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 p-2 rounded-xl border border-slate-200 font-medium outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Bab / Bab Modul:</label>
              <input
                type="text"
                placeholder="e.g. Bab 5"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 p-2 rounded-xl border border-slate-200 font-medium outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-800 font-extrabold mb-1">
              Judul Rencana Ajar / Pokok Bahasan:
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Bab 5: Matriks & Transformasi Geometri 2D"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-800 font-extrabold mb-1">
              Capaian Pembelajaran (TP / ATP) / Target Kompetensi:
            </label>
            <textarea
              rows={2}
              required
              placeholder="Siswa mampu menyelesaikan persamaan matriks dan penerapannya..."
              value={competencyTarget}
              onChange={(e) => setCompetencyTarget(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-2xl border border-slate-200 outline-none focus:border-indigo-600 font-medium"
            ></textarea>
          </div>

          <div>
            <label className="block text-slate-800 font-extrabold mb-1">
              Tujuan Pembelajaran Spesifik:
            </label>
            <input
              type="text"
              placeholder="e.g. Memahami invers matriks orde 2x2"
              value={learningObjective}
              onChange={(e) => setLearningObjective(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-600 font-medium"
            />
          </div>

          {/* Dynamic Subtopics Inputs */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-slate-800 font-extrabold">
                Rincian Sub-Topik & Durasi:
              </label>
              <button
                type="button"
                onClick={handleAddSubTopicField}
                className="text-[10px] bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold px-2 py-0.5 rounded-md border border-indigo-200 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Tambah Sub-Topik
              </button>
            </div>

            <div className="space-y-2">
              {subTopicsInput.map((st, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder={`Sub-topik #${idx + 1}`}
                    value={st.title}
                    onChange={(e) => handleSubTopicChange(idx, 'title', e.target.value)}
                    className="flex-1 bg-slate-50 text-slate-900 p-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-600"
                  />
                  <input
                    type="text"
                    placeholder="45 Menit"
                    value={st.duration}
                    onChange={(e) => handleSubTopicChange(idx, 'duration', e.target.value)}
                    className="w-24 bg-slate-50 text-slate-900 p-2 rounded-xl border border-slate-200 text-xs text-center outline-none focus:border-indigo-600"
                  />
                  {subTopicsInput.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSubTopicField(idx)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-800 font-extrabold mb-1">
              Bahan Ajar / Referensi Modul:
            </label>
            <input
              type="text"
              value={referenceInput}
              onChange={(e) => setReferenceInput(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-600 font-medium"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-3.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition active:scale-98"
          >
            <Save className="w-4 h-4 text-indigo-200" />
            <span>Simpan Rencana Ajar Baru</span>
          </button>
        </form>
      ) : (
        <div className="space-y-3">
          {syllabusList.map((item) => {
            const total = item.subTopics?.length || 1;
            const completedCount = item.subTopics?.filter((st) => st.completed).length || 0;
            const progressPercent = Math.round((completedCount / total) * 100);

            return (
              <div
                key={item.id}
                className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      <BookmarkCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase">
                        {item.chapter || 'Rencana Ajar'}
                      </span>
                      <h3 className="text-xs font-extrabold text-slate-900">{item.title}</h3>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                    {progressPercent}% Selesai
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80 text-[11px] text-slate-700">
                  <p className="font-bold text-slate-800 mb-0.5">Target Kompetensi (TP/ATP):</p>
                  <p className="text-slate-600 leading-relaxed">{item.competencyTarget}</p>
                </div>

                {/* Subtopics Checklist */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                    Sub-topik & Modul Pembelajaran ({completedCount}/{total})
                  </span>
                  {item.subTopics?.map((st) => (
                    <div
                      key={st.id}
                      onClick={() => handleToggleSubtopic(item.id, st.id)}
                      className={`p-2 rounded-xl border text-xs flex items-center justify-between transition cursor-pointer ${
                        st.completed
                          ? 'bg-indigo-50/80 border-indigo-200 text-indigo-950 font-medium'
                          : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={st.completed}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                        />
                        <span className={st.completed ? 'line-through text-indigo-900' : ''}>
                          {st.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {st.recommendedDuration}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Materials reference */}
                {item.referenceMaterials && item.referenceMaterials.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                    <span>Referensi: {item.referenceMaterials.join(', ')}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
