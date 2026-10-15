import { config } from "./config";

export function getTransactionUrl(chainId: number, hash: string) {
  const explorer = config.chains.find((c) => c.id === chainId)?.blockExplorers
    ?.default;
  return explorer ? `${explorer.url}/tx/${hash}` : null;
}
