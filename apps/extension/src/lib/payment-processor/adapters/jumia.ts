import type {
  PaymentAdapter,
  DetectionContext,
  PaymentPayload,
  PaymentResult,
} from "../types";
import { DOMExecutor, type Instruction } from "@/lib/web-automation/executor";

export const jumia: PaymentAdapter = {
  async detect(context: DetectionContext): Promise<boolean> {
    const { url, document } = context;

    const urlMatches = url.match("/pay.jumia.com.ng/checkout/payment/add/");
    const payNowButton = document.querySelector("#pay-now-btn");
    const paymentMethodCards = document.querySelectorAll(
      ".payment-method-card"
    );
    const hasPaymentMethods =
      paymentMethodCards && paymentMethodCards.length > 0;
    const paymentAmountElement = document.querySelector(".payment-amount");
    const jumiaPayLogo = document.querySelector('img[alt="JumiaPay"]');

    let matchCount = 0;
    if (urlMatches) matchCount++;
    if (payNowButton) matchCount++;
    if (hasPaymentMethods) matchCount++;
    if (paymentAmountElement) matchCount++;
    if (jumiaPayLogo) matchCount++;

    return matchCount >= 4;
  },

  async extract(context: DetectionContext): Promise<PaymentPayload> {
    const { url, document } = context;
    const paymentUrl = url;
    const amountString = document.querySelector(".payment-amount")?.textContent;
    if (!amountString) {
      throw new Error("Jumia Adapter: Amount not found");
    }
    const amount = parseFloat(amountString.replace(/[₦,]/g, ""));
    const currency = "NGN";
    const domain = "pay.jumia.com.ng";
    const cookies = document.cookie.split(";").map((cookie) => cookie.trim());

    return {
      paymentUrl,
      amount,
      currency,
      domain,
      cookies,
    };
  },

  async pay(data: PaymentPayload): Promise<PaymentResult> {
    console.log("Starting Jumia payment automation for:", data);

    try {
      const executor = new DOMExecutor();

      const instructions = await getMockJumiaInstructions();

      for (const instruction of instructions) {
        console.log("Executing instruction:", instruction);
        const result = await executor.execute(instruction);

        if (!result.success) {
          throw new Error(`Automation failed: ${result.error}`);
        }

        // Small delay between instructions
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      return {
        success: true,
        redirectUrl: null,
        error: null,
      };
    } catch (error) {
      console.error("Jumia payment automation failed:", error);
      return {
        success: false,
        redirectUrl: null,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};

async function getMockJumiaInstructions(): Promise<Instruction[]> {
  return [
    // 1. Fill card number
    {
      type: "fill",
      selector: "#cc-number",
      value: "4111111111111111",
    },
    // 2. Select expiry month
    {
      type: "fill",
      selector: 'select[name="cc-exp-month"]',
      value: "12",
    },
    // 3. Select expiry year
    {
      type: "fill",
      selector: 'select[name="cc-exp-year"]',
      value: "2025",
    },
    // 4. Fill CVV
    {
      type: "fill",
      selector: "#cc-csc",
      value: "123",
    },
    // 5. Click pay button
    // {
    //   type: "click",
    //   selector: "#pay-now-btn",
    // },
  ];
}

// Function to get real backend instructions (for later implementation)
// async function getBackendInstructions(
//   data: PaymentPayload
// ): Promise<Instruction[]> {
//   try {
//     const response = await fetch("/api/payment/instructions", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         domain: data.domain,
//         amount: data.amount,
//         currency: data.currency,
//         paymentUrl: data.paymentUrl,
//       }),
//     });

//     if (!response.ok) {
//       throw new Error(`Backend API error: ${response.status}`);
//     }

//     const instructions = await response.json();
//     return instructions;
//   } catch (error) {
//     console.error("Failed to get backend instructions:", error);
//     // Fallback to mock instructions
//     return getMockJumiaInstructions();
//   }
// };
