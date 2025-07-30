// apps/backend/src/ai/dto/automation-response.dto.ts
import { AutomationStatus, ActionPlan } from '../automation.types';

export class AutomationResponseDto {
  status: AutomationStatus;
  actions?: ActionPlan[];
  error?: string;
  sessionId: string;
  nextStepDescription?: string;
  confidence?: number;
}
