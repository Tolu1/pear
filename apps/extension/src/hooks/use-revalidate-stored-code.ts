import { useEffect } from "react";
import { revalidateStoredCode } from "@/core/playground/revalidate-stored-code";

export function useRevalidateStoredCode() {
  useEffect(() => {
    revalidateStoredCode();
  }, []);
}
