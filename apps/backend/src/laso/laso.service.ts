import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { formatUnits, parseUnits } from 'viem';
import { privateKeyToAccount, type PrivateKeyAccount } from 'viem/accounts';
import { Challenge } from 'mppx';
import { Mppx, evm } from 'mppx/client';
import { assets } from 'mppx/evm';
import { wrapFetchWithSIWx } from '@x402/extensions/sign-in-with-x';
import { type IssuanceCost } from './interfaces/issuance-cost.interface';
import { type LasoCard } from './interfaces/laso-card.interface';
import { LasoRequestFailedException } from './exceptions/laso-request-failed.exception';
import { LasoCardNotReadyException } from './exceptions/laso-card-not-ready.exception';

const CARD_POLL_INTERVAL_MS = 2500;
const CARD_POLL_TIMEOUT_MS = 60_000;
const TOKEN_REFRESH_MARGIN_MS = 60_000;

@Injectable()
export class LasoService {
  private readonly baseUrl: string;
  private readonly account: PrivateKeyAccount;
  private idToken: { value: string; expiresAt: number } | null = null;

  constructor(configService: ConfigService) {
    this.baseUrl =
      configService.get<string>('LASO_API_URL') ?? 'https://laso.finance';
    this.account = privateKeyToAccount(
      configService.getOrThrow<`0x${string}`>('ARC_RAIL_WALLET_PRIVATE_KEY'),
    );
  }

  async getIssuanceCost(amount: string): Promise<IssuanceCost> {
    const response = await fetch(this.cardUrl(amount));
    if (response.status !== 402) {
      throw new LasoRequestFailedException('get-card', response.status);
    }

    const { request } = Challenge.fromResponse(response);
    const { amount: totalAtomic, methodDetails } = request as {
      amount: string;
      methodDetails: { decimals: number };
    };
    const { decimals } = methodDetails;
    const fee = BigInt(totalAtomic) - parseUnits(amount, decimals);

    return {
      amount,
      fee: formatUnits(fee, decimals),
      total: formatUnits(BigInt(totalAtomic), decimals),
    };
  }

  async orderCard(cost: IssuanceCost): Promise<string> {
    // The cap refuses any charge above the cost that was quoted.
    const mppx = Mppx.create({
      methods: [
        evm({
          account: this.account,
          currencies: [assets.base.USDC],
          maxAmount: cost.total,
        }),
      ],
      polyfill: false,
    });

    const response = await mppx.fetch(this.cardUrl(cost.amount));
    if (!response.ok) {
      throw new LasoRequestFailedException('get-card', response.status);
    }

    const body = (await response.json()) as { card: { card_id: string } };
    return body.card.card_id;
  }

  async getCard(cardId: string): Promise<LasoCard> {
    const deadline = Date.now() + CARD_POLL_TIMEOUT_MS;

    while (Date.now() < deadline) {
      const response = await fetch(
        `${this.baseUrl}/get-card-data?card_id=${encodeURIComponent(cardId)}`,
        { headers: { Authorization: `Bearer ${await this.getIdToken()}` } },
      );
      if (!response.ok) {
        throw new LasoRequestFailedException('get-card-data', response.status);
      }

      const data = (await response.json()) as LasoCardData;
      if (data.status === 'ready' && data.card_details) {
        return toLasoCard(data, data.card_details);
      }

      await new Promise((resolve) =>
        setTimeout(resolve, CARD_POLL_INTERVAL_MS),
      );
    }

    throw new LasoCardNotReadyException(cardId);
  }

  private cardUrl(amount: string): string {
    return `${this.baseUrl}/get-card?amount=${encodeURIComponent(amount)}`;
  }

  // Signs in with the wallet and reuses the token until it is about to expire.
  private async getIdToken(): Promise<string> {
    if (
      this.idToken &&
      this.idToken.expiresAt - TOKEN_REFRESH_MARGIN_MS > Date.now()
    ) {
      return this.idToken.value;
    }

    const fetchWithSIWx = wrapFetchWithSIWx(fetch, this.account);
    const response = await fetchWithSIWx(`${this.baseUrl}/auth`);
    if (!response.ok) {
      throw new LasoRequestFailedException('auth', response.status);
    }

    const { auth } = (await response.json()) as {
      auth: { id_token: string; expires_in: string };
    };
    this.idToken = {
      value: auth.id_token,
      expiresAt: Date.now() + Number(auth.expires_in) * 1000,
    };
    return this.idToken.value;
  }
}

interface LasoCardData {
  card_id: string;
  status: string;
  usd_amount: number;
  card_details?: LasoCardDetails;
}

interface LasoCardDetails {
  card_number: string;
  exp_month: string;
  exp_year: string;
  cvv: string;
  billing_address: {
    name: string;
    line_1: string;
    line_2: string | null;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

function toLasoCard(data: LasoCardData, details: LasoCardDetails): LasoCard {
  const address = details.billing_address;
  return {
    cardId: data.card_id,
    usdAmount: data.usd_amount,
    cardNumber: details.card_number,
    expMonth: details.exp_month,
    expYear: details.exp_year,
    cvv: details.cvv,
    billingAddress: {
      name: address.name,
      line1: address.line_1,
      line2: address.line_2,
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country,
    },
  };
}
