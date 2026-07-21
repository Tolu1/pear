import { validateBetaAccess } from "@/lib/ai/beta-access/validate-beta-access";
import { useBetaAccessStore } from "@/stores/beta-access.store";

export function getBetaAccess() {
  const code = useBetaAccessStore.getState().code;
  if (!code) {
    throw new Error("getBetaAccess ran without a stored access code");
  }
  return validateBetaAccess(code);
}
