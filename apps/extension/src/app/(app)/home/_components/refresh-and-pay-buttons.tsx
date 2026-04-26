import { Button } from "@/components/ui/button";
import { useCheckForPaymentPage } from "@/hooks/use-check-for-payment-page";
import { useSubmitPayment } from "@/hooks/use-submit-payment";
import { useDetectedPaymentStore } from "@/stores/detected-payment.store";

function RefreshAndPayButtons() {
  const { mutate: checkForPaymentPage, isPending } = useCheckForPaymentPage();
  const { mutate: submitPayment } = useSubmitPayment();
  const { payment } = useDetectedPaymentStore();
  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="outline"
        size="lg"
        className="w-full"
        onClick={() => checkForPaymentPage()}
        disabled={isPending}
      >
        Refresh
      </Button>
      <Button
        size="lg"
        className="w-full"
        onClick={() => submitPayment()}
        disabled={!payment || isPending}
      >
        Pay
      </Button>
    </div>
  );
}

export default RefreshAndPayButtons;
