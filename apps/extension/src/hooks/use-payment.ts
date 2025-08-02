import { create } from "zustand";
import { getActiveTab } from "@/lib/utils";

export type PaymentStep =
  | "idle"
  | "almost-detected"
  | "detected"
  | "confirming"
  | "processing"
  | "success"
  | "failed";

export interface Detection {
  type: "regular_page" | "almost_payment_page" | "payment_page";
  paymentData: PaymentData;
}

export interface PaymentData {
  price: string;
  merchantDomain: string;
  paymentUrl: string;
}

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
  payment: PaymentData | null;
  isDetecting: boolean;
  isProcessing: boolean;
  error: string | null;
  detect: () => void;
  pay: () => Promise<void>;
  reset: () => void;
}

export const usePayment = create<PaymentStore>((set) => ({
  step: "idle",
  payment: null,
  isDetecting: false,
  isProcessing: false,
  error: null,

  detect: async () => {
    set({ isDetecting: true });
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const tab = await getActiveTab();
      const dataUrl = await chrome.tabs.captureVisibleTab();
      const base64 = dataUrl.split(",")[1];

      console.log("starting api request");
      const response = await fetch("http://localhost:3000/detection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: tab.url,
          screenshot: base64,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      console.log("finished api request");

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const detection: Detection = await response.json();
      console.log(detection);

      if (detection.type === "almost_payment_page") {
        set({ step: "almost-detected", isDetecting: false });
      } else if (detection.type === "payment_page") {
        set({
          step: "detected",
          payment: detection.paymentData,
          isDetecting: false,
        });
      } else {
        set({ isDetecting: false });
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.log(error);
      let errorMessage = error.message;
      if (error.name === "AbortError") {
        errorMessage = "We're having trouble analyzing this page";
      }
      set({ step: "failed", isDetecting: false, error: errorMessage });
    }
  },

  pay: async () => {
    set({ isProcessing: true, step: "confirming" });

    await new Promise((resolve) => setTimeout(resolve, 2000));
    set({ step: "processing" });

    await new Promise((resolve) => setTimeout(resolve, 3000));
    set({ step: "success", isProcessing: false });

    await new Promise((resolve) => setTimeout(resolve, 2000));
    set({
      step: "failed",
      error: "Payment processing failed. Please try again.",
    });
  },

  reset: () => {
    set({
      step: "idle",
      payment: null,
      isProcessing: false,
      isDetecting: false,
      error: null,
    });
  },
}));
