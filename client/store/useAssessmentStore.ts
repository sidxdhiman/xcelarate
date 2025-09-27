import { create } from 'zustand';
import axiosInstance from '@/lib/axios.js';

interface Assessment {
  _id: string;
  title: string;
  description?: string;
  questions?: any[];
}

interface AnswerPayload {
  option?: string;
  text?: string;
  type?: string;
}

interface StoreState {
  addAssessmentError: string | null;
  isAddingAssessment: boolean;
  draftResponses: Record<
    string,
    Record<string, AnswerPayload>
  >;

  // actions
  getAssessmentById: (id: string) => Promise<Assessment | null>;
  getResponsesByAssessmentId: (id: string) => Promise<any[]>;
  patchAssessmentById: (
    id: string,
    data: Partial<Assessment>
  ) => Promise<Assessment | null>;
  setDraft: (
    assessmentId: string,
    questionKey: string,
    ans: AnswerPayload
  ) => void;
  clearDraft: (assessmentId: string) => void;
  submitResponses: (
    assessmentId: string,
    payload: any
  ) => Promise<void>;
  deleteAssessmentById: (id: string) => Promise<boolean>;
}

export const useAssessmentStore = create<StoreState>((set, get) => ({
  addAssessmentError: null,
  isAddingAssessment: false,
  draftResponses: {},

  getAssessmentById: async id => {
    try {
      const res = await axiosInstance.get(`/assessments/${id}`);
      return res.data as Assessment;
    } catch (err) {
      console.error('[Store] Error fetching assessment by ID:', err);
      return null;
    }
  },

  getResponsesByAssessmentId: async id => {
    try {
      const res = await axiosInstance.get(`/assessments/${id}/responses`);
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
    // normalize answers into { option, text, type }
    const normalizedAnswers: Record<string, AnswerPayload> = {};
    Object.entries(payload.answers || {}).forEach(
      ([qKey, ans]: [string, any]) => {
        normalizedAnswers[qKey] = {
          option: ans?.option || '',
          text: ans?.text || '',
          type: ans?.type || 'unknown',
        };
      }
    );

    // make sure user object exists
    const user = payload.user || { name: 'Anonymous', email: '' };

    const finalPayload = {
      user,
      startedAt: payload.startedAt || new Date().toISOString(),
      submittedAt: payload.submittedAt || new Date().toISOString(),
      location: payload.location || null,
      answers: normalizedAnswers,
    };

    await axiosInstance.post(
      `/assessments/${assessmentId}/responses`,
      finalPayload
    );

    get().clearDraft(assessmentId);
  } catch (err: any) {
    console.error(
      '[Store] Error submitting responses:',
      err.response?.data || err.message
    );
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

