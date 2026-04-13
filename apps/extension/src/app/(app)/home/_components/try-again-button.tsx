import { Button } from "@/components/ui/button";
import { usePayment } from "@/hooks/use-payment";
function TryAgainButton() {
  const { reset } = usePayment();
  return (
    <Button size="lg" className="w-full" onClick={reset}>
      Try Again
    </Button>
  );
}

export default TryAgainButton;
