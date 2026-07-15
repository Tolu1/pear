import { useQuery } from "@tanstack/react-query";
import { getBetaAccess } from "@/core/playground/get-beta-access";
import { betaAccessKeys } from "@/lib/query-keys";

export function useBetaAccess() {
  return useQuery({
    queryKey: betaAccessKeys.all,
    queryFn: getBetaAccess,
    throwOnError: false,
  });
}
