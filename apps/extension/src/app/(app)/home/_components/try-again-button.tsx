import { Button } from "@/components/ui/button";
import { usePaymentScreenStore } from "@/stores/payment-screen.store";

function TryAgainButton({ onClick }: { onClick?: () => void } = {}) {
  const { reset } = usePaymentScreenStore();
  return (
    <Button size="lg" className="w-full" onClick={onClick ?? reset}>
      Try Again
    </Button>
  );
}

export default TryAgainButton;
