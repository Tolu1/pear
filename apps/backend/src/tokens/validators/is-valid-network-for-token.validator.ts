import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { TokensService } from '../tokens.service';

@ValidatorConstraint({ name: 'IsValidNetworkForToken', async: false })
@Injectable()
export class IsValidNetworkForTokenConstraint implements ValidatorConstraintInterface {
  constructor(private readonly tokensService: TokensService) {}

  validate(value: unknown, args: ValidationArguments): boolean {
    if (typeof value !== 'string') return false;
    const [tokenIdProperty] = args.constraints as [string];
    const tokenId = (args.object as Record<string, unknown>)[tokenIdProperty];
    if (typeof tokenId !== 'string') return false;
    try {
      const token = this.tokensService.findOne(tokenId);
      return token.rails.some((rail) => rail.network === value);
    } catch {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    const [tokenIdProperty] = args.constraints as [string];
    const tokenId = (args.object as Record<string, unknown>)[tokenIdProperty];
    return `${args.property} '${String(args.value)}' is not supported for token '${String(tokenId)}'`;
  }
}

export function IsValidNetworkForToken(
  tokenIdProperty: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [tokenIdProperty],
      validator: IsValidNetworkForTokenConstraint,
    });
  };
}
