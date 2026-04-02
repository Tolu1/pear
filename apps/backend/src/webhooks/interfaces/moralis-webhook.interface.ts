export interface MoralisWebhook {
  confirmed: boolean;
  chainId: string;
  erc20Transfers: MoralisErc20Transfer[];
}

interface MoralisErc20Transfer {
  from: string;
  to: string;
  value: string;
  contract: string;
  transactionHash: string;
}
