import { connectMetaMask } from "@/lib/blockchain/connect-metamask";

export async function connectWallet(): Promise<void> {
  const connected = await connectMetaMask();
  if (!connected) console.warn("MetaMask connector not found");
}
