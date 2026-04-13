import { Button } from "@/components/ui/button";
import { usePayment } from "@/hooks/use-payment";
function ViewTransactionButton() {
  const { reset } = usePayment();

  return (
    <Button variant="outline" size="lg" className="w-full" onClick={reset}>
      Continue
    </Button>
  );
}

export default ViewTransactionButton;
