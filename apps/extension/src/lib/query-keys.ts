export const betaAccessKeys = {
  all: ["beta-access"] as const,
};

export const supportedTokenKeys = {
  all: ["supported-tokens"] as const,
};

export const walletBalanceKeys = {
  of: (address: string | undefined, chainId: number | undefined) =>
    ["wallet-balance", address, chainId] as const,
};
