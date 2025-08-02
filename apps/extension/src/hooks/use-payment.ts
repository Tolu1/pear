import { create } from "zustand";

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
  detect: () => void;
  pay: () => Promise<void>;
  reset: () => void;
}

export const usePayment = create<PaymentStore>((set) => ({
  step: "idle",
  payment: null,
  isDetecting: false,
  isProcessing: false,

  detect: async () => {
    set({ isDetecting: true });
    try {
      chrome.tabs.captureVisibleTab(async (dataUrl) => {
        if (dataUrl) {
          const base64 = dataUrl.split(",")[1];

          try {
            const response = await fetch("http://localhost:3000/detection", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                url: window.location.href, // or however you get the current URL
                screenshot: base64, // or dataUrl if your API expects the full data URL
              }),
            });

            const detection: Detection = await response.json();
            console.log(detection);

            if (detection.type === "almost_payment_page") {
              set({ step: "almost-detected", isDetecting: false });
            } else if (detection.type === "payment_page") {
              set({
                payment: detection.paymentData,
                step: "detected",
                isDetecting: false,
              });
            } else {
              set({ isDetecting: false });
            }
          } catch (error) {
            console.error("Detection error:", error);
            set({ isDetecting: false });
          }
        }
      });
    } catch (error: any) {
      console.log(error.message);
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
