import { sleep } from "@/lib/utils";
import { getStatus } from "./get-status";
import type { PaymentIntentStatus } from "@/interfaces/payment-intent";

const DEFAULT_INTERVAL_MS = 5000;
const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;

interface PollOptions {
  intervalMs?: number;
  timeoutMs?: number;
}

export async function pollStatus(
  id: string,
  target: PaymentIntentStatus,
  { intervalMs = DEFAULT_INTERVAL_MS, timeoutMs = DEFAULT_TIMEOUT_MS }: PollOptions = {},
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const { status } = await getStatus({ id });
    if (status === target) return;
    await sleep(intervalMs);
  }
  throw new Error("Payment status check timed out");
}
