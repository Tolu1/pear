export interface AutomationAction {
  type:
    | "click"
    | "type"
    | "scroll"
    | "wait"
    | "navigate"
    | "complete"
    | "user_action_required";
  target?: string;
  content?: string;
  coordinates?: { x: number; y: number };
  reasoning: string;
  userMessage?: string;
}
