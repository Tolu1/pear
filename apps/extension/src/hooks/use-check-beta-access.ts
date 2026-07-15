import { useEffect } from "react";
import { checkBetaAccess } from "@/core/playground/check-beta-access";

export function useCheckBetaAccess() {
  useEffect(() => {
    checkBetaAccess();
  }, []);
}
