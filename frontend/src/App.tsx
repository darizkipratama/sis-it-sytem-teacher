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
import { useAuth } from './context/AuthContext';
import { useAppStore } from './store/useAppStore';

import { MobileContainer } from './components/MobileContainer';
import { HeaderBar } from './components/HeaderBar';
import { BottomNav, NavTab } from './components/BottomNav';
import { SesiSection } from './components/SesiSection';
import { AbsensiSection } from './components/AbsensiSection';
import { PenilaianSection } from './components/PenilaianSection';
import { PengumumanSection } from './components/PengumumanSection';
import { JurnalSilabusSection } from './components/JurnalSilabusSection';
import { IntegrationDrawer } from './components/IntegrationDrawer';
import { LoginForm } from './components/LoginForm';

export default function App() {
  const { user, isAuthenticated, logout } = useAuth();
  const selectedClassId = useAppStore((state) => state.selectedClassId);
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
  }, [selectedClassId, user]);

  // Active Session for selected class
  const fallbackSession: ClassSession = {
    id: 'ses-101',
    classId: selectedClassId,
    subject: 'Matematika Lanjut',
    room: 'R.204 (Lab Saintek)',
    period: 'Jam 01 - 02 (07.30 - 09.00 WIB)',
    topic: 'Vektor & Operasi Aljabar 3D',
    status: 'Berlangsung',
    date: new Date().toISOString().split('T')[0]
  };

  const activeSession =
    sessions.find((s) => s.classId === selectedClassId) || sessions[0] || fallbackSession;

  // Active Syllabus for selected class
  const fallbackSyllabus = {
    id: 'syl-fallback',
    classId: selectedClassId,
    subjectId: 'subj-1',
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
    syllabusList.find((s) => !s.classId || s.classId === selectedClassId) || syllabusList[0] || fallbackSyllabus;

  // Filter students for selected class
  const classStudents = students.filter((s) => s.classId === selectedClassId);

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
      {!isAuthenticated ? (
        <LoginForm />
      ) : (
        <>
          {/* Top Header */}
          <HeaderBar
            user={user || undefined}
            onOpenIntegrationDrawer={() => setIsDrawerOpen(true)}
          />

          {/* View Switcher */}
          <main className="flex-1 overflow-y-auto bg-slate-50 min-h-0">
            {activeTab === 'sesi' && (
              <SesiSection
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
                selectedClass={selectedClassId}
                onRefreshData={refreshData}
              />
            )}

            {activeTab === 'pengumuman' && (
              <PengumumanSection
                announcements={announcements}
                selectedClass={selectedClassId}
                totalStudents={classStudents.length}
                onRefreshData={refreshData}
              />
            )}

            {activeTab === 'jurnal' && (
              <JurnalSilabusSection
                journals={journals}
                session={activeSession}
                selectedClass={selectedClassId}
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
        </>
      )}
    </MobileContainer>
  );
}
