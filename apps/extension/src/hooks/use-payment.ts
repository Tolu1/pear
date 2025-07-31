import { create } from "zustand";

export type PaymentStep =
  | "idle"
  | "almost-detected"
  | "detected"
  | "confirming"
  | "processing"
  | "success"
  | "failed";

export interface Payment {
  amount: number;
  currency: string;
  merchant: string;
  conversion: {
    rate: number;
    from: string;
    to: string;
    total: number;
  };
  fees: {
    network: number;
    pear: number;
  };
}

interface PaymentStore {
  step: PaymentStep;
  payment: Payment | null;
  isDetecting: boolean;
  isProcessing: boolean;
  detect: () => void;
  pay: () => Promise<void>;
  reset: () => void;
}

export const usePayment = create<PaymentStore>((set, get) => ({
  step: "idle",
  payment: null,
  isDetecting: false,
  isProcessing: false,

  detect: async () => {
    const { step } = get();
    set({ isDetecting: true });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    if (step === "idle") {
      set({ step: "almost-detected", isDetecting: false });
    } else if (step === "almost-detected") {
      const mockPayment: Payment = {
        amount: 74,
        currency: "USD",
        merchant: "bellroy.com",
        conversion: { rate: 0.54, from: "LSK", to: "USD", total: 142 },
        fees: { network: 0.041, pear: 0.076 },
      };

      set({ payment: mockPayment, step: "detected", isDetecting: false });
    } else {
      set({ isDetecting: false });
    }
  },

  pay: async () => {
    set({ isProcessing: true, step: "confirming" });

    await new Promise((resolve) => setTimeout(resolve, 2000));
    set({ step: "processing" });

    await new Promise((resolve) => setTimeout(resolve, 3000));
    set({ step: "success", isProcessing: false });

    await new Promise((resolve) => setTimeout(resolve, 2000));
    set({ step: "failed" });
  },

  reset: () => {
    set({
      step: "idle",
      payment: null,
      isProcessing: false,
      isDetecting: false,
    });
  },
}));
