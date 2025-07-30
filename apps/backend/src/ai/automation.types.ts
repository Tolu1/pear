export interface BrowserState {
  sessionId: string;
  screenshot: string; // base64
  url: string;
  html: string;
  domContext?: Record<string, any>;
  userAgent?: string;
  viewport?: {
    width: number;
    height: number;
  };
}

export interface ActionResult {
  actionId: string;
  success: boolean;
  error?: string;
  executionTime?: number;
  newState?: Record<string, any>;
}

export interface ActionPlan {
  id: string;
  type: ActionType;
  target?: string;
  coordinates?: Coordinates;
  text?: string;
  selector?: string;
  description: string;
  confidence?: number;
  reasoning?: string;
}

export type ActionType =
  | 'click'
  | 'type'
  | 'scroll'
  | 'navigate'
  | 'wait'
  | 'hover'
  | 'submit'
  | 'select';

export interface Coordinates {
  x: number;
  y: number;
}

export interface AutomationResponse {
  status: AutomationStatus;
  actions?: ActionPlan[];
  error?: string;
  sessionId: string;
  nextStepDescription?: string;
  confidence?: number;
}

export type AutomationStatus = 'in_progress' | 'completed' | 'failed';

export interface MagnitudeSession {
  sessionId: string;
  userId?: string;
  goal?: string;
  currentUrl: string;
  startTime: Date;
  lastActivity: Date;
  actionHistory: ActionResult[];
  context: Record<string, any>;
}
