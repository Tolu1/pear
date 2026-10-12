import { simulateContract, writeContract } from "wagmi/actions";
import { config } from "./config";
import { erc20Abi, type Address, type Hash } from "viem";

export interface TokenTransfer {
  contractAddress: Address;
  to: Address;
  amount: bigint;
}

export async function sendToken(transfer: TokenTransfer): Promise<Hash> {
  const { request } = await simulateContract(config, {
    address: transfer.contractAddress,
    abi: erc20Abi,
    functionName: "transfer",
    args: [transfer.to, transfer.amount],
  });

  return writeContract(config, request);
}
