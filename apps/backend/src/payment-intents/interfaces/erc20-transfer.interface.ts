import { type Blockchain } from '../../common/constants/supported-tokens.constant';

export interface Erc20Traensfer {
  from: `0x${string}`;
  to: `0x${string}`;
  value: string;
  contractAddress: `0x${string}`;
  transactionHash: `0x${string}`;
  blockchain: Blockchain;
}
