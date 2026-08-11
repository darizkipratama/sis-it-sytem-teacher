import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  Send,
  Users,
  CheckCheck,
  ShieldCheck,
  BellRing,
  AlertTriangle,
  Calendar,
  Share2,
  Lock,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { Announcement, ClassId } from '../types';
import { addAnnouncement } from '../utils/storage';

interface PengumumanSectionProps {
  announcements: Announcement[];
  selectedClass: ClassId;
  totalStudents: number;
  onRefreshData: () => void;
}

export const PengumumanSection: React.FC<PengumumanSectionProps> = ({
  announcements,
  selectedClass,
  totalStudents,
  onRefreshData
}) => {
  const isWaliKelas = selectedClass === '10-IPA-1';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Announcement['category']>('Penting/Urgent');
  const [sendToWa, setSendToWa] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const filteredAnnouncements = announcements.filter((a) => a.classId === selectedClass);

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      classId: selectedClass,
      title,
      content,
      category,
      createdAt: new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
      authorRole: `Wali Kelas ${selectedClass} (Pak Ihsan Cloud, S.Pd)`,
      sendToWhatsapp: sendToWa,
      parentReadCount: 0,
      totalParents: totalStudents
    };

    addAnnouncement(newAnn);
    setIsModalOpen(false);
    setTitle('');
    setContent('');
    onRefreshData();

    setToastMsg('Pengumuman Wali Kelas Terikirim ke Seluruh Orang Tua!');
    setTimeout(() => setToastMsg(null), 3500);
  };

  const getCategoryBadge = (cat: Announcement['category']) => {
    switch (cat) {
      case 'Penting/Urgent':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Kegiatan Sekolah':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Tugas & Ujian':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-sky-100 text-sky-800 border-sky-300';
    }
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Wali Kelas Identity Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 shadow-lg border border-slate-800 relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider block">
                Hak Akses Pengumuman
              </span>
              <h2 className="text-sm font-extrabold text-white">
                Wali Kelas {selectedClass}
              </h2>
            </div>
          </div>

          {isWaliKelas ? (
            <span className="bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" /> WALI KELAS AKTIF
            </span>
          ) : (
            <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
              <Lock className="w-3 h-3" /> Guru Pengajar
            </span>
          )}
        </div>

        <p className="text-xs text-slate-400 mt-2">
          {isWaliKelas
            ? 'Anda memiliki otoritas penuh untuk menyiarkan pengumuman resmi & pesan terintegrasi ke seluruh Orang Tua / Wali murid.'
            : 'Anda terdaftar sebagai Guru Mata Pelajaran. Pengumuman umum wali kelas hanya dapat dikelola oleh Wali Kelas terpilih.'}
        </p>

        {isWaliKelas && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-3 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-2.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition active:scale-98"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Buat Pengumuman Orang Tua Baru</span>
          </button>
        )}
      </div>

      {toastMsg && (
        <div className="bg-emerald-700 text-white p-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md animate-fade-in">
          <CheckCheck className="w-4 h-4 text-emerald-300" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Feed Title */}
      <div className="flex items-center justify-between pt-1">
        <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
          <Megaphone className="w-4 h-4 text-teal-700" />
          Arsip Pengumuman Terkirim ({filteredAnnouncements.length})
        </h3>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {filteredAnnouncements.map((ann) => (
          <div
            key={ann.id}
            className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-sm hover:shadow-md transition space-y-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getCategoryBadge(
                  ann.category
                )}`}
              >
                {ann.category}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{ann.createdAt}</span>
            </div>

            <h4 className="text-sm font-extrabold text-slate-900 leading-snug">{ann.title}</h4>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
              {ann.content}
            </p>

            {/* Read Status Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Users className="w-3.5 h-3.5 text-teal-600" />
                <span>Keterbacaan Orang Tua:</span>
                <span className="font-extrabold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                  {ann.parentReadCount} / {ann.totalParents}
                </span>
              </div>

              {ann.sendToWhatsapp && (
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-emerald-600" /> WA Broadcast OK
                </span>
              )}
            </div>
          </div>
        ))}

        {filteredAnnouncements.length === 0 && (
          <div className="bg-white p-8 rounded-3xl border border-dashed border-slate-300 text-center text-slate-400 text-xs">
            Belum ada pengumuman yang disiarkan untuk kelas ini.
          </div>
        )}
      </div>

      {/* Modal Form Create Announcement */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-200 animate-scale-in">
            <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-teal-700" />
              Siarkan Pengumuman Orang Tua
            </h3>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Judul Pengumuman:</label>
                <input
                  type="text"
                  required
                  placeholder="Judul pengumuman singkat..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-teal-600 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Kategori:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Announcement['category'])}
                  className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-teal-600 font-bold"
                >
                  <option value="Penting/Urgent">Penting / Urgent</option>
                  <option value="Pengumuman Umum">Pengumuman Umum</option>
                  <option value="Tugas & Ujian">Tugas & Ujian</option>
                  <option value="Kegiatan Sekolah">Kegiatan Sekolah</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Isi Pesan / Instruksi:</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tuliskan detail instruksi untuk orang tua murid..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-teal-600 font-medium"
                ></textarea>
              </div>

              <label className="flex items-center gap-2 p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendToWa}
                  onChange={(e) => setSendToWa(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded accent-teal-700"
                />
                <span className="text-[11px] font-bold text-emerald-950">
                  Broadcast Otomatis ke WhatsApp Orang Tua ({totalStudents} Wali)
                </span>
              </label>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-teal-800 hover:bg-teal-900 text-white font-bold py-2.5 rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
