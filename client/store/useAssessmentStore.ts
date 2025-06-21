// stores/useAssessmentStore.ts
import { create } from 'zustand';
import {axiosInstance} from '../lib/axios';

interface Option {
  id: string;
  text: string;
  isCorrect?: boolean;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
}

interface Assessment {
  title: string;
  roles: string[];
  questions: Question[];
}

interface AssessmentStore {
  isAddingAssessment: boolean;
  addAssessmentError: string | null;
  addAssessment: (data: Assessment) => Promise<void>;
}

export const useAssessmentStore = create<AssessmentStore>((set) => ({
  isAddingAssessment: false,
  addAssessmentError: null,

  addAssessment: async (data) => {
    set({ isAddingAssessment: true, addAssessmentError: null });
    try {
      await axiosInstance.post('/api/tests', data);
    } catch (error) {
      console.error(error);
      set({ addAssessmentError: error.message });
    } finally {
      set({ isAddingAssessment: false });
    }
  }
}));
