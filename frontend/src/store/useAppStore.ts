import { create } from 'zustand';
import { TeacherAssignment } from '../types';

export interface AppState {
  selectedClassId: string;
  selectedAssignment: TeacherAssignment | null;
  setSelectedClassId: (classId: string) => void;
  setSelectedAssignment: (assignment: TeacherAssignment | null) => void;
  resetSelection: () => void;
}

const initialState = {
  selectedClassId: '',
  selectedAssignment: null,
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  setSelectedClassId: (classId) =>
    set({ selectedClassId: classId }),

  setSelectedAssignment: (assignment) =>
    set({
      selectedAssignment: assignment,
      selectedClassId: assignment?.classId || '',
    }),

  resetSelection: () =>
    set(initialState),
}));
