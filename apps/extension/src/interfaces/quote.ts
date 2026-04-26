export interface Quote {
  id: string;
  amount: string;
  currency: string;
  cryptoAmount: string;
  tokenId: string;
  blockchain: string;
  expiresAt: Date;
  createdAt: Date;
}
