import { Button } from "@/components/ui/button";
import { usePaymentScreenStore } from "@/stores/payment-screen.store";

function ViewTransactionButton() {
  const { reset } = usePaymentScreenStore();

  return (
    <Button variant="outline" size="lg" className="w-full" onClick={reset}>
      Continue
    </Button>
  );
}

export default ViewTransactionButton;
