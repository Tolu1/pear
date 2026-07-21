import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { TokensService } from '../tokens.service';

@ValidatorConstraint({ name: 'IsValidTokenId', async: false })
@Injectable()
export class IsValidTokenIdConstraint implements ValidatorConstraintInterface {
  constructor(private readonly tokensService: TokensService) {}

  validate(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    try {
      this.tokensService.findOne(value);
      return true;
    } catch {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} '${String(args.value)}' is not a supported token`;
  }
}

export function IsValidTokenId(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsValidTokenIdConstraint,
    });
  };
}
