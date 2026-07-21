import { useMutation } from "@tanstack/react-query";
import { makePayment } from "@/core/payment/make-payment";

export function useMakePayment() {
  return useMutation({
    mutationFn: makePayment,
    throwOnError: true,
  });
}
