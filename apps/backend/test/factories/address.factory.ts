import { faker } from '@faker-js/faker';
import type { Address, Hex } from 'viem';

export function makeAddress(): Address {
  return `0x${faker.string.hexadecimal({ length: 40, casing: 'lower', prefix: '' })}`;
}

export function makeTxHash(): Hex {
  return `0x${faker.string.hexadecimal({ length: 64, casing: 'lower', prefix: '' })}`;
}
