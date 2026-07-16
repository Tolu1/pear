import { create } from "zustand";

export type ScenarioRunStatus =
  | "idle"
  | "running"
  | "done"
  | "failed"
  | "unavailable";
export type FeedEntryType =
  | "goal"
  | "thought"
  | "action"
  | "usage"
  | "outcome"
  | "error";

export interface FeedEntry {
  id: string;
  type: FeedEntryType;
  text: string;
}

interface PlaygroundStore {
  status: ScenarioRunStatus;
  feed: FeedEntry[];
  setStatus: (status: ScenarioRunStatus) => void;
  appendFeed: (type: FeedEntryType, text: string) => void;
  reset: () => void;
}

export const usePlaygroundStore = create<PlaygroundStore>((set) => ({
  status: "idle",
  feed: [],
  setStatus: (status) => set({ status }),
  appendFeed: (type, text) =>
    set((state) => ({
      feed: [...state.feed, { id: crypto.randomUUID(), type, text }],
    })),
  reset: () => set({ status: "idle", feed: [] }),
}));
