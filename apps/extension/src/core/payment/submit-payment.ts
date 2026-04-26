import { getAccount } from "wagmi/actions";
import { config } from "@/lib/blockchain/config";
import { useDetectedPaymentStore } from "@/stores/detected-payment.store";
import { useQuoteStore } from "@/stores/quote.store";
import { usePaymentIntentStore } from "@/stores/payment-intent.store";
import { usePaymentScreen } from "@/hooks/use-payment-screen";
import { getActiveTab } from "@/lib/browser/get-active-tab";
import { captureScreenshot } from "@/lib/browser/capture-screenshot";
import { assertNoUserActionRequired } from "@/lib/ai/automation/assert-no-user-action-required";
import { createPaymentIntent } from "@/lib/api/payment-intents/create-payment-intent";
import { pollStatus } from "@/lib/api/payment-intents/poll-status";
import { completePaymentIntent } from "@/lib/api/payment-intents/complete-payment-intent";
import { transferToken } from "@/lib/blockchain/transfer-token";

export async function submitPayment(): Promise<void> {
  const { payment } = useDetectedPaymentStore.getState();
  const { quote } = useQuoteStore.getState();
  const { setIntent } = usePaymentIntentStore.getState();
  const { setScreen } = usePaymentScreen.getState();
  const { address } = getAccount(config);

  if (!payment || !quote || !address) {
    throw new Error("Missing payment context");
  }

  setScreen("checking");
  const tab = await getActiveTab();
  const screenshot = await captureScreenshot();
  await assertNoUserActionRequired({ url: tab.url ?? "", screenshot });

  const intent = await createPaymentIntent({
    quoteId: quote.id,
    fromAddress: address,
    merchantDomain: payment.merchantDomain,
  });
  setIntent(intent);

  setScreen("confirming");
  await transferToken(
    {
      contractAddress: intent.contractAddress,
      to: intent.paymentAddress,
      amount: intent.cryptoAmount,
    },
    async () => {
      setScreen("processing");
    },
  );

  await pollStatus(intent.id, "processing");
  await completePaymentIntent({ id: intent.id });
  setScreen("succeeded");
}
