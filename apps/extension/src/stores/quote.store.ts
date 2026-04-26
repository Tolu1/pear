import { create } from "zustand";
import type { Quote } from "@/interfaces/quote";

interface QuoteStore {
  quote: Quote | null;
  setQuote: (quote: Quote | null) => void;
  reset: () => void;
}

export const useQuoteStore = create<QuoteStore>((set) => ({
  quote: null,
  setQuote: (quote) => set({ quote }),
  reset: () => set(useQuoteStore.getInitialState()),
}));
