import { config } from "@/lib/blockchain/config";
import { WagmiProvider as Provider } from "wagmi";

export function WagmiProvider({ children }: { children: React.ReactNode }) {
  return <Provider config={config}>{children}</Provider>;
}
