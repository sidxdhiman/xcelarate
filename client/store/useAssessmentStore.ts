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

interface Assessment {
  _id: string;
  title: string;
  roles: string[];
  questions: Question[];
}

/** One question’s answer */
export type Answer = { option: string; text: string };

/** All answers for one assessment */
export type Draft = Record<string, Answer>;

/** Payload for final submission */
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

/** Response format returned from backend */
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

  draftResponses: Record<string, Draft>;
  setDraft: (assessmentId: string, questionKey: string, ans: Answer) => void;
  clearDraft: (assessmentId: string) => void;

  submitResponses: (assessmentId: string, payload: FullSubmissionPayload) => Promise<void>;
  patchAssessmentById: (id: string, data: Partial<Omit<Assessment, '_id'>>) => Promise<Assessment | null>;
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
      } else if (err instanceof Error) {
        set({ addAssessmentError: err.message });
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

//   getResponsesByAssessmentId: async (assessmentId: string) => {
//   try {
//     const res = await axiosInstance.get(`/assessments/${assessmentId}/responses`);
//     return res.data;
//   } catch (err) {
//     console.error('Error in getResponsesByAssessmentId:', err);
//     return [];
//   }
// },

getResponsesByAssessmentId: async (assessmentId: string) => {
  try {
    const res = await axiosInstance.get(`/assessments/${assessmentId}/responses`);
    
    // If your backend responds with raw array:
    return Array.isArray(res.data) ? res.data : [];

    // If your backend wraps in { data: [...] }:
    // return Array.isArray(res.data?.data) ? res.data.data : [];
    
  } catch (err) {
    console.error('Error in getResponsesByAssessmentId:', err);
    return [];
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
      const next = { ...state.draftResponses };
      delete next[assessmentId];
      return { draftResponses: next };
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

  patchAssessmentById: async (id, data) => {
  try {
    const res = await axiosInstance.patch(`/assessments/${id}`, data);
    return res.data.updatedAssessment as Assessment;
  } catch (err) {
    console.error('[Store] Error patching assessment:', err);
    return null;
  }
},

}));
