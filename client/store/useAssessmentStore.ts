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

interface AssessmentStore {
  /* UI state */
  isAddingAssessment: boolean;
  addAssessmentError: string | null;

  /* CRUD */
  addAssessment: (data: Omit<Assessment, '_id'>) => Promise<Assessment>;
  getAssessmentById: (id: string) => Promise<Assessment | null>;

  /* Draft answers keyed by assessmentId */
  draftResponses: Record<string, Draft>;
  setDraft: (assessmentId: string, questionKey: string, ans: Answer) => void;
  clearDraft: (assessmentId: string) => void;

  /* Final submission */
  submitResponses: (assessmentId: string, answers: Draft) => Promise<void>;
}

export const useAssessmentStore = create<AssessmentStore>((set, get) => ({
  /* -------------------- UI flags -------------------- */
  isAddingAssessment: false,
  addAssessmentError: null,

  /* -------------------- Create assessment -------------------- */
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

  /* -------------------- Read assessment -------------------- */
  getAssessmentById: async id => {
    try {
      const res = await axiosInstance.get(`/assessments/${id}`);
      return res.data as Assessment;
    } catch (err) {
      console.error('[Store] Error fetching assessment by ID:', err);
      return null;
    }
  },

  /* -------------------- Draft answers -------------------- */
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

  /* -------------------- Submit & clear -------------------- */
  submitResponses: async (assessmentId, answers) => {
    try {
      await axiosInstance.post(`/assessments/${assessmentId}/responses`, {
        answers,
      });
      /* wipe local draft on success */
      get().clearDraft(assessmentId);
    } catch (err) {
      console.error('[Store] Error submitting responses:', err);
      throw err;
    }
  },
}));
