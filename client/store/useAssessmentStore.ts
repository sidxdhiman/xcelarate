import { create } from "zustand";
import axiosInstance from "../lib/axios";
import { Assessment } from "@/types/assessment";
import Toast from "react-native-toast-message";

interface AnswerPayload {
  option?: string;
  text?: string;
  type?: string;
}

interface AssessmentStore {
  assessments: Assessment[];
  currentAssessment: Assessment | null;
  assessment: any | null; // added for responses
  assessmentResponses: any[];
  isFetching: boolean;
  isSubmitting: boolean;
  error: string | null;
  draftResponses: Record<string, Record<string, AnswerPayload>>;
  fetchAssessments: () => Promise<void>;
  fetchAssessmentById: (id: string) => Promise<Assessment | null>;
  fetchAssessmentResponses: (id: string) => Promise<void>;
  submitAssessmentResponse: (id: string, payload: any) => Promise<boolean>;
  downloadAssessmentPdf: (id: string) => Promise<void>;
  setDraft: (assessmentId: string, questionKey: string, ans: AnswerPayload) => void;
  clearDraft: (assessmentId: string) => void;
  // deleteAssessmentById: (id: string) => Promise<boolean>;
  addAssessment: (data: Partial<Assessment>) => Promise<Assessment | null>;

  patchAssessmentById: (id: string, data: Partial<Assessment>) => Promise<Assessment | null>;

  // --- UPDATED & NEW FUNCTIONS ---
  deactivateAssessmentById: (id: string) => Promise<boolean>; // Renamed from delete
  activateAssessmentById: (id: string) => Promise<boolean>; // Added new
  fetchDeactivatedAssessments: () => Promise<{ success: boolean; data: Assessment[] }>; // Added new
}

export const useAssessmentStore = create<AssessmentStore>((set, get) => ({
  assessments: [],
  currentAssessment: null,
  assessment: null, // initial state for responses
  assessmentResponses: [],
  isFetching: false,
  isSubmitting: false,
  error: null,
  draftResponses: {},

  // Add new assessment
  addAssessment: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      const res = await axiosInstance.post("/assessments", data);
      const newAssessment = res.data as Assessment;

      set((state) => ({
        assessments: [...state.assessments, newAssessment],
      }));

      Toast.show({ type: "success", text1: "Assessment created successfully" });
      return newAssessment;
    } catch (error: any) {
      console.error("Error adding assessment:", error.response?.data || error.message);
      set({ error: error?.response?.data?.message || "Failed to add assessment" });
      Toast.show({ type: "error", text1: "Failed to add assessment" });
      return null;
    } finally {
      set({ isSubmitting: false });
    }
  },

  // Fetch all (active) assessments
  fetchAssessments: async () => {
    set({ isFetching: true, error: null });
    try {
      const res = await axiosInstance.get("/assessments");
      set({ assessments: res.data });
    } catch (error: any) {
      console.error("Error fetching assessments:", error);
      set({ error: error?.response?.data?.message || "Failed to fetch assessments" });
      Toast.show({ type: "error", text1: "Failed to load assessments" });
    } finally {
      set({ isFetching: false });
    }
  },

  // Fetch a single assessment
  fetchAssessmentById: async (id: string) => {
    set({ isFetching: true, error: null });
    try {
      const res = await axiosInstance.get(`/assessments/${id}`);
      set({ currentAssessment: res.data });
      return res.data as Assessment;
    } catch (error: any) {
      console.error("Error fetching assessment:", error);
      set({ error: error?.response?.data?.message || "Failed to fetch assessment" });
      Toast.show({ type: "error", text1: "Failed to load assessment" });
      return null;
    } finally {
      set({ isFetching: false });
    }
  },

  // Fetch all responses for an assessment
  fetchAssessmentResponses: async (id: string) => {
    set({ isFetching: true, error: null });
    try {
      const { data } = await axiosInstance.get(`/assessments/${id}/responses`);
      set({ assessmentResponses: data }); // store responses separately
    } catch (error: any) {
      console.error("Error fetching assessment responses:", error);
      set({ error: error?.response?.data?.message || "Failed to fetch responses" });
      Toast.show({ type: "error", text1: "Failed to load responses" });
    } finally {
      set({ isFetching: false });
    }
  },

  // Patch / update existing assessment
  patchAssessmentById: async (id: string, data: Partial<Assessment>) => {
    set({ isSubmitting: true, error: null });
    try {
      const res = await axiosInstance.patch(`/assessments/${id}`, data);

      set((state) => ({
        assessments: state.assessments.map((a) =>
            (a as any)._id === id ? res.data : a
        ),
        currentAssessment: res.data,
      }));

      Toast.show({ type: "success", text1: "Assessment updated successfully" });
      return res.data as Assessment;
    } catch (error: any) {
      console.error("Error updating assessment:", error.response?.data || error.message);
      set({ error: error?.response?.data?.message || "Failed to update assessment" });
      Toast.show({ type: "error", text1: "Failed to update assessment" });
      return null;
    } finally {
      set({ isSubmitting: false });
    }
  },

  // Submit assessment response
  submitAssessmentResponse: async (id: string, payload: any) => {
    set({ isSubmitting: true, error: null });
    try {
      const normalizedAnswers: Record<string, AnswerPayload> = {};
      Object.entries(payload.answers || {}).forEach(
          ([qKey, ans]: [string, any]) => {
            normalizedAnswers[qKey] = {
              option: ans?.option || "",
              text: ans?.text || "",
              type: ans?.type || "unknown",
            };
          }
      );

      const finalPayload = {
        user: payload.user || { name: "Anonymous", email: "" },
        startedAt: payload.startedAt || new Date().toISOString(),
        submittedAt: payload.submittedAt || new Date().toISOString(),
        location: payload.location || null,
        answers: normalizedAnswers,
      };

      await axiosInstance.post(`/assessments/${id}/responses`, finalPayload);

      get().clearDraft(id);
      Toast.show({ type: "success", text1: "Assessment submitted successfully" });
      return true;
    } catch (error: any) {
      console.error("Error submitting response:", error.response?.data || error.message);
      set({ error: error?.response?.data?.message || "Submission failed" });
      Toast.show({ type: "error", text1: "Failed to submit assessment" });
      return false;
    } finally {
      set({ isSubmitting: false });
    }
  },

  // Download assessment PDF
  downloadAssessmentPdf: async (id: string) => {
    set({ isFetching: true, error: null });
    try {
      const { downloadAssessmentPDF } = await import("@/lib/pdfGenerator");
      await downloadAssessmentPDF(id);

      Toast.show({ type: "success", text1: "PDF downloaded successfully" });
    } catch (error: any) {
      console.error("Error downloading PDF:", error);
      set({ error: error?.response?.data?.message || "Failed to download PDF" });
      Toast.show({ type: "error", text1: "Failed to download PDF" });
    } finally {
      set({ isFetching: false });
    }
  },

  // // Delete assessment
  // deleteAssessmentById: async (id: string) => {
  //   set({ isFetching: true, error: null });
  //   try {
  //     await axiosInstance.delete(`/assessments/${id}`);
  //     Toast.show({ type: "success", text1: "Assessment deleted" });
  //     return true;
  //   } catch (error: any) {
  //     console.error("Error deleting assessment:", error);
  //     set({ error: error?.response?.data?.message || "Failed to delete assessment" });
  //     Toast.show({ type: "error", text1: "Failed to delete assessment" });
  //     return false;
  //   } finally {
  //     set({ isFetching: false });
  //   }
  // },

  // --- MODIFIED FUNCTION ---
  // Deactivate assessment
  deactivateAssessmentById: async (id: string) => {
    set({ isFetching: true, error: null });
    try {
      // Changed from .delete to .patch and updated URL
      await axiosInstance.patch(`/assessments/${id}/deactivate`);
      Toast.show({ type: "success", text1: "Assessment deactivated" });
      return true;
    } catch (error: any) {
      console.error("Error deactivating assessment:", error);
      set({ error: error?.response?.data?.message || "Failed to deactivate" });
      Toast.show({ type: "error", text1: "Failed to deactivate" });
      return false;
    } finally {
      set({ isFetching: false });
    }
  },

  // --- NEW FUNCTION ---
  // Activate assessment
  activateAssessmentById: async (id: string) => {
    set({ isFetching: true, error: null });
    try {
      await axiosInstance.patch(`/assessments/${id}/activate`);
      Toast.show({ type: "success", text1: "Assessment activated" });
      return true;
    } catch (error: any) {
      console.error("Error activating assessment:", error);
      set({ error: error?.response?.data?.message || "Failed to activate" });
      Toast.show({ type: "error", text1: "Failed to activate" });
      return false;
    } finally {
      set({ isFetching: false });
    }
  },

  // --- NEW FUNCTION ---
  // Fetch deactivated assessments
  fetchDeactivatedAssessments: async () => {
    set({ isFetching: true, error: null });
    try {
      const res = await axiosInstance.get("/assessments/deactivated");
      return { success: true, data: res.data as Assessment[] };
    } catch (error: any) {
      console.error("Error fetching deactivated assessments:", error);
      set({ error: error?.response?.data?.message || "Failed to fetch" });
      Toast.show({ type: "error", text1: "Failed to load archive" });
      return { success: false, data: [] };
    } finally {
      set({ isFetching: false });
    }
  },

  // Draft handling
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