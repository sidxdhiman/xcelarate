import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';

// Types
export interface Option {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
}

export interface Assessment {
  _id?: string; // Optional for fetched assessments
  title: string;
  roles: string[];
  questions: Question[];
}

interface AssessmentStore {
  isAddingAssessment: boolean;
  addAssessmentError: string | null;
  addAssessment: (data: Assessment) => Promise<string | null>; // return _id after creation
  fetchAssessmentById: (id: string) => Promise<Assessment | null>;
}

// Store
const baseURL = 'http://localhost:9000/';

export const useAssessmentStore = create<AssessmentStore>((set) => ({
  isAddingAssessment: false,
  addAssessmentError: null,

  // Create new assessment
  addAssessment: async (data) => {
    set({ isAddingAssessment: true, addAssessmentError: null });
    try {
      const res = await axiosInstance.post(`${baseURL}postAssessment`, data);
      const newId = res.data._id;
      return newId || null;
    } catch (error: any) {
      console.error('[addAssessment] Error:', error);
      set({ addAssessmentError: error.message });
      return null;
    } finally {
      set({ isAddingAssessment: false });
    }
  },

  // Fetch one assessment by ID
  fetchAssessmentById: async (id) => {
    try {
      const res = await axiosInstance.get(`${baseURL}getAssessment/${id}`);
      return res.data as Assessment;
    } catch (error) {
      console.error('[fetchAssessmentById] Error:', error);
      return null;
    }
  },
}));
