import { setupMetaMaskProvider } from "@/lib/metamask";
import { http, createConfig } from "wagmi";
import { lisk, base, baseSepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { isExtensionEnvironment } from "@/lib/utils";
import { arc, arcTestnet } from "./arc-chains";

if (isExtensionEnvironment()) {
  setupMetaMaskProvider();
}

export const config = createConfig({
  chains: [lisk, base, baseSepolia, arc, arcTestnet],
  connectors: [injected()],
  transports: {
    [lisk.id]: http(),
    [base.id]: http(),
    [baseSepolia.id]: http(),
    [arc.id]: http(),
    [arcTestnet.id]: http(),
  },
});

export const paymentChains = [arc, base];
