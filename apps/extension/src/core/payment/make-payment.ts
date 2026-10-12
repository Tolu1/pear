import { getAccount } from "wagmi/actions";
import { config } from "@/lib/blockchain/config";
import { useDetectedPaymentStore } from "@/stores/detected-payment.store";
import { useQuoteStore } from "@/stores/quote.store";
import { usePaymentIntentStore } from "@/stores/payment-intent.store";
import { usePaymentScreenStore } from "@/stores/payment-screen.store";
import { getActiveTab } from "@/lib/browser/get-active-tab";
import { captureScreenshot } from "@/lib/browser/capture-screenshot";
import { assertNoUserActionRequired } from "@/lib/ai/automation/assert-no-user-action-required";
import { createPaymentIntent } from "@/lib/api/payment-intents/create-payment-intent";
import { submitPaymentIntent } from "@/lib/api/payment-intents/submit-payment-intent";
import { getSupportedTokens } from "@/lib/api/tokens/get-supported-tokens";
import { sendToken } from "@/lib/blockchain/send-token";
import { queryClient } from "@/lib/query-client";
import { supportedTokenKeys } from "@/lib/query-keys";
import { startCheckout } from "@/lib/ai/checkout/start-checkout";
import { createAgent } from "@/lib/agent/create-agent";

export async function makePayment(): Promise<void> {
  const { payment } = useDetectedPaymentStore.getState();
  const { quote } = useQuoteStore.getState();
  const { setIntent } = usePaymentIntentStore.getState();
  const { setScreen, setError } = usePaymentScreenStore.getState();
  const { address, chainId } = getAccount(config);

  if (!payment || !quote || !address || !chainId) {
    throw new Error("Missing payment context");
  }

  const supportedTokens = await queryClient.fetchQuery({
    queryKey: supportedTokenKeys.all,
    queryFn: getSupportedTokens,
  });
  const rail = supportedTokens
    .find((token) => token.id === quote.tokenId)
    ?.rails.find((r) => r.chainId === chainId);

  if (!rail) {
    setError("Pear doesn't support payments on this network yet.");
    setScreen("failed");
    return;
  }

  const tab = await getActiveTab();
  if (!tab.id) throw new Error("No active tab found");

  setScreen("checking");
  const screenshot = await captureScreenshot();
  await assertNoUserActionRequired({ url: tab.url ?? "", screenshot });

  const intent = await createPaymentIntent({
    quoteId: quote.id,
    railId: rail.id,
    fromAddress: address,
    merchantDomain: payment.merchantDomain,
  });
  setIntent(intent);

  setScreen("confirming");
  const txHash = await sendToken({
    contractAddress: intent.contractAddress,
    to: intent.paymentAddress,
    amount: intent.cryptoAmount,
  });

  setScreen("processing");
  try {
    await submitPaymentIntent({ id: intent.id }, { txHash });
  } catch (error) {
    console.warn("[payment] the backend couldn't verify the transfer:", error);
    setError(
      "Your payment was sent but couldn't be verified. Please contact support.",
    );
    setScreen("failed");
    return;
  }

  // apps/ai sets up the agent session (fetches the card, links the intent) and
  // completes the intent itself when the agent finishes.
  const { sessionId } = await startCheckout({ intentId: intent.id });
  const agent = createAgent(tab.id, null);
  const outcome = await agent.run(sessionId);

  if (outcome.status === "done") {
    setScreen("succeeded");
  } else {
    setError(outcome.reason);
    setScreen("failed");
  }
}
