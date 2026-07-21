import type { AutomationAction } from "./automation-action";

export interface AutomationResult {
  success: boolean;
  sessionId?: string;
  plan?: AutomationAction[];
  isComplete?: boolean;
  error?: string;
  debugScreenshot?: string;
}
