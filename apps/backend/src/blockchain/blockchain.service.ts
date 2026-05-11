import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createPublicClient,
  erc20Abi,
  http,
  parseEventLogs,
  type Chain,
  type Hash,
  type PublicClient,
  type TransactionReceipt,
} from 'viem';
import { type Erc20Transfer } from './interfaces/erc20-transfer.interface';
import { TransferFailedException } from './exceptions/transfer-failed.exception';
import { TransferMismatchException } from './exceptions/transfer-mismatch.exception';
import { UnsupportedChainException } from './exceptions/unsupported-chain.exception';
import { supportedChains } from './supported-chains.constant';

@Injectable()
export class BlockchainService {
  private readonly clients = new Map<number, PublicClient>();
  private readonly chainsById: ReadonlyMap<number, Chain> = new Map(
    supportedChains.map((chain) => [chain.id, chain]),
  );

  constructor(private readonly configService: ConfigService) {}

  async assertTransfer(
    txHash: Hash,
    expected: Erc20Transfer,
    confirmations: number,
  ): Promise<TransactionReceipt> {
    const client = this.getClient(expected.chainId);

    const receipt = await client.waitForTransactionReceipt({
      hash: txHash,
      confirmations,
    });

    if (receipt.status !== 'success') {
      throw new TransferFailedException();
    }

    const transferLogs = parseEventLogs({
      abi: erc20Abi,
      eventName: 'Transfer',
      logs: receipt.logs,
    });

    const matched = transferLogs.find(
      (log) =>
        log.address.toLowerCase() === expected.tokenAddress.toLowerCase() &&
        log.args.from.toLowerCase() === expected.from.toLowerCase() &&
        log.args.to.toLowerCase() === expected.to.toLowerCase() &&
        log.args.value === expected.value,
    );

    if (!matched) {
      throw new TransferMismatchException();
    }

    return receipt;
  }

  private getClient(chainId: number): PublicClient {
    const cached = this.clients.get(chainId);
    if (cached) return cached;

    const chain = this.chainsById.get(chainId);
    if (!chain) throw new UnsupportedChainException(chainId);

    const rpcUrl = this.configService.get<string>(`RPC_URL_${chainId}`);
    const client = createPublicClient({ chain, transport: http(rpcUrl) });
    this.clients.set(chainId, client);
    return client;
  }
}
