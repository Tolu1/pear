import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createPublicClient,
  http,
  Transport,
  type PublicClient,
  type Transaction,
  decodeFunctionData,
  parseAbiItem,
} from 'viem';
import { lisk, liskSepolia } from 'viem/chains';
import { publicActionsL2 } from 'viem/op-stack';
import { Payment } from 'src/payments/interfaces/payment.interface';
import { SUPPORTED_TOKENS } from '../common/constants/supported-tokens.constant';

interface TransactionData {
  hash: string;
  from: string;
  to: string;
  amount: string;
  tokenType: 'native' | 'erc20';
  tokenContract?: string;
}

type Chain = typeof lisk | typeof liskSepolia;

const TRANSFER_ABI = parseAbiItem(
  'function transfer(address to, uint256 amount)',
);

@Injectable()
export class BlockchainService {
  private publicClient: PublicClient<Transport, Chain>;

  constructor(private configService: ConfigService) {
    const moralisNodeApiKey = this.configService.get<string>(
      'MORALIS_NODE_API_KEY',
    );

    this.publicClient = createPublicClient({
      chain: lisk,
      transport: http(
        `https://site1.moralis-nodes.com/${lisk.network}/${moralisNodeApiKey}`,
      ),
    }).extend(publicActionsL2());
  }

  async watchForPayment({
    payment,
  }: {
    payment: Payment;
  }): Promise<TransactionData> {
    return new Promise((resolve, reject) => {
      let unwatch: (() => void) | undefined;
      const TIMEOUT = 15 * 60 * 1000; // 15 minutes;
      const timeout = setTimeout(() => {
        unwatch?.();
        reject(
          new Error(
            `Payment timeout: No payment received for ${payment.id} after 15 minutes`,
          ),
        );
      }, TIMEOUT);

      const paymentAddress =
        SUPPORTED_TOKENS[payment.blockchain][payment.tokenId].paymentAddress;
      unwatch = this.publicClient.watchBlocks({
        onBlock: async (block) => {
          // console.log(
          //   `Watching block: ${block.number} for payment ${payment.id}`,
          // );

          for (const txHash of block.transactions) {
            try {
              const tx = await this.publicClient.getTransaction({
                hash: txHash,
              });

              const isNativePayment = this.checkNativePayment(
                tx,
                paymentAddress,
              );
              if (isNativePayment) {
                const transactionData: TransactionData = {
                  hash: tx.hash,
                  from: tx.from,
                  to: tx.to!,
                  amount: tx.value ? tx.value.toString() : '0',
                  tokenType: 'native',
                };
                clearTimeout(timeout);
                unwatch?.();
                resolve(transactionData);
                return;
              }

              const ERC20Payment = this.checkAndDecodeERC20Payment(
                tx,
                paymentAddress,
              );
              if (ERC20Payment) {
                const { recipient, amount } = ERC20Payment;
                const transactionData: TransactionData = {
                  hash: tx.hash,
                  from: tx.from,
                  to: recipient,
                  amount: amount,
                  tokenType: 'erc20',
                  tokenContract: tx.to || '',
                };
                clearTimeout(timeout);
                unwatch?.();
                resolve(transactionData);
                return;
              }
            } catch (error) {
              // console.log(
              //   `Error processing transaction ${txHash}:`,
              //   error.message,
              // );
            }
          }
        },
        onError: (error) => {
          clearTimeout(timeout);
          unwatch?.();
          reject(error);
        },
      });
    });
  }

  private checkNativePayment(
    tx: Pick<Transaction, 'to' | 'value'>,
    paymentAddress: `0x${string}`,
  ): boolean {
    return tx.to === paymentAddress && tx.value > 0n;
  }

  private checkAndDecodeERC20Payment(
    tx: Pick<Transaction, 'input' | 'to'>,
    paymentAddress: `0x${string}`,
  ): { recipient: `0x${string}`; amount: string } | null {
    if (!tx.input.startsWith('0xa9059cbb')) return null;

    try {
      const decoded = decodeFunctionData({
        abi: [TRANSFER_ABI],
        data: tx.input,
      });

      const recipient = decoded.args[0];
      const amount = decoded.args[1].toString();

      return recipient.toLowerCase() === paymentAddress.toLowerCase()
        ? { recipient, amount }
        : null;
    } catch {
      return null;
    }
  }
}
