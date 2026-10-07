import { defineChain } from "viem";

// Arc uses USDC as its gas token. The native balance has 18 decimals, while
// the USDC ERC-20 contract at 0x3600…0000 uses the usual 6.
const nativeCurrency = { name: "USDC", symbol: "USDC", decimals: 18 };

export const arc = defineChain({
  id: 5042,
  name: "Arc",
  nativeCurrency,
  rpcUrls: { default: { http: ["https://rpc.mainnet.arc.io"] } },
  blockExplorers: {
    default: { name: "Arc Explorer", url: "https://explorer.arc.io" },
  },
});

export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency,
  rpcUrls: { default: { http: ["https://rpc.testnet.arc.io"] } },
  blockExplorers: {
    default: {
      name: "Arc Testnet Explorer",
      url: "https://explorer.testnet.arc.io",
    },
  },
  testnet: true,
});
