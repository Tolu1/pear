import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createPublicClient,
  createWalletClient,
  erc20Abi,
  http,
  pad,
  parseUnits,
  zeroHash,
  type Chain,
  type Hash,
  type Hex,
} from 'viem';
import { privateKeyToAccount, type PrivateKeyAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { arc } from '../blockchain/arc-chains.constant';
import { type CircleMessagesApiResponse } from './interfaces/circle-messages-api-response.interface';
import { BridgeFailedException } from './exceptions/bridge-failed.exception';
import {
  ARC_DOMAIN,
  ARC_USDC_ADDRESS,
  BASE_DOMAIN,
  IRIS_API_URL,
  MESSAGE_TRANSMITTER_ADDRESS,
  STANDARD_FINALITY_THRESHOLD,
  TOKEN_MESSENGER_ADDRESS,
  messageTransmitterAbi,
  tokenMessengerAbi,
} from './cctp.constant';

const USDC_DECIMALS = 6;
const ATTESTATION_POLL_INTERVAL_MS = 2000;
const ATTESTATION_TIMEOUT_MS = 120_000;

@Injectable()
export class CctpService {
  private readonly account: PrivateKeyAccount;

  constructor(private readonly configService: ConfigService) {
    this.account = privateKeyToAccount(
      configService.getOrThrow<`0x${string}`>('ARC_RAIL_WALLET_PRIVATE_KEY'),
    );
  }

  async bridgeToBase(amount: string): Promise<void> {
    const value = parseUnits(amount, USDC_DECIMALS);
    const arcWallet = this.walletClient(arc);

    await this.confirm(
      arc,
      'approve',
      await arcWallet.writeContract({
        address: ARC_USDC_ADDRESS,
        abi: erc20Abi,
        functionName: 'approve',
        args: [TOKEN_MESSENGER_ADDRESS, value],
      }),
    );

    const burnHash = await arcWallet.writeContract({
      address: TOKEN_MESSENGER_ADDRESS,
      abi: tokenMessengerAbi,
      functionName: 'depositForBurn',
      args: [
        value,
        BASE_DOMAIN,
        pad(this.account.address, { size: 32 }),
        ARC_USDC_ADDRESS,
        zeroHash,
        0n,
        STANDARD_FINALITY_THRESHOLD,
      ],
    });
    await this.confirm(arc, 'burn', burnHash);

    const { message, attestation } = await this.waitForAttestation(burnHash);

    await this.confirm(
      base,
      'mint',
      await this.walletClient(base).writeContract({
        address: MESSAGE_TRANSMITTER_ADDRESS,
        abi: messageTransmitterAbi,
        functionName: 'receiveMessage',
        args: [message, attestation],
      }),
    );
  }

  private async waitForAttestation(
    burnHash: Hash,
  ): Promise<{ message: Hex; attestation: Hex }> {
    const url = `${IRIS_API_URL}/v2/messages/${ARC_DOMAIN}?transactionHash=${burnHash}`;
    const deadline = Date.now() + ATTESTATION_TIMEOUT_MS;

    while (Date.now() < deadline) {
      const response = await fetch(url);
      if (response.ok) {
        const { messages } =
          (await response.json()) as CircleMessagesApiResponse;
        const [burn] = messages;
        if (burn?.status === 'complete') {
          return {
            message: burn.message as Hex,
            attestation: burn.attestation as Hex,
          };
        }
      }
      await new Promise((resolve) =>
        setTimeout(resolve, ATTESTATION_POLL_INTERVAL_MS),
      );
    }

    throw new BridgeFailedException('attestation');
  }

  private async confirm(chain: Chain, step: string, hash: Hash) {
    const receipt = await this.publicClient(chain).waitForTransactionReceipt({
      hash,
    });
    if (receipt.status !== 'success') throw new BridgeFailedException(step);
  }

  private walletClient(chain: Chain) {
    return createWalletClient({
      account: this.account,
      chain,
      transport: http(this.rpcUrl(chain)),
    });
  }

  private publicClient(chain: Chain) {
    return createPublicClient({ chain, transport: http(this.rpcUrl(chain)) });
  }

  private rpcUrl(chain: Chain): string | undefined {
    return this.configService.get<string>(`RPC_URL_${chain.id}`);
  }
}
