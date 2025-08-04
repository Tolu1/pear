import BalanceDisplay from "./_components/balance-display";
import { usePayment } from "@/hooks/use-payment";
import GoToPaymentPage from "./_components/go-to-payment-page";
import YouAreAlmostThere from "./_components/you-are-almost-there";
import PaymentDetails from "./_components/payment-details";
import Checking from "./_components/checking";
import ConfirmingWallet from "./_components/confirming-wallet";
import Processing from "./_components/processing";
import PaymentCompleted from "./_components/payment-completed";
import PaymentFailed from "./_components/payment-failed";
import UserWarning from "./_components/user-warning";
import RefreshAndPayButtons from "./_components/refresh-and-pay-buttons";
import ContactSupportButton from "./_components/contact-support-button";
import ViewTransactionButton from "./_components/view-transaction-button";
import TryAgainButton from "./_components/try-again-button";
import { ImSpinner3 } from "react-icons/im";

function Page() {
  const { step, isDetecting } = usePayment();

  function renderMainContent() {
    switch (step) {
      case "idle":
        return <GoToPaymentPage />;
      case "almost-detected":
        return <YouAreAlmostThere />;
      case "detected":
        return <PaymentDetails />;
      case "warning":
        return <UserWarning />;
      case "checking":
        return <Checking />;
      case "confirming":
        return <ConfirmingWallet />;
      case "processing":
        return <Processing />;
      case "success":
        return <PaymentCompleted />;
      case "failed":
        return <PaymentFailed />;
    }
  }

  function renderBottomActions() {
    switch (step) {
      case "idle":
        return <RefreshAndPayButtons />;
      case "almost-detected":
        return <RefreshAndPayButtons />;
      case "detected":
        return <RefreshAndPayButtons />;
      case "warning":
        return <TryAgainButton />;
      case "confirming":
        return <ContactSupportButton />;
      case "processing":
        return <ContactSupportButton />;
      case "success":
        return <ViewTransactionButton />;
      case "failed":
        return <TryAgainButton />;
    }
  }

  return (
    <div className="flex h-full flex-col p-6">
      <BalanceDisplay />
      <div className="flex-1">
        {isDetecting ? (
          <div className="flex h-[200px] items-center justify-center text-center">
            <ImSpinner3 className="animate-spin" size={24} />
          </div>
        ) : (
          renderMainContent()
        )}
      </div>
      <div>{renderBottomActions()}</div>
    </div>
  );
}

export default Page;
