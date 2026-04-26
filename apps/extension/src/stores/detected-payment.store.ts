import { create } from "zustand";
import type { DetectedPayment } from "@/interfaces/detected-payment";

interface DetectedPaymentStore {
  payment: DetectedPayment | null;
  setPayment: (payment: DetectedPayment | null) => void;
  reset: () => void;
}

export const useDetectedPaymentStore = create<DetectedPaymentStore>((set) => ({
  payment: null,
  setPayment: (payment) => set({ payment }),
  reset: () => set(useDetectedPaymentStore.getInitialState()),
}));
