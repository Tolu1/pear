import { useMutation } from "@tanstack/react-query";
import { checkForPaymentPage } from "@/core/payment/check-for-payment-page";

export function useCheckForPaymentPage() {
  return useMutation({
    mutationFn: checkForPaymentPage,
    throwOnError: true,
  });
}
