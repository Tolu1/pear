import { base, baseSepolia, lisk } from 'viem/chains';
import { arc, arcTestnet } from './arc-chains.constant';

export const supportedChains = [
  base,
  baseSepolia,
  lisk,
  arc,
  arcTestnet,
] as const;
