import { setupMetaMaskProvider } from "@/lib/metamask";
import { http, createConfig } from "wagmi";
import { lisk, liskSepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { isExtensionEnvironment } from "@/lib/utils";

if (isExtensionEnvironment()) {
  setupMetaMaskProvider();
}

export const config = createConfig({
  chains: [lisk, liskSepolia],
  connectors: [injected()],
  transports: {
    [lisk.id]: http(),
    [liskSepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
