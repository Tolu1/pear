import { queryClient } from "@/lib/query-client";
import { validateBetaAccess } from "@/lib/ai/beta-access/validate-beta-access";
import { betaAccessKeys } from "@/lib/query-keys";
import { useBetaAccessStore } from "@/stores/beta-access.store";

export async function revalidateStoredCode(): Promise<void> {
  const code = useBetaAccessStore.getState().code;
  if (!code) return;

  const access = await queryClient
    .fetchQuery({
      queryKey: betaAccessKeys.all,
      queryFn: () => validateBetaAccess(code),
    })
    .catch(() => null);

  if (access && !access.valid) {
    useBetaAccessStore.getState().setCode(null);
  }
}
