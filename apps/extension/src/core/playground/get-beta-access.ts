import { validateBetaAccess } from "@/lib/ai/beta-access/validate-beta-access";
import { useBetaAccessStore } from "@/stores/beta-access.store";

export function getBetaAccess() {
  const code = useBetaAccessStore.getState().code;
  return validateBetaAccess(code!);
}
