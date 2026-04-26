import {
  simulateContract,
  writeContract,
  waitForTransactionReceipt,
  signMessage,
} from "wagmi/actions";
import { config } from "./config";
import { erc20Abi, type Address, type Hash } from "viem";

export interface TokenTransfer {
  contractAddress: Address;
  to: Address;
  amount: bigint;
}

export async function transferToken(
  transfer: TokenTransfer,
  onSubmitted?: (hash: Hash) => Promise<unknown>,
) {
  // TODO: remove stub once backend returns real contract/payment addresses
  await signMessage(config, {
    message:
      "This is a test payment signature. You can choose to reject this without any consequences",
  });
  await onSubmitted?.("0xstub" as Hash);
  return {} as Awaited<ReturnType<typeof waitForTransactionReceipt>>;

  const { request } = await simulateContract(config, {
    address: transfer.contractAddress,
    abi: erc20Abi,
    functionName: "transfer",
    args: [transfer.to, transfer.amount],
  });

  const hash = await writeContract(config, request);
  await onSubmitted?.(hash);

  const receipt = await waitForTransactionReceipt(config, { hash });
  return receipt;
}
