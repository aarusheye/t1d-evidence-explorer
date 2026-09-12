import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ScenarioInput, ScenarioResult } from '@/types';
import { DEFAULT_INPUT } from '@/data/examples';
import { buildScenario } from '@/model/scenario';

interface AppState {
  consented: boolean;
  input: ScenarioInput;
  result: ScenarioResult | null;
  giveConsent: () => void;
  setInput: (patch: Partial<ScenarioInput>) => void;
  loadProfile: (input: ScenarioInput) => void;
  compute: () => ScenarioResult;
  reset: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      consented: false, input: DEFAULT_INPUT, result: null,
      giveConsent: () => set({ consented: true }),
      setInput: (patch) => set((state) => ({ input: { ...state.input, ...patch }, result: null })),
      loadProfile: (input) => set({ input, result: null }),
      compute: () => { const result = buildScenario(get().input); set({ result }); return result; },
      reset: () => set({ input: DEFAULT_INPUT, result: null }),
    }),
    { name: 't1d-evidence-explorer-v2', partialize: (state) => ({ consented: state.consented, input: state.input }) },
  ),
);
