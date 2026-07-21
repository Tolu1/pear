import { create } from "zustand";
import type { PaymentIntent } from "@/interfaces/payment-intent";

interface PaymentIntentStore {
  intent: PaymentIntent | null;
  setIntent: (intent: PaymentIntent | null) => void;
  reset: () => void;
}

export const usePaymentIntentStore = create<PaymentIntentStore>((set) => ({
  intent: null,
  setIntent: (intent) => set({ intent }),
  reset: () => set(usePaymentIntentStore.getInitialState()),
}));
