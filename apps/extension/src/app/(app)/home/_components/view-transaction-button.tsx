import { Button } from "@/components/ui/button";
import { usePaymentScreen } from "@/hooks/use-payment-screen";

function ViewTransactionButton() {
  const { reset } = usePaymentScreen();

  return (
    <Button variant="outline" size="lg" className="w-full" onClick={reset}>
      Continue
    </Button>
  );
}

export default ViewTransactionButton;
