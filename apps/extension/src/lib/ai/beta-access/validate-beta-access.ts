import { ai } from "@/lib/ai";
import type { BetaAccess } from "@/interfaces/beta-access";

export function validateBetaAccess(code: string): Promise<BetaAccess> {
  return ai.post<BetaAccess>("/beta-access/validate", { code });
}
