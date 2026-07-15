import { queryClient } from "@/lib/query-client";
import { validateBetaAccess } from "@/lib/ai/beta-access/validate-beta-access";
import { betaAccessKeys } from "@/lib/query-keys";
import { useBetaAccessStore } from "@/stores/beta-access.store";
import type { BetaAccess } from "@/interfaces/beta-access";

export async function submitAccessCode(rawCode: string): Promise<BetaAccess> {
  const code = rawCode.trim().toUpperCase();
  const access = await queryClient.fetchQuery({
    queryKey: betaAccessKeys.all,
    queryFn: () => validateBetaAccess(code),
  });

  if (access.valid) {
    useBetaAccessStore.getState().setCode(code);
  }

  return access;
}
