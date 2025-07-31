import { Button } from "@/components/ui/button";
import { usePayment } from "@/hooks/use-payment";

function RefreshAndPayButtons() {
  const { detect, pay } = usePayment();
  return (
    <div className="flex flex-col gap-2">
      <Button variant="outline" size="lg" className="w-full" onClick={detect}>
        Refresh
      </Button>
      <Button size="lg" className="w-full" onClick={pay}>
        Pay
      </Button>
    </div>
  );
}

export default RefreshAndPayButtons;
