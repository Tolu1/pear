import { switchChain } from "wagmi/actions";
import { config } from "./config";

type ChainId = (typeof config.chains)[number]["id"];

export async function switchNetwork(chainId: ChainId): Promise<void> {
  await switchChain(config, { chainId });
}
