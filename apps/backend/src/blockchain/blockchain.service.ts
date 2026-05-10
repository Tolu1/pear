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

@Injectable()
export class BlockchainService {
  private readonly clients = new Map<number, PublicClient>();

  constructor(private readonly configService: ConfigService) {}

  async assertTransfer(
    txHash: Hash,
    expected: Erc20Transfer,
    chain: Chain,
    confirmations: number,
  ): Promise<TransactionReceipt> {
    const client = this.getClient(chain);

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

  private getClient(chain: Chain): PublicClient {
    const cached = this.clients.get(chain.id);
    if (cached) return cached;

    const rpcUrl = this.configService.get<string>(`RPC_URL_${chain.id}`);
    const client = createPublicClient({ chain, transport: http(rpcUrl) });
    this.clients.set(chain.id, client);
    return client;
  }
}
