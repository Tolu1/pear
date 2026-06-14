import { Inject, Injectable, Logger } from '@nestjs/common';
import { AgentServer } from '@repo/agent-core';
import { AGENT_SERVER } from '../agent/agent.constants';
import { PaymentIntentsService } from './payment-intents.service';
import { type VirtualCard } from './interfaces/virtual-card.interface';

const CHECKOUT_GOAL =
  'Complete the checkout on the current web page. Fill the payment card fields (card number, expiry, CVV, name on card) using the card details in your instructions, then submit the order to pay. Only fill payment fields — leave shipping and personal details as they are.';

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  constructor(
    @Inject(AGENT_SERVER) private readonly agent: AgentServer,
    private readonly paymentIntentsService: PaymentIntentsService,
  ) {}

  async start(intentId: string): Promise<string> {
    const card = await this.paymentIntentsService.getVirtualCard(intentId);
    const { sessionId } = await this.agent.start({
      goal: CHECKOUT_GOAL,
      context: this.buildCardContext(card),
      onDone: () =>
        this.paymentIntentsService
          .completePayment(intentId)
          .catch((err) =>
            this.logger.error(`Failed to complete intent ${intentId}`, err),
          ),
    });
    return sessionId;
  }

  private buildCardContext(card: VirtualCard): string {
    return [
      'Payment card to use for this checkout:',
      `Card number: ${card.number}`,
      `Expiry: ${card.expiry}`,
      `CVV: ${card.cvv}`,
      `Name on card: ${card.name}`,
    ].join('\n');
  }
}
