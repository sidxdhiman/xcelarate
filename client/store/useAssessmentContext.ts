import { create } from 'zustand';

interface AssessmentContextState {
  id: string | null;
  data?: string;
  setContext: (id: string, data?: string) => void;
}

export const useAssessmentContext = create<AssessmentContextState>((set) => ({
  id: null,
  data: undefined,
  setContext: (id, data) => set({ id, data }),
}));
