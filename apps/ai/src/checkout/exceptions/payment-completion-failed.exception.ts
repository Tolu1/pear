export class PaymentCompletionFailedException extends Error {
  constructor(intentId: string, status: number) {
    super(`Failed to complete intent ${intentId} (${status})`);
    this.name = 'PaymentCompletionFailedException';
  }
}
