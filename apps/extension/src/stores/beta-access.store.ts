import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BetaAccessStore {
  code: string | null;
  setCode: (code: string | null) => void;
}

export const useBetaAccessStore = create<BetaAccessStore>()(
  persist(
    (set) => ({
      code: null,
      setCode: (code) => set({ code }),
    }),
    {
      name: "pear:beta-access",
      partialize: (state) => ({ code: state.code }),
    },
  ),
);
