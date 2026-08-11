import { Student, ClassSession, SyllabusTopic, Announcement, AssessmentItem, StudentGrade, ClassJournal } from '../types';

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 's1',
    nis: '20241001',
    name: 'Ahmad Raihan Pratama',
    gender: 'L',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    classId: '10-IPA-1',
    attendanceHistoryRate: 98,
    parentName: 'Bpk. Hendra Pratama',
    parentPhone: '081234567801'
  },
  {
    id: 's2',
    nis: '20241002',
    name: 'Aisyah Anindya Putri',
    gender: 'P',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    classId: '10-IPA-1',
    attendanceHistoryRate: 100,
    parentName: 'Ibu Ratna Juwita',
    parentPhone: '081234567802'
  },
  {
    id: 's3',
    nis: '20241003',
    name: 'Bagus Dewantara',
    gender: 'L',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    classId: '10-IPA-1',
    attendanceHistoryRate: 92,
    parentName: 'Bpk. Bambang Dewa',
    parentPhone: '081234567803'
  },
  {
    id: 's4',
    nis: '20241004',
    name: 'Citra Kirana Maya',
    gender: 'P',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    classId: '10-IPA-1',
    attendanceHistoryRate: 96,
    parentName: 'Ibu Maya Lestari',
    parentPhone: '081234567804'
  },
  {
    id: 's5',
    nis: '20241005',
    name: 'Daffa Rizky Ramadhan',
    gender: 'L',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    classId: '10-IPA-1',
    attendanceHistoryRate: 95,
    parentName: 'Bpk. Syarif Ramadhan',
    parentPhone: '081234567805'
  },
  {
    id: 's6',
    nis: '20241006',
    name: 'Fadhil Ihsan Naufal',
    gender: 'L',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    classId: '10-IPA-1',
    attendanceHistoryRate: 97,
    parentName: 'Bpk. Naufal Ihsan',
    parentPhone: '081234567806'
  },
  {
    id: 's7',
    nis: '20241007',
    name: 'Farah Salsabila',
    gender: 'P',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    classId: '10-IPA-1',
    attendanceHistoryRate: 99,
    parentName: 'Ibu Eni Salsabila',
    parentPhone: '081234567807'
  },
  {
    id: 's8',
    nis: '20241008',
    name: 'Gilang Ramadhan',
    gender: 'L',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    classId: '10-IPA-1',
    attendanceHistoryRate: 88,
    parentName: 'Bpk. Yudi Ramadhan',
    parentPhone: '081234567808'
  },
  {
    id: 's9',
    nis: '20241009',
    name: 'Hana Khairunnisa',
    gender: 'P',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    classId: '10-IPA-1',
    attendanceHistoryRate: 100,
    parentName: 'Ibu Nur Khairunnisa',
    parentPhone: '081234567809'
  },
  {
    id: 's10',
    nis: '20241010',
    name: 'Ibrahim Al-Fatih',
    gender: 'L',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    classId: '10-IPA-1',
    attendanceHistoryRate: 94,
    parentName: 'Bpk. Usman Al-Fatih',
    parentPhone: '081234567810'
  },
  {
    id: 's11',
    nis: '20241011',
    name: 'Jasmine Zahra',
    gender: 'P',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    classId: '10-IPA-1',
    attendanceHistoryRate: 96,
    parentName: 'Ibu Zahra Hasan',
    parentPhone: '081234567811'
  },
  {
    id: 's12',
    nis: '20241012',
    name: 'Kevin Maulana',
    gender: 'L',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    classId: '10-IPA-1',
    attendanceHistoryRate: 91,
    parentName: 'Bpk. Agus Maulana',
    parentPhone: '081234567812'
  }
];

export const INITIAL_SESSIONS: ClassSession[] = [
  {
    id: 'ses-101',
    classId: '10-IPA-1',
    subject: 'Matematika Lanjut',
    topic: 'Vektor & Persamaan Matriks 3D',
    room: 'Lab Komputer 02 / Ruang 101',
    period: 'Jam 01 - 02 (07:30 - 09:00 WIB)',
    status: 'Berlangsung',
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: 'ses-102',
    classId: '10-IPA-2',
    subject: 'Matematika Lanjut',
    topic: 'Fungsi Trigonometri Lanjutan',
    room: 'Ruang Kelas 10-B',
    period: 'Jam 05 - 06 (10:45 - 12:15 WIB)',
    status: 'Belum Dimulai',
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: 'ses-103',
    classId: '11-MIPA-3',
    subject: 'Fisika Terapan',
    topic: 'Termodinamika & Hukum Joule',
    room: 'Lab Fisika Utama',
    period: 'Jam 07 - 08 (13:00 - 14:30 WIB)',
    status: 'Belum Dimulai',
    date: new Date().toISOString().split('T')[0]
  }
];

export const INITIAL_SYLLABUS: SyllabusTopic[] = [
  {
    id: 'syl-01',
    subject: 'Matematika Lanjut',
    gradeLevel: 'Kelas X Semester 2',
    title: 'Bab 4: Vektor di R2 dan R3',
    chapter: 'Bab 4',
    competencyTarget: 'Peserta didik mampu menyatakan matriks transformasi dan melakukan perkalian dot/cross produk pada sistem 3 Dimensi.',
    learningObjectives: [
      'Memahami representasi posisi vektor pada ruang 3 Dimensi.',
      'Menghitung hasil kali titik (Dot Product) dan sudut antar dua vektor.',
      'Mengaplikasikan operasi penjumlahan & pengurangan vektor pada kasus proyeksi fisika.'
    ],
    subTopics: [
      { id: 'st-1', title: 'Definisi Vektor Posisi & Satuan (i, j, k)', completed: true, recommendedDuration: '45 Menit' },
      { id: 'st-2', title: 'Panjang Vektor & Sudut Antar Vektor', completed: true, recommendedDuration: '45 Menit' },
      { id: 'st-3', title: 'Perkalian Silang (Cross Product) & Aplikasi', completed: false, recommendedDuration: '45 Menit' },
      { id: 'st-4', title: 'Proyeksi Orthogonal Vektor', completed: false, recommendedDuration: '45 Menit' }
    ],
    referenceMaterials: [
      'Buku Panduan Guru Matematika Kurikulum Merdeka Hlm. 120-145',
      'Modul Ajar Digital Ihsan Cloud - Vektor 3D Interactive'
    ]
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    classId: '10-IPA-1',
    title: 'Persiapan Penilaian Tengah Semester (PTS) Genap',
    content: 'Diberitahukan kepada seluruh Orang Tua/Wali Siswa Kelas 10 IPA 1, pelaksanaan PTS Genap akan dimulai tanggal 15 Mei 2026. Mohon bimbingan belajar di rumah disesuaikan dengan kisi-kisi pada aplikasi.',
    category: 'Penting/Urgent',
    createdAt: '2026-07-22 08:30',
    authorRole: 'Wali Kelas 10 IPA 1 (Pak Ihsan, S.Pd)',
    sendToWhatsapp: true,
    parentReadCount: 22,
    totalParents: 28
  },
  {
    id: 'ann-2',
    classId: '10-IPA-1',
    title: 'Pertemuan Rutin Paguyuban Orang Tua & Diskusi Proyek Siswa',
    content: 'Undangan silaturahmi & pemaparan hasil Proyek Profil Pelajar Pancasila siswa 10 IPA 1 yang akan diselenggarakan hari Sabtu ini jam 09.00 di Aula Sekolah Ihsan Cloud.',
    category: 'Kegiatan Sekolah',
    createdAt: '2026-07-20 14:15',
    authorRole: 'Wali Kelas 10 IPA 1 (Pak Ihsan, S.Pd)',
    sendToWhatsapp: true,
    parentReadCount: 26,
    totalParents: 28
  }
];

export const INITIAL_ASSESSMENTS: AssessmentItem[] = [
  {
    id: 'ass-1',
    title: 'Evaluasi Harian 1 - Vektor Dasar',
    type: 'Evaluasi Harian',
    classId: '10-IPA-1',
    subject: 'Matematika Lanjut',
    date: '2026-07-15',
    maxScore: 100,
    weight: 20
  },
  {
    id: 'ass-2',
    title: 'Kuis Singkat: Dot Product',
    type: 'Kuis',
    classId: '10-IPA-1',
    subject: 'Matematika Lanjut',
    date: '2026-07-18',
    maxScore: 100,
    weight: 10
  },
  {
    id: 'ass-3',
    title: 'Proyek Kelompok: Model Visual 3D Vektor',
    type: 'Proyek',
    classId: '10-IPA-1',
    subject: 'Matematika Lanjut',
    date: '2026-07-21',
    maxScore: 100,
    weight: 30
  },
  {
    id: 'ass-4',
    title: 'Ujian Tengah Semester (PTS)',
    type: 'Ujian',
    classId: '10-IPA-1',
    subject: 'Matematika Lanjut',
    date: '2026-07-28',
    maxScore: 100,
    weight: 40
  }
];

export const INITIAL_GRADES: StudentGrade[] = [
  { studentId: 's1', assessmentId: 'ass-1', score: 92, notes: 'Sangat baik pada proyeksi' },
  { studentId: 's1', assessmentId: 'ass-2', score: 88, notes: 'Teliti' },
  { studentId: 's1', assessmentId: 'ass-3', score: 95, notes: 'Kreatif' },
  { studentId: 's2', assessmentId: 'ass-1', score: 98, notes: 'Sempurna' },
  { studentId: 's2', assessmentId: 'ass-2', score: 95, notes: 'Sangat rapi' },
  { studentId: 's2', assessmentId: 'ass-3', score: 96, notes: 'Kerja tim luar biasa' },
  { studentId: 's3', assessmentId: 'ass-1', score: 75, notes: 'Perlu latihan sudut' },
  { studentId: 's3', assessmentId: 'ass-2', score: 80, notes: 'Meningkat' },
  { studentId: 's3', assessmentId: 'ass-3', score: 85, notes: 'Cukup baik' },
  { studentId: 's4', assessmentId: 'ass-1', score: 90 },
  { studentId: 's4', assessmentId: 'ass-2', score: 85 },
  { studentId: 's5', assessmentId: 'ass-1', score: 84 },
  { studentId: 's6', assessmentId: 'ass-1', score: 91 }
];

export const INITIAL_JOURNAL: ClassJournal = {
  id: 'jour-1',
  sessionId: 'ses-101',
  classId: '10-IPA-1',
  subject: 'Matematika Lanjut',
  date: new Date().toISOString().split('T')[0],
  materialTaught: 'Menyelesaikan konsep perkalian titik (dot product) dan pengenalan vektor posisi 3D.',
  achievements: '85% siswa mampu menyelesaikan soal latihan proyeksi vektor secara mandiri di papan tulis.',
  obstaclesAndSolutions: '3 siswa masih terkendala pemahaman aturan arah sumbu Z. Diberikan bimbingan khusus kelompok kecil.',
  studentBehaviorNotes: 'Kelas sangat kondusif, partisipasi diskusi kelompok aktif.',
  teacherName: 'Pak Ihsan Cloud, S.Pd'
};
