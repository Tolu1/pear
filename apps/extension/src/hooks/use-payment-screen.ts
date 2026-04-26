import { create } from "zustand";

export type Screen =
  | "idle"
  | "scanning"
  | "almost-detected"
  | "detected"
  | "checking"
  | "confirming"
  | "processing"
  | "succeeded"
  | "warning"
  | "failed"
  | "expired"
  | "canceled";

interface PaymentScreenStore {
  screen: Screen;
  error: string | null;
  warning: string | null;
  setScreen: (screen: Screen) => void;
  setError: (error: string | null) => void;
  setWarning: (warning: string | null) => void;
  reset: () => void;
}

export const usePaymentScreen = create<PaymentScreenStore>((set) => ({
  screen: "idle",
  error: null,
  warning: null,
  setScreen: (screen) => set({ screen }),
  setError: (error) => set({ error }),
  setWarning: (warning) => set({ warning }),
  reset: () => set(usePaymentScreen.getInitialState()),
}));
