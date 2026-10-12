export const TEST_ENV = {
  COINGECKO_API_KEY: 'test-coingecko-key',
  CARD_NUMBER: '4242424242424242',
  CARD_EXPIRY: '12/30',
  CARD_CVV: '123',
  CARD_NAME: 'Test Card',
  SERVICE_API_KEY: 'test-service-api-key',
  ARC_RAIL_WALLET_PRIVATE_KEY:
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
} as const;

export function applyTestEnv(overrides: Partial<typeof TEST_ENV> = {}): void {
  for (const [key, value] of Object.entries({ ...TEST_ENV, ...overrides })) {
    process.env[key] = value;
  }
}
