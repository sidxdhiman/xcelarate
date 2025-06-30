import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import axios from 'axios';

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
}

interface Assessment {
  _id: string;
  title: string;
  roles: string[];
  questions: Question[];
}

interface AssessmentStore {
  isAddingAssessment: boolean;
  addAssessmentError: string | null;

  addAssessment: (data: Omit<Assessment, '_id'>) => Promise<Assessment>;
  getAssessmentById: (id: string) => Promise<Assessment | null>;
  submitResponses: (assessmentId: string, answers: Record<string, { option: string; text: string }>) => Promise<void>;
}

export const useAssessmentStore = create<AssessmentStore>((set) => ({
  isAddingAssessment: false,
  addAssessmentError: null,

  addAssessment: async (data) => {
    set({ isAddingAssessment: true, addAssessmentError: null });

    try {
      const response = await axiosInstance.post('/postAssessment', data);
      return response.data as Assessment;
    } catch (error) {
      console.error('[Store] Error posting assessment:', error);

      if (axios.isAxiosError(error)) {
        set({ addAssessmentError: error.response?.data?.message || error.message });
      } else if (error instanceof Error) {
        set({ addAssessmentError: error.message });
      } else {
        set({ addAssessmentError: 'Unknown error occurred' });
      }

      throw error;
    } finally {
      set({ isAddingAssessment: false });
    }
  },

  getAssessmentById: async (id) => {
    try {
      const response = await axiosInstance.get(`/assessments/${id}`);
      return response.data as Assessment;
    } catch (error) {
      console.error('[Store] Error fetching assessment by ID:', error);
      return null;
    }
  },

  submitResponses: async (assessmentId, answers) => {
    try {
      await axiosInstance.post(`/assessments/${assessmentId}/responses`, {
        answers,
      });
    } catch (error) {
      console.error('[Store] Error submitting responses:', error);
      throw error;
    }
  },
}));
