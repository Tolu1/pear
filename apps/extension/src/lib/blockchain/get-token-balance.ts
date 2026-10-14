import { readContract } from "wagmi/actions";
import { erc20Abi, formatUnits, type Address } from "viem";
import { config } from "./config";

export async function getTokenBalance(
  token: Address,
  owner: Address,
  decimals: number,
): Promise<string> {
  const balance = await readContract(config, {
    address: token,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [owner],
  });
  return formatUnits(balance, decimals);
}
