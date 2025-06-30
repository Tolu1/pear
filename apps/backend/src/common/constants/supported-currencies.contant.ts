export const SUPPORTED_CURRENCIES = {
  ngn: {
    code: 'ngn',
    name: 'Nigerian Naira',
    symbol: '₦',
    decimals: 2,
    displayName: 'NGN',
  },
  usd: {
    code: 'usd',
    name: 'US Dollar',
    symbol: '$',
    decimals: 2,
    displayName: 'USD',
  },
} as const;

export type CurrencyCode = keyof typeof SUPPORTED_CURRENCIES;

export const SUPPORTED_CURRENCIES_CODES = Object.keys(
  SUPPORTED_CURRENCIES,
) as CurrencyCode[];
