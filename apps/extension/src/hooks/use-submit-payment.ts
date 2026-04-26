import { useMutation } from "@tanstack/react-query";
import { submitPayment } from "@/core/payment/submit-payment";

export function useSubmitPayment() {
  return useMutation({
    mutationFn: submitPayment,
    throwOnError: true,
  });
}
