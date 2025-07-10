import { create } from 'zustand';
import axios from 'axios';
import { axiosInstance } from '../lib/axios';

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
}

export interface Assessment {
  _id: string;
  title: string;
  roles: string[];
  questions: Question[];
}

export type Answer = { option: string; text: string };
export type Draft = Record<string, Answer>;

export interface FullSubmissionPayload {
  assessmentId: string;
  title: string;
  user: {
    name: string;
    email: string;
    designation: string;
    phone: string;
    department: string;
  };
  location?: { lat: number; lon: number };
  startedAt: number;
  submittedAt: number;
  answers: Record<string, { option: string; text: string }>;
}

export interface IndividualResponse {
  name: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  submittedAt: string;
  answers: {
    questionText: string;
    selectedOption: string;
  }[];
}

interface AssessmentStore {
  isAddingAssessment: boolean;
  addAssessmentError: string | null;

  addAssessment: (data: Omit<Assessment, '_id'>) => Promise<Assessment>;
  getAssessmentById: (id: string) => Promise<Assessment | null>;
  getResponsesByAssessmentId: (id: string) => Promise<IndividualResponse[]>;
  patchAssessmentById: (id: string, data: Partial<Omit<Assessment, '_id'>>) => Promise<Assessment | null>;

  draftResponses: Record<string, Draft>;
  setDraft: (assessmentId: string, questionKey: string, ans: Answer) => void;
  clearDraft: (assessmentId: string) => void;

  submitResponses: (assessmentId: string, payload: FullSubmissionPayload) => Promise<void>;
  deleteAssessmentById: (id: string) => Promise<boolean>;

}

export const useAssessmentStore = create<AssessmentStore>((set, get) => ({
  isAddingAssessment: false,
  addAssessmentError: null,

  addAssessment: async data => {
    set({ isAddingAssessment: true, addAssessmentError: null });
    try {
      const res = await axiosInstance.post('/postAssessment', data);
      return res.data as Assessment;
    } catch (err) {
      console.error('[Store] Error posting assessment:', err);
      if (axios.isAxiosError(err)) {
        set({ addAssessmentError: err.response?.data?.message || err.message });
      } else {
        set({ addAssessmentError: 'Unknown error occurred' });
      }
      throw err;
    } finally {
      set({ isAddingAssessment: false });
    }
  },

  getAssessmentById: async id => {
    try {
      const res = await axiosInstance.get(`/assessments/${id}`);
      return res.data as Assessment;
    } catch (err) {
      console.error('[Store] Error fetching assessment by ID:', err);
      return null;
    }
  },

  getResponsesByAssessmentId: async assessmentId => {
    try {
      const res = await axiosInstance.get(`/assessments/${assessmentId}/responses`);
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      console.error('[Store] Error fetching responses:', err);
      return [];
    }
  },

  patchAssessmentById: async (id, data) => {
    try {
      const res = await axiosInstance.patch(`/assessments/${id}`, data);
      return res.data.updatedAssessment as Assessment;
    } catch (err) {
      console.error('[Store] Error patching assessment:', err);
      return null;
    }
  },

  draftResponses: {},

  setDraft: (assessmentId, questionKey, ans) =>
    set(state => ({
      draftResponses: {
        ...state.draftResponses,
        [assessmentId]: {
          ...(state.draftResponses[assessmentId] ?? {}),
          [questionKey]: ans,
        },
      },
    })),

  clearDraft: assessmentId =>
    set(state => {
      const updated = { ...state.draftResponses };
      delete updated[assessmentId];
      return { draftResponses: updated };
    }),

  submitResponses: async (assessmentId, payload) => {
    try {
      await axiosInstance.post(`/assessments/${assessmentId}/responses`, payload);
      get().clearDraft(assessmentId);
    } catch (err) {
      console.error('[Store] Error submitting responses:', err);
      throw err;
    }
  },
  deleteAssessmentById: async (id: string): Promise<boolean> => {
  try {
    await axiosInstance.delete(`/assessments/${id}`);
    return true;
  } catch (err) {
    console.error('[Store] Error deleting assessment:', err);
    return false;
  }
},

}));
