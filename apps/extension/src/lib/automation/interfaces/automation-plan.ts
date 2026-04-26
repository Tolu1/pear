import type { AutomationAction } from "./automation-action";

export interface AutomationPlan {
  reasoning: string;
  actions: AutomationAction[];
  isComplete: boolean;
  nextStep?: string;
}
