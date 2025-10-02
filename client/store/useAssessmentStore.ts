// import { create } from 'zustand';
// import axiosInstance from '@/lib/axios.js';
//
// interface Assessment {
//   _id: string;
//   title: string;
//   description?: string;
//   questions?: any[];
// }
//
// interface AnswerPayload {
//   option?: string;
//   text?: string;
//   type?: string;
// }
//
// interface StoreState {
//   addAssessmentError: string | null;
//   isAddingAssessment: boolean;
//   draftResponses: Record<
//     string,
//     Record<string, AnswerPayload>
//   >;
//
//   // actions
//   getAssessmentById: (id: string) => Promise<Assessment | null>;
//   getResponsesByAssessmentId: (id: string) => Promise<any[]>;
//   patchAssessmentById: (
//     id: string,
//     data: Partial<Assessment>
//   ) => Promise<Assessment | null>;
//   setDraft: (
//     assessmentId: string,
//     questionKey: string,
//     ans: AnswerPayload
//   ) => void;
//   clearDraft: (assessmentId: string) => void;
//   submitResponses: (
//     assessmentId: string,
//     payload: any
//   ) => Promise<void>;
//   deleteAssessmentById: (id: string) => Promise<boolean>;
// }
//
// export const useAssessmentStore = create<StoreState>((set, get) => ({
//   addAssessmentError: null,
//   isAddingAssessment: false,
//   draftResponses: {},
//
//   getAssessmentById: async id => {
//     try {
//       const res = await axiosInstance.get(`/assessments/${id}`);
//       return res.data as Assessment;
//     } catch (err) {
//       console.error('[Store] Error fetching assessment by ID:', err);
//       return null;
//     }
//   },
//
//   getResponsesByAssessmentId: async id => {
//     try {
//       const res = await axiosInstance.get(`/assessments/${id}/responses`);
//       return Array.isArray(res.data) ? res.data : [];
//     } catch (err) {
//       console.error('[Store] Error fetching responses:', err);
//       return [];
//     }
//   },
//
//   patchAssessmentById: async (id, data) => {
//     try {
//       const res = await axiosInstance.patch(`/assessments/${id}`, data);
//       return res.data.updatedAssessment as Assessment;
//     } catch (err) {
//       console.error('[Store] Error patching assessment:', err);
//       return null;
//     }
//   },
//
//   setDraft: (assessmentId, questionKey, ans) =>
//     set(state => ({
//       draftResponses: {
//         ...state.draftResponses,
//         [assessmentId]: {
//           ...(state.draftResponses[assessmentId] ?? {}),
//           [questionKey]: ans,
//         },
//       },
//     })),
//
//   clearDraft: assessmentId =>
//     set(state => {
//       const updated = { ...state.draftResponses };
//       delete updated[assessmentId];
//       return { draftResponses: updated };
//     }),
//
//   submitResponses: async (assessmentId, payload) => {
//   try {
//     // normalize answers into { option, text, type }
//     const normalizedAnswers: Record<string, AnswerPayload> = {};
//     Object.entries(payload.answers || {}).forEach(
//       ([qKey, ans]: [string, any]) => {
//         normalizedAnswers[qKey] = {
//           option: ans?.option || '',
//           text: ans?.text || '',
//           type: ans?.type || 'unknown',
//         };
//       }
//     );
//
//     // make sure user object exists
//     const user = payload.user || { name: 'Anonymous', email: '' };
//
//     const finalPayload = {
//       user,
//       startedAt: payload.startedAt || new Date().toISOString(),
//       submittedAt: payload.submittedAt || new Date().toISOString(),
//       location: payload.location || null,
//       answers: normalizedAnswers,
//     };
//
//     await axiosInstance.post(
//       `/assessments/${assessmentId}/responses`,
//       finalPayload
//     );
//
//     get().clearDraft(assessmentId);
//   } catch (err: any) {
//     console.error(
//       '[Store] Error submitting responses:',
//       err.response?.data || err.message
//     );
//     throw err;
//   }
// },
//
//   deleteAssessmentById: async (id: string): Promise<boolean> => {
//     try {
//       await axiosInstance.delete(`/assessments/${id}`);
//       return true;
//     } catch (err) {
//       console.error('[Store] Error deleting assessment:', err);
//       return false;
//     }
//   },
// }));
//


import { create } from "zustand";
import axiosInstance from "../lib/axios";
import Toast from "react-native-toast-message";

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
  assessments: Assessment[];
  currentAssessment: Assessment | null;
  isFetching: boolean;
  isSubmitting: boolean;
  error: string | null;
  draftResponses: Record<string, Record<string, AnswerPayload>>;

  // Actions
  createAssessment: (data: Partial<Assessment>) => Promise<Assessment | null>;
  fetchAllAssessments: () => Promise<Assessment[]>;
  fetchAssessmentById: (id: string) => Promise<Assessment | null>;
  fetchResponsesByAssessmentId: (id: string) => Promise<any[]>;
  submitResponses: (assessmentId: string, payload: any) => Promise<boolean>;
  updateAssessmentById: (id: string, data: Partial<Assessment>) => Promise<Assessment | null>;
  deleteAssessmentById: (id: string) => Promise<boolean>;
  fetchAssessmentPdf: (id: string) => Promise<Blob | null>;

  setDraft: (assessmentId: string, questionKey: string, ans: AnswerPayload) => void;
  clearDraft: (assessmentId: string) => void;
}

export const useAssessmentStore = create<StoreState>((set, get) => ({
  assessments: [],
  currentAssessment: null,
  isFetching: false,
  isSubmitting: false,
  error: null,
  draftResponses: {},

  // --- Create Assessment ---
  createAssessment: async (data) => {
    try {
      const res = await axiosInstance.post("/api/postAssessment", data);
      Toast.show({ type: "success", text1: "Assessment created" });
      return res.data as Assessment;
    } catch (error: any) {
      console.error("Error creating assessment:", error);
      Toast.show({ type: "error", text1: "Failed to create assessment" });
      return null;
    }
  },

  // --- Fetch All Assessments ---
  fetchAllAssessments: async () => {
    set({ isFetching: true, error: null });
    try {
      const res = await axiosInstance.get("/api/assessments");
      set({ assessments: res.data });
      return res.data as Assessment[];
    } catch (error: any) {
      console.error("Error fetching assessments:", error);
      set({ error: error?.response?.data?.message || "Failed to fetch assessments" });
      return [];
    } finally {
      set({ isFetching: false });
    }
  },

  // --- Fetch Assessment by ID ---
  fetchAssessmentById: async (id) => {
    set({ isFetching: true, error: null });
    try {
      const res = await axiosInstance.get(`/api/assessments/${id}`);
      set({ currentAssessment: res.data });
      return res.data as Assessment;
    } catch (error: any) {
      console.error("Error fetching assessment:", error);
      set({ error: error?.response?.data?.message || "Failed to fetch assessment" });
      return null;
    } finally {
      set({ isFetching: false });
    }
  },

  // --- Fetch Responses by Assessment ID ---
  fetchResponsesByAssessmentId: async (id) => {
    set({ isFetching: true, error: null });
    try {
      const res = await axiosInstance.get(`/api/assessments/${id}/responses`);
      return Array.isArray(res.data) ? res.data : [];
    } catch (error: any) {
      console.error("Error fetching responses:", error);
      set({ error: error?.response?.data?.message || "Failed to fetch responses" });
      return [];
    } finally {
      set({ isFetching: false });
    }
  },

  // --- Submit Responses ---
  submitResponses: async (assessmentId, payload) => {
    set({ isSubmitting: true, error: null });
    try {
      const normalizedAnswers: Record<string, AnswerPayload> = {};
      Object.entries(payload.answers || {}).forEach(([qKey, ans]: [string, any]) => {
        normalizedAnswers[qKey] = {
          option: ans?.option || "",
          text: ans?.text || "",
          type: ans?.type || "unknown",
        };
      });

      const user = payload.user || { name: "Anonymous", email: "" };

      const finalPayload = {
        user,
        startedAt: payload.startedAt || new Date().toISOString(),
        submittedAt: payload.submittedAt || new Date().toISOString(),
        location: payload.location || null,
        answers: normalizedAnswers,
      };

      await axiosInstance.post(`/api/assessments/${assessmentId}/responses`, finalPayload);

      get().clearDraft(assessmentId);
      Toast.show({ type: "success", text1: "Responses submitted" });
      return true;
    } catch (error: any) {
      console.error("Error submitting responses:", error);
      Toast.show({ type: "error", text1: "Failed to submit responses" });
      return false;
    } finally {
      set({ isSubmitting: false });
    }
  },

  // --- Update Assessment ---
  updateAssessmentById: async (id, data) => {
    try {
      const res = await axiosInstance.patch(`/api/assessments/${id}`, data);
      set({ currentAssessment: res.data.updatedAssessment });
      Toast.show({ type: "success", text1: "Assessment updated" });
      return res.data.updatedAssessment as Assessment;
    } catch (error: any) {
      console.error("Error updating assessment:", error);
      Toast.show({ type: "error", text1: "Failed to update assessment" });
      return null;
    }
  },

  // --- Delete Assessment ---
  deleteAssessmentById: async (id) => {
    try {
      await axiosInstance.delete(`/api/assessments/${id}`);
      Toast.show({ type: "success", text1: "Assessment deleted" });
      return true;
    } catch (error: any) {
      console.error("Error deleting assessment:", error);
      Toast.show({ type: "error", text1: "Failed to delete assessment" });
      return false;
    }
  },

  // --- Fetch Assessment PDF ---
  fetchAssessmentPdf: async (id) => {
    try {
      const res = await axiosInstance.get(`/api/assessments/${id}/pdf`, {
        responseType: "blob",
      });
      return res.data as Blob;
    } catch (error: any) {
      console.error("Error fetching assessment PDF:", error);
      Toast.show({ type: "error", text1: "Failed to fetch PDF" });
      return null;
    }
  },

  // --- Draft Handling ---
  setDraft: (assessmentId, questionKey, ans) =>
      set((state) => ({
        draftResponses: {
          ...state.draftResponses,
          [assessmentId]: {
            ...(state.draftResponses[assessmentId] ?? {}),
            [questionKey]: ans,
          },
        },
      })),

  clearDraft: (assessmentId) =>
      set((state) => {
        const updated = { ...state.draftResponses };
        delete updated[assessmentId];
        return { draftResponses: updated };
      }),
}));
