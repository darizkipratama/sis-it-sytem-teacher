import React, { useState, useEffect } from 'react';
import { ClassId, ClassSession } from './types';
import {
  getStoredStudents,
  getStoredSessions,
  getStoredSyllabus,
  getStoredAnnouncements,
  getStoredAssessments,
  getStoredGrades,
  getStoredJournals,
  getStoredAsyncEvents
} from './utils/storage';

import { MobileContainer } from './components/MobileContainer';
import { HeaderBar } from './components/HeaderBar';
import { BottomNav, NavTab } from './components/BottomNav';
import { SesiSection } from './components/SesiSection';
import { AbsensiSection } from './components/AbsensiSection';
import { PenilaianSection } from './components/PenilaianSection';
import { PengumumanSection } from './components/PengumumanSection';
import { JurnalSilabusSection } from './components/JurnalSilabusSection';
import { IntegrationDrawer } from './components/IntegrationDrawer';

export default function App() {
  const [selectedClass, setSelectedClass] = useState<ClassId>('10-IPA-1');
  const [activeTab, setActiveTab] = useState<NavTab>('sesi');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // App State from Storage
  const [students, setStudents] = useState(getStoredStudents());
  const [sessions, setSessions] = useState(getStoredSessions());
  const [syllabusList, setSyllabusList] = useState(getStoredSyllabus());
  const [announcements, setAnnouncements] = useState(getStoredAnnouncements());
  const [assessments, setAssessments] = useState(getStoredAssessments());
  const [grades, setGrades] = useState(getStoredGrades());
  const [journals, setJournals] = useState(getStoredJournals());
  const [asyncEvents, setAsyncEvents] = useState(getStoredAsyncEvents());

  const refreshData = () => {
    setStudents(getStoredStudents());
    setSessions(getStoredSessions());
    setSyllabusList(getStoredSyllabus());
    setAnnouncements(getStoredAnnouncements());
    setAssessments(getStoredAssessments());
    setGrades(getStoredGrades());
    setJournals(getStoredJournals());
    setAsyncEvents(getStoredAsyncEvents());
  };

  useEffect(() => {
    refreshData();
  }, [selectedClass]);

  // Active Session for selected class
  const fallbackSession: ClassSession = {
    id: 'ses-101',
    classId: selectedClass,
    subject: 'Matematika Lanjut',
    room: 'R.204 (Lab Saintek)',
    period: 'Jam 01 - 02 (07.30 - 09.00 WIB)',
    topic: 'Vektor & Operasi Aljabar 3D',
    status: 'Berlangsung',
    date: new Date().toISOString().split('T')[0]
  };

  const activeSession =
    sessions.find((s) => s.classId === selectedClass) || sessions[0] || fallbackSession;

  // Active Syllabus for selected class
  const fallbackSyllabus = {
    id: 'syl-fallback',
    classId: selectedClass,
    subject: 'Matematika Lanjut',
    gradeLevel: 'Kelas X Semester 2',
    title: 'Konsep Vektor & Operasi Matriks 3D',
    chapter: 'Bab 4',
    competencyTarget: 'Siswa mampu menganalisis proyeksi vektor dan sudut orthogonal.',
    learningObjectives: ['Memahami penjumlahan vektor', 'Perhitungan dot product 3D'],
    subTopics: [
      { id: 'st-1', title: 'Definisi Vektor & Notasi Komponen', completed: true, recommendedDuration: '45 Menit' },
      { id: 'st-2', title: 'Operasi Vektor & Dot Product', completed: false, recommendedDuration: '45 Menit' }
    ],
    referenceMaterials: ['Buku Panduan Guru Kurikulum Merdeka']
  };

  const activeSyllabus =
    syllabusList.find((s) => !s.classId || s.classId === selectedClass) || syllabusList[0] || fallbackSyllabus;

  // Filter students for selected class
  const classStudents = students.filter((s) => s.classId === selectedClass);

  const handleUpdateSession = (updatedSession: typeof activeSession) => {
    const updated = sessions.map((s) => (s.id === updatedSession.id ? updatedSession : s));
    setSessions(updated);
  };

  return (
    <MobileContainer
      activeTab={activeTab}
      asyncQueueCount={asyncEvents.length}
      onOpenIntegrationDrawer={() => setIsDrawerOpen(true)}
    >
      {/* Top Header */}
      <HeaderBar
        selectedClass={selectedClass}
        onClassChange={setSelectedClass}
        onOpenIntegrationDrawer={() => setIsDrawerOpen(true)}
      />

      {/* View Switcher */}
      <main className="flex-1 overflow-y-auto bg-slate-50 min-h-0">
        {activeTab === 'sesi' && (
          <SesiSection
            selectedClass={selectedClass}
            session={activeSession}
            syllabus={activeSyllabus}
            onUpdateSession={handleUpdateSession}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'absensi' && (
          <AbsensiSection
            students={classStudents}
            session={activeSession}
            onRefreshData={refreshData}
          />
        )}

        {activeTab === 'penilaian' && (
          <PenilaianSection
            students={classStudents}
            assessments={assessments}
            grades={grades}
            selectedClass={selectedClass}
            onRefreshData={refreshData}
          />
        )}

        {activeTab === 'pengumuman' && (
          <PengumumanSection
            announcements={announcements}
            selectedClass={selectedClass}
            totalStudents={classStudents.length}
            onRefreshData={refreshData}
          />
        )}

        {activeTab === 'jurnal' && (
          <JurnalSilabusSection
            journals={journals}
            session={activeSession}
            selectedClass={selectedClass}
            onRefreshData={refreshData}
          />
        )}
      </main>

      {/* Bottom Nav Bar */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* RabbitMQ & Supabase Event Integration Drawer */}
      <IntegrationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        events={asyncEvents}
        onRefreshData={refreshData}
      />
    </MobileContainer>
  );
}
