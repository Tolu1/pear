import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { TokensService } from '../tokens.service';

@ValidatorConstraint({ name: 'IsValidRailId', async: false })
@Injectable()
export class IsValidRailIdConstraint implements ValidatorConstraintInterface {
  constructor(private readonly tokensService: TokensService) {}

  validate(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    try {
      this.tokensService.findRail(value);
      return true;
    } catch {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} '${String(args.value)}' is not a supported rail`;
  }
}

export function IsValidRailId(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsValidRailIdConstraint,
    });
  };
}
