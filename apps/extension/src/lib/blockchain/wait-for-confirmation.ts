import { waitForTransactionReceipt } from "wagmi/actions";
import { config } from "./config";
import type { Hash } from "viem";

export async function waitForConfirmation(hash: Hash) {
  return waitForTransactionReceipt(config, { hash });
}
