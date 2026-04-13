export interface AutomationSession {
  id: string;
  goal: string;
  conversationHistory: string[];
  isComplete: boolean;
  createdAt: Date;
}
