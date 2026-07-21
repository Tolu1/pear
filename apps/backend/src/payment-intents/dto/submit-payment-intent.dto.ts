import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class SubmitPaymentIntentDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^0x[0-9a-fA-F]{64}$/, {
    message: 'txHash must be a 0x-prefixed 32-byte hex string',
  })
  txHash: string;
}
