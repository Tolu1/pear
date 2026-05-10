import { type Address } from 'viem';

export interface Erc20Transfer {
  from: Address;
  to: Address;
  value: bigint;
  tokenAddress: Address;
}
