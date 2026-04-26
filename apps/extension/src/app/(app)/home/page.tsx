import BalanceDisplay from "./_components/balance-display";
import { usePaymentScreen } from "@/hooks/use-payment-screen";
import GoToPaymentPage from "./_components/go-to-payment-page";
import Scanning from "./_components/scanning";
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

function Page() {
  const { screen } = usePaymentScreen();

  function renderMainContent() {
    switch (screen) {
      case "idle":
        return <GoToPaymentPage />;
      case "scanning":
        return <Scanning />;
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
      case "succeeded":
        return <PaymentCompleted />;
      case "failed":
        return <PaymentFailed />;
      case "expired":
        return <PaymentFailed />;
      case "canceled":
        return <PaymentFailed />;
    }
  }

  function renderBottomActions() {
    switch (screen) {
      case "idle":
      case "scanning":
      case "almost-detected":
      case "detected":
        return <RefreshAndPayButtons />;
      case "warning":
      case "failed":
      case "expired":
      case "canceled":
        return <TryAgainButton />;
      case "checking":
      case "confirming":
      case "processing":
        return <ContactSupportButton />;
      case "succeeded":
        return <ViewTransactionButton />;
    }
  }

  return (
    <div className="flex h-full flex-col p-6">
      <BalanceDisplay />
      <div className="flex-1">{renderMainContent()}</div>
      <div>{renderBottomActions()}</div>
    </div>
  );
}

export default Page;
