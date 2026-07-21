import { useMutation } from "@tanstack/react-query";
import { submitAccessCode } from "@/core/playground/submit-access-code";

export function useSubmitAccessCode() {
  return useMutation({ mutationFn: submitAccessCode, throwOnError: false });
}
