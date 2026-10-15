import { create } from "zustand";
import type { PaymentIntent } from "@/interfaces/payment-intent";

interface PaymentIntentStore {
  intent: PaymentIntent | null;
  transactionUrl: string | null;
  setIntent: (intent: PaymentIntent | null) => void;
  setTransactionUrl: (transactionUrl: string | null) => void;
  reset: () => void;
}

export const usePaymentIntentStore = create<PaymentIntentStore>((set) => ({
  intent: null,
  transactionUrl: null,
  setIntent: (intent) => set({ intent }),
  setTransactionUrl: (transactionUrl) => set({ transactionUrl }),
  reset: () => set(usePaymentIntentStore.getInitialState()),
}));
