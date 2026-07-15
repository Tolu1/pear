import { IsNotEmpty, IsString } from 'class-validator';

export class BetaAccessCodeDto {
  @IsNotEmpty()
  @IsString()
  code: string;
}
