import { type ErrorComponentProps } from "@tanstack/react-router";
import { usePaymentScreen } from "@/hooks/use-payment-screen";
import { useEffect } from "react";
import UserWarning from "@/app/(app)/home/_components/user-warning";
import TryAgainButton from "@/app/(app)/home/_components/try-again-button";

export function RouteErrorBoundary({ error, reset }: ErrorComponentProps) {
  const { setWarning, reset: resetScreen } = usePaymentScreen();

  useEffect(() => {
    console.error("[RouteErrorBoundary]", error);
    const message = error instanceof Error ? error.message : String(error);
    setWarning(message);
  }, [error, setWarning]);

  function handleTryAgain() {
    resetScreen();
    reset();
  }

  return (
    <div className="flex h-full flex-col p-6">
      <div className="flex-1">
        <UserWarning />
      </div>
      <div>
        <TryAgainButton onClick={handleTryAgain} />
      </div>
    </div>
  );
}
