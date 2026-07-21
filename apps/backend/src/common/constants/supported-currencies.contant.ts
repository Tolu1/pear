export const SUPPORTED_CURRENCIES = {
  NGN: {
    code: 'NGN',
    name: 'Nigerian Naira',
    symbol: '₦',
    decimals: 2,
  },
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    decimals: 2,
  },
} as const;

export type CurrencyCode = keyof typeof SUPPORTED_CURRENCIES;

export const SUPPORTED_CURRENCIES_CODES = Object.keys(
  SUPPORTED_CURRENCIES,
) as CurrencyCode[];
