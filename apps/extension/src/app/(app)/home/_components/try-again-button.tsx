import { Button } from "@/components/ui/button";
import { usePaymentScreen } from "@/hooks/use-payment-screen";

function TryAgainButton({ onClick }: { onClick?: () => void } = {}) {
  const { reset } = usePaymentScreen();
  return (
    <Button size="lg" className="w-full" onClick={onClick ?? reset}>
      Try Again
    </Button>
  );
}

export default TryAgainButton;
