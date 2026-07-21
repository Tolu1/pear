import { queryClient } from "@/lib/query-client";
import { validateBetaAccess } from "@/lib/ai/beta-access/validate-beta-access";
import { betaAccessKeys } from "@/lib/query-keys";
import { useBetaAccessStore } from "@/stores/beta-access.store";
import type { BetaAccess } from "@/interfaces/beta-access";

export async function submitAccessCode(code: string): Promise<BetaAccess> {
  const normalized = code.trim().toUpperCase();
  const access = await validateBetaAccess(normalized);

  if (access.valid) {
    queryClient.setQueryData(betaAccessKeys.all, access);
    useBetaAccessStore.getState().setCode(normalized);
  }

  return access;
}
