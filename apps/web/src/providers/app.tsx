import React from "react";
import { PostHogProvider } from "./posthog";

export function AppProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider>{children}</PostHogProvider>;
}
